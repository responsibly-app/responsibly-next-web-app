import { z } from "zod/v3";

export const EventTypeSchema = z.enum(["in_person", "online", "hybrid"]);

export const ListEventsInputSchema = z.object({
  organizationId: z.string(),
});

export const EventSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  eventType: z.string().nullable(),
  timezone: z.string(),
  startAt: z.date(),
  endAt: z.date().nullable(),
  createdBy: z.string(),
  createdAt: z.date(),
  creatorName: z.string().nullable(),
});

export const ListEventsOutputSchema = z.array(EventSchema);

export const CreateEventInputSchema = z.object({
  organizationId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  eventType: EventTypeSchema.optional(),
  timezone: z.string().default("UTC"),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
});

export const GetEventInputSchema = z.object({
  eventId: z.string(),
});

export const GetEventOutputSchema = EventSchema.extend({
  organizationName: z.string(),
  userRole: z.string(),
});

export const UpdateEventInputSchema = z.object({
  eventId: z.string(),
  organizationId: z.string(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  eventType: EventTypeSchema.nullable().optional(),
  timezone: z.string().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().nullable().optional(),
});

export const DeleteEventInputSchema = z.object({
  eventId: z.string(),
  organizationId: z.string(),
});

export const AttendanceRecordSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  memberId: z.string(),
  status: z.enum(["present", "absent", "excused"]),
  markedAt: z.date(),
  markedBy: z.string(),
  memberName: z.string().nullable(),
  memberEmail: z.string().nullable(),
  memberImage: z.string().nullable(),
});

export const GetEventAttendanceInputSchema = z.object({
  eventId: z.string(),
});

export const GetEventAttendanceOutputSchema = z.array(AttendanceRecordSchema);

export const MarkAttendanceInputSchema = z.object({
  eventId: z.string(),
  memberId: z.string(),
  status: z.enum(["present", "absent", "excused"]),
  organizationId: z.string(),
});

export const GetLeaderboardInputSchema = z.object({
  organizationId: z.string(),
});

export const LeaderboardEntrySchema = z.object({
  memberId: z.string(),
  memberName: z.string().nullable(),
  memberEmail: z.string().nullable(),
  memberImage: z.string().nullable(),
  present: z.number(),
  absent: z.number(),
  excused: z.number(),
});

export const GetLeaderboardOutputSchema = z.array(LeaderboardEntrySchema);

export const UpcomingEventSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  organizationName: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  eventType: z.string().nullable(),
  timezone: z.string(),
  startAt: z.date(),
  endAt: z.date().nullable(),
});

export const ListAllUpcomingOutputSchema = z.array(UpcomingEventSchema);
