"use client";

import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { OrgEventsContent } from "@/components/organizations/events/org-events-page";

export default function EventsPage() {
  return (
    <OrgPageShell>
      {(orgId) => <OrgEventsContent orgId={orgId} />}
    </OrgPageShell>
  );
}
