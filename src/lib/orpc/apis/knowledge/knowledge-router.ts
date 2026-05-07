import { authed } from "@/lib/orpc/base";
import { supabase } from "@/supabase/client";
import { GetChunksInputSchema, GetChunksOutputSchema } from "./knowledge-schemas";

const KNOWLEDGE_BUCKET = "knowledge-base";
const SIGNED_URL_TTL = 3600;

export const knowledgeRouter = {
  getChunks: authed
    .route({ method: "POST", path: "/knowledge/chunks", summary: "Fetch knowledge chunks by IDs with download URL", tags: ["Knowledge"] })
    .input(GetChunksInputSchema)
    .output(GetChunksOutputSchema)
    .handler(async ({ input }) => {
      const [chunksResult, signedUrlResult] = await Promise.all([
        input.ids.length > 0
          ? supabase.from("knowledge_chunks").select("id, content").in("id", input.ids)
          : Promise.resolve({ data: [], error: null }),
        supabase.storage.from(KNOWLEDGE_BUCKET).createSignedUrl(input.path, SIGNED_URL_TTL),
      ]);

      if (chunksResult.error) {
        console.error("[RAG] chunk fetch error:", chunksResult.error.message);
      }

      return {
        chunks: (chunksResult.data ?? []) as { id: string; content: string }[],
        downloadUrl: signedUrlResult.data?.signedUrl ?? null,
      };
    }),
};
