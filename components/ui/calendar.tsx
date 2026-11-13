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
      className={cn("p-3 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xs", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-between pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-[#2c2e2a] dark:text-zinc-100",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg border border-[#d5d5d4] dark:border-zinc-700 flex items-center justify-center hover:bg-[#f5f1e4] dark:hover:bg-zinc-800 text-[#2c2e2a] dark:text-zinc-200 absolute left-1 transition cursor-pointer"
        ),
        button_next: cn(
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-lg border border-[#d5d5d4] dark:border-zinc-700 flex items-center justify-center hover:bg-[#f5f1e4] dark:hover:bg-zinc-800 text-[#2c2e2a] dark:text-zinc-200 absolute right-1 transition cursor-pointer"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-[#80827f] dark:text-zinc-400 rounded-md w-8 font-normal text-[0.8rem] text-center",
        week: "flex w-full mt-2",
        day: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 rounded-xl"
        ),
        day_button: cn(
          "h-8 w-8 p-0 font-medium rounded-xl hover:bg-[#f5f1e4] dark:hover:bg-zinc-800 text-[#2c2e2a] dark:text-zinc-200 transition-all aria-selected:opacity-100 flex items-center justify-center cursor-pointer"
        ),
        selected:
          "bg-[#4285F4] text-white hover:bg-[#3367D6] hover:text-white focus:bg-[#4285F4] focus:text-white shadow-xs font-semibold rounded-xl",
        today: "border border-[#4285F4] text-[#4285F4] font-semibold",
        outside: "text-[#b0b2af] dark:text-zinc-600 opacity-40",
        disabled: "text-[#b0b2af] dark:text-zinc-600 opacity-30 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-[#f5f1e4] dark:aria-selected:bg-zinc-800 aria-selected:text-[#2c2e2a] dark:aria-selected:text-zinc-200",
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
