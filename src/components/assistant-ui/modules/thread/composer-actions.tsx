import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import {
    AuiIf,
    ComposerPrimitive,
    useVoiceControls,
    useVoiceState,
} from "@assistant-ui/react";
import {
    ArrowUpIcon,
    SquareIcon, MicIcon, PhoneIcon, PhoneOffIcon, Square
} from "lucide-react";

export function ComposerVoiceToggle() {
    const voiceState = useVoiceState();
    const { connect, disconnect } = useVoiceControls();
    const isActive =
        voiceState?.status.type === "running" ||
        voiceState?.status.type === "starting";

    return (
        <AuiIf condition={(s) => s.thread.capabilities.voice}>
            <button
                type="button"
                onClick={() => (isActive ? disconnect() : connect())}
                aria-label={isActive ? "End voice" : "Start voice"}
            >
                {isActive ? <PhoneOffIcon className="size-5" /> : <PhoneIcon className="size-5" />}
            </button>
        </AuiIf>
    );
}

export function ComposerDictationToggle() {
    return (
        <div>
            {/* Dictation Button - Show when NOT dictating */}
            <ComposerPrimitive.If dictation={false}>
                <ComposerPrimitive.Dictate asChild>
                    <TooltipIconButton
                        tooltip="Voice input"
                        side="top"
                        variant="ghost"
                        className="aui-composer-dictate size-8 rounded-full p-1"
                        aria-label="Start voice input"
                    >
                        <MicIcon className="size-5" />
                    </TooltipIconButton>
                </ComposerPrimitive.Dictate>
            </ComposerPrimitive.If>

            {/* Stop Dictation Button - Show when dictating */}
            <ComposerPrimitive.If dictation>
                <ComposerPrimitive.StopDictation asChild>
                    <TooltipIconButton
                        tooltip="Stop dictation"
                        side="top"
                        variant="default"
                        className="aui-composer-stop-dictation size-8 rounded-full p-1"
                        aria-label="Stop voice input"
                    >
                        <Square className="size-4 animate-pulse fill-current" />
                    </TooltipIconButton>
                </ComposerPrimitive.StopDictation>
            </ComposerPrimitive.If>
        </div>
    );
}

export function ComposerSendMessageAction() {
    return (
        <div>
            <AuiIf condition={(s) => !s.thread.isRunning}>
                <ComposerPrimitive.Send asChild>
                    <TooltipIconButton
                        tooltip="Send message"
                        side="bottom"
                        type="button"
                        variant="default"
                        size="icon"
                        className="aui-composer-send size-8 rounded-full"
                        aria-label="Send message"
                    >
                        <ArrowUpIcon className="aui-composer-send-icon size-4" />
                    </TooltipIconButton>
                </ComposerPrimitive.Send>
            </AuiIf>
            <AuiIf condition={(s) => s.thread.isRunning}>
                <ComposerPrimitive.Cancel asChild>
                    <Button
                        type="button"
                        variant="default"
                        size="icon"
                        className="aui-composer-cancel size-8 rounded-full"
                        aria-label="Stop generating"
                    >
                        <SquareIcon className="aui-composer-cancel-icon size-3 fill-current" />
                    </Button>
                </ComposerPrimitive.Cancel>
            </AuiIf>
        </div>
    )
};