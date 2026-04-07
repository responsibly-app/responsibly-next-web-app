"use client";

import { useState } from "react";
import { AlertTriangleIcon, LogInIcon, MailIcon, ShieldAlertIcon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { maskEmail } from "@/lib/helpers/user";
import { useSignOut } from "@/lib/auth/hooks";

interface TypeToConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  email?: string;
  error?: { code?: string; message?: string } | null;
}

export function TypeToConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  email,
  error,
}: TypeToConfirmDialogProps) {
  const [value, setValue] = useState("");
  const [understood, setUnderstood] = useState(false);
  const signOut = useSignOut();

  const maskedEmail = email ? maskEmail(email) : undefined;
  const isSessionExpired = error?.code === "SESSION_EXPIRED";

  function handleOpenChange(next: boolean) {
    if (isPending) return;
    onOpenChange(next);
    if (!next) {
      setValue("");
      setUnderstood(false);
    }
  }

  function handleConfirm() {
    onConfirm();
    // setValue("");
    // setUnderstood(false);
  }

  const isConfirmed = email ? value === email : value === "delete";

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="size-5 text-destructive" />
            Delete your account?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete your account and all associated data.
            This action <strong>cannot be undone</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <div className={`flex flex-col gap-2 rounded-xl border p-4 ${isSessionExpired ? "border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30" : "border-destructive/30 bg-destructive/5"}`}>
            <div className="flex items-center gap-2">
              {isSessionExpired ? (
                <ShieldAlertIcon className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              ) : (
                <AlertTriangleIcon className="size-4 shrink-0 text-destructive" />
              )}
              <p className={`text-sm font-medium ${isSessionExpired ? "text-amber-800 dark:text-amber-300" : "text-destructive"}`}>
                {isSessionExpired ? "Fresh sign-in required" : "Something went wrong"}
              </p>
            </div>
            <p className={`text-sm ${isSessionExpired ? "text-amber-700 dark:text-amber-400" : "text-destructive/80"}`}>
              {isSessionExpired
                ? "For your security, deleting your account requires a recent sign-in. Please sign out and sign back in to continue."
                : (error.message ?? "An unexpected error occurred. Please try again.")}
            </p>
            {isSessionExpired && (
              <Button
                size="sm"
                variant="outline"
                className="mt-1 self-start border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/40"
                onClick={() => signOut.mutate()}
                disabled={signOut.isPending}
              >
                {signOut.isPending ? (
                  <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
                ) : (
                  <LogInIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
                )}
                Sign out & sign back in
              </Button>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(!!checked)}
              disabled={isPending || !!isSessionExpired}
              className="mt-0.5"
            />
            <Label htmlFor="understood" className="text-muted-foreground text-sm font-normal leading-snug">
              I understand that deleting my account will permanently remove all my data and this
              action cannot be undone.
            </Label>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-delete" className="text-sm">
              {email ? <>Type your email to confirm</> : <>Type <strong>delete</strong> to confirm</>}
            </Label>
            <Input
              id="confirm-delete"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={maskedEmail ?? "delete"}
              autoComplete="off"
              disabled={isPending || !!isSessionExpired}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!understood || !isConfirmed || isPending || !!isSessionExpired}
            onClick={handleConfirm}
            className="focus-visible:ring-destructive/20"
          >
            {isPending ? (
              <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
            ) : null}
            Continue
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface SendConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onSend: () => void;
  emailSent: boolean;
}

export function SendConfirmationDialog({
  open,
  onOpenChange,
  isPending,
  onSend,
  emailSent,
}: SendConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {emailSent ? (
          <>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <MailIcon className="size-5 text-muted-foreground" />
                Check your email
              </AlertDialogTitle>
              <AlertDialogDescription>
                We sent a confirmation link to your email address. Click the
                link to permanently delete your account. The link expires in 1
                hour.
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
                <MailIcon className="size-5 text-muted-foreground" />
                Send confirmation email
              </AlertDialogTitle>
              <AlertDialogDescription>
                We&apos;ll send a confirmation link to your email address. You
                must click it to finalize the deletion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
              <Button
                variant="destructive"
                onClick={onSend}
                disabled={isPending}
                className="focus-visible:ring-destructive/20"
              >
                {isPending ? (
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
  );
}
