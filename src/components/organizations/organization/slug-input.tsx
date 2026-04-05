"use client";

import { InfoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function sanitizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-{2,}/g, "-");
}

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
};

export function SlugInput({ id, value, onChange }: Props) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>Slug</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-muted-foreground hover:text-foreground transition-colors">
                <InfoIcon className="size-3.5" />
                <span className="sr-only">What is a slug?</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-56 text-wrap">
              A slug is a unique, URL-friendly identifier for your organization. It must be lowercase and use only letters, numbers, and hyphens.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center">
        <span className="text-muted-foreground border-input bg-muted flex h-9 items-center rounded-l-md border border-r-0 px-3 text-sm">
          /
        </span>
        <Input
          id={id}
          className="rounded-l-none"
          placeholder="my-organization"
          value={value}
          onChange={(e) => onChange(sanitizeSlug(e.target.value))}
        />
      </div>
    </div>
  );
}
