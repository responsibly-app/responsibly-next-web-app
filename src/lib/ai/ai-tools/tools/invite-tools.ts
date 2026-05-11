import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ServerCaller } from "@/lib/orpc/server-caller";

export const getInviteHistory = {
  meta: {
    name: "get_invite_history",
    description: "Get the current user's daily invite history for the past N days.",
    embeddingDescription:
      "Retrieve the authenticated user's daily invite log showing how many invites they sent each day over a period of time. Use this when the user asks about their invite history, daily invite counts, how many invites they sent, their invite streak, or invite activity over time.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getInviteHistory.meta.description,
      inputSchema: zodSchema(
        z.object({
          days: z
            .number()
            .int()
            .min(1)
            .max(365)
            .optional()
            .describe("Number of past days to include (default 90)"),
        }),
      ),
      execute: async ({ days }) => caller.personal.invites.getHistory({ days }),
    });
  },
};

export const logInvites = {
  meta: {
    name: "log_invites",
    description: "Log or update the current user's daily invite count for a specific date.",
    embeddingDescription:
      "Record or update how many invites the current user sent on a given day. Use this when the user wants to log invites, record daily invites, update their invite count, or track how many people they invited on a specific date.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: logInvites.meta.description,
      inputSchema: zodSchema(
        z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date in YYYY-MM-DD format"),
          count: z.number().int().min(0).describe("Number of invites sent on this date"),
        }),
      ),
      execute: async ({ date, count }) => {
        try {
          return await caller.personal.invites.log({ date, count });
        } catch (err: any) {
          return { error: err?.message ?? "Failed to log invites." };
        }
      },
    });
  },
};

export const inviteTools = [getInviteHistory, logInvites] as const;
