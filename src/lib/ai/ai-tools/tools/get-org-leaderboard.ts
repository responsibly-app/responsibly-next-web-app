import { tool, zodSchema } from "ai";
import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, user } from "@/lib/db/schema/better-auth-schema";
import { amaItem, dailyInvite, pointItem } from "@/lib/db/schema/personal-schema";

export const meta = {
  name: "get_org_leaderboard",
  description:
    "Get the points, AMAs, and invites leaderboard for an organization the user is a member of. List users organizations and ask which one if they belong to more than one. Then show the rankings of all members in that organization, sorted by total points, including their AMA submissions and invite counts.",
  embeddingDescription:
    "Fetch the leaderboard rankings for a specific organization, showing all members ranked by their total points, AMA (ask me anything) submissions, and daily invite counts. Use this when the user asks about rankings, standings, top performers, top agents, who is winning, the scoreboard, the leaderboard, member scores, or competitive stats within an organization. The user must be a member; confirm which org if they belong to more than one.",
  deps: ["list_my_organizations"],
} as const;

export function getOrgLeaderboard(userId: string) {
  return tool({
    description: meta.description,
    inputSchema: zodSchema(
      z.object({
        organizationId: z.string().describe("The organization ID to get the leaderboard for"),
      }),
    ),
    execute: async ({ organizationId }: { organizationId: string }) => {
      const memberRow = await db
        .select({ role: member.role })
        .from(member)
        .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
        .limit(1)
        .then((r) => r[0]);

      if (!memberRow) {
        return { error: "You are not a member of this organization." };
      }

      const pointsSq = db
        .select({
          userId: pointItem.userId,
          pointsTotal: sql<number>`cast(coalesce(sum(${pointItem.amount}), 0) as int)`.as(
            "points_total",
          ),
        })
        .from(pointItem)
        .groupBy(pointItem.userId)
        .as("points_sq");

      const amasSq = db
        .select({
          userId: amaItem.userId,
          amasTotal: sql<number>`cast(count(${amaItem.id}) as int)`.as("amas_total"),
        })
        .from(amaItem)
        .groupBy(amaItem.userId)
        .as("amas_sq");

      const invitesSq = db
        .select({
          userId: dailyInvite.userId,
          invitesTotal:
            sql<number>`cast(coalesce(sum(${dailyInvite.count}), 0) as int)`.as("invites_total"),
        })
        .from(dailyInvite)
        .groupBy(dailyInvite.userId)
        .as("invites_sq");

      return db
        .select({
          memberId: member.id,
          memberName: user.name,
          memberEmail: user.email,
          memberLevel: member.level,
          totalPoints: sql<number>`cast(coalesce(${pointsSq.pointsTotal}, 0) as int)`,
          totalAmas: sql<number>`cast(coalesce(${amasSq.amasTotal}, 0) as int)`,
          totalInvites: sql<number>`cast(coalesce(${invitesSq.invitesTotal}, 0) as int)`,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .leftJoin(pointsSq, eq(pointsSq.userId, member.userId))
        .leftJoin(amasSq, eq(amasSq.userId, member.userId))
        .leftJoin(invitesSq, eq(invitesSq.userId, member.userId))
        .where(eq(member.organizationId, organizationId))
        .orderBy(desc(sql`coalesce(${pointsSq.pointsTotal}, 0)`));
    },
  });
}
