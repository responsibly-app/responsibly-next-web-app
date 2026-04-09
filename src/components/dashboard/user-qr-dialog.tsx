"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  name: string;
}

export function UserQRDialog({ open, onClose, userId, name }: Props) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(`user:${userId}`, { width: 240, margin: 2 })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [open, userId]);

  function handleDownload() {
    if (!qrUrl) return;
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = `my-checkin-qr.png`;
    a.click();
  }

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
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="My check-in QR code"
              className="rounded-lg border"
              width={220}
              height={220}
            />
          ) : (
            <Skeleton className="size-55 rounded-lg" />
          )}
          <p className="text-center text-xs text-muted-foreground">{userId}</p>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleDownload}
            disabled={!qrUrl}
          >
            <Download className="size-3.5" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
