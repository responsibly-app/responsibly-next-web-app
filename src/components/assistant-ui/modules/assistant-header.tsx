"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuiState } from "@assistant-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

interface TokenUsageData {
  inputTokens: number;
  outputTokens: number;
  inputQuota: number;
  outputQuota: number;
  month: string;
}

function useTokenUsage() {
  return useQuery<TokenUsageData>({
    queryKey: ["token-usage"],
    queryFn: async () => {
      const res = await fetch("/api/token-usage");
      if (!res.ok) throw new Error("Failed to fetch token usage");
      return res.json();
    },
    staleTime: 10_000,
  });
}

function useInvalidateUsageOnRunEnd() {
  const queryClient = useQueryClient();
  const isRunning = useAuiState((s) => s.thread.isRunning);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (wasRunning.current && !isRunning) {
      queryClient.invalidateQueries({ queryKey: ["token-usage"] });
    }
    wasRunning.current = isRunning;
  }, [isRunning, queryClient]);
}

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircularUsage({ used, quota, label }: { used: number; quota: number; label: string }) {
  const pct = Math.min((used / quota) * 100, 100);
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  const isNearLimit = pct >= 80;
  const isAtLimit = pct >= 100;
  const textColor = isAtLimit
    ? "text-destructive"
    : isNearLimit
      ? "text-yellow-500"
      : "text-foreground";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1.5 cursor-default select-none">
          <div className="relative size-9">
            <svg className="size-9 -rotate-90" viewBox="0 0 34 34">
              <circle
                cx="17"
                cy="17"
                r={RADIUS}
                fill="none"
                strokeWidth="3"
                className="stroke-muted-foreground/20"
              />
              <circle
                cx="17"
                cy="17"
                r={RADIUS}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={offset}
                className="stroke-primary transition-all duration-500"
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-[9px] font-semibold tabular-nums leading-none ${textColor}`}
            >
              {Math.round(pct)}%
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground leading-none">{label}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {used.toLocaleString()} / {quota.toLocaleString()} tokens
      </TooltipContent>
    </Tooltip>
  );
}

export function AssistantHeader() {
  const { data: usage } = useTokenUsage();
  useInvalidateUsageOnRunEnd();

  return (
    <header className="bg-background/60 sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 backdrop-blur-md">
      <SidebarTrigger />
      {usage && (
        <div className="flex items-center gap-3">
          <CircularUsage used={usage.inputTokens} quota={usage.inputQuota} label="In" />
          <CircularUsage used={usage.outputTokens} quota={usage.outputQuota} label="Out" />
        </div>
      )}
    </header>
  );
}
