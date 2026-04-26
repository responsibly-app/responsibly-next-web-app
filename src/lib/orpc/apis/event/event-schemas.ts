import { z } from "zod/v3";

export const EventTypeSchema = z.enum(["in_person", "online", "hybrid"]);
export const AttendanceMethodSchema = z.enum(["manual", "qr", "zoom"]);

export const ZoomOptionSchema = z.enum(["none", "create", "link"]);

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
  location: z.string().nullable(),
  startAt: z.date(),
  endAt: z.date().nullable(),
  zoomMeetingId: z.string().nullable(),
  zoomJoinUrl: z.string().nullable(),
  zoomStartUrl: z.string().nullable(),
  attendanceMethods: z.array(z.string()),
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
  location: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  // Zoom: "none" = no Zoom, "create" = auto-create meeting, "link" = provide existing ID
  zoomOption: ZoomOptionSchema.optional().default("none"),
  zoomMeetingId: z.string().optional(), // used when zoomOption = "link"
  attendanceMethods: z.array(AttendanceMethodSchema).optional(),
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
  location: z.string().nullable().optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().nullable().optional(),
  zoomOption: ZoomOptionSchema.optional(),
  zoomMeetingId: z.string().nullable().optional(),
  attendanceMethods: z.array(AttendanceMethodSchema).optional(),
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
  // Extended fields
  zoomDuration: z.number().nullable(),
  zoomFirstJoinedAt: z.date().nullable(),
  qrCheckedInAt: z.date().nullable(),
  onlineZoom: z.boolean().nullable(),
  inPersonQr: z.boolean().nullable(),
  inPersonManual: z.boolean().nullable(),
  onlineManual: z.boolean().nullable(),
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
  inPersonManual: z.boolean().optional(),
  onlineManual: z.boolean().optional(),
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
  location: z.string().nullable(),
  startAt: z.date(),
  endAt: z.date().nullable(),
  zoomMeetingId: z.string().nullable(),
  zoomJoinUrl: z.string().nullable(),
  attendanceMethods: z.array(z.string()),
});

export const ListAllUpcomingOutputSchema = z.array(UpcomingEventSchema);

// QR Code schemas
export const GenerateQRCodeInputSchema = z.object({
  eventId: z.string(),
  organizationId: z.string(),
  expiresInHours: z.number().optional().default(24),
});

export const GenerateQRCodeOutputSchema = z.object({
  id: z.string(),
  code: z.string(),
  expiresAt: z.date().nullable(),
});

export const GetEventQRCodeInputSchema = z.object({
  eventId: z.string(),
});

export const GetEventQRCodeOutputSchema = z.object({
  id: z.string(),
  code: z.string(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
}).nullable();

export const CheckInWithQRInputSchema = z.object({
  code: z.string(),
});

export const ScanMemberQRInputSchema = z.object({
  eventId: z.string(),
  memberId: z.string(),
  organizationId: z.string(),
});

// RSVP schemas
export const RsvpInputSchema = z.object({
  eventId: z.string(),
});

export const RsvpStatusSchema = z.object({
  rsvped: z.boolean(),
  rsvpedAt: z.date().nullable(),
  totalCount: z.number(),
});

export const RsvpRecordSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  memberId: z.string(),
  rsvpedAt: z.date(),
  memberName: z.string().nullable(),
  memberEmail: z.string().nullable(),
  memberImage: z.string().nullable(),
});

export const ListRsvpsInputSchema = z.object({
  eventId: z.string(),
});

export const ListRsvpsOutputSchema = z.object({
  rsvps: z.array(RsvpRecordSchema),
  count: z.number(),
});

