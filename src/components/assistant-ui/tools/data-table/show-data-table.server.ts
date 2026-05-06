import { tool, zodSchema } from "ai";
import { z } from "zod";

const formatSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text") }),
  z.object({
    kind: z.literal("number"),
    decimals: z.number().optional(),
    unit: z.string().optional(),
    compact: z.boolean().optional(),
    showSign: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("currency"),
    currency: z.string(),
    decimals: z.number().optional(),
  }),
  z.object({
    kind: z.literal("percent"),
    decimals: z.number().optional(),
    showSign: z.boolean().optional(),
    basis: z.enum(["fraction", "unit"]).optional(),
  }),
  z.object({
    kind: z.literal("date"),
    dateFormat: z.enum(["short", "long", "relative"]).optional(),
  }),
  z.object({
    kind: z.literal("delta"),
    decimals: z.number().optional(),
    upIsPositive: z.boolean().optional(),
    showSign: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("status"),
    statusMap: z.record(
      z.string(),
      z.object({
        tone: z.enum(["success", "warning", "danger", "info", "neutral"]),
        label: z.string().optional(),
      }),
    ),
  }),
  z.object({
    kind: z.literal("boolean"),
    labels: z.object({ true: z.string(), false: z.string() }).optional(),
  }),
  z.object({
    kind: z.literal("link"),
    hrefKey: z.string().optional(),
    external: z.boolean().optional(),
  }),
  z.object({
    kind: z.literal("badge"),
    colorMap: z
      .record(
        z.string(),
        z.enum(["success", "warning", "danger", "info", "neutral"]),
      )
      .optional(),
  }),
  z.object({ kind: z.literal("array"), maxVisible: z.number().optional() }),
]);

const columnSchema = z.object({
  key: z.string(),
  label: z.string(),
  abbr: z.string().optional(),
  sortable: z.boolean().optional(),
  align: z.enum(["left", "right", "center"]).optional(),
  width: z.string().optional(),
  truncate: z.boolean().optional(),
  priority: z.enum(["primary", "secondary", "tertiary"]).optional(),
  hideOnMobile: z.boolean().optional(),
  format: formatSchema.optional(),
});

const JsonPrimitive = z.union([z.string(), z.number(), z.boolean(), z.null()]);

export const meta = {
  name: "show_data_table",
  description:
    "Render a data table with rows and typed columns. Use for any structured list or comparison the user asks to see in tabular form.",
  embeddingDescription:
    "Display a structured table of rows and columns with typed formatting. Use when the user asks to see a list, table, grid, spreadsheet-style view, or any collection of records with multiple fields — such as events, users, transactions, or leaderboard entries.",
} as const;

export const showDataTableTool = tool({
  description: meta.description,
  inputSchema: zodSchema(
    z.object({
      columns: z.array(columnSchema),
      data: z.array(z.record(z.string(), z.union([JsonPrimitive, z.array(JsonPrimitive)]))),
      rowIdKey: z.string().optional(),
      defaultSort: z
        .object({
          by: z.string().optional(),
          direction: z.enum(["asc", "desc"]).optional(),
        })
        .optional(),
      emptyMessage: z.string().optional(),
      maxHeight: z.string().optional(),
      locale: z.string().optional(),
    }),
  ),
  execute: async (args) => ({ id: `table-${Date.now()}`, ...args }),
});
