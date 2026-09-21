"use client";

import {
  CalendarDays,
  Clock,
  Loader2,
  MapPin,
  RefreshCw,
  User,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =====================================================
   TYPES
===================================================== */

interface BookingUser {
  _id: string;
  name: string;
  email: string;
  department?: string;
  role?: "ADMIN" | "EMPLOYEE";
}

interface BookingRoom {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
}

interface Booking {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  status:
    | "UPCOMING"
    | "COMPLETED"
    | "CANCELLED";

  user: BookingUser;
  room: BookingRoom;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AdminBookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>(
    []
  );

  const [bookingToCancel, setBookingToCancel] =
    useState<Booking | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [error, setError] = useState("");

  /* =====================================================
     FETCH ALL BOOKINGS
  ===================================================== */

  async function fetchBookings() {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/admin`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to load bookings."
        );
      }

      setBookings(data.bookings || []);
    } catch (error) {
      console.error(
        "Fetch admin bookings error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load bookings."
      );
    } finally {
      setIsLoading(false);
    }
  }

  /* =====================================================
     LOAD BOOKINGS
  ===================================================== */

  useEffect(() => {
    fetchBookings();
  }, []);

  /* =====================================================
     CANCEL BOOKING
  ===================================================== */

  async function confirmCancellation() {
    if (!bookingToCancel) {
      return;
    }

    try {
      setIsCancelling(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/bookings/${bookingToCancel._id}/admin-cancel`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to cancel booking."
        );
      }

      /* Update UI immediately */

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === bookingToCancel._id
            ? {
                ...booking,
                status: "CANCELLED",
              }
            : booking
        )
      );

      setBookingToCancel(null);
    } catch (error) {
      console.error(
        "Admin cancel booking error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to cancel booking."
      );
    } finally {
      setIsCancelling(false);
    }
  }

  /* =====================================================
     FORMAT DATE
  ===================================================== */

  function formatBookingDate(date: string) {
    try {
      return format(
        parseISO(date),
        "MMM d, yyyy"
      );
    } catch {
      return date;
    }
  }

  /* =====================================================
     FORMAT TIME
  ===================================================== */

  function formatBookingTime(time: string) {
    try {
      const [hours, minutes] =
        time.split(":").map(Number);

      const date = new Date();

      date.setHours(
        hours,
        minutes,
        0,
        0
      );

      return format(date, "h:mm a");
    } catch {
      return time;
    }
  }

  /* =====================================================
     STATUS STYLE
  ===================================================== */

  function getStatusStyle(
    status: Booking["status"]
  ) {
    switch (status) {
      case "UPCOMING":
        return "bg-emerald-50 text-emerald-700";

      case "COMPLETED":
        return "bg-gray-100 text-gray-600";

      case "CANCELLED":
        return "bg-red-50 text-red-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="min-h-screen p-5 md:p-8 lg:p-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
            Administration
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            All Bookings
          </h1>

          <p className="mt-2 text-gray-600">
            Manage conference room reservations
            across the organization.
          </p>

        </div>

        <button
          type="button"
          onClick={fetchBookings}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={
              isLoading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      {!isLoading && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Total Bookings
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {bookings.length}
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {
                bookings.filter(
                  (booking) =>
                    booking.status ===
                    "UPCOMING"
                ).length
              }
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-700">
              {
                bookings.filter(
                  (booking) =>
                    booking.status ===
                    "COMPLETED"
                ).length
              }
            </p>

          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-gray-500">
              Cancelled
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {
                bookings.filter(
                  (booking) =>
                    booking.status ===
                    "CANCELLED"
                ).length
              }
            </p>

          </div>

        </div>
      )}

      {/* =================================================
          LOADING
      ================================================= */}

      {isLoading ? (
        <div className="flex min-h-[350px] items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col items-center gap-3 text-gray-500">

            <Loader2
              size={32}
              className="animate-spin"
            />

            <p className="text-sm font-medium">
              Loading bookings...
            </p>

          </div>

        </div>
      ) : bookings.length === 0 ? (

        /* =================================================
           EMPTY
        ================================================= */

        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

          <CalendarDays
            size={44}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            No Bookings Found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            There are currently no room bookings.
          </p>

        </div>
      ) : (

        /* =================================================
           BOOKINGS
        ================================================= */

        <div className="space-y-5">

          {bookings.map((booking) => (

            <div
              key={booking._id}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >

              <div className="flex flex-col gap-6">

                {/* =========================================
                    TOP
                ========================================= */}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h2 className="text-xl font-bold text-gray-900">
                        {booking.title}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>

                    </div>

                    <p className="mt-1 font-semibold text-gray-700">
                      {booking.room?.name ||
                        "Conference Room"}
                    </p>

                  </div>

                  {booking.status ===
                    "UPCOMING" && (
                    <button
                      type="button"
                      onClick={() =>
                        setBookingToCancel(
                          booking
                        )
                      }
                      className="shrink-0 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  )}

                </div>

                {/* =========================================
                    DETAILS
                ========================================= */}

                <div className="grid gap-4 border-t border-gray-100 pt-5 md:grid-cols-2 xl:grid-cols-4">

                  {/* Employee */}

                  <div className="flex items-start gap-3">

                    <div className="rounded-lg bg-gray-100 p-2">
                      <User
                        size={17}
                        className="text-gray-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Employee
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {booking.user?.name ||
                          "Unknown User"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {booking.user?.email ||
                          "No email"}
                      </p>

                    </div>

                  </div>

                  {/* Date */}

                  <div className="flex items-start gap-3">

                    <div className="rounded-lg bg-gray-100 p-2">
                      <CalendarDays
                        size={17}
                        className="text-gray-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatBookingDate(
                          booking.date
                        )}
                      </p>

                    </div>

                  </div>

                  {/* Time */}

                  <div className="flex items-start gap-3">

                    <div className="rounded-lg bg-gray-100 p-2">
                      <Clock
                        size={17}
                        className="text-gray-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatBookingTime(
                          booking.startTime
                        )}
                        {" - "}
                        {formatBookingTime(
                          booking.endTime
                        )}
                      </p>

                    </div>

                  </div>

                  {/* Location */}

                  <div className="flex items-start gap-3">

                    <div className="rounded-lg bg-gray-100 p-2">
                      <MapPin
                        size={17}
                        className="text-gray-600"
                      />
                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                        Location
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {booking.room?.location ||
                          "Unknown Location"}
                      </p>

                    </div>

                  </div>

                </div>

                {/* =========================================
                    DESCRIPTION
                ========================================= */}

                {booking.description && (
                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm text-gray-600">
                      {booking.description}
                    </p>

                  </div>
                )}

              </div>

            </div>

          ))}

        </div>
      )}

      {/* =================================================
          CANCEL CONFIRMATION
      ================================================= */}

      {bookingToCancel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-cancel-title"
        >

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2
                  id="admin-cancel-title"
                  className="text-xl font-bold text-gray-900"
                >
                  Cancel Booking?
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  This will cancel the employee's
                  reservation.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  !isCancelling &&
                  setBookingToCancel(null)
                }
                disabled={isCancelling}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                aria-label="Close"
              >
                <X size={20} />
              </button>

            </div>

            <div className="mt-5 rounded-xl bg-gray-50 p-4">

              <p className="font-bold text-gray-900">
                {bookingToCancel.title}
              </p>

              <p className="mt-1 text-sm font-semibold text-gray-600">
                {bookingToCancel.room?.name}
              </p>

              <p className="mt-2 text-sm text-gray-500">
                {bookingToCancel.user?.name}
              </p>

              <p className="text-sm text-gray-500">
                {formatBookingDate(
                  bookingToCancel.date
                )}
              </p>

              <p className="text-sm text-gray-500">
                {formatBookingTime(
                  bookingToCancel.startTime
                )}
                {" - "}
                {formatBookingTime(
                  bookingToCancel.endTime
                )}
              </p>

            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                onClick={() =>
                  setBookingToCancel(null)
                }
                disabled={isCancelling}
                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Keep Booking
              </button>

              <button
                type="button"
                onClick={confirmCancellation}
                disabled={isCancelling}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isCancelling && (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                )}

                {isCancelling
                  ? "Cancelling..."
                  : "Cancel Booking"}

              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}