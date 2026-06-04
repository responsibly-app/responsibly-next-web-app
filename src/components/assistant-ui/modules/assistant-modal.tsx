"use client";

import { BotIcon, ChevronDownIcon, MessagesSquareIcon, SquarePenIcon, XIcon } from "lucide-react";
import {
  AssistantRuntimeProvider,
  Suggestions,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  Tools,
  useAui,
} from "@assistant-ui/react";
import { type FC, forwardRef, useEffect, useRef, useState } from "react";

import { Thread } from "@/components/assistant-ui/thread";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { useRuntime } from "./runtime";
import { toolkit } from "./toolkit";
import { cn } from "@/lib/utils";

export const AssistantModal: FC = () => {
  const runtime = useRuntime({});
  const aui = useAui({
    suggestions: Suggestions(["What's the weather?", "Tell me a joke"]),
    tools: Tools({ toolkit }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime} aui={aui}>
      <AssistantModalImpl />
    </AssistantRuntimeProvider>
  );
};

function AssistantModalImpl() {
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const aui = useAui();
  // Prevent FAB onClick from re-opening after the panel closes via outside click
  const skipNextToggle = useRef(false);

  useEffect(() => {
    return aui.on("thread.runStart", () => setOpen(true));
  }, [aui]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <>
      {/* FAB trigger button — always visible, fixed bottom-right */}
      <div className="aui-root aui-modal-anchor fixed right-4 bottom-4 z-50 size-11">
        <AssistantModalButton
          data-state={open ? "open" : "closed"}
          onClick={() => {
            if (skipNextToggle.current) {
              skipNextToggle.current = false;
              return;
            }
            setOpen((o) => !o);
          }}
        />
      </div>

      {/* Mobile backdrop — sits below the panel, closes nothing (full-screen on mobile) */}
      <div
        className={cn(
          "fixed inset-0 z-40 sm:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Chat panel — always mounted to avoid Thread remount, shown/hidden via CSS */}
      <div
        className={cn(
          "aui-root fixed z-50 flex flex-col overflow-hidden bg-popover text-popover-foreground outline-none",
          "inset-0 transition-[opacity,transform] duration-100 ease-[cubic-bezier(0.32,0.72,0,1)]",
          "sm:inset-auto sm:right-4 sm:bottom-17.5 sm:h-150 sm:w-100 sm:rounded-4xl sm:border-2 sm:border-input sm:shadow-md",
          "[&_.aui-thread-root]:bg-inherit [&_.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit",
          open
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-full sm:translate-y-0",
        )}
        role="dialog"
        aria-label="AI Assistant"
        aria-hidden={!open}
      >
        <span className="sr-only">AI Assistant</span>

        <ModalHeader
          historyOpen={historyOpen}
          onToggleHistory={() => setHistoryOpen((h) => !h)}
          onClose={() => setOpen(false)}
        />

        <div className="relative flex-1 overflow-hidden">
          {/* Backdrop — closes thread list when clicking the thread area */}
          {historyOpen && (
            <div
              className="absolute inset-0 z-29"
              onClick={() => setHistoryOpen(false)}
            />
          )}

          {/* Thread list overlay — slides in from the left */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 z-30 w-52 overflow-y-auto border-r bg-popover shadow-md transition-transform duration-200 ease-in-out",
              historyOpen ? "translate-x-0" : "-translate-x-full",
            )}
          >
            <ModalThreadList onSelect={() => setHistoryOpen(false)} />
          </div>

          {/* Thread content — always full width */}
          <div className="h-full overflow-hidden">
            <Thread />
          </div>
        </div>
      </div>
    </>
  );
}

function ModalHeader({
  historyOpen,
  onToggleHistory,
  onClose,
}: {
  historyOpen: boolean;
  onToggleHistory: () => void;
  onClose: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-3">
      <div className="flex items-center gap-0.5">
        <TooltipIconButton
          tooltip={historyOpen ? "Hide threads" : "Show threads"}
          variant="ghost"
          onClick={onToggleHistory}
          className={cn(historyOpen && "bg-accent text-accent-foreground")}
        >
          <MessagesSquareIcon />
        </TooltipIconButton>
        <ThreadListPrimitive.New asChild>
          <TooltipIconButton tooltip="New Chat" variant="ghost">
            <SquarePenIcon />
          </TooltipIconButton>
        </ThreadListPrimitive.New>
      </div>
      <TooltipIconButton tooltip="Close" variant="ghost" onClick={onClose}>
        <XIcon />
      </TooltipIconButton>
    </header>
  );
}

function ModalThreadList({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex h-full flex-col overflow-y-auto py-2">
      <p className="px-3 pb-1 pt-2 text-xs font-medium text-muted-foreground">Threads</p>
      <ThreadListPrimitive.Root className="flex flex-col gap-0.5 px-2">
        <ThreadListPrimitive.Items>
          {() => (
            <ThreadListItemPrimitive.Root className="group flex h-9 items-center rounded-lg transition-colors hover:bg-accent focus-visible:outline-none data-active:bg-accent">
              <ThreadListItemPrimitive.Trigger
                className="flex h-full min-w-0 flex-1 items-center px-3 text-start text-sm"
                onClick={onSelect}
              >
                <span className="min-w-0 flex-1 truncate">
                  <ThreadListItemPrimitive.Title fallback="New Chat" />
                </span>
              </ThreadListItemPrimitive.Trigger>
            </ThreadListItemPrimitive.Root>
          )}
        </ThreadListPrimitive.Items>
      </ThreadListPrimitive.Root>
    </div>
  );
}

type AssistantModalButtonProps = {
  "data-state"?: "open" | "closed";
  onClick?: () => void;
};

const AssistantModalButton = forwardRef<
  HTMLButtonElement,
  AssistantModalButtonProps
>(({ "data-state": state, ...rest }, ref) => {
  const tooltip = state === "open" ? "Close Assistant" : "Open Assistant";

  return (
    <TooltipIconButton
      variant="default"
      tooltip={tooltip}
      side="left"
      {...rest}
      className="aui-modal-button size-full rounded-full shadow transition-transform hover:scale-110 active:scale-90"
      ref={ref}
    >
      <BotIcon
        data-state={state}
        className="aui-modal-button-closed-icon absolute size-6 transition-all data-[state=closed]:scale-100 data-[state=closed]:rotate-0 data-[state=open]:scale-0 data-[state=open]:rotate-90"
      />
      <ChevronDownIcon
        data-state={state}
        className="aui-modal-button-open-icon absolute size-6 transition-all data-[state=closed]:scale-0 data-[state=closed]:-rotate-90 data-[state=open]:scale-100 data-[state=open]:rotate-0"
      />
      <span className="aui-sr-only sr-only">{tooltip}</span>
    </TooltipIconButton>
  );
});

AssistantModalButton.displayName = "AssistantModalButton";
