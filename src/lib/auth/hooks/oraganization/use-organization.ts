"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

export type OrgRole = "owner" | "admin" | "member";

type CreateOrganizationParams = {
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, unknown>;
};

type UpdateOrganizationParams = {
  name?: string;
  slug?: string;
  logo?: string;
  metadata?: Record<string, unknown>;
};

/** Reactive hook — active organization from better-auth */
export function useActiveOrganization() {
  return authClient.useActiveOrganization();
}

/** Reactive hook — list of organizations from better-auth */
export function useListOrganizations() {
  return authClient.useListOrganizations();
}

/** Get the full organization details (members, invitations, teams) */
export function useGetFullOrganization(organizationId?: string) {
  return useQuery({
    queryKey: ["organization", "full", organizationId],
    queryFn: async () => {
      const result = await authClient.organization.getFullOrganization({
        query: organizationId ? { organizationId } : undefined,
      });
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: organizationId !== undefined ? !!organizationId : true,
  });
}

/** Create a new organization */
export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: CreateOrganizationParams) => {
      const result = await authClient.organization.create(params);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Update an organization's details */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ organizationId, data }: { organizationId: string; data: UpdateOrganizationParams }) => {
      const result = await authClient.organization.update({ organizationId, data });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Delete an organization */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await authClient.organization.delete({ organizationId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Set the active organization */
export function useSetActiveOrganization() {
  return useMutation({
    mutationFn: async (organizationId: string | null) => {
      const result = await authClient.organization.setActive({ organizationId });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}
