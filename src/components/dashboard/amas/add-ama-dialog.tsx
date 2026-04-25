"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAddAmaItem, useUpdateAmaItem } from "@/lib/auth/hooks";
import { useFireworks } from "@/contexts/fireworks-context";

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

type AmaItem = { id: string; recruitName: string; agentCode: string | null; date: string };

type Props =
  | { editItem?: undefined; open?: undefined; onOpenChange?: undefined }
  | { editItem: AmaItem; open: boolean; onOpenChange: (open: boolean) => void };

export function AddAmaDialog({ editItem, open: controlledOpen, onOpenChange }: Props = {}) {
  const isEdit = !!editItem;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isEdit ? controlledOpen! : internalOpen;
  const setOpen = isEdit ? onOpenChange! : setInternalOpen;

  const [recruitName, setRecruitName] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    if (open && isEdit) {
      setRecruitName(editItem.recruitName);
      setAgentCode(editItem.agentCode ?? "");
      setDate(parseISO(editItem.date));
    } else if (!open) {
      setRecruitName("");
      setAgentCode("");
      setDate(new Date());
    }
  }, [open, isEdit, editItem]);

  const { mutate: addAma, isPending: isAdding } = useAddAmaItem();
  const { mutate: updateAma, isPending: isUpdating } = useUpdateAmaItem();
  const isPending = isAdding || isUpdating;
  const { triggerFireworks } = useFireworks();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!recruitName.trim()) return;

    if (isEdit) {
      updateAma(
        { id: editItem.id, recruitName: recruitName.trim(), agentCode: agentCode.trim() || undefined, date: toDateStr(date) },
        { onSuccess: () => { setOpen(false); } },
      );
    } else {
      addAma(
        { recruitName: recruitName.trim(), agentCode: agentCode.trim() || undefined, date: toDateStr(date) },
        {
          onSuccess: () => {
            setOpen(false);
            triggerFireworks();
          },
        },
      );
    }
  }

  const content = (
    <DialogContent className="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Recruit" : "Add AMA Recruit"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="ama-recruit-name">Recruit Name</Label>
          <Input
            id="ama-recruit-name"
            placeholder="e.g. Jane Smith"
            value={recruitName}
            onChange={(e) => setRecruitName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ama-agent-code">
            Agent Code <span className="text-muted-foreground text-xs">(optional)</span>
          </Label>
          <Input
            id="ama-agent-code"
            placeholder="e.g. AGT-1234"
            value={agentCode}
            onChange={(e) => setAgentCode(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Recruit Date</Label>
          <Popover open={calOpen} onOpenChange={setCalOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                type="button"
              >
                <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) { setDate(d); setCalOpen(false); }
                }}
                disabled={(d) => d > new Date()}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? (isEdit ? "Saving…" : "Adding…") : (isEdit ? "Save" : "Add")}
        </Button>
      </form>
    </DialogContent>
  );

  if (isEdit) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4 mr-1" />
          Add Recruit
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
