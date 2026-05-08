"use client";

import { type Toolkit } from "@assistant-ui/react";
import { getWeatherTool } from "@/components/assistant-ui/tools/weather/get-weather";
import { previewLinkTool } from "@/components/assistant-ui/tools/link/preview-link";
import { showChartTool } from "@/components/assistant-ui/tools/chart/show-chart";
import { requestApprovalTool } from "@/components/assistant-ui/tools/approval-card/request-approval";
import { showDataTableTool } from "@/components/assistant-ui/tools/data-table/show-data-table";
import { askQuestionFlowTool } from "@/components/assistant-ui/tools/question-flow/ask-question-flow";
import { showPlanTool } from "@/components/assistant-ui/tools/plan/plan";

export const toolkit: Toolkit = {
  get_weather: getWeatherTool,
  preview_link: previewLinkTool,
  show_chart: showChartTool,
  request_approval: requestApprovalTool,
  show_data_table: showDataTableTool,
  ask_question_flow: askQuestionFlowTool,
  show_plan: showPlanTool,
};
