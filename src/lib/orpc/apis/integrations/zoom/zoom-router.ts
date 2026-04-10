import { z } from "zod/v3";
import { authed, zoomAuthed, pub } from "@/lib/orpc/base";
import { isZoomConnected } from "@/lib/sdks/zoom-client";
import {
    handleUrlValidation,
    verifyHmacSignature,
    dispatchZoomEvent,
    type ZoomWebhookPayload,
} from "@/lib/sdks/zoom-webhook";
import {
    CreateMeetingInputSchema,
    ListMeetingsInputSchema,
    MeetingIdSchema,
    UpdateMeetingInputSchema,
    ZoomMeetingSchema,
    ZoomMeetingsListSchema,
    ZoomStatusOutputSchema,
    ZoomUserSchema,
} from "./zoom-schemas";
import { debugLog } from "@/debug";

export const zoomRouter = {
    status: authed
        .route({ method: "GET", path: "/zoom/status", summary: "Check Zoom connection status", tags: ["Zoom"] })
        .output(ZoomStatusOutputSchema)
        .handler(async ({ context }) => {
            const connected = await isZoomConnected(context.session.user.id);
            return { connected };
        }),

    profile: zoomAuthed
        .route({ method: "GET", path: "/zoom/profile", summary: "Get authenticated Zoom user profile", tags: ["Zoom"] })
        .output(ZoomUserSchema)
        .handler(async ({ context }) => context.zoom.getMe()),

    meetings: {
        list: zoomAuthed
            .route({ method: "GET", path: "/zoom/meetings", summary: "List meetings", tags: ["Zoom"] })
            .input(ListMeetingsInputSchema)
            .output(ZoomMeetingsListSchema)
            .handler(async ({ context, input }) => context.zoom.listMeetings("me", input)),

        get: zoomAuthed
            .route({ method: "GET", path: "/zoom/meetings/{meetingId}", summary: "Get a meeting by ID", tags: ["Zoom"] })
            .input(MeetingIdSchema)
            .output(ZoomMeetingSchema)
            .handler(async ({ context, input }) => context.zoom.getMeeting(input.meetingId)),

        create: zoomAuthed
            .route({ method: "POST", path: "/zoom/meetings", summary: "Create a new meeting", tags: ["Zoom"] })
            .input(CreateMeetingInputSchema)
            .output(ZoomMeetingSchema)
            .handler(async ({ context, input }) => context.zoom.createMeeting(input)),

        update: zoomAuthed
            .route({ method: "PATCH", path: "/zoom/meetings/{meetingId}", summary: "Update an existing meeting", tags: ["Zoom"] })
            .input(UpdateMeetingInputSchema)
            .output(z.void())
            .handler(async ({ context, input }) => {
                const { meetingId, ...params } = input;
                await context.zoom.updateMeeting(meetingId, params);
            }),

        delete: zoomAuthed
            .route({ method: "DELETE", path: "/zoom/meetings/{meetingId}", summary: "Delete a meeting", tags: ["Zoom"] })
            .input(MeetingIdSchema)
            .output(z.void())
            .handler(async ({ context, input }) => context.zoom.deleteMeeting(input.meetingId)),
    },

    webhook: pub
        .route({
            method: "POST",
            path: "/zoom/webhook",
            summary: "Receive Zoom meeting participant events",
            tags: ["Zoom"],
        })
        .input(z.any())
        .output(z.any())
        .handler(async ({ input, context }) => {
            const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN ?? "";
            const timestamp = context.headers.get("x-zm-request-timestamp") ?? "";
            const signature = context.headers.get("x-zm-signature") ?? "";

            if (input?.event === "endpoint.url_validation") {
                return handleUrlValidation(input?.payload?.plainToken ?? "", secret);
            }

            if (secret && !verifyHmacSignature({ rawBody: JSON.stringify(input), timestamp, signature, secret })) {
                return { error: "Invalid signature" };
            }

            debugLog("zoomWebhookRequests", 
                "Received Zoom webhook event:", JSON.stringify(input, null, 2));

            return dispatchZoomEvent(input as ZoomWebhookPayload);
        }),
};
