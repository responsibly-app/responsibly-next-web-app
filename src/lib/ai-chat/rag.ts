import { buildContextBlock, retrieveChunks } from "@/lib/rag/retriever";

export async function getRAGContext(query: string): Promise<string> {
  if (query.length <= 10) return "";

  const chunks = await retrieveChunks(query);
  console.log(`[RAG] Retrieved ${chunks.length} chunks for query: "${query}"`);
  return buildContextBlock(chunks);
}
