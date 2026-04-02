import { db } from "@/lib/db";
import { member, organization } from "@/lib/db/schema/better-auth-schema";
import { eq } from "drizzle-orm";
import { authed } from "@/lib/orpc/base";
import { ListMyOrganizationsOutputSchema } from "./organization-schemas";

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
};
