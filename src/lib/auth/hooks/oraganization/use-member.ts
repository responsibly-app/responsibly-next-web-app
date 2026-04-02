"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth/auth-client";
import { OrgRole } from "./use-organization";

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
