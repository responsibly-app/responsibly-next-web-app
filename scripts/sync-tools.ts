/**
 * Sync tool descriptions → vector index in Supabase.
 *
 * Run from project root:
 *   npm run tools:sync:dev
 *   npm run tools:sync:prod
 *
 * What it does:
 *   - Embeds each tool's description from tool-registry.ts
 *   - Upserts changed entries in the `tool_index` table (skips unchanged)
 *   - Deletes rows for tools no longer in the registry
 *
 * Requires sql/tool-index-setup.sql to have been run in Supabase first.
 */

import * as dotenv from "dotenv";
dotenv.config({ path: process.env.DOTENV_PATH ?? ".env.local" });

import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface IndexedTool {
  tool_name: string;
  description: string;
}

async function loadIndexedTools(supabase: SupabaseClient): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("tool_index")
    .select("tool_name, description");

  if (error) throw new Error(`Failed to load tool_index: ${error.message}`);

  return new Map((data ?? []).map((r: IndexedTool) => [r.tool_name, r.description]));
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_SECRET_KEY");
  }
  if (!process.env.AZURE_FOUNDRY_RESOURCE_NAME || !process.env.AZURE_FOUNDRY_API_KEY) {
    throw new Error("Missing AZURE_FOUNDRY_RESOURCE_NAME or AZURE_FOUNDRY_API_KEY");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const [{ embedBatch }, { allToolMeta }] = await Promise.all([
    import("../src/lib/ai/rag-utils/embedder"),
    import("../src/lib/ai/ai-tools/tool-registry"),
  ]);

  console.log(`\nSyncing tool index (${allToolMeta.length} tools registered)...\n`);

  const indexed = await loadIndexedTools(supabase);
  const registryNames = new Set(allToolMeta.map((m) => m.name));

  const stats = { added: 0, updated: 0, removed: 0, skipped: 0 };

  // Remove tools that no longer exist in the registry
  for (const [name] of indexed) {
    if (!registryNames.has(name)) {
      const { error } = await supabase.from("tool_index").delete().eq("tool_name", name);
      if (error) throw new Error(`Failed to delete tool "${name}": ${error.message}`);
      console.log(`  ✗ Removed: ${name}`);
      stats.removed++;
    }
  }

  // Identify tools that need embedding (new or embeddingDescription changed)
  const toEmbed = allToolMeta.filter((m) => {
    const existing = indexed.get(m.name);
    if (!existing) return true;                          // new tool
    return existing !== m.embeddingDescription;          // embedding text changed
  });

  const toSkip = allToolMeta.filter((m) => {
    const existing = indexed.get(m.name);
    return existing === m.embeddingDescription;
  });

  for (const m of toSkip) {
    console.log(`  · Skipped (unchanged): ${m.name}`);
    stats.skipped++;
  }

  if (toEmbed.length === 0) {
    console.log("\nAll tools already up to date.");
  } else {
    console.log(`\nEmbedding ${toEmbed.length} tool(s)...`);

    const texts = toEmbed.map((m) => `${m.name}: ${m.embeddingDescription}`);
    const vectors = await embedBatch(texts);

    const rows = toEmbed.map((m, i) => ({
      tool_name: m.name,
      description: m.embeddingDescription,
      embedding: vectors[i],
      synced_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("tool_index")
      .upsert(rows, { onConflict: "tool_name" });

    if (error) throw new Error(`Upsert failed: ${error.message}`);

    for (const m of toEmbed) {
      const isNew = !indexed.has(m.name);
      if (isNew) {
        console.log(`  ✓ Added: ${m.name}`);
        stats.added++;
      } else {
        console.log(`  ↺ Updated: ${m.name}`);
        stats.updated++;
      }
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
  console.error("\n[sync-tools] Fatal error:", err.message);
  process.exit(1);
});
