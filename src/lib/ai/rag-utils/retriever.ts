import { createClient } from "@supabase/supabase-js";
import { embedOne } from "./embedder";
import type { RetrievedChunk } from "./types";

const SIMILARITY_THRESHOLD = 0.3;
const TOP_K = 5;

function supabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!,
  );
}

export async function retrieveChunks(
  query: string,
  metadataFilter: Record<string, unknown> = {}
): Promise<RetrievedChunk[]> {
  const embedding = await embedOne(query);

  const supabase = supabaseClient();
  const { data, error } = await supabase.rpc("match_chunks", {
    query_embedding: embedding,
    match_count: TOP_K,
    match_threshold: SIMILARITY_THRESHOLD,
    filter_metadata: metadataFilter,
  });

  if (error) {
    console.error("[RAG] retrieval error:", error.message);
    return [];
  }

  return (data ?? []) as RetrievedChunk[];
}

export function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const sections = chunks
    .map((c) => {
      const label = c.topic ? `[${c.topic}] ${c.source_path}` : c.source_path;
      return `<source path="${label}">\n${c.content}\n</source>`;
    })
    .join("\n\n");

  return `--- KNOWLEDGE BASE CONTEXT ---\n${sections}\n--- END CONTEXT ---`;
}
