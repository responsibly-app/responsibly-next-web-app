import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { chatThread } from "@/lib/db/schema/chat-schema";
import { and, eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const [thread] = await db
    .select()
    .from(chatThread)
    .where(and(eq(chatThread.id, id), eq(chatThread.userId, session.user.id)));

  if (!thread) return new Response("Not Found", { status: 404 });

  return Response.json(thread);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = (await req.json()) as { title?: string; status?: string };

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (body.title !== undefined) updates.title = body.title;
  if (body.status !== undefined) updates.status = body.status;

  await db
    .update(chatThread)
    .set(updates)
    .where(and(eq(chatThread.id, id), eq(chatThread.userId, session.user.id)));

  return new Response(null, { status: 204 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  await db
    .delete(chatThread)
    .where(and(eq(chatThread.id, id), eq(chatThread.userId, session.user.id)));

  return new Response(null, { status: 204 });
}
