"use client";

import { StyledQRCode, type StyledQRCodeHandle } from "@/components/ui/styled-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, QrCode } from "lucide-react";
import { useRef } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  name: string;
}

export function UserQRDialog({ open, onClose, userId, name }: Props) {
  const qrRef = useRef<StyledQRCodeHandle | null>(null);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <QrCode className="size-4" />
            My Check-in QR
          </DialogTitle>
          <DialogDescription>
            Show this to an admin to mark you present at in-person events.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-3 py-1">
          <p className="text-sm font-medium">{name}</p>
          {open && (
            <StyledQRCode ref={qrRef} data={`user:${userId}`} size={220} />
          )}
          <p className="text-center text-xs text-muted-foreground">{userId}</p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => qrRef.current?.download("my-checkin-qr")}
          >
            <Download className="size-3.5" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
