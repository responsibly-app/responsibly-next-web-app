import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, user } from "@/lib/db/schema/better-auth-schema";
import { event, eventAttendance } from "@/lib/db/schema/event-schema";
import { authed } from "@/lib/orpc/base";
import {
  ListEventsInputSchema,
  ListEventsOutputSchema,
  EventSchema,
  CreateEventInputSchema,
  DeleteEventInputSchema,
  GetEventAttendanceInputSchema,
  GetEventAttendanceOutputSchema,
  MarkAttendanceInputSchema,
} from "./event-schemas";

async function requireOrgMember(organizationId: string, userId: string) {
  const row = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1)
    .then((rows) => rows[0]);
  if (!row) throw new ORPCError("FORBIDDEN");
  return row.role;
}

async function requireOrgAdmin(organizationId: string, userId: string) {
  const role = await requireOrgMember(organizationId, userId);
  if (!["owner", "admin"].includes(role)) throw new ORPCError("FORBIDDEN");
}

export const eventRouter = {
  list: authed
    .route({
      method: "GET",
      path: "/event/list",
      summary: "List events for an organization",
      tags: ["Event"],
    })
    .input(ListEventsInputSchema)
    .output(ListEventsOutputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgMember(input.organizationId, context.session.user.id);

      const rows = await db
        .select({
          id: event.id,
          organizationId: event.organizationId,
          title: event.title,
          description: event.description,
          startAt: event.startAt,
          endAt: event.endAt,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          creatorName: user.name,
        })
        .from(event)
        .leftJoin(user, eq(event.createdBy, user.id))
        .where(eq(event.organizationId, input.organizationId))
        .orderBy(desc(event.startAt));

      return rows;
    }),

  create: authed
    .route({
      method: "POST",
      path: "/event/create",
      summary: "Create an event for an organization",
      tags: ["Event"],
    })
    .input(CreateEventInputSchema)
    .output(EventSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      await requireOrgAdmin(input.organizationId, userId);

      const id = crypto.randomUUID();
      const [row] = await db
        .insert(event)
        .values({
          id,
          organizationId: input.organizationId,
          title: input.title,
          description: input.description ?? null,
          startAt: new Date(input.startAt),
          endAt: input.endAt ? new Date(input.endAt) : null,
          createdBy: userId,
          createdAt: new Date(),
        })
        .returning();

      return { ...row, creatorName: context.session.user.name ?? null };
    }),

  delete: authed
    .route({
      method: "DELETE",
      path: "/event/delete",
      summary: "Delete an event",
      tags: ["Event"],
    })
    .input(DeleteEventInputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgAdmin(input.organizationId, context.session.user.id);
      await db.delete(event).where(eq(event.id, input.eventId));
      return { success: true };
    }),

  getAttendance: authed
    .route({
      method: "GET",
      path: "/event/attendance",
      summary: "Get attendance records for an event",
      tags: ["Event"],
    })
    .input(GetEventAttendanceInputSchema)
    .output(GetEventAttendanceOutputSchema)
    .handler(async ({ input }) => {
      const rows = await db
        .select({
          id: eventAttendance.id,
          eventId: eventAttendance.eventId,
          memberId: eventAttendance.memberId,
          status: eventAttendance.status,
          markedAt: eventAttendance.markedAt,
          markedBy: eventAttendance.markedBy,
          memberName: user.name,
          memberEmail: user.email,
          memberImage: user.image,
        })
        .from(eventAttendance)
        .leftJoin(member, eq(eventAttendance.memberId, member.id))
        .leftJoin(user, eq(member.userId, user.id))
        .where(eq(eventAttendance.eventId, input.eventId));

      return rows.map((r) => ({
        ...r,
        status: r.status as "present" | "absent" | "excused",
      }));
    }),

  markAttendance: authed
    .route({
      method: "POST",
      path: "/event/mark-attendance",
      summary: "Mark attendance for a member at an event",
      tags: ["Event"],
    })
    .input(MarkAttendanceInputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgAdmin(input.organizationId, context.session.user.id);

      await db
        .insert(eventAttendance)
        .values({
          id: crypto.randomUUID(),
          eventId: input.eventId,
          memberId: input.memberId,
          status: input.status,
          markedAt: new Date(),
          markedBy: context.session.user.id,
        })
        .onConflictDoUpdate({
          target: [eventAttendance.eventId, eventAttendance.memberId],
          set: {
            status: input.status,
            markedAt: new Date(),
            markedBy: context.session.user.id,
          },
        });

      return { success: true };
    }),
};
