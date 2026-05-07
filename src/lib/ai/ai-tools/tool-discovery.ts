import { createClient } from "@supabase/supabase-js";
import { embedOne } from "~/src/lib/ai/rag-utils/embedder";
import { allToolMeta } from "./tool-registry";

const SIMILARITY_THRESHOLD = 0.3;
const TOP_K = 5;
// Messages shorter than this are conversational — no tools needed
const MIN_QUERY_LENGTH = 5;

function supabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY!,
  );
}

/**
 * Returns the names of tools semantically relevant to the user's message.
 * Empty array means no tools (short/conversational message).
 * Falls back to all registered tools if the index is unavailable.
 */
export async function discoverToolNames(userMessage: string): Promise<string[]> {
  if (userMessage.trim().length < MIN_QUERY_LENGTH) return [];

  try {
    const embedding = await embedOne(userMessage);
    const supabase = supabaseClient();

    const { data, error } = await supabase.rpc("match_tools", {
      query_embedding: embedding,
      match_count: TOP_K,
      match_threshold: SIMILARITY_THRESHOLD,
    });

    if (error) throw new Error(error.message);

    const names: string[] = (data ?? []).map((r: { tool_name: string }) => r.tool_name);

    const depMap = new Map<string, readonly string[]>();
    for (const m of allToolMeta) depMap.set(m.name, m.deps ?? []);
    const withDeps = new Set(names);
    const queue = [...names];
    while (queue.length > 0) {
      const name = queue.shift()!;
      for (const dep of depMap.get(name) ?? []) {
        if (!withDeps.has(dep)) {
          withDeps.add(dep);
          queue.push(dep);
        }
      }
    }

    const result = [...withDeps];
    console.log(`[ToolDiscovery] selected ${result.length} tools for: "${userMessage.slice(0, 60)}"`);
    console.log(`[ToolDiscovery] selected ${result.join(", ")} tools for: "${userMessage.slice(0, 60)}"`);
    return result;
  } catch (err) {
    console.error("[ToolDiscovery] falling back to all tools:", err);
    return allToolMeta.map((m) => m.name);
  }
}
