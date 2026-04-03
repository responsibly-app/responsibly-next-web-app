import { z } from "zod/v3";

export const ListEventsInputSchema = z.object({
  organizationId: z.string(),
});

export const EventSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
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
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
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
