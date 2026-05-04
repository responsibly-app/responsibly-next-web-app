import { getWeatherTool } from "~/src/components/assistant-ui/tools/weather/get-weather.server";
import { previewLinkTool } from "~/src/components/assistant-ui/tools/link/preview-link.server";
import { showChartTool } from "~/src/components/assistant-ui/tools/chart/show-chart.server";
import { requestApprovalTool } from "~/src/components/assistant-ui/tools/approval-card/request-approval.server";
import { showDataTableTool } from "~/src/components/assistant-ui/tools/data-table/show-data-table.server";
import { askQuestionFlowTool } from "~/src/components/assistant-ui/tools/question-flow/ask-question-flow.server";
import { createAzure } from "@ai-sdk/azure";
import type { UIMessage } from "ai";
import { convertToModelMessages, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const customAzure = createAzure({
    resourceName: process.env.AZURE_GPT5_RESOURCE_NAME,
    apiKey: process.env.AZURE_GPT5_API_KEY!,
  });

  const result = streamText({
    model: customAzure("gpt-5.2"),
    messages: await convertToModelMessages(messages),
    tools: {
      get_weather: getWeatherTool,
      preview_link: previewLinkTool,
      show_chart: showChartTool,
      request_approval: requestApprovalTool,
      show_data_table: showDataTableTool,
      ask_question_flow: askQuestionFlowTool,
    },
  });

  return result.toUIMessageStreamResponse();
}
