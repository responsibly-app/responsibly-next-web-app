"use client";

import { useMutation } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";

type PasswordResetParams = {
  email: string;
};

type ResetPasswordParams = {
  token: string;
  newPassword: string;
};

type ChangePasswordParams = {
  currentPassword: string;
  newPassword: string;
};

/** Password reset hook */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async ({ email }: PasswordResetParams) => {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: routes.auth.newPassword(),
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Resend reset password hook */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordParams) => {
      const result = await authClient.resetPassword({ token, newPassword });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Change user password and revoke other sessions */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: ChangePasswordParams) => {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (result.error) {
        throw result.error;
      }

      return result;
    },
  });
}
