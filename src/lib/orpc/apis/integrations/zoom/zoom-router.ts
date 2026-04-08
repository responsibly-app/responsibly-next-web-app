import crypto from "crypto";
import { z } from "zod/v3";
import { and, eq } from "drizzle-orm";
import { authed, zoomAuthed, pub } from "@/lib/orpc/base";
import { isZoomConnected } from "@/lib/sdks/zoom-client";
import { db } from "@/lib/db";
import { member, user } from "@/lib/db/schema/better-auth-schema";
import {
  event,
  eventAttendance,
  zoomParticipantSession,
} from "@/lib/db/schema/event-schema";
import { organizationSettings } from "@/lib/db/schema/org-settings-schema";
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

            // URL validation challenge (Zoom sends this when registering the webhook)
            if (input?.event === "endpoint.url_validation") {
                const plainToken = input?.payload?.plainToken ?? "";
                const encryptedToken = crypto
                    .createHmac("sha256", secret)
                    .update(plainToken)
                    .digest("hex");
                return { plainToken, encryptedToken };
            }

            // Verify HMAC signature
            if (secret) {
                const rawBody = JSON.stringify(input);
                const message = `v0:${timestamp}:${rawBody}`;
                const hash = crypto.createHmac("sha256", secret).update(message).digest("hex");
                const expected = `v0=${hash}`;
                const isValid = signature.length === expected.length &&
                    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
                if (!isValid) {
                    return { error: "Invalid signature" };
                }
            }

            const eventType = input?.event as string;
            const obj = input?.payload?.object as Record<string, unknown> | undefined;
            if (!obj) return { received: true };

            const meetingId = String(obj.id ?? "");
            const participant = obj.participant as Record<string, unknown> | undefined;
            if (!participant || !meetingId) return { received: true };

            const participantEmail = (participant.email as string | undefined)?.toLowerCase() ?? "";
            const participantUserId = (participant.user_id as string | undefined) ?? "";

            const eventRow = await db
                .select({ id: event.id, organizationId: event.organizationId })
                .from(event)
                .where(eq(event.zoomMeetingId, meetingId))
                .limit(1)
                .then((r) => r[0]);

            if (!eventRow) return { received: true };

            if (eventType === "meeting.participant_joined") {
                const joinTime = (participant.join_time as string | undefined) ?? new Date().toISOString();
                await db.insert(zoomParticipantSession).values({
                    id: crypto.randomUUID(),
                    eventId: eventRow.id,
                    zoomMeetingId: meetingId,
                    participantUserId,
                    participantEmail,
                    joinedAt: new Date(joinTime),
                });
            } else if (eventType === "meeting.participant_left") {
                const leaveTime = (participant.leave_time as string | undefined) ?? new Date().toISOString();
                const duration = participant.duration as number | undefined;

                // Close the open session
                const openSession = await db
                    .select({ id: zoomParticipantSession.id })
                    .from(zoomParticipantSession)
                    .where(
                        and(
                            eq(zoomParticipantSession.eventId, eventRow.id),
                            eq(zoomParticipantSession.participantEmail, participantEmail),
                        ),
                    )
                    .orderBy(zoomParticipantSession.joinedAt)
                    .limit(1)
                    .then((r) => r[0]);

                if (openSession) {
                    await db
                        .update(zoomParticipantSession)
                        .set({ leftAt: new Date(leaveTime), duration: duration ?? null })
                        .where(eq(zoomParticipantSession.id, openSession.id));
                }

                const settings = await db
                    .select({
                        minAttendanceDurationMinutes: organizationSettings.minAttendanceDurationMinutes,
                        zoomAutoMarkPresent: organizationSettings.zoomAutoMarkPresent,
                    })
                    .from(organizationSettings)
                    .where(eq(organizationSettings.organizationId, eventRow.organizationId))
                    .limit(1)
                    .then((r) => r[0]);

                if (!settings?.zoomAutoMarkPresent) return { received: true };

                // --- Member resolution ---
                // Match by participant email from Zoom registration (auto-approved).
                // The meeting requires registration with email, so the webhook carries
                // the registrant's email which should match their web app account email.
                // No email (pure guest) → skip; manual attendance required.
                let resolvedMemberId: string | null = null;

                if (participantEmail) {
                    const userRow = await db
                        .select({ id: user.id })
                        .from(user)
                        .where(eq(user.email, participantEmail))
                        .limit(1)
                        .then((r) => r[0]);

                    if (userRow) {
                        const memberRow = await db
                            .select({ id: member.id })
                            .from(member)
                            .where(
                                and(
                                    eq(member.organizationId, eventRow.organizationId),
                                    eq(member.userId, userRow.id),
                                ),
                            )
                            .limit(1)
                            .then((r) => r[0]);
                        resolvedMemberId = memberRow?.id ?? null;
                    }
                }

                // No match found — manual attendance required
                if (!resolvedMemberId) return { received: true };

                // Resolve userId from memberId (needed for markedBy field)
                const resolvedMemberUser = await db
                    .select({ userId: member.userId })
                    .from(member)
                    .where(eq(member.id, resolvedMemberId))
                    .limit(1)
                    .then((r) => r[0]);

                const sessions = await db
                    .select({ duration: zoomParticipantSession.duration })
                    .from(zoomParticipantSession)
                    .where(
                        and(
                            eq(zoomParticipantSession.eventId, eventRow.id),
                            eq(zoomParticipantSession.participantEmail, participantEmail),
                        ),
                    );

                const totalDuration = sessions.reduce((acc, s) => acc + (s.duration ?? 0), 0);
                const minRequired = settings.minAttendanceDurationMinutes ?? 0;
                if (totalDuration < minRequired) return { received: true };

                const memberRow = { id: resolvedMemberId };

                if (!memberRow) return { received: true };

                const firstSession = await db
                    .select({ joinedAt: zoomParticipantSession.joinedAt })
                    .from(zoomParticipantSession)
                    .where(
                        and(
                            eq(zoomParticipantSession.eventId, eventRow.id),
                            eq(zoomParticipantSession.participantEmail, participantEmail),
                        ),
                    )
                    .orderBy(zoomParticipantSession.joinedAt)
                    .limit(1)
                    .then((r) => r[0]);

                const existing = await db
                    .select({ sources: eventAttendance.sources })
                    .from(eventAttendance)
                    .where(
                        and(
                            eq(eventAttendance.eventId, eventRow.id),
                            eq(eventAttendance.memberId, memberRow.id),
                        ),
                    )
                    .limit(1)
                    .then((r) => r[0]);

                const currentSources = existing?.sources ?? [];
                const newSources = currentSources.includes("zoom")
                    ? currentSources
                    : [...currentSources, "zoom"];

                await db
                    .insert(eventAttendance)
                    .values({
                        id: crypto.randomUUID(),
                        eventId: eventRow.id,
                        memberId: memberRow.id,
                        status: "present",
                        markedAt: new Date(),
                        markedBy: resolvedMemberUser?.userId ?? resolvedMemberId,
                        zoomDuration: totalDuration,
                        zoomFirstJoinedAt: firstSession?.joinedAt ?? null,
                        onlinePresentViaZoom: true,
                        sources: ["zoom"],
                    })
                    .onConflictDoUpdate({
                        target: [eventAttendance.eventId, eventAttendance.memberId],
                        set: {
                            status: "present",
                            zoomDuration: totalDuration,
                            zoomFirstJoinedAt: firstSession?.joinedAt ?? null,
                            onlinePresentViaZoom: true,
                            sources: newSources,
                        },
                    });
            }

            return { received: true };
        }),
};
