"use client";

import { useState, useEffect } from "react";
import { CheckIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateMemberLevel } from "@/lib/auth/hooks";
import { WFG_LEVEL_META, WFG_LEVELS, type WFGLevel } from "@/lib/auth/hooks/oraganization/levels";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  memberId: string;
  memberName: string;
  currentLevel: WFGLevel;
};

const ORDERED_LEVELS = Object.entries(WFG_LEVELS)
  .sort(([, a], [, b]) => a - b)
  .map(([key]) => key as WFGLevel);

export function UpdateMemberLevelDialog({
  open,
  onOpenChange,
  organizationId,
  memberId,
  memberName,
  currentLevel,
}: Props) {
  const [level, setLevel] = useState<WFGLevel>(currentLevel);
  const updateLevel = useUpdateMemberLevel();

  useEffect(() => {
    if (open) setLevel(currentLevel);
  }, [open, currentLevel]);

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit() {
    updateLevel.mutate(
      { memberId, level, organizationId },
      { onSuccess: handleClose },
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Level</DialogTitle>
          <DialogDescription>
            Change the WFG level for{" "}
            <span className="font-medium text-foreground">{memberName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="member-level">Level</Label>
          <Select value={level} onValueChange={(v) => setLevel(v as WFGLevel)}>
            <SelectTrigger id="member-level">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="p-2">
              {ORDERED_LEVELS.map((lvl) => {
                const meta = WFG_LEVEL_META[lvl];
                return (
                  <SelectPrimitive.Item
                    key={lvl}
                    value={lvl}
                    className="relative flex w-full cursor-default items-start m-1 gap-2.5 rounded-xl py-2.5 pr-8 pl-3 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50"
                  >
                    <span className="pointer-events-none absolute right-2 top-2.5 flex size-4 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <CheckIcon className="size-4 pointer-events-none" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <SelectPrimitive.ItemText>
                        <span className="font-medium">{meta.abbreviation} — {meta.label}</span>
                      </SelectPrimitive.ItemText>
                    </div>
                  </SelectPrimitive.Item>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateLevel.isPending || level === currentLevel}>
            {updateLevel.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Update Level
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
