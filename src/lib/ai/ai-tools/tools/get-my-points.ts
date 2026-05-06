import { tool, zodSchema } from "ai";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pointItem } from "@/lib/db/schema/personal-schema";

export const meta = {
  name: "get_my_points",
  description: "Get the current user's personal points log and running total.",
  embeddingDescription:
    "Retrieve the authenticated user's complete history of earned points, including each individual point entry, the date it was recorded, and the cumulative total. Use this when the user asks about their score, how many points they have, their point history or log, their progress, their tally, their balance, or how they are doing in terms of rewards.",
} as const;

export function getMyPoints(userId: string) {
  return tool({
    description: meta.description,
    inputSchema: zodSchema(z.object({})),
    execute: async () => {
      const items = await db
        .select()
        .from(pointItem)
        .where(eq(pointItem.userId, userId))
        .orderBy(desc(pointItem.date), desc(pointItem.createdAt));

      const total = items.reduce((sum, i) => sum + i.amount, 0);
      return { total, items };
    },
  });
}
