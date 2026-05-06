import { tool, zodSchema } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, organization } from "@/lib/db/schema/better-auth-schema";

export const meta = {
  name: "list_my_organizations",
  description: "List all organizations the current user belongs to and their role in each.",
  embeddingDescription:
    "Retrieve all organizations, groups, teams, or communities that the authenticated user is a member of, along with their assigned role in each. Use this when the user asks which organizations or groups they belong to, their memberships, their teams, their communities, what they are part of, or what role they hold in an org.",
} as const;

export function listMyOrganizations(userId: string) {
  return tool({
    description: meta.description,
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
  });
}
