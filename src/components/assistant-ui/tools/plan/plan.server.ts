import { tool, zodSchema } from "ai";
import { z } from "zod";

const todoSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  description: z.string().optional(),
});

const meta = {
  name: "show_plan",
  description:
    "Display a step-by-step implementation plan with todos and progress tracking. Use when the user asks you to plan a task, break down work into steps, or outline a course of action.",
  embeddingDescription:
    "Show a visual plan card with a list of todos, each with a status (pending, in progress, completed, or cancelled) and optional detail. Use when the user wants to see a structured plan, roadmap, checklist, or breakdown of steps for a task or project.",
} as const;

export const showPlan = {
  meta,
  tool: tool({
    description: meta.description,
    inputSchema: zodSchema(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        todos: z
          .array(todoSchema)
          .min(1)
          .describe("List of steps in the plan, each with an id, label, and status."),
        maxVisibleTodos: z.number().int().positive().optional(),
      }),
    ),
    execute: async (args) => ({ id: `plan-${Date.now()}`, ...args }),
  }),
};
