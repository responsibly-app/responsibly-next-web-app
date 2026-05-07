"use client";

import { useAuiState } from "@assistant-ui/react";
import type { SyntaxHighlighterProps } from "@assistant-ui/react-markdown";
import mermaid from "mermaid";
import { type FC, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type MermaidDiagramProps = SyntaxHighlighterProps & {
  className?: string;
};

mermaid.initialize({ theme: "default", startOnLoad: false, suppressErrorRendering: true });

export const MermaidDiagram: FC<MermaidDiagramProps> = ({
  code,
  className,
  node: _node,
  components: _components,
  language: _language,
}) => {
  const ref = useRef<HTMLPreElement>(null);
  const [error, setError] = useState<string | null>(null);

  const isComplete = useAuiState((s) => {
    if (s.part.type !== "text") return false;
    if (!code.trim()) return false;

    const codeIndex = s.part.text.indexOf(code);
    if (codeIndex === -1) return false;

    const afterCode = s.part.text.substring(codeIndex + code.length);
    const closingBackticksMatch = afterCode.match(/^```|^\n```/);
    return closingBackticksMatch !== null;
  });

  useEffect(() => {
    if (!isComplete) return;

    (async () => {
      try {
        setError(null);
        await mermaid.parse(code.trim());
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const result = await mermaid.render(id, code.trim());
        if (ref.current) {
          ref.current.innerHTML = result.svg;
          result.bindFunctions?.(ref.current);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to render diagram";
        setError(message);
        console.warn("Failed to render Mermaid diagram:", e);
      }
    })();
  }, [isComplete, code]);

  if (error) {
    return (
      <pre
        className={cn(
          "aui-mermaid-diagram rounded-b-lg bg-muted p-3 text-xs text-muted-foreground",
          className,
        )}
      >
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <pre
      ref={ref}
      className={cn(
        "aui-mermaid-diagram rounded-b-lg bg-muted p-2 text-center [&_svg]:mx-auto",
        className,
      )}
    >
      {isComplete ? null : "Drawing diagram..."}
    </pre>
  );
};

MermaidDiagram.displayName = "MermaidDiagram";
