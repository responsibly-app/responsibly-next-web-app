"use client";

import * as React from "react";
import { ChevronsUpDownIcon, SearchIcon, BuildingIcon, CheckIcon, Settings2Icon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useListMyOrganizations,
  useActiveOrganization,
  useSetActiveOrganization,
} from "@/lib/auth/hooks/oraganization";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  assistant: "Assistant",
  priviledgedMember: "Privileged",
};

// ─── Shared dialog ────────────────────────────────────────────────────────────

export function OrgSwitcherDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string | null>(null);
  const [activatingId, setActivatingId] = React.useState<string | null>(null);

  const { data: organizations, isLoading } = useListMyOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const { mutate: setActiveOrg, isPending } = useSetActiveOrganization();

  const filtered = React.useMemo(() => {
    if (!organizations) return [];
    return organizations.filter((org) => {
      const matchesSearch = org.name.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter ? org.role === roleFilter : true;
      return matchesSearch && matchesRole;
    });
  }, [organizations, search, roleFilter]);

  const uniqueRoles = React.useMemo(() => {
    if (!organizations) return [];
    return Array.from(new Set(organizations.map((o) => o.role)));
  }, [organizations]);

  function handleSelect(orgId: string) {
    setActivatingId(orgId);
    setActiveOrg(orgId, {
      // onSuccess: () => setTimeout(() => onOpenChange(false), 1.5 * 1000), // Small delay before closing
      onSuccess: () => onOpenChange(false),
      onSettled: () => setActivatingId(null),
    });
  }

  // Reset search/filter when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setRoleFilter(null);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Switch Organization</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Role filter pills */}
        {uniqueRoles.length > 1 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setRoleFilter(null)}
              className={cn(
                "text-xs px-2.5 py-1 rounded-full border transition-colors",
                roleFilter === null
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/40"
              )}
            >
              All
            </button>
            {uniqueRoles.map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? null : role)}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full border transition-colors capitalize",
                  roleFilter === role
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/40"
                )}
              >
                {ROLE_LABELS[role] ?? role}
              </button>
            ))}
          </div>
        )}

        {/* Organization list */}
        <div className="flex flex-col gap-1 max-h-72 overflow-y-auto -mx-1 px-1">
          {isLoading && (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
          )}
          {!isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No organizations found.
            </p>
          )}
          {filtered.map((org) => {
            const isActive = activeOrg?.id === org.id;
            const isActivating = activatingId === org.id;
            return (
              <button
                key={org.id}
                onClick={() => handleSelect(org.id)}
                disabled={isPending || isActivating || isActive}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-muted"
                )}
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <BuildingIcon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{org.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{org.slug}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs capitalize">
                    {ROLE_LABELS[org.role] ?? org.role}
                  </Badge>
                  {isActivating ? (
                    <Spinner className="size-4" />
                  ) : (
                    isActive && <CheckIcon className="size-4 text-primary" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t pt-3 -mx-6 px-6">
          <Link
            href="/dashboard/organizations"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Settings2Icon className="size-4" />
            Manage organizations
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sidebar trigger ──────────────────────────────────────────────────────────

export function OrgSwitcher() {
  const [open, setOpen] = React.useState(false);
  const { data: activeOrg, isPending: isActiveOrgLoading } = useActiveOrganization();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <OrgSwitcherDialog open={open} onOpenChange={setOpen}>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <BuildingIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              {isActiveOrgLoading ? (
                <Spinner className="size-4" />
              ) : (
                <>
                  <span className="truncate font-medium">
                    {activeOrg?.name ?? "Select organization"}
                  </span>
                  {activeOrg && (
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {activeOrg.slug}
                    </span>
                  )}
                </>
              )}
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </SidebarMenuButton>
        </OrgSwitcherDialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
