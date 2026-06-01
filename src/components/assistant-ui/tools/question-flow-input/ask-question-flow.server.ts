import { tool, zodSchema } from "ai";
import { z } from "zod";

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  disabled: z.boolean().optional(),
});

const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(optionSchema),
  selectionMode: z.enum(["single", "multi"]).optional(),
  optional: z
    .boolean()
    .optional()
    .describe(
      "Set to true when the step can be skipped (e.g. an optional description or notes field). The user can click Next without selecting an option or typing anything.",
    ),
});

const meta = {
  name: "ask_question_flow",
  description:
    "Present a multi-step question flow for the user to make selections. Each step shows a list of options. A free-text input is always shown below the options so the user can type a custom answer — do NOT add an 'Other (please specify)' or similar option for this purpose.",
  embeddingDescription:
    "Show an interactive multi-step question or survey flow where the user selects from options at each step. Use when you need to gather structured input, preferences, or choices from the user before taking an action — such as filtering results, configuring a setting, or onboarding. A free-text fallback input is always present; do not add an 'Other' option for custom answers.",
} as const;

export const askQuestionFlow = {
  meta,
  tool: tool({
    description: meta.description,
    inputSchema: zodSchema(
      z.object({
        steps: z.array(stepSchema).min(1),
      }),
    ),
    // No execute — the human provides the result via the question flow UI.
  }),
};
