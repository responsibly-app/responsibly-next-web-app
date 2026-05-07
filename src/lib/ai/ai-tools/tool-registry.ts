import { agentToolMeta } from "./agent-tools";
import { uiToolMeta } from "./ui-tool";

export interface ToolMeta {
  name: string;
  description: string;
  embeddingDescription: string;
  deps?: readonly string[];
}

export const allToolMeta: ToolMeta[] = [...agentToolMeta, ...uiToolMeta];
