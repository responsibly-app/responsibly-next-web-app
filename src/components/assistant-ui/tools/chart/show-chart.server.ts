import { tool, zodSchema } from "ai";
import { z } from "zod";

export const showChartTool = tool({
  description:
    "Render a bar or line chart from provided data. Use for any numeric comparison, trend, or distribution the user asks to visualize.",
  inputSchema: zodSchema(
    z.object({
      type: z.enum(["bar", "line"]),
      title: z.string().optional(),
      description: z.string().optional(),
      data: z.array(z.record(z.string(), z.unknown())).min(1),
      xKey: z.string().min(1),
      series: z
        .array(
          z.object({
            key: z.string().min(1),
            label: z.string().min(1),
            color: z.string().optional(),
          }),
        )
        .min(1),
      showLegend: z.boolean().optional(),
      showGrid: z.boolean().optional(),
    }),
  ),
  execute: async (args) => ({ id: `chart-${Date.now()}`, ...args }),
});
