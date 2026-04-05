"use client";

import { useGetMemberRole } from "@/lib/auth/hooks";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole } from "@/lib/auth/hooks/oraganization/permissions";
import { OrgEventsList } from "./org-events-list";

type Props = { orgId: string };

export function OrgEventsContent({ orgId }: Props) {
  const { data: memberRoleData } = useGetMemberRole(orgId);
  const currentRole = memberRoleData?.role as OrgRole | undefined;
  const { canManage } = getPermissions(currentRole);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
      <OrgEventsList organizationId={orgId} canManage={canManage} />
    </div>
  );
}
