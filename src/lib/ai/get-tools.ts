import type { UIMessage, ToolSet } from "ai";
import type { Session } from "@/lib/orpc/context";
import { createAgentTools } from "./ai-tools/agent-tools";
import { createUITools } from "./ai-tools/ui-tool";
import { discoverToolNames } from "./ai-tools/tool-discovery";

const ALWAYS_INCLUDE = ["ask_question_flow", "request_approval"];

export async function getTools(session: Session, messages: UIMessage[]): Promise<ToolSet> {
  const toolSelectionQuery = messages
    .filter((m) => m.role === "user")
    .slice(-6)
    .flatMap((m) => m.parts.filter((p) => p.type === "text").map((p) => (p as { text: string }).text))
    .join(" ")
    .slice(0, 600);

  const selectedToolNames = await discoverToolNames(toolSelectionQuery);
  const allTools: ToolSet = { ...createAgentTools(session), ...createUITools() };
  const resolvedToolNames = [...new Set([...selectedToolNames, ...ALWAYS_INCLUDE])];
  return Object.fromEntries(
    resolvedToolNames
      .map((name) => [name, allTools[name]])
      .filter(([, t]) => t !== undefined),
  ) as ToolSet;
}
