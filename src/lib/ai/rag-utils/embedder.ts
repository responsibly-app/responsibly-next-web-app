import { embedMany, embed } from "ai";
import { embeddingModel } from "~/src/lib/ai/models";

const BATCH_SIZE = 20; // embedding rate limit is generous, but batching keeps memory low

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = embeddingModel;
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const { embeddings } = await embedMany({ model, values: batch });
    vectors.push(...embeddings);
  }

  return vectors;
}

export async function embedOne(text: string): Promise<number[]> {
  const model = embeddingModel;
  const { embedding } = await embed({ model, value: text });
  return embedding;
}
