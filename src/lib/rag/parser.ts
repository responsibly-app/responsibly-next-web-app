import type { TextChunk } from "./types";

// ─── Markdown ────────────────────────────────────────────────────────────────

export function parseMarkdown(content: string): TextChunk[] {
  // Strip YAML frontmatter
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n?/, "");

  const chunks: TextChunk[] = [];
  let currentHeading: string | undefined;
  let buffer: string[] = [];

  for (const line of withoutFrontmatter.split("\n")) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (buffer.length > 0) {
        chunks.push({ text: buffer.join("\n").trim(), heading: currentHeading });
        buffer = [];
      }
      currentHeading = headingMatch[1].trim();
    } else {
      buffer.push(line);
    }
  }

  if (buffer.length > 0) {
    chunks.push({ text: buffer.join("\n").trim(), heading: currentHeading });
  }

  return chunks.filter((c) => c.text.length > 0);
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export async function parsePDF(buffer: Buffer): Promise<TextChunk[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfParseModule: any = await import("pdf-parse");
  const pdfParse: (buf: Buffer) => Promise<{ text: string; numpages: number }> =
    pdfParseModule.default ?? pdfParseModule;
  const data = await pdfParse(buffer);

  // pdf-parse gives us full text; we split by form-feed or double-newline as page proxy
  const pages = data.text.split(/\f/).filter((p: string) => p.trim().length > 0);

  if (pages.length > 1) {
    return pages.map((page: string, i: number) => ({ text: page.trim(), page: i + 1 }));
  }

  // Fallback: single blob — return as one chunk so the chunker can split it
  return [{ text: data.text.trim() }];
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

function extractStrings(value: unknown, path: string[] = []): string[] {
  if (typeof value === "string" && value.trim().length > 20) {
    return [`${path.join(".")}: ${value.trim()}`];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => extractStrings(item, [...path, String(i)]));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([k, v]) =>
      extractStrings(v, [...path, k]),
    );
  }
  return [];
}

export function parseJSON(content: string): TextChunk[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    return [{ text: content.trim() }];
  }

  const lines = extractStrings(parsed);
  if (lines.length === 0) return [];

  // Group into chunks of ~30 key-value lines
  const GROUP = 30;
  const chunks: TextChunk[] = [];
  for (let i = 0; i < lines.length; i += GROUP) {
    chunks.push({ text: lines.slice(i, i + GROUP).join("\n") });
  }
  return chunks;
}

// ─── DOCX ─────────────────────────────────────────────────────────────────────

export async function parseDocx(buffer: Buffer): Promise<TextChunk[]> {
  const mammoth = await import("mammoth");
  const { value: rawText } = await mammoth.extractRawText({ buffer });

  if (!rawText.trim()) return [];

  // Split on double newlines (paragraph breaks mammoth preserves)
  const sections = rawText
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sections.map((text) => ({ text }));
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export async function parseFile(filename: string, data: Buffer): Promise<TextChunk[]> {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "md":
    case "mdx":
      return parseMarkdown(data.toString("utf-8"));
    case "pdf":
      return parsePDF(data);
    case "json":
      return parseJSON(data.toString("utf-8"));
    case "txt":
      return [{ text: data.toString("utf-8").trim() }];
    case "docx":
      return parseDocx(data);
    default:
      return [];
  }
}
