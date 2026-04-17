"use client";

import { StyledQRCode } from "@/components/ui/styled-qr-code";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
  memberUserId: string;
  memberName: string;
}

export function MemberQRDialog({ open, onClose, memberUserId, memberName }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-base">Member QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3 py-2">
          <p className="text-sm font-medium text-center">{memberName}</p>
          {open && <StyledQRCode data={`user:${memberUserId}`} size={220} />}
          <p className="text-xs text-muted-foreground text-center">
            Scan this code to mark the member as present in-person.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
