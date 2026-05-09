import { auth } from "@/lib/auth/auth";
import { resolveModelTier } from "~/src/lib/ai/quota";
import { createChatStream } from "~/src/lib/ai/stream";
import type { UIMessage } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const tier = await resolveModelTier(session.user.id);
  if (!tier) {
    return new Response("Daily token quota exceeded for all models. Try again tomorrow.", { status: 429 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  return createChatStream(session, messages, tier);
}
