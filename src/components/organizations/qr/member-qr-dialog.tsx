"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  open: boolean;
  onClose: () => void;
  memberUserId: string;
  memberName: string;
}

export function MemberQRDialog({ open, onClose, memberUserId, memberName }: Props) {
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(`user:${memberUserId}`, { width: 220, margin: 2 })
      .then(setQrUrl)
      .catch(() => setQrUrl(null));
  }, [open, memberUserId]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-base">Member QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-sm font-medium text-center">{memberName}</p>
          {qrUrl ? (
            <img src={qrUrl} alt="Member QR" className="rounded-lg border" width={220} height={220} />
          ) : (
            <Skeleton className="size-52 rounded-lg" />
          )}
          <p className="text-xs text-muted-foreground text-center">
            Scan this code to mark the member as present in-person.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
