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

interface RuntimeProps {
    initialThreadId?: string;
}

export function useRuntime({ initialThreadId }: RuntimeProps) {
    return useRemoteThreadListRuntime({
        runtimeHook: function RuntimeHook() {
            const history = useHistoryAdapter();

            return useChatRuntime({
                sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
                transport: new AssistantChatTransport({ api: "/api/chat" }),
                adapters: {
                    history,
                    dictation: new WebSpeechDictationAdapter({
                        language: "en-US",
                        continuous: true,
                        interimResults: false,
                    }),
                    // voice: "voice",

                },
            });
        },
        adapter: threadListAdapter,
        threadId: initialThreadId,
    });
}