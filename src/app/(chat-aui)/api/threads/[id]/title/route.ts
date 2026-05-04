import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { chatThread } from "@/lib/db/schema/chat-schema";
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";
import { and, eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const [thread] = await db
    .select({ id: chatThread.id })
    .from(chatThread)
    .where(and(eq(chatThread.id, id), eq(chatThread.userId, session.user.id)));

  if (!thread) return new Response("Not Found", { status: 404 });

  const { messages } = (await req.json()) as {
    messages: Array<{
      role: string;
      content: Array<{ type: string; text?: string }>;
    }>;
  };

  const firstUserText = messages
    .find((m) => m.role === "user")
    ?.content.filter((p) => p.type === "text")
    .map((p) => p.text ?? "")
    .join(" ") ?? "";

  if (!firstUserText) {
    return Response.json({ title: "New Chat" });
  }

  const customAzure = createAzure({
    resourceName: process.env.AZURE_GPT5_RESOURCE_NAME,
    apiKey: process.env.AZURE_GPT5_API_KEY!,
  });

  const { text: title } = await generateText({
    model: customAzure("gpt-5.2"),
    prompt: `Generate a short title (max 6 words, no punctuation at end) for a conversation starting with: "${firstUserText.slice(0, 300)}"`,
  });

  const trimmedTitle = title.trim();

  await db
    .update(chatThread)
    .set({ title: trimmedTitle, updatedAt: new Date() })
    .where(eq(chatThread.id, id));

  return Response.json({ title: trimmedTitle });
}
