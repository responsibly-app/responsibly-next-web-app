import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
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
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at"),
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
  },
  (table) => [
    index("event_attendance_event_id_idx").on(table.eventId),
    uniqueIndex("event_attendance_event_id_member_id_uidx").on(table.eventId, table.memberId),
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
