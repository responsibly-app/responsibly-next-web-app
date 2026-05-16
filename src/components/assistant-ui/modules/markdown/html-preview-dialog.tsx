"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CodeXml, Eye, Maximize2, Minimize2, X } from "lucide-react";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

type HtmlPreviewDialogProps = {
  code: string;
};

export function HtmlPreviewDialog({ code }: HtmlPreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClose = () => {
    setOpen(false);
    setIsFullscreen(false);
  };

  const iframe = (
    <iframe
      srcDoc={code}
      title="HTML Preview"
      sandbox="allow-scripts"
      className="w-full flex-1 border-0 bg-background"
    />
  );

  const header = (fullscreen: boolean) => (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/50 shrink-0">
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <CodeXml className="size-3.5" />
        HTML Preview
      </span>
      <div className="flex items-center gap-0.5">
        {fullscreen ? (
          <TooltipIconButton tooltip="Exit Fullscreen" onClick={() => setIsFullscreen(false)}>
            <Minimize2 />
          </TooltipIconButton>
        ) : (
          <TooltipIconButton tooltip="Fullscreen" onClick={() => setIsFullscreen(true)}>
            <Maximize2 />
          </TooltipIconButton>
        )}
        <TooltipIconButton tooltip="Close" onClick={handleClose}>
          <X />
        </TooltipIconButton>
      </div>
    </div>
  );

  return (
    <>
      <TooltipIconButton tooltip="Preview" onClick={() => setOpen(true)}>
        <Eye />
      </TooltipIconButton>

      {open && createPortal(
        <>
          {/* Backdrop */}
          {!isFullscreen && (
            <div
              className="fixed inset-0 z-50 bg-black/50"
              onClick={handleClose}
            />
          )}

          {/* Panel */}
          <div
            role="dialog"
            aria-label="HTML Preview"
            className={
              isFullscreen
                ? "fixed inset-0 z-50 flex flex-col bg-background"
                : "fixed z-50 flex flex-col bg-background rounded-2xl shadow-lg border border-border/50 overflow-hidden"
            }
            style={isFullscreen ? undefined : {
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              height: "80vh",
              width: "min(56rem, 90vw)",
            }}
          >
            {header(isFullscreen)}
            {iframe}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
