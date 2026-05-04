"use client";

import { Thread } from "@/components/assistant-ui/thread";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  AssistantRuntimeProvider,
  Suggestions,
  Tools,
  useAui,
  useAuiState,
} from "@assistant-ui/react";
import { DevToolsModal } from "@assistant-ui/react-devtools";
import { useEffect, useRef, type ReactNode } from "react";
import { useRuntime } from "./runtime";
import { toolkit } from "./toolkit";
import { ThreadInitLoadingProvider } from "./thread-init-loading";

function ThreadUrlSync({ initialThreadId }: { initialThreadId?: string }) {
  const remoteId = useAuiState((s) => s.threadListItem.remoteId);
  const hasLoadedInitial = useRef(false);

  useEffect(() => {
    if (remoteId) hasLoadedInitial.current = true;

    // Don't clobber the URL while the initial thread is still loading for the first time
    if (!remoteId && initialThreadId && !hasLoadedInitial.current) return;

    const expected = remoteId ? `/chat/${remoteId}` : "/chat";
    if (window.location.pathname !== expected) {
      window.history.replaceState(null, "", expected);
    }
  }, [remoteId, initialThreadId]);

  return null;
}

interface AssistantProps {
  initialThreadId?: string;
}

export const Assistant = ({ initialThreadId }: AssistantProps = {}) => {
  const runtime = useRuntime({ initialThreadId });
    const aui = useAui({
      suggestions: Suggestions(["What's the weather?", "Tell me a joke"]),
      tools: Tools({ toolkit })
    });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <ThreadInitLoadingProvider initialThreadId={initialThreadId}>
        <ThreadUrlSync initialThreadId={initialThreadId} />
        <DevToolsModal />
        <SidebarProvider>
          <div className="flex h-dvh w-full pr-0.5">
            <ThreadListSidebar />
            <SidebarInset>
              <header className="bg-background/60 flex h-12 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-md">
                <SidebarTrigger />
              </header>
              <div className="flex-1 overflow-hidden">
                <Thread />
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
      </ThreadInitLoadingProvider>
    </AssistantRuntimeProvider>
  );
};
