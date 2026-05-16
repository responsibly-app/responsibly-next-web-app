"use client";

import "@assistant-ui/react-markdown/styles/dot.css";

import {
  type CodeHeaderProps,
  MarkdownTextPrimitive,
  unstable_memoizeMarkdownComponents as memoizeMarkdownComponents,
  useIsMarkdownCodeBlock,
} from "@assistant-ui/react-markdown";
import remarkGfm from "remark-gfm";
import { type FC, memo, useState, useRef, type ComponentPropsWithoutRef } from "react";
import { CheckIcon, CopyIcon, CodeXml, Table2, DownloadIcon } from "lucide-react";

import { useAuiState } from "@assistant-ui/react";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";
import { cn } from "@/lib/utils";
import { SyntaxHighlighter } from "./shiki-highlighter";
import { MermaidDiagram } from "./mermaid-diagram";
import { HtmlPreviewDialog } from "./html-preview-dialog";

const MarkdownTextImpl = () => {
  // Guard against rendering outside a text/reasoning part context — can occur during
  // streaming transitions when the store part type changes before React re-renders.
  const partType = useAuiState((s) => (s as any).part?.type as string | undefined);
  if (partType !== "text" && partType !== "reasoning") return null;

  return (
    <MarkdownTextPrimitive
      remarkPlugins={[remarkGfm]}
      className="aui-md"
      components={defaultComponents}
      componentsByLanguage={{
        mermaid: {
          SyntaxHighlighter: MermaidDiagram
        },
      }}
    />
  );
};

export const MarkdownText = memo(MarkdownTextImpl);

const LANG_EXT: Record<string, string> = {
  javascript: "js", typescript: "ts", jsx: "jsx", tsx: "tsx",
  python: "py", ruby: "rb", go: "go", rust: "rs", java: "java",
  kotlin: "kt", swift: "swift", c: "c", cpp: "cpp", csharp: "cs",
  php: "php", html: "html", css: "css", scss: "scss", sass: "sass",
  json: "json", yaml: "yaml", yml: "yml", toml: "toml", xml: "xml",
  sql: "sql", sh: "sh", bash: "sh", shell: "sh", markdown: "md",
  dockerfile: "Dockerfile", graphql: "graphql",
};

const CodeHeader: FC<CodeHeaderProps> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const isHtml = language === "html";

  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  const onDownload = () => {
    if (!code) return;
    const ext = (language && LANG_EXT[language.toLowerCase()]) ?? language ?? "txt";
    const filename = `code.${ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="aui-code-header-root mt-2.5 flex items-center justify-between rounded-t-2xl border-none border-border/50 border-b-0 bg-muted/75 px-4 pt-3 text-sm">
      <span className="aui-code-header-language flex items-center gap-1.5 font-medium text-foreground capitalize">
        <CodeXml className="size-3.5" />
        {language}
      </span>
      <div className="flex items-center gap-0.5">
        {isHtml && <HtmlPreviewDialog code={code} />}
        <TooltipIconButton tooltip="Download" onClick={onDownload}>
          <DownloadIcon />
        </TooltipIconButton>
        <TooltipIconButton tooltip="Copy" onClick={onCopy}>
          {!isCopied && <CopyIcon />}
          {isCopied && <CheckIcon />}
        </TooltipIconButton>
      </div>
    </div>
  );
};

const TableWithCopy: FC<ComponentPropsWithoutRef<"table">> = ({ className, ...props }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const tableRef = useRef<HTMLTableElement>(null);

  const getRows = () => {
    if (!tableRef.current) return [];
    return Array.from(tableRef.current.querySelectorAll("tr")).map((row) =>
      Array.from(row.querySelectorAll("th, td")).map((cell) => cell.textContent?.trim() ?? ""),
    );
  };

  const onCopy = () => {
    if (!tableRef.current || isCopied) return;
    const text = getRows()
      .map((cells) => cells.join("\t"))
      .join("\n");
    copyToClipboard(text);
  };

  const onDownload = () => {
    const rows = getRows();
    if (!rows.length) return;
    const csv = rows
      .map((cells) => cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-5 rounded-2xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 text-sm border-border/50">
        <span className="flex items-center gap-1.5 text-foreground capitalize">
          <Table2 className="size-3.5" />
          table
        </span>
        <div className="flex items-center gap-0.5">
          <TooltipIconButton tooltip="Download CSV" onClick={onDownload}>
            <DownloadIcon />
          </TooltipIconButton>
          <TooltipIconButton tooltip="Copy" onClick={onCopy}>
            {!isCopied ? <CopyIcon /> : <CheckIcon />}
          </TooltipIconButton>
        </div>
      </div>
      <div className="w-full overflow-x-auto overflow-y-auto max-h-120">
        <table
          ref={tableRef}
          className={cn("aui-md-table w-full border-collapse", className)}
          {...props}
        />
      </div>
    </div>
  );
};

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

const defaultComponents = memoizeMarkdownComponents({
  SyntaxHighlighter: SyntaxHighlighter,
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "aui-md-h1 mt-6 mb-2 scroll-m-20 text-[24px] font-bold tracking-tight leading-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "aui-md-h2 mt-6 mb-2 scroll-m-20 pb-1.5 text-[20px] font-semibold tracking-tight leading-tight first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "aui-md-h3 mt-3 mb-2 scroll-m-20 text-lg font-semibold leading-snug first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      className={cn(
        "aui-md-h4 mt-2 mb-2 scroll-m-20 text-base font-semibold leading-snug first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h5: ({ className, ...props }) => (
    <h5
      className={cn(
        "aui-md-h5 mt-2 mb-2 text-sm font-semibold leading-snug first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  h6: ({ className, ...props }) => (
    <h6
      className={cn(
        "aui-md-h6 mt-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-snug first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn(
        "aui-md-p my-2.5 leading-normal first:mt-0 last:mb-0",
        className,
      )}
      {...props}
    />
  ),
  a: ({ className, href, ...props }) => {
    // const signedUrl = useSignedBucketUrl(href);
    return (
      <a
        className={cn(
          "aui-md-a text-primary underline underline-offset-2 hover:text-primary/80",
          className,
        )}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    );
  },
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "aui-md-blockquote my-2.5 border-muted-foreground/30 border-s-2 ps-3 text-muted-foreground italic",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "aui-md-ul my-2 ms-4 list-disc marker:text-muted-foreground [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "aui-md-ol my-2 ms-4 list-decimal marker:text-muted-foreground [&>li]:mt-1",
        className,
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr
      className={cn("aui-md-hr my-7 border-muted-foreground/20", className)}
      {...props}
    />
  ),
  table: ({ className, ...props }) => <TableWithCopy className={className} {...props} />,
  th: ({ className, ...props }) => (
    <th
      className={cn(
        "aui-md-th sticky top-0 bg-muted/50 backdrop-blur-xs px-4 py-2 text-start text-sm font-bold text-foreground border-b border-r-none border-border/50 border-b-border last:border-r-0 [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "aui-md-td px-4 py-2 bg-muted/50 text-start text-sm border-b border-r-none border-border/50 last:border-r-0 [tr:last-child_&]:pb-3 [tr:last-child_&]:border-b-0 [[align=center]]:text-center [[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "aui-md-tr",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("aui-md-li leading-normal", className)} {...props} />
  ),
  sup: ({ className, ...props }) => (
    <sup
      className={cn("aui-md-sup [&>a]:text-xs [&>a]:no-underline", className)}
      {...props}
    />
  ),
  pre: ({ className, ...props }) => (
    <pre
      className={cn(
        "aui-md-pre overflow-x-auto rounded-t-none rounded-b-2xl border border-border/50 border-t-0 bg-muted/30 p-3 text-xs leading-relaxed",
        className,
      )}
      {...props}
    />
  ),
  code: function Code({ className, ...props }) {
    const isCodeBlock = useIsMarkdownCodeBlock();
    return (
      <code
        className={cn(
          !isCodeBlock &&
          "aui-md-inline-code rounded-2xl border border-border/50 bg-muted/50 px-1.5 py-0.5 font-mono text-[0.85rem]",
          className,
        )}
        {...props}
      />
    );
  },
  CodeHeader,
});
