import crypto from "crypto";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, user } from "@/lib/db/schema/better-auth-schema";
import {
  event,
  eventAttendance,
  zoomParticipantSession,
} from "@/lib/db/schema/event-schema";
import { organizationSettings } from "@/lib/db/schema/org-settings-schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ZoomWebhookParticipant {
  user_id: string;
  user_name: string;
  id: string;
  participant_uuid: string;
  date_time: string;
  email?: string;
  participant_user_id?: string;
  customer_key?: string;
  registrant_id?: string;
  join_time?: string;
  leave_time?: string;
  /** Human-readable reason provided by Zoom (e.g. "Host ended the meeting.") */
  leave_reason?: string;
  phone_number?: string;
}

export interface ZoomWebhookMeetingObject {
  id: string;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  timezone: string;
  duration: number;
  /** Present on meeting.ended events */
  end_time?: string;
  participant?: ZoomWebhookParticipant;
}

export interface ZoomWebhookPayload {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: ZoomWebhookMeetingObject;
  };
}

export interface UrlValidationResponse {
  plainToken: string;
  encryptedToken: string;
}

type EventRow = { id: string; organizationId: string };

// ─── Security ─────────────────────────────────────────────────────────────────

/**
 * Respond to Zoom's endpoint.url_validation challenge.
 * Zoom sends this once when a webhook endpoint is first registered.
 */
export function handleUrlValidation(
  plainToken: string,
  secret: string,
): UrlValidationResponse {
  const encryptedToken = crypto
    .createHmac("sha256", secret)
    .update(plainToken)
    .digest("hex");
  return { plainToken, encryptedToken };
}

/**
 * Verify the HMAC-SHA256 signature Zoom attaches to every webhook delivery.
 * Returns true when the request is authentic.
 */
export function verifyHmacSignature(opts: {
  rawBody: string;
  timestamp: string;
  signature: string;
  secret: string;
}): boolean {
  const { rawBody, timestamp, signature, secret } = opts;
  const message = `v0:${timestamp}:${rawBody}`;
  const hash = crypto.createHmac("sha256", secret).update(message).digest("hex");
  const expected = `v0=${hash}`;
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

// ─── DB Helpers ───────────────────────────────────────────────────────────────

async function findEventByMeetingId(meetingId: string): Promise<EventRow | undefined> {
  return db
    .select({ id: event.id, organizationId: event.organizationId })
    .from(event)
    .where(eq(event.zoomMeetingId, meetingId))
    .limit(1)
    .then((r) => r[0]);
}

async function findAttendanceSettings(organizationId: string) {
  return db
    .select({
      minAttendanceDurationMinutes: organizationSettings.minAttendanceDurationMinutes,
      zoomAutoMarkPresent: organizationSettings.zoomAutoMarkPresent,
    })
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, organizationId))
    .limit(1)
    .then((r) => r[0]);
}

/** Resolve member ID for an email within an org. Returns null if not a registered member. */
async function resolveMemberId(email: string, organizationId: string): Promise<string | null> {
  const userRow = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email.toLowerCase()))
    .limit(1)
    .then((r) => r[0]);

  if (!userRow) return null;

  const memberRow = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userRow.id)))
    .limit(1)
    .then((r) => r[0]);

  return memberRow?.id ?? null;
}

/** Duration in whole minutes between two timestamps. */
function calcDurationMinutes(joinedAt: Date, leftAt: Date): number {
  return Math.max(0, Math.floor((leftAt.getTime() - joinedAt.getTime()) / 60_000));
}

/** Sum all attended minutes for a participant across every session leg for this event. */
async function sumParticipantDuration(eventId: string, participantEmail: string): Promise<number> {
  const sessions = await db
    .select({
      joinedAt: zoomParticipantSession.joinedAt,
      leftAt: zoomParticipantSession.leftAt,
      duration: zoomParticipantSession.duration,
    })
    .from(zoomParticipantSession)
    .where(
      and(
        eq(zoomParticipantSession.eventId, eventId),
        eq(zoomParticipantSession.participantEmail, participantEmail),
      ),
    );

  return sessions.reduce((total, s) => {
    // Prefer the stored computed duration; fall back to calculating from timestamps
    if (s.duration != null) return total + s.duration;
    if (s.leftAt) return total + calcDurationMinutes(s.joinedAt, s.leftAt);
    return total;
  }, 0);
}

/**
 * Attempt to auto-mark a participant as present when:
 *  - zoomAutoMarkPresent is enabled for the org
 *  - their email maps to an org member
 *  - their total attended time meets or exceeds the minimum threshold
 */
async function tryAutoMarkAttendance(opts: {
  eventId: string;
  organizationId: string;
  participantEmail: string;
}): Promise<void> {

  const { eventId, organizationId, participantEmail } = opts;

  const settings = await findAttendanceSettings(organizationId);
  if (!settings?.zoomAutoMarkPresent) return;

  const memberId = await resolveMemberId(participantEmail, organizationId);
  if (!memberId) return;

  const totalDuration = await sumParticipantDuration(eventId, participantEmail);
  if (totalDuration < (settings.minAttendanceDurationMinutes ?? 0)) return;

  const [memberUserRow, firstSession] = await Promise.all([
    db
      .select({ userId: member.userId })
      .from(member)
      .where(eq(member.id, memberId))
      .limit(1)
      .then((r) => r[0]),

    db
      .select({ joinedAt: zoomParticipantSession.joinedAt })
      .from(zoomParticipantSession)
      .where(
        and(
          eq(zoomParticipantSession.eventId, eventId),
          eq(zoomParticipantSession.participantEmail, participantEmail),
        ),
      )
      .orderBy(zoomParticipantSession.joinedAt)
      .limit(1)
      .then((r) => r[0]),
  ]);

  await db
    .insert(eventAttendance)
    .values({
      id: crypto.randomUUID(),
      eventId,
      memberId,
      status: "present",
      markedAt: new Date(),
      markedBy: memberUserRow?.userId ?? memberId,
      zoomDuration: totalDuration,
      zoomFirstJoinedAt: firstSession?.joinedAt ?? null,
      onlineZoom: true,
    })
    .onConflictDoUpdate({
      target: [eventAttendance.eventId, eventAttendance.memberId],
      set: {
        status: "present",
        zoomDuration: totalDuration,
        zoomFirstJoinedAt: firstSession?.joinedAt ?? null,
        onlineZoom: true,
      },
    });
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

/** Open a new session row when a participant enters the meeting. */
export async function handleParticipantJoined(
  participant: ZoomWebhookParticipant,
  eventRow: EventRow,
  meetingId: string,
): Promise<void> {
  const joinedAt = new Date(participant.join_time ?? participant.date_time);
  const participantEmail = participant.email?.toLowerCase() ?? "";
  const participantUuid = participant.participant_uuid ?? "";

  await db.insert(zoomParticipantSession).values({
    id: crypto.randomUUID(),
    eventId: eventRow.id,
    zoomMeetingId: meetingId,
    participantUuid,
    participantEmail,
    joinedAt,
  });
}

/**
 * Close the participant's open session and attempt auto-attendance when they leave.
 * Duration is calculated from the actual join/leave timestamps, not Zoom's reported value.
 *
 * Note: `participant.leave_reason` is available on the payload and can be persisted
 * by adding a `leave_reason` column to `zoom_participant_session`.
 */
export async function handleParticipantLeft(
  participant: ZoomWebhookParticipant,
  eventRow: EventRow,
): Promise<void> {
  const leftAt = new Date(participant.leave_time ?? participant.date_time);
  const participantEmail = participant.email?.toLowerCase() ?? "";
  const participantUuid = participant.participant_uuid ?? "";

  const openSession = await db
    .select({
      id: zoomParticipantSession.id,
      joinedAt: zoomParticipantSession.joinedAt,
      participantEmail: zoomParticipantSession.participantEmail,
    })
    .from(zoomParticipantSession)
    .where(
      and(
        eq(zoomParticipantSession.eventId, eventRow.id),
        eq(zoomParticipantSession.participantUuid, participantUuid),
        isNull(zoomParticipantSession.leftAt),
      ),
    )
    .orderBy(zoomParticipantSession.joinedAt)
    .limit(1)
    .then((r) => r[0]);

  if (openSession) {
    const duration = calcDurationMinutes(openSession.joinedAt, leftAt);
    await db
      .update(zoomParticipantSession)
      .set({ leftAt, duration })
      .where(eq(zoomParticipantSession.id, openSession.id));
  }

  // Zoom omits email on participant_left — use the email stored at join time via participantUuid
  const resolvedEmail = openSession?.participantEmail || participantEmail;
  if (!resolvedEmail) return;

  await tryAutoMarkAttendance({
    eventId: eventRow.id,
    organizationId: eventRow.organizationId,
    participantEmail: resolvedEmail,
  });
}

/**
 * When a meeting ends, close all open sessions for participants who never received
 * an individual leave event. Uses the meeting's end_time (or event_ts as fallback).
 * Auto-attendance is then attempted for each affected participant.
 */
export async function handleMeetingEnded(
  obj: ZoomWebhookMeetingObject,
  eventRow: EventRow,
  eventTs: number,
): Promise<void> {
  const meetingEndedAt = obj.end_time ? new Date(obj.end_time) : new Date(eventTs);

  const openSessions = await db
    .select({
      id: zoomParticipantSession.id,
      joinedAt: zoomParticipantSession.joinedAt,
      participantEmail: zoomParticipantSession.participantEmail,
      participantUuid: zoomParticipantSession.participantUuid,
    })
    .from(zoomParticipantSession)
    .where(
      and(
        eq(zoomParticipantSession.eventId, eventRow.id),
        isNull(zoomParticipantSession.leftAt),
      ),
    );

  for (const session of openSessions) {
    const duration = calcDurationMinutes(session.joinedAt, meetingEndedAt);
    await db
      .update(zoomParticipantSession)
      .set({ leftAt: meetingEndedAt, duration })
      .where(eq(zoomParticipantSession.id, session.id));

    if (session.participantEmail) {
      await tryAutoMarkAttendance({
        eventId: eventRow.id,
        organizationId: eventRow.organizationId,
        participantEmail: session.participantEmail,
      });
    }
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Route a verified Zoom webhook payload to the correct handler.
 * Call this only after verifyHmacSignature passes.
 */
export async function dispatchZoomEvent(body: ZoomWebhookPayload): Promise<{ received: boolean }> {
  const { event: eventType, event_ts, payload } = body;
  const obj = payload?.object;
  if (!obj) return { received: true };

  const meetingId = String(obj.id ?? "");
  if (!meetingId) return { received: true };

  // meeting.ended carries no participant — resolve the event and bail early
  if (eventType === "meeting.ended") {
    const eventRow = await findEventByMeetingId(meetingId);
    if (eventRow) await handleMeetingEnded(obj, eventRow, event_ts);
    return { received: true };
  }

  const participant = obj.participant;
  if (!participant) return { received: true };

  const eventRow = await findEventByMeetingId(meetingId);
  if (!eventRow) return { received: true };

  switch (eventType) {
    case "meeting.participant_joined":
      await handleParticipantJoined(participant, eventRow, meetingId);
      break;
    case "meeting.participant_left":
      await handleParticipantLeft(participant, eventRow);
      break;
    case "meeting.participant_put_in_waiting_room":
      // Participant is queued in the waiting room; no session to open yet
      break;
  }

  return { received: true };
}
