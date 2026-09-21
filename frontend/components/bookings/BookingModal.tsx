"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  useForm,
} from "react-hook-form";
import { z } from "zod";

import BookingSuccess from "./BookingSuccess";

/* =====================================================
   API
===================================================== */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =====================================================
   PROPS
===================================================== */

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;

  /*
   * Real MongoDB Room ID
   */
  roomId: string;

  /*
   * Room name displayed in the UI
   */
  roomName: string;

  /*
   * Date selected from dashboard
   */
  selectedDate: string;
}

/* =====================================================
   VALIDATION
===================================================== */

const bookingSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(
        3,
        "Meeting title must be at least 3 characters"
      )
      .max(
        100,
        "Meeting title cannot exceed 100 characters"
      ),

    date: z
      .string()
      .min(
        1,
        "Please select a date"
      ),

    startTime: z
      .string()
      .min(
        1,
        "Please select a start time"
      ),

    endTime: z
      .string()
      .min(
        1,
        "Please select an end time"
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description cannot exceed 500 characters"
      )
      .optional(),
  })
  .refine(
    (data) =>
      data.endTime > data.startTime,
    {
      message:
        "End time must be after start time",
      path: ["endTime"],
    }
  );

type BookingFormData =
  z.infer<typeof bookingSchema>;

/* =====================================================
   COMPONENT
===================================================== */

export default function BookingModal({
  isOpen,
  onClose,
  roomId,
  roomName,
  selectedDate,
}: BookingModalProps) {
  const [
    bookingCompleted,
    setBookingCompleted,
  ] = useState(false);

  const [
    completedBooking,
    setCompletedBooking,
  ] = useState<BookingFormData | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<BookingFormData>({
    resolver:
      zodResolver(bookingSchema),

    defaultValues: {
      title: "",
      date: selectedDate,
      startTime: "10:00",
      endTime: "11:00",
      description: "",
    },
  });

  /* ===================================================
     KEEP DATE SYNCHRONIZED
  =================================================== */

  useEffect(() => {
    if (isOpen) {
      setValue(
        "date",
        selectedDate
      );
    }
  }, [
    isOpen,
    selectedDate,
    setValue,
  ]);

  /* ===================================================
     CLOSE WHEN NOT OPEN
  =================================================== */

  if (!isOpen) {
    return null;
  }

  /* ===================================================
     SUBMIT BOOKING
  =================================================== */

  async function onSubmit(
    data: BookingFormData
  ) {
    try {
      /* ---------------------------------------------
         CHECK ROOM ID
      --------------------------------------------- */

      if (!roomId) {
        setError(
          "root.serverError",
          {
            type: "manual",
            message:
              "Unable to identify the selected room.",
          }
        );

        return;
      }

      /* ---------------------------------------------
         SEND REAL API REQUEST
      --------------------------------------------- */

      const response = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            roomId,

            title:
              data.title.trim(),

            date: data.date,

            startTime:
              data.startTime,

            endTime:
              data.endTime,

            description:
              data.description?.trim() ||
              undefined,
          }),
        }
      );

      /* ---------------------------------------------
         PARSE RESPONSE
      --------------------------------------------- */

      const result =
        await response.json();

      /* ---------------------------------------------
         API ERROR
      --------------------------------------------- */

      if (!response.ok) {
        setError(
          "root.serverError",
          {
            type: "server",
            message:
              result.message ||
              "Unable to create booking.",
          }
        );

        return;
      }

      /* ---------------------------------------------
         SUCCESS
      --------------------------------------------- */

      setCompletedBooking(data);

      setBookingCompleted(true);

      reset();
    } catch (error) {
      console.error(
        "Booking request failed:",
        error
      );

      setError(
        "root.serverError",
        {
          type: "server",
          message:
            "Unable to connect to the booking server. Please try again.",
        }
      );
    }
  }

  /* ===================================================
     CLOSE MODAL
  =================================================== */

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    reset();

    setBookingCompleted(false);

    setCompletedBooking(null);

    onClose();
  }

  /* ===================================================
     BOOKING SUCCESS
  =================================================== */

  if (
    bookingCompleted &&
    completedBooking
  ) {
    return (
      <BookingSuccess
        roomName={roomName}
        title={
          completedBooking.title
        }
        date={
          completedBooking.date
        }
        startTime={
          completedBooking.startTime
        }
        endTime={
          completedBooking.endTime
        }
        onClose={handleClose}
      />
    );
  }

  /* ===================================================
     BOOKING FORM
  =================================================== */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* =========================================
            HEADER
        ========================================= */}

        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-600">
              New Booking
            </p>

            <h2
              id="booking-modal-title"
              className="mt-1 text-2xl font-bold text-gray-900"
            >
              Book Conference Room
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close booking modal"
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* =========================================
            FORM
        ========================================= */}

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-5 p-6"
        >

          {/* =======================================
              SERVER ERROR
          ======================================= */}

          {errors.root?.serverError
            ?.message && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">
                {
                  errors.root
                    .serverError
                    .message
                }
              </p>
            </div>
          )}

          {/* =======================================
              ROOM
          ======================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Conference Room
            </label>

            <div className="rounded-xl bg-rose-50 px-4 py-3 font-semibold text-gray-900">
              {roomName}
            </div>
          </div>

          {/* =======================================
              TITLE
          ======================================= */}

          <div>
            <label
              htmlFor="meeting-title"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Meeting Title
            </label>

            <input
              id="meeting-title"
              type="text"
              placeholder="e.g. Project Discussion"
              {...register("title")}
              className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                errors.title
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-rose-500 focus:ring-rose-100"
              }`}
            />

            {errors.title && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {
                  errors.title
                    .message
                }
              </p>
            )}
          </div>

          {/* =======================================
              DATE
          ======================================= */}

          <div>
            <label
              htmlFor="booking-date"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Date
            </label>

            <div className="relative">
              <CalendarDays
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                id="booking-date"
                type="date"
                {...register("date")}
                className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm transition focus:outline-none focus:ring-2 ${
                  errors.date
                    ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                    : "border-gray-200 focus:border-rose-500 focus:ring-rose-100"
                }`}
              />
            </div>

            {errors.date && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {
                  errors.date
                    .message
                }
              </p>
            )}
          </div>

          {/* =======================================
              TIME
          ======================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* START */}

            <div>
              <label
                htmlFor="start-time"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Start Time
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="start-time"
                  type="time"
                  {...register(
                    "startTime"
                  )}
                  className={`w-full rounded-xl border py-3 pl-11 pr-3 text-sm transition focus:outline-none focus:ring-2 ${
                    errors.startTime
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-rose-500 focus:ring-rose-100"
                  }`}
                />
              </div>

              {errors.startTime && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {
                    errors.startTime
                      .message
                  }
                </p>
              )}
            </div>

            {/* END */}

            <div>
              <label
                htmlFor="end-time"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                End Time
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="end-time"
                  type="time"
                  {...register(
                    "endTime"
                  )}
                  className={`w-full rounded-xl border py-3 pl-11 pr-3 text-sm transition focus:outline-none focus:ring-2 ${
                    errors.endTime
                      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                      : "border-gray-200 focus:border-rose-500 focus:ring-rose-100"
                  }`}
                />
              </div>

              {errors.endTime && (
                <p className="mt-1.5 text-xs font-medium text-red-500">
                  {
                    errors.endTime
                      .message
                  }
                </p>
              )}
            </div>
          </div>

          {/* =======================================
              DESCRIPTION
          ======================================= */}

          <div>
            <label
              htmlFor="booking-description"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Description
            </label>

            <textarea
              id="booking-description"
              rows={3}
              placeholder="Add meeting details..."
              {...register(
                "description"
              )}
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                errors.description
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-200 focus:border-rose-500 focus:ring-rose-100"
              }`}
            />

            {errors.description && (
              <p className="mt-1.5 text-xs font-medium text-red-500">
                {
                  errors
                    .description
                    .message
                }
              </p>
            )}
          </div>

          {/* =======================================
              BUTTONS
          ======================================= */}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Booking...
                </>
              ) : (
                "Book Room"
              )}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}