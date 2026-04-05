import { z } from "zod/v3";

export const TelegramStatusOutputSchema = z.object({
  connected: z.boolean(),
  telegramUsername: z.string().nullable().optional(),
  telegramFirstName: z.string().nullable().optional(),
  telegramPhotoUrl: z.string().nullable().optional(),
});

export const TelegramInitiateOutputSchema = z.object({
  url: z.string(),
});

const TelegramFromSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
}).passthrough();

const TelegramMessageSchema = z.object({
  from: TelegramFromSchema.optional(),
  text: z.string().optional(),
}).passthrough();

export const TelegramUpdateSchema = z.object({
  update_id: z.number().optional(),
  message: TelegramMessageSchema.optional(),
}).passthrough();
