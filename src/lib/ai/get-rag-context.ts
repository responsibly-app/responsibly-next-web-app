import { buildContextBlock, retrieveChunks } from "@/lib/ai/rag-utils/retriever";
import type { RetrievedChunk } from "@/lib/ai/rag-utils/types";

export interface RAGResult {
  context: string;
  chunks: RetrievedChunk[];
}

export async function getRAGContext(query: string): Promise<RAGResult> {
  if (query.length <= 10) return { context: "", chunks: [] };

  const metadataFilter = {};

  const chunks = await retrieveChunks(query, metadataFilter);
  console.log(`[RAG] Retrieved ${chunks.length} chunks for query: "${query}"`);
  return { context: buildContextBlock(chunks), chunks };
}
