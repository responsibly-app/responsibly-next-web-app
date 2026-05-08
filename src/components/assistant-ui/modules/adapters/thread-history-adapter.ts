import {
    useAui,
    type ThreadHistoryAdapter,
} from "@assistant-ui/react";
import { useState } from "react";
import { orpc } from "@/lib/orpc/orpc-client";


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
