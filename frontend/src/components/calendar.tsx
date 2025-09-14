"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import type { DateRange } from "react-day-picker";

export function CalendarQuery({ onDateRangeChange = () => {} }) {
  const [open, setOpen] = React.useState(false);
  const [range, setRange] = React.useState<DateRange | undefined>(undefined);
  const [tempRange, setTempRange] = React.useState<DateRange | undefined>(
    undefined
  );

  const handleUpdate = () => {
    setRange(tempRange);
    setOpen(false);
    if (onDateRangeChange) {
      onDateRangeChange(tempRange);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-72 justify-between font-normal"
          >
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "MM/dd/yyyy")} -{" "}
                  {format(range.to, "MM/dd/yyyy")}
                </>
              ) : (
                format(range.from, "MM/dd/yyyy")
              )
            ) : (
              "Select date range"
            )}
            <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-2" align="start">
          {/* Manual input fields */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={
                tempRange?.from ? format(tempRange.from, "yyyy-MM-dd") : ""
              }
              onChange={(e) =>
                setTempRange((prev) => ({
                  from: e.target.value ? new Date(e.target.value) : undefined,
                  to: prev?.to,
                }))
              }
            />
            <span>to</span>
            <input
              type="date"
              className="border rounded px-2 py-1"
              value={tempRange?.to ? format(tempRange.to, "yyyy-MM-dd") : ""}
              onChange={(e) =>
                setTempRange((prev) => ({
                  from: prev?.from,
                  to: e.target.value ? new Date(e.target.value) : undefined,
                }))
              }
            />
          </div>

          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={tempRange}
            onSelect={setTempRange}
          />

          <div className="flex justify-end my-2 mr-4 ">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={!tempRange?.from}
            >
              Update
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
