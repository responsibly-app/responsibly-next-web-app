import { tool, zodSchema, generateImage as runGenerateImage } from "ai";
import { z } from "zod";
import { imageGenerationModel } from "@/lib/ai/models";
import { supabase } from "@/supabase/client";
import type { Session } from "@/lib/orpc/context";

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const meta = {
  name: "generate_image",
  description:
    "Generate an image from a text description using gpt-image-1-mini. After calling this tool, do NOT describe or embed the image in your response — the image is displayed automatically in the UI.",
  embeddingDescription:
    "Generate, create, or draw an image from a text description or prompt using AI. Use when the user asks to generate an image, create art, draw something, visualize a concept, illustrate an idea, or produce any visual from a text description.",
} as const;

export const generateImage = {
  meta,
  create(session: Session) {
    return tool({
      description: meta.description,
      inputSchema: zodSchema(
        z.object({
          prompt: z.string().describe("The prompt to generate the image from"),
          size: z
            .enum(["1024x1024", "1024x1536", "1536x1024"])
            .optional()
            .describe("Image dimensions. Default: 1024x1024"),
        }),
      ),
      execute: async ({ prompt, size = "1024x1024" }) => {
        let imageBytes: Uint8Array;
        let mimeType: string;

        try {
          const result = await runGenerateImage({
            model: imageGenerationModel,
            prompt,
            size,
          });
          imageBytes = result.image.uint8Array;
          mimeType = result.image.mediaType || "image/png";
        } catch (err: any) {
          return { error: err?.message ?? "Image generation failed." };
        }

        const ext = MIME_TO_EXT[mimeType] ?? "png";
        const path = `${session.user.id}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("chat-attachments")
          .upload(path, imageBytes, { contentType: mimeType, upsert: false });

        if (uploadError) {
          return { error: `Upload failed: ${uploadError.message}` };
        }

        const { data: urlData } = supabase.storage
          .from("chat-attachments")
          .getPublicUrl(path);

        return {
          prompt,
          publicUrl: urlData.publicUrl,
          _instructions:
            "Image generated. Do not describe or embed the image in your response — it is shown automatically in the UI.",
        };
      },
    });
  },
};
