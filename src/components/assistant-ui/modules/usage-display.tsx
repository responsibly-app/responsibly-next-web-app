"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuiState } from "@assistant-ui/react";
import { orpc } from "@/lib/orpc/orpc-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useEffect, useRef, type FC } from "react";

const INPUT_TOKEN_QUOTA = 1_000_000;
const OUTPUT_TOKEN_QUOTA = 1_000_000;
const TOTAL_QUOTA = INPUT_TOKEN_QUOTA + OUTPUT_TOKEN_QUOTA;

interface TokenUsageData {
  inputTokens: number;
  outputTokens: number;
  month: string;
}

export function useTokenUsage() {
  return useQuery<TokenUsageData>({
    queryKey: ["token-usage"],
    queryFn: () => orpc.chat.getTokenUsage({}),
    staleTime: 10_000,
  });
}

export function useInvalidateUsageOnRunEnd() {
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

const formatTokenCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
};

const getUsageSeverity = (percent: number) => {
  if (percent > 85) return "critical";
  if (percent >= 65) return "warning";
  return "normal";
};

const getBarColor = (percent: number): string => {
  const s = getUsageSeverity(percent);
  if (s === "critical") return "bg-red-500";
  if (s === "warning") return "bg-amber-500";
  return "bg-emerald-500";
};

type UsageDisplayProps = {
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
};

const UsageDisplay: FC<UsageDisplayProps> = ({ className, side = "bottom" }) => {
  const { data: usage } = useTokenUsage();
  useInvalidateUsageOnRunEnd();

  if (!usage) return null;

  const totalUsed = usage.inputTokens + usage.outputTokens;
  const percent = Math.min((totalUsed / TOTAL_QUOTA) * 100, 100);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot="usage-display-trigger"
          aria-label="Token usage"
          className={cn(
            "inline-flex items-center rounded-md px-2 py-1 transition-colors",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  getBarColor(percent),
                )}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {formatTokenCount(totalUsed)} ({Math.round(percent)}%)
            </span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={8}
        className="[&_span>svg]:hidden! rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md"
      >
        <div className="grid min-w-48 gap-2 text-xs">
          <div className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground">Usage</span>
            <span className="font-mono tabular-nums font-medium">{Math.round(percent)}%</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground">Input</span>
            <span className="flex items-center gap-2 font-mono tabular-nums">
              <span>{formatTokenCount(usage.inputTokens)} / {formatTokenCount(INPUT_TOKEN_QUOTA)}</span>
              <span className="w-7 text-right text-muted-foreground">{Math.round((usage.inputTokens / INPUT_TOKEN_QUOTA) * 100)}%</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground">Output</span>
            <span className="flex items-center gap-2 font-mono tabular-nums">
              <span>{formatTokenCount(usage.outputTokens)} / {formatTokenCount(OUTPUT_TOKEN_QUOTA)}</span>
              <span className="w-7 text-right text-muted-foreground">{Math.round((usage.outputTokens / OUTPUT_TOKEN_QUOTA) * 100)}%</span>
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono tabular-nums font-medium">
                {formatTokenCount(totalUsed)} / {formatTokenCount(TOTAL_QUOTA)}
              </span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export { UsageDisplay };
