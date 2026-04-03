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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useInviteMember, useGetInvitableRoles } from "@/lib/auth/hooks";
import type { InvitationRole } from "@/lib/auth/hooks";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
};

export function InviteMemberDialog({ open, onOpenChange, organizationId }: Props) {
  const inviteMember = useInviteMember(organizationId);
  const { data: invitableRoles = [], isPending: rolesPending } = useGetInvitableRoles(organizationId);
  const [email, setEmail] = useState("");

  const availableRoles = invitableRoles.map((r) => r.role) as InvitationRole[];
  const [role, setRole] = useState<InvitationRole>("member");

  useEffect(() => {
    if (open && invitableRoles.length > 0) {
      setEmail("");
      setRole(invitableRoles.at(-1)!.role as InvitationRole);
    }
  }, [open, invitableRoles]);

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit() {
    inviteMember.mutate(
      { email, role, organizationId },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Invite someone to join this organization by email.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email.trim() && handleSubmit()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as InvitationRole)} disabled={rolesPending}>
              <SelectTrigger id="invite-role" className="w-44">
                {rolesPending ? <Spinner className="size-3.5" /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent className="p-2">
                {invitableRoles.map((r) => (
                  <SelectPrimitive.Item
                    key={r.role}
                    value={r.role}
                    className="relative flex w-full cursor-default items-start m-1 gap-2.5 rounded-xl py-2.5 pr-8 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={inviteMember.isPending || !email.trim()}
          >
            {inviteMember.isPending && (
              <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
            )}
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
