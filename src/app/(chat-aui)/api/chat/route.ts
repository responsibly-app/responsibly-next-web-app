import { auth } from "@/lib/auth/auth";
import { checkQuota } from "~/src/lib/ai/quota";
import { createChatStream } from "~/src/lib/ai/stream";
import type { UIMessage } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const quotaError = await checkQuota(session.user.id);
  if (quotaError) return quotaError;

  const { messages }: { messages: UIMessage[] } = await req.json();

  return createChatStream(session, messages);
}
