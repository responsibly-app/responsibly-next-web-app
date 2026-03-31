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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAdminBanUser } from "@/lib/auth/hooks";

type Props = {
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function BanUserDialog({ userId, userName, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const banUser = useAdminBanUser();

  const [reason, setReason] = useState("");
  const [expiresInDays, setExpiresInDays] = useState("");

  function handleClose() {
    onOpenChange(false);
    setReason("");
    setExpiresInDays("");
  }

  function handleSubmit() {
    const banExpiresIn = expiresInDays ? Number(expiresInDays) * 60 * 60 * 24 : undefined;

    banUser.mutate(
      { userId, banReason: reason || undefined, banExpiresIn },
      {
        onSuccess: () => {
          toast.success(`${userName} has been banned.`);
          queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
          handleClose();
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to ban user.");
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ban User</DialogTitle>
          <DialogDescription>
            Ban <strong>{userName}</strong> from accessing the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ban-reason">Reason <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="ban-reason"
              placeholder="Violation of terms of service"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ban-expires">Expires in (days) <span className="text-muted-foreground">(optional, leave blank for permanent)</span></Label>
            <Input
              id="ban-expires"
              type="number"
              min="1"
              placeholder="e.g. 7"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={banUser.isPending}>
            {banUser.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Ban User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
