"use client";

import { useState } from "react";
import { format } from "date-fns";
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
import { useAddAmaItem } from "@/lib/auth/hooks";
import { useFireworks } from "@/contexts/fireworks-context";

function toDateStr(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function AddAmaDialog() {
  const [open, setOpen] = useState(false);
  const [recruitName, setRecruitName] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [calOpen, setCalOpen] = useState(false);

  const { mutate: addAma, isPending } = useAddAmaItem();
  const { triggerFireworks } = useFireworks();

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!recruitName.trim()) return;

    addAma(
      { recruitName: recruitName.trim(), agentCode: agentCode.trim() || undefined, date: toDateStr(date) },
      {
        onSuccess: () => {
          setRecruitName("");
          setAgentCode("");
          setDate(new Date());
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
          Add Recruit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add AMA Recruit</DialogTitle>
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
            {isPending ? "Adding…" : "Add"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
