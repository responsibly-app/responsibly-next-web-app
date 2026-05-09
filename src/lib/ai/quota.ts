import { db } from "@/lib/db";
import { chatTokenUsage } from "@/lib/db/schema/chat-schema";
import type { LanguageModelUsage } from "ai";
import { and, eq, sql } from "drizzle-orm";
import {
  DAILY_INPUT_QUOTA,
  DAILY_OUTPUT_QUOTA,
  FALLBACK_DAILY_INPUT_QUOTA,
  FALLBACK_DAILY_OUTPUT_QUOTA,
  type ModelTier,
} from "./quota-constants";

export { DAILY_INPUT_QUOTA, DAILY_OUTPUT_QUOTA, FALLBACK_DAILY_INPUT_QUOTA, FALLBACK_DAILY_OUTPUT_QUOTA };
export type { ModelTier };

export function currentDate() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

export function currentMonthStart() {
  return currentDate().slice(0, 7) + "-01"; // "YYYY-MM-01"
}

function effectiveOutput(row: { outputTokens: number; reasoningTokens: number } | undefined) {
  return (row?.outputTokens ?? 0) + (row?.reasoningTokens ?? 0);
}

export async function resolveModelTier(userId: string): Promise<ModelTier | null> {
  const today = currentDate();
  const rows = await db
    .select()
    .from(chatTokenUsage)
    .where(and(eq(chatTokenUsage.userId, userId), eq(chatTokenUsage.date, today)));

  const primary = rows.find((r) => r.modelTier === "primary");
  const fallback = rows.find((r) => r.modelTier === "fallback");

  const primaryExhausted =
    (primary?.inputTokens ?? 0) >= DAILY_INPUT_QUOTA ||
    effectiveOutput(primary) >= DAILY_OUTPUT_QUOTA;

  if (!primaryExhausted) return "primary";

  const fallbackExhausted =
    (fallback?.inputTokens ?? 0) >= FALLBACK_DAILY_INPUT_QUOTA ||
    effectiveOutput(fallback) >= FALLBACK_DAILY_OUTPUT_QUOTA;

  if (!fallbackExhausted) return "fallback";

  return null;
}

export async function trackUsage(
  userId: string,
  usage: LanguageModelUsage,
  tier: ModelTier,
): Promise<void> {
  const inputTokens = usage.inputTokens ?? 0;
  const outputTokens = usage.outputTokens ?? 0;
  if (inputTokens === 0 && outputTokens === 0) return;

  const date = currentDate();
  const totalTokens = usage.totalTokens ?? inputTokens + outputTokens;
  const reasoningTokens = usage.outputTokenDetails?.reasoningTokens ?? 0;
  const cacheReadTokens = usage.inputTokenDetails?.cacheReadTokens ?? 0;
  const cacheWriteTokens = usage.inputTokenDetails?.cacheWriteTokens ?? 0;
  const noCacheInputTokens = usage.inputTokenDetails?.noCacheTokens ?? 0;
  const textOutputTokens = usage.outputTokenDetails?.textTokens ?? 0;

  await db
    .insert(chatTokenUsage)
    .values({
      id: crypto.randomUUID(),
      userId,
      date,
      modelTier: tier,
      inputTokens,
      outputTokens,
      totalTokens,
      reasoningTokens,
      cacheReadTokens,
      cacheWriteTokens,
      noCacheInputTokens,
      textOutputTokens,
    })
    .onConflictDoUpdate({
      target: [chatTokenUsage.userId, chatTokenUsage.date, chatTokenUsage.modelTier],
      set: {
        inputTokens: sql`${chatTokenUsage.inputTokens} + ${inputTokens}`,
        outputTokens: sql`${chatTokenUsage.outputTokens} + ${outputTokens}`,
        totalTokens: sql`${chatTokenUsage.totalTokens} + ${totalTokens}`,
        reasoningTokens: sql`${chatTokenUsage.reasoningTokens} + ${reasoningTokens}`,
        cacheReadTokens: sql`${chatTokenUsage.cacheReadTokens} + ${cacheReadTokens}`,
        cacheWriteTokens: sql`${chatTokenUsage.cacheWriteTokens} + ${cacheWriteTokens}`,
        noCacheInputTokens: sql`${chatTokenUsage.noCacheInputTokens} + ${noCacheInputTokens}`,
        textOutputTokens: sql`${chatTokenUsage.textOutputTokens} + ${textOutputTokens}`,
        updatedAt: new Date(),
      },
    });
}
