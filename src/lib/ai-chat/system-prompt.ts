import type { Session } from "@/lib/orpc/context";

function instructions(): string {
    return [
        `You are a helpful assistant.`,
    ].join("\n");
}

function userContext(session: Session): string {
    return `user is ${session.user.name ?? session.user.email} (ID: ${session.user.id}).`;
}

function dateContext(): string {
    const now = new Date();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatted = now.toLocaleString("en-US", { timeZone: timezone, dateStyle: "full", timeStyle: "short" });
    return `Current date and time: ${formatted} (${timezone}).`;
}

function ragContext(contextBlock: string): string {
    if (!contextBlock) return "";
    return `Use the following knowledge base context to inform your response. If the context is directly relevant, ground your answer in it. If not, answer from general knowledge.\n\n${contextBlock}`;
}

export function buildSystemPrompt(session: Session, contextBlock: string): string {
    return [
        instructions(),
        userContext(session),
        dateContext(),
        ragContext(contextBlock),
    ]
        .filter(Boolean)
        .join("\n\n");
}
