import type { Session } from "@/lib/orpc/context";
import type { UIMessage } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { chatModel } from "./models";
import { buildSystemPrompt } from "./system-prompt";
import { getRAGContext } from "./get-rag-context";
import { createAgentTools } from "./ai-tools/agent-tools";
import { createUITools } from "./ai-tools/ui-tool";
import { discoverToolNames } from "./ai-tools/tool-discovery";
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

  const toolSelectionQuery = messages
    .filter((m) => m.role === "user")
    .slice(-6)
    .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text))
    .join(" ")
    .slice(0, 600);

  const [{ context: contextBlock, chunks: ragChunks }, selectedToolNames] = await Promise.all([
    getRAGContext(lastUserText),
    discoverToolNames(toolSelectionQuery),
  ]);

  const ragSources = ragChunks.length > 0
    ? [...new Map(ragChunks.map((c) => [c.source_path, { path: c.source_path, topic: c.topic }])).values()]
    : undefined;

  const systemPrompt = buildSystemPrompt(session, contextBlock);

  const allTools = { ...createAgentTools(session), ...createUITools() } as Record<string, unknown>;
  const tools = Object.fromEntries(
    selectedToolNames
      .map((name) => [name, allTools[name]])
      .filter(([, t]) => t !== undefined),
  );

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: chatModel,
        system: systemPrompt,
        messages: await convertToModelMessages(messages.slice(-MAX_CONTEXT_MESSAGES)),
        tools,
        stopWhen: stepCountIs(5),
        onFinish: async ({ usage }) => {
          await trackUsage(session.user.id, usage.inputTokens ?? 0, usage.outputTokens ?? 0);
        },
      });

      writer.merge(
        result.toUIMessageStream({
          messageMetadata: ({ part }) => {
            if (part.type === "finish")
              return {
                usage: part.totalUsage,
                ...(ragSources ? { custom: { sources: ragSources } } : {}),
              };
            if (part.type === "finish-step") return { modelId: part.response.modelId };
            return undefined;
          },
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
