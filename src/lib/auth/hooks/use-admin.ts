"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

type ListUsersParams = {
  searchValue?: string;
  searchField?: "name" | "email";
  searchOperator?: "contains" | "starts_with" | "ends_with";
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  filterField?: string;
  filterValue?: string | number | boolean | string[] | number[];
  filterOperator?: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "in" | "not_in" | "contains" | "starts_with" | "ends_with";
};

type AdminRole = "user" | "admin";

type CreateUserParams = {
  email: string;
  name: string;
  password?: string;
  role?: AdminRole | AdminRole[];
  data?: Record<string, unknown>;
};

type BanUserParams = {
  userId: string;
  banReason?: string;
  banExpiresIn?: number;
};

/** List users with optional search/filter/sort/pagination */
export function useAdminListUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const result = await authClient.admin.listUsers({ query: params ?? {} });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Get a single user by ID */
export function useAdminGetUser(userId: string) {
  return useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: async () => {
      const result = await authClient.admin.getUser({ query: { id: userId } });
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!userId,
  });
}

/** List all sessions for a specific user */
export function useAdminListUserSessions(userId: string) {
  return useQuery({
    queryKey: ["admin", "sessions", userId],
    queryFn: async () => {
      const result = await authClient.admin.listUserSessions({ userId });
      if (result.error) throw result.error;
      return result.data?.sessions ?? [];
    },
    enabled: !!userId,
  });
}

/** Create a new user */
export function useAdminCreateUser() {
  return useMutation({
    mutationFn: async (params: CreateUserParams) => {
      const result = await authClient.admin.createUser(params);
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Update any field on a user */
export function useAdminUpdateUser() {
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Record<string, unknown> }) => {
      const result = await authClient.admin.updateUser({ userId, data });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Set a user's role */
export function useAdminSetRole() {
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AdminRole | AdminRole[] }) => {
      const result = await authClient.admin.setRole({ userId, role });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Ban a user */
export function useAdminBanUser() {
  return useMutation({
    mutationFn: async ({ userId, banReason, banExpiresIn }: BanUserParams) => {
      const result = await authClient.admin.banUser({ userId, banReason, banExpiresIn });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Unban a user */
export function useAdminUnbanUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.unbanUser({ userId });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Impersonate a user (start acting as them) */
export function useAdminImpersonateUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.impersonateUser({ userId });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Stop impersonating and return to original admin session */
export function useAdminStopImpersonating() {
  return useMutation({
    mutationFn: async () => {
      const result = await authClient.admin.stopImpersonating();
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Revoke a specific session by token */
export function useAdminRevokeUserSession() {
  return useMutation({
    mutationFn: async (sessionToken: string) => {
      const result = await authClient.admin.revokeUserSession({ sessionToken });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Revoke all sessions for a user */
export function useAdminRevokeUserSessions() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.revokeUserSessions({ userId });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Permanently remove a user */
export function useAdminRemoveUser() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const result = await authClient.admin.removeUser({ userId });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Set a user's password */
export function useAdminSetUserPassword() {
  return useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const result = await authClient.admin.setUserPassword({ userId, newPassword });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}
