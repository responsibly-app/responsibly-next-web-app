import { routes } from "@/routes";
import Link from "next/link";

interface AuthTermsFooterProps {
  action: "signing in" | "creating an account";
}

export function AuthTermsFooter({ action }: AuthTermsFooterProps) {
  return (
    <p className="text-center text-xs text-muted-foreground leading-relaxed">
      By {action}, you agree to our{" "}
      <Link
        href={routes.landing.terms()}
        className="underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link
        href={routes.landing.privacy()}
        className="underline underline-offset-4 hover:text-foreground transition-colors"
      >
        Privacy Policy
      </Link>
      .
    </p>
  );
}
