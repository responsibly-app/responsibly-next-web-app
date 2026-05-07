import { Assistant } from "@/components/assistant-ui/modules/assistant";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { chatThread } from "@/lib/db/schema/chat-schema";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [thread] = await db
    .select({ id: chatThread.id })
    .from(chatThread)
    .where(and(eq(chatThread.id, id), eq(chatThread.userId, session.user.id)));

  if (!thread) redirect("/chat?error=thread_not_found");

  return <Assistant initialThreadId={id} />;
}
