import { Assistant } from "@/components/assistant-ui/modules/assistant";
import { orpc } from "@/lib/orpc/orpc-client";
import { redirect } from "next/navigation";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    await orpc.chat.getThread({ id });
  } catch {
    redirect("/chat?error=thread_not_found");
  }

  return <Assistant initialThreadId={id} />;
}
