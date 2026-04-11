"use client";

import { useState } from "react";
import { Building2, CheckCheck, LogOut, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  useActiveOrganization,
  useDeleteOrganization,
  useLeaveOrganization,
  useListMyOrganizations,
  useSetActiveOrganization,
} from "@/lib/auth/hooks";
import { getPermissions } from "@/lib/auth/hooks/oraganization/access-control";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { EditOrganizationDialog } from "./edit-organization-dialog";

type OrgAction = { type: "leave" | "delete"; orgId: string; orgName: string } | null;
type EditTarget = { id: string; name: string; slug: string } | null;

const LEAVE_WORD = "leave";

function roleBadgeVariant(role: OrgRole) {
  if (role === "owner") return "default" as const;
  if (role === "admin") return "secondary" as const;
  return "outline" as const;
}

export function OrganizationsList() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [pendingAction, setPendingAction] = useState<OrgAction>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<"all" | "mine">("all");

  const { data: organizations, isPending } = useListMyOrganizations();
  const { data: activeOrg } = useActiveOrganization();
  const setActive = useSetActiveOrganization();
  const deleteOrg = useDeleteOrganization();
  const leaveOrg = useLeaveOrganization();

  const filtered = (organizations ?? []).filter((org) => {
    if (!org.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (ownerFilter === "mine" && org.role !== "owner") return false;
    return true;
  });

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
    setConfirmInput("");
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and switch between your organizations.
          </p>
        </div>
        <Button className="shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Organization
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 rounded-2xl border p-1">
          <Button
            variant={ownerFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setOwnerFilter("all")}
          >
            All
          </Button>
          <Button
            variant={ownerFilter === "mine" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setOwnerFilter("mine")}
          >
            My Own
          </Button>
        </div>
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : !organizations || organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <Building2 className="mb-4 size-10 text-muted-foreground" />
          <p className="font-medium">No organizations yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first organization to get started.
          </p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            New Organization
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {ownerFilter === "mine"
              ? "You don't own any organizations matching your search."
              : "No organizations match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <div className="divide-y">
            {filtered.map((org) => {
              const isActive = activeOrg?.id === org.id;
              const role = org.role as OrgRole;
              const { canEditOrg, canDeleteOrg, canLeave } = getPermissions(role);

              return (
                <div
                  key={org.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4"
                >
                  {/* Left: logo + name + badges */}
                  <div className="flex min-w-0 items-center gap-3">
                    {org.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="size-9 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Building2 className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 leading-tight">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="truncate text-sm font-medium">{org.name}</p>
                        {isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                        {role && (
                          <Badge variant={roleBadgeVariant(role)} className="text-xs">
                            {ROLE_META[role]?.label ?? role}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">/{org.slug}</p>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {!isActive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hidden h-8 text-xs sm:inline-flex"
                            disabled={setActive.isPending}
                            onClick={() => setActive.mutate(org.id)}
                          >
                            Set Active
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set as active organization</TooltipContent>
                      </Tooltip>
                    )}
                    {!isActive && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 sm:hidden"
                            disabled={setActive.isPending}
                            onClick={() => setActive.mutate(org.id)}
                          >
                            <CheckCheck className="size-4" />
                            <span className="sr-only">Set Active</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set as active organization</TooltipContent>
                      </Tooltip>
                    )}
                    {canEditOrg && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() =>
                              setEditTarget({ id: org.id, name: org.name, slug: org.slug })
                            }
                          >
                            <Pencil className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit organization</TooltipContent>
                      </Tooltip>
                    )}
                    {canDeleteOrg && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              setPendingAction({
                                type: "delete",
                                orgId: org.id,
                                orgName: org.name,
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete organization</TooltipContent>
                      </Tooltip>
                    )}
                    {canLeave && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() =>
                              setPendingAction({
                                type: "leave",
                                orgId: org.id,
                                orgName: org.name,
                              })
                            }
                          >
                            <LogOut className="size-4" />
                            <span className="sr-only">Leave</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Leave organization</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editTarget && (
        <EditOrganizationDialog
          open={!!editTarget}
          onOpenChange={(open) => !open && setEditTarget(null)}
          organization={editTarget}
        />
      )}

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => { if (!open) { setPendingAction(null); setConfirmInput(""); } }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === "delete" ? "Delete Organization?" : "Leave Organization?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === "delete"
                ? `This will permanently delete "${pendingAction.orgName}" and remove all members and data. This cannot be undone.`
                : `You will lose access to "${pendingAction?.orgName}". This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-1.5 py-1">
            <p className="text-sm text-muted-foreground">
              {pendingAction?.type === "delete"
                ? <>Type <span className="font-medium text-foreground">{pendingAction.orgName}</span> to confirm</>
                : <>Type <span className="font-medium text-foreground">leave</span> to confirm</>}
            </p>
            <Input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              onKeyDown={(e) => {
                const expected = pendingAction?.type === "delete"
                  ? pendingAction.orgName
                  : LEAVE_WORD;
                if (e.key === "Enter" && confirmInput === expected) handleConfirm();
              }}
              placeholder={pendingAction?.type === "delete" ? pendingAction.orgName : LEAVE_WORD}
              autoFocus
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="focus-visible:ring-destructive disabled:opacity-50"
              onClick={handleConfirm}
              disabled={
                confirmInput !== (
                  pendingAction?.type === "delete"
                    ? pendingAction.orgName
                    : LEAVE_WORD
                )
              }
            >
              {pendingAction?.type === "delete" ? "Yes, delete" : "Yes, leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
