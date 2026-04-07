"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orpc, orpcTQUtils } from "@/lib/orpc/orpc-client";

export function useListEvents(organizationId: string) {
  return useQuery(
    orpcTQUtils.event.list.queryOptions({
      input: { organizationId },
      enabled: !!organizationId,
    }),
  );
}

export function useGetEvent(eventId: string) {
  return useQuery(
    orpcTQUtils.event.getEvent.queryOptions({
      input: { eventId },
      enabled: !!eventId,
    }),
  );
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      organizationId: string;
      title: string;
      description?: string;
      eventType?: "in_person" | "online" | "hybrid";
      startAt: string;
      endAt?: string;
    }) => orpc.event.create(input),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.event.list.queryOptions({ input: { organizationId } }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.event.listAllUpcoming.queryOptions({ input: undefined }).queryKey,
      });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      eventId: string;
      organizationId: string;
      title?: string;
      description?: string | null;
      eventType?: "in_person" | "online" | "hybrid" | null;
      startAt?: string;
      endAt?: string | null;
    }) => orpc.event.update(input),
    onSuccess: (data, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.event.list.queryOptions({ input: { organizationId } }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.event.getEvent.queryOptions({ input: { eventId: data.id } }).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.event.listAllUpcoming.queryOptions({ input: undefined }).queryKey,
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { eventId: string; organizationId: string }) =>
      orpc.event.delete(input),
    onSuccess: (_, { organizationId }) => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.event.list.queryOptions({ input: { organizationId } }).queryKey,
      });
    },
  });
}

export function useGetEventAttendance(eventId: string) {
  return useQuery(
    orpcTQUtils.event.getAttendance.queryOptions({
      input: { eventId },
      enabled: !!eventId,
    }),
  );
}

export function useGetLeaderboard(organizationId: string) {
  return useQuery(
    orpcTQUtils.event.getLeaderboard.queryOptions({
      input: { organizationId },
      enabled: !!organizationId,
    }),
  );
}

export function useListAllUpcomingEvents() {
  return useQuery(
    orpcTQUtils.event.listAllUpcoming.queryOptions({ input: undefined }),
  );
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      eventId: string;
      memberId: string;
      status: "present" | "absent" | "excused";
      organizationId: string;
    }) => orpc.event.markAttendance(input),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({
        queryKey: orpcTQUtils.event.getAttendance.queryOptions({ input: { eventId } }).queryKey,
      });
    },
  });
}
