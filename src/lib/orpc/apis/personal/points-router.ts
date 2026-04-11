import { ORPCError } from "@orpc/server";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { pointItem } from "@/lib/db/schema/personal-schema";
import { member, user } from "@/lib/db/schema/better-auth-schema";
import { authed } from "@/lib/orpc/base";
import {
  AddPointItemInputSchema,
  DeletePointItemInputSchema,
  GetMemberPointsInputSchema,
  GetPointsLeaderboardInputSchema,
  GetPointsLeaderboardOutputSchema,
  ListPointItemsOutputSchema,
  PointItemSchema,
} from "./personal-schemas";

async function requireOrgMember(organizationId: string, userId: string) {
  const row = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)
    .then((rows) => rows[0]);
  if (!row) throw new ORPCError("FORBIDDEN");
  return row.role;
}

export const pointsRouter = {
  add: authed
    .route({
      method: "POST",
      path: "/personal/points/add",
      summary: "Add a point item",
      tags: ["Personal"],
    })
    .input(AddPointItemInputSchema)
    .output(PointItemSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const id = crypto.randomUUID();

      const [row] = await db
        .insert(pointItem)
        .values({ id, userId, description: input.description, amount: input.amount, date: input.date, createdAt: new Date() })
        .returning();

      return row;
    }),

  list: authed
    .route({
      method: "GET",
      path: "/personal/points/list",
      summary: "List all point items for the current user",
      tags: ["Personal"],
    })
    .output(ListPointItemsOutputSchema)
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      return db
        .select()
        .from(pointItem)
        .where(eq(pointItem.userId, userId))
        .orderBy(desc(pointItem.date), desc(pointItem.createdAt));
    }),

  delete: authed
    .route({
      method: "DELETE",
      path: "/personal/points/delete",
      summary: "Delete a point item",
      tags: ["Personal"],
    })
    .input(DeletePointItemInputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      await db
        .delete(pointItem)
        .where(and(eq(pointItem.id, input.id), eq(pointItem.userId, userId)));
      return { success: true };
    }),

  getMemberPoints: authed
    .route({
      method: "GET",
      path: "/personal/points/member-points",
      summary: "Get all point items for a specific org member (org members only)",
      tags: ["Personal"],
    })
    .input(GetMemberPointsInputSchema)
    .output(ListPointItemsOutputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgMember(input.organizationId, context.session.user.id);

      return db
        .select()
        .from(pointItem)
        .where(eq(pointItem.userId, input.targetUserId))
        .orderBy(desc(pointItem.date), desc(pointItem.createdAt));
    }),

  getOrgLeaderboard: authed
    .route({
      method: "GET",
      path: "/personal/points/org-leaderboard",
      summary: "Get points leaderboard for an organization",
      tags: ["Personal"],
    })
    .input(GetPointsLeaderboardInputSchema)
    .output(GetPointsLeaderboardOutputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgMember(input.organizationId, context.session.user.id);

      const pointJoinConditions = [
        eq(pointItem.userId, member.userId),
        ...(input.startDate ? [gte(pointItem.date, input.startDate)] : []),
        ...(input.endDate ? [lte(pointItem.date, input.endDate)] : []),
      ];

      return db
        .select({
          memberId: member.id,
          memberName: user.name,
          memberEmail: user.email,
          memberImage: user.image,
          totalPoints: sql<number>`cast(coalesce(sum(${pointItem.amount}), 0) as int)`,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .leftJoin(pointItem, and(...pointJoinConditions))
        .where(eq(member.organizationId, input.organizationId))
        .groupBy(member.id, user.name, user.email, user.image)
        .orderBy(desc(sql`coalesce(sum(${pointItem.amount}), 0)`));
    }),
};
