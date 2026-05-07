import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ServerCaller } from "@/lib/orpc/server-caller";

export const listUpcomingEvents = {
  meta: {
    name: "list_upcoming_events",
    description:
      "List the next upcoming events across all organizations the current user belongs to.",
    embeddingDescription:
      "Retrieve the soonest upcoming events scheduled across all organizations the user is a member of, ordered by date ascending, up to 10 results. Use this when the user asks about upcoming events, what is scheduled, what is coming up soon, their calendar, future meetups, next activities, or anything happening soon across all their groups and organizations.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: listUpcomingEvents.meta.description,
      inputSchema: zodSchema(z.object({})),
      execute: async () => caller.event.listAllUpcoming(),
    });
  },
};

export const listEventsForOrg = {
  meta: {
    name: "list_events_for_org",
    description: "List all past and upcoming events for a specific organization.",
    embeddingDescription:
      "Retrieve a complete list of all events — both past and future — associated with a specific organization the user is a member of. Use this when the user asks about a particular organization's event history, past meetups, upcoming events for a specific group, scheduled activities, or wants to browse what has happened or is planned within a particular organization.",
    deps: ["list_my_organizations"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: listEventsForOrg.meta.description,
      inputSchema: zodSchema(
        z.object({
          organizationId: z.string().describe("The organization ID to list events for"),
        }),
      ),
      execute: async ({ organizationId }) => {
        try {
          return await caller.event.list({ organizationId });
        } catch {
          return { error: "You are not a member of this organization." };
        }
      },
    });
  },
};

export const getEvent = {
  meta: {
    name: "get_event",
    description: "Get full details of a specific event by its ID.",
    embeddingDescription:
      "Fetch complete details for a single event including title, description, type, location, start/end time, Zoom link, attendance methods, and the current user's role in the organization. Use this when the user asks about a specific event, wants to see event details, or needs information about a particular meeting or session.",
    deps: ["list_upcoming_events", "list_events_for_org"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getEvent.meta.description,
      inputSchema: zodSchema(
        z.object({
          eventId: z.string().describe("The event ID to retrieve"),
        }),
      ),
      execute: async ({ eventId }) => {
        try {
          return await caller.event.getEvent({ eventId });
        } catch {
          return { error: "Event not found or you do not have access." };
        }
      },
    });
  },
};

export const createEvent = {
  meta: {
    name: "create_event",
    description:
      "Create a new event for an organization. Requires admin or owner role in the organization.",
    embeddingDescription:
      "Create a new event, meeting, session, or activity for an organization the user administers. Use this when the user wants to schedule, plan, or create an event, meeting, workshop, or gathering. Requires the user to have admin or owner role. Ask for the organization, title, date/time, and event type if not provided.",
    deps: ["list_my_organizations"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: createEvent.meta.description,
      inputSchema: zodSchema(
        z.object({
          organizationId: z.string().describe("The organization to create the event in"),
          title: z.string().describe("Event title"),
          description: z.string().optional().describe("Event description"),
          eventType: z
            .enum(["in_person", "online", "hybrid"])
            .optional()
            .describe("Event type: in_person, online, or hybrid"),
          location: z
            .string()
            .optional()
            .describe("Physical location (for in-person/hybrid events)"),
          timezone: z
            .string()
            .optional()
            .describe("IANA timezone, e.g. America/New_York (defaults to UTC)"),
          startAt: z
            .string()
            .describe("ISO 8601 datetime for event start, e.g. 2025-06-15T18:00:00Z"),
          endAt: z.string().optional().describe("ISO 8601 datetime for event end"),
          attendanceMethods: z
            .array(z.enum(["manual", "qr", "zoom"]))
            .optional()
            .describe("How attendance will be tracked"),
        }),
      ),
      execute: async (input) => {
        try {
          return await caller.event.create({ ...input, zoomOption: "none" });
        } catch (err: any) {
          return {
            error: err?.message ?? "Failed to create event. You may not have the required role.",
          };
        }
      },
    });
  },
};

export const deleteEvent = {
  meta: {
    name: "delete_event",
    description: "Delete an event. Requires admin or owner role in the organization.",
    embeddingDescription:
      "Permanently delete an event from an organization. Use this when the user explicitly wants to delete, remove, or cancel an event. Requires admin or owner role. Always confirm with the user before deleting.",
    deps: ["list_events_for_org"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: deleteEvent.meta.description,
      inputSchema: zodSchema(
        z.object({
          eventId: z.string().describe("The event ID to delete"),
          organizationId: z.string().describe("The organization the event belongs to"),
        }),
      ),
      execute: async ({ eventId, organizationId }) => {
        try {
          return await caller.event.delete({ eventId, organizationId });
        } catch (err: any) {
          return {
            error:
              err?.message ?? "Failed to delete event. You may not have the required role.",
          };
        }
      },
    });
  },
};

export const getEventAttendance = {
  meta: {
    name: "get_event_attendance",
    description: "Get the attendance records for a specific event.",
    embeddingDescription:
      "Retrieve the full attendance list for an event, showing each member's attendance status (present, absent, excused), check-in method, and Zoom participation data. Use this when the user asks about who attended an event, attendance records, who showed up, absentees, check-in status, or wants to review attendance for a specific session.",
    deps: ["list_events_for_org"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getEventAttendance.meta.description,
      inputSchema: zodSchema(
        z.object({
          eventId: z.string().describe("The event ID to get attendance for"),
        }),
      ),
      execute: async ({ eventId }) => {
        try {
          return await caller.event.getAttendance({ eventId });
        } catch (err: any) {
          return { error: err?.message ?? "Failed to fetch attendance." };
        }
      },
    });
  },
};

export const getEventAttendanceLeaderboard = {
  meta: {
    name: "get_event_attendance_leaderboard",
    description:
      "Get the attendance leaderboard for an organization, ranked by total events attended.",
    embeddingDescription:
      "Fetch the event attendance leaderboard for an organization showing all members ranked by how many events they attended, missed, or were excused from. Use this when the user asks about attendance rankings, who attends the most events, attendance leaderboard, most committed members, or event participation stats.",
    deps: ["list_my_organizations"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getEventAttendanceLeaderboard.meta.description,
      inputSchema: zodSchema(
        z.object({
          organizationId: z.string().describe("The organization ID to get the leaderboard for"),
        }),
      ),
      execute: async ({ organizationId }) => {
        try {
          return await caller.event.getLeaderboard({ organizationId });
        } catch {
          return { error: "You are not a member of this organization." };
        }
      },
    });
  },
};

export const rsvpEvent = {
  meta: {
    name: "rsvp_event",
    description: "Toggle the current user's RSVP for an in-person or hybrid event.",
    embeddingDescription:
      "RSVP to or un-RSVP from an in-person or hybrid event. Use this when the user wants to confirm attendance, RSVP, register for, or cancel their RSVP for an event. Only works for in-person and hybrid events (not online-only).",
    deps: ["list_upcoming_events"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: rsvpEvent.meta.description,
      inputSchema: zodSchema(
        z.object({
          eventId: z.string().describe("The event ID to toggle RSVP for"),
        }),
      ),
      execute: async ({ eventId }) => {
        try {
          return await caller.event.toggleRsvp({ eventId });
        } catch (err: any) {
          return {
            error:
              err?.message ?? "Failed to RSVP. Event may be online-only or not found.",
          };
        }
      },
    });
  },
};
