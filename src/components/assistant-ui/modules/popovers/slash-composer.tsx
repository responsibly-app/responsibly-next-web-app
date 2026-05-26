import { ComposerTriggerPopover } from "@/components/assistant-ui/modules/popovers/composer-trigger-popover";
import {
    unstable_useSlashCommandAdapter,
    type Unstable_SlashCommand,
} from "@assistant-ui/react";
import { unstable_defaultDirectiveFormatter } from "@assistant-ui/core";
import { FileTextIcon, GlobeIcon, LanguagesIcon, SlashIcon } from "lucide-react";

const SLASH_COMMANDS: readonly Unstable_SlashCommand[] = [
    {
        id: "summarize",
        description: "Summarize the conversation",
        icon: "FileText",
        execute: () => {/* ... */ },
    },
    {
        id: "translate",
        description: "Translate to another language",
        icon: "Languages",
        execute: () => {/* ... */ },
    },
    {
        id: "search",
        description: "Search the web",
        icon: "Globe",
        execute: () => {/* ... */ },
    },
];

export function SlashComposer() {
    const slash = unstable_useSlashCommandAdapter({ commands: SLASH_COMMANDS });
    return (
        <ComposerTriggerPopover
            char="/"
            {...slash}
            iconMap={{
                FileText: FileTextIcon,
                Languages: LanguagesIcon,
                Globe: GlobeIcon,
            }}
            action={{
                formatter: unstable_defaultDirectiveFormatter,
                onExecute: (item) => {
                    console.log("Executed slash command:", item);
                },
            }}
            fallbackIcon={SlashIcon}
        />
    );
}