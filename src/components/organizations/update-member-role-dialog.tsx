"use client";

import { useState } from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { CheckIcon } from "lucide-react";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { OrgRole, ROLE_META, canAssignRole } from "@/lib/auth/hooks/oraganization/permissions";

const ALL_ASSIGNABLE_ROLES: OrgRole[] = ["admin", "assistant", "priviledgedMember", "member"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
  currentRole: OrgRole;
  actorRole: OrgRole;
  isPending: boolean;
  onConfirm: (role: OrgRole) => void;
};

export function UpdateMemberRoleDialog({
  open,
  onOpenChange,
  memberName,
  currentRole,
  actorRole,
  isPending,
  onConfirm,
}: Props) {
  const [role, setRole] = useState<OrgRole>(currentRole);

  const assignableRoles = ALL_ASSIGNABLE_ROLES.filter((r) => canAssignRole(actorRole, r));

  function handleOpenChange(next: boolean) {
    if (!next) setRole(currentRole);
    onOpenChange(next);
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
              {assignableRoles.map((r) => (
                <SelectPrimitive.Item
                  key={r}
                  value={r}
                  className="relative flex w-full cursor-default items-start gap-2.5 rounded-xl py-2.5 pr-8 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  <span className="pointer-events-none absolute right-2 top-2.5 flex size-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <CheckIcon className="size-4 pointer-events-none" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <SelectPrimitive.ItemText>
                      <span className="font-medium">{ROLE_META[r].label}</span>
                    </SelectPrimitive.ItemText>
                    <span className="text-xs text-muted-foreground leading-snug">{ROLE_META[r].description}</span>
                  </div>
                </SelectPrimitive.Item>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(role)} disabled={isPending || role === currentRole}>
            {isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
