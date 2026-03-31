"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";

type EmailSignUpParams = {
  name: string;
  email: string;
  password: string;
};

type ResendVerificationParams = {
  email: string;
};

/** Email sign-up hook */
export function useEmailSignUp() {
  return useMutation({
    mutationFn: async (params: EmailSignUpParams) => {
      const result = await authClient.signUp.email({
        name: params.name,
        email: params.email,
        password: params.password,
        callbackURL: routes.dashboard.root(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Resend verification email hook */
export function useResendVerificationEmail() {
  return useMutation({
    mutationFn: async ({ email }: ResendVerificationParams) => {
      const result = await authClient.sendVerificationEmail({
        email,
        callbackURL: routes.dashboard.root(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}
