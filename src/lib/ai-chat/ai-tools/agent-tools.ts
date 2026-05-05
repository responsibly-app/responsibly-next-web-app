import { tool, zodSchema } from "ai";
import { z } from "zod";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, organization, user } from "@/lib/db/schema/better-auth-schema";
import { event } from "@/lib/db/schema/event-schema";
import { pointItem, amaItem, dailyInvite } from "@/lib/db/schema/personal-schema";
import type { Session } from "@/lib/orpc/context";

export function createAgentTools(session: Session) {
  const userId = session.user.id;

  return {
    list_my_organizations: tool({
      description:
        "List all organizations the current user belongs to, including their role in each.",
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        return db
          .select({
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            role: member.role,
          })
          .from(member)
          .innerJoin(organization, eq(member.organizationId, organization.id))
          .where(eq(member.userId, userId));
      },
    }),

    list_upcoming_events: tool({
      description:
        "List upcoming events across all organizations the current user belongs to. Returns up to 10 events ordered by soonest first.",
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        return db
          .select({
            id: event.id,
            organizationId: event.organizationId,
            organizationName: organization.name,
            title: event.title,
            eventType: event.eventType,
            startAt: event.startAt,
            endAt: event.endAt,
            location: event.location,
            zoomJoinUrl: event.zoomJoinUrl,
          })
          .from(event)
          .innerJoin(organization, eq(event.organizationId, organization.id))
          .innerJoin(
            member,
            and(eq(member.organizationId, event.organizationId), eq(member.userId, userId)),
          )
          .where(gte(event.startAt, new Date()))
          .orderBy(asc(event.startAt))
          .limit(10);
      },
    }),

    list_events_for_org: tool({
      description:
        "List all events (past and upcoming) for a specific organization. User must be a member of that organization.",
      inputSchema: zodSchema(
        z.object({
          organizationId: z.string().describe("The organization ID to list events for"),
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

        return db
          .select({
            id: event.id,
            title: event.title,
            eventType: event.eventType,
            startAt: event.startAt,
            endAt: event.endAt,
            location: event.location,
            zoomJoinUrl: event.zoomJoinUrl,
            creatorName: user.name,
          })
          .from(event)
          .leftJoin(user, eq(event.createdBy, user.id))
          .where(eq(event.organizationId, organizationId))
          .orderBy(desc(event.startAt));
      },
    }),

    get_my_points: tool({
      description:
        "Get the current user's personal points log — every point item they have recorded, plus their running total.",
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
    }),

    get_org_leaderboard: tool({
      description:
        "Get the points + AMAs + invites leaderboard for an organization. User must be a member. First ask the user and confirm which organization they want the leaderboard for, if they belong to more than one.",
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
    }),
  };
}
