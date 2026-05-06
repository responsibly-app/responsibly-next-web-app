import type { Session } from "@/lib/orpc/context";
import { getMyPoints } from "./tools/get-my-points";
import { getOrgLeaderboard } from "./tools/get-org-leaderboard";
import { listEventsForOrg } from "./tools/list-events-for-org";
import { listMyOrganizations } from "./tools/list-my-organizations";
import { listUpcomingEvents } from "./tools/list-upcoming-events";

export function createAgentTools(session: Session) {
  const userId = session.user.id;

  return {
    list_my_organizations: listMyOrganizations(userId),
    list_upcoming_events: listUpcomingEvents(userId),
    list_events_for_org: listEventsForOrg(userId),
    get_my_points: getMyPoints(userId),
    get_org_leaderboard: getOrgLeaderboard(userId),
  };
}
