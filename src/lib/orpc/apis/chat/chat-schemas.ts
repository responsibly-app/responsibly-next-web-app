import { z } from "zod/v3";

export const ThreadSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string().nullable(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ListThreadsInputSchema = z.object({
  limit: z.number().int().min(1).max(500).optional().default(10),
});

export const ListThreadsOutputSchema = z.array(ThreadSchema);

export const CreateThreadOutputSchema = z.object({
  id: z.string(),
});

export const GetThreadInputSchema = z.object({
  id: z.string(),
});

export const UpdateThreadInputSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  status: z.string().optional(),
});

export const DeleteThreadInputSchema = z.object({
  id: z.string(),
});

export const MessageSchema = z.object({
  id: z.string(),
  parent_id: z.string().nullable(),
  format: z.string(),
  content: z.record(z.unknown()),
});

export const ListMessagesInputSchema = z.object({
  threadId: z.string(),
});

export const ListMessagesOutputSchema = z.array(MessageSchema);

export const AddMessageInputSchema = z.object({
  threadId: z.string(),
  id: z.string(),
  parent_id: z.string().nullable(),
  format: z.string(),
  content: z.record(z.unknown()),
});

const MessagePartSchema = z.object({
  type: z.string(),
  text: z.string().optional(),
  filename: z.string().optional(),
});

const TitleMessageSchema = z.object({
  role: z.string(),
  content: z.array(MessagePartSchema),
});

export const GenerateTitleInputSchema = z.object({
  id: z.string(),
  messages: z.array(TitleMessageSchema),
});

export const GenerateTitleOutputSchema = z.object({
  title: z.string(),
});

export const TokenUsageOutputSchema = z.object({
  inputTokens: z.number(),
  outputTokens: z.number(),
  totalTokens: z.number(),
  inputQuota: z.number(),
  outputQuota: z.number(),
  month: z.string(),
});
