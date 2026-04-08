"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcTQUtils } from "@/lib/orpc/orpc-client";

export function useGetOrgSettings(organizationId: string) {
  return useQuery(
    orpcTQUtils.organization.settings.get.queryOptions({
      input: { organizationId },
      enabled: !!organizationId,
    }),
  );
}

export function useUpdateOrgSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      organizationId: string;
      minAttendanceDurationMinutes?: number;
      zoomAutoMarkPresent?: boolean;
    }) => orpc.organization.settings.update(input),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.organization.settings.get.queryOptions({
          input: { organizationId },
        }).queryKey,
      });
    },
  });
}
