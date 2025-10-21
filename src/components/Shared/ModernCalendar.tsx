import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface ModernCalendarProps {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
}

export default function ModernCalendar({ selected, onSelect, className }: ModernCalendarProps) {
  return (
    <div className={cn("p-4", className)}>
      <Calendar
        mode="single"
        selected={selected}
        onSelect={onSelect}
        className={cn(
          "rounded-xl border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900",
          "p-4"
        )}
        classNames={{
          months: "space-y-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center text-lg font-bold text-slate-800 dark:text-white",
          caption_label: "text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-8 w-8 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600",
            "hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900",
            "rounded-full transition-all duration-200 hover:scale-110 shadow-md"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-slate-500 dark:text-slate-400 rounded-md w-8 font-semibold text-sm uppercase tracking-wider",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
            "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            "h-10 w-10 p-0 font-semibold rounded-full transition-all duration-200",
            "hover:bg-gradient-to-r hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900",
            "hover:scale-110 hover:shadow-lg",
            "focus:bg-gradient-to-r focus:from-blue-200 focus:to-purple-200 dark:focus:from-blue-800 dark:focus:to-purple-800",
            "aria-selected:bg-gradient-to-r aria-selected:from-blue-500 aria-selected:to-purple-600",
            "aria-selected:text-white aria-selected:shadow-lg aria-selected:scale-110"
          ),
          day_selected: cn(
            "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-110",
            "hover:from-blue-600 hover:to-purple-700"
          ),
          day_today: "bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 text-orange-700 dark:text-orange-300 font-bold ring-2 ring-orange-300 dark:ring-orange-700",
          day_outside: "text-slate-400 dark:text-slate-600 opacity-50",
          day_disabled: "text-slate-400 dark:text-slate-600 opacity-30",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
      />
    </div>
  );
}