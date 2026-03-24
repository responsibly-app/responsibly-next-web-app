"use client";

import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useChangePassword } from "@/lib/auth/use-auth";
import { cn } from "@/lib/utils";

export function SecurityCard() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [accounts, setAccounts] = useState<Array<{ providerId: string }>>([]);

  useEffect(() => {
    if (!user?.id) return;
    authClient.listAccounts().then((result) => {
      if (result.data) setAccounts(result.data as Array<{ providerId: string }>);
    });
  }, [user?.id]);

  const isCredentialUser = accounts.some((a) => a.providerId === "credential");
  const socialProviders = accounts
    .filter((a) => a.providerId !== "credential")
    .map((a) => a.providerId.charAt(0).toUpperCase() + a.providerId.slice(1));

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const changePassword = useChangePassword();

  function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Password changed successfully.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to change password.");
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
            <KeyRoundIcon className="text-primary size-4" />
          </div>
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              {isCredentialUser
                ? "Change your password. Other active sessions will be signed out."
                : "Your password is managed by your sign-in provider."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isCredentialUser ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex cursor-pointer items-center transition-colors"
                  tabIndex={-1}
                >
                  {showCurrentPw ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPw ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex cursor-pointer items-center transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPw ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPw ? "text" : "password"}
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn(
                      "pr-10",
                      confirmPassword && newPassword !== confirmPassword && "border-destructive",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 flex cursor-pointer items-center transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPw ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-destructive text-xs">Passwords do not match.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-muted/50 flex items-start gap-3 rounded-xl border p-4">
            <KeyRoundIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
            <div className="text-sm">
              <p className="font-medium">Password managed externally</p>
              <p className="text-muted-foreground">
                Your password is managed by{" "}
                {socialProviders.length > 0
                  ? socialProviders.join(" and ")
                  : "your sign-in provider"}
                . To change it, visit your provider&apos;s account settings.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      {isCredentialUser && (
        <div className="flex justify-end border-t px-6 pt-4 pb-6">
          <Button
            onClick={handleChangePassword}
            disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword}
            size="sm"
          >
            {changePassword.isPending ? (
              <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
            ) : (
              <KeyRoundIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
            )}
            Change password
          </Button>
        </div>
      )}
    </Card>
  );
}
