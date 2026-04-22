import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, organization, user } from "@/lib/db/schema/better-auth-schema";
import {
  event,
  eventAttendance,
  eventQrCode,
} from "@/lib/db/schema/event-schema";
import { organizationSettings } from "@/lib/db/schema/org-settings-schema";
import { authed } from "@/lib/orpc/base";
import { toZoomTimezone } from "@/lib/utils/timezone";
import { ROLE_LEVELS, type OrgRole } from "@/lib/auth/hooks/oraganization/permissions";
import { getZoomClientForUser } from "@/lib/sdks/zoom-client";
import {
  ListEventsInputSchema,
  ListEventsOutputSchema,
  EventSchema,
  CreateEventInputSchema,
  GetEventInputSchema,
  GetEventOutputSchema,
  UpdateEventInputSchema,
  DeleteEventInputSchema,
  GetEventAttendanceInputSchema,
  GetEventAttendanceOutputSchema,
  MarkAttendanceInputSchema,
  GetLeaderboardInputSchema,
  GetLeaderboardOutputSchema,
  ListAllUpcomingOutputSchema,
  GenerateQRCodeInputSchema,
  GenerateQRCodeOutputSchema,
  GetEventQRCodeInputSchema,
  GetEventQRCodeOutputSchema,
  CheckInWithQRInputSchema,
  ScanMemberQRInputSchema,
} from "./event-schemas";

/** Convert a UTC ISO string to local wall-clock time in the given IANA timezone, formatted as
 * yyyy-MM-ddTHH:mm:ss (no Z). Zoom interprets start_time as UTC when it ends with Z, so we
 * must strip the offset and pass local time alongside the timezone field. */
function toZoomLocalTime(isoUtc: string, tz: string): string {
  const date = new Date(isoUtc);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`;
}

async function requireOrgMember(organizationId: string, userId: string) {
  const row = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)
    .then((rows) => rows[0]);
  if (!row) throw new ORPCError("FORBIDDEN");
  return row.role;
}

async function requireAtLeastRole(organizationId: string, userId: string, minRole: OrgRole) {
  const role = await requireOrgMember(organizationId, userId);
  const userLevel = ROLE_LEVELS[role as OrgRole] ?? Infinity;
  const requiredLevel = ROLE_LEVELS[minRole];
  if (userLevel > requiredLevel) throw new ORPCError("FORBIDDEN");
}

async function getOrgOwnerUserId(organizationId: string): Promise<string | null> {
  const row = await db
    .select({ userId: member.userId })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner")))
    .limit(1)
    .then((rows) => rows[0]);
  return row?.userId ?? null;
}

/** Default attendance methods based on event type */
function defaultAttendanceMethods(eventType: string): string[] {
  if (eventType === "online") return ["manual", "zoom"];
  if (eventType === "hybrid") return ["manual", "qr", "zoom"];
  return ["manual", "qr"]; // in_person
}

const eventSelectFields = {
  id: event.id,
  organizationId: event.organizationId,
  title: event.title,
  description: event.description,
  eventType: event.eventType,
  timezone: event.timezone,
  location: event.location,
  startAt: event.startAt,
  endAt: event.endAt,
  zoomMeetingId: event.zoomMeetingId,
  zoomJoinUrl: event.zoomJoinUrl,
  zoomStartUrl: event.zoomStartUrl,
  attendanceMethods: event.attendanceMethods,
  createdBy: event.createdBy,
  createdAt: event.createdAt,
};

export const eventRouter = {
  list: authed
    .route({
      method: "GET",
      path: "/event/list",
      summary: "List events for an organization",
      tags: ["Event"],
    })
    .input(ListEventsInputSchema)
    .output(ListEventsOutputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgMember(input.organizationId, context.session.user.id);

      const rows = await db
        .select({ ...eventSelectFields, creatorName: user.name })
        .from(event)
        .leftJoin(user, eq(event.createdBy, user.id))
        .where(eq(event.organizationId, input.organizationId))
        .orderBy(desc(event.startAt));

      return rows;
    }),

  getEvent: authed
    .route({
      method: "GET",
      path: "/event/get",
      summary: "Get a single event by ID",
      tags: ["Event"],
    })
    .input(GetEventInputSchema)
    .output(GetEventOutputSchema)
    .handler(async ({ input, context }) => {
      const rows = await db
        .select({
          ...eventSelectFields,
          organizationName: organization.name,
          creatorName: user.name,
        })
        .from(event)
        .innerJoin(organization, eq(event.organizationId, organization.id))
        .leftJoin(user, eq(event.createdBy, user.id))
        .where(eq(event.id, input.eventId))
        .limit(1);

      const row = rows[0];
      if (!row) throw new ORPCError("NOT_FOUND");

      const userRole = await requireOrgMember(row.organizationId, context.session.user.id);

      return { ...row, userRole };
    }),

  create: authed
    .route({
      method: "POST",
      path: "/event/create",
      summary: "Create an event for an organization",
      tags: ["Event"],
    })
    .input(CreateEventInputSchema)
    .output(EventSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      await requireAtLeastRole(input.organizationId, userId, "admin");

      const resolvedType = input.eventType ?? "in_person";
      const resolvedMethods =
        input.attendanceMethods ??
        defaultAttendanceMethods(resolvedType);

      // Validate Zoom usage
      if (
        input.zoomOption !== "none" &&
        input.zoomOption !== undefined &&
        resolvedType === "in_person"
      ) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Zoom meetings are only available for online and hybrid events",
        });
      }

      let zoomMeetingId: string | null = null;
      let zoomJoinUrl: string | null = null;
      let zoomStartUrl: string | null = null;

      if (input.zoomOption === "create") {
        const ownerUserId = await getOrgOwnerUserId(input.organizationId);
        const zoom = ownerUserId ? await getZoomClientForUser(ownerUserId) : null;
        if (!zoom) {
          throw new ORPCError("PRECONDITION_FAILED", {
            message: "The organization owner has not connected a Zoom account. Ask the owner to connect Zoom in Integrations.",
          });
        }
        const meeting = await zoom.createMeeting({
          topic: input.title,
          type: 2,
          start_time: toZoomLocalTime(input.startAt, input.timezone ?? "UTC"),
          duration: input.endAt
            ? Math.round(
                (new Date(input.endAt).getTime() - new Date(input.startAt).getTime()) / 60000,
              )
            : 60,
          timezone: toZoomTimezone(input.timezone ?? "UTC"),
          agenda: input.description,
          settings: {
            join_before_host: false,
            waiting_room: true,
            // approval_type 0 = registration required, auto-approve.
            // Zoom will require participants to register (email collected),
            // so the webhook carries a registrant_id for reliable identity matching.
            approval_type: 0,
          },
        });
        zoomMeetingId = String(meeting.id);
        zoomJoinUrl = meeting.join_url;
        zoomStartUrl = (meeting as unknown as { start_url?: string }).start_url ?? null;
      } else if (input.zoomOption === "link" && input.zoomMeetingId) {
        const ownerUserId = await getOrgOwnerUserId(input.organizationId);
        const zoom = ownerUserId ? await getZoomClientForUser(ownerUserId) : null;
        if (zoom) {
          try {
            const meeting = await zoom.getMeeting(input.zoomMeetingId);
            zoomMeetingId = String(meeting.id);
            zoomJoinUrl = meeting.join_url;
          } catch {
            // Use provided ID even if we can't verify
            zoomMeetingId = input.zoomMeetingId;
          }
        } else {
          zoomMeetingId = input.zoomMeetingId;
        }
      }

      const id = crypto.randomUUID();
      const [row] = await db
        .insert(event)
        .values({
          id,
          organizationId: input.organizationId,
          title: input.title,
          description: input.description ?? null,
          eventType: resolvedType,
          timezone: input.timezone ?? "UTC",
          location: input.location ?? null,
          startAt: new Date(input.startAt),
          endAt: input.endAt ? new Date(input.endAt) : null,
          zoomMeetingId,
          zoomJoinUrl,
          zoomStartUrl,
          attendanceMethods: resolvedMethods,
          createdBy: userId,
          createdAt: new Date(),
        })
        .returning();

      return { ...row, creatorName: context.session.user.name ?? null };
    }),

  update: authed
    .route({
      method: "PATCH",
      path: "/event/update",
      summary: "Update an event",
      tags: ["Event"],
    })
    .input(UpdateEventInputSchema)
    .output(EventSchema)
    .handler(async ({ input, context }) => {
      await requireAtLeastRole(input.organizationId, context.session.user.id, "admin");

      const updateValues: Partial<typeof event.$inferInsert> = {};
      if (input.title !== undefined) updateValues.title = input.title;
      if (input.description !== undefined) updateValues.description = input.description;
      if (input.eventType !== undefined) updateValues.eventType = input.eventType;
      if (input.timezone !== undefined) updateValues.timezone = input.timezone;
      if (input.location !== undefined) updateValues.location = input.location;
      if (input.startAt !== undefined) updateValues.startAt = new Date(input.startAt);
      if ("endAt" in input) updateValues.endAt = input.endAt ? new Date(input.endAt) : null;
      if (input.attendanceMethods !== undefined)
        updateValues.attendanceMethods = input.attendanceMethods;

      // Handle Zoom update
      if (input.zoomOption === "none") {
        updateValues.zoomMeetingId = null;
        updateValues.zoomJoinUrl = null;
        updateValues.zoomStartUrl = null;
      } else if (input.zoomOption === "create") {
        const ownerUserId = await getOrgOwnerUserId(input.organizationId);
        const zoom = ownerUserId ? await getZoomClientForUser(ownerUserId) : null;
        if (!zoom)
          throw new ORPCError("PRECONDITION_FAILED", {
            message: "The organization owner has not connected a Zoom account. Ask the owner to connect Zoom in Integrations.",
          });
        const currentEvent = await db
          .select({ title: event.title, startAt: event.startAt, endAt: event.endAt, timezone: event.timezone })
          .from(event)
          .where(eq(event.id, input.eventId))
          .limit(1)
          .then((r) => r[0]);

        const startAt = input.startAt ?? currentEvent?.startAt?.toISOString() ?? "";
        const endAt = input.endAt ?? currentEvent?.endAt?.toISOString();
        const meeting = await zoom.createMeeting({
          topic: input.title ?? currentEvent?.title ?? "Meeting",
          type: 2,
          start_time: toZoomLocalTime(startAt, input.timezone ?? currentEvent?.timezone ?? "UTC"),
          duration: endAt
            ? Math.round(
                (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000,
              )
            : 60,
          timezone: toZoomTimezone(input.timezone ?? currentEvent?.timezone ?? "UTC"),
          settings: { join_before_host: true, waiting_room: false, approval_type: 0 },
        });
        updateValues.zoomMeetingId = String(meeting.id);
        updateValues.zoomJoinUrl = meeting.join_url;
        updateValues.zoomStartUrl = (meeting as unknown as { start_url?: string }).start_url ?? null;
      } else if (input.zoomOption === "link" && input.zoomMeetingId) {
        updateValues.zoomMeetingId = input.zoomMeetingId;
        // Sync title/time changes to Zoom if the meeting belongs to the org owner
        const ownerUserIdForLink = await getOrgOwnerUserId(input.organizationId);
        const zoomForLink = ownerUserIdForLink ? await getZoomClientForUser(ownerUserIdForLink) : null;
        if (zoomForLink && (input.title !== undefined || input.startAt !== undefined || input.endAt !== undefined || input.timezone !== undefined)) {
          const currentEventForLink = await db
            .select({ title: event.title, startAt: event.startAt, endAt: event.endAt, timezone: event.timezone })
            .from(event)
            .where(eq(event.id, input.eventId))
            .limit(1)
            .then((r) => r[0]);
          const startAt = input.startAt ?? currentEventForLink?.startAt?.toISOString() ?? "";
          const endAt = input.endAt ?? currentEventForLink?.endAt?.toISOString();
          await zoomForLink.updateMeeting(input.zoomMeetingId, {
            topic: input.title ?? currentEventForLink?.title ?? "Meeting",
            start_time: toZoomLocalTime(startAt, input.timezone ?? currentEventForLink?.timezone ?? "UTC"),
            duration: endAt
              ? Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000)
              : 60,
            timezone: toZoomTimezone(input.timezone ?? currentEventForLink?.timezone ?? "UTC"),
          }).catch(() => { /* ignore if meeting not owned by this account */ });
        }
      }

      const [row] = await db
        .update(event)
        .set(updateValues)
        .where(eq(event.id, input.eventId))
        .returning();

      if (!row) throw new ORPCError("NOT_FOUND");

      const creatorRow = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, row.createdBy))
        .limit(1);

      return { ...row, creatorName: creatorRow[0]?.name ?? null };
    }),

  delete: authed
    .route({
      method: "DELETE",
      path: "/event/delete",
      summary: "Delete an event",
      tags: ["Event"],
    })
    .input(DeleteEventInputSchema)
    .handler(async ({ input, context }) => {
      await requireAtLeastRole(input.organizationId, context.session.user.id, "admin");
      await db.delete(event).where(eq(event.id, input.eventId));
      return { success: true };
    }),

  getAttendance: authed
    .route({
      method: "GET",
      path: "/event/attendance",
      summary: "Get attendance records for an event",
      tags: ["Event"],
    })
    .input(GetEventAttendanceInputSchema)
    .output(GetEventAttendanceOutputSchema)
    .handler(async ({ input }) => {
      const rows = await db
        .select({
          id: eventAttendance.id,
          eventId: eventAttendance.eventId,
          memberId: eventAttendance.memberId,
          status: eventAttendance.status,
          markedAt: eventAttendance.markedAt,
          markedBy: eventAttendance.markedBy,
          memberName: user.name,
          memberEmail: user.email,
          memberImage: user.image,
          zoomDuration: eventAttendance.zoomDuration,
          zoomFirstJoinedAt: eventAttendance.zoomFirstJoinedAt,
          qrCheckedInAt: eventAttendance.qrCheckedInAt,
          onlineZoom: eventAttendance.onlineZoom,
          inPersonQr: eventAttendance.inPersonQr,
          inPersonManual: eventAttendance.inPersonManual,
          onlineManual: eventAttendance.onlineManual,
        })
        .from(eventAttendance)
        .leftJoin(member, eq(eventAttendance.memberId, member.id))
        .leftJoin(user, eq(member.userId, user.id))
        .where(eq(eventAttendance.eventId, input.eventId));

      return rows.map((r) => ({
        ...r,
        status: r.status as "present" | "absent" | "excused",
      }));
    }),

  markAttendance: authed
    .route({
      method: "POST",
      path: "/event/mark-attendance",
      summary: "Mark attendance for a member at an event",
      tags: ["Event"],
    })
    .input(MarkAttendanceInputSchema)
    .handler(async ({ input, context }) => {
      await requireAtLeastRole(input.organizationId, context.session.user.id, "assistant");

      const existing = await db
        .select({
          inPersonManual: eventAttendance.inPersonManual,
          onlineManual: eventAttendance.onlineManual,
        })
        .from(eventAttendance)
        .where(
          and(
            eq(eventAttendance.eventId, input.eventId),
            eq(eventAttendance.memberId, input.memberId),
          ),
        )
        .limit(1)
        .then((r) => r[0]);

      const isPresent = input.status === "present";

      await db
        .insert(eventAttendance)
        .values({
          id: crypto.randomUUID(),
          eventId: input.eventId,
          memberId: input.memberId,
          status: input.status,
          markedAt: new Date(),
          markedBy: context.session.user.id,
          inPersonManual: isPresent ? (input.inPersonManual ?? false) : false,
          onlineManual: isPresent ? (input.onlineManual ?? false) : false,
        })
        .onConflictDoUpdate({
          target: [eventAttendance.eventId, eventAttendance.memberId],
          set: {
            status: input.status,
            markedAt: new Date(),
            markedBy: context.session.user.id,
            inPersonManual: isPresent
              ? (input.inPersonManual ?? existing?.inPersonManual ?? false)
              : false,
            onlineManual: isPresent
              ? (input.onlineManual ?? existing?.onlineManual ?? false)
              : false,
          },
        });

      return { success: true };
    }),

  getLeaderboard: authed
    .route({
      method: "GET",
      path: "/event/leaderboard",
      summary: "Get attendance leaderboard for an organization",
      tags: ["Event"],
    })
    .input(GetLeaderboardInputSchema)
    .output(GetLeaderboardOutputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgMember(input.organizationId, context.session.user.id);

      const rows = await db
        .select({
          memberId: member.id,
          memberName: user.name,
          memberEmail: user.email,
          memberImage: user.image,
          present: sql<number>`cast(count(case when ${eventAttendance.status} = 'present' then 1 end) as int)`,
          absent: sql<number>`cast(count(case when ${eventAttendance.status} = 'absent' then 1 end) as int)`,
          excused: sql<number>`cast(count(case when ${eventAttendance.status} = 'excused' then 1 end) as int)`,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .leftJoin(eventAttendance, eq(eventAttendance.memberId, member.id))
        .where(eq(member.organizationId, input.organizationId))
        .groupBy(member.id, user.name, user.email, user.image)
        .orderBy(
          desc(sql`count(case when ${eventAttendance.status} = 'present' then 1 end)`),
        );

      return rows;
    }),

  listAllUpcoming: authed
    .route({
      method: "GET",
      path: "/event/list-all-upcoming",
      summary: "List upcoming events from all organizations the user belongs to",
      tags: ["Event"],
    })
    .output(ListAllUpcomingOutputSchema)
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      const now = new Date();

      return db
        .select({
          id: event.id,
          organizationId: event.organizationId,
          organizationName: organization.name,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          timezone: event.timezone,
          location: event.location,
          startAt: event.startAt,
          endAt: event.endAt,
          zoomMeetingId: event.zoomMeetingId,
          zoomJoinUrl: event.zoomJoinUrl,
          attendanceMethods: event.attendanceMethods,
        })
        .from(event)
        .innerJoin(organization, eq(event.organizationId, organization.id))
        .innerJoin(
          member,
          and(eq(member.organizationId, event.organizationId), eq(member.userId, userId)),
        )
        .where(gte(event.startAt, now))
        .orderBy(asc(event.startAt))
        .limit(10);
    }),

  // --- QR Code procedures ---

  generateQRCode: authed
    .route({
      method: "POST",
      path: "/event/qr-code/generate",
      summary: "Generate a QR code for an event (for member self check-in)",
      tags: ["Event"],
    })
    .input(GenerateQRCodeInputSchema)
    .output(GenerateQRCodeOutputSchema)
    .handler(async ({ input, context }) => {
      await requireAtLeastRole(input.organizationId, context.session.user.id, "assistant");

      // Rotate: delete any existing QR for this event
      await db.delete(eventQrCode).where(eq(eventQrCode.eventId, input.eventId));

      const code = crypto.randomUUID();
      const expiresAt = input.expiresInHours
        ? new Date(Date.now() + input.expiresInHours * 60 * 60 * 1000)
        : null;

      const [row] = await db
        .insert(eventQrCode)
        .values({
          id: crypto.randomUUID(),
          eventId: input.eventId,
          code,
          expiresAt,
          createdBy: context.session.user.id,
          createdAt: new Date(),
        })
        .returning();

      return { id: row.id, code: row.code, expiresAt: row.expiresAt };
    }),

  getEventQRCode: authed
    .route({
      method: "GET",
      path: "/event/qr-code",
      summary: "Get the active QR code for an event",
      tags: ["Event"],
    })
    .input(GetEventQRCodeInputSchema)
    .output(GetEventQRCodeOutputSchema)
    .handler(async ({ input }) => {
      const row = await db
        .select()
        .from(eventQrCode)
        .where(eq(eventQrCode.eventId, input.eventId))
        .orderBy(desc(eventQrCode.createdAt))
        .limit(1)
        .then((r) => r[0]);

      if (!row) return null;
      return { id: row.id, code: row.code, expiresAt: row.expiresAt, createdAt: row.createdAt };
    }),

  /** Member scans the event's QR code to self-check-in */
  checkInWithQR: authed
    .route({
      method: "POST",
      path: "/event/qr-code/check-in",
      summary: "Check in to an event using a QR code",
      tags: ["Event"],
    })
    .input(CheckInWithQRInputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const qr = await db
        .select()
        .from(eventQrCode)
        .where(eq(eventQrCode.code, input.code))
        .limit(1)
        .then((r) => r[0]);

      if (!qr) throw new ORPCError("NOT_FOUND", { message: "Invalid QR code" });

      if (qr.expiresAt && qr.expiresAt < new Date()) {
        throw new ORPCError("BAD_REQUEST", { message: "QR code has expired" });
      }

      // Find this user's member record for the event's org
      const eventRow = await db
        .select({ organizationId: event.organizationId })
        .from(event)
        .where(eq(event.id, qr.eventId))
        .limit(1)
        .then((r) => r[0]);

      if (!eventRow) throw new ORPCError("NOT_FOUND", { message: "Event not found" });

      const memberRow = await db
        .select({ id: member.id })
        .from(member)
        .where(
          and(
            eq(member.organizationId, eventRow.organizationId),
            eq(member.userId, userId),
          ),
        )
        .limit(1)
        .then((r) => r[0]);

      if (!memberRow)
        throw new ORPCError("FORBIDDEN", { message: "You are not a member of this organization" });

      const now = new Date();

      // Check if the user already checked in via QR
      const existing = await db
        .select({ qrCheckedInAt: eventAttendance.qrCheckedInAt, inPersonQr: eventAttendance.inPersonQr })
        .from(eventAttendance)
        .where(and(
          eq(eventAttendance.eventId, qr.eventId),
          eq(eventAttendance.memberId, memberRow.id),
        ))
        .limit(1)
        .then((r) => r[0]);

      const alreadyCheckedIn = !!(existing?.inPersonQr || existing?.qrCheckedInAt);

      await db
        .insert(eventAttendance)
        .values({
          id: crypto.randomUUID(),
          eventId: qr.eventId,
          memberId: memberRow.id,
          status: "present",
          markedAt: now,
          markedBy: userId,
          qrCheckedInAt: now,
          inPersonQr: true,
        })
        .onConflictDoUpdate({
          target: [eventAttendance.eventId, eventAttendance.memberId],
          set: {
            status: "present",
            inPersonQr: true,
            // Preserve the original check-in time
            qrCheckedInAt: sql`COALESCE(event_attendance.qr_checked_in_at, EXCLUDED.qr_checked_in_at)`,
          },
        });

      return { success: true, eventId: qr.eventId, alreadyCheckedIn };
    }),

  /** Admin/assistant scans a member's QR code to mark them present in-person */
  scanMemberQR: authed
    .route({
      method: "POST",
      path: "/event/qr-code/scan-member",
      summary: "Mark a member present in-person by scanning their member QR",
      tags: ["Event"],
    })
    .input(ScanMemberQRInputSchema)
    .handler(async ({ input, context }) => {
      await requireAtLeastRole(input.organizationId, context.session.user.id, "assistant");

      const now = new Date();

      // Check for an existing QR scan before upserting
      const [existing] = await db
        .select({ qrCheckedInAt: eventAttendance.qrCheckedInAt, inPersonQr: eventAttendance.inPersonQr })
        .from(eventAttendance)
        .where(and(
          eq(eventAttendance.eventId, input.eventId),
          eq(eventAttendance.memberId, input.memberId),
        ))
        .limit(1);

      const alreadyScanned = !!(existing?.inPersonQr || existing?.qrCheckedInAt);
      const previousScanTime = existing?.qrCheckedInAt ?? null;

      if (alreadyScanned) {
        return { success: true, alreadyScanned: true, previousScanTime };
      }

      await db
        .insert(eventAttendance)
        .values({
          id: crypto.randomUUID(),
          eventId: input.eventId,
          memberId: input.memberId,
          status: "present",
          markedAt: now,
          markedBy: context.session.user.id,
          qrCheckedInAt: now,
          inPersonQr: true,
        })
        .onConflictDoUpdate({
          target: [eventAttendance.eventId, eventAttendance.memberId],
          set: {
            status: "present",
            inPersonQr: true,
            // Preserve the original scan time — COALESCE keeps it if already set
            qrCheckedInAt: sql`COALESCE(event_attendance.qr_checked_in_at, EXCLUDED.qr_checked_in_at)`,
          },
        });

      return { success: true, alreadyScanned, previousScanTime };
    }),
};
