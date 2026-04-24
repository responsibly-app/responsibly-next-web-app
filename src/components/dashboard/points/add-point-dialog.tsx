"use client";

import { useState } from "react";
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
import { useAddPointItem } from "@/lib/auth/hooks";
import { useFireworks } from "@/contexts/fireworks-context";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function AddPointDialog() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState(todayStr());

  const { mutate: addPoint, isPending } = useAddPointItem();
  const { triggerFireworks } = useFireworks();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount < 1) return;

    addPoint(
      { description: description.trim(), amount: parsedAmount, date },
      {
        onSuccess: () => {
          setDescription("");
          setAmount("");
          setDate(todayStr());
          setOpen(false);
          triggerFireworks();
        },
      },
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Point Item</DialogTitle>
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
            {isPending ? "Adding…" : "Add"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
