"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddPointItem, useUpdatePointItem } from "@/lib/auth/hooks";
import { useFireworks } from "@/components/ui-custom/fireworks";


function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

type PointItem = { id: string; description: string; amount: number; date: string };

type Props =
  | { editItem?: undefined; open?: undefined; onOpenChange?: undefined }
  | { editItem: PointItem; open: boolean; onOpenChange: (open: boolean) => void };

export function AddPointDialog({ editItem, open: controlledOpen, onOpenChange }: Props = {}) {
  const isEdit = !!editItem;

  const [internalOpen, setInternalOpen] = useState(false);
  const open = isEdit ? controlledOpen! : internalOpen;
  const setOpen = isEdit ? onOpenChange! : setInternalOpen;

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState(todayStr());

  useEffect(() => {
    if (open && isEdit) {
      setDescription(editItem.description);
      setAmount(String(editItem.amount));
      setDate(editItem.date);
    } else if (!open) {
      setDescription("");
      setAmount("");
      setDate(todayStr());
    }
  }, [open, isEdit, editItem]);

  const { mutate: addPoint, isPending: isAdding } = useAddPointItem();
  const { mutate: updatePoint, isPending: isUpdating } = useUpdatePointItem();
  const isPending = isAdding || isUpdating;
  const { triggerFireworks } = useFireworks();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount < 1) return;

    if (isEdit) {
      updatePoint(
        { id: editItem.id, description: description.trim(), amount: parsedAmount, date },
        { onSuccess: () => { setOpen(false); } },
      );
    } else {
      addPoint(
        { description: description.trim(), amount: parsedAmount, date },
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
        <DialogTitle>{isEdit ? "Edit Point Item" : "Add Point Item"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="pt-description">Description</Label>
          <Input
            id="pt-description"
            placeholder="e.g. Closed deal with Acme Corp"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pt-amount">Points</Label>
          <Input
            id="pt-amount"
            type="number"
            min={1}
            placeholder="100"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pt-date">Date</Label>
          <Input
            id="pt-date"
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
          />
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
          Add Points
        </Button>
      </DialogTrigger>
      {content}
    </Dialog>
  );
}
