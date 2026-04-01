"use client";

import { useState } from "react";
import { toast } from "sonner";
import { UserRound, UserPlus, MoreHorizontal, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  useActiveOrganization,
  useListMembers,
  useGetActiveMemberRole,
  useRemoveMember,
  useUpdateMemberRole,
  useLeaveOrganization,
} from "@/lib/auth/hooks";
import { authClient } from "@/lib/auth/auth-client";
import { InviteMemberDialog } from "./invite-member-dialog";
import type { OrgRole } from "@/lib/auth/hooks";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
};

function roleBadgeVariant(role: string) {
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

export function OrgMembersSection() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const { data: activeOrg } = useActiveOrganization();
  const { data: session } = authClient.useSession();
  const { data: currentRole } = useGetActiveMemberRole();

  const orgId = activeOrg?.id ?? "";

  const { data: membersData, isPending } = useListMembers(
    { organizationId: orgId },
  );

  const removeMember = useRemoveMember();
  const updateRole = useUpdateMemberRole();
  const leaveOrg = useLeaveOrganization();

  if (!activeOrg) return null;

  const members = (membersData as { members?: MemberRow[] } | MemberRow[] | null)
    ? Array.isArray(membersData)
      ? (membersData as MemberRow[])
      : ((membersData as { members?: MemberRow[] })?.members ?? [])
    : [];

  const canManage = currentRole === "owner" || currentRole === "admin";
  const canLeave = currentRole !== "owner";

  function handleRemove(memberId: string, email: string) {
    removeMember.mutate(
      { memberIdOrEmail: memberId, organizationId: orgId },
      {
        onSuccess: () => toast.success(`${email} removed from organization.`),
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to remove member."),
      },
    );
  }

  function handleRoleChange(memberId: string, role: OrgRole) {
    updateRole.mutate(
      { memberId, role, organizationId: orgId },
      {
        onError: (err: { message?: string }) =>
          toast.error(err?.message ?? "Failed to update role."),
      },
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold">
            Members{members.length > 0 && (
              <span className="text-muted-foreground ml-2 font-normal">
                ({members.length})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {canLeave && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setLeaveConfirmOpen(true)}
              >
                <LogOut className="mr-1.5 size-3.5" />
                Leave
              </Button>
            )}
            {canManage && (
              <Button size="sm" onClick={() => setInviteOpen(true)}>
                <UserPlus className="mr-1.5 size-3.5" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isPending ? (
            <div className="space-y-3 px-6 pb-6">
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
                  const isSelf = session?.user?.id === member.userId;
                  const isOwner = member.role === "owner";
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
                                <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {member.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={roleBadgeVariant(member.role)}>
                          {ROLE_LABELS[member.role] ?? member.role}
                        </Badge>
                      </TableCell>
                      {canManage && (
                        <TableCell>
                          {!isSelf && !isOwner && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                >
                                  <MoreHorizontal className="size-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {currentRole === "owner" && (
                                  <>
                                    {member.role !== "admin" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleRoleChange(member.id, "admin")
                                        }
                                      >
                                        Make Admin
                                      </DropdownMenuItem>
                                    )}
                                    {member.role !== "member" && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleRoleChange(member.id, "member")
                                        }
                                      >
                                        Make Member
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    handleRemove(member.id, member.user?.email ?? member.id)
                                  }
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

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        organizationId={orgId}
      />

      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Organization</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to leave &ldquo;{activeOrg?.name}&rdquo;? You will lose access to this organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                leaveOrg.mutate(orgId, {
                  onSuccess: () => toast.success(`Left "${activeOrg?.name}".`),
                  onError: (err: { message?: string }) =>
                    toast.error(err?.message ?? "Failed to leave organization."),
                });
              }}
            >
              Leave
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

type MemberRow = {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  createdAt: Date | string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
};
