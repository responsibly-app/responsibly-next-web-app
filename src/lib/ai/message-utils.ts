import type { UIMessage } from "ai";
import { logDedup } from "./logger";

// If two assistant messages share tool-call IDs (partial + full), drop the partial.
// This happens when sendAutomaticallyWhen triggers a second POST: the first stream
// saved a partial message, and the second stream saves a full message that re-includes
// those same tool calls. Sending both causes the model to see them twice.
export function deduplicateMessages(messages: UIMessage[]): UIMessage[] {
  const getToolCallIds = (msg: UIMessage): Set<string> => {
    const ids = new Set<string>();
    for (const part of msg.parts) {
      const p = part as Record<string, unknown>;
      if (typeof p.toolCallId === "string") ids.add(p.toolCallId);
    }
    return ids;
  };

  return messages.filter((msg, i) => {
    if (msg.role !== "assistant") return true;
    const myIds = getToolCallIds(msg);
    if (myIds.size === 0) return true;

    const subsumed = messages.slice(i + 1).some((later) => {
      if (later.role !== "assistant") return false;
      const laterIds = getToolCallIds(later);
      return [...myIds].every((id) => laterIds.has(id));
    });

    if (subsumed) {
      logDedup(myIds.size);
    }
    return !subsumed;
  });
}

// Azure Responses API assigns itemIds to function calls. Re-sending those IDs
// in subsequent turns causes "Duplicate item" errors, so we strip them here.
export function stripCallProviderMetadata(messages: UIMessage[]): UIMessage[] {
  return messages.map((msg) => ({
    ...msg,
    parts: msg.parts.map((part) => {
      if (["callProviderMetadata", "providerMetadata", "resultProviderMetadata"].some((k) => k in part)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { callProviderMetadata: _a, providerMetadata: _b, resultProviderMetadata: _c, ...rest } = part as typeof part & { callProviderMetadata?: unknown; providerMetadata?: unknown; resultProviderMetadata?: unknown };
        return rest;
      }
      return part;
    }),
  }));
}
