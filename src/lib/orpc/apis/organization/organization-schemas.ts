import { z } from "zod/v3";

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
