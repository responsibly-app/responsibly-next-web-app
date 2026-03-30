"use client";

import { useState } from "react";
import { AlertTriangleIcon, MailIcon } from "lucide-react";

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

interface TypeToConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  email?: string;
}

export function TypeToConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
  email,
}: TypeToConfirmDialogProps) {
  const [value, setValue] = useState("");
  const [understood, setUnderstood] = useState(false);

  const maskedEmail = email ? maskEmail(email) : undefined;

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
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(!!checked)}
              disabled={isPending}
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
              disabled={isPending}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={!understood || !isConfirmed || isPending}
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
