"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";

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
