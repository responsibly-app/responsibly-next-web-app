# Response: tapClientLookup race repro details

Thanks for the thorough setup and the willingness to dig into this. Here's everything I can share.

---

## Stack overview

- Next.js App Router — `app/(chat-aui)/chat/[id]/page.tsx` is a **server component** that reads `params.id`, verifies ownership against Drizzle/Postgres, then renders `<Assistant initialThreadId={id} />`.
- `useRemoteThreadListRuntime` with a `runtimeHook` pattern — a new `useChatRuntime` is created inside the hook.
- `ThreadHistoryAdapter` reads `remoteId` at load time via `useAui()` — details below.
- Transport: OpenAI-compatible endpoint at `/api/chat` via `AssistantChatTransport`.
- `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls` is set, so tool-call chains auto-continue.

---

## AssistantMessage component (verbatim)

```tsx
// thread.tsx

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
  const sources = useAuiState(
    (s) => (s.message as any).metadata?.custom?.sources as RAGSourceItem[] | undefined
  );
  if (!sources?.length) return null;
  return <RAGSources sources={sources} />;
};

const AssistantMessage: FC = () => {
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
                    <ToolGroupRoot defaultOpen={true} variant="outline" className="mb-5">
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
```

**`ThinkingIndicator`** (in `modules/thread/thread-utils.tsx`):

```tsx
export const ThinkingIndicator: FC = () => {
  return (
    <AuiIf condition={(s) => s.thread.isRunning && s.message.content.length === 0}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <LoaderIcon className="size-4 animate-spin" />
        <span className="text-sm">Thinking...</span>
      </div>
    </AuiIf>
  );
};
```

**`AssistantCopy` / `AssistantMore`** (in `modules/thread/assistant-actions.tsx`):

```tsx
export function AssistantCopy() {
  return (
    <ActionBarPrimitive.Copy asChild>
      <TooltipIconButton tooltip="Copy">
        <AuiIf condition={(s) => s.message.isCopied}><CheckIcon /></AuiIf>
        <AuiIf condition={(s) => !s.message.isCopied}><CopyIcon /></AuiIf>
      </TooltipIconButton>
    </ActionBarPrimitive.Copy>
  );
}

function MessageDate() {
  const createdAt = useAuiState((s) => s.message.createdAt);
  // ...formatted date display
}

export function AssistantMore() {
  return (
    <ActionBarMorePrimitive.Root>
      {/* ... trigger ... */}
      <ActionBarMorePrimitive.Content>
        <MessageDate />
        <ActionBarPrimitive.ExportMarkdown asChild>
          {/* ... */}
        </ActionBarPrimitive.ExportMarkdown>
      </ActionBarMorePrimitive.Content>
    </ActionBarMorePrimitive.Root>
  );
}
```

**`AssistantSpeakToggle`**:

```tsx
export function AssistantSpeakToggle() {
  return (
    <>
      <MessagePrimitive.If speaking={false}>
        <ActionBarPrimitive.Speak asChild>...</ActionBarPrimitive.Speak>
      </MessagePrimitive.If>
      <MessagePrimitive.If speaking>
        <ActionBarPrimitive.StopSpeaking asChild>...</ActionBarPrimitive.StopSpeaking>
      </MessagePrimitive.If>
    </>
  );
}
```

---

## ThreadHistoryAdapter (verbatim)

Backed by Drizzle/Postgres via an oRPC client. The critical detail is that `aui` is captured once via `useAui()` at hook init, and the adapter itself is memoised with `useState`. The `remoteId` is read from `aui.threadListItem().getState()` **at load time**, not reactively.

```ts
// modules/adapters/thread-history-adapter.ts

import { useAui, type ThreadHistoryAdapter } from "@assistant-ui/react";
import { useState } from "react";
import { orpc } from "@/lib/orpc/orpc-client";

export function useHistoryAdapter(): ThreadHistoryAdapter {
  const aui = useAui();
  const [adapter] = useState<ThreadHistoryAdapter>(() => ({
    async load() {
      return { headId: null, messages: [] };
    },
    async append() {},
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
```

**Why I think this is relevant:** The adapter is closed over `aui` from the initial render, but `withFormat().load()` reads `aui.threadListItem().getState().remoteId` asynchronously — after `await orpc.chat.listMessages(...)` resolves. During a thread switch, if the runtime has already advanced `remoteId` to the new thread but the old `GroupedParts` tree is still mounted (because React hasn't unmounted it yet), those child components run selectors against a message store that has been reset or replaced. That seems like exactly the timing window where `tapClientLookup: Index N out of bounds` fires.

---

## All `useAuiState` subscribers in my tree

This is more than your synthetic setup likely had. Per render cycle, for a thread with `N` assistant messages, these are active simultaneously:

| Location | Selector |
|---|---|
| `ThreadUrlSync` | `s.threadListItem.remoteId` |
| `ThreadInitLoadingProvider` | `s.threadListItem.remoteId` (second simultaneous subscriber to same field) |
| `useInvalidateUsageOnRunEnd` (in `UsageDisplay`, mounted in header) | `s.thread.isRunning` |
| `ThreadMessage` × N | `s.message.role`, `s.message.composer.isEditing` |
| `AssistantMessageSources` × (assistant N) | `s.message.metadata?.custom?.sources` |
| `ThinkingIndicator` via `AuiIf` × (assistant N) | `s.thread.isRunning && s.message.content.length === 0` |
| `AssistantCopy` via two `AuiIf` × (assistant N) | `s.message.isCopied` (×2) |
| `MessageDate` (inside `AssistantMore`) × (assistant N) | `s.message.createdAt` |
| `MessagePrimitive.If speaking` × 2 × (assistant N) | `s.message.speaking` |

On a thread with 4 assistant messages that's roughly **30–40 active subscriptions** before counting internals of `ActionBarPrimitive`, `BranchPickerPrimitive`, etc. Your synthetic setup using a single `MessagePrimitive.GroupedParts` block likely had far fewer.

The two concurrent `s.threadListItem.remoteId` subscribers (`ThreadUrlSync` + `ThreadInitLoadingProvider`) are probably worth noting specifically — they update in the same commit but may schedule separate React re-render passes, giving the message-part tree a brief window where the list has advanced but the message store hasn't.

---

## Message shape from DB (approximate JSON)

I don't have a saved snapshot from when the error fired, but the rows coming out of Drizzle have this shape before `fmt.decode`:

```json
{
  "id": "msg_01AbC...",
  "parent_id": "msg_00ZyX...",
  "format": "aui-react-19",
  "content": {
    "role": "assistant",
    "content": [
      { "type": "text", "text": "Let me check the weather." },
      {
        "type": "tool-call",
        "toolCallId": "call_abc123",
        "toolName": "get_current_weather",
        "args": { "location": "London" }
      }
    ],
    "status": { "type": "complete", "reason": "tool-calls" }
  }
}
```

The thread that reliably reproduced the error had at least one assistant message with a `tool-call` part followed by a second assistant message (the auto-continued response after tool result). The `GroupedParts` tree for that thread has a `group-tool` group wrapping the tool call, and a separate text node — two groups in one message. I believe the index mismatch happens specifically when a message has both groups.

---

## Click sequence that makes it more likely to fire

The error consistently appears on **cold reload of `/chat/[id]`** for a thread containing tool-call messages. The exact sequence:

1. Open `/chat/[id]` directly (browser hard-reload or direct navigation, not a client-side push).
2. The server page resolves, `<Assistant initialThreadId={id} />` renders, the thread list sidebar starts its `list()` fetch simultaneously with the history `load()`.
3. While the sidebar list is still loading (threads haven't appeared yet), the history resolves first — messages render with `GroupedParts`.
4. The sidebar list then resolves, causing a `remoteId` state update that triggers `ThreadUrlSync` and `ThreadInitLoadingProvider` to re-render.
5. At that point, `tapClientLookup` throws for at least one message part.

An even more reliable trigger: while step 3–4 above is happening, **click any other thread in the sidebar** the moment the sidebar list finishes populating. The combination of list resolution + immediate thread switch produces the error on essentially every attempt for threads with tool calls.

The error does **not** reproduce when navigating client-side from `/chat` to `/chat/[id]` without a reload (the runtime has already warmed up).

---

## Sidebar instability (separate issue, as you suggested)

Opening a new issue for that — the behavior is: on a hard reload of `/chat/[id]`, threads briefly appear in the sidebar, then disappear for ~300–500ms, then reappear when the fetch settles. Will include repro steps there.

---

