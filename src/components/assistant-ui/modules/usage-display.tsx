"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuiState } from "@assistant-ui/react";
import { orpc } from "@/lib/orpc/orpc-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  DAILY_INPUT_QUOTA,
  DAILY_OUTPUT_QUOTA,
  FALLBACK_DAILY_INPUT_QUOTA,
  FALLBACK_DAILY_OUTPUT_QUOTA,
} from "@/lib/ai/quota-constants";
import { useEffect, useRef, type FC } from "react";
import { toast } from "sonner";

const PRIMARY_TOTAL_QUOTA = DAILY_INPUT_QUOTA + DAILY_OUTPUT_QUOTA;
const FALLBACK_TOTAL_QUOTA = FALLBACK_DAILY_INPUT_QUOTA + FALLBACK_DAILY_OUTPUT_QUOTA;

export function useTokenUsage() {
  return useQuery({
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

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
};

const getBarColor = (percent: number): string => {
  if (percent > 85) return "bg-red-500";
  if (percent >= 65) return "bg-amber-500";
  return "bg-emerald-500";
};

type UsageDisplayProps = {
  className?: string;
  side?: "top" | "bottom" | "left" | "right";
};

const UsageDisplay: FC<UsageDisplayProps> = ({ className, side = "bottom" }) => {
  const { data: usage } = useTokenUsage();
  useInvalidateUsageOnRunEnd();

  const onFallback = usage
    ? usage.today.primary.inputTokens >= DAILY_INPUT_QUOTA ||
      usage.today.primary.outputTokens + usage.today.primary.reasoningTokens >= DAILY_OUTPUT_QUOTA
    : false;
  const prevOnFallback = useRef<boolean | null>(null);

  useEffect(() => {
    if (prevOnFallback.current === false && onFallback) {
      toast("Switched to lite model", {
        description: "Your standard quota is used up for today. Responses will continue on the lite model.",
        duration: 6000,
      });
    }
    prevOnFallback.current = onFallback;
  }, [onFallback]);

  if (!usage) return null;

  const primaryInput = usage.today.primary.inputTokens;
  const primaryOutput = usage.today.primary.outputTokens + usage.today.primary.reasoningTokens;
  const fallbackInput = usage.today.fallback.inputTokens;
  const fallbackOutput = usage.today.fallback.outputTokens + usage.today.fallback.reasoningTokens;

  const primaryInputPct = Math.min((primaryInput / DAILY_INPUT_QUOTA) * 100, 100);
  const primaryOutputPct = Math.min((primaryOutput / DAILY_OUTPUT_QUOTA) * 100, 100);
  const fallbackInputPct = Math.min((fallbackInput / FALLBACK_DAILY_INPUT_QUOTA) * 100, 100);
  const fallbackOutputPct = Math.min((fallbackOutput / FALLBACK_DAILY_OUTPUT_QUOTA) * 100, 100);

  // Bar reflects the most-exhausted dimension of the active tier (matches exhaustion logic)
  const activeInput = onFallback ? fallbackInput : primaryInput;
  const activeOutput = onFallback ? fallbackOutput : primaryOutput;
  const activeTotalUsed = activeInput + activeOutput;
  const percent = onFallback
    ? Math.max(fallbackInputPct, fallbackOutputPct)
    : Math.max(primaryInputPct, primaryOutputPct);

  const now = new Date();
  const todayLabel = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const nextMidnightUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const msUntilReset = nextMidnightUTC.getTime() - now.getTime();
  const hUntil = Math.floor(msUntilReset / 3_600_000);
  const mUntil = Math.floor((msUntilReset % 3_600_000) / 60_000);
  const resetLabel = hUntil > 0 ? `${hUntil}h ${mUntil}m` : `${mUntil}m`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-slot="usage-display-trigger"
          aria-label="Token usage"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors",
            className,
          )}
        >
          {onFallback && (
            <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-medium text-amber-600 dark:text-amber-400">
              lite
            </span>
          )}
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full transition-all duration-300", getBarColor(percent))}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {fmt(activeTotalUsed)} ({Math.round(percent)}%)
            </span>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side={side}
        sideOffset={8}
        className="[&_span>svg]:hidden! rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md"
      >
        <div className="grid min-w-56 gap-3 text-xs">

          {/* Primary tier */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="font-medium">
                Standard model
                {!onFallback && <span className="ml-1.5 text-[9px] font-normal text-emerald-500">active</span>}
                {onFallback && <span className="ml-1.5 text-[9px] font-normal text-muted-foreground">exhausted</span>}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground">Input</span>
              <span className="flex items-center gap-2 font-mono tabular-nums">
                <span>{fmt(primaryInput)} / {fmt(DAILY_INPUT_QUOTA)}</span>
                <span className="w-7 text-right text-muted-foreground">{Math.round(primaryInputPct)}%</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground">Output</span>
              <span className="flex items-center gap-2 font-mono tabular-nums">
                <span>{fmt(primaryOutput)} / {fmt(DAILY_OUTPUT_QUOTA)}</span>
                <span className="w-7 text-right text-muted-foreground">{Math.round(primaryOutputPct)}%</span>
              </span>
            </div>
            {usage.today.primary.reasoningTokens > 0 && (
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground pl-3">↳ reasoning</span>
                <span className="font-mono tabular-nums text-muted-foreground">{fmt(usage.today.primary.reasoningTokens)}</span>
              </div>
            )}
          </div>

          {/* Fallback tier */}
          <div className="grid gap-1.5 border-t pt-2">
            <div className="flex items-center justify-between gap-6">
              <span className="font-medium">
                Lite model
                {onFallback && <span className="ml-1.5 text-[9px] font-normal text-amber-500">active</span>}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground">Input</span>
              <span className="flex items-center gap-2 font-mono tabular-nums">
                <span>{fmt(fallbackInput)} / {fmt(FALLBACK_DAILY_INPUT_QUOTA)}</span>
                <span className="w-7 text-right text-muted-foreground">{Math.round(fallbackInputPct)}%</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground">Output</span>
              <span className="flex items-center gap-2 font-mono tabular-nums">
                <span>{fmt(fallbackOutput)} / {fmt(FALLBACK_DAILY_OUTPUT_QUOTA)}</span>
                <span className="w-7 text-right text-muted-foreground">{Math.round(fallbackOutputPct)}%</span>
              </span>
            </div>
            {usage.today.fallback.reasoningTokens > 0 && (
              <div className="flex items-center justify-between gap-6">
                <span className="text-muted-foreground pl-3">↳ reasoning</span>
                <span className="font-mono tabular-nums text-muted-foreground">{fmt(usage.today.fallback.reasoningTokens)}</span>
              </div>
            )}
          </div>

          {/* Date + reset footer */}
          <div className="flex items-center justify-between gap-6 border-t pt-2">
            <span className="text-muted-foreground">{todayLabel}</span>
            <span className="text-muted-foreground">resets in {resetLabel}</span>
          </div>

        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export { UsageDisplay };
