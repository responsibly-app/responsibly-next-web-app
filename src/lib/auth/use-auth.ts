"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/lib/constants/routes";

type EmailSignUpParams = {
  name: string;
  email: string;
  password: string;
};

type EmailSignInParams = {
  email: string;
  password: string;
  rememberMe?: boolean;
  callbackURL?: string;
};

type PasswordResetParams = {
  email: string;
};

type ResendVerificationParams = {
  email: string;
};

type ResetPasswordParams = {
  token: string;
  newPassword: string;
};

type SocialProvider = "google" | "github" | "zoom";

type SocialLoginParams = {
  provider: SocialProvider;
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

/** Sign-out hook */
export function useSignOut() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut();
    },
    onSuccess: () => {
      router.push(routes.auth.signIn());
    },
    onError: (error) => {
      console.error("Sign out failed:", error);
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

type LinkSocialParams = {
  provider: SocialProvider;
  callbackURL?: string;
};

/** Link a social provider to an existing account */
export function useLinkSocial({ provider, callbackURL = routes.dashboard.integrations() }: LinkSocialParams) {
  return useMutation({
    mutationFn: async () => {
      const result = await authClient.linkSocial({ provider, callbackURL });

      if (result?.error) {
        throw result.error;
      }

      return result;
    },
  });
}

/** Unlink a social provider from the current account */
export function useUnlinkSocial() {
  return useMutation({
    mutationFn: async (provider: SocialProvider) => {
      const result = await authClient.unlinkAccount({ providerId: provider });

      if (result?.error) {
        throw result.error;
      }

      return result;
    },
  });
}

type UpdateUserParams = {
  name?: string;
  image?: string;
};

type ChangePasswordParams = {
  currentPassword: string;
  newPassword: string;
};

/** Update user profile (name, image) */
export function useUpdateUser() {
  return useMutation({
    mutationFn: async (params: UpdateUserParams) => {
      const result = await authClient.updateUser(params);

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

/** List all active sessions for the current user */
export function useListSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const result = await authClient.listSessions();
      if (result.error) throw result.error;
      return result.data ?? [];
    },
  });
}

/** Revoke a specific session by token */
export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      const result = await authClient.revokeSession({ token });
      if (result?.error) throw result.error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

/** Permanently delete the current user account */
export function useDeleteUser() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.deleteUser({ callbackURL: routes.auth.goodbye() });

      if (result?.error) {
        throw result.error;
      }

      return result;
    },
  });
}