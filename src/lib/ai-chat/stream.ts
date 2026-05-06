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
import { getRAGContext } from "./rag";
import { createAgentTools } from "./ai-tools/agent-tools";
import { createUITools } from "./ai-tools/ui-tool";
import { selectToolNames } from "./ai-tools/tool-selector";
import { trackUsage } from "./quota";

const MAX_CONTEXT_MESSAGES = 30;
const MIN_THINKING_LENGTH = 5;
const PERFORM_PLANNING = false;

const PLANNING_SYSTEM = `You are a thoughtful planning assistant. Given a user request and the available tools, briefly think through how to best help them — what information to look up, what to compute, and in what order. Be natural and concise: 2–4 sentences, no headers or bullet points.`;

// Azure Responses API assigns itemIds to function calls. Re-sending those IDs
// in subsequent turns causes "Duplicate item" errors, so we strip them here.
function stripCallProviderMetadata(messages: UIMessage[]): UIMessage[] {
  return messages.map((msg) => ({
    ...msg,
    parts: msg.parts.map((part) => {
      if (["callProviderMetadata", "providerMetadata", "resultProviderMetadata"].some((k) => k in part)) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { callProviderMetadata: _a, providerMetadata: _b, resultProviderMetadata: _c, ...rest } = part as typeof part & { callProviderMetadata?: unknown; providerMetadata?: unknown; resultProviderMetadata?: unknown };
        return rest;
      }
      return part;
    }),
  }));
}

export async function createChatStream(session: Session, messages: UIMessage[]) {
  const lastUserText =
    messages
      .filter((m) => m.role === "user")
      .at(-1)
      ?.parts.filter((p) => p.type === "text")
      .map((p) => p.text)
      .join(" ") ?? "";

  // Use recent conversation context for tool selection so short follow-ups
  // (e.g. "first one") inherit the intent of earlier messages.
  const toolSelectionQuery = messages
    .filter((m) => m.role === "user")
    .slice(-6)
    .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text))
    .join(" ")
    .slice(0, 600);

  const [{ context: contextBlock, chunks: ragChunks }, selectedToolNames] = await Promise.all([
    getRAGContext(lastUserText),
    selectToolNames(toolSelectionQuery),
  ]);

  const systemPrompt = buildSystemPrompt(session, contextBlock);

  const allTools = { ...createAgentTools(session), ...createUITools() } as Record<string, unknown>;
  // Meta-tools are always available — they support any task, not a specific one
  const ALWAYS_INCLUDE = ["ask_question_flow", "request_approval"];
  const resolvedToolNames = [...new Set([...selectedToolNames, ...ALWAYS_INCLUDE])];
  const tools = Object.fromEntries(
    resolvedToolNames
      .map((name) => [name, allTools[name]])
      .filter(([, t]) => t !== undefined),
  );

  console.log(`[ChatStream] final selected tools: ${Object.keys(tools).join(", ")}`);

  const shouldThink =
    PERFORM_PLANNING && selectedToolNames.length > 0 && lastUserText.trim().length >= MIN_THINKING_LENGTH;

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
              content: `User request: ${lastUserText}\n\nAvailable tools: ${selectedToolNames.join(", ")}`,
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

      const result = streamText({
        model: chatModel,
        system: systemPrompt,
        messages: await convertToModelMessages(stripCallProviderMetadata(messages.slice(-MAX_CONTEXT_MESSAGES))),
        tools,
        stopWhen: stepCountIs(15),
        onFinish: async ({ usage: tokenUsage }) => {
          await trackUsage(session.user.id, tokenUsage.inputTokens ?? 0, tokenUsage.outputTokens ?? 0);
        },
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
