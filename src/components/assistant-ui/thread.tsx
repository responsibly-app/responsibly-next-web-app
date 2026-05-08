import {
  ComposerAddAttachment,
  ComposerAttachments,
  UserMessageAttachments,
} from "@/components/assistant-ui/attachment";
import { MarkdownText } from "@/components/assistant-ui/markdown-text";
import {
  Reasoning,
  ReasoningContent,
  ReasoningRoot,
  ReasoningText,
  ReasoningTrigger,
} from "@/components/assistant-ui/reasoning";
import {
  ToolGroupContent,
  ToolGroupRoot,
  ToolGroupTrigger,
} from "@/components/assistant-ui/tool-group";
import { ToolFallback } from "@/components/assistant-ui/tool-fallback";
import { RAGSources, type RAGSourceItem } from "@/components/assistant-ui/sources";
import { ContextDisplay } from "@/components/assistant-ui/context-display";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ActionBarPrimitive,
  AuiIf,
  BranchPickerPrimitive,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
} from "@assistant-ui/react";
import { useThreadInitLoading } from "~/src/components/assistant-ui/modules/hooks/thread-init-loading";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
} from "lucide-react";
import { type FC, type ReactNode, Component, useCallback } from "react";
import { isFileTypeAccepted } from "@/components/assistant-ui/modules/adapters/attachment-adapter";
import { toast } from "sonner";
import { ComposerQuotePreview, QuoteBlock, SelectionToolbar } from "@/components/assistant-ui/quote";
import { ComposerDictationToggle, ComposerSendMessageAction, ComposerVoiceToggle } from "./modules/thread/composer-actions";
import { ThreadLoadingSkeleton } from "./modules/thread/thread-loading";
import { ThreadWelcome } from "./modules/thread/thread-welcome";
import { ThinkingIndicator, ThreadScrollToBottom } from "./modules/thread/thread-utils";
import { AssistantCopy, AssistantMore, AssistantReload, AssistantSpeakToggle } from "./modules/thread/assistant-actions";

const ENABLE_QUOTE_CONTEXT = false; // set to false to disable quote context injection and rendering
const MODEL_CONTEXT_WINDOW = 400_000; // 400k tokens ~= 300 pages of text

export const Thread: FC = () => {
  return (
    <ThreadPrimitive.Root
      className="aui-root aui-thread-root @container flex h-full flex-col bg-background text-md"
      style={{
        ["--thread-max-width" as string]: "50rem",
        ["--composer-radius" as string]: "24px",
        ["--composer-padding" as string]: "10px",
      }}
    >
      <ThreadPrimitive.Viewport
        turnAnchor="top"
        autoScroll={true}
        scrollToBottomOnRunStart={true}
        scrollToBottomOnInitialize={true}
        scrollToBottomOnThreadSwitch={true}
        // topAnchorMessageClamp={{ tallerThan: "10em", visibleHeight: "6em" }}
        data-slot="aui_thread-viewport"
        className="relative flex flex-1 flex-col overflow-x-auto overflow-y-scroll scroll-smooth"
      >
        <div className="mx-auto flex w-full max-w-(--thread-max-width) flex-1 flex-col px-4 pt-4">
          <AuiIf condition={(s) => s.thread.isEmpty}>
            <ThreadEmptyContent />
          </AuiIf>

          <div
            data-slot="aui_message-group"
            className="mb-10 flex flex-col gap-y-8 empty:hidden"
          >
            <ThreadPrimitive.Messages>
              {() => <ThreadMessage />}
            </ThreadPrimitive.Messages>
          </div>

          <ThreadPrimitive.ViewportFooter className="aui-thread-viewport-footer sticky bottom-0 mt-auto flex flex-col gap-4 overflow-visible rounded-t-(--composer-radius) bg-background/70 pb-4 md:pb-6">
            <ThreadScrollToBottom />
            <Composer />
          </ThreadPrimitive.ViewportFooter>
        </div>
      </ThreadPrimitive.Viewport>
      {ENABLE_QUOTE_CONTEXT && <SelectionToolbar />}
    </ThreadPrimitive.Root>
  );
};

const ThreadMessage: FC = () => {
  const role = useAuiState((s) => s.message.role);
  const isEditing = useAuiState((s) => s.message.composer.isEditing);

  if (isEditing) return <EditComposer />;
  if (role === "user") return <UserMessage />;
  return <AssistantMessage />;
};

const ThreadEmptyContent: FC = () => {
  const isLoading = useThreadInitLoading();
  if (isLoading) return <ThreadLoadingSkeleton />;
  return <ThreadWelcome />;
};

const Composer: FC = () => {
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData?.files ?? []);
    if (files.length === 0) return;
    const invalid = files.filter((f) => !isFileTypeAccepted(f.type));
    if (invalid.length === 0) return;
    toast.error("File format not supported", {
      description: "Supported formats: JPEG, PNG, GIF, WebP, PDF, TXT, Markdown, CSV.",
    });
    if (invalid.length === files.length) e.preventDefault();
  }, []);

  return (
    <ComposerPrimitive.Root className="aui-composer-root relative flex w-full flex-col">
      {ENABLE_QUOTE_CONTEXT && <ComposerQuotePreview />}
      <ComposerPrimitive.AttachmentDropzone asChild>
        <div
          data-slot="aui_composer-shell"
          className="flex w-full flex-col gap-2 rounded-(--composer-radius) border border-ring/50 bg-card/50 backdrop-blur-sm p-(--composer-padding) transition-shadow focus-within:border-ring/75 focus-within:ring-1 focus-within:ring-ring/20 data-[dragging=true]:border-ring data-[dragging=true]:border-dashed data-[dragging=true]:bg-accent/50"
        >
          <ComposerAttachments />
          <ComposerPrimitive.Input
            placeholder="Send a message..."
            className="aui-composer-input max-h-50 min-h-10 w-full resize-none bg-transparent px-1.75 py-1 text-sm outline-none placeholder:text-muted-foreground/80"
            rows={1}
            autoFocus
            aria-label="Message input"
            onPaste={handlePaste}
          />
          <ComposerAction />
        </div>
      </ComposerPrimitive.AttachmentDropzone>
    </ComposerPrimitive.Root>
  );
};

const ComposerAction: FC = () => {
  return (
    <div className="aui-composer-action-wrapper relative flex items-center justify-between">
      <div className="flex items-center gap-1">
        <ComposerAddAttachment />
        <ComposerDictationToggle />
        <ContextDisplay.Ring modelContextWindow={MODEL_CONTEXT_WINDOW} side="top" />
        <ContextDisplay.Text modelContextWindow={MODEL_CONTEXT_WINDOW} side="top" />
        <ComposerVoiceToggle />
      </div>

      <ComposerSendMessageAction />
    </div>
  );
};

export function AssistantActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-assistant-action-bar-root col-start-3 row-start-2 -ms-1 flex gap-1 text-muted-foreground"
    >
      <AssistantCopy />
      <AssistantReload />
      <AssistantSpeakToggle />
      <AssistantMore />
    </ActionBarPrimitive.Root>
  );
}

export function UserActionBar() {
  return (
    <ActionBarPrimitive.Root
      hideWhenRunning
      autohide="not-last"
      className="aui-user-action-bar-root flex flex-col items-end"
    >
      <ActionBarPrimitive.Edit asChild>
        <TooltipIconButton tooltip="Edit" className="aui-user-action-edit p-4">
          <PencilIcon />
        </TooltipIconButton>
      </ActionBarPrimitive.Edit>
    </ActionBarPrimitive.Root>
  );
}

const MessageError: FC = () => {
  return (
    <MessagePrimitive.Error>
      <ErrorPrimitive.Root className="aui-message-error-root mt-2 rounded-md border border-destructive bg-destructive/10 p-3 text-destructive text-sm dark:bg-destructive/5 dark:text-red-200">
        <ErrorPrimitive.Message className="aui-message-error-message line-clamp-2" />
      </ErrorPrimitive.Root>
    </MessagePrimitive.Error>
  );
};

class MessagePartErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Transient tapClientLookup out-of-bounds during thread reload — retry after state settles
    setTimeout(() => this.setState({ hasError: false }), 0);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

const AssistantMessageSources: FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sources = useAuiState((s) => (s.message as any).metadata?.custom?.sources as RAGSourceItem[] | undefined);
  if (!sources?.length) return null;
  return <RAGSources sources={sources} />;
};

const AssistantMessage: FC = () => {
  // reserves space for action bar and compensates with `-mb` for consistent msg spacing
  // keeps hovered action bar from shifting layout (autohide doesn't support absolute positioning well)
  // for pt-[n] use -mb-[n + 6] & min-h-[n + 6] to preserve compensation
  const ACTION_BAR_PT = "pt-1.5";
  const ACTION_BAR_HEIGHT = `-mb-7.5 min-h-7.5 ${ACTION_BAR_PT}`;

  return (
    <MessagePrimitive.Root
      data-slot="aui_assistant-message-root"
      data-role="assistant"
      className="fade-in slide-in-from-bottom-1 relative animate-in duration-150"
    >
      <div
        data-slot="aui_assistant-message-content"
        className="wrap-break-word px-2 text-foreground leading-relaxed"
      >
        <MessagePartErrorBoundary>
          {ENABLE_QUOTE_CONTEXT && (
            <MessagePrimitive.Quote>
              {(quote) => <QuoteBlock {...quote} />}
            </MessagePrimitive.Quote>
          )}
          <MessagePrimitive.GroupedParts
            groupBy={(part) => {
              if (part.type === "reasoning")
                return ["group-chainOfThought", "group-reasoning"];
              if (part.type === "tool-call")
                return ["group-chainOfThought", "group-tool"];
              return null;
            }}
          >
            {({ part, children }) => {
              switch (part.type) {
                case "group-chainOfThought":
                  return <div data-slot="aui_chain-of-thought">{children}</div>;
                case "group-reasoning": {
                  const running = part.status.type === "running";
                  return (
                    <ReasoningRoot defaultOpen={running}>
                      <ReasoningTrigger active={running} />
                      <ReasoningContent aria-busy={running}>
                        <ReasoningText>{children}</ReasoningText>
                      </ReasoningContent>
                    </ReasoningRoot>
                  );
                }
                case "group-tool":
                  return (
                    <ToolGroupRoot defaultOpen={true} variant="outline" className="my-3">
                      <ToolGroupTrigger
                        count={part.indices.length}
                        active={part.status.type === "running"}
                      />
                      <ToolGroupContent>{children}</ToolGroupContent>
                    </ToolGroupRoot>
                  );
                case "text":
                  return <MarkdownText />;
                case "reasoning":
                  return <Reasoning {...part} />;
                case "tool-call":
                  return part.toolUI ?? <ToolFallback {...part} />;
                default:
                  return null;
              }
            }}
          </MessagePrimitive.GroupedParts>
        </MessagePartErrorBoundary>
        <AssistantMessageSources />
        <MessageError />
        <ThinkingIndicator />
      </div>

      <div
        data-slot="aui_assistant-message-footer"
        className={cn("ms-2 flex items-center", ACTION_BAR_HEIGHT)}
      >
        <BranchPicker />
        <AssistantActionBar />
      </div>
    </MessagePrimitive.Root>
  );
};

const UserMessage: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_user-message-root"
      className="fade-in slide-in-from-bottom-1 grid animate-in auto-rows-auto grid-cols-[minmax(72px,1fr)_auto] content-start gap-y-2 px-2 duration-150 [&:where(>*)]:col-start-2"
      data-role="user"
    >
      <UserMessageAttachments />

      <div className="aui-user-message-content-wrapper relative col-start-2 min-w-0">
        <div className="aui-user-message-content wrap-break-word peer rounded-2xl bg-muted px-4 py-2.5 text-foreground empty:hidden">
          <MessagePrimitive.Parts />
        </div>
        <div className="aui-user-action-bar-wrapper absolute inset-s-0 top-1/2 -translate-x-full -translate-y-1/2 pe-2 peer-empty:hidden rtl:translate-x-full">
          <UserActionBar />
        </div>
      </div>

      <BranchPicker
        data-slot="aui_user-branch-picker"
        className="col-span-full col-start-1 row-start-3 -me-1 justify-end"
      />
    </MessagePrimitive.Root>
  );
};


const EditComposer: FC = () => {
  return (
    <MessagePrimitive.Root
      data-slot="aui_edit-composer-wrapper"
      className="flex flex-col px-2"
    >
      <ComposerPrimitive.Root className="aui-edit-composer-root ms-auto flex w-full max-w-[85%] flex-col rounded-2xl bg-muted">
        <ComposerPrimitive.Input
          className="aui-edit-composer-input min-h-14 w-full resize-none bg-transparent p-4 text-foreground text-sm outline-none"
          autoFocus
        />
        <div className="aui-edit-composer-footer mx-3 mb-3 flex items-center gap-2 self-end">
          <ComposerPrimitive.Cancel asChild>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
          </ComposerPrimitive.Cancel>
          <ComposerPrimitive.Send asChild>
            <Button size="sm">Update</Button>
          </ComposerPrimitive.Send>
        </div>
      </ComposerPrimitive.Root>
    </MessagePrimitive.Root>
  );
};

const BranchPicker: FC<BranchPickerPrimitive.Root.Props> = ({
  className,
  ...rest
}) => {
  return (
    <BranchPickerPrimitive.Root
      hideWhenSingleBranch
      className={cn(
        "aui-branch-picker-root -ms-2 me-2 inline-flex items-center text-muted-foreground text-xs",
        className,
      )}
      {...rest}
    >
      <BranchPickerPrimitive.Previous asChild>
        <TooltipIconButton tooltip="Previous">
          <ChevronLeftIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Previous>
      <span className="aui-branch-picker-state font-medium">
        <BranchPickerPrimitive.Number /> / <BranchPickerPrimitive.Count />
      </span>
      <BranchPickerPrimitive.Next asChild>
        <TooltipIconButton tooltip="Next">
          <ChevronRightIcon />
        </TooltipIconButton>
      </BranchPickerPrimitive.Next>
    </BranchPickerPrimitive.Root>
  );
};
