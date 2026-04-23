import { z } from "zod/v3";

export const GetMemberRoleInputSchema = z.object({
  organizationId: z.string(),
});

export const GetMemberRoleOutputSchema = z.object({
  role: z.string().nullable(),
});

export const OrgWithRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().nullable(),
  createdAt: z.date(),
  metadata: z.string().nullable(),
  role: z.string(),
  memberId: z.string(),
});

export type OrgWithRole = z.infer<typeof OrgWithRoleSchema>;

export const ListMyOrganizationsOutputSchema = z.array(OrgWithRoleSchema);

export const GetRolesInputSchema = z.object({
  organizationId: z.string(),
});

const OrgRoleSchema = z.enum(["owner", "admin", "member", "assistant", "priviledgedMember"]);

export const RoleMetaSchema = z.object({
  role: OrgRoleSchema,
  label: z.string(),
  description: z.string(),
});

export const GetRolesOutputSchema = z.array(RoleMetaSchema);

export const UpdateMemberLevelInputSchema = z.object({
  memberId: z.string(),
  organizationId: z.string(),
  level: z.string(),
});

export const UpdateMemberLevelOutputSchema = z.object({
  success: z.boolean(),
});
