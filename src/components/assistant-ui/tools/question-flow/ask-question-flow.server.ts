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
  options: z.array(optionSchema).min(1),
  selectionMode: z.enum(["single", "multi"]).optional(),
});

const meta = {
  name: "ask_question_flow",
  description:
    "Present a multi-step question flow for the user to make selections. Use when you need the user to choose from options across one or more steps before proceeding.",
  embeddingDescription:
    "Show an interactive multi-step question or survey flow where the user selects from options at each step. Use when you need to gather structured input, preferences, or choices from the user before taking an action — such as filtering results, configuring a setting, or onboarding.",
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
