/**
 * Delta-sync knowledge files from Supabase Storage → vector DB.
 *
 * Run from project root:
 *   npx tsx scripts/sync-knowledge.ts
 *
 * Loads .env.local automatically. Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_SECRET_KEY
 *   AZURE_EMBEDDING_RESOURCE_NAME
 *   AZURE_EMBEDDING_API_KEY
 *   AZURE_EMBEDDING_API_VERSION  (optional, defaults to 2024-02-01)
 */

import * as dotenv from "dotenv";
dotenv.config({ path: process.env.DOTENV_PATH ?? ".env.local" });

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { parseFile } from "../src/lib/rag/parser";
import { chunkText } from "../src/lib/rag/chunker";
import { embedBatch } from "../src/lib/rag/embedder";
import type { StorageFile } from "../src/lib/rag/types";

const BUCKET = "knowledge-base";
const SUPPORTED_TYPES = new Set(["md", "mdx", "pdf", "json", "txt", "docx"]);
// Supabase Storage mimetypes for files to skip entirely
const SKIP_MIMETYPES = /^(image|video|audio)\//;

// ─── Storage helpers ──────────────────────────────────────────────────────────

async function listAllFiles(supabase: SupabaseClient, prefix?: string): Promise<StorageFile[]> {
  const { data, error } = await supabase.storage.from(BUCKET).list(prefix, {
    limit: 1000,
    sortBy: { column: "name", order: "asc" },
  });

  if (error) throw new Error(`Storage list failed at "${prefix ?? "(root)"}": ${error.message}`);
  if (!data || data.length === 0) return [];

  const files: StorageFile[] = [];

  for (const item of data) {
    const fullPath = prefix ? `${prefix}/${item.name}` : item.name;

    // Supabase represents folders as items with no metadata (id may or may not be null)
    const isFolder = !item.metadata || item.id === null;

    if (isFolder) {
      files.push(...(await listAllFiles(supabase, fullPath)));
    } else {
      const mimetype: string = (item.metadata as Record<string, string>)?.mimetype ?? "";
      if (SKIP_MIMETYPES.test(mimetype)) continue;

      const ext = item.name.split(".").pop()?.toLowerCase() ?? "";
      if (!SUPPORTED_TYPES.has(ext)) continue;

      files.push({
        path: fullPath,
        updated_at: item.updated_at ?? item.created_at ?? new Date().toISOString(),
        size: (item.metadata as Record<string, number>)?.size ?? 0,
        mimetype,
      });
    }
  }

  return files;
}

// ─── Source tracking helpers ──────────────────────────────────────────────────

interface KnowledgeSource {
  id: string;
  storage_path: string;
  storage_updated_at: string;
}

async function loadSources(supabase: SupabaseClient): Promise<Map<string, KnowledgeSource>> {
  const { data, error } = await supabase.from("knowledge_sources").select("id, storage_path, storage_updated_at");
  if (error) throw new Error(`Failed to load knowledge_sources: ${error.message}`);

  return new Map((data ?? []).map((s: KnowledgeSource) => [s.storage_path, s]));
}

async function deleteSource(supabase: SupabaseClient, id: string) {
  // Cascades to knowledge_chunks via FK
  const { error } = await supabase.from("knowledge_sources").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete source ${id}: ${error.message}`);
}

// ─── Ingestion ────────────────────────────────────────────────────────────────

/** Extract topic from the first folder segment: "objection-handling/file.md" → "objection-handling" */
function topicFromPath(storagePath: string): string {
  const parts = storagePath.split("/");
  return parts.length > 1 ? parts[0] : "general";
}

async function ingestFile(supabase: SupabaseClient, file: StorageFile) {
  console.log(`  → Ingesting: ${file.path}`);

  // 1. Download
  const { data: blob, error: downloadError } = await supabase.storage
    .from(BUCKET)
    .download(file.path);

  if (downloadError || !blob) {
    throw new Error(`Download failed for "${file.path}": ${downloadError?.message}`);
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  const filename = file.path.split("/").pop()!;
  const topic = topicFromPath(file.path);

  // 2. Parse
  const parsed = await parseFile(filename, buffer);
  if (parsed.length === 0) {
    console.log(`     Skipped (no content extracted)`);
    return;
  }

  // 3. Chunk
  const chunks = chunkText(parsed);
  if (chunks.length === 0) {
    console.log(`     Skipped (no chunks produced)`);
    return;
  }

  // 4. Embed
  const texts = chunks.map((c) => c.text);
  const vectors = await embedBatch(texts);

  // 5. Upsert source record first (we need its id)
  const { data: sourceRows, error: sourceError } = await supabase
    .from("knowledge_sources")
    .upsert(
      {
        storage_path: file.path,
        storage_updated_at: file.updated_at,
        file_size: file.size,
        chunk_count: chunks.length,
        indexed_at: new Date().toISOString(),
      },
      { onConflict: "storage_path" },
    )
    .select("id");

  if (sourceError || !sourceRows?.[0]) {
    throw new Error(`Failed to upsert source for "${file.path}": ${sourceError?.message}`);
  }

  const sourceId: string = sourceRows[0].id;

  // 6. Delete old chunks for this source (re-indexing a modified file)
  await supabase.from("knowledge_chunks").delete().eq("source_id", sourceId);

  // 7. Insert new chunks with embeddings
  const rows = chunks.map((chunk, i) => ({
    source_id: sourceId,
    content: chunk.text,
    embedding: vectors[i],
    chunk_index: chunk.chunkIndex,
    metadata: {
      topic,
      ...(chunk.heading ? { heading: chunk.heading } : {}),
      ...(chunk.page !== undefined ? { page: chunk.page } : {}),
    },
  }));

  // Insert in batches to avoid payload size limits
  const INSERT_BATCH = 50;
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const { error: insertError } = await supabase
      .from("knowledge_chunks")
      .insert(rows.slice(i, i + INSERT_BATCH));

    if (insertError) {
      throw new Error(`Chunk insert failed for "${file.path}": ${insertError.message}`);
    }
  }

  console.log(`     ✓ ${chunks.length} chunks indexed (topic: ${topic})`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

  console.log(supabaseUrl, supabaseKey);

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SECRET_KEY in .env.local");
  }
  if (!process.env.AZURE_FOUNDRY_RESOURCE_NAME || !process.env.AZURE_FOUNDRY_API_KEY) {
    throw new Error("Missing AZURE_FOUNDRY_RESOURCE_NAME or AZURE_FOUNDRY_API_KEY in .env.local");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log(`\nSyncing knowledge base from bucket "${BUCKET}"...\n`);

  // 1. Discover current storage state
  const storageFiles = await listAllFiles(supabase);
  const storageMap = new Map(storageFiles.map((f) => [f.path, f]));
  console.log(`Found ${storageFiles.length} supported file(s) in storage.`);

  // 2. Load existing index state
  const sourcesMap = await loadSources(supabase);

  const stats = { added: 0, updated: 0, removed: 0, skipped: 0 };

  // 3. Remove deleted files
  for (const [path, source] of sourcesMap) {
    if (!storageMap.has(path)) {
      console.log(`  ✗ Removing index for deleted file: ${path}`);
      await deleteSource(supabase, source.id);
      stats.removed++;
    }
  }

  // 4. Add or update changed files
  for (const file of storageFiles) {
    const existing = sourcesMap.get(file.path);

    if (!existing) {
      // New file
      await ingestFile(supabase, file);
      stats.added++;
    } else if (new Date(file.updated_at) > new Date(existing.storage_updated_at)) {
      // Modified file
      console.log(`  ↺ Re-indexing modified file: ${file.path}`);
      await ingestFile(supabase, file);
      stats.updated++;
    } else {
      stats.skipped++;
    }
  }

  console.log(`
─────────────────────────────
  Added:   ${stats.added}
  Updated: ${stats.updated}
  Removed: ${stats.removed}
  Skipped: ${stats.skipped} (unchanged)
─────────────────────────────
`);
}

main().catch((err) => {
  console.error("\n[sync-knowledge] Fatal error:", err.message);
  process.exit(1);
});
