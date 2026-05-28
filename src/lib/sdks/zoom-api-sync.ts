import crypto from "crypto";
import { and, eq, isNotNull, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { ZOOM_KEEP_PARTICIPANT_RECORDS } from "./zoom-config";
import { member } from "@/lib/db/schema/better-auth-schema";
import { event } from "@/lib/db/schema/event-schema";
import {
  zoomMeetingSyncJob,
  zoomApiParticipantRecord,
} from "@/lib/db/schema/zoom-sync-schema";
import { getZoomClientForUser } from "@/lib/sdks/zoom-client";
import { tryAutoMarkAttendance } from "@/lib/sdks/zoom-webhook";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SyncResult {
  participantsProcessed: number;
  newRecordsCreated: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrgOwnerUserId(organizationId: string): Promise<string | null> {
  const row = await db
    .select({ userId: member.userId })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.role, "owner")))
    .limit(1)
    .then((r) => r[0]);
  return row?.userId ?? null;
}

// ─── Core Processor ───────────────────────────────────────────────────────────

/**
 * Fetch past meeting participants from the Zoom API and reconcile attendance.
 * Idempotent: duplicate API participant records are silently skipped via ON CONFLICT DO NOTHING.
 */
export async function processZoomApiSync(
  jobId: string,
  eventId: string,
  organizationId: string,
  zoomMeetingId: string,
  orgOwnerUserId: string,
): Promise<SyncResult> {
  const zoom = await getZoomClientForUser(orgOwnerUserId);
  if (!zoom) {
    throw new Error(`No Zoom account connected for org owner (userId=${orgOwnerUserId})`);
  }

  // Paginate through all participants
  type ParticipantEntry = {
    email: string;
    name: string;
    joinTime: Date;
    leaveTime: Date | null;
    durationSeconds: number;
  };
  const collected: ParticipantEntry[] = [];
  let nextPageToken: string | undefined;

  do {
    const page = await zoom.getPastMeetingParticipants(zoomMeetingId, {
      page_size: 300,
      next_page_token: nextPageToken,
    });

    for (const p of page.participants) {
      const email = p.user_email?.toLowerCase();
      if (!email) continue;
      collected.push({
        email,
        name: p.name,
        joinTime: new Date(p.join_time),
        leaveTime: p.leave_time ? new Date(p.leave_time) : null,
        durationSeconds: Math.max(0, p.duration ?? 0),
      });
    }

    nextPageToken = page.next_page_token || undefined;
  } while (nextPageToken);

  let newRecordsCreated = 0;
  const emailTotalDuration = new Map<string, number>();
  const emailFirstJoin = new Map<string, Date>();
  // could also aggregate based on registrant_id for meetings with registration enabled

  for (const p of collected) {
    if (ZOOM_KEEP_PARTICIPANT_RECORDS) {
      const result = await db
        .insert(zoomApiParticipantRecord)
        .values({
          id: crypto.randomUUID(),
          syncJobId: jobId,
          eventId,
          zoomMeetingId,
          participantEmail: p.email,
          participantName: p.name,
          joinTime: p.joinTime,
          leaveTime: p.leaveTime,
          duration: p.durationSeconds,
          createdAt: new Date(),
        })
        .onConflictDoNothing()
        .returning({ id: zoomApiParticipantRecord.id });

      if (result.length > 0) newRecordsCreated++;
    }

    // Accumulate totals in memory for auto-attendance (avoids extra DB reads)
    emailTotalDuration.set(p.email, (emailTotalDuration.get(p.email) ?? 0) + p.durationSeconds);
    const existing = emailFirstJoin.get(p.email);
    if (!existing || p.joinTime < existing) {
      emailFirstJoin.set(p.email, p.joinTime);
    }
  }

  // Run auto-attendance for every unique participant email
  for (const [email, totalSeconds] of emailTotalDuration.entries()) {
    await tryAutoMarkAttendance({
      eventId,
      organizationId,
      participantEmail: email,
      durationOverride: Math.floor(totalSeconds / 60),
      firstJoinOverride: emailFirstJoin.get(email) ?? null,
    });
  }

  return {
    participantsProcessed: emailTotalDuration.size,
    newRecordsCreated,
  };
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

/**
 * Insert a pending sync job. Silently ignores duplicate auto jobs for the same event
 * (unique index on event_id + triggered_by prevents double-scheduling from retried webhooks).
 * Manual jobs (triggeredBy = userId) bypass the unique constraint since they're keyed on userId.
 */
export async function scheduleZoomApiSync(opts: {
  eventId: string;
  organizationId: string;
  zoomMeetingId: string;
  scheduledFor: Date;
  triggeredBy: string;
}): Promise<void> {
  await db
    .insert(zoomMeetingSyncJob)
    .values({
      id: crypto.randomUUID(),
      eventId: opts.eventId,
      organizationId: opts.organizationId,
      zoomMeetingId: opts.zoomMeetingId,
      scheduledFor: opts.scheduledFor,
      status: "pending",
      triggeredBy: opts.triggeredBy,
      createdAt: new Date(),
    })
    .onConflictDoNothing();
}

// ─── Cron Helper ──────────────────────────────────────────────────────────────

/**
 * Find events in api/both mode whose meeting has ended but have no sync job yet.
 * Used as a safety net when the meeting.ended webhook never fired.
 */
export async function findOrphanedMeetings(
  delayMs: number,
): Promise<Array<{ id: string; organizationId: string; zoomMeetingId: string; endAt: Date }>> {
  const cutoff = new Date(Date.now() - delayMs);

  // Events with a past endAt and a zoomMeetingId (and no existing sync job, filtered below)
  const rows = await db
    .select({
      id: event.id,
      organizationId: event.organizationId,
      zoomMeetingId: event.zoomMeetingId,
      endAt: event.endAt,
    })
    .from(event)
    .where(
      and(
        isNotNull(event.endAt),
        lte(event.endAt, cutoff),
        isNotNull(event.zoomMeetingId),
      ),
    )
    .then((rows) => rows.filter((r) => r.zoomMeetingId && r.endAt));

  if (rows.length === 0) return [];

  // Exclude events that already have a sync job
  const eventIdsWithJobs = await db
    .select({ eventId: zoomMeetingSyncJob.eventId })
    .from(zoomMeetingSyncJob)
    .then((r) => new Set(r.map((x) => x.eventId)));

  return (rows as Array<{ id: string; organizationId: string; zoomMeetingId: string; endAt: Date }>)
    .filter((r) => !eventIdsWithJobs.has(r.id));
}

// ─── Batch Processor (used by cron) ──────────────────────────────────────────

export interface ProcessJobsResult {
  processed: number;
  succeeded: number;
  failed: number;
}

/**
 * Process up to `limit` pending sync jobs whose scheduledFor is in the past.
 * Marks jobs running → done/failed with full result metadata.
 */
export async function processPendingSyncJobs(limit = 10): Promise<ProcessJobsResult> {
  const now = new Date();

  const jobs = await db
    .select({
      id: zoomMeetingSyncJob.id,
      eventId: zoomMeetingSyncJob.eventId,
      organizationId: zoomMeetingSyncJob.organizationId,
      zoomMeetingId: zoomMeetingSyncJob.zoomMeetingId,
    })
    .from(zoomMeetingSyncJob)
    .where(
      and(
        eq(zoomMeetingSyncJob.status, "pending"),
        lte(zoomMeetingSyncJob.scheduledFor, now),
      ),
    )
    .limit(limit);

  let succeeded = 0;
  let failed = 0;

  for (const job of jobs) {
    // Mark as running
    await db
      .update(zoomMeetingSyncJob)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(zoomMeetingSyncJob.id, job.id));

    try {
      const ownerUserId = await getOrgOwnerUserId(job.organizationId);
      if (!ownerUserId) throw new Error("No org owner found");

      const result = await processZoomApiSync(
        job.id,
        job.eventId,
        job.organizationId,
        job.zoomMeetingId,
        ownerUserId,
      );

      await db
        .update(zoomMeetingSyncJob)
        .set({
          status: "done",
          completedAt: new Date(),
          participantsProcessed: result.participantsProcessed,
          newRecordsCreated: result.newRecordsCreated,
        })
        .where(eq(zoomMeetingSyncJob.id, job.id));

      succeeded++;
    } catch (err) {
      await db
        .update(zoomMeetingSyncJob)
        .set({
          status: "failed",
          completedAt: new Date(),
          error: err instanceof Error ? err.message : String(err),
        })
        .where(eq(zoomMeetingSyncJob.id, job.id));

      failed++;
    }
  }

  return { processed: jobs.length, succeeded, failed };
}
