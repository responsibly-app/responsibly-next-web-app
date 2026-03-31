"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

type OrgRole = "owner" | "admin" | "member";

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

type InviteMemberParams = {
  email: string;
  role: OrgRole;
  organizationId?: string;
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

/** Get the current user's member record in the active organization */
export function useGetActiveMember() {
  return useQuery({
    queryKey: ["organization", "active-member"],
    queryFn: async () => {
      const result = await authClient.organization.getActiveMember();
      if (result.error) throw result.error;
      return result.data;
    },
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

/** Invite a member to an organization */
export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: InviteMemberParams) => {
      const result = await authClient.organization.inviteMember(params);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Cancel a pending invitation */
export function useCancelInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await authClient.organization.cancelInvitation({ invitationId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Get an invitation by ID */
export function useGetInvitation(invitationId: string) {
  return useQuery({
    queryKey: ["organization", "invitation", invitationId],
    queryFn: async () => {
      const result = await authClient.organization.getInvitation({ query: { id: invitationId } });
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!invitationId,
  });
}

/** Accept an invitation */
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await authClient.organization.acceptInvitation({ invitationId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Reject an invitation */
export function useRejectInvitation() {
  return useMutation({
    mutationFn: async (invitationId: string) => {
      const result = await authClient.organization.rejectInvitation({ invitationId });
      if (result.error) throw result.error;
      return result.data;
    },
  });
}

/** Remove a member from an organization */
export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberIdOrEmail, organizationId }: { memberIdOrEmail: string; organizationId?: string }) => {
      const result = await authClient.organization.removeMember({ memberIdOrEmail, organizationId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Update a member's role */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role, organizationId }: { memberId: string; role: OrgRole; organizationId?: string }) => {
      const result = await authClient.organization.updateMemberRole({ memberId, role, organizationId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}

/** Leave an organization */
export function useLeaveOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const result = await authClient.organization.leave({ organizationId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization"] });
    },
  });
}
