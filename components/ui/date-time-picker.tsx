"use client";

import * as React from "react";
import { format, parse, isValid, addDays, startOfWeek, endOfWeek, addMonths, subMonths, isSameDay, isSameMonth, setHours, setMinutes } from "date-fns";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface DateTimePickerProps {
  value?: string; // "YYYY-MM-DDTHH:mm" or "YYYY-MM-DD"
  onChange?: (value: string) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  required?: boolean;
  showTime?: boolean; // default true
  className?: string;
}

export function DateTimePicker({
  value = "",
  onChange,
  placeholder = "Pick date & time...",
  id,
  disabled = false,
  required = false,
  showTime = true,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial date from value
  const parseValue = React.useCallback((valStr: string): Date | null => {
    if (!valStr) return null;
    try {
      // Try YYYY-MM-DDTHH:mm
      if (valStr.includes("T")) {
        const d = parse(valStr, "yyyy-MM-dd'T'HH:mm", new Date());
        if (isValid(d)) return d;
      }
      // Try YYYY-MM-DD
      const dOnly = parse(valStr, "yyyy-MM-dd", new Date());
      if (isValid(dOnly)) return dOnly;

      const direct = new Date(valStr);
      if (isValid(direct)) return direct;
    } catch {
      return null;
    }
    return null;
  }, []);

  const selectedDate = React.useMemo(() => parseValue(value), [value, parseValue]);

  // Current view month in calendar
  const [viewMonth, setViewMonth] = React.useState<Date>(() => selectedDate || new Date());

  // Time components
  const [hour12, setHour12] = React.useState<string>(() => {
    if (selectedDate) {
      const h = selectedDate.getHours() % 12 || 12;
      return h.toString().padStart(2, "0");
    }
    return "10";
  });

  const [minute, setMinute] = React.useState<string>(() => {
    if (selectedDate) {
      return selectedDate.getMinutes().toString().padStart(2, "0");
    }
    return "00";
  });

  const [ampm, setAmpm] = React.useState<"AM" | "PM">(() => {
    if (selectedDate) {
      return selectedDate.getHours() >= 12 ? "PM" : "AM";
    }
    return "AM";
  });

  // Keep internal time state in sync when selectedDate changes
  React.useEffect(() => {
    if (selectedDate) {
      const h = selectedDate.getHours() % 12 || 12;
      setHour12(h.toString().padStart(2, "0"));
      setMinute(selectedDate.getMinutes().toString().padStart(2, "0"));
      setAmpm(selectedDate.getHours() >= 12 ? "PM" : "AM");
      setViewMonth(selectedDate);
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  // Construct final formatted string from Date & Time components
  const formatOutput = (dayDate: Date, hStr: string, mStr: string, mer: "AM" | "PM"): string => {
    let hours = parseInt(hStr, 10);
    if (isNaN(hours)) hours = 10;
    if (mer === "PM" && hours < 12) hours += 12;
    if (mer === "AM" && hours === 12) hours = 0;

    const mins = parseInt(mStr, 10) || 0;
    const finalDate = setMinutes(setHours(dayDate, hours), mins);

    if (showTime) {
      return format(finalDate, "yyyy-MM-dd'T'HH:mm");
    }
    return format(finalDate, "yyyy-MM-dd");
  };

  const handleSelectDay = (day: Date) => {
    const updatedStr = formatOutput(day, hour12, minute, ampm);
    onChange?.(updatedStr);
    if (!showTime) {
      setOpen(false);
    }
  };

  const handleTimeChange = (newHour: string, newMinute: string, newAmpm: "AM" | "PM") => {
    setHour12(newHour);
    setMinute(newMinute);
    setAmpm(newAmpm);

    const baseDate = selectedDate || new Date();
    const updatedStr = formatOutput(baseDate, newHour, newMinute, newAmpm);
    onChange?.(updatedStr);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.("");
  };

  const handlePreset = (type: "today" | "tomorrow" | "weekend") => {
    const now = new Date();
    let target = now;
    if (type === "tomorrow") {
      target = addDays(now, 1);
    } else if (type === "weekend") {
      const day = now.getDay();
      const daysUntilSaturday = (6 - day + 7) % 7 || 7;
      target = addDays(now, daysUntilSaturday);
    }
    const updatedStr = formatOutput(target, hour12, minute, ampm);
    onChange?.(updatedStr);
    setViewMonth(target);
  };

  // Build calendar matrix
  const daysInMonthMatrix = React.useMemo(() => {
    const startOfCurrentMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const endOfCurrentMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0);

    const startDate = startOfWeek(startOfCurrentMonth, { weekStartsOn: 0 });
    const endDate = endOfWeek(endOfCurrentMonth, { weekStartsOn: 0 });

    const rows: Date[][] = [];
    let days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }

    return rows;
  }, [viewMonth]);

  // Formatted trigger display string
  const displayText = React.useMemo(() => {
    if (!selectedDate) return "";
    try {
      if (showTime) {
        return format(selectedDate, "EEE, MMM d, yyyy • h:mm a");
      }
      return format(selectedDate, "EEE, MMM d, yyyy");
    } catch {
      return value;
    }
  }, [selectedDate, showTime, value]);

  const hoursList = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
  const minutesList = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-11 w-full items-center justify-between rounded-xl border border-[#d5d5d4] bg-white px-3.5 text-left text-sm text-[#2c2e2a] shadow-xs transition-all duration-200",
              "hover:border-[#a0a29f]",
              "focus:outline-none focus:border-[#4285F4] focus:ring-3 focus:ring-[#4285F4]/20",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#f5f1e4]/50 cursor-pointer",
              !displayText && "text-[#80827f]"
            )}
          >
            <div className="flex items-center gap-2.5 truncate">
              <CalendarIcon className="h-4 w-4 text-[#4285F4] shrink-0" />
              <span className="truncate">{displayText || placeholder}</span>
            </div>

            <div className="flex items-center gap-1.5 ml-2 shrink-0">
              {value && !disabled && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => e.key === "Enter" && handleClear(e as any)}
                  className="p-1 rounded-md hover:bg-[#f5f1e4] text-[#80827f] hover:text-[#2c2e2a] transition cursor-pointer"
                  title="Clear"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              {showTime && (
                <Clock className="h-3.5 w-3.5 text-[#80827f]" />
              )}
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-auto p-0 rounded-2xl border border-[#d5d5d4] shadow-2xl bg-white text-[#2c2e2a] z-[9999] overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#e5e1d5]">
            {/* LEFT: CALENDAR PANEL */}
            <div className="p-4 sm:p-5 w-[300px]">
              {/* Month Navigation */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#f0eee6]">
                <button
                  type="button"
                  onClick={() => setViewMonth(subMonths(viewMonth, 1))}
                  className="p-1.5 rounded-lg border border-[#d5d5d4] hover:bg-[#f5f1e4] text-[#2c2e2a] transition cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="text-sm font-semibold text-[#2c2e2a]">
                  {format(viewMonth, "MMMM yyyy")}
                </div>

                <button
                  type="button"
                  onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                  className="p-1.5 rounded-lg border border-[#d5d5d4] hover:bg-[#f5f1e4] text-[#2c2e2a] transition cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
                  <div key={dayName} className="text-[11px] font-semibold text-[#80827f] py-1">
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1">
                {daysInMonthMatrix.flat().map((d, index) => {
                  const isCurrentMonth = isSameMonth(d, viewMonth);
                  const isSelected = selectedDate ? isSameDay(d, selectedDate) : false;
                  const isToday = isSameDay(d, new Date());

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectDay(d)}
                      className={cn(
                        "h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs font-medium transition cursor-pointer relative",
                        !isCurrentMonth && "text-[#b0b2af] opacity-40 hover:opacity-80",
                        isCurrentMonth && !isSelected && "text-[#2c2e2a] hover:bg-[#f5f1e4]",
                        isSelected && "bg-[#4285F4] text-white font-semibold shadow-xs hover:bg-[#3367D6]",
                        isToday && !isSelected && "border border-[#4285F4] text-[#4285F4] font-semibold"
                      )}
                    >
                      {format(d, "d")}
                    </button>
                  );
                })}
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[#f0eee6]">
                <button
                  type="button"
                  onClick={() => handlePreset("today")}
                  className="flex-1 py-1 px-2 rounded-lg bg-[#faf9f6] border border-[#d5d5d4] hover:bg-[#f5f1e4] text-[11px] font-medium text-[#2c2e2a] transition cursor-pointer text-center"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset("tomorrow")}
                  className="flex-1 py-1 px-2 rounded-lg bg-[#faf9f6] border border-[#d5d5d4] hover:bg-[#f5f1e4] text-[11px] font-medium text-[#2c2e2a] transition cursor-pointer text-center"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset("weekend")}
                  className="flex-1 py-1 px-2 rounded-lg bg-[#faf9f6] border border-[#d5d5d4] hover:bg-[#f5f1e4] text-[11px] font-medium text-[#2c2e2a] transition cursor-pointer text-center"
                >
                  Weekend
                </button>
              </div>
            </div>

            {/* RIGHT: TIME PANEL (If showTime is true) */}
            {showTime && (
              <div className="p-4 sm:p-5 w-[200px] flex flex-col justify-between bg-[#faf9f6]/60">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#f0eee6]">
                    <Clock className="h-4 w-4 text-[#4285F4]" />
                    <span className="text-xs font-bold text-[#2c2e2a] uppercase tracking-wider">
                      Event Time
                    </span>
                  </div>

                  {/* AM / PM Segmented Control */}
                  <div className="grid grid-cols-2 p-1 rounded-xl bg-white border border-[#d5d5d4] shadow-2xs">
                    {(["AM", "PM"] as const).map((mer) => (
                      <button
                        key={mer}
                        type="button"
                        onClick={() => handleTimeChange(hour12, minute, mer)}
                        className={cn(
                          "py-1 text-xs font-bold rounded-lg transition-all cursor-pointer text-center",
                          ampm === mer
                            ? "bg-[#4285F4] text-white shadow-xs"
                            : "text-[#80827f] hover:text-[#2c2e2a]"
                        )}
                      >
                        {mer}
                      </button>
                    ))}
                  </div>

                  {/* Hour and Minute Selectors */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Hours */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#80827f] uppercase block">
                        Hour
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={hour12}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setHour12("");
                              return;
                            }
                            const num = Math.min(12, Math.max(1, parseInt(val, 10) || 1));
                            handleTimeChange(num.toString().padStart(2, "0"), minute, ampm);
                          }}
                          className="w-full h-9 rounded-xl border border-[#d5d5d4] bg-white px-3 text-xs font-semibold text-[#2c2e2a] outline-none focus:border-[#4285F4] text-center"
                        />
                      </div>
                    </div>

                    {/* Minutes */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#80827f] uppercase block">
                        Min
                      </span>
                      <div className="relative">
                        <input
                          type="number"
                          min={0}
                          max={59}
                          step={5}
                          value={minute}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setMinute("");
                              return;
                            }
                            const num = Math.min(59, Math.max(0, parseInt(val, 10) || 0));
                            handleTimeChange(hour12, num.toString().padStart(2, "0"), ampm);
                          }}
                          className="w-full h-9 rounded-xl border border-[#d5d5d4] bg-white px-3 text-xs font-semibold text-[#2c2e2a] outline-none focus:border-[#4285F4] text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quick Time Slots */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#80827f] uppercase block">
                      Common Slots
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {[
                        { label: "10:00 AM (Morning)", h: "10", m: "00", mer: "AM" as const },
                        { label: "02:00 PM (Afternoon)", h: "02", m: "00", mer: "PM" as const },
                        { label: "06:00 PM (Evening)", h: "06", m: "00", mer: "PM" as const },
                      ].map((slot) => (
                        <button
                          key={slot.label}
                          type="button"
                          onClick={() => handleTimeChange(slot.h, slot.m, slot.mer)}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition cursor-pointer truncate",
                            hour12 === slot.h && minute === slot.m && ampm === slot.mer
                              ? "bg-[#4285F4]/10 border-[#4285F4] text-[#4285F4]"
                              : "bg-white border-[#d5d5d4]/60 text-[#2c2e2a] hover:bg-[#f5f1e4]"
                          )}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Done Button */}
                <div className="pt-4 border-t border-[#f0eee6]">
                  <Button
                    type="button"
                    variant="google"
                    onClick={() => setOpen(false)}
                    className="w-full h-8 rounded-lg text-xs font-semibold"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default DateTimePicker;
