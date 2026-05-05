import { getWeatherTool } from "~/src/components/assistant-ui/tools/weather/get-weather.server";
import { previewLinkTool } from "~/src/components/assistant-ui/tools/link/preview-link.server";
import { showChartTool } from "~/src/components/assistant-ui/tools/chart/show-chart.server";
import { requestApprovalTool } from "~/src/components/assistant-ui/tools/approval-card/request-approval.server";
import { showDataTableTool } from "~/src/components/assistant-ui/tools/data-table/show-data-table.server";
import { askQuestionFlowTool } from "~/src/components/assistant-ui/tools/question-flow/ask-question-flow.server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { chatTokenUsage } from "@/lib/db/schema/chat-schema";
import { buildContextBlock, retrieveChunks } from "@/lib/rag/retriever";
import { and, eq, sql } from "drizzle-orm";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";
import { INPUT_TOKEN_QUOTA, OUTPUT_TOKEN_QUOTA } from "../token-usage/route";
import { chatModel } from "@/lib/ai-models/foundry";
// import { injectQuoteContext } from "@assistant-ui/react-ai-sdk";

export const maxDuration = 30;
const MAX_CONTEXT_MESSAGES = 5;

type ToolName =
  | "get_weather"
  | "preview_link"
  | "show_chart"
  | "request_approval"
  | "show_data_table"
  | "ask_question_flow";

function selectActiveTools(messages: UIMessage[]): ToolName[] {
  const recentText = messages
    .filter((m) => m.role === "user")
    .slice(-2)
    .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => p.text))
    .join(" ")
    .toLowerCase();

  const active = new Set<ToolName>();

  // if (/weather|temperature|forecast/.test(recentText))
  //   active.add("get_weather");

  // if (/https?:\/\/|www\.|\.com|\.org|\.net|link|url|website|site/.test(recentText))
  //   active.add("preview_link");

  // if (/chart|graph|trend|plot|visuali[sz]e|bar chart|line chart|distribution/.test(recentText))
  //   active.add("show_chart");

  // if (/table|list|compar|rows?|columns?|spreadsheet|breakdown/.test(recentText))
  //   active.add("show_data_table");

  // if (/choos|option|select|prefer|step|wizard|pick from/.test(recentText))
  //   active.add("ask_question_flow");

  // if (/approv|confirm|proceed|delete|remov|sure about/.test(recentText))
  //   active.add("request_approval");

  return Array.from(active);
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

async function checkQuota(userId: string, month: string): Promise<Response | null> {
  const [usage] = await db
    .select()
    .from(chatTokenUsage)
    .where(and(eq(chatTokenUsage.userId, userId), eq(chatTokenUsage.month, month)));

  const usedInput = usage?.inputTokens ?? 0;
  const usedOutput = usage?.outputTokens ?? 0;

  if (usedInput >= INPUT_TOKEN_QUOTA || usedOutput >= OUTPUT_TOKEN_QUOTA) {
    return new Response(
      `Monthly token quota exceeded. You've used ${usedInput.toLocaleString()}/${INPUT_TOKEN_QUOTA.toLocaleString()} input tokens and ${usedOutput.toLocaleString()}/${OUTPUT_TOKEN_QUOTA.toLocaleString()} output tokens this month.`,
      { status: 429 },
    );
  }

  return null;
}

async function trackUsage(userId: string, month: string, inputTokens: number, outputTokens: number) {
  if (inputTokens === 0 && outputTokens === 0) return;

  await db
    .insert(chatTokenUsage)
    .values({
      id: crypto.randomUUID(),
      userId,
      month,
      inputTokens,
      outputTokens,
    })
    .onConflictDoUpdate({
      target: [chatTokenUsage.userId, chatTokenUsage.month],
      set: {
        inputTokens: sql`${chatTokenUsage.inputTokens} + ${inputTokens}`,
        outputTokens: sql`${chatTokenUsage.outputTokens} + ${outputTokens}`,
        updatedAt: new Date(),
      },
    });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;
  const month = currentMonth();

  const quotaError = await checkQuota(userId, month);
  if (quotaError) return quotaError;

  const { messages }: { messages: UIMessage[] } = await req.json();

  // RAG: retrieve relevant strategy chunks for the latest user message
  const lastUserText = messages
    .filter((m) => m.role === "user")
    .at(-1)
    ?.parts.filter((p) => p.type === "text")
    .map((p) => p.text)
    .join(" ") ?? "";

  const ragChunks = lastUserText.length > 10 ? await retrieveChunks(lastUserText) : [];
  const contextBlock = buildContextBlock(ragChunks);
  console.log(`[RAG] Retrieved ${ragChunks.length} chunks for query: "${lastUserText}"`);

  const systemPrompt = [
    "You are a sales coaching assistant. Help users with objection handling, sales strategies, and best practices.",
    contextBlock.length > 0
      ? `\nUse the following knowledge base context to inform your response. If the context is directly relevant, ground your answer in it. If not, answer from general knowledge.\n\n${contextBlock}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = streamText({
    model: chatModel,
    system: systemPrompt,
    messages: await convertToModelMessages(messages.slice(-MAX_CONTEXT_MESSAGES)),
    tools: {
      // get_weather: getWeatherTool,
      // preview_link: previewLinkTool,
      // show_chart: showChartTool,
      // request_approval: requestApprovalTool,
      // show_data_table: showDataTableTool,
      // ask_question_flow: askQuestionFlowTool,
    },
    // experimental_activeTools: selectActiveTools(messages),
    onFinish: async ({ usage: tokenUsage }) => {
      await trackUsage(userId, month, tokenUsage.inputTokens ?? 0, tokenUsage.outputTokens ?? 0);
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === "finish") {
        return {
          usage: part.totalUsage,
        };
      }
      if (part.type === "finish-step") {
        return {
          modelId: part.response.modelId,
        };
      }
      return undefined;
    },
  });
}
