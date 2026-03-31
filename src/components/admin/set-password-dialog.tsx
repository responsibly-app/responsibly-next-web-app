"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Spinner } from "@/components/ui/spinner";
import { useAdminSetUserPassword } from "@/lib/auth/hooks";

type Props = {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SetPasswordDialog({ userId, userName, open, onOpenChange }: Props) {
  const setPassword = useAdminSetUserPassword();
  const [newPassword, setNewPassword] = useState("");

  function handleClose() {
    onOpenChange(false);
    setNewPassword("");
  }

  function handleSubmit() {
    setPassword.mutate(
      { userId, newPassword },
      {
        onSuccess: () => {
          toast.success(`Password updated for ${userName}.`);
          handleClose();
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to set password.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Set Password</DialogTitle>
          <DialogDescription>
            Set a new password for <strong>{userName}</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Min. 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={setPassword.isPending || newPassword.length < 8}
          >
            {setPassword.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Set Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
