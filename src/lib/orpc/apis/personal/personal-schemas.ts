import { z } from "zod/v3";

// ---- Invites ----

export const LogInvitesInputSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  count: z.number().int().min(0).max(9999),
});

export const DailyInviteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  date: z.string(),
  count: z.number(),
  updatedAt: z.date(),
});

export const GetInviteHistoryInputSchema = z.object({
  days: z.number().int().min(1).max(365).optional().default(90),
});

export const GetInviteHistoryOutputSchema = z.array(DailyInviteSchema);

// ---- Points ----

export const AddPointItemInputSchema = z.object({
  description: z.string().min(1),
  amount: z.number().int().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export const PointItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  description: z.string(),
  amount: z.number(),
  date: z.string(),
  createdAt: z.date(),
});

export const ListPointItemsOutputSchema = z.array(PointItemSchema);

export const DeletePointItemInputSchema = z.object({
  id: z.string(),
});

export const UpdatePointItemInputSchema = z.object({
  id: z.string(),
  description: z.string().min(1),
  amount: z.number().int().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export const GetPointsLeaderboardInputSchema = z.object({
  organizationId: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const PointsLeaderboardEntrySchema = z.object({
  memberId: z.string(),
  userId: z.string(),
  memberName: z.string().nullable(),
  memberEmail: z.string().nullable(),
  memberImage: z.string().nullable(),
  memberLevel: z.string().nullable(),
  totalPoints: z.number(),
  totalAmas: z.number(),
  totalInvites: z.number(),
});

export const GetPointsLeaderboardOutputSchema = z.array(PointsLeaderboardEntrySchema);

// ---- AMAs ----

export const AddAmaItemInputSchema = z.object({
  recruitName: z.string().min(1),
  agentCode: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

export const AmaItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  recruitName: z.string(),
  agentCode: z.string().nullable(),
  date: z.string(),
  createdAt: z.date(),
});

export const ListAmaItemsOutputSchema = z.array(AmaItemSchema);

export const DeleteAmaItemInputSchema = z.object({
  id: z.string(),
});

export const UpdateAmaItemInputSchema = z.object({
  id: z.string(),
  recruitName: z.string().min(1),
  agentCode: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
});

// ---- Member data (admin/org-member views) ----

export const GetMemberInviteHistoryInputSchema = z.object({
  organizationId: z.string(),
  targetUserId: z.string(),
  days: z.number().int().min(1).max(365).optional().default(90),
});

export const GetMemberPointsInputSchema = z.object({
  organizationId: z.string(),
  targetUserId: z.string(),
});

export const GetMemberAmasInputSchema = z.object({
  organizationId: z.string(),
  targetUserId: z.string(),
});
