import { meta as getMyPoints } from "./tools/get-my-points";
import { meta as getOrgLeaderboard } from "./tools/get-org-leaderboard";
import { meta as listEventsForOrg } from "./tools/list-events-for-org";
import { meta as listMyOrganizations } from "./tools/list-my-organizations";
import { meta as listUpcomingEvents } from "./tools/list-upcoming-events";

export interface ToolMeta {
  name: string;
  description: string;
  embeddingDescription: string;
  deps?: readonly string[];
}

export const agentToolMeta = [
  listMyOrganizations,
  listUpcomingEvents,
  listEventsForOrg,
  getMyPoints,
  getOrgLeaderboard,
] satisfies ToolMeta[];

// Add UI tool metadata here when enabling them
export const uiToolMeta: ToolMeta[] = [];

export const allToolMeta: ToolMeta[] = [...agentToolMeta, ...uiToolMeta];
