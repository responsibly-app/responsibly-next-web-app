"use client";

import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { OrgAttendancePage } from "@/components/organizations/attendance/org-attendance-page";

export default function AttendancePage() {
  return (
    <OrgPageShell>
      {(orgId) => <OrgAttendancePage orgId={orgId} />}
    </OrgPageShell>
  );
}
