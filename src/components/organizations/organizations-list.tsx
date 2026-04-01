"use client";

import { useState } from "react";
import { Building2, Plus, MoreHorizontal, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
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
  useListOrganizations,
  useActiveOrganization,
  useSetActiveOrganization,
  useDeleteOrganization,
  useLeaveOrganization,
  useGetActiveMemberRole,
} from "@/lib/auth/hooks";
import { CreateOrganizationDialog } from "./create-organization-dialog";

type OrgAction = { type: "leave" | "delete"; orgId: string; orgName: string } | null;

export function OrganizationsList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<OrgAction>(null);

  const { data: organizations, isPending } = useListOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const { data: activeRole } = useGetActiveMemberRole();
  const setActive = useSetActiveOrganization();
  const deleteOrg = useDeleteOrganization();
  const leaveOrg = useLeaveOrganization();

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

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => {
            const isActive = activeOrg?.id === org.id;
            const isOwner = isActive && activeRole === "owner";
            return (
              <Card
                key={org.id}
                className={isActive ? "ring-primary ring-2" : undefined}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {org.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={org.logo} alt={org.name} className="size-8 rounded-md object-cover" />
                      ) : (
                        <div className="bg-muted flex size-8 items-center justify-center rounded-md">
                          <Building2 className="text-muted-foreground size-4" />
                        </div>
                      )}
                      <CardTitle className="text-base">{org.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {isActive && <Badge variant="secondary">Active</Badge>}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
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
                  </div>
                  <CardDescription className="text-xs">/{org.slug}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={setActive.isPending}
                      onClick={() => setActive.mutate(org.id)}
                    >
                      Set as Active
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
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
