import {
    useAui,
    type RemoteThreadListAdapter,
    type ThreadHistoryAdapter,
} from "@assistant-ui/react";
import { createAssistantStream } from "assistant-stream";
import { useEffect, useState } from "react";

export const threadListAdapter: RemoteThreadListAdapter = {
    async list() {
        const rows = (await fetch("/api/threads").then((r) => r.json())) as {
            id: string;
            title: string | null;
            status: string;
        }[];
        return {
            threads: rows.map((t) => ({
                status: t.status as "regular" | "archived",
                remoteId: t.id,
                title: t.title ?? undefined,
            })),
        };
    },

    async initialize(_threadId: string) {
        const { id } = (await fetch("/api/threads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        }).then((r) => r.json())) as { id: string };
        return { remoteId: id, externalId: undefined };
    },

    async rename(remoteId, title) {
        await fetch(`/api/threads/${remoteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        });
    },

    async archive(remoteId) {
        await fetch(`/api/threads/${remoteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "archived" }),
        });
    },

    async unarchive(remoteId) {
        await fetch(`/api/threads/${remoteId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "regular" }),
        });
    },

    async delete(remoteId) {
        await fetch(`/api/threads/${remoteId}`, { method: "DELETE" });
    },

    async generateTitle(remoteId, messages) {
        return createAssistantStream(async (controller) => {
            const res = await fetch(`/api/threads/${remoteId}/title`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages }),
            });
            if (res.ok) {
                const { title } = (await res.json()) as { title: string };
                controller.appendText(title);
            }
        });
    },

    async fetch(remoteId) {
        const t = (await fetch(`/api/threads/${remoteId}`).then((r) =>
            r.json(),
        )) as { id: string; title: string | null; status: string };
        return {
            status: t.status as "regular" | "archived",
            remoteId: t.id,
            title: t.title ?? undefined,
        };
    },
};

export function useHistoryAdapter(): ThreadHistoryAdapter {
    const aui = useAui();
    const [adapter] = useState<ThreadHistoryAdapter>(() => ({
        async load() {
            return { headId: null, messages: [] };
        },
        async append() { },
        withFormat: (fmt) => ({
            async load() {
                const remoteId = aui.threadListItem().getState().remoteId;
                if (!remoteId) return { messages: [] };
                const res = await fetch(`/api/threads/${remoteId}/messages`);
                if (!res.ok) return { messages: [] };
                const rows = (await res.json()) as {
                    id: string;
                    parent_id: string | null;
                    format: string;
                    content: Record<string, unknown>;
                }[];
                return {
                    messages: rows.map((row) =>
                        fmt.decode({
                            id: row.id,
                            parent_id: row.parent_id,
                            format: row.format,
                            content: row.content as never,
                        }),
                    ),
                };
            },
            async append(item) {
                const state = aui.threadListItem().getState();
                const remoteId =
                    state.remoteId ?? (await aui.threadListItem().initialize()).remoteId;
                const res = await fetch(`/api/threads/${remoteId}/messages`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: fmt.getId(item.message),
                        parent_id: item.parentId,
                        format: fmt.format,
                        content: fmt.encode(item),
                    }),
                });
                if (!res.ok) {
                    throw new Error(`Failed to save message: ${res.status}`);
                }
            },
        }),
    }));
    return adapter;
}