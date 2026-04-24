"use client";

import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { OrgBaseshopPage } from "@/components/organizations/baseshop/org-baseshop-page";

export default function BaseshopPage() {
  return (
    <OrgPageShell>
      {(orgId) => <OrgBaseshopPage orgId={orgId} />}
    </OrgPageShell>
  );
}
