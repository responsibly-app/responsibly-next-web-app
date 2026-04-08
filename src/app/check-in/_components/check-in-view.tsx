"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCheckInWithQR } from "@/lib/auth/hooks";
import { authClient } from "@/lib/auth/auth-client";

export function CheckInView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const { data: session, isPending: sessionPending } = authClient.useSession();
  const checkIn = useCheckInWithQR();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!code || sessionPending) return;
    if (!session) {
      // Redirect to sign-in, return here after
      router.push(`/sign-in?redirect=/check-in?code=${encodeURIComponent(code)}`);
      return;
    }
    if (status !== "idle") return;

    setStatus("loading");
    checkIn.mutate(
      { code },
      {
        onSuccess: () => setStatus("success"),
        onError: (err: { message?: string }) => {
          setStatus("error");
          setErrorMsg(err?.message ?? "Check-in failed. Please try again.");
        },
      },
    );
  }, [code, session, sessionPending]);

  if (!code) {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <QrCode className="text-muted-foreground size-6" />
          </div>
          <CardTitle>Invalid Link</CardTitle>
          <CardDescription>No check-in code found in this link.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (sessionPending || status === "loading") {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardContent className="flex flex-col items-center gap-3 pt-8 pb-8">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
          <p className="text-muted-foreground text-sm">Checking you in…</p>
        </CardContent>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle>Checked In!</CardTitle>
          <CardDescription>
            You have been marked as present. See you at the event!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "error") {
    return (
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="size-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle>Check-In Failed</CardTitle>
          <CardDescription>{errorMsg}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
