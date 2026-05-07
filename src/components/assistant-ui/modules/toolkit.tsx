"use client";

import { type Toolkit } from "@assistant-ui/react";
import { getWeatherTool } from "~/src/components/assistant-ui/tools/weather/get-weather";
import { previewLinkTool } from "~/src/components/assistant-ui/tools/link/preview-link";
import { showChartTool } from "../tools/chart/show-chart";
import { requestApprovalTool } from "../tools/approval-card/request-approval";
import { showDataTableTool } from "../tools/data-table/show-data-table";
import { askQuestionFlowTool } from "../tools/question-flow/ask-question-flow";
import { showPlanTool } from "../tools/plan/plan";

export const toolkit: Toolkit = {
  get_weather: getWeatherTool,
  preview_link: previewLinkTool,
  show_chart: showChartTool,
  request_approval: requestApprovalTool,
  show_data_table: showDataTableTool,
  ask_question_flow: askQuestionFlowTool,
  show_plan: showPlanTool,
};
