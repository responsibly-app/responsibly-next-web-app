"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSendMagicLink } from "@/lib/auth/use-auth";
import { MailIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

export function MagicLinkButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const sendMagicLink = useSendMagicLink();

  const isEmailValid = z.email().safeParse(email).success;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setEmail("");
      setEmailError(null);
      setFormError(null);
      setSent(false);
    }
  }

  function onSend() {
    setEmailError(null);
    setFormError(null);

    if (!isEmailValid) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    sendMagicLink.mutate(
      { email },
      {
        onSuccess: () => setSent(true),
        onError: (err: any) =>
          setFormError(err?.message ?? "Failed to send magic link."),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" type="button">
          <MailIcon className="h-4 w-4" />
          Sign in with magic link
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Magic link sign in</DialogTitle>
          <DialogDescription>
            Enter your email and we&apos;ll send you a one-click sign-in link.
            No password needed.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
              <MailIcon className="text-foreground h-6 w-6" />
            </div>
            <p className="font-medium">Check your inbox</p>
            <p className="text-muted-foreground text-sm">
              We sent a sign-in link to <strong>{email}</strong>. It expires in
              10 minutes.
            </p>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSend();
            }}
          >
            <Field>
              <FieldLabel htmlFor="magic-link-email">Email</FieldLabel>
              <Input
                id="magic-link-email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              {emailError && <FieldError>{emailError}</FieldError>}
              {formError && <FieldError>{formError}</FieldError>}
            </Field>

            <DialogFooter className="mt-4" showCloseButton={false}>
              <Button
                type="submit"
                disabled={sendMagicLink.isPending}
                className="w-full"
              >
                {sendMagicLink.isPending && <Spinner />}
                {sendMagicLink.isPending ? "Sending..." : "Send link"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
