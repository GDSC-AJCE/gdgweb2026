"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white rounded-2xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-between pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-[#2c2e2a]",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg border border-[#d5d5d4] flex items-center justify-center hover:bg-[#f5f1e4] text-[#2c2e2a] absolute left-1"
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg border border-[#d5d5d4] flex items-center justify-center hover:bg-[#f5f1e4] text-[#2c2e2a] absolute right-1"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-[#80827f] rounded-md w-8 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 rounded-xl"
        ),
        day_button: cn(
          "h-8 w-8 p-0 font-medium rounded-xl hover:bg-[#f5f1e4] text-[#2c2e2a] transition-all aria-selected:opacity-100 flex items-center justify-center"
        ),
        selected:
          "bg-[#4285F4] text-white hover:bg-[#3367D6] hover:text-white focus:bg-[#4285F4] focus:text-white shadow-xs font-semibold rounded-xl",
        today: "border border-[#4285F4] text-[#4285F4] font-semibold",
        outside: "text-[#b0b2af] opacity-40",
        disabled: "text-[#b0b2af] opacity-30 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-[#f5f1e4] aria-selected:text-[#2c2e2a]",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
