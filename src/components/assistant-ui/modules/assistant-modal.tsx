"use client";

import { BotIcon, ChevronDownIcon, SquarePenIcon, XIcon } from "lucide-react";

import {
  AssistantModalPrimitive,
  AssistantRuntimeProvider,
  Suggestions,
  ThreadListPrimitive,
  Tools,
  useAui,
} from "@assistant-ui/react";
import { type FC, forwardRef } from "react";

import { Thread } from "@/components/assistant-ui/thread";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { useRuntime } from "./runtime";
import { toolkit } from "./toolkit";

export const AssistantModal: FC = () => {
  const runtime = useRuntime({});
  const aui = useAui({
    suggestions: Suggestions(["What's the weather?", "Tell me a joke"]),
    tools: Tools({ toolkit })
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <AssistantModalPrimitive.Root>
        <AssistantModalPrimitive.Anchor className="aui-root aui-modal-anchor fixed right-4 bottom-4 size-11">
          <AssistantModalPrimitive.Trigger asChild>
            <AssistantModalButton />
          </AssistantModalPrimitive.Trigger>
        </AssistantModalPrimitive.Anchor>
        <AssistantModalPrimitive.Content
          sideOffset={10}
          className="aui-root aui-modal-content data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-1/2 data-[state=closed]:slide-out-to-right-1/2 data-[state=closed]:zoom-out data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-1/2 data-[state=open]:slide-in-from-right-1/2 data-[state=open]:zoom-in bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=open]:animate-in z-50 h-dvh w-dvw sm:h-150 sm:w-100 overflow-clip overscroll-contain sm:rounded-4xl sm:border p-0 sm:shadow-md outline-none max-sm:!inset-0 max-sm:![transform:none] [&_.aui-thread-root]:bg-inherit [&_.aui-thread-root_.aui-thread-viewport-footer]:bg-inherit"
        >
          <div className="flex h-full flex-col">
            <ModalHeader />
            <div className="flex-1 overflow-hidden">
              <Thread />
            </div>
          </div>
        </AssistantModalPrimitive.Content>
      </AssistantModalPrimitive.Root>
    </AssistantRuntimeProvider>
  );
};

function ModalHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-3">
      <ThreadListPrimitive.New asChild>
        <TooltipIconButton tooltip="New Chat" variant="ghost">
          <SquarePenIcon />
        </TooltipIconButton>
      </ThreadListPrimitive.New>
      <AssistantModalPrimitive.Trigger asChild>
        <TooltipIconButton tooltip="Close" variant="ghost">
          <XIcon />
        </TooltipIconButton>
      </AssistantModalPrimitive.Trigger>
    </header>
  );
}

type AssistantModalButtonProps = { "data-state"?: "open" | "closed" };

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
