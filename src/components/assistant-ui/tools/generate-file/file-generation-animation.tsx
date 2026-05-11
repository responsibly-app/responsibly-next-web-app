"use client";

import { useEffect, useState } from "react";
import { FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "Preparing document…",
  "Writing content…",
  "Structuring data…",
  "Formatting layout…",
  "Almost ready…",
];

export function FileGenerationAnimation() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 220);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="inline-flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 max-w-100">
      {/* File icon with scan line */}
      <div className="relative shrink-0 flex items-center justify-center w-9 h-11 rounded-md border border-border bg-muted/60 overflow-hidden">
        <FileIcon className="size-5 text-primary" />
        <div
          className="absolute top-0 inset-x-0 h-0.5 bg-linear-to-r from-transparent via-primary/80 to-transparent"
          style={{ animation: "file-gen-scan 2s ease-in-out infinite" }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <p className="shimmer text-sm font-medium text-foreground leading-snug">
          Generating file
        </p>

        {/* Skeleton content lines */}
        <div className="flex flex-col gap-1.5">
          {(
            [
              { width: "w-full", delay: "0ms" },
              { width: "w-4/5", delay: "180ms" },
              { width: "w-3/5", delay: "360ms" },
            ] as const
          ).map(({ width, delay }, i) => (
            <div
              key={i}
              className={cn(
                "h-1.25 rounded-full bg-muted-foreground/15 animate-pulse",
                width,
              )}
              style={{ animationDelay: delay }}
            />
          ))}
        </div>

        {/* Shimmer progress track */}
        <div className="relative h-0.75 rounded-full bg-muted overflow-hidden mt-0.5">
          <div
            className="absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-primary/55 to-transparent"
            style={{ animation: "file-gen-shimmer 1.8s linear infinite" }}
          />
        </div>

        {/* Cycling status text */}
        <p
          className={cn(
            "text-sm text-muted-foreground/80 transition-opacity",
            visible ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: "200ms" }}
        >
          {MESSAGES[index]}
        </p>
      </div>
    </div>
  );
}
