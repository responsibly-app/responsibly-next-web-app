"use client";

import { useState } from "react";
import { Building2, LogOut, MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteOrganization,
  useLeaveOrganization,
  useGetFullOrganization,
  useGetMemberRole,
  useListMembers,
} from "@/lib/auth/hooks";
import { InviteMemberDialog } from "../invitations/invite-member-dialog";
import { EditOrganizationDialog } from "./edit-organization-dialog";
import { OrgMembersList } from "../members/org-members-list";
import { OrgInvitationsList } from "../invitations/org-invitations-list";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole } from "@/lib/auth/hooks/oraganization/permissions";
import { OrgEventsList } from "../events/org-events-list";

type ConfirmAction = { type: "delete" | "leave" } | null;
type EditTarget = { id: string; name: string; slug: string } | null;

export function OrgDetailView({ orgId }: { orgId: string }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { data: fullOrg, isPending: orgPending } = useGetFullOrganization(orgId);
  const { data: memberRoleData } = useGetMemberRole(orgId);

  const deleteOrg = useDeleteOrganization();
  const leaveOrg = useLeaveOrganization();

  const { data: membersRaw } = useListMembers({ organizationId: orgId });
  const memberCount = membersRaw
    ? Array.isArray(membersRaw)
      ? membersRaw.length
      : ((membersRaw as { members?: unknown[] }).members?.length ?? 0)
    : null;
  const currentRole = memberRoleData?.role as OrgRole | undefined;
  const { canManage, canEditOrg, canDeleteOrg, canLeave } = getPermissions(currentRole);

  function handleConfirm() {
    if (!confirmAction || !fullOrg) return;
    if (confirmAction.type === "delete") {
      deleteOrg.mutate(orgId, {
        onSuccess: () => toast.success(`"${fullOrg.name}" deleted.`),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to delete organization."),
      });
    } else {
      leaveOrg.mutate(orgId, {
        onSuccess: () => toast.success(`Left "${fullOrg.name}".`),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to leave organization."),
      });
    }
    setConfirmAction(null);
  }

  if (orgPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!fullOrg) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Building2 className="text-muted-foreground mb-4 size-10" />
        <p className="font-medium">Organization not found</p>
        <p className="text-muted-foreground mt-1 text-sm">
          You may not have access to this organization.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Tabs */}
        <Tabs defaultValue="members">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-fit">
              <TabsTrigger value="members">
                Members
                {memberCount != null && memberCount > 0 && (
                  <span className="bg-primary text-primary-foreground ml-1.5 flex size-5 items-center justify-center rounded-full text-xs font-normal">
                    {memberCount}
                  </span>
                )}
              </TabsTrigger>
              {canManage && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
              {canManage && (
                <Button size="sm" onClick={() => setInviteOpen(true)}>
                  <UserPlus className="mr-1.5 size-3.5" />
                  Invite Member
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="size-9">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Organization actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canEditOrg && (
                    <DropdownMenuItem
                      onClick={() => setEditTarget({ id: orgId, name: fullOrg.name, slug: fullOrg.slug })}
                    >
                      <Pencil className="mr-2 size-4" />
                      Edit Organization
                    </DropdownMenuItem>
                  )}
                  {canDeleteOrg && (
                    <>
                      {canEditOrg && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setConfirmAction({ type: "delete" })}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete Organization
                      </DropdownMenuItem>
                    </>
                  )}
                  {canLeave && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setConfirmAction({ type: "leave" })}
                    >
                      <LogOut className="mr-2 size-4" />
                      Leave Organization
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <TabsContent value="members" className="mt-4">
            <OrgMembersList orgId={orgId} />
          </TabsContent>

          {canManage && (
            <TabsContent value="invitations" className="mt-4">
              <OrgInvitationsList orgId={orgId} />
            </TabsContent>
          )}

          <TabsContent value="events" className="mt-4">
            <OrgEventsList organizationId={orgId} canManage={canManage} />
          </TabsContent>
        </Tabs>
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} organizationId={orgId} />

      {editTarget && (
        <EditOrganizationDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          organization={editTarget}
        />
      )}

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "delete" ? "Delete Organization" : "Leave Organization"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "delete"
                ? `Are you sure you want to permanently delete "${fullOrg.name}"? This action cannot be undone.`
                : `Are you sure you want to leave "${fullOrg.name}"? You will lose access to this organization.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirm}
            >
              {confirmAction?.type === "delete" ? "Delete" : "Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
