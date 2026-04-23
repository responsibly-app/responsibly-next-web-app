import { db } from "@/lib/db";
import { member, organization } from "@/lib/db/schema/better-auth-schema";
import { and, eq } from "drizzle-orm";
import { authed } from "@/lib/orpc/base";
import { GetMemberRoleInputSchema, GetMemberRoleOutputSchema, GetRolesInputSchema, GetRolesOutputSchema, ListMyOrganizationsOutputSchema, UpdateMemberLevelInputSchema, UpdateMemberLevelOutputSchema } from "./organization-schemas";
import { ALL_ASSIGNABLE_ROLES, canAssignRole, INVITABLE_ROLES, OrgRole, ROLE_LEVELS, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";
import { ORPCError } from "@orpc/server";

export const organizationRouter = {
  listMine: authed
    .route({
      method: "GET",
      path: "/organization/mine",
      summary: "List all organizations the current user belongs to, including their role",
      tags: ["Organization"],
    })
    .output(ListMyOrganizationsOutputSchema)
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      const rows = await db
        .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          createdAt: organization.createdAt,
          metadata: organization.metadata,
          role: member.role,
          memberId: member.id,
        })
        .from(member)
        .innerJoin(organization, eq(member.organizationId, organization.id))
        .where(eq(member.userId, userId));

      return rows;
    }),

  getMemberRole: authed
    .route({
      method: "GET",
      path: "/organization/member-role",
      summary: "Get the current user's role in a specific organization",
      tags: ["Organization"],
    })
    .input(GetMemberRoleInputSchema)
    .output(GetMemberRoleOutputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const row = await db
        .select({ role: member.role })
        .from(member)
        .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, userId)))
        .limit(1)
        .then((rows) => rows[0]);

      return { role: row?.role ?? null };
    }),

  getAssignableRoles: authed
    .route({
      method: "GET",
      path: "/organization/assignable-roles",
      summary: "Get roles the current user can assign to other members",
      tags: ["Organization"],
    })
    .input(GetRolesInputSchema)
    .output(GetRolesOutputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const row = await db
        .select({ role: member.role })
        .from(member)
        .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, userId)))
        .limit(1)
        .then((rows) => rows[0]);

      const actorRole = (row?.role ?? null) as OrgRole | null;
      if (!actorRole) return [];

      return ALL_ASSIGNABLE_ROLES
        .filter((role) => canAssignRole(actorRole, role))
        .map((role) => ({ role, ...ROLE_META[role] }));
    }),

  getInvitableRoles: authed
    .route({
      method: "GET",
      path: "/organization/invitable-roles",
      summary: "Get roles the current user can use when inviting new members",
      tags: ["Organization"],
    })
    .input(GetRolesInputSchema)
    .output(GetRolesOutputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const row = await db
        .select({ role: member.role })
        .from(member)
        .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, userId)))
        .limit(1)
        .then((rows) => rows[0]);

      const actorRole = (row?.role ?? null) as OrgRole | null;
      if (!actorRole) return [];

      return INVITABLE_ROLES
        .filter((role) => canAssignRole(actorRole, role))
        .map((role) => ({ role, ...ROLE_META[role] }));
    }),

  updateMemberLevel: authed
    .route({
      method: "PATCH",
      path: "/organization/member-level",
      summary: "Update a member's WFG level (owner/admin only)",
      tags: ["Organization"],
    })
    .input(UpdateMemberLevelInputSchema)
    .output(UpdateMemberLevelOutputSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      const actorRow = await db
        .select({ role: member.role })
        .from(member)
        .where(and(eq(member.organizationId, input.organizationId), eq(member.userId, userId)))
        .limit(1)
        .then((rows) => rows[0]);

      const actorRole = (actorRow?.role ?? null) as OrgRole | null;
      if (!actorRole || (ROLE_LEVELS[actorRole] ?? Infinity) > ROLE_LEVELS["admin"]) {
        throw new ORPCError("FORBIDDEN", { message: "Only owners and admins can update member levels." });
      }

      await db
        .update(member)
        .set({ level: input.level })
        .where(and(eq(member.id, input.memberId), eq(member.organizationId, input.organizationId)));

      return { success: true };
    }),
};
