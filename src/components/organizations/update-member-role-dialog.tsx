"use client";

import { useState, useEffect } from "react";
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
import { useGetAssignableRoles, useUpdateMemberRole } from "@/lib/auth/hooks";
import type { OrgRole } from "@/lib/auth/hooks/oraganization/permissions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  memberId: string;
  memberName: string;
  currentRole: OrgRole;
};

export function UpdateMemberRoleDialog({
  open,
  onOpenChange,
  organizationId,
  memberId,
  memberName,
  currentRole,
}: Props) {
  const [role, setRole] = useState<OrgRole>(currentRole);
  const { data: assignableRoles = [], isPending: rolesPending } = useGetAssignableRoles(organizationId);
  const updateRole = useUpdateMemberRole();

  useEffect(() => {
    if (open) setRole(currentRole);
  }, [open, currentRole]);

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit() {
    updateRole.mutate(
      { memberId, role, organizationId },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Role</DialogTitle>
          <DialogDescription>
            Change the role for <span className="font-medium text-foreground">{memberName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="member-role">Role</Label>
          <Select value={role} onValueChange={(v) => setRole(v as OrgRole)} disabled={rolesPending}>
            <SelectTrigger id="member-role">
              {rolesPending ? <Spinner className="size-3.5" /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent className="p-2">
              {assignableRoles.map((r) => (
                <SelectPrimitive.Item
                  key={r.role}
                  value={r.role}
                  className="relative flex w-full cursor-default items-start gap-2.5 rounded-xl py-2.5 pr-8 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                >
                  <span className="pointer-events-none absolute right-2 top-2.5 flex size-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <CheckIcon className="size-4 pointer-events-none" />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <SelectPrimitive.ItemText>
                      <span className="font-medium">{r.label}</span>
                    </SelectPrimitive.ItemText>
                    <span className="text-xs text-muted-foreground leading-snug">{r.description}</span>
                  </div>
                </SelectPrimitive.Item>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateRole.isPending || role === currentRole}>
            {updateRole.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
