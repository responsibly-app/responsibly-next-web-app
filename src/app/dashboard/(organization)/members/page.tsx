"use client";

import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { OrgMembersPage } from "@/components/organizations/members/org-members-page";

export default function MembersPage() {
  return (
    <OrgPageShell>
      {(orgId) => <OrgMembersPage orgId={orgId} />}
    </OrgPageShell>
  );
}
