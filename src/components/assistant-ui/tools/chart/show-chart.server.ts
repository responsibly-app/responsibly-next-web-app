import { tool, zodSchema } from "ai";
import { z } from "zod";

const meta = {
  name: "show_chart",
  description:
    'Render a bar or line chart. Always include data. Example: { type: "bar", data: [{ region: "North", sales: 120 }], xKey: "region", series: [{ key: "sales", label: "Sales" }] }',
  embeddingDescription:
    "Display a bar chart or line chart visualizing numeric data. Use when the user asks to see a graph, chart, plot, visualization, trend over time, comparison between values, or distribution of data.",
} as const;

export const showChart = {
  meta,
  tool: tool({
    description: meta.description,
    inputSchema: zodSchema(
      z.object({
        type: z.enum(["bar", "line"]),
        title: z.string().optional(),
        description: z.string().optional(),
        data: z
          .array(z.record(z.string(), z.unknown()))
          .min(1)
          .describe("Required. Array of data objects, each containing the xKey and all series keys."),
        xKey: z.string().min(1).describe("Key in data objects for the x-axis."),
        series: z
          .array(
            z.object({
              key: z.string().min(1),
              label: z.string().min(1),
              color: z.string().optional(),
            }),
          )
          .min(1)
          .describe("Metrics to plot. Each entry maps a data key to a label and optional color."),
        showLegend: z.boolean().optional(),
        showGrid: z.boolean().optional(),
      }),
    ),
    execute: async (args) => ({ id: `chart-${Date.now()}`, ...args }),
  }),
};
