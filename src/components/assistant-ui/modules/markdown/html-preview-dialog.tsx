"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { CodeXml, Eye, Maximize2, Minimize2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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

  return (
    <>
      <TooltipIconButton tooltip="Preview" onClick={() => setOpen(true)}>
        <Eye />
      </TooltipIconButton>

      {/* Normal dialog */}
      <Dialog open={open && !isFullscreen} onOpenChange={(next) => { if (!next) handleClose(); }}>
        <DialogContent
          showCloseButton={false}
          className="flex flex-col gap-0 p-0 overflow-hidden"
          style={{ height: "80vh", maxWidth: "56rem" }}
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/50 shrink-0">
            <DialogTitle className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CodeXml className="size-3.5" />
              HTML Preview
            </DialogTitle>
            <div className="flex items-center gap-0.5">
              <TooltipIconButton tooltip="Fullscreen" onClick={() => setIsFullscreen(true)}>
                <Maximize2 />
              </TooltipIconButton>
              <TooltipIconButton tooltip="Close" onClick={handleClose}>
                <X />
              </TooltipIconButton>
            </div>
          </div>
          {iframe}
        </DialogContent>
      </Dialog>

      {/* Fullscreen portal — bypasses Dialog overlay and positioning entirely */}
      {open && isFullscreen && createPortal(
        <div
          role="dialog"
          aria-label="HTML Preview"
          className="fixed inset-0 z-100 flex flex-col bg-background"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/50 shrink-0">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <CodeXml className="size-3.5" />
              HTML Preview
            </span>
            <div className="flex items-center gap-0.5">
              <TooltipIconButton tooltip="Exit Fullscreen" onClick={() => setIsFullscreen(false)}>
                <Minimize2 />
              </TooltipIconButton>
              <TooltipIconButton tooltip="Close" onClick={handleClose}>
                <X />
              </TooltipIconButton>
            </div>
          </div>
          {iframe}
        </div>,
        document.body,
      )}
    </>
  );
}
