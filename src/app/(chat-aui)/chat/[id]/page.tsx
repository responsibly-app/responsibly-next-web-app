import { Assistant } from "@/components/assistant-ui/modules/assistant";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Assistant initialThreadId={id} />;
}
