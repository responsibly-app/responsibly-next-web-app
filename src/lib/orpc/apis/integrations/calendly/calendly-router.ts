import { authed, calendlyAuthed } from "@/lib/orpc/base";
import { isCalendlyConnected } from "@/lib/sdks/calendly-client";
import {
    CalendlyEventTypesResponseSchema,
    CalendlyScheduledEventsResponseSchema,
    CalendlyStatusOutputSchema,
    CalendlyUserSchema,
    ListEventTypesInputSchema,
    ListScheduledEventsInputSchema,
} from "./calendly-schemas";

export const calendlyRouter = {
    status: authed
        .route({ method: "GET", path: "/calendly/status", summary: "Check Calendly connection status", tags: ["Calendly"] })
        .output(CalendlyStatusOutputSchema)
        .handler(async ({ context }) => {
            const connected = await isCalendlyConnected(context.session.user.id);
            return { connected };
        }),

    profile: calendlyAuthed
        .route({ method: "GET", path: "/calendly/profile", summary: "Get authenticated Calendly user profile", tags: ["Calendly"] })
        .output(CalendlyUserSchema)
        .handler(async ({ context }) => context.calendly.getMe()),

    eventTypes: {
        list: calendlyAuthed
            .route({ method: "GET", path: "/calendly/event-types", summary: "List Calendly event types", tags: ["Calendly"] })
            .input(ListEventTypesInputSchema)
            .output(CalendlyEventTypesResponseSchema)
            .handler(async ({ context, input }) => {
                const me = await context.calendly.getMe();
                return context.calendly.listEventTypes(me.uri, input);
            }),
    },

    scheduledEvents: {
        list: calendlyAuthed
            .route({ method: "GET", path: "/calendly/scheduled-events", summary: "List scheduled Calendly events", tags: ["Calendly"] })
            .input(ListScheduledEventsInputSchema)
            .output(CalendlyScheduledEventsResponseSchema)
            .handler(async ({ context, input }) => {
                const me = await context.calendly.getMe();
                return context.calendly.listScheduledEvents(me.uri, input);
            }),
    },
};
