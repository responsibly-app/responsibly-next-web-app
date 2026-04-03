"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/auth-client";
import { orpcTQUtils, orpc } from "@/lib/orpc/orpc-client";
import { OrgRole, canAssignRole } from "./permissions";

export type ListMembersQuery = {
    organizationId: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    filterField?: string;
    filterOperator?: "in" | "contains" | "starts_with" | "ends_with" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "not_in";
    filterValue?: string;
};

/** Get the current user's role in a specific organization directly from the DB */
export function useGetMemberRole(organizationId: string) {
    return useQuery(
        orpcTQUtils.organization.getMemberRole.queryOptions({
            input: { organizationId },
            enabled: !!organizationId,
            staleTime: 0,
            gcTime: 0,
        })
    );
}

/** Get roles the current user can assign to other members in an organization */
export function useGetAssignableRoles(organizationId: string) {
    return useQuery(
        orpcTQUtils.organization.getAssignableRoles.queryOptions({
            input: { organizationId },
            enabled: !!organizationId,
            staleTime: 0,
            gcTime: 0,
        })
    );
}

/** Get roles the current user can use when inviting new members to an organization */
export function useGetInvitableRoles(organizationId: string) {
    return useQuery(
        orpcTQUtils.organization.getInvitableRoles.queryOptions({
            input: { organizationId },
            enabled: !!organizationId,
            staleTime: 0,
            gcTime: 0,
        })
    );
}

/** List members of an organization */
export function useListMembers(query: ListMembersQuery) {
    return useQuery({
        queryKey: ["organization", "members", query],
        queryFn: async () => {
            const result = await authClient.organization.listMembers({ query });
            if (result.error) throw result.error;
            return result.data;
        },
    });
}


/** Get the current user's active member role in the active organization */
export function useGetActiveMemberRole() {
    return useQuery({
        queryKey: ["organization", "active-member-role"],
        queryFn: async () => {
            const result = await authClient.organization.getActiveMemberRole();
            if (result.error) throw result.error;
            return result.data?.role;
        },
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
        mutationFn: async ({ memberId, role, organizationId }: { memberId: string; role: OrgRole; organizationId: string }) => {
            const { role: actorRole } = await orpc.organization.getMemberRole({ organizationId });
            if (!actorRole || !canAssignRole(actorRole as OrgRole, role)) {
                throw new Error("You cannot assign a role higher than your own.");
            }
            const result = await authClient.organization.updateMemberRole({ memberId, role, organizationId });
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["organization"] });
            queryClient.invalidateQueries({ queryKey: orpcTQUtils.organization.listMine.queryOptions().queryKey });
        },
        onError: (err: { message?: string }) => {
            toast.error(err?.message ?? "Failed to update role.");
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
