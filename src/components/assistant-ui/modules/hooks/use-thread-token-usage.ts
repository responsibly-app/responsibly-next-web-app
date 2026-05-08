"use client";

import { useAuiState } from "@assistant-ui/react";
import { getThreadMessageTokenUsage } from "@assistant-ui/react-ai-sdk";
import { useEffect, useRef, useState } from "react";

// "latest" — shows only the last assistant message's token usage
// "total"  — sums token usage across all assistant messages in the thread
export const THREAD_TOKEN_USAGE_MODE: "latest" | "total" = "total";

export type ThreadTokenUsage = {
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuiMessage = any;

function computeUsageFromMessages(messages: AuiMessage[]): ThreadTokenUsage | undefined {
  if (THREAD_TOKEN_USAGE_MODE === "latest") {
    for (let i = messages.length - 1; i >= 0; i--) {
      const u = getThreadMessageTokenUsage(messages[i]) as ThreadTokenUsage | undefined;
      if (u) return u;
    }
    return undefined;
  }

  let inputTokens = 0, outputTokens = 0, totalTokens = 0, reasoningTokens = 0, cachedInputTokens = 0;
  let hasUsage = false;
  for (const msg of messages) {
    const u = getThreadMessageTokenUsage(msg) as ThreadTokenUsage | undefined;
    if (!u) continue;
    hasUsage = true;
    inputTokens += u.inputTokens ?? 0;
    outputTokens += u.outputTokens ?? 0;
    totalTokens += u.totalTokens ?? 0;
    reasoningTokens += u.reasoningTokens ?? 0;
    cachedInputTokens += u.cachedInputTokens ?? 0;
  }
  return hasUsage ? { inputTokens, outputTokens, totalTokens, reasoningTokens, cachedInputTokens } : undefined;
}

export function useThreadTotalTokenUsage(): ThreadTokenUsage | undefined {
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const isRunning = useAuiState((s) => s.thread.isRunning);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages = useAuiState((s) => (s.thread as any).messages as AuiMessage[]);

  const [usage, setUsage] = useState<ThreadTokenUsage | undefined>(undefined);
  const wasRunningRef = useRef(false);

  // Reset immediately on thread switch
  useEffect(() => {
    setUsage(undefined);
    wasRunningRef.current = false;
  }, [remoteId]);

  // Recompute from in-memory messages whenever run state or messages change
  useEffect(() => {
    if (isRunning) {
      wasRunningRef.current = true;
      setUsage(undefined);
      return;
    }
    // console.log("[token-usage] messages:", JSON.parse(JSON.stringify(messages ?? [])));
    // console.log("[token-usage] per-message usage:", messages?.map((m: AuiMessage) => ({ role: m?.role, usage: getThreadMessageTokenUsage(m) })));
    const computed = computeUsageFromMessages(messages);
    // console.log("[token-usage] computed:", computed);
    setUsage(computed);
    wasRunningRef.current = false;
  }, [isRunning, messages]);

  return usage;
}
