import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  index,
  uniqueIndex,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { organization, member, user } from "./better-auth-schema";

export const EVENT_TYPES = ["in_person", "online", "hybrid"] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const event = pgTable(
  "event",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    eventType: text("event_type").default("in_person"),
    timezone: text("timezone").notNull().default("UTC"),
    location: text("location"),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at"),
    // Zoom integration
    zoomMeetingId: text("zoom_meeting_id"),
    zoomJoinUrl: text("zoom_join_url"),
    zoomStartUrl: text("zoom_start_url"),
    // Attendance methods: subset of ["manual", "qr", "zoom"]
    attendanceMethods: text("attendance_methods").array().default(["manual"]).notNull(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("event_organization_id_idx").on(table.organizationId)],
);

export const eventAttendance = pgTable(
  "event_attendance",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    status: text("status").notNull(), // "present" | "absent" | "excused"
    markedAt: timestamp("marked_at").defaultNow().notNull(),
    markedBy: text("marked_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Zoom attendance tracking
    zoomDuration: integer("zoom_duration"), // total minutes attended via Zoom
    zoomFirstJoinedAt: timestamp("zoom_first_joined_at"),
    // Presence flags — one per source, independently set
    onlineZoom: boolean("online_zoom").default(false),     // auto: Zoom webhook
    inPersonQr: boolean("in_person_qr").default(false),   // auto: QR scan
    inPersonManual: boolean("in_person_manual").default(false), // manual: admin
    onlineManual: boolean("online_manual").default(false),      // manual: admin
    // QR timestamp kept for display
    qrCheckedInAt: timestamp("qr_checked_in_at"),
  },
  (table) => [
    index("event_attendance_event_id_idx").on(table.eventId),
    uniqueIndex("event_attendance_event_id_member_id_uidx").on(
      table.eventId,
      table.memberId,
    ),
  ],
);

// Event-level QR code for member self-check-in
export const eventQrCode = pgTable(
  "event_qr_code",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    expiresAt: timestamp("expires_at"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("event_qr_code_event_id_idx").on(table.eventId),
    uniqueIndex("event_qr_code_code_uidx").on(table.code),
  ],
);

// Raw Zoom participant join/leave sessions (multiple per member per meeting)
export const zoomParticipantSession = pgTable(
  "zoom_participant_session",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    zoomMeetingId: text("zoom_meeting_id").notNull(),
    participantUuid: text("participant_uuid"),
    participantEmail: text("participant_email"),
    joinedAt: timestamp("joined_at").notNull(),
    leftAt: timestamp("left_at"),
    duration: integer("duration"), // minutes for this session leg
  },
  (table) => [
    index("zoom_participant_session_event_id_idx").on(table.eventId),
    index("zoom_participant_session_meeting_id_idx").on(table.zoomMeetingId),
  ],
);

// RSVP — members indicate they plan to attend an in-person or hybrid event
export const eventRsvp = pgTable(
  "event_rsvp",
  {
    id: text("id").primaryKey(),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id, { onDelete: "cascade" }),
    memberId: text("member_id")
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    rsvpedAt: timestamp("rsvped_at").defaultNow().notNull(),
  },
  (table) => [
    index("event_rsvp_event_id_idx").on(table.eventId),
    uniqueIndex("event_rsvp_event_id_member_id_uidx").on(table.eventId, table.memberId),
  ],
);

export const eventRelations = relations(event, ({ one, many }) => ({
  organization: one(organization, {
    fields: [event.organizationId],
    references: [organization.id],
  }),
  creator: one(user, {
    fields: [event.createdBy],
    references: [user.id],
  }),
  attendances: many(eventAttendance),
  qrCodes: many(eventQrCode),
  zoomSessions: many(zoomParticipantSession),
  rsvps: many(eventRsvp),
}));

export const eventAttendanceRelations = relations(eventAttendance, ({ one }) => ({
  event: one(event, {
    fields: [eventAttendance.eventId],
    references: [event.id],
  }),
  member: one(member, {
    fields: [eventAttendance.memberId],
    references: [member.id],
  }),
  markedByUser: one(user, {
    fields: [eventAttendance.markedBy],
    references: [user.id],
  }),
}));

export const eventQrCodeRelations = relations(eventQrCode, ({ one }) => ({
  event: one(event, {
    fields: [eventQrCode.eventId],
    references: [event.id],
  }),
  creator: one(user, {
    fields: [eventQrCode.createdBy],
    references: [user.id],
  }),
}));

export const zoomParticipantSessionRelations = relations(
  zoomParticipantSession,
  ({ one }) => ({
    event: one(event, {
      fields: [zoomParticipantSession.eventId],
      references: [event.id],
    }),
  }),
);

export const eventRsvpRelations = relations(eventRsvp, ({ one }) => ({
  event: one(event, {
    fields: [eventRsvp.eventId],
    references: [event.id],
  }),
  member: one(member, {
    fields: [eventRsvp.memberId],
    references: [member.id],
  }),
}));
