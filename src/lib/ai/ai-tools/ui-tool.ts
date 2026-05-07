import { showChart } from "@/components/assistant-ui/tools/chart/show-chart.server";
import { requestApproval } from "@/components/assistant-ui/tools/approval-card/request-approval.server";
import { showDataTable } from "@/components/assistant-ui/tools/data-table/show-data-table.server";
import { askQuestionFlow } from "@/components/assistant-ui/tools/question-flow/ask-question-flow.server";
import { previewLink } from "@/components/assistant-ui/tools/link/preview-link.server";
import { getWeather } from "@/components/assistant-ui/tools/weather/get-weather.server";
// import { showPlan } from "@/components/assistant-ui/tools/plan/plan.server";

const uiToolDefs = [
  showChart,
  requestApproval,
  showDataTable,
  askQuestionFlow,
  previewLink,
  getWeather,
  // showPlan,
] as const;

export const uiToolMeta = uiToolDefs.map((t) => t.meta);

type UITools = {
  [T in (typeof uiToolDefs)[number] as T["meta"]["name"]]: T["tool"];
};

export function createUITools(): UITools {
  return Object.fromEntries(uiToolDefs.map((t) => [t.meta.name, t.tool])) as UITools;
}
