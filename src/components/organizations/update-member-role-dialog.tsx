"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { OrgRole } from "@/lib/auth/hooks/oraganization/permissions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentRole: OrgRole;
  isPending: boolean;
  onConfirm: (role: OrgRole) => void;
};

const ASSIGNABLE_ROLES: { value: OrgRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "assistant", label: "Assistant" },
  { value: "member", label: "Member" },
];

export function UpdateMemberRoleDialog({
  open,
  onOpenChange,
  memberName,
  currentRole,
  isPending,
  onConfirm,
}: Props) {
  const [role, setRole] = useState<OrgRole>(currentRole);

  function handleOpenChange(next: boolean) {
    if (!next) setRole(currentRole);
    onOpenChange(next);
  }

  function handleSubmit() {
    onConfirm(role);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Role</DialogTitle>
          <DialogDescription>
            Change the role for <span className="font-medium text-foreground">{memberName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="member-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as OrgRole)}>
            <SelectTrigger id="member-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSIGNABLE_ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || role === currentRole}>
            {isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
