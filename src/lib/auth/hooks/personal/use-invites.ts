"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcTQUtils } from "@/lib/orpc/orpc-client";

export function useGetInviteHistory(days = 90) {
  return useQuery(
    orpcTQUtils.personal.invites.getHistory.queryOptions({ input: { days } }),
  );
}

export function useGetMemberInviteHistory(organizationId: string, targetUserId: string, days = 90) {
  return useQuery(
    orpcTQUtils.personal.invites.getMemberHistory.queryOptions({
      input: { organizationId, targetUserId, days },
      enabled: !!organizationId && !!targetUserId,
    }),
  );
}

export function useLogInvites() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { date: string; count: number }) =>
      orpc.personal.invites.log(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.personal.invites.getHistory.queryOptions({ input: { days: 90 } }).queryKey,
      });
    },
  });
}
