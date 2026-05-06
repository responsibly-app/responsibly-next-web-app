// Verbosity is controlled by the AI_LOG_LEVEL env var.
// Levels (ascending): silent | error | warn | info | debug | verbose
// Default: info
//
// info    — summary lines (tools selected, LLM input counts)
// debug   — per-turn breakdown of model context, dedup events
// verbose — full prettified JSON of LLM input messages and each step's output

export type LogLevel = "silent" | "error" | "warn" | "info" | "debug" | "verbose";

const LEVELS: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  verbose: 5,
};

const AI_LOG_LEVEL = (process.env.AI_LOG_LEVEL ?? "verbose") as LogLevel;

function currentLevel(): number {
  // return LEVELS[AI_LOG_LEVEL] ?? LEVELS.info;
  return 0;
}

function at(level: LogLevel): boolean {
  return currentLevel() >= LEVELS[level];
}

export const logger = {
  error: (msg: string) => at("error") && console.error(msg),
  warn: (msg: string) => at("warn") && console.warn(msg),
  info: (msg: string) => at("info") && console.log(msg),
  debug: (msg: string) => at("debug") && console.log(msg),
  verbose: (msg: string) => at("verbose") && console.log(msg),
};

// --- LLM input logging ---

type AnyPart = string | { type: string; text?: string; toolName?: string; toolCallId?: string };
type AnyModelMessage = { role: string; content: string | AnyPart[] };

function formatTurn(msg: AnyModelMessage, i: number): string {
  const parts = Array.isArray(msg.content)
    ? msg.content
      .map((p) => {
        if (typeof p === "string") return `text("${p.slice(0, 60)}")`;
        if (p.type === "text") return `text("${(p.text ?? "").slice(0, 60)}")`;
        if (p.type === "tool-call") return `tool-call(${p.toolName})`;
        if (p.type === "tool-result") return `tool-result(${String(p.toolCallId).slice(-8)})`;
        return p.type;
      })
      .join(" | ")
    : typeof msg.content === "string"
      ? `text("${msg.content.slice(0, 60)}")`
      : JSON.stringify(msg.content).slice(0, 80);
  return `  [${i}] ${msg.role}: ${parts}`;
}

export function logLLMInput(uiMessageCount: number, modelMessages: AnyModelMessage[]): void {
  logger.info(`[LLM Input] ui_messages=${uiMessageCount} model_turns=${modelMessages.length}`);
  if (at("debug")) {
    modelMessages.forEach((msg, i) => console.log(formatTurn(msg, i)));
  }
  if (at("verbose")) {
    console.log("[LLM Input JSON]\n" + JSON.stringify(modelMessages, null, 2));
  }
}

type StepOutput = {
  stepNumber: number;
  finishReason: string;
  text: string;
  toolCalls: unknown[];
  toolResults: unknown[];
  usage: { inputTokens?: number; outputTokens?: number };
};

export function logLLMStepOutput(step: StepOutput, index: number): void {
  if (!at("verbose")) return;
  console.log(
    `[LLM Step ${index} Output]\n` +
    JSON.stringify(
      {
        finishReason: step.finishReason,
        text: step.text || undefined,
        toolCalls: step.toolCalls.length ? step.toolCalls : undefined,
        toolResults: step.toolResults.length ? step.toolResults : undefined,
        usage: step.usage,
      },
      null,
      2,
    ),
  );
}

export function logSelectedTools(toolNames: string[]): void {
  logger.info(`[ChatStream] tools: ${toolNames.join(", ")}`);
}

export function logDedup(toolCallCount: number): void {
  logger.debug(`[Dedup] Dropping partial assistant message (${toolCallCount} tool calls already in a later message)`);
}
