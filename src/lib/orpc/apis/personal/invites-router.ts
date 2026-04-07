import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { dailyInvite } from "@/lib/db/schema/personal-schema";
import { authed } from "@/lib/orpc/base";
import {
  LogInvitesInputSchema,
  DailyInviteSchema,
  GetInviteHistoryInputSchema,
  GetInviteHistoryOutputSchema,
} from "./personal-schemas";

export const invitesRouter = {
  log: authed
    .route({
      method: "POST",
      path: "/personal/invites/log",
      summary: "Log or update daily invite count",
      tags: ["Personal"],
    })
    .input(LogInvitesInputSchema)
    .output(DailyInviteSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const id = crypto.randomUUID();

      const [row] = await db
        .insert(dailyInvite)
        .values({ id, userId, date: input.date, count: input.count, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: [dailyInvite.userId, dailyInvite.date],
          set: { count: input.count, updatedAt: new Date() },
        })
        .returning();

      return row;
    }),

  getHistory: authed
    .route({
      method: "GET",
      path: "/personal/invites/history",
      summary: "Get invite history for the last N days",
      tags: ["Personal"],
    })
    .input(GetInviteHistoryInputSchema)
    .output(GetInviteHistoryOutputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const days = input.days ?? 90;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      const startDateStr = startDate.toISOString().split("T")[0];

      return db
        .select()
        .from(dailyInvite)
        .where(and(eq(dailyInvite.userId, userId), gte(dailyInvite.date, startDateStr)))
        .orderBy(asc(dailyInvite.date));
    }),
};
