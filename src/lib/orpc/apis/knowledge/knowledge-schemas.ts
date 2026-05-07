import { z } from "zod/v3";

export const GetChunksInputSchema = z.object({
  ids: z.array(z.string().uuid()),
  path: z.string(),
});

export const ChunkSchema = z.object({
  id: z.string(),
  content: z.string(),
});

export const GetChunksOutputSchema = z.object({
  chunks: z.array(ChunkSchema),
  downloadUrl: z.string().nullable(),
});
