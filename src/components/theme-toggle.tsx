"use client";

import { motion } from "framer-motion";
import { Check, Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const activeIndex = Math.max(0, themes.findIndex((t) => t.value === theme));

  return (
    <div className="flex items-center justify-between px-2 py-1.5 pl-5">
      <span className="text-foreground flex items-center gap-1.5 text-sm">
        {/* <SunMoon className="size-4" /> */}
        Theme
      </span>
      <TooltipProvider>
        <div className="bg-muted relative flex items-center rounded-full p-1">
          <motion.div
            className="bg-background absolute h-7 w-7 rounded-full shadow"
            initial={false}
            animate={{ x: activeIndex * 28 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          {themes.map(({ value, icon: Icon, label }) => (
            <Tooltip key={value}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setTheme(value)}
                  className={cn(
                    "relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200",
                    theme === value
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="h-4 w-4" />
          Light
          {theme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="h-4 w-4" />
          Dark
          {theme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="h-4 w-4" />
          System
          {theme === "system" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
