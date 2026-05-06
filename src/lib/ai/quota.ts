import { db } from "@/lib/db";
import { chatTokenUsage } from "@/lib/db/schema/chat-schema";
import { and, eq, sql } from "drizzle-orm";

export const INPUT_TOKEN_QUOTA = 1_000_000;
export const OUTPUT_TOKEN_QUOTA = 1_000_000;

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function checkQuota(userId: string): Promise<Response | null> {
  const month = currentMonth();
  const [usage] = await db
    .select()
    .from(chatTokenUsage)
    .where(and(eq(chatTokenUsage.userId, userId), eq(chatTokenUsage.month, month)));

  const usedInput = usage?.inputTokens ?? 0;
  const usedOutput = usage?.outputTokens ?? 0;

  if (usedInput >= INPUT_TOKEN_QUOTA || usedOutput >= OUTPUT_TOKEN_QUOTA) {
    return new Response(
      `Monthly token quota exceeded. You've used ${usedInput.toLocaleString()}/${INPUT_TOKEN_QUOTA.toLocaleString()} input tokens and ${usedOutput.toLocaleString()}/${OUTPUT_TOKEN_QUOTA.toLocaleString()} output tokens this month.`,
      { status: 429 },
    );
  }

  return null;
}

export async function trackUsage(
  userId: string,
  inputTokens: number,
  outputTokens: number,
): Promise<void> {
  if (inputTokens === 0 && outputTokens === 0) return;

  const month = currentMonth();
  await db
    .insert(chatTokenUsage)
    .values({
      id: crypto.randomUUID(),
      userId,
      month,
      inputTokens,
      outputTokens,
    })
    .onConflictDoUpdate({
      target: [chatTokenUsage.userId, chatTokenUsage.month],
      set: {
        inputTokens: sql`${chatTokenUsage.inputTokens} + ${inputTokens}`,
        outputTokens: sql`${chatTokenUsage.outputTokens} + ${outputTokens}`,
        updatedAt: new Date(),
      },
    });
}
