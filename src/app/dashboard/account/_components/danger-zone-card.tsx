"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangleIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth/auth-client";
import { useDeleteUser } from "@/lib/auth/use-auth";
import { routes } from "@/routes";

import { SendConfirmationDialog, TypeToConfirmDialog } from "./delete-account-dialogs";

// Set to true when `sendDeleteAccountVerification` is enabled in auth.ts
const REQUIRES_EMAIL_CONFIRMATION = false;

export function DangerZoneCard() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [typeOpen, setTypeOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [deleteError, setDeleteError] = useState<{ code?: string; message?: string } | null>(null);
  const deleteUser = useDeleteUser();

  function handleTypeConfirm() {
    setDeleteError(null);
    deleteUser.mutate(undefined, {
      onSuccess: () => {
        setTypeOpen(false);
        router.replace(routes.auth.goodbye());
      },
      onError: (err: { code?: string; message?: string }) => {
        setDeleteError(err);
      },
    });
  }

  function handleSendVerification() {
    deleteUser.mutate(undefined, {
      onSuccess: () => setEmailSent(true),
      onError: () => {
        setEmailSent(false);
      },
    });
  }

  function handleSendOpenChange(value: boolean) {
    setSendOpen(value);
    if (!value) setEmailSent(false);
  }

  function handleTypeOpenChange(value: boolean) {
    setTypeOpen(value);
    if (!value) setDeleteError(null);
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
        onOpenChange={handleTypeOpenChange}
        onConfirm={handleTypeConfirm}
        isPending={deleteUser.isPending}
        email={session?.user?.email}
        error={deleteError}
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
