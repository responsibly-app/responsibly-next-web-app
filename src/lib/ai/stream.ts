import type { Session } from "@/lib/orpc/context";
import type { ToolSet, UIMessage } from "ai";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
} from "ai";
import { primaryChatModel, fallbackChatModel, providerOptions } from "./models";
import { buildSystemPrompt } from "./system-prompt";
import { getRAGContext } from "./get-rag-context";
import { getTools } from "./get-tools";
import { trackUsage, type ModelTier } from "./quota";
import { prepareUiMessages } from "./message-utils";
import { logLLMInput, logLLMStepOutput, logSelectedTools } from "./logger";
import { createAgentTools } from "./ai-tools/agent-tools";
import { createUITools } from "./ai-tools/ui-tool";

const MAX_CONTEXT_MESSAGES = 10;

export async function createChatStream(session: Session, messages: UIMessage[], tier: ModelTier) {
  const lastUserText =
    messages
      .filter((m) => m.role === "user")
      .at(-1)
      ?.parts.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ") ?? "";

  // const [{ context: contextBlock, chunks: ragChunks }, tools] = await Promise.all([
  //   getRAGContext(lastUserText),
  //   getTools(session, messages),
  // ]);

  const systemPrompt = buildSystemPrompt(session, "contextBlock");
  const model = tier === "primary" ? primaryChatModel : fallbackChatModel;

  // logSelectedTools(Object.keys(tools));

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const uiMessages = await prepareUiMessages(messages, MAX_CONTEXT_MESSAGES);
      const modelMessages = await convertToModelMessages(uiMessages);

      logLLMInput(messages.length, modelMessages);

      // const allTools: ToolSet = { ...createAgentTools(session), ...createUITools(session) };

      const result = streamText({
        model,
        system: systemPrompt,
        messages: modelMessages,
        // tools: allTools,
        stopWhen: stepCountIs(15),
        providerOptions: providerOptions,
        onStepFinish: async (step) => {
          await trackUsage(session.user.id, step.usage, tier);
          logLLMStepOutput(step, step.stepNumber);
        },
      });

      // const ragSources = ragChunks.length > 0
      //   ? Object.values(
      //     ragChunks.reduce<Record<string, { path: string; topic: string; chunkIds: string[] }>>(
      //       (acc, c) => {
      //         if (acc[c.source_path]) {
      //           acc[c.source_path].chunkIds.push(c.id);
      //         } else {
      //           acc[c.source_path] = { path: c.source_path, topic: c.topic, chunkIds: [c.id] };
      //         }
      //         return acc;
      //       },
      //       {},
      //     ),
      //   )
      //   : undefined;

      writer.merge(
        result.toUIMessageStream({
          messageMetadata: ({ part }) => {
            if (part.type === "finish")
              return {
                usage: (part as any).totalUsage,
                custom: {
                  usage: (part as any).totalUsage,
                  modelTier: tier,
                  // ...(ragSources ? { sources: ragSources } : {}),
                },
              };
            if (part.type === "finish-step")
              return {
                usage: (part as any).usage,
              };
            return undefined;
          },
        }),
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
}
