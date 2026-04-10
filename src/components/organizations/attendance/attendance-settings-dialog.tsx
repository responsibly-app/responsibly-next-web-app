"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrgSettingsPanel } from "@/components/organizations/organization/org-settings-panel";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
};

export function AttendanceSettingsDialog({ open, onOpenChange, orgId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Attendance Settings</DialogTitle>
        </DialogHeader>
        <OrgSettingsPanel orgId={orgId} />
      </DialogContent>
    </Dialog>
  );
}
