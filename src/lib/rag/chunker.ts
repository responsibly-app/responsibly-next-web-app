import type { TextChunk } from "./types";

const CHUNK_CHARS = 2400; // ≈600 tokens
const OVERLAP_CHARS = 320; // ≈80 tokens

export interface Chunk {
  text: string;
  heading?: string;
  page?: number;
  chunkIndex: number;
}

export function chunkText(parsed: TextChunk[]): Chunk[] {
  const output: Chunk[] = [];
  let globalIndex = 0;

  for (const section of parsed) {
    const paragraphs = section.text
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    let buffer = "";

    const flush = (final = false) => {
      const trimmed = buffer.trim();
      if (trimmed.length === 0) return;

      output.push({
        text: trimmed,
        heading: section.heading,
        page: section.page,
        chunkIndex: globalIndex++,
      });

      // Carry over tail for overlap on next chunk
      if (!final) {
        buffer = trimmed.slice(-OVERLAP_CHARS);
      }
    };

    for (const para of paragraphs) {
      if (buffer.length + para.length + 2 > CHUNK_CHARS && buffer.length > 0) {
        flush();
      }
      buffer += (buffer.length > 0 ? "\n\n" : "") + para;
    }

    flush(true);
  }

  return output;
}
