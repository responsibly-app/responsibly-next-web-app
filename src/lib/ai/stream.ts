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
import { getTools } from "./get-tools";
import { trackUsage } from "./quota";
import { deduplicateMessages, stripCallProviderMetadata } from "./message-utils";
import { logLLMInput, logLLMStepOutput, logSelectedTools } from "./logger";

const MAX_CONTEXT_MESSAGES = 30;
const MIN_THINKING_LENGTH = 5;
const PERFORM_PLANNING = false;

const PLANNING_SYSTEM = `You are a thoughtful planning assistant. Given a user request and the available tools, briefly think through how to best help them — what information to look up, what to compute, and in what order. Be natural and concise: 2–4 sentences, no headers or bullet points.`;

export async function createChatStream(session: Session, messages: UIMessage[]) {
  const lastUserText =
    messages
      .filter((m) => m.role === "user")
      .at(-1)
      ?.parts.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ") ?? "";

  const [{ context: contextBlock, chunks: ragChunks }, tools] = await Promise.all([
    getRAGContext(lastUserText),
    getTools(session, messages),
  ]);

  const systemPrompt = buildSystemPrompt(session, contextBlock);

  logSelectedTools(Object.keys(tools));

  const toolNames = Object.keys(tools);
  const shouldThink =
    PERFORM_PLANNING && toolNames.length > 0 && lastUserText.trim().length >= MIN_THINKING_LENGTH;

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      if (shouldThink) {
        const reasoningId = "plan-0";
        writer.write({ type: "reasoning-start", id: reasoningId });

        const planStream = streamText({
          model: chatModel,
          system: PLANNING_SYSTEM,
          messages: [
            {
              role: "user",
              content: `User request: ${lastUserText}\n\nAvailable tools: ${toolNames.join(", ")}`,
            },
          ],
          maxOutputTokens: 250,
          onFinish: async ({ usage }) => {
            await trackUsage(session.user.id, usage.inputTokens ?? 0, usage.outputTokens ?? 0);
          },
        });

        for await (const chunk of planStream.fullStream) {
          if (chunk.type === "text-delta") {
            writer.write({ type: "reasoning-delta", id: reasoningId, delta: chunk.text });
          }
        }

        writer.write({ type: "reasoning-end", id: reasoningId });
      }

      const modelMessages = await convertToModelMessages(
        stripCallProviderMetadata(deduplicateMessages(messages.slice(-MAX_CONTEXT_MESSAGES))),
      );

      logLLMInput(messages.length, modelMessages as Parameters<typeof logLLMInput>[1]);

      const result = streamText({
        model: chatModel,
        system: systemPrompt,
        messages: modelMessages,
        tools,
        stopWhen: stepCountIs(15),
        // onFinish: async ({ usage: tokenUsage }) => {
        //   await trackUsage(session.user.id, tokenUsage.inputTokens ?? 0, tokenUsage.outputTokens ?? 0);
        // },
        onStepFinish: async (step) => {
          await trackUsage(session.user.id, step.usage.inputTokens ?? 0, step.usage.outputTokens ?? 0);
          logLLMStepOutput(step, step.stepNumber);
        }
      });

      const ragSources = ragChunks.length > 0
        ? Object.values(
          ragChunks.reduce<Record<string, { path: string; topic: string; content: string }>>(
            (acc, c) => {
              if (acc[c.source_path]) {
                acc[c.source_path].content += "\n\n -------- next chunk ---------- \n\n" + c.content;
              } else {
                acc[c.source_path] = { path: c.source_path, topic: c.topic, content: c.content };
              }
              return acc;
            },
            {},
          ),
        )
        : undefined;

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
