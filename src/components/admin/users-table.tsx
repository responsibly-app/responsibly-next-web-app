"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal, Search, Plus, UserCheck, Shield, Lock, MonitorSmartphone, Ban, Trash2, RotateCcw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { authClient } from "@/lib/auth/auth-client";
import {
  useAdminListUsers,
  useAdminUnbanUser,
  useAdminRemoveUser,
  useAdminImpersonateUser,
} from "@/lib/auth/hooks";
import { BanUserDialog } from "./ban-user-dialog";
import { SetRoleDialog } from "./set-role-dialog";
import { SetPasswordDialog } from "./set-password-dialog";
import { UserSessionsSheet } from "./user-sessions-sheet";
import { CreateUserDialog } from "./create-user-dialog";

type User = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  emailVerified?: boolean | null;
  createdAt?: Date | string | null;
};

type RoleFilter = "all" | "admin" | "user";
type StatusFilter = "all" | "active" | "banned";

const PAGE_SIZE = 10;

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export function UsersTable() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const currentUserId = session?.user?.id;

  // Filters & pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Reset page on filter change
  useEffect(() => { setPage(0); }, [debouncedSearch, roleFilter, statusFilter]);

  const queryParams = {
    limit: PAGE_SIZE,
    offset: page * PAGE_SIZE,
    ...(debouncedSearch ? { searchValue: debouncedSearch, searchField: "email" as const, searchOperator: "contains" as const } : {}),
    ...(roleFilter !== "all" ? { filterField: "role", filterValue: roleFilter, filterOperator: "eq" as const } : {}),
    ...(statusFilter === "banned" ? { filterField: "banned", filterValue: true, filterOperator: "eq" as const } : {}),
    ...(statusFilter === "active" ? { filterField: "banned", filterValue: false, filterOperator: "eq" as const } : {}),
  };

  const { data, isLoading } = useAdminListUsers(queryParams);
  const users: User[] = (data?.users ?? []) as User[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [banTarget, setBanTarget] = useState<User | null>(null);
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [sessionsTarget, setSessionsTarget] = useState<User | null>(null);
  const [removeTarget, setRemoveTarget] = useState<User | null>(null);

  // Mutations
  const unbanUser = useAdminUnbanUser();
  const removeUser = useAdminRemoveUser();
  const impersonateUser = useAdminImpersonateUser();

  const handleUnban = useCallback((user: User) => {
    unbanUser.mutate(user.id, {
      onSuccess: () => {
        toast.success(`${user.name} unbanned.`);
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      },
      onError: (err: { message?: string }) => toast.error(err?.message ?? "Failed to unban."),
    });
  }, [unbanUser, queryClient]);

  const handleRemove = useCallback(() => {
    if (!removeTarget) return;
    removeUser.mutate(removeTarget.id, {
      onSuccess: () => {
        toast.success(`${removeTarget.name} removed.`);
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        setRemoveTarget(null);
      },
      onError: (err: { message?: string }) => toast.error(err?.message ?? "Failed to remove user."),
    });
  }, [removeTarget, removeUser, queryClient]);

  const handleImpersonate = useCallback((user: User) => {
    impersonateUser.mutate(user.id, {
      onSuccess: () => {
        toast.success(`Now impersonating ${user.name}.`);
        window.location.reload();
      },
      onError: (err: { message?: string }) => toast.error(err?.message ?? "Failed to impersonate."),
    });
  }, [impersonateUser]);

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
            <Input
              placeholder="Search by email…"
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as RoleFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 size-4" />
          Create User
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-8 rounded-full" />
                      <div className="flex flex-col gap-1">
                        <Skeleton className="h-3.5 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                  <TableCell />
                </TableRow>
              ))}

            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground py-12 text-center text-sm">
                  No users found.
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        {user.image && <AvatarImage src={user.image} />}
                        <AvatarFallback className="text-xs">{getInitials(user.name || user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none">{user.name || "—"}</span>
                        <span className="text-muted-foreground text-xs">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                      {user.role ?? "user"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : user.emailVerified ? (
                      <Badge variant="secondary" className="text-green-600 dark:text-green-400">Active</Badge>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleImpersonate(user)} disabled={user.id === currentUserId}>
                          <UserCheck className="mr-2 size-4" />
                          Impersonate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setSessionsTarget(user)}>
                          <MonitorSmartphone className="mr-2 size-4" />
                          View Sessions
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setRoleTarget(user)}>
                          <Shield className="mr-2 size-4" />
                          Set Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setPasswordTarget(user)}>
                          <Lock className="mr-2 size-4" />
                          Set Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.banned ? (
                          <DropdownMenuItem onClick={() => handleUnban(user)}>
                            <RotateCcw className="mr-2 size-4" />
                            Unban
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => setBanTarget(user)} className="text-destructive focus:text-destructive">
                            <Ban className="mr-2 size-4" />
                            Ban
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setRemoveTarget(user)}
                          className="text-destructive focus:text-destructive"
                          disabled={user.id === currentUserId}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      {banTarget && (
        <BanUserDialog
          userId={banTarget.id}
          userName={banTarget.name}
          open={!!banTarget}
          onOpenChange={(o) => !o && setBanTarget(null)}
        />
      )}

      {roleTarget && (
        <SetRoleDialog
          userId={roleTarget.id}
          userName={roleTarget.name}
          currentRole={roleTarget.role ?? "user"}
          open={!!roleTarget}
          onOpenChange={(o) => !o && setRoleTarget(null)}
        />
      )}

      {passwordTarget && (
        <SetPasswordDialog
          userId={passwordTarget.id}
          userName={passwordTarget.name}
          open={!!passwordTarget}
          onOpenChange={(o) => !o && setPasswordTarget(null)}
        />
      )}

      {sessionsTarget && (
        <UserSessionsSheet
          userId={sessionsTarget.id}
          userName={sessionsTarget.name}
          open={!!sessionsTarget}
          onOpenChange={(o) => !o && setSessionsTarget(null)}
        />
      )}

      <AlertDialog open={!!removeTarget} onOpenChange={(o) => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently remove <strong>{removeTarget?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={removeUser.isPending}
            >
              {removeUser.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
