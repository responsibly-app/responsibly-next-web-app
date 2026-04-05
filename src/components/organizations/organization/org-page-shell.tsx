"use client";

import * as React from "react";
import { BuildingIcon, ChevronsUpDownIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { OrgSwitcherDialog } from "@/components/dashboard/org-switcher";
import { ActiveOrgHeader } from "./active-org-header";
import { useActiveOrganization } from "@/lib/auth/hooks/oraganization";

interface OrgPageShellProps {
  children: (orgId: string) => React.ReactNode;
  /** Show the ActiveOrgHeader above the page content. Default: true. */
  showHeader?: boolean;
}

export function OrgPageShell({ children, showHeader = true }: OrgPageShellProps) {
  const [switcherOpen, setSwitcherOpen] = React.useState(false);
  const { data: activeOrg, isPending } = useActiveOrganization();

  if (isPending) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    );
  }

  if (!activeOrg) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <BuildingIcon className="size-6 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">No organization selected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Select an organization to get started
          </p>
        </div>
        <OrgSwitcherDialog open={switcherOpen} onOpenChange={setSwitcherOpen}>
          <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
            <BuildingIcon className="size-4" />
            Select organization
            <ChevronsUpDownIcon className="size-4 text-muted-foreground" />
          </button>
        </OrgSwitcherDialog>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
      {showHeader && <ActiveOrgHeader org={activeOrg} />}
      {children(activeOrg.id)}
    </div>
  );
}
