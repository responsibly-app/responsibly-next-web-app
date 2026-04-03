"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { useInviteMember } from "@/lib/auth/hooks";
import type { InvitationRole } from "@/lib/auth/hooks";
import { OrgRole, ROLE_META, canAssignRole } from "@/lib/auth/hooks/oraganization/permissions";

const INVITABLE_ROLES: InvitationRole[] = ["admin", "assistant", "priviledgedMember", "member"];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  actorRole: OrgRole;
};

export function InviteMemberDialog({ open, onOpenChange, organizationId, actorRole }: Props) {
  const inviteMember = useInviteMember();
  const [email, setEmail] = useState("");

  const availableRoles = INVITABLE_ROLES.filter((r) => canAssignRole(actorRole, r as OrgRole));
  const [role, setRole] = useState<InvitationRole>(availableRoles[0] ?? "member");

  function handleClose() {
    onOpenChange(false);
    setEmail("");
    setRole(availableRoles[0] ?? "member");
  }

  function handleSubmit() {
    inviteMember.mutate(
      { email, role, organizationId },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${email}.`);
          handleClose();
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to send invitation.");
        },
      },
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
            <Select value={role} onValueChange={(v) => setRole(v as InvitationRole)}>
              <SelectTrigger id="invite-role" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
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
                        <span className="font-medium">{ROLE_META[r as OrgRole].label}</span>
                      </SelectPrimitive.ItemText>
                      <span className="text-xs text-muted-foreground leading-snug">{ROLE_META[r as OrgRole].description}</span>
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
