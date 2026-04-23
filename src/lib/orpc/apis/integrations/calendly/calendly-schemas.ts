import { z } from "zod/v3";

export const CalendlyStatusOutputSchema = z.object({
    connected: z.boolean(),
});

export const CalendlyUserSchema = z.object({
    uri: z.string(),
    name: z.string(),
    slug: z.string(),
    email: z.string().email(),
    scheduling_url: z.string(),
    timezone: z.string(),
    avatar_url: z.string().nullable(),
    created_at: z.string(),
    updated_at: z.string(),
    current_organization: z.string(),
});

export const CalendlyEventTypeSchema = z.object({
    uri: z.string(),
    name: z.string(),
    active: z.boolean(),
    slug: z.string(),
    scheduling_url: z.string(),
    duration: z.number().describe("Duration in minutes"),
    kind: z.string(),
    type: z.string(),
    color: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    description_plain: z.string().nullable(),
    secret: z.boolean(),
    deleted_at: z.string().nullable(),
});

export const CalendlyPaginationSchema = z.object({
    count: z.number(),
    next_page: z.string().nullable(),
    previous_page: z.string().nullable(),
    next_page_token: z.string().nullable(),
    previous_page_token: z.string().nullable(),
});

export const CalendlyEventTypesResponseSchema = z.object({
    collection: z.array(CalendlyEventTypeSchema),
    pagination: CalendlyPaginationSchema,
});

export const CalendlyEventLocationSchema = z.object({
    type: z.string().optional(),
    location: z.string().nullish(),
    join_url: z.string().nullish(),
    status: z.string().nullish(),
}).passthrough().nullable();

export const CalendlyScheduledEventSchema = z.object({
    uri: z.string(),
    name: z.string(),
    status: z.enum(["active", "canceled"]),
    start_time: z.string(),
    end_time: z.string(),
    event_type: z.string(),
    location: CalendlyEventLocationSchema.optional(),
    invitees_counter: z.object({
        total: z.number(),
        active: z.number(),
        limit: z.number(),
    }),
    created_at: z.string(),
    updated_at: z.string(),
});

export const CalendlyScheduledEventsResponseSchema = z.object({
    collection: z.array(CalendlyScheduledEventSchema),
    pagination: CalendlyPaginationSchema,
});

export const ListScheduledEventsInputSchema = z.object({
    count: z.number().int().min(1).max(100).optional().default(20),
    min_start_time: z.string().optional().describe("ISO 8601 datetime lower bound for start_time"),
    max_start_time: z.string().optional().describe("ISO 8601 datetime upper bound for start_time"),
    status: z.enum(["active", "canceled"]).optional().default("active"),
    sort: z.string().optional().describe("e.g. 'start_time:asc'"),
    page_token: z.string().optional(),
});

export const ListEventTypesInputSchema = z.object({
    count: z.number().int().min(1).max(100).optional().default(20),
    page_token: z.string().optional(),
});
