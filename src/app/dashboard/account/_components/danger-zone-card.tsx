"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteUser } from "@/lib/auth/use-auth";
import { routes } from "@/lib/constants/routes";

import { SendConfirmationDialog, TypeToConfirmDialog } from "./delete-account-dialogs";

// Set to true when `sendDeleteAccountVerification` is enabled in auth.ts
const REQUIRES_EMAIL_CONFIRMATION = false;

export function DangerZoneCard() {
  const router = useRouter();
  const [typeOpen, setTypeOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const deleteUser = useDeleteUser();

  function handleTypeConfirm() {
    deleteUser.mutate(undefined, {
      onSuccess: () => {
        setTypeOpen(false);
        router.replace(routes.auth.goodbye());
      },
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to delete account.");
      },
    });
  }

  function handleSendVerification() {
    deleteUser.mutate(undefined, {
      onSuccess: () => setEmailSent(true),
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to send verification email.");
      },
    });
  }

  function handleSendOpenChange(value: boolean) {
    setSendOpen(value);
    if (!value) setEmailSent(false);
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader className="border-b border-destructive/20">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangleIcon className="size-4 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-1 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-muted-foreground text-sm">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="mt-3 shrink-0 sm:mt-0"
            onClick={() => REQUIRES_EMAIL_CONFIRMATION ? setSendOpen(true) : setTypeOpen(true)}
          >
            <Trash2Icon className="mr-1.5 size-3.5" data-icon="inline-start" />
            Delete account
          </Button>
        </div>
      </CardContent>

      <TypeToConfirmDialog
        open={typeOpen}
        onOpenChange={setTypeOpen}
        onConfirm={handleTypeConfirm}
        isPending={deleteUser.isPending}
      />
      <SendConfirmationDialog
        open={sendOpen}
        onOpenChange={handleSendOpenChange}
        isPending={deleteUser.isPending}
        onSend={handleSendVerification}
        emailSent={emailSent}
      />
    </Card>
  );
}
