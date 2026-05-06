import type { Session } from "@/lib/orpc/context";
import type { UIMessage } from "ai";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { chatModel } from "./models";
import { buildSystemPrompt } from "./system-prompt";
import { getRAGContext } from "./rag";
import { createAgentTools } from "./ai-tools/agent-tools";
import { createUITools } from "./ai-tools/ui-tool";
import { selectToolNames } from "./ai-tools/tool-selector";
import { trackUsage } from "./quota";

const MAX_CONTEXT_MESSAGES = 5;

export async function createChatStream(session: Session, messages: UIMessage[]) {
  const lastUserText =
    messages
      .filter((m) => m.role === "user")
      .at(-1)
      ?.parts.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ") ?? "";

  const [contextBlock, selectedToolNames] = await Promise.all([
    getRAGContext(lastUserText),
    selectToolNames(lastUserText),
  ]);

  const systemPrompt = buildSystemPrompt(session, contextBlock);

  const allTools = { ...createAgentTools(session), ...createUITools() } as Record<string, unknown>;
  const tools = Object.fromEntries(
    selectedToolNames
      .map((name) => [name, allTools[name]])
      .filter(([, t]) => t !== undefined),
  );

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages.slice(-MAX_CONTEXT_MESSAGES)),
    tools,
    stopWhen: stepCountIs(5),
    onFinish: async ({ usage: tokenUsage }) => {
      await trackUsage(session.user.id, tokenUsage.inputTokens ?? 0, tokenUsage.outputTokens ?? 0);
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish") return { usage: part.totalUsage };
      if (part.type === "finish-step") return { modelId: part.response.modelId };
      return undefined;
    },
  });
}
