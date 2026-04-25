import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { amaItem } from "@/lib/db/schema/personal-schema";
import { member } from "@/lib/db/schema/better-auth-schema";
import { ORPCError } from "@orpc/server";
import { authed } from "@/lib/orpc/base";
import {
  AddAmaItemInputSchema,
  AmaItemSchema,
  DeleteAmaItemInputSchema,
  GetMemberAmasInputSchema,
  ListAmaItemsOutputSchema,
  UpdateAmaItemInputSchema,
} from "./personal-schemas";

async function requireOrgMember(organizationId: string, userId: string) {
  const [row] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)));
  if (!row) throw new ORPCError("FORBIDDEN", { message: "Not a member of this organization" });
  return row;
}

export const amasRouter = {
  add: authed
    .route({
      method: "POST",
      path: "/personal/amas/add",
      summary: "Add an AMA recruit",
      tags: ["Personal"],
    })
    .input(AddAmaItemInputSchema)
    .output(AmaItemSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const id = crypto.randomUUID();

      const [row] = await db
        .insert(amaItem)
        .values({ id, userId, recruitName: input.recruitName, agentCode: input.agentCode ?? null, date: input.date, createdAt: new Date() })
        .returning();

      return row;
    }),

  list: authed
    .route({
      method: "GET",
      path: "/personal/amas/list",
      summary: "List all AMA recruits for the current user",
      tags: ["Personal"],
    })
    .output(ListAmaItemsOutputSchema)
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      return db
        .select()
        .from(amaItem)
        .where(eq(amaItem.userId, userId))
        .orderBy(desc(amaItem.date), desc(amaItem.createdAt));
    }),

  getMemberAmas: authed
    .route({
      method: "GET",
      path: "/personal/amas/member-amas",
      summary: "Get all AMA recruits for a specific org member (org members only)",
      tags: ["Personal"],
    })
    .input(GetMemberAmasInputSchema)
    .output(ListAmaItemsOutputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgMember(input.organizationId, context.session.user.id);

      return db
        .select()
        .from(amaItem)
        .where(eq(amaItem.userId, input.targetUserId))
        .orderBy(desc(amaItem.date), desc(amaItem.createdAt));
    }),

  delete: authed
    .route({
      method: "DELETE",
      path: "/personal/amas/delete",
      summary: "Delete an AMA recruit",
      tags: ["Personal"],
    })
    .input(DeleteAmaItemInputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      await db
        .delete(amaItem)
        .where(and(eq(amaItem.id, input.id), eq(amaItem.userId, userId)));
      return { success: true };
    }),

  update: authed
    .route({
      method: "PATCH",
      path: "/personal/amas/update",
      summary: "Update an AMA recruit",
      tags: ["Personal"],
    })
    .input(UpdateAmaItemInputSchema)
    .output(AmaItemSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const [row] = await db
        .update(amaItem)
        .set({ recruitName: input.recruitName, agentCode: input.agentCode ?? null, date: input.date })
        .where(and(eq(amaItem.id, input.id), eq(amaItem.userId, userId)))
        .returning();
      if (!row) throw new ORPCError("NOT_FOUND", { message: "AMA item not found" });
      return row;
    }),
};
