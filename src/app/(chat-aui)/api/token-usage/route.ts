import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { chatTokenUsage } from "@/lib/db/schema/chat-schema";
import { and, eq } from "drizzle-orm";

export const INPUT_TOKEN_QUOTA = 5_000;
export const OUTPUT_TOKEN_QUOTA = 5_000;

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const month = currentMonth();

  const [usage] = await db
    .select()
    .from(chatTokenUsage)
    .where(and(eq(chatTokenUsage.userId, session.user.id), eq(chatTokenUsage.month, month)));

  return Response.json({
    inputTokens: usage?.inputTokens ?? 0,
    outputTokens: usage?.outputTokens ?? 0,
    inputQuota: INPUT_TOKEN_QUOTA,
    outputQuota: OUTPUT_TOKEN_QUOTA,
    month,
  });
}
