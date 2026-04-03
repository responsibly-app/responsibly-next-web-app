"use client";

import { useState } from "react";
import { MoreHorizontal, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useListMembers, useRemoveMember, useGetMemberRole } from "@/lib/auth/hooks";
import { authClient } from "@/lib/auth/auth-client";
import { UpdateMemberRoleDialog } from "./update-member-role-dialog";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";

type MemberRow = {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  createdAt: Date | string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type RoleTarget = { memberId: string; memberName: string; currentRole: OrgRole } | null;

function roleBadgeVariant(role: OrgRole) {
  if (role === "owner") return "default" as const;
  if (role === "admin") return "secondary" as const;
  return "outline" as const;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function OrgMembersTab({ orgId }: { orgId: string }) {
  const [roleTarget, setRoleTarget] = useState<RoleTarget>(null);

  const { data: session } = authClient.useSession();
  const { data: membersRaw, isPending } = useListMembers({ organizationId: orgId });
  const { data: memberRoleData } = useGetMemberRole(orgId);
  const removeMember = useRemoveMember();

  const currentUserId = session?.user?.id;
  const currentRole = memberRoleData?.role as OrgRole | undefined;
  const { canManage, canRemoveMember, canUpdateMemberRole } = getPermissions(currentRole);

  const members: MemberRow[] = membersRaw
    ? Array.isArray(membersRaw)
      ? (membersRaw as MemberRow[])
      : ((membersRaw as { members?: MemberRow[] }).members ?? [])
    : [];

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

  return (
    <>
      <Card>
        <CardContent className="p-0">
          {isPending ? (
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
                                {canRemoveMember && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleRemove(member.id, member.user?.email ?? member.id)}
                                  >
                                    Remove
                                  </DropdownMenuItem>
                                )}
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

      <UpdateMemberRoleDialog
        open={!!roleTarget}
        onOpenChange={(open) => !open && setRoleTarget(null)}
        organizationId={orgId}
        memberId={roleTarget?.memberId ?? ""}
        memberName={roleTarget?.memberName ?? ""}
        currentRole={(roleTarget?.currentRole ?? "member") as OrgRole}
      />
    </>
  );
}
