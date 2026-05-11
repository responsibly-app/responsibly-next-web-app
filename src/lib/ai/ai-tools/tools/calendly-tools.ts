import { tool, zodSchema } from "ai";
import { z } from "zod";
import { encode } from "@toon-format/toon";
import type { ServerCaller } from "@/lib/orpc/server-caller";

export const getCalendlyStatus = {
  meta: {
    name: "get_calendly_status",
    description: "Check whether the current user has Calendly connected.",
    embeddingDescription:
      "Check if the user's Calendly account is connected. Use this before calling any other Calendly tool to confirm the integration is available.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getCalendlyStatus.meta.description,
      inputSchema: zodSchema(z.object({})),
      execute: async () => encode(await caller.integrations.calendly.status()),
    });
  },
};

export const getCalendlyProfile = {
  meta: {
    name: "get_calendly_profile",
    description: "Get the authenticated user's Calendly profile.",
    embeddingDescription:
      "Retrieve the current user's Calendly profile including name, email, scheduling URL, and timezone. Use this when the user asks about their Calendly account, scheduling link, or profile details.",
    deps: ["get_calendly_status"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getCalendlyProfile.meta.description,
      inputSchema: zodSchema(z.object({})),
      execute: async () => {
        try {
          return encode(await caller.integrations.calendly.profile());
        } catch {
          return { error: "Calendly is not connected or profile could not be fetched." };
        }
      },
    });
  },
};

export const listCalendlyEventTypes = {
  meta: {
    name: "list_calendly_event_types",
    description: "List the current user's Calendly event types (booking pages).",
    embeddingDescription:
      "Retrieve all event types the user has configured in Calendly, such as 15-minute calls, 30-minute meetings, etc. Use this when the user asks about their meeting types, booking pages, scheduling options, or what events others can book with them.",
    deps: ["get_calendly_status"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: listCalendlyEventTypes.meta.description,
      inputSchema: zodSchema(
        z.object({
          count: z.number().int().min(1).max(100).optional().describe("Number of results (default 20)"),
          page_token: z.string().optional().describe("Token for the next page of results"),
        }),
      ),
      execute: async (input) => {
        try {
          return encode(await caller.integrations.calendly.eventTypes.list(input));
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return { error: `Failed to list Calendly event types: ${message}` };
        }
      },
    });
  },
};

export const listCalendlyScheduledEvents = {
  meta: {
    name: "list_calendly_scheduled_events",
    description: "List scheduled Calendly events (booked meetings) for the current user.",
    embeddingDescription:
      "Retrieve upcoming or past scheduled meetings booked through Calendly. Use this when the user asks about their Calendly schedule, who has booked time with them, upcoming Calendly meetings, or recent bookings. Supports filtering by status and date range.",
    deps: ["get_calendly_status"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: listCalendlyScheduledEvents.meta.description,
      inputSchema: zodSchema(
        z.object({
          count: z.number().int().min(1).max(100).optional().describe("Number of results (default 20)"),
          status: z.enum(["active", "canceled"]).optional().describe("Filter by status"),
          min_start_time: z.string().optional().describe("ISO 8601 lower bound for start time"),
          max_start_time: z.string().optional().describe("ISO 8601 upper bound for start time"),
          sort: z.string().optional().describe("Sort order, e.g. 'start_time:asc'"),
          page_token: z.string().optional().describe("Token for the next page of results"),
        }),
      ),
      execute: async (input) => {
        try {
          return encode(await caller.integrations.calendly.scheduledEvents.list(input));
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return { error: `Failed to list scheduled events: ${message}` };
        }
      },
    });
  },
};

export const getCalendlyScheduledEvent = {
  meta: {
    name: "get_calendly_scheduled_event",
    description: "Get full details of a specific Calendly scheduled event by UUID.",
    embeddingDescription:
      "Fetch complete details for a single Calendly scheduled event including its name, status, start/end time, location, and meeting link. Use this when the user asks about a specific booking or wants details on a particular scheduled event.",
    deps: ["list_calendly_scheduled_events"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getCalendlyScheduledEvent.meta.description,
      inputSchema: zodSchema(
        z.object({
          eventUuid: z.string().describe("The Calendly scheduled event UUID"),
        }),
      ),
      execute: async ({ eventUuid }) => {
        try {
          return encode(await caller.integrations.calendly.scheduledEvents.get({ eventUuid }));
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return { error: `Scheduled event not found: ${message}` };
        }
      },
    });
  },
};

export const listCalendlyEventInvitees = {
  meta: {
    name: "list_calendly_event_invitees",
    description: "List the invitees (attendees) for a specific Calendly scheduled event.",
    embeddingDescription:
      "Retrieve all people who booked a specific Calendly event, including their name, email, status, and any answers to custom questions. Use this when the user wants to know who booked a meeting, who signed up, attendee details, or invitee information for a scheduled event.",
    deps: ["list_calendly_scheduled_events"],
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: listCalendlyEventInvitees.meta.description,
      inputSchema: zodSchema(
        z.object({
          eventUuid: z.string().describe("The Calendly scheduled event UUID"),
          count: z.number().int().min(1).max(100).optional().describe("Number of results (default 20)"),
          status: z.enum(["active", "canceled"]).optional().describe("Filter by invitee status"),
          page_token: z.string().optional().describe("Token for the next page of results"),
        }),
      ),
      execute: async (input) => {
        try {
          return encode(await caller.integrations.calendly.scheduledEvents.invitees(input));
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return { error: `Failed to list invitees: ${message}` };
        }
      },
    });
  },
};

export const calendlyTools = [
  getCalendlyStatus,
  getCalendlyProfile,
  listCalendlyEventTypes,
  listCalendlyScheduledEvents,
  getCalendlyScheduledEvent,
  listCalendlyEventInvitees,
] as const;
