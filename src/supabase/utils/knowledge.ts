import { orpc } from "@/lib/orpc/orpc-client";

export async function fetchChunksForSource(
  ids: string[],
  path: string,
): Promise<{ chunks: { id: string; content: string }[]; downloadUrl: string | null }> {
  try {
    return await orpc.knowledge.getChunks({ ids, path });
  } catch (err) {
    console.error("[RAG] Failed to fetch chunks:", err);
    return { chunks: [], downloadUrl: null };
  }
}
