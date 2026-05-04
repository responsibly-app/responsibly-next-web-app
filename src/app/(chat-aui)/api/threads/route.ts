import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { chatThread } from "@/lib/db/schema/chat-schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const threads = await db
    .select()
    .from(chatThread)
    .where(eq(chatThread.userId, session.user.id))
    .orderBy(desc(chatThread.updatedAt));

  return Response.json(threads);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const id = crypto.randomUUID();

  await db.insert(chatThread).values({
    id,
    userId: session.user.id,
    title: null,
    status: "regular",
  });

  return Response.json({ id });
}
