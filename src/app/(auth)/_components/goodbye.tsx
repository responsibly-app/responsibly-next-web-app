"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { routes } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { authClassNames, AuthContainer } from "./auth-layout";

export function Goodbye() {
  return (
    <AuthContainer>
      <Card className={cn(authClassNames.card)}>
        <CardHeader>
          <CardTitle className={cn(authClassNames.cardTitle)}>
            Account deleted
          </CardTitle>
          <CardDescription className="text-center">
            Your account and all associated data have been permanently deleted.
            We&apos;re sorry to see you go.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-3">
          <Button asChild className="w-full">
            <Link href={routes.auth.signUp()}>Create a new account</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href={routes.auth.signIn()}>Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </AuthContainer>
  );
}
