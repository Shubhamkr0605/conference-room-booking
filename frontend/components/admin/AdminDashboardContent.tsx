"use client";

import { useEffect, useState } from "react";

import {
  Users,
  Building2,
  CalendarDays,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MapPin,
  BarChart3,
  AlertCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =====================================================
   TYPES
===================================================== */

interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  activeRooms: number;
  inactiveRooms: number;

  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;

  todayBookings: number;
}

interface DashboardBooking {
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

  room: {
    _id: string;
    name: string;
    location: string;
  } | null;

  user: {
    _id: string;
    name: string;
    email: string;
    department?: string;
  } | null;
}

interface RoomUtilization {
  roomId: string;
  roomName: string;
  location: string;
  bookingCount: number;
  percentage: number;
}

interface DashboardResponse {
  success: boolean;

  stats: DashboardStats;

  recentBookings:
    | DashboardBooking[]
    | undefined;

  roomUtilization:
    | RoomUtilization[]
    | undefined;

  message?: string;
}

/* =====================================================
   HELPERS
===================================================== */

function formatDate(
  dateString: string
) {
  const date = new Date(
    `${dateString}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

function formatStatus(
  status: DashboardBooking["status"]
) {
  if (status === "UPCOMING") {
    return "UPCOMING";
  }

  if (status === "COMPLETED") {
    return "COMPLETED";
  }

  return "CANCELLED";
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AdminDashboardContent() {
  const [stats, setStats] =
    useState<DashboardStats | null>(
      null
    );

  const [recentBookings, setRecentBookings] =
    useState<DashboardBooking[]>(
      []
    );

  const [
    roomUtilization,
    setRoomUtilization,
  ] = useState<RoomUtilization[]>(
    []
  );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ===================================================
     FETCH DASHBOARD
  =================================================== */

  async function fetchDashboard(
    showRefresh = false
  ) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_URL}/api/admin/dashboard`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const result: DashboardResponse =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Failed to load dashboard"
        );

        return;
      }

      if (!result.success) {
        setError(
          result.message ||
            "Failed to load dashboard"
        );

        return;
      }

      setStats(result.stats);

      setRecentBookings(
        result.recentBookings || []
      );

      setRoomUtilization(
        result.roomUtilization || []
      );
    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 lg:p-8">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">

            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-gray-500"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading dashboard...
            </p>

          </div>
        </div>
      </main>
    );
  }

  /* ===================================================
     ERROR
  =================================================== */

  if (error && !stats) {
    return (
      <main className="min-h-screen bg-gray-50 p-6 lg:p-8">

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertCircle
                size={24}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchDashboard()
              }
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  if (!stats) {
    return null;
  }

  /* ===================================================
     UI
  =================================================== */

  return (
    <main className="min-h-screen bg-gray-50 p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Overview of your conference room booking system.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            fetchDashboard(true)
          }
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}

        </button>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="font-bold"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          TOP STATISTICS
      ================================================= */}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Users */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Registered employees
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <Users
                size={21}
                className="text-gray-700"
              />
            </div>

          </div>

        </div>

        {/* Total Rooms */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Rooms
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalRooms}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {stats.activeRooms} currently active
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <Building2
                size={21}
                className="text-gray-700"
              />
            </div>

          </div>

        </div>

        {/* Total Bookings */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Bookings
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.totalBookings}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                All reservations
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <CalendarDays
                size={21}
                className="text-gray-700"
              />
            </div>

          </div>

        </div>

        {/* Upcoming */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Upcoming
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {stats.upcomingBookings}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Upcoming reservations
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <Clock3
                size={21}
                className="text-gray-700"
              />
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          SECONDARY STATISTICS
      ================================================= */}

      <div className="mt-5 grid gap-5 md:grid-cols-3">

        {/* Today */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <CalendarDays
                size={21}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Today's Bookings
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {stats.todayBookings}
              </p>
            </div>

          </div>

        </div>

        {/* Completed */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2
                size={21}
                className="text-green-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Completed Bookings
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {stats.completedBookings}
              </p>
            </div>

          </div>

        </div>

        {/* Cancelled */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
              <XCircle
                size={21}
                className="text-red-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Cancelled Bookings
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {stats.cancelledBookings}
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">

        {/* =================================================
            RECENT BOOKINGS
        ================================================= */}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <CalendarDays
                  size={18}
                  className="text-gray-700"
                />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Recent Bookings
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Latest room reservations
                </p>
              </div>

            </div>

          </div>

          {recentBookings.length ===
          0 ? (

            <div className="p-10 text-center">

              <CalendarDays
                size={35}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-medium text-gray-600">
                No bookings yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Recent bookings will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[720px]">

                <thead>

                  <tr className="border-b border-gray-100 bg-gray-50/70 text-left">

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Employee
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Room
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Time
                    </th>

                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentBookings.map(
                    (booking) => (
                      <tr
                        key={
                          booking._id
                        }
                        className="border-b border-gray-100 last:border-0"
                      >

                        {/* Employee */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-gray-900">
                            {booking.user
                              ?.name ||
                              "Unknown User"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {booking.user
                              ?.email ||
                              "—"}
                          </p>

                        </td>

                        {/* Room */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-semibold text-gray-900">
                            {booking.room
                              ?.name ||
                              "Unknown Room"}
                          </p>

                          {booking.room
                            ?.location && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">

                              <MapPin
                                size={
                                  11
                                }
                              />

                              {
                                booking
                                  .room
                                  .location
                              }

                            </div>
                          )}

                        </td>

                        {/* Date */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {formatDate(
                            booking.date
                          )}
                        </td>

                        {/* Time */}

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {booking.startTime}
                          {" - "}
                          {booking.endTime}
                        </td>

                        {/* Status */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              booking.status ===
                              "UPCOMING"
                                ? "bg-blue-50 text-blue-600"
                                : booking.status ===
                                    "COMPLETED"
                                  ? "bg-green-50 text-green-600"
                                  : "bg-red-50 text-red-600"
                            }`}
                          >
                            {formatStatus(
                              booking.status
                            )}
                          </span>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

        {/* =================================================
            ROOM UTILIZATION
        ================================================= */}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 px-5 py-5">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <BarChart3
                  size={18}
                  className="text-gray-700"
                />
              </div>

              <div>
                <h2 className="font-bold text-gray-900">
                  Room Utilization
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Bookings by room
                </p>
              </div>

            </div>

          </div>

          {roomUtilization.length ===
          0 ? (

            <div className="p-10 text-center">

              <Building2
                size={35}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-medium text-gray-600">
                No room data yet
              </p>

            </div>

          ) : (

            <div className="space-y-6 p-5">

              {roomUtilization.map(
                (room) => (
                  <div
                    key={
                      room.roomId
                    }
                  >

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-gray-900">
                          {
                            room.roomName
                          }
                        </p>

                        <p className="mt-1 truncate text-xs text-gray-500">
                          {
                            room.location
                          }
                        </p>

                      </div>

                      <span className="shrink-0 text-sm font-bold text-gray-700">
                        {
                          room.bookingCount
                        }
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

                      <div
                        className="h-full rounded-full bg-gray-900 transition-all"
                        style={{
                          width: `${room.percentage}%`,
                        }}
                      />

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  );
}