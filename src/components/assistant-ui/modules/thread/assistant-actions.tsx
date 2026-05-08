import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import {
    ActionBarMorePrimitive,
    ActionBarPrimitive,
    AuiIf,
    MessagePrimitive,
    useAuiState,
} from "@assistant-ui/react";
import {
    CheckIcon,
    CopyIcon,
    DownloadIcon,
    MoreHorizontalIcon,
    RefreshCwIcon,
    SquareIcon,
    Volume2Icon,
} from "lucide-react";

export function AssistantSpeakToggle() {
    return (
        <>
            <MessagePrimitive.If speaking={false}>
                <ActionBarPrimitive.Speak asChild>
                    <TooltipIconButton tooltip="Read aloud">
                        <Volume2Icon />
                    </TooltipIconButton>
                </ActionBarPrimitive.Speak>
            </MessagePrimitive.If>
            <MessagePrimitive.If speaking>
                <ActionBarPrimitive.StopSpeaking asChild>
                    <TooltipIconButton tooltip="Stop">
                        <SquareIcon className="size-3 fill-current" />
                    </TooltipIconButton>
                </ActionBarPrimitive.StopSpeaking>
            </MessagePrimitive.If>
        </>
    );
}

export function AssistantCopy() {
    return (
        <ActionBarPrimitive.Copy asChild>
            <TooltipIconButton tooltip="Copy">
                <AuiIf condition={(s) => s.message.isCopied}>
                    <CheckIcon />
                </AuiIf>
                <AuiIf condition={(s) => !s.message.isCopied}>
                    <CopyIcon />
                </AuiIf>
            </TooltipIconButton>
        </ActionBarPrimitive.Copy>
    );
}

export function AssistantReload() {
    return (
        <ActionBarPrimitive.Reload asChild>
            <TooltipIconButton tooltip="Refresh">
                <RefreshCwIcon />
            </TooltipIconButton>
        </ActionBarPrimitive.Reload>
    );
}

function MessageDate() {
    const createdAt = useAuiState((s) => s.message.createdAt);
    if (!createdAt) return null;
    const formatted = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }).format(createdAt);
    return (
        <div className="px-2 py-1.5 text-xs text-muted-foreground select-text">
            {formatted}
        </div>
    );
}

export function AssistantMore() {
    return (
        <ActionBarMorePrimitive.Root>
            <ActionBarMorePrimitive.Trigger asChild>
                <TooltipIconButton
                    tooltip="More"
                    className="data-[state=open]:bg-accent"
                >
                    <MoreHorizontalIcon />
                </TooltipIconButton>
            </ActionBarMorePrimitive.Trigger>
            <ActionBarMorePrimitive.Content
                side="bottom"
                align="start"
                className="aui-action-bar-more-content z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            >
                <MessageDate />
                <ActionBarPrimitive.ExportMarkdown asChild>
                    <ActionBarMorePrimitive.Item className="aui-action-bar-more-item flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                        <DownloadIcon className="size-4" />
                        Export as Markdown
                    </ActionBarMorePrimitive.Item>
                </ActionBarPrimitive.ExportMarkdown>
            </ActionBarMorePrimitive.Content>
        </ActionBarMorePrimitive.Root>
    );
}
