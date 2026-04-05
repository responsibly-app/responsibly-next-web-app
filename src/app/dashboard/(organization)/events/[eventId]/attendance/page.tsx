"use client";

import { use } from "react";
import { OrgPageShell } from "@/components/organizations/organization/org-page-shell";
import { EventAttendancePage } from "@/components/organizations/attendance/event-attendance-page";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default function EventAttendancePageRoute({ params }: PageProps) {
  const { eventId } = use(params);

  return (
    <OrgPageShell>
      {(orgId) => <EventAttendancePage eventId={eventId} organizationId={orgId} />}
    </OrgPageShell>
  );
}
