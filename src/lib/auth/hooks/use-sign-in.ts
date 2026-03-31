"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";

type SocialProvider = "google" | "github" | "zoom";

type SocialLoginParams = {
  provider: SocialProvider;
  callbackURL?: string;
};

type EmailSignInParams = {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
};

/** Social login hook */
export function useSocialLogin({ provider, callbackURL = routes.dashboard.root() }: SocialLoginParams) {
  return useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: "/error",
        newUserCallbackURL: routes.dashboard.root(),
        disableRedirect: false,
      });
    },
  });
}

/** Email sign-in hook */
export function useEmailSignIn() {
  return useMutation({
    mutationFn: async (params: EmailSignInParams) => {
      const { email, password, rememberMe = true, callbackURL } = params;

      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: callbackURL ?? routes.dashboard.root(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Send a magic link sign-in email */
export function useSendMagicLink() {
  return useMutation({
    mutationFn: async ({ email, callbackURL }: { email: string; callbackURL?: string }) => {
      const result = await authClient.signIn.magicLink({
        email,
        callbackURL: callbackURL ?? routes.dashboard.root(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}
