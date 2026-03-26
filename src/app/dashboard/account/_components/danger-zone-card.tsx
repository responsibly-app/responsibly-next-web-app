"use client";

import { useState } from "react";
import { AlertTriangleIcon, MailIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useDeleteUser } from "@/lib/auth/use-auth";

export function DangerZoneCard() {
  const [open, setOpen] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const deleteUser = useDeleteUser();

  function handleOpenChange(value: boolean) {
    setOpen(value);
    if (!value) setEmailSent(false);
  }

  function handleSendVerification() {
    deleteUser.mutate(undefined, {
      onSuccess: () => {
        setEmailSent(true);
      },
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to send verification email.");
      },
    });
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
          <AlertDialog open={open} onOpenChange={handleOpenChange}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="mt-3 shrink-0 sm:mt-0">
                <Trash2Icon className="mr-1.5 size-3.5" data-icon="inline-start" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              {emailSent ? (
                <>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <MailIcon className="size-5 text-muted-foreground" />
                      Check your email
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      We sent a confirmation link to your email address. Click the link to
                      permanently delete your account. The link expires in 1 hour.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Close</AlertDialogCancel>
                  </AlertDialogFooter>
                </>
              ) : (
                <>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangleIcon className="size-5 text-destructive" />
                      Delete your account?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all associated data. This
                      action <strong>cannot be undone</strong>.
                      <br />
                      <br />
                      We&apos;ll send a confirmation link to your email address. You must click
                      it to finalize the deletion.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                      variant="destructive"
                      onClick={handleSendVerification}
                      disabled={deleteUser.isPending}
                      className="focus-visible:ring-destructive/20"
                    >
                      {deleteUser.isPending ? (
                        <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
                      ) : (
                        <MailIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
                      )}
                      Send confirmation email
                    </Button>
                  </AlertDialogFooter>
                </>
              )}
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
