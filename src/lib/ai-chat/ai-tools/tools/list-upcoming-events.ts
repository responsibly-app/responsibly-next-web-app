import { tool, zodSchema } from "ai";
import { z } from "zod";
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, organization } from "@/lib/db/schema/better-auth-schema";
import { event } from "@/lib/db/schema/event-schema";

export const meta = {
  name: "list_upcoming_events",
  description:
    "List the next upcoming events across all organizations the current user belongs to.",
  embeddingDescription:
    "Retrieve the soonest upcoming events scheduled across all organizations the user is a member of, ordered by date ascending, up to 10 results. Use this when the user asks about upcoming events, what is scheduled, what is coming up soon, their calendar, future meetups, next activities, or anything happening soon across all their groups and organizations.",
} as const;

export function listUpcomingEvents(userId: string) {
  return tool({
    description: meta.description,
    inputSchema: zodSchema(z.object({})),
    execute: async () => {
      return db
        .select({
          id: event.id,
          organizationId: event.organizationId,
          organizationName: organization.name,
          title: event.title,
          eventType: event.eventType,
          startAt: event.startAt,
          endAt: event.endAt,
          location: event.location,
          zoomJoinUrl: event.zoomJoinUrl,
        })
        .from(event)
        .innerJoin(organization, eq(event.organizationId, organization.id))
        .innerJoin(
          member,
          and(eq(member.organizationId, event.organizationId), eq(member.userId, userId)),
        )
        .where(gte(event.startAt, new Date()))
        .orderBy(asc(event.startAt))
        .limit(10);
    },
  });
}
