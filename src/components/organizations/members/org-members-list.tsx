"use client";

import { useState } from "react";
import { MoreHorizontal, UserRound, Search, ExternalLink } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Input } from "@/components/ui/input";
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
import { UpdateMemberLevelDialog } from "./update-member-level-dialog";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";
import { WFG_LEVEL_META, WFG_LEVELS, type WFGLevel } from "@/lib/auth/hooks/oraganization/levels";
import { routes } from "@/routes";

type MemberRow = {
  id: string;
  userId: string;
  organizationId: string;
  role: OrgRole;
  level?: string | null;
  createdAt: Date | string;
  user: { id: string; name: string; email: string; image?: string | null };
};

type RoleTarget = { memberId: string; memberName: string; currentRole: OrgRole } | null;
type LevelTarget = { memberId: string; memberName: string; currentLevel: WFGLevel } | null;

function roleBadgeVariant(role: OrgRole) {
  if (role === "owner") return "default" as const;
  if (role === "admin") return "secondary" as const;
  return "outline" as const;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function OrgMembersList({ orgId }: { orgId: string }) {
  const [roleTarget, setRoleTarget] = useState<RoleTarget>(null);
  const [levelTarget, setLevelTarget] = useState<LevelTarget>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<OrgRole | "all">("all");
  const [levelFilter, setLevelFilter] = useState<WFGLevel | "all">("all");

  const { data: session } = authClient.useSession();
  const { data: membersRaw, isPending } = useListMembers({ organizationId: orgId });
  const { data: memberRoleData } = useGetMemberRole(orgId);
  const removeMember = useRemoveMember();

  const currentUserId = session?.user?.id;
  const currentRole = memberRoleData?.role as OrgRole | undefined;
  const { canRemoveMember, canUpdateMemberRole } = getPermissions(currentRole);

  const allMembers: MemberRow[] = membersRaw
    ? Array.isArray(membersRaw)
      ? (membersRaw as MemberRow[])
      : ((membersRaw as { members?: MemberRow[] }).members ?? [])
    : [];

  const levelCounts = allMembers.reduce<Partial<Record<WFGLevel, number>>>((acc, m) => {
    if (m.level && m.level in WFG_LEVEL_META) {
      const lvl = m.level as WFGLevel;
      acc[lvl] = (acc[lvl] ?? 0) + 1;
    }
    return acc;
  }, {});

  const levelCountEntries = (Object.keys(WFG_LEVELS) as WFGLevel[]).filter(
    (lvl) => (levelCounts[lvl] ?? 0) > 0,
  );

  const members = allMembers.filter((m) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!m.user?.name?.toLowerCase().includes(q) && !m.user?.email?.toLowerCase().includes(q))
        return false;
    }
    if (roleFilter !== "all" && m.role !== roleFilter) return false;
    if (levelFilter !== "all" && m.level !== levelFilter) return false;
    return true;
  });

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
      {!isPending && levelCountEntries.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {levelCountEntries.map((lvl) => {
            const active = levelFilter === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setLevelFilter(active ? "all" : lvl)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors hover:bg-muted ${active ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : ""}`}
              >
                <span className="font-mono font-semibold">{WFG_LEVEL_META[lvl].abbreviation}</span>
                <span className={active ? "opacity-80" : "text-muted-foreground"}>{levelCounts[lvl]}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="my-2 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as OrgRole | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {(["owner", "admin", "assistant", "priviledgedMember", "member"] as OrgRole[]).map((r) => (
              <SelectItem key={r} value={r}>{ROLE_META[r].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as WFGLevel | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {(Object.keys(WFG_LEVELS) as WFGLevel[]).map((lvl) => (
              <SelectItem key={lvl} value={lvl}>
                {WFG_LEVEL_META[lvl].abbreviation} — {WFG_LEVEL_META[lvl].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
              <p className="text-muted-foreground text-sm">
                {search.trim() || roleFilter !== "all" || levelFilter !== "all"
                  ? "No members match your filters"
                  : "No members yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  {canRemoveMember && <TableHead className="w-12" />}
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
                            <Link
                              href={routes.dashboard.memberProfile(member.userId)}
                              className="group flex items-center gap-1 text-sm font-medium hover:underline"
                            >
                              {member.user?.name}
                              {isSelf && (
                                <span className="text-muted-foreground ml-1 text-xs font-normal">(you)</span>
                              )}
                              <ExternalLink className="size-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                            </Link>
                            <p className="text-muted-foreground text-xs">{member.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canUpdateMemberRole && !isSelf && !memberIsOwner ? (
                          <Badge
                            variant={roleBadgeVariant(member.role)}
                            className="cursor-pointer hover:opacity-75 transition-opacity"
                            onClick={() =>
                              setRoleTarget({
                                memberId: member.id,
                                memberName: member.user?.name ?? member.user?.email ?? member.id,
                                currentRole: member.role,
                              })
                            }
                          >
                            {ROLE_META[member.role]?.label ?? member.role}
                          </Badge>
                        ) : (
                          <Badge variant={roleBadgeVariant(member.role)}>
                            {ROLE_META[member.role]?.label ?? member.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {member.level ? (
                          canUpdateMemberRole && !isSelf && !memberIsOwner ? (
                            <Badge
                              variant="outline"
                              className="font-mono text-xs cursor-pointer hover:opacity-75 transition-opacity"
                              onClick={() =>
                                setLevelTarget({
                                  memberId: member.id,
                                  memberName: member.user?.name ?? member.user?.email ?? member.id,
                                  currentLevel: (member.level as WFGLevel) ?? "ta",
                                })
                              }
                            >
                              {WFG_LEVEL_META[member.level as WFGLevel]?.abbreviation ?? member.level.toUpperCase()}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="font-mono text-xs">
                              {WFG_LEVEL_META[member.level as WFGLevel]?.abbreviation ?? member.level.toUpperCase()}
                            </Badge>
                          )
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      {canRemoveMember && (
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
            </div>
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

      <UpdateMemberLevelDialog
        open={!!levelTarget}
        onOpenChange={(open) => !open && setLevelTarget(null)}
        organizationId={orgId}
        memberId={levelTarget?.memberId ?? ""}
        memberName={levelTarget?.memberName ?? ""}
        currentLevel={levelTarget?.currentLevel ?? "ta"}
      />
    </>
  );
}
