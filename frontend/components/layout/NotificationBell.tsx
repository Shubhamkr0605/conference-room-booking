"use client";

import {
  Bell,
  Check,
  Loader2,
  X,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =====================================================
   TYPES
===================================================== */

interface NotificationBooking {
  _id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status:
    | "UPCOMING"
    | "COMPLETED"
    | "CANCELLED";
}

interface NotificationItem {
  _id: string;

  type:
    | "BOOKING_CREATED"
    | "BOOKING_CANCELLED"
    | "BOOKING_REMINDER"
    | "ROOM_AVAILABLE";

  title: string;

  message: string;

  booking?: NotificationBooking;

  isRead: boolean;

  createdAt: string;
}

interface NotificationsResponse {
  success: boolean;

  notifications: NotificationItem[];

  unreadCount: number;

  message?: string;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function NotificationBell() {
  const [open, setOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const containerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  /* ===================================================
     FETCH NOTIFICATIONS
  =================================================== */

  async function fetchNotifications() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/notifications`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result: NotificationsResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to load notifications"
        );
      }

      setNotifications(
        result.notifications || []
      );

      setUnreadCount(
        result.unreadCount || 0
      );
    } catch (error) {
      console.error(
        "Fetch notifications error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchNotifications();

    /*
     * Refresh periodically so the unread
     * count doesn't remain stale.
     */
    const interval =
      window.setInterval(
        fetchNotifications,
        30000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);

  /* ===================================================
     CLOSE WHEN CLICKING OUTSIDE
  =================================================== */

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* ===================================================
     MARK ONE AS READ
  =================================================== */

  async function markAsRead(
    id: string
  ) {
    try {
      const response =
        await fetch(
          `${API_URL}/api/notifications/${id}/read`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

      if (!response.ok) {
        return;
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification._id === id
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification
          )
      );

      setUnreadCount(
        (current) =>
          Math.max(
            0,
            current - 1
          )
      );
    } catch (error) {
      console.error(
        "Mark notification read error:",
        error
      );
    }
  }

  /* ===================================================
     MARK ALL AS READ
  =================================================== */

  async function markAllAsRead() {
    try {
      const response =
        await fetch(
          `${API_URL}/api/notifications/read-all`,
          {
            method: "PATCH",
            credentials: "include",
          }
        );

      if (!response.ok) {
        return;
      }

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          )
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Mark all notifications read error:",
        error
      );
    }
  }

  /* ===================================================
     DELETE NOTIFICATION
  =================================================== */

  async function deleteNotification(
    id: string
  ) {
    try {
      const notification =
        notifications.find(
          (item) =>
            item._id === id
        );

      const response =
        await fetch(
          `${API_URL}/api/notifications/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

      if (!response.ok) {
        return;
      }

      setNotifications(
        (current) =>
          current.filter(
            (item) =>
              item._id !== id
          )
      );

      if (
        notification &&
        !notification.isRead
      ) {
        setUnreadCount(
          (current) =>
            Math.max(
              0,
              current - 1
            )
        );
      }
    } catch (error) {
      console.error(
        "Delete notification error:",
        error
      );
    }
  }

  /* ===================================================
     FORMAT DATE
  =================================================== */

  function formatDate(
    value: string
  ) {
    return new Date(
      value
    ).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >

      {/* Bell */}

      <button
        type="button"
        onClick={() => {
          setOpen(
            (current) => !current
          );

          if (!open) {
            fetchNotifications();
          }
        }}
        className="relative rounded-xl p-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-[#10275F]"
        aria-label="Notifications"
      >

        <Bell size={21} />

        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#E83B32] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}

      </button>

      {/* Dropdown */}

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

          {/* Header */}

          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">

            <div>
              <h3 className="font-bold text-gray-900">
                Notifications
              </h3>

              <p className="text-xs text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  markAllAsRead
                }
                className="text-xs font-semibold text-[#10275F] hover:underline"
              >
                Mark all read
              </button>
            )}

          </div>

          {/* Content */}

          <div className="max-h-[420px] overflow-y-auto">

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2
                  size={24}
                  className="animate-spin text-[#10275F]"
                />
              </div>
            ) : error ? (
              <div className="px-5 py-8 text-center text-sm text-red-600">
                {error}
              </div>
            ) : notifications.length ===
              0 ? (
              <div className="px-5 py-10 text-center">

                <Bell
                  size={30}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-semibold text-gray-700">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  New booking updates will appear here.
                </p>

              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <div
                    key={
                      notification._id
                    }
                    className={`border-b border-gray-100 px-4 py-4 transition ${
                      notification.isRead
                        ? "bg-white"
                        : "bg-blue-50/50"
                    }`}
                  >

                    <div className="flex gap-3">

                      {/* Status */}

                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          notification.type ===
                          "BOOKING_CANCELLED"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-[#10275F]"
                        }`}
                      >
                        {notification.type ===
                        "BOOKING_CANCELLED" ? (
                          <X size={15} />
                        ) : (
                          <Check size={15} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <p
                            className={`text-sm ${
                              notification.isRead
                                ? "font-semibold text-gray-700"
                                : "font-bold text-gray-900"
                            }`}
                          >
                            {
                              notification.title
                            }
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              deleteNotification(
                                notification._id
                              )
                            }
                            className="shrink-0 text-gray-300 hover:text-red-500"
                            aria-label="Delete notification"
                          >
                            <X size={15} />
                          </button>

                        </div>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {
                            notification.message
                          }
                        </p>

                        <div className="mt-2 flex items-center justify-between">

                          <span className="text-[10px] text-gray-400">
                            {formatDate(
                              notification.createdAt
                            )}
                          </span>

                          {!notification.isRead && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification._id
                                )
                              }
                              className="text-[11px] font-semibold text-[#10275F] hover:underline"
                            >
                              Mark read
                            </button>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>
                )
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}