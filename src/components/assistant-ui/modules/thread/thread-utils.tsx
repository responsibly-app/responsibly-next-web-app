import { type FC } from "react";
import { ArrowDownIcon, LoaderIcon } from "lucide-react";
import {
    AuiIf,
    ThreadPrimitive
} from "@assistant-ui/react";
import { TooltipIconButton } from "../../tooltip-icon-button";

export const ThinkingIndicator: FC = () => {
    return (
        <AuiIf condition={(s) => s.thread.isRunning && s.message.content.length === 0}>
            <div className="flex items-center gap-2 text-muted-foreground">
                {/* <LoaderIcon className="size-4 animate-spin" /> */}
                <span className="text-sm shimmer">Thinking...</span>
            </div>
        </AuiIf>
    );
}

export const ThreadScrollToBottom: FC = () => {
    return (
        <ThreadPrimitive.ScrollToBottom asChild>
            <TooltipIconButton
                tooltip="Scroll to bottom"
                variant="outline"
                className="aui-thread-scroll-to-bottom absolute -top-12 z-10 self-center rounded-full p-4 disabled:invisible border-border bg-card/50 hover:bg-accent/80 backdrop-blur-[2px] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)]"
            >
                <ArrowDownIcon />
            </TooltipIconButton>
        </ThreadPrimitive.ScrollToBottom>
    );
};