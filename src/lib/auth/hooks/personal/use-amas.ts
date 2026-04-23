"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcTQUtils } from "@/lib/orpc/orpc-client";

export function useListAmas() {
  return useQuery(
    orpcTQUtils.personal.amas.list.queryOptions({ input: undefined }),
  );
}

export function useAddAmaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { recruitName: string; agentCode?: string; date: string }) =>
      orpc.personal.amas.add(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.personal.amas.list.queryOptions({ input: undefined }).queryKey,
      });
    },
  });
}

export function useGetMemberAmas(organizationId: string, targetUserId: string) {
  return useQuery(
    orpcTQUtils.personal.amas.getMemberAmas.queryOptions({
      input: { organizationId, targetUserId },
      enabled: !!organizationId && !!targetUserId,
    }),
  );
}

export function useDeleteAmaItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string }) => orpc.personal.amas.delete(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.personal.amas.list.queryOptions({ input: undefined }).queryKey,
      });
    },
  });
}
