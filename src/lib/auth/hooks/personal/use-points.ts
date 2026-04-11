"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcTQUtils } from "@/lib/orpc/orpc-client";

export function useListPoints() {
  return useQuery(
    orpcTQUtils.personal.points.list.queryOptions({ input: undefined }),
  );
}

export function useAddPointItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { description: string; amount: number; date: string }) =>
      orpc.personal.points.add(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.personal.points.list.queryOptions({ input: undefined }).queryKey,
      });
    },
  });
}

export function useDeletePointItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string }) => orpc.personal.points.delete(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.personal.points.list.queryOptions({ input: undefined }).queryKey,
      });
    },
  });
}

export function useGetMemberPoints(organizationId: string, targetUserId: string) {
  return useQuery(
    orpcTQUtils.personal.points.getMemberPoints.queryOptions({
      input: { organizationId, targetUserId },
      enabled: !!organizationId && !!targetUserId,
    }),
  );
}

export function useGetPointsLeaderboard(
  organizationId: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery(
    orpcTQUtils.personal.points.getOrgLeaderboard.queryOptions({
      input: { organizationId, startDate, endDate },
      enabled: !!organizationId,
    }),
  );
}
