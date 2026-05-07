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
import {
  FileTextIcon,
  FileIcon,
  DownloadIcon,
  Loader2Icon,
} from "lucide-react";
import { memo, useState, type ComponentProps, type ElementType } from "react";
import type { StaticImageData } from "next/image";
import pdfIcon from "@/images/file-icons/pdf.svg";
import docIcon from "@/images/file-icons/doc.svg";
import txtIcon from "@/images/file-icons/txt.svg";
import jsonIcon from "@/images/file-icons/json.svg";
import { fetchChunksForSource } from "@/supabase/utils/knowledge";
// https://www.untitledui.com/resources/file-icons

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
  chunkIds: string[];
}

type FileIconConfig =
  | { type: "svg"; src: StaticImageData }
  | { type: "lucide"; icon: ElementType; iconClass: string };

function getFileIcon(filename: string): FileIconConfig {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return { type: "svg", src: pdfIcon };
    case "doc":
    case "docx":
      return { type: "svg", src: docIcon };
    case "txt":
      return { type: "svg", src: txtIcon };
    case "json":
      return { type: "svg", src: jsonIcon };
    case "md":
    case "mdx":
      return { type: "lucide", icon: FileTextIcon, iconClass: "text-sky-400" };
    default:
      return { type: "lucide", icon: FileIcon, iconClass: "text-muted-foreground" };
  }
}

function RAGSourceBadge({ path, chunkIds }: RAGSourceItem) {
  const filename = path.split("/").pop() ?? path;
  const iconConfig = getFileIcon(filename);

  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && content === null && !isLoading) {
      setIsLoading(true);
      const { chunks, downloadUrl: url } = await fetchChunksForSource(chunkIds, path);
      // preserve original retrieval order
      const ordered = chunkIds
        .map((id) => chunks.find((c) => c.id === id))
        .filter(Boolean) as { id: string; content: string }[];
      setContent(ordered.map((c) => c.content).join("\n\n--- next chunk ---\n\n"));
      setDownloadUrl(url);
      setIsLoading(false);
    }
  };

  const fileIconEl =
    iconConfig.type === "svg" ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={iconConfig.src.src} alt="" className="size-4 shrink-0" />
    ) : (
      <iconConfig.icon className={cn("size-3.5 shrink-0", iconConfig.iconClass)} />
    );

  const badge = (
    <Badge
      variant="secondary"
      size="default"
      className="gap-1.5 font-normal text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
    >
      {fileIconEl}
      <span className="max-w-37.5 truncate">{filename}</span>
    </Badge>
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{badge}</PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-lg p-0 gap-0">
        <div className="border-b px-3 py-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground truncate flex-1">
            {filename}
          </p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <DownloadIcon className="size-3.5" />

            </a>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto px-3 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
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
