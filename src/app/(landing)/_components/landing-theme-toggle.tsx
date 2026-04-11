"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
] as const;

export function LandingThemeSwitch() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeIndex = mounted ? Math.max(0, themes.findIndex((t) => t.value === theme)) : 0;
    const activeTheme = mounted ? theme : "light";

    return (
        <div className="flex items-center rounded-full border border-border/10 bg-background/10 p-0.5 shadow-sm shadow-slate-950/10">
            <TooltipProvider>
                <div className="relative flex items-center rounded-full bg-background p-0.5">
                    {mounted && (
                        <motion.div
                            className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-primary shadow"
                            initial={false}
                            animate={{ x: activeIndex * 24 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                    )}
                    {themes.map(({ value, icon: Icon, label }) => (
                        <Tooltip key={value}>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    onClick={() => setTheme(value)}
                                    className={cn(
                                        "relative z-10 flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-200",
                                        mounted && activeTheme === value
                                            ? "text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-3 w-3" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top">{label}</TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>
        </div>
    );
}
