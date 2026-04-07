import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { member, organization, user } from "@/lib/db/schema/better-auth-schema";
import { event, eventAttendance } from "@/lib/db/schema/event-schema";
import { authed } from "@/lib/orpc/base";
import { ROLE_LEVELS, type OrgRole } from "@/lib/auth/hooks/oraganization/permissions";
import {
  ListEventsInputSchema,
  ListEventsOutputSchema,
  EventSchema,
  CreateEventInputSchema,
  GetEventInputSchema,
  GetEventOutputSchema,
  UpdateEventInputSchema,
  DeleteEventInputSchema,
  GetEventAttendanceInputSchema,
  GetEventAttendanceOutputSchema,
  MarkAttendanceInputSchema,
  GetLeaderboardInputSchema,
  GetLeaderboardOutputSchema,
  ListAllUpcomingOutputSchema,
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

async function requireAtLeastRole(organizationId: string, userId: string, minRole: OrgRole) {
  const role = await requireOrgMember(organizationId, userId);
  const userLevel = ROLE_LEVELS[role as OrgRole] ?? Infinity;
  const requiredLevel = ROLE_LEVELS[minRole];
  if (userLevel > requiredLevel) throw new ORPCError("FORBIDDEN");
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
          eventType: event.eventType,
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

  getEvent: authed
    .route({
      method: "GET",
      path: "/event/get",
      summary: "Get a single event by ID",
      tags: ["Event"],
    })
    .input(GetEventInputSchema)
    .output(GetEventOutputSchema)
    .handler(async ({ input, context }) => {
      const rows = await db
        .select({
          id: event.id,
          organizationId: event.organizationId,
          organizationName: organization.name,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          startAt: event.startAt,
          endAt: event.endAt,
          createdBy: event.createdBy,
          createdAt: event.createdAt,
          creatorName: user.name,
        })
        .from(event)
        .innerJoin(organization, eq(event.organizationId, organization.id))
        .leftJoin(user, eq(event.createdBy, user.id))
        .where(eq(event.id, input.eventId))
        .limit(1);

      const row = rows[0];
      if (!row) throw new ORPCError("NOT_FOUND");

      const userRole = await requireOrgMember(row.organizationId, context.session.user.id);

      return { ...row, userRole };
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
      await requireAtLeastRole(input.organizationId, userId, "admin");

      const id = crypto.randomUUID();
      const [row] = await db
        .insert(event)
        .values({
          id,
          organizationId: input.organizationId,
          title: input.title,
          description: input.description ?? null,
          eventType: input.eventType ?? "in_person",
          startAt: new Date(input.startAt),
          endAt: input.endAt ? new Date(input.endAt) : null,
          createdBy: userId,
          createdAt: new Date(),
        })
        .returning();

      return { ...row, creatorName: context.session.user.name ?? null };
    }),

  update: authed
    .route({
      method: "PATCH",
      path: "/event/update",
      summary: "Update an event",
      tags: ["Event"],
    })
    .input(UpdateEventInputSchema)
    .output(EventSchema)
    .handler(async ({ input, context }) => {
      await requireAtLeastRole(input.organizationId, context.session.user.id, "admin");

      const updateValues: Partial<typeof event.$inferInsert> = {};
      if (input.title !== undefined) updateValues.title = input.title;
      if (input.description !== undefined) updateValues.description = input.description;
      if (input.eventType !== undefined) updateValues.eventType = input.eventType;
      if (input.startAt !== undefined) updateValues.startAt = new Date(input.startAt);
      if ("endAt" in input) updateValues.endAt = input.endAt ? new Date(input.endAt) : null;

      const [row] = await db
        .update(event)
        .set(updateValues)
        .where(eq(event.id, input.eventId))
        .returning();

      if (!row) throw new ORPCError("NOT_FOUND");

      const creatorRow = await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, row.createdBy))
        .limit(1);

      return { ...row, creatorName: creatorRow[0]?.name ?? null };
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
      await requireAtLeastRole(input.organizationId, context.session.user.id, "admin");
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
      await requireAtLeastRole(input.organizationId, context.session.user.id, "assistant");

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

  getLeaderboard: authed
    .route({
      method: "GET",
      path: "/event/leaderboard",
      summary: "Get attendance leaderboard for an organization",
      tags: ["Event"],
    })
    .input(GetLeaderboardInputSchema)
    .output(GetLeaderboardOutputSchema)
    .handler(async ({ input, context }) => {
      await requireOrgMember(input.organizationId, context.session.user.id);

      const rows = await db
        .select({
          memberId: member.id,
          memberName: user.name,
          memberEmail: user.email,
          memberImage: user.image,
          present: sql<number>`cast(count(case when ${eventAttendance.status} = 'present' then 1 end) as int)`,
          absent: sql<number>`cast(count(case when ${eventAttendance.status} = 'absent' then 1 end) as int)`,
          excused: sql<number>`cast(count(case when ${eventAttendance.status} = 'excused' then 1 end) as int)`,
        })
        .from(member)
        .innerJoin(user, eq(member.userId, user.id))
        .leftJoin(eventAttendance, eq(eventAttendance.memberId, member.id))
        .where(eq(member.organizationId, input.organizationId))
        .groupBy(member.id, user.name, user.email, user.image)
        .orderBy(
          desc(sql`count(case when ${eventAttendance.status} = 'present' then 1 end)`),
        );

      return rows;
    }),

  listAllUpcoming: authed
    .route({
      method: "GET",
      path: "/event/list-all-upcoming",
      summary: "List upcoming events from all organizations the user belongs to",
      tags: ["Event"],
    })
    .output(ListAllUpcomingOutputSchema)
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      const now = new Date();

      return db
        .select({
          id: event.id,
          organizationId: event.organizationId,
          organizationName: organization.name,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          startAt: event.startAt,
          endAt: event.endAt,
        })
        .from(event)
        .innerJoin(organization, eq(event.organizationId, organization.id))
        .innerJoin(
          member,
          and(eq(member.organizationId, event.organizationId), eq(member.userId, userId)),
        )
        .where(gte(event.startAt, now))
        .orderBy(asc(event.startAt))
        .limit(10);
    }),
};
