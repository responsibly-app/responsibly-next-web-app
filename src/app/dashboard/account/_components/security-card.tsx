"use client";

import { useEffect, useState } from "react";
import { KeyRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useRequestPasswordReset } from "@/lib/auth/use-auth";

function SecurityCardSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="grid gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SecurityCard() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [accounts, setAccounts] = useState<Array<{ providerId: string }>>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    authClient.listAccounts().then((result) => {
      if (result.data) setAccounts(result.data as Array<{ providerId: string }>);
      setAccountsLoading(false);
    });
  }, [user?.id]);

  const isCredentialUser = accounts.some((a) => a.providerId === "credential");
  const requestPasswordReset = useRequestPasswordReset();

  if (isPending || accountsLoading) return <SecurityCardSkeleton />;

  function handlePasswordReset() {
    if (!user?.email) return;
    requestPasswordReset.mutate(
      { email: user!.email },
      {
        onSuccess: () => {
          toast.success("Password set/reset email sent. Please check your inbox.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to send password reset email.");
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
            <CardDescription>Manage your password and account security.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-1 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Password</p>
            <p className="text-muted-foreground text-sm">
              {isCredentialUser
                ? "Reset your password via a secure email link."
                : "You don't have a password set up yet."}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 shrink-0 sm:mt-0"
            onClick={handlePasswordReset}
            disabled={requestPasswordReset.isPending}
          >
            {requestPasswordReset.isPending ? (
              <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
            ) : (
              <KeyRoundIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
            )}
            {isCredentialUser ? "Reset password" : "Set a password"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
