"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type ReportPeriod = "today" | "week" | "month" | "all";

interface Summary {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

interface RoomUtilization {
  roomId: string;
  roomName: string;
  location: string;
  bookingCount: number;
  utilizationPercentage: number;
}

interface EmployeeActivity {
  userId: string;
  name: string;
  email: string;
  department?: string;
  bookingCount: number;
}

interface DailyBooking {
  date: string;
  bookingCount: number;
}

interface RecentBooking {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  user: {
    _id: string;
    name: string;
    email: string;
    department?: string;
  } | null;
  room: {
    _id: string;
    name: string;
    location: string;
  } | null;
}

interface ReportResponse {
  success: boolean;
  period: ReportPeriod;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  summary: Summary;
  roomUtilization: RoomUtilization[];
  employeeActivity: EmployeeActivity[];
  dailyBookings: DailyBooking[];
  recentBookings: RecentBooking[];
}

const periodLabels: Record<ReportPeriod, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  all: "All Time",
};

function formatDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateRange(
  start: string | null,
  end: string | null
) {
  if (!start || !end) {
    return "All available booking records";
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
}

function getStatusClasses(status: string) {
  switch (status) {
    case "UPCOMING":
      return "bg-blue-50 text-blue-700";

    case "COMPLETED":
      return "bg-green-50 text-green-700";

    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function AdminReportsContent() {
  const [period, setPeriod] =
    useState<ReportPeriod>("month");

  const [report, setReport] =
    useState<ReportResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const fetchReports = async (
    selectedPeriod: ReportPeriod = period
  ) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/reports?period=${selectedPeriod}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load reports"
        );
      }

      setReport(data);
    } catch (error) {
      console.error("Reports loading error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const maxDailyBookings = useMemo(() => {
    if (!report?.dailyBookings.length) {
      return 1;
    }

    return Math.max(
      ...report.dailyBookings.map(
        (item) => item.bookingCount
      ),
      1
    );
  }, [report]);

  const maxRoomBookings = useMemo(() => {
    if (!report?.roomUtilization.length) {
      return 1;
    }

    return Math.max(
      ...report.roomUtilization.map(
        (room) => room.bookingCount
      ),
      1
    );
  }, [report]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View conference room usage and booking activity.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View conference room usage and booking activity.
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 text-red-600" size={22} />

            <div>
              <p className="font-semibold text-red-700">
                Unable to load reports
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => fetchReports(period)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={24} className="text-gray-900" />

            <h1 className="text-2xl font-bold text-gray-900">
              Reports
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            View conference room usage, booking activity,
            and employee activity.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
            <CalendarDays
              size={17}
              className="text-gray-400"
            />

            <select
              value={period}
              onChange={(event) =>
                setPeriod(
                  event.target.value as ReportPeriod
                )
              }
              className="bg-transparent text-sm font-semibold text-gray-700 outline-none"
            >
              {Object.entries(periodLabels).map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                )
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchReports(period)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date range */}
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gray-100 p-2">
            <Clock3 size={18} className="text-gray-600" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Report Period
            </p>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {periodLabels[report.period]}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {formatDateRange(
                report.dateRange.start,
                report.dateRange.end
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Bookings"
          value={report.summary.totalBookings}
          icon={<FileText size={21} />}
          description="Bookings in selected period"
        />

        <SummaryCard
          title="Upcoming"
          value={report.summary.upcomingBookings}
          icon={<Clock3 size={21} />}
          description="Upcoming bookings"
        />

        <SummaryCard
          title="Completed"
          value={report.summary.completedBookings}
          icon={<CheckCircle2 size={21} />}
          description="Completed bookings"
        />

        <SummaryCard
          title="Cancelled"
          value={report.summary.cancelledBookings}
          icon={<XCircle size={21} />}
          description="Cancelled bookings"
        />
      </div>

      {/* Room utilization */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Room Utilization
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Booking activity by conference room.
            </p>
          </div>

          <TrendingUp
            size={22}
            className="text-gray-400"
          />
        </div>

        {report.roomUtilization.length === 0 ? (
          <EmptyState message="No room booking data available for this period." />
        ) : (
          <div className="mt-6 space-y-5">
            {report.roomUtilization.map((room) => (
              <div key={room.roomId}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {room.roomName}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {room.location}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {room.bookingCount}
                    </p>

                    <p className="text-xs text-gray-500">
                      {room.utilizationPercentage}%
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-900 transition-all"
                    style={{
                      width: `${Math.min(
                        room.utilizationPercentage,
                        100
                      )}%`,
                    }}
                  />
                </div>

                <p className="mt-1 text-right text-[11px] text-gray-400">
                  {Math.round(
                    (room.bookingCount /
                      maxRoomBookings) *
                      100
                  )}
                  % relative booking activity
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Daily trend */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Daily Booking Trend
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Number of bookings recorded for each day.
          </p>
        </div>

        {report.dailyBookings.length === 0 ? (
          <EmptyState message="No daily booking data available for this period." />
        ) : (
          <div className="mt-6 space-y-4">
            {report.dailyBookings.map((item) => {
              const width =
                (item.bookingCount /
                  maxDailyBookings) *
                100;

              return (
                <div
                  key={item.date}
                  className="grid grid-cols-[90px_1fr_40px] items-center gap-3"
                >
                  <span className="text-xs font-medium text-gray-500">
                    {formatDate(item.date)}
                  </span>

                  <div className="h-7 overflow-hidden rounded-lg bg-gray-100">
                    <div
                      className="flex h-full items-center rounded-lg bg-gray-900 px-3 text-xs font-semibold text-white transition-all"
                      style={{
                        width: `${Math.max(
                          width,
                          item.bookingCount > 0
                            ? 8
                            : 0
                        )}%`,
                      }}
                    >
                      {item.bookingCount > 0 &&
                        item.bookingCount}
                    </div>
                  </div>

                  <span className="text-right text-sm font-bold text-gray-900">
                    {item.bookingCount}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Employee activity */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Employee Activity
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Employees with the most bookings in the
              selected period.
            </p>
          </div>

          <Users
            size={22}
            className="text-gray-400"
          />
        </div>

        {report.employeeActivity.length === 0 ? (
          <EmptyState message="No employee booking activity available." />
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Employee
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Department
                  </th>

                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Bookings
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.employeeActivity.map(
                  (employee) => (
                    <tr
                      key={employee.userId}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {employee.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {employee.email}
                        </p>
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {employee.department || "-"}
                      </td>

                      <td className="py-4 text-right">
                        <span className="inline-flex min-w-10 justify-center rounded-lg bg-gray-100 px-2.5 py-1 text-sm font-bold text-gray-800">
                          {employee.bookingCount}
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

      {/* Recent bookings */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Recent Bookings
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Latest booking records from the selected
            period.
          </p>
        </div>

        {report.recentBookings.length === 0 ? (
          <EmptyState message="No bookings available for this period." />
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Booking
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Employee
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Room
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Date
                  </th>

                  <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Time
                  </th>

                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {report.recentBookings.map(
                  (booking) => (
                    <tr
                      key={booking._id}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-4">
                        <p className="text-sm font-semibold text-gray-900">
                          {booking.title}
                        </p>
                      </td>

                      <td className="py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.user?.name || "Unknown"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {booking.user?.email || "-"}
                        </p>
                      </td>

                      <td className="py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.room?.name || "Unknown"}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {booking.room?.location || "-"}
                        </p>
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {formatDate(booking.date)}
                      </td>

                      <td className="py-4 text-sm text-gray-600">
                        {booking.startTime} -{" "}
                        {booking.endTime}
                      </td>

                      <td className="py-4 text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            booking.status
                          )}`}
                        >
                          {booking.status}
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
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
}

function SummaryCard({
  title,
  value,
  description,
  icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-gray-100 p-2.5">
          {icon}
        </div>

        <span className="text-xs font-medium text-gray-400">
          Report
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-3xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function EmptyState({
  message,
}: {
  message: string;
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-sm text-gray-500">
        {message}
      </p>
    </div>
  );
}