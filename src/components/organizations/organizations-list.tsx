"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, MoreHorizontal, LogOut, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useListOrganizations,
  useActiveOrganization,
  useSetActiveOrganization,
  useDeleteOrganization,
  useLeaveOrganization,
  useGetActiveMemberRole,
} from "@/lib/auth/hooks";
import { authClient } from "@/lib/auth/auth-client";
import { CreateOrganizationDialog } from "./create-organization-dialog";

type OrgAction = { type: "leave" | "delete"; orgId: string; orgName: string } | null;

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  assistant: "Assistant",
  member: "Member",
};

function roleBadgeVariant(role: string) {
  if (role === "owner") return "default" as const;
  if (role === "admin") return "secondary" as const;
  return "outline" as const;
}

export function OrganizationsList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<OrgAction>(null);
  const [search, setSearch] = useState("");

  const { data: organizations, isPending } = useListOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const { data: activeRole } = useGetActiveMemberRole();
  const { data: session } = authClient.useSession();
  const setActive = useSetActiveOrganization();
  const deleteOrg = useDeleteOrganization();
  const leaveOrg = useLeaveOrganization();

  const currentUserId = session?.user?.id;

  const filtered = (organizations ?? []).filter((org) =>
    org.name.toLowerCase().includes(search.toLowerCase())
  );

  function getRoleForOrg(org: { id: string; members?: Array<{ userId: string; role: string }> }): string | undefined {
    if (org.id === activeOrg?.id && activeRole) return activeRole;
    if (!currentUserId || !org.members) return undefined;
    return org.members.find((m) => m.userId === currentUserId)?.role;
  }

  function handleConfirm() {
    if (!pendingAction) return;
    const { type, orgId, orgName } = pendingAction;

    if (type === "delete") {
      deleteOrg.mutate(orgId, {
        onSuccess: () => toast.success(`"${orgName}" deleted.`),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to delete organization."),
      });
    } else {
      leaveOrg.mutate(orgId, {
        onSuccess: () => toast.success(`Left "${orgName}".`),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to leave organization."),
      });
    }

    setPendingAction(null);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and switch between your organizations.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Organization
        </Button>
      </div>

      <div className="relative">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          placeholder="Search organizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-md" />
          ))}
        </div>
      ) : !organizations || organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Building2 className="text-muted-foreground mb-4 size-10" />
          <p className="font-medium">No organizations yet</p>
          <p className="text-muted-foreground mt-1 text-sm">Create your first organization to get started.</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            New Organization
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <p className="text-muted-foreground text-sm">No organizations match your search.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((org) => {
                const isActive = activeOrg?.id === org.id;
                const role = getRoleForOrg(org as { id: string; members?: Array<{ userId: string; role: string }> });
                const isOwner = role === "owner";

                return (
                  <TableRow key={org.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/organizations/${org.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        {org.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={org.logo} alt={org.name} className="size-8 rounded-md object-cover" />
                        ) : (
                          <div className="bg-muted flex size-8 items-center justify-center rounded-md">
                            <Building2 className="text-muted-foreground size-4" />
                          </div>
                        )}
                        <div className="leading-tight">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{org.name}</p>
                            {isActive && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">/{org.slug}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {role && (
                        <Badge variant={roleBadgeVariant(role)}>
                          {ROLE_LABELS[role] ?? role}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        {!isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={setActive.isPending}
                            onClick={() => setActive.mutate(org.id)}
                          >
                            Set Active
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Organization actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {isOwner ? (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    setPendingAction({ type: "delete", orgId: org.id, orgName: org.name })
                                  }
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Delete Organization
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() =>
                                  setPendingAction({ type: "leave", orgId: org.id, orgName: org.name })
                                }
                              >
                                <LogOut className="mr-2 size-4" />
                                Leave Organization
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "delete" ? "Delete Organization" : "Leave Organization"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "delete"
                ? `Are you sure you want to permanently delete "${pendingAction.orgName}"? This action cannot be undone and will remove all members and data.`
                : `Are you sure you want to leave "${pendingAction?.orgName}"? You will lose access to this organization.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirm}
            >
              {pendingAction?.type === "delete" ? "Delete" : "Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
