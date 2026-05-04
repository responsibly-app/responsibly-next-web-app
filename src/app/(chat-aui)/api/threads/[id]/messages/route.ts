import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { chatMessage, chatThread } from "@/lib/db/schema/chat-schema";
import { and, asc, eq } from "drizzle-orm";

export async function GET(
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

  const messages = await db
    .select()
    .from(chatMessage)
    .where(eq(chatMessage.threadId, id))
    .orderBy(asc(chatMessage.createdAt));

  return Response.json(
    messages.map((m) => ({
      id: m.id,
      parent_id: m.parentId,
      format: m.format,
      content: m.content,
    })),
  );
}

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

  const body = (await req.json()) as {
    id: string;
    parent_id: string | null;
    format: string;
    content: Record<string, unknown>;
  };

  await db.transaction(async (tx) => {
    await tx.insert(chatMessage).values({
      id: body.id,
      threadId: id,
      parentId: body.parent_id ?? null,
      format: body.format,
      content: body.content,
    });

    await tx
      .update(chatThread)
      .set({ updatedAt: new Date() })
      .where(eq(chatThread.id, id));
  });

  return new Response(null, { status: 204 });
}
