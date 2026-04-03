"use client";

import * as React from "react";
import { BuildingIcon, ChevronsUpDownIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { OrgDetailView } from "@/components/organizations/org-detail-view";
import { OrgSwitcherDialog } from "@/components/dashboard/org-switcher";
import { useActiveOrganization } from "@/lib/auth/hooks/oraganization";

export function ActiveOrgDetail() {
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const { data: activeOrg, isPending } = useActiveOrganization();

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="text-muted-foreground size-6" />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 h-64 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <BuildingIcon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No active organization</p>
          <p className="text-xs text-muted-foreground mt-1">
            Select an organization to get started
          </p>
        </div>
        <OrgSwitcherDialog open={switcherOpen} onOpenChange={setSwitcherOpen}>
          <button
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <BuildingIcon className="size-4" />
            Select organization
            <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
          </button>
        </OrgSwitcherDialog>
      </div>
    );
  }

  return <OrgDetailView orgId={activeOrg.id} />;
}
