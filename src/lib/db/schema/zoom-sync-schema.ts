import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { organization } from "./better-auth-schema";
import { event } from "./event-schema";

export const zoomMeetingSyncJob = pgTable(
  "zoom_meeting_sync_job",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    zoomMeetingId: text("zoom_meeting_id").notNull(),
    scheduledFor: timestamp("scheduled_for").notNull(),
    /** pending → running → done | failed */
    status: text("status").notNull().default("pending"),
    /** "auto_webhook" | "auto_cron" | "manual" | userId */
    triggeredBy: text("triggered_by").notNull(),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    participantsProcessed: integer("participants_processed"),
    newRecordsCreated: integer("new_records_created"),
    error: text("error"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("zoom_sync_job_status_scheduled_idx").on(table.status, table.scheduledFor),
    index("zoom_sync_job_event_id_idx").on(table.eventId),
    // Prevent duplicate pending auto jobs for the same event
    uniqueIndex("zoom_sync_job_event_auto_pending_uidx").on(table.eventId, table.triggeredBy),
  ],
);

export const zoomApiParticipantRecord = pgTable(
  "zoom_api_participant_record",
  {
    id: text("id").primaryKey(),
    syncJobId: text("sync_job_id")
      .notNull()
      .references(() => zoomMeetingSyncJob.id, { onDelete: "cascade" }),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    zoomMeetingId: text("zoom_meeting_id").notNull(),
    participantEmail: text("participant_email"),
    participantName: text("participant_name"),
    joinTime: timestamp("join_time"),
    leaveTime: timestamp("leave_time"),
    /** Duration in seconds (raw from Zoom API) */
    duration: integer("duration"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("zoom_api_participant_event_id_idx").on(table.eventId),
    index("zoom_api_participant_event_email_idx").on(table.eventId, table.participantEmail),
    // Prevent duplicate records for the same join session within a sync job
    uniqueIndex("zoom_api_participant_sync_email_join_uidx").on(
      table.syncJobId,
      table.participantEmail,
      table.joinTime,
    ),
  ],
);

export const zoomMeetingSyncJobRelations = relations(zoomMeetingSyncJob, ({ one, many }) => ({
  event: one(event, {
    fields: [zoomMeetingSyncJob.eventId],
    references: [event.id],
  }),
  organization: one(organization, {
    fields: [zoomMeetingSyncJob.organizationId],
    references: [organization.id],
  }),
  participants: many(zoomApiParticipantRecord),
}));

export const zoomApiParticipantRecordRelations = relations(zoomApiParticipantRecord, ({ one }) => ({
  syncJob: one(zoomMeetingSyncJob, {
    fields: [zoomApiParticipantRecord.syncJobId],
    references: [zoomMeetingSyncJob.id],
  }),
  event: one(event, {
    fields: [zoomApiParticipantRecord.eventId],
    references: [event.id],
  }),
}));
