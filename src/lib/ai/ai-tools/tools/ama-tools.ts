import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ServerCaller } from "@/lib/orpc/server-caller";

export const getMyAmas = {
  meta: {
    name: "get_my_amas",
    description: "Get the current user's AMA (Ask Me Anything) recruit log.",
    embeddingDescription:
      "Retrieve the authenticated user's complete list of AMA recruits they have logged, including recruit names, agent codes, and dates. Use this when the user asks about their AMAs, recruit history, AMA log, people they recruited, their AMA submissions, or their AMA count.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getMyAmas.meta.description,
      inputSchema: zodSchema(z.object({})),
      execute: async () => caller.personal.amas.list(),
    });
  },
};

export const addAma = {
  meta: {
    name: "add_ama",
    description: "Add an AMA (Ask Me Anything) recruit entry to the current user's log.",
    embeddingDescription:
      "Log a new AMA recruit for the current user with the recruit's name, optional agent code, and date. Use this when the user wants to add an AMA, log a recruit, record a new AMA submission, or track someone they brought in as a recruit.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: addAma.meta.description,
      inputSchema: zodSchema(
        z.object({
          recruitName: z.string().describe("Full name of the recruit"),
          agentCode: z.string().optional().describe("Agent code if applicable"),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date in YYYY-MM-DD format"),
        }),
      ),
      execute: async ({ recruitName, agentCode, date }) => {
        try {
          return await caller.personal.amas.add({ recruitName, agentCode, date });
        } catch (err: any) {
          return { error: err?.message ?? "Failed to add AMA entry." };
        }
      },
    });
  },
};
