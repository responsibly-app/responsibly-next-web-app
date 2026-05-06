"use client";

import {
  Badge,
  badgeVariants,
  type BadgeProps,
} from "@/components/assistant-ui/badge";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SourceMessagePartComponent } from "@assistant-ui/react";
import { FileTextIcon } from "lucide-react";
import { memo, useState, type ComponentProps } from "react";

const extractDomain = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const getDomainInitial = (url: string): string => {
  const domain = extractDomain(url);
  return domain.charAt(0).toUpperCase();
};

function SourceIcon({
  url,
  className,
  ...props
}: ComponentProps<"span"> & { url: string }) {
  const [hasError, setHasError] = useState(false);
  const domain = extractDomain(url);

  if (hasError) {
    return (
      <span
        data-slot="source-icon-fallback"
        className={cn(
          "bg-muted flex size-3 shrink-0 items-center justify-center rounded-sm text-[10px] font-medium",
          className,
        )}
        {...props}
      >
        {getDomainInitial(url)}
      </span>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      data-slot="source-icon"
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
      alt=""
      className={cn("size-3 shrink-0 rounded-sm", className)}
      onError={() => setHasError(true)}
      {...(props as ComponentProps<"img">)}
    />
  );
}

function SourceTitle({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="source-title"
      className={cn("max-w-37.5 truncate", className)}
      {...props}
    />
  );
}

export type SourceProps = Omit<BadgeProps, "asChild"> &
  ComponentProps<"a"> & {
    asChild?: boolean;
  };

function Source({
  className,
  variant,
  size,
  asChild = false,
  target = "_blank",
  rel = "noopener noreferrer",
  ...props
}: SourceProps) {
  return (
    <Badge
      asChild
      variant={variant}
      size={size}
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer outline-none focus-visible:ring-[3px]",
        className,
      )}
    >
      <a
        data-slot="source"
        target={target}
        rel={rel}
        {...(props as ComponentProps<"a">)}
      />
    </Badge>
  );
}

const SourcesImpl: SourceMessagePartComponent = ({
  url,
  title,
  sourceType,
}) => {
  if (sourceType !== "url" || !url) return null;

  const domain = extractDomain(url);
  const displayTitle = title || domain;

  return (
    <Source href={url}>
      <SourceIcon url={url} />
      <SourceTitle>{displayTitle}</SourceTitle>
    </Source>
  );
};

const Sources = memo(SourcesImpl) as unknown as SourceMessagePartComponent & {
  Root: typeof Source;
  Icon: typeof SourceIcon;
  Title: typeof SourceTitle;
};

Sources.displayName = "Sources";
Sources.Root = Source;
Sources.Icon = SourceIcon;
Sources.Title = SourceTitle;

export interface RAGSourceItem {
  path: string;
  topic: string;
  content?: string;
}

function RAGSourceBadge({ path, topic, content }: RAGSourceItem) {
  const filename = path.split("/").pop() ?? path;
  const label = topic || filename;

  const badge = (
    <Badge
      variant="secondary"
      size="sm"
      className="gap-1.5 font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      <FileTextIcon className="size-3 shrink-0" />
      <span className="max-w-37.5 truncate">{label}</span>
    </Badge>
  );

  if (!content) return badge;

  return (
    <Popover>
      <PopoverTrigger asChild>{badge}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-lg p-0 gap-0"
      >
        <div className="border-b px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
        </div>
        <div className="max-h-80 overflow-y-auto px-3 py-2">
          <p className="text-xs leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function RAGSources({ sources }: { sources: RAGSourceItem[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((src, i) => (
        <RAGSourceBadge key={i} {...src} />
      ))}
    </div>
  );
}

export {
  Source,
  SourceIcon,
  Sources,
  SourceTitle,
  badgeVariants as sourceVariants,
};
