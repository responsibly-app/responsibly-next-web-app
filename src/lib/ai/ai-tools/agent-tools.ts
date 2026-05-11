import type { Session } from "@/lib/orpc/context";
import { createServerCaller } from "@/lib/orpc/server-caller";
import { profileTools } from "./tools/profile-tools";
import { eventTools } from "./tools/event-tools";
import { pointsTools } from "./tools/points-tools";
import { amaTools } from "./tools/ama-tools";
import { inviteTools } from "./tools/invite-tools";
import { calendlyTools } from "./tools/calendly-tools";

const toolDefs = [
  ...profileTools,
  ...eventTools,
  ...pointsTools,
  ...amaTools,
  ...inviteTools,
  ...calendlyTools,
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
