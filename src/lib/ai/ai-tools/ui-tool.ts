import { showChart } from "@/components/assistant-ui/tools/chart/show-chart.server";
import { requestApproval } from "@/components/assistant-ui/tools/approval-card/request-approval.server";
import { showDataTable } from "@/components/assistant-ui/tools/data-table/show-data-table.server";
import { askQuestionFlow } from "@/components/assistant-ui/tools/question-flow/ask-question-flow.server";
import { previewLink } from "@/components/assistant-ui/tools/link/preview-link.server";
import { getWeather } from "@/components/assistant-ui/tools/weather/get-weather.server";
import { generateFile } from "@/components/assistant-ui/tools/generate-file/generate-file.server";
import { generateImage } from "@/components/assistant-ui/tools/generate-image/generate-image.server";
import type { Session } from "@/lib/orpc/context";
// import { showPlan } from "@/components/assistant-ui/tools/plan/plan.server";

const staticUIToolDefs = [
  showChart,
  requestApproval,
  showDataTable,
  askQuestionFlow,
  previewLink,
  getWeather,
  // showPlan,
] as const;

export const uiToolMeta = [
  ...staticUIToolDefs.map((t) => t.meta),
  generateFile.meta,
  generateImage.meta,
];

type StaticUITools = {
  [T in (typeof staticUIToolDefs)[number] as T["meta"]["name"]]: T["tool"];
};

export function createUITools(session: Session): StaticUITools & {
  generate_file: ReturnType<typeof generateFile.create>;
  generate_image: ReturnType<typeof generateImage.create>;
} {
  return {
    ...Object.fromEntries(staticUIToolDefs.map((t) => [t.meta.name, t.tool])) as StaticUITools,
    generate_file: generateFile.create(session),
    generate_image: generateImage.create(session),
  };
}
