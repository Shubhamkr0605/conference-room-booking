"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  addDays,
  format,
  isToday,
} from "date-fns";

interface DateNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function DateNavigation({
  selectedDate,
  onDateChange,
}: DateNavigationProps) {
  const goToPreviousDay = () => {
    onDateChange(
      addDays(selectedDate, -1)
    );
  };

  const goToNextDay = () => {
    onDateChange(
      addDays(selectedDate, 1)
    );
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Previous Day */}
      <button
        type="button"
        onClick={goToPreviousDay}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-50"
        aria-label="Previous day"
      >
        <ChevronLeft size={20} />
      </button>

      {/* Selected Date */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          {isToday(selectedDate)
            ? "Today"
            : "Selected Date"}
        </p>

        <p className="mt-1 text-lg font-bold text-gray-900">
          {format(
            selectedDate,
            "MMMM d, yyyy"
          )}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {format(
            selectedDate,
            "EEEE"
          )}
        </p>

        {!isToday(selectedDate) && (
          <button
            type="button"
            onClick={goToToday}
            className="mt-2 text-xs font-semibold text-[#d65345] hover:underline"
          >
            Back to Today
          </button>
        )}
      </div>

      {/* Next Day */}
      <button
        type="button"
        onClick={goToNextDay}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 transition hover:bg-gray-50"
        aria-label="Next day"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}