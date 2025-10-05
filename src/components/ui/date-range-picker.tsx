import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  onDateRangeChange: (dateRange: DateRange) => void;
  children: React.ReactNode;
  defaultDateRange?: DateRange;
}

export function DateRangePicker({ onDateRangeChange, children, defaultDateRange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(defaultDateRange)

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      const newRange = { from: range.from, to: range.to };
      setDateRange(newRange);
      onDateRangeChange(newRange);
    } else {
      setDateRange(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleDateRangeSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}