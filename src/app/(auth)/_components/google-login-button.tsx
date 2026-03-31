"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import googleLogo from "@/images/icons/google.svg";
import { useSocialLogin } from "@/lib/auth/hooks";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export function GoogleLoginButton({ onError }: { onError?: (message: string) => void }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;

  const googleLogin = useSocialLogin({ provider: "google", callbackURL: callbackUrl });

  function handleClick() {
    googleLogin.mutate(undefined, {
      onError: () => onError?.("Google login failed. Please try again."),
    });
  }

  return (
    <Button
      variant="outline"
      type="button"
      onClick={handleClick}
      disabled={googleLogin.isPending}
    >
      {googleLogin.isPending ? (
        <Spinner />
      ) : (
        <Image src={googleLogo} alt="Google" width={15} height={15} priority />
      )}
      {googleLogin.isPending ? "Redirecting to Google..." : "Continue with Google"}
    </Button>
  );
}
