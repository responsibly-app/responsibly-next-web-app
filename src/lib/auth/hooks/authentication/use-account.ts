"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";
import { toast } from "sonner";

type SocialProvider = "google" | "github" | "zoom";

type LinkSocialParams = {
  provider: SocialProvider;
  callbackURL?: string;
};

type UpdateUserParams = {
  name?: string;
  image?: string;
  timezone?: string;
  timezoneMode?: "auto" | "custom";
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
      // ensure we have the latest fresh session data before unlinking
      await authClient.getSession({ query: { disableCookieCache: true } });
      const result = await authClient.unlinkAccount({ providerId: provider });

      if (result?.error) {
        throw result.error;
      }

      return result;
    },
    onError: (error: { code?: string }) => {
      if (error?.code === "SESSION_NOT_FRESH") {
        toast.error("For your security, please sign out and sign in again before disconnecting an account.");
      } else {
        toast.error("Failed to disconnect. Please try again.");
      }
    },
  });
}

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

/** List linked accounts for the current user */
export function useListAccounts() {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ["accounts", userId],
    queryFn: async () => {
      const result = await authClient.listAccounts();
      if (result.error) throw result.error;
      return (result.data ?? []) as Array<{ providerId: string }>;
    },
    enabled: !!userId,
  });
}

/** Returns whether the current user has a credential (email/password) account */
export function useIsCredentialUser() {
  const { data: accounts, isLoading } = useListAccounts();
  return {
    isCredentialUser: accounts?.some((a) => a.providerId === "credential") ?? false,
    isLoading,
  };
}

/** Permanently delete the current user account (or sends verification email instead if configured) */
export function useDeleteUser() {
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

/** Confirm and finalize account deletion using the token from the email */
export function useDeleteUserWithToken() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (token: string) => {
      const result = await authClient.deleteUser({ token });

      if (result?.error) {
        throw result.error;
      }

      return result;
    },
    onSuccess: () => {
      router.push(routes.auth.goodbye());
    },
  });
}
