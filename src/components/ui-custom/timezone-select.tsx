"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { TIMEZONE_OPTIONS, TIMEZONE_REGIONS } from "@/lib/utils/timezone";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function TimezoneSelect({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);

  const selected = TIMEZONE_OPTIONS.find((t) => t.value === value);
  const label = selected?.label ?? value;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search timezone..." />
          <CommandList>
            <CommandEmpty>No timezone found.</CommandEmpty>
            {TIMEZONE_REGIONS.map((region) => (
              <CommandGroup key={region} heading={region}>
                {TIMEZONE_OPTIONS.filter((t) => t.region === region).map((tz) => (
                  <CommandItem
                    key={tz.value}
                    value={`${tz.label} ${tz.value}`}
                    onSelect={() => {
                      onChange(tz.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn("mr-2 size-4", value === tz.value ? "opacity-100" : "opacity-0")}
                    />
                    {tz.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
