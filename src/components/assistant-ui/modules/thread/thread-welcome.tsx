import { type FC } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { SuggestionPrimitive, ThreadPrimitive } from "@assistant-ui/react";
import { Button } from "@/components/ui/button";

export const ThreadWelcome: FC = () => {
    const { data: session } = authClient.useSession();
    const firstName = session?.user?.name?.split(" ")[0];
    return (
        <div className="aui-thread-welcome-root my-auto flex grow flex-col">
            <div className="aui-thread-welcome-center flex w-full grow flex-col items-center justify-center">
                <div className="aui-thread-welcome-message flex size-full flex-col justify-center px-4">
                    <h1 className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both font-semibold text-2xl duration-200">
                        {firstName ? `Hello, ${firstName}!` : "Hello there!"}
                    </h1>
                    <p className="aui-thread-welcome-message-inner fade-in slide-in-from-bottom-1 animate-in fill-mode-both text-muted-foreground text-xl delay-75 duration-200">
                        How can I help you today?
                    </p>
                </div>
            </div>
            <ThreadSuggestions />
        </div>
    );
};

export const ThreadSuggestions: FC = () => {
    return (
        <div className="aui-thread-welcome-suggestions grid w-full @md:grid-cols-2 gap-2 pb-4">
            <ThreadPrimitive.Suggestions>
                {() => <ThreadSuggestionItem />}
            </ThreadPrimitive.Suggestions>
        </div>
    );
};

export const ThreadSuggestionItem: FC = () => {
    return (
        <div className="aui-thread-welcome-suggestion-display fade-in slide-in-from-bottom-2 @md:nth-[n+3]:block nth-[n+3]:hidden animate-in fill-mode-both duration-200">
            <SuggestionPrimitive.Trigger send asChild>
                <Button
                    variant="ghost"
                    className="aui-thread-welcome-suggestion h-auto w-full @md:flex-col flex-wrap items-start justify-start gap-1 rounded-3xl border border-border bg-background px-4 py-3 text-start text-sm transition-colors hover:bg-muted"
                >
                    <SuggestionPrimitive.Title className="aui-thread-welcome-suggestion-text-1 font-medium" />
                    <SuggestionPrimitive.Description className="aui-thread-welcome-suggestion-text-2 text-muted-foreground empty:hidden" />
                </Button>
            </SuggestionPrimitive.Trigger>
        </div>
    );
};