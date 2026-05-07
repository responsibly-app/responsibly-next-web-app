import {
    useAui,
    type RemoteThreadListAdapter,
    type ThreadHistoryAdapter,
} from "@assistant-ui/react";
import { createAssistantStream } from "assistant-stream";
import { useState } from "react";
import { orpc } from "@/lib/orpc/orpc-client";

export const THREAD_LIST_BATCH_SIZE = 20;

export const threadListPaginationState = {
    limit: THREAD_LIST_BATCH_SIZE,
    hasMore: false,
};

export const threadListAdapter: RemoteThreadListAdapter = {
    async list() {
        const fetchLimit = threadListPaginationState.limit + 1;
        const rows = await orpc.chat.listThreads({ limit: fetchLimit });
        threadListPaginationState.hasMore = rows.length > threadListPaginationState.limit;
        const visible = rows.slice(0, threadListPaginationState.limit);
        return {
            threads: visible.map((t) => ({
                status: t.status as "regular" | "archived",
                remoteId: t.id,
                title: t.title ?? undefined,
            })),
        };
    },

    async initialize(_threadId: string) {
        const { id } = await orpc.chat.createThread({});
        return { remoteId: id, externalId: undefined };
    },

    async rename(remoteId, title) {
        await orpc.chat.updateThread({ id: remoteId, title });
    },

    async archive(remoteId) {
        await orpc.chat.updateThread({ id: remoteId, status: "archived" });
    },

    async unarchive(remoteId) {
        await orpc.chat.updateThread({ id: remoteId, status: "regular" });
    },

    async delete(remoteId) {
        await orpc.chat.deleteThread({ id: remoteId });
    },

    async generateTitle(remoteId, messages) {
        return createAssistantStream(async (controller) => {
            const { title } = await orpc.chat.generateTitle({
                id: remoteId,
                messages: messages.map((m) => {
                    const attachments = (m as { attachments?: { content: { type: string; filename?: string }[] }[] }).attachments ?? [];
                    return {
                        role: m.role,
                        content: [
                            ...m.content.map((p) => {
                                const part = p as Record<string, unknown>;
                                return {
                                    type: part.type as string,
                                    ...(typeof part.text === "string" && { text: part.text }),
                                    ...(typeof part.filename === "string" && { filename: part.filename }),
                                };
                            }),
                            ...attachments.flatMap((a) =>
                                a.content.map((c) => ({
                                    type: c.type,
                                    ...(c.filename && { filename: c.filename }),
                                }))
                            ),
                        ],
                    };
                }),
            });
            controller.appendText(title);
        });
    },

    async fetch(remoteId) {
        const t = await orpc.chat.getThread({ id: remoteId });
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
                try {
                    const rows = await orpc.chat.listMessages({ threadId: remoteId });
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
                } catch {
                    return { messages: [] };
                }
            },
            async append(item) {
                const state = aui.threadListItem().getState();
                const remoteId =
                    state.remoteId ?? (await aui.threadListItem().initialize()).remoteId;
                await orpc.chat.addMessage({
                    threadId: remoteId,
                    id: fmt.getId(item.message),
                    parent_id: item.parentId,
                    format: fmt.format,
                    content: fmt.encode(item) as Record<string, unknown>,
                });
            },
        }),
    }));
    return adapter;
}
