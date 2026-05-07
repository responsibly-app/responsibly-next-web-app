import {
    useRemoteThreadListRuntime,
    WebSpeechDictationAdapter,
} from "@assistant-ui/react";
import {
    AssistantChatTransport,
    useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { threadListAdapter, useHistoryAdapter } from "./adapters";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { useState } from "react";
import { SupabaseChatAttachmentAdapter } from "./attachment-adapter";

interface RuntimeProps {
    initialThreadId?: string;
}

export function useRuntime({ initialThreadId }: RuntimeProps) {
    return useRemoteThreadListRuntime({
        runtimeHook: function RuntimeHook() {
            const history = useHistoryAdapter();
            const [attachmentAdapter] = useState(() => new SupabaseChatAttachmentAdapter());

            return useChatRuntime({
                sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
                transport: new AssistantChatTransport({ api: "/api/chat" }),
                adapters: {
                    history,
                    attachments: attachmentAdapter,
                    dictation: new WebSpeechDictationAdapter({
                        language: "en-US",
                        continuous: true,
                        interimResults: false,
                    }),
                },
            });
        },
        adapter: threadListAdapter,
        threadId: initialThreadId,
    });
}