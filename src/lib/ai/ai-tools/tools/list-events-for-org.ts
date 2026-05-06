import { tool, zodSchema } from "ai";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, user } from "@/lib/db/schema/better-auth-schema";
import { event } from "@/lib/db/schema/event-schema";

export const meta = {
  name: "list_events_for_org",
  description: "List all past and upcoming events for a specific organization.",
  embeddingDescription:
    "Retrieve a complete list of all events — both past and future — associated with a specific organization the user is a member of. Use this when the user asks about a particular organization's event history, past meetups, upcoming events for a specific group, scheduled activities, or wants to browse what has happened or is planned within a particular organization.",
  deps: ["list_my_organizations"],
} as const;

export function listEventsForOrg(userId: string) {
  return tool({
    description: meta.description,
    inputSchema: zodSchema(
      z.object({
        organizationId: z.string().describe("The organization ID to list events for"),
      }),
    ),
    execute: async ({ organizationId }: { organizationId: string }) => {
      const memberRow = await db
        .select({ role: member.role })
        .from(member)
        .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
        .limit(1)
        .then((r) => r[0]);

      if (!memberRow) {
        return { error: "You are not a member of this organization." };
      }

      return db
        .select({
          id: event.id,
          title: event.title,
          eventType: event.eventType,
          startAt: event.startAt,
          endAt: event.endAt,
          location: event.location,
          zoomJoinUrl: event.zoomJoinUrl,
          creatorName: user.name,
        })
        .from(event)
        .leftJoin(user, eq(event.createdBy, user.id))
        .where(eq(event.organizationId, organizationId))
        .orderBy(desc(event.startAt));
    },
  });
}
