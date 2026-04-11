import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { dailyInvite } from "@/lib/db/schema/personal-schema";
import { member } from "@/lib/db/schema/better-auth-schema";
import { authed } from "@/lib/orpc/base";
import { ORPCError } from "@orpc/server";
import {
  LogInvitesInputSchema,
  DailyInviteSchema,
  GetInviteHistoryInputSchema,
  GetInviteHistoryOutputSchema,
  GetMemberInviteHistoryInputSchema,
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
      // Use the user's stored timezone so "today" and date ranges match their local calendar
      const timezone = context.session.user?.timezone ?? "UTC";
      const todayInTz = new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
      // Compute start date by going back (days - 1) UTC days from today's local date string
      const startDateObj = new Date(todayInTz + "T12:00:00Z");
      startDateObj.setUTCDate(startDateObj.getUTCDate() - (days - 1));
      const startDateStr = startDateObj.toISOString().split("T")[0];

      return db
        .select()
        .from(dailyInvite)
        .where(and(eq(dailyInvite.userId, userId), gte(dailyInvite.date, startDateStr)))
        .orderBy(asc(dailyInvite.date));
    }),

  getMemberHistory: authed
    .route({
      method: "GET",
      path: "/personal/invites/member-history",
      summary: "Get invite history for a specific org member (org members only)",
      tags: ["Personal"],
    })
    .input(GetMemberInviteHistoryInputSchema)
    .output(GetInviteHistoryOutputSchema)
    .handler(async ({ input, context }) => {
      // Verify caller is a member of the org
      const callerMember = await db
        .select({ id: member.id })
        .from(member)
        .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, context.session.user.id)))
        .limit(1)
        .then((rows) => rows[0]);
      if (!callerMember) throw new ORPCError("FORBIDDEN");

      const days = input.days ?? 90;
      const startDateObj = new Date();
      startDateObj.setUTCDate(startDateObj.getUTCDate() - (days - 1));
      const startDateStr = startDateObj.toISOString().split("T")[0];

      return db
        .select()
        .from(dailyInvite)
        .where(and(eq(dailyInvite.userId, input.targetUserId), gte(dailyInvite.date, startDateStr)))
        .orderBy(asc(dailyInvite.date));
    }),
};
