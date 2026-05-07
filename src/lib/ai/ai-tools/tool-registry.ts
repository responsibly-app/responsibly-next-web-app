import { meta as getMyPoints } from "./tools/get-my-points";
import { meta as getOrgLeaderboard } from "./tools/get-org-leaderboard";
import { meta as listEventsForOrg } from "./tools/list-events-for-org";
import { meta as listMyOrganizations } from "./tools/list-my-organizations";
import { meta as listUpcomingEvents } from "./tools/list-upcoming-events";
import { meta as showChart } from "@/components/assistant-ui/tools/chart/show-chart.server";
import { meta as requestApproval } from "@/components/assistant-ui/tools/approval-card/request-approval.server";
import { meta as showDataTable } from "@/components/assistant-ui/tools/data-table/show-data-table.server";
import { meta as askQuestionFlow } from "@/components/assistant-ui/tools/question-flow/ask-question-flow.server";
import { meta as previewLink } from "@/components/assistant-ui/tools/link/preview-link.server";
import { meta as getWeather } from "@/components/assistant-ui/tools/weather/get-weather.server";
import { meta as showPlan } from "@/components/assistant-ui/tools/plan/plan.server";

export interface ToolMeta {
  name: string;
  description: string;
  embeddingDescription: string;
  deps?: readonly string[];
}

export const agentToolMeta = [
  listMyOrganizations,
  listUpcomingEvents,
  listEventsForOrg,
  getMyPoints,
  getOrgLeaderboard,
] satisfies ToolMeta[];

export const uiToolMeta = [
  showChart,
  requestApproval,
  showDataTable,
  askQuestionFlow,
  previewLink,
  getWeather,
  // showPlan,
] satisfies ToolMeta[];

export const allToolMeta: ToolMeta[] = [...agentToolMeta, ...uiToolMeta];
