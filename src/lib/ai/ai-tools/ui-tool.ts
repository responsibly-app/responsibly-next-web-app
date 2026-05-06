import { showChartTool } from "@/components/assistant-ui/tools/chart/show-chart.server";
import { requestApprovalTool } from "@/components/assistant-ui/tools/approval-card/request-approval.server";
import { showDataTableTool } from "@/components/assistant-ui/tools/data-table/show-data-table.server";
import { askQuestionFlowTool } from "@/components/assistant-ui/tools/question-flow/ask-question-flow.server";
import { previewLinkTool } from "@/components/assistant-ui/tools/link/preview-link.server";
import { getWeatherTool } from "@/components/assistant-ui/tools/weather/get-weather.server";

export function createUITools() {
    return {
        show_chart: showChartTool,
        request_approval: requestApprovalTool,
        show_data_table: showDataTableTool,
        ask_question_flow: askQuestionFlowTool,
        preview_link: previewLinkTool,
        get_weather: getWeatherTool,
    };
}
