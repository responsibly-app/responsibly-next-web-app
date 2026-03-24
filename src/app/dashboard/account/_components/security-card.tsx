"use client";

import { EyeIcon, EyeOffIcon, KeyRoundIcon } from "lucide-react";

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
import { cn } from "@/lib/utils";

type SecurityCardProps = {
  isCredentialUser: boolean;
  socialProviders: string[];
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  showCurrentPw: boolean;
  showNewPw: boolean;
  showConfirmPw: boolean;
  onCurrentPasswordChange: (v: string) => void;
  onNewPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onToggleCurrentPw: () => void;
  onToggleNewPw: () => void;
  onToggleConfirmPw: () => void;
  isPending: boolean;
  onChangePassword: () => void;
};

export function SecurityCard({
  isCredentialUser,
  socialProviders,
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrentPw,
  showNewPw,
  showConfirmPw,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleCurrentPw,
  onToggleNewPw,
  onToggleConfirmPw,
  isPending,
  onChangePassword,
}: SecurityCardProps) {
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
                  onChange={(e) => onCurrentPasswordChange(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={onToggleCurrentPw}
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
                    onChange={(e) => onNewPasswordChange(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={onToggleNewPw}
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
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                    className={cn(
                      "pr-10",
                      confirmPassword && newPassword !== confirmPassword && "border-destructive",
                    )}
                  />
                  <button
                    type="button"
                    onClick={onToggleConfirmPw}
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
            onClick={onChangePassword}
            disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
            size="sm"
          >
            {isPending ? (
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
