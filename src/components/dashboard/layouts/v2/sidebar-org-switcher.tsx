"use client";

import * as React from "react";
import { Building2, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgSwitcherDialog } from "../../org-switcher";
import { useActiveOrganization } from "@/lib/auth/hooks/oraganization";

interface OrgSwitcherButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  orgName?: string;
  isExpanded?: boolean;
}

export const OrgSwitcherButton = React.forwardRef<HTMLButtonElement, OrgSwitcherButtonProps>(
  ({ orgName, isExpanded, ...props }, ref) => {
    const expanded = isExpanded ?? true;
    return (
      <button
        ref={ref}
        {...props}
        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-foreground hover:bg-sidebar-primary/10 transition-colors mb-1 border-border border"
      >
        <span className="flex size-5 shrink-0 items-center justify-center">
          <Building2 className="size-4" />
        </span>
        <span
          className={cn(
            "flex-1 min-w-0 truncate whitespace-nowrap text-left text-sm font-medium overflow-hidden transition-[opacity,max-width] duration-200",
            expanded ? "opacity-100" : "opacity-0 max-w-0",
          )}
        >
          {orgName ?? "Select organization"}
        </span>
        <ChevronsUpDown
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-opacity duration-200",
            expanded ? "opacity-100" : "opacity-0",
          )}
        />
      </button>
    );
  },
);
OrgSwitcherButton.displayName = "OrgSwitcherButton";

interface SidebarOrgSwitcherProps {
  isExpanded?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarOrgSwitcher({ isExpanded, onOpenChange }: SidebarOrgSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const { data: activeOrg } = useActiveOrganization();

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    onOpenChange?.(value);
  };

  return (
    <OrgSwitcherDialog open={open} onOpenChange={handleOpenChange}>
      <OrgSwitcherButton orgName={activeOrg?.name} isExpanded={isExpanded} />
    </OrgSwitcherDialog>
  );
}
