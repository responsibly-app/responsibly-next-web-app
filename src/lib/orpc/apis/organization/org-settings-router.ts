import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod/v3";
import { db } from "@/lib/db";
import { member } from "@/lib/db/schema/better-auth-schema";
import { organizationSettings } from "@/lib/db/schema/org-settings-schema";
import { authed } from "@/lib/orpc/base";
import { ROLE_LEVELS, type OrgRole } from "@/lib/auth/hooks/oraganization/permissions";

const OrgSettingsSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  minAttendanceDurationMinutes: z.number(),
  zoomAutoMarkPresent: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const GetOrgSettingsInputSchema = z.object({
  organizationId: z.string(),
});

const UpdateOrgSettingsInputSchema = z.object({
  organizationId: z.string(),
  minAttendanceDurationMinutes: z.number().min(0).max(480).optional(),
  zoomAutoMarkPresent: z.boolean().optional(),
});

async function requireAtLeastRole(organizationId: string, userId: string, minRole: OrgRole) {
  const row = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)
    .then((rows) => rows[0]);
  if (!row) throw new ORPCError("FORBIDDEN");
  const userLevel = ROLE_LEVELS[row.role as OrgRole] ?? Infinity;
  if (userLevel > ROLE_LEVELS[minRole]) throw new ORPCError("FORBIDDEN");
}

export const orgSettingsRouter = {
  get: authed
    .route({
      method: "GET",
      path: "/organization/settings",
      summary: "Get settings for an organization",
      tags: ["Organization"],
    })
    .input(GetOrgSettingsInputSchema)
    .output(OrgSettingsSchema)
    .handler(async ({ input, context }) => {
      // Any member can read settings
      const memberRow = await db
        .select({ role: member.role })
        .from(member)
        .where(
          and(
            eq(member.organizationId, input.organizationId),
            eq(member.userId, context.session.user.id),
          ),
        )
        .limit(1)
        .then((r) => r[0]);
      if (!memberRow) throw new ORPCError("FORBIDDEN");

      const existing = await db
        .select()
        .from(organizationSettings)
        .where(eq(organizationSettings.organizationId, input.organizationId))
        .limit(1)
        .then((r) => r[0]);

      if (existing) return existing;

      // Auto-create defaults on first read
      const [created] = await db
        .insert(organizationSettings)
        .values({
          id: crypto.randomUUID(),
          organizationId: input.organizationId,
          minAttendanceDurationMinutes: 0,
          zoomAutoMarkPresent: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return created;
    }),

  update: authed
    .route({
      method: "PATCH",
      path: "/organization/settings",
      summary: "Update settings for an organization",
      tags: ["Organization"],
    })
    .input(UpdateOrgSettingsInputSchema)
    .output(OrgSettingsSchema)
    .handler(async ({ input, context }) => {
      await requireAtLeastRole(input.organizationId, context.session.user.id, "admin");

      const updateValues: Partial<typeof organizationSettings.$inferInsert> = {
        updatedAt: new Date(),
      };
      if (input.minAttendanceDurationMinutes !== undefined)
        updateValues.minAttendanceDurationMinutes = input.minAttendanceDurationMinutes;
      if (input.zoomAutoMarkPresent !== undefined)
        updateValues.zoomAutoMarkPresent = input.zoomAutoMarkPresent;

      // Upsert
      const [row] = await db
        .insert(organizationSettings)
        .values({
          id: crypto.randomUUID(),
          organizationId: input.organizationId,
          minAttendanceDurationMinutes: input.minAttendanceDurationMinutes ?? 0,
          zoomAutoMarkPresent: input.zoomAutoMarkPresent ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [organizationSettings.organizationId],
          set: updateValues,
        })
        .returning();

      return row;
    }),
};
