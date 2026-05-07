import type { Session } from "@/lib/orpc/context";
import { createServerCaller } from "@/lib/orpc/server-caller";
import { getMyProfile, listMyOrganizations } from "./tools/profile-tools";
import {
  listUpcomingEvents,
  listEventsForOrg,
  getEvent,
  createEvent,
  deleteEvent,
  getEventAttendance,
  getEventAttendanceLeaderboard,
  rsvpEvent,
} from "./tools/event-tools";
import { getMyPoints, getOrgLeaderboard, addPoint } from "./tools/points-tools";
import { getMyAmas, addAma } from "./tools/ama-tools";
import { getInviteHistory, logInvites } from "./tools/invite-tools";

const toolDefs = [
  // Profile
  getMyProfile,
  listMyOrganizations,
  // Events
  listUpcomingEvents,
  listEventsForOrg,
  getEvent,
  createEvent,
  deleteEvent,
  getEventAttendance,
  getEventAttendanceLeaderboard,
  rsvpEvent,
  // Points
  getMyPoints,
  getOrgLeaderboard,
  addPoint,
  // AMAs
  getMyAmas,
  addAma,
  // Invites
  getInviteHistory,
  logInvites,
] as const;

export const agentToolMeta = toolDefs.map((t) => t.meta);

type AgentTools = {
  [T in (typeof toolDefs)[number] as T["meta"]["name"]]: ReturnType<T["create"]>;
};

export function createAgentTools(session: Session): AgentTools {
  const caller = createServerCaller(session);
  return Object.fromEntries(
    toolDefs.map((t) => [t.meta.name, t.create(caller)]),
  ) as AgentTools;
}
