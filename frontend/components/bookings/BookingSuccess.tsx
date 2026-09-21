"use client";

import {
  CalendarDays,
  Check,
  Clock,
  MapPin,
} from "lucide-react";

interface BookingSuccessProps {
  roomName: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  onClose: () => void;
}

export default function BookingSuccess({
  roomName,
  title,
  date,
  startTime,
  endTime,
  onClose,
}: BookingSuccessProps) {
  const formattedDate = new Date(
    `${date}T00:00:00`
  ).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-success-title"
    >
      <div className="max-h-screen w-full max-w-lg overflow-y-auto rounded-3xl bg-white shadow-2xl">

        {/* Success Header */}
        <div className="bg-emerald-700 px-6 py-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white">
            <Check
              size={34}
              strokeWidth={3}
              className="text-emerald-700"
            />
          </div>

          <h2
            id="booking-success-title"
            className="mt-5 text-2xl font-bold"
          >
            Booking Confirmed!
          </h2>

          <p className="mt-2 text-sm text-white opacity-80">
            Your conference room has been booked
            successfully.
          </p>
        </div>

        {/* Success Content */}
        <div className="p-6">

          {/* Message */}
          <div className="mb-6 text-center">
            <p className="text-lg font-bold text-gray-900">
              See you there! 👋
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Please arrive on time for your meeting.
            </p>
          </div>

          {/* Booking Details */}
          <div className="rounded-2xl bg-rose-50 p-5">

            {/* Conference Room */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Conference Room
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {roomName}
              </p>
            </div>

            {/* Meeting */}
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Meeting
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {title}
              </p>
            </div>

            {/* Date */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <CalendarDays
                  size={18}
                  className="text-rose-600"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Date
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {formattedDate}
                </p>
              </div>
            </div>

            {/* Time */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <Clock
                  size={18}
                  className="text-yellow-700"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Time
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {startTime} – {endTime}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                <MapPin
                  size={18}
                  className="text-emerald-700"
                />
              </div>

              <div>
                <p className="text-xs text-gray-400">
                  Location
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  Main Office
                </p>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="mt-5 rounded-xl border border-rose-100 px-4 py-3 text-center">
            <p className="text-sm font-medium text-gray-600">
              Your meeting is scheduled. See you there
              on time! 😊
            </p>
          </div>

          {/* Done Button */}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-gray-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-gray-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}