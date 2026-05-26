import { ComposerTriggerPopover } from "@/components/assistant-ui/modules/popovers/composer-trigger-popover";
import { unstable_useMentionAdapter } from "@assistant-ui/react";
import { unstable_defaultDirectiveFormatter } from "@assistant-ui/core";
import { WrenchIcon } from "lucide-react";

export function MentionComposer() {
    const mention = unstable_useMentionAdapter();
    return (
        <ComposerTriggerPopover
            char="@"
            {...mention}
            directive={{ formatter: unstable_defaultDirectiveFormatter }}
            fallbackIcon={WrenchIcon}
        />
    )
}