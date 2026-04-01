"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";

type CreateTeamParams = {
  name: string;
  organizationId?: string;
};

type UpdateTeamParams = {
  teamId: string;
  data: { name?: string };
};

/** List all teams in the active (or specified) organization */
export function useListTeams(organizationId?: string) {
  return useQuery({
    queryKey: ["teams", organizationId],
    queryFn: async () => {
      const result = await authClient.organization.listTeams({
        query: organizationId ? { organizationId } : undefined,
      });
      if (result.error) throw result.error;
      return result.data ?? [];
    },
  });
}

/** Create a new team */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: CreateTeamParams) => {
      const result = await authClient.organization.createTeam(params);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

/** Update a team's details */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, data }: UpdateTeamParams) => {
      const result = await authClient.organization.updateTeam({ teamId, data });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

/** Remove a team */
export function useRemoveTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      const result = await authClient.organization.removeTeam({ teamId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}

/** Add a member to a team */
export function useAddTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const result = await authClient.organization.addTeamMember({ teamId, userId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_data, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
  });
}

/** Remove a member from a team */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const result = await authClient.organization.removeTeamMember({ teamId, userId });
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_data, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ["teams", teamId] });
    },
  });
}
