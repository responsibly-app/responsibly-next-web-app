"use client";

import { useState } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { authClassNames, AuthContainer } from "./auth-layout";
import ENVConfig from "@/config";

interface DeleteAccountConfirmProps {
  token: string;
}

export function DeleteAccountConfirm({ token }: DeleteAccountConfirmProps) {
  const [understood, setUnderstood] = useState(false);

  function handleConfirm() {
    const base = ENVConfig.backend_base_url;
    const callbackURL = encodeURIComponent(`${base}/auth/goodbye`);
    window.location.href = `${base}/api/auth/delete-user/callback?token=${token}&callbackURL=${callbackURL}`;
  }

  return (
    <AuthContainer>
      <Card className={cn(authClassNames.card)}>
        <CardHeader>
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangleIcon className="size-5 text-destructive" />
          </div>
          <CardTitle className={cn(authClassNames.cardTitle)}>
            Delete your account?
          </CardTitle>
          <CardDescription className="text-center">
            This will permanently delete your account and all associated data.
            This action <strong>cannot be undone</strong>.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              <strong>Warning:</strong> All your data, settings, and history
              will be permanently removed and cannot be recovered.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="understood"
              checked={understood}
              onCheckedChange={(v) => setUnderstood(!!v)}
              className="mt-0.5"
            />
            <Label htmlFor="understood" className="cursor-pointer text-sm leading-relaxed">
              I understand that deleting my account will permanently remove all
              my data and this action cannot be undone.
            </Label>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            variant="destructive"
            className="w-full"
            disabled={!understood}
            onClick={handleConfirm}
          >
            Permanently delete my account
          </Button>
        </CardFooter>
      </Card>
    </AuthContainer>
  );
}
