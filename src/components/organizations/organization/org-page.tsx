"use client";

import { OrgPageShell } from "./org-page-shell";
import { OrgDetailView } from "./org-detail-view";

export function ActiveOrgDetail() {
  return (
    <OrgPageShell showHeader={true}>
      {(orgId) => <OrgDetailView orgId={orgId} />}
    </OrgPageShell>
  );
}
