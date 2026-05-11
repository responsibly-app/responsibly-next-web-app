import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ServerCaller } from "@/lib/orpc/server-caller";

export const getMyPoints = {
  meta: {
    name: "get_my_points",
    description: "Get the current user's personal points log and running total.",
    embeddingDescription:
      "Retrieve the authenticated user's complete history of earned points, including each individual point entry, the date it was recorded, and the cumulative total. Use this when the user asks about their score, how many points they have, their point history or log, their progress, their tally, their balance, or how they are doing in terms of rewards.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getMyPoints.meta.description,
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        const items = await caller.personal.points.list();
        const total = items.reduce((sum, i) => sum + i.amount, 0);
        return { total, items };
      },
    });
  },
};

export const getOrgLeaderboard = {
  meta: {
    name: "get_org_leaderboard",
    description:
      "Get the points, AMAs, and invites leaderboard for an organization the user is a member of. List users organizations and ask which one if they belong to more than one. Then show the rankings of all members in that organization, sorted by total points, including their AMA submissions and invite counts.",
    embeddingDescription:
      "Fetch the leaderboard rankings for a specific organization, showing all members ranked by their total points, AMA (ask me anything) submissions, and daily invite counts. Use this when the user asks about rankings, standings, top performers, top agents, who is winning, the scoreboard, the leaderboard, member scores, or competitive stats within an organization. The user must be a member; confirm which org if they belong to more than one.",
    deps: ["list_my_organizations"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getOrgLeaderboard.meta.description,
      inputSchema: zodSchema(
        z.object({
          organizationId: z.string().describe("The organization ID to get the leaderboard for"),
        }),
      ),
      execute: async ({ organizationId }) => {
        try {
          return await caller.personal.points.getOrgLeaderboard({ organizationId });
        } catch {
          return { error: "You are not a member of this organization." };
        }
      },
    });
  },
};

export const addPoint = {
  meta: {
    name: "add_point",
    description: "Add a point entry to the current user's personal points log.",
    embeddingDescription:
      "Log a new point entry for the current user with a description, amount, and date. Use this when the user wants to add points, record a point achievement, log activity points, or track a new point item in their personal log.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: addPoint.meta.description,
      inputSchema: zodSchema(
        z.object({
          description: z.string().describe("What the points are for"),
          amount: z.number().int().min(1).describe("Number of points to add"),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Date in YYYY-MM-DD format"),
        }),
      ),
      execute: async ({ description, amount, date }) => {
        try {
          return await caller.personal.points.add({ description, amount, date });
        } catch (err: any) {
          return { error: err?.message ?? "Failed to add point entry." };
        }
      },
    });
  },
};

export const pointsTools = [getMyPoints, getOrgLeaderboard, addPoint] as const;
