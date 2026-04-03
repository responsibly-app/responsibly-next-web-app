"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, LogOut, Mail, MoreHorizontal, Pencil, Trash2, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useActiveOrganization,
  useSetActiveOrganization,
  useDeleteOrganization,
  useLeaveOrganization,
  useListMembers,
  useListInvitations,
  useGetFullOrganization,
  useRemoveMember,
  useCancelInvitation,
  useGetMemberRole,
} from "@/lib/auth/hooks";
import { authClient } from "@/lib/auth/auth-client";
import { InviteMemberDialog } from "./invite-member-dialog";
import { EditOrganizationDialog } from "./edit-organization-dialog";
import { UpdateMemberRoleDialog } from "./update-member-role-dialog";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";

type ConfirmAction = { type: "delete" | "leave" } | null;
type EditTarget = { id: string; name: string; slug: string } | null;
type RoleTarget = { memberId: string; memberName: string; currentRole: OrgRole } | null;

function roleBadgeVariant(role: OrgRole) {
  if (role === "owner") return "default" as const;
  if (role === "admin") return "secondary" as const;
  return "outline" as const;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type MemberRow = {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  createdAt: Date | string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type Invitation = {
  id: string;
  email: string;
  role: OrgRole;
  status: "pending" | "accepted" | "rejected" | "canceled";
  expiresAt: Date | string;
};

export function OrgDetailView({ orgId }: { orgId: string }) {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [roleTarget, setRoleTarget] = useState<RoleTarget>(null);

  const { data: activeOrg } = useActiveOrganization();
  const { data: session } = authClient.useSession();
  const { data: fullOrg, isPending: orgPending } = useGetFullOrganization(orgId);
  const { data: membersRaw, isPending: membersPending } = useListMembers({ organizationId: orgId });
  const { data: invitationsRaw, isPending: invitationsPending } = useListInvitations(orgId);

  const setActive = useSetActiveOrganization();
  const deleteOrg = useDeleteOrganization();
  const leaveOrg = useLeaveOrganization();
  const removeMember = useRemoveMember();
  const cancelInvitation = useCancelInvitation();

  const isActive = activeOrg?.id === orgId;
  const currentUserId = session?.user?.id;

  const { data: memberRoleData } = useGetMemberRole(orgId);
  const currentRole = memberRoleData?.role as OrgRole | undefined;

  const members: MemberRow[] = membersRaw
    ? Array.isArray(membersRaw)
      ? (membersRaw as MemberRow[])
      : ((membersRaw as { members?: MemberRow[] }).members ?? [])
    : [];

  const invitations: Invitation[] = (
    invitationsRaw == null
      ? []
      : Array.isArray(invitationsRaw)
        ? (invitationsRaw as Invitation[])
        : ((invitationsRaw as { invitations?: Invitation[] }).invitations ?? [])
  ).filter((inv) => inv.status === "pending");
  const { canCreateInvitation, canRemoveMember, canUpdateMemberRole, canEditOrg, canDeleteOrg, canManage, canLeave } =
    getPermissions(currentRole);

  function handleRemove(memberId: string, email: string) {
    removeMember.mutate(
      { memberIdOrEmail: memberId, organizationId: orgId },
      {
        onSuccess: () => toast.success(`${email} removed.`),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to remove member."),
      },
    );
  }

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
      <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!fullOrg) {
    return (
      <div className="mx-auto w-full max-w-5xl p-2 pt-5">
        <Link
          href="/dashboard/organizations"
          className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          Organizations
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Building2 className="text-muted-foreground mb-4 size-10" />
          <p className="font-medium">Organization not found</p>
          <p className="text-muted-foreground mt-1 text-sm">You may not have access to this organization.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
        <Link
          href="/dashboard/organizations"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeft className="size-4" />
          Organizations
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {fullOrg.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fullOrg.logo} alt={fullOrg.name} className="size-12 rounded-lg object-cover" />
            ) : (
              <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
                <Building2 className="text-muted-foreground size-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight">{fullOrg.name}</h1>
                {isActive && <Badge variant="secondary">Active</Badge>}
                {currentRole && (
                  <Badge variant={roleBadgeVariant(currentRole)}>
                    {ROLE_META[currentRole].label ?? currentRole}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground text-sm">/{fullOrg.slug}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isActive && (
              <Button
                variant="outline"
                size="sm"
                disabled={setActive.isPending}
                onClick={() => setActive.mutate(orgId)}
              >
                Set Active
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
                    onClick={() =>
                      setEditTarget({ id: orgId, name: fullOrg.name, slug: fullOrg.slug })
                    }
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

        {/* Tabs: Members & Invitations */}
        <Tabs defaultValue="members">
          <div className="flex items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="members">
                Members
                {members.length > 0 && (
                  <span className="bg-primary text-primary-foreground ml-1.5 rounded-full px-1.5 py-0.5 text-xs font-normal">
                    {members.length}
                  </span>
                )}
              </TabsTrigger>
              {canManage && (
                <TabsTrigger value="invitations">
                  Invitations
                  {invitations.length > 0 && (
                    <span className="bg-muted text-muted-foreground ml-1.5 rounded px-1.5 py-0.5 text-xs font-normal">
                      {invitations.length}
                    </span>
                  )}
                </TabsTrigger>
              )}
            </TabsList>
            {canManage && (
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="mr-1.5 size-3.5" />
                Invite Member
              </Button>
            )}
          </div>

          <TabsContent value="members" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {membersPending ? (
                  <div className="space-y-3 px-6 py-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <UserRound className="text-muted-foreground mb-3 size-8" />
                    <p className="text-muted-foreground text-sm">No members yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        {canManage && <TableHead className="w-12" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => {
                        const isSelf = currentUserId === member.userId;
                        const memberIsOwner = member.role === "owner";
                        return (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="size-8">
                                  <AvatarImage src={member.user?.image ?? undefined} />
                                  <AvatarFallback className="text-xs">
                                    {member.user?.name ? initials(member.user.name) : "?"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="leading-tight">
                                  <p className="text-sm font-medium">
                                    {member.user?.name}
                                    {isSelf && (
                                      <span className="text-muted-foreground ml-1.5 text-xs font-normal">(you)</span>
                                    )}
                                  </p>
                                  <p className="text-muted-foreground text-xs">{member.user?.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={roleBadgeVariant(member.role)}>
                                {ROLE_META[member.role]?.label ?? member.role}
                              </Badge>
                            </TableCell>
                            {canManage && (
                              <TableCell>
                                {!isSelf && !memberIsOwner && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="size-8">
                                        <MoreHorizontal className="size-4" />
                                        <span className="sr-only">Actions</span>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {canUpdateMemberRole && (
                                        <>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              setRoleTarget({
                                                memberId: member.id,
                                                memberName: member.user?.name ?? member.user?.email ?? member.id,
                                                currentRole: member.role,
                                              })
                                            }
                                          >
                                            Update Role
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                        </>
                                      )}
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => handleRemove(member.id, member.user?.email ?? member.id)}
                                      >
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canManage && (
            <TabsContent value="invitations" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {invitationsPending ? (
                    <div className="space-y-3 px-6 py-6">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                      ))}
                    </div>
                  ) : invitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Mail className="text-muted-foreground mb-3 size-8" />
                      <p className="text-muted-foreground text-sm">No pending invitations</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="w-24" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((inv) => (
                          <TableRow key={inv.id}>
                            <TableCell className="text-sm">{inv.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{ROLE_META[inv.role]?.label ?? inv.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive h-7 px-2 text-xs"
                                disabled={cancelInvitation.isPending && cancelInvitation.variables?.invitationId === inv.id}
                                onClick={() =>
                                  cancelInvitation.mutate({ invitationId: inv.id, email: inv.email })
                                }
                              >
                                {cancelInvitation.isPending && cancelInvitation.variables?.invitationId === inv.id ? (
                                  <Spinner className="size-3" />
                                ) : (
                                  "Cancel"
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>

      <InviteMemberDialog open={inviteOpen} onOpenChange={setInviteOpen} organizationId={orgId} />
      <UpdateMemberRoleDialog
        open={!!roleTarget}
        onOpenChange={(open) => !open && setRoleTarget(null)}
        organizationId={orgId}
        memberId={roleTarget?.memberId ?? ""}
        memberName={roleTarget?.memberName ?? ""}
        currentRole={(roleTarget?.currentRole ?? "member") as OrgRole}
      />
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
