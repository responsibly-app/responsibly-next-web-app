"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useAdminSetRole } from "@/lib/auth/hooks";

type Props = {
  userId: string;
  userName: string;
  currentRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SetRoleDialog({ userId, userName, currentRole, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const setRole = useAdminSetRole();

  const [role, setRoleValue] = useState<"user" | "admin">(
    currentRole === "admin" ? "admin" : "user",
  );

  function handleSubmit() {
    setRole.mutate(
      { userId, role },
      {
        onSuccess: () => {
          toast.success(`${userName}'s role updated to ${role}.`);
          queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
          onOpenChange(false);
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to update role.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Role</DialogTitle>
          <DialogDescription>
            Change the role for <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="role-select">Role</Label>
          <Select value={role} onValueChange={(v) => setRoleValue(v as "user" | "admin")}>
            <SelectTrigger id="role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={setRole.isPending || role === currentRole}>
            {setRole.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
