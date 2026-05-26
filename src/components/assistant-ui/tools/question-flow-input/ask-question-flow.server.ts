import { tool, zodSchema } from "ai";
import { z } from "zod";

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  disabled: z.boolean().optional(),
  allowCustomInput: z
    .boolean()
    .optional()
    .describe(
      "Set to true on an 'Other' type option (e.g. label: 'Other (please specify)'). When the user selects it, a text input appears inline so they can type their custom answer. Use this instead of allowFreeText when you want free text as one explicit choice among others.",
    ),
});

const stepSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(optionSchema).min(1),
  selectionMode: z.enum(["single", "multi"]).optional(),
  allowFreeText: z
    .boolean()
    .optional()
    .describe(
      "Set to true when the predefined options may not fully cover the user's answer and they should be able to type a custom response. The text input appears below the options as an escape hatch — if the user types anything, it replaces any option selection.",
    ),
});

const meta = {
  name: "ask_question_flow",
  description:
    "Present a multi-step question flow for the user to make selections. Each step shows a list of options. To let the user type a custom answer: (1) add an option with allowCustomInput: true (e.g. label 'Other (please specify)') — selecting it reveals an inline text field, OR (2) set allowFreeText: true on the step to always show a text input below the options as a fallback.",
  embeddingDescription:
    "Show an interactive multi-step question or survey flow where the user selects from options at each step. Use when you need to gather structured input, preferences, or choices from the user before taking an action — such as filtering results, configuring a setting, or onboarding. Add an option with allowCustomInput: true for an 'Other' escape hatch, or set allowFreeText: true on the step for a persistent text input.",
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
