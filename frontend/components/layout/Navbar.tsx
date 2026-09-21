"use client";

import {
  Bell,
  CheckCheck,
  Menu,
  X,
  CalendarCheck,
  CalendarX,
  Clock3,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Notification {
  id: string;
  type: "CONFIRMATION" | "CANCELLATION" | "REMINDER";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function Navbar() {
  const { user } = useAuth();

  const [notifications, setNotifications] =
    useState<Notification[]>([
      {
        id: "1",
        type: "CONFIRMATION",
        title: "Booking Confirmed",
        message:
          "Your conference room booking has been confirmed.",
        time: "10 minutes ago",
        read: false,
      },
      {
        id: "2",
        type: "REMINDER",
        title: "Upcoming Meeting",
        message:
          "Your meeting starts in 30 minutes.",
        time: "25 minutes ago",
        read: false,
      },
      {
        id: "3",
        type: "CANCELLATION",
        title: "Booking Cancelled",
        message:
          "A previous conference room booking was cancelled.",
        time: "2 hours ago",
        read: true,
      },
    ]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const notificationRef =
    useRef<HTMLDivElement>(null);

  const firstName =
    user?.name?.trim().split(/\s+/)[0] || "User";

  const role =
    user?.role === "ADMIN"
      ? "Admin"
      : "Employee";

  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  /*
   * Close notification dropdown
   * when clicking outside
   */
  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {
        setShowNotifications(false);
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

  /*
   * Mark one notification as read
   */
  function markAsRead(id: string) {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification
      )
    );
  }

  /*
   * Mark all notifications as read
   */
  function markAllAsRead() {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  /*
   * Notification icon
   */
  function getNotificationIcon(
    type: Notification["type"]
  ) {
    if (type === "CONFIRMATION") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50">
          <CalendarCheck
            size={18}
            className="text-emerald-600"
          />
        </div>
      );
    }

    if (type === "CANCELLATION") {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
          <CalendarX
            size={18}
            className="text-red-600"
          />
        </div>
      );
    }

    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50">
        <Clock3
          size={18}
          className="text-amber-600"
        />
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 flex h-18 items-center justify-between border-b border-[#e7dcd8] bg-white px-5 md:px-8">

      {/* =====================================================
          DANGOTE LOGO
      ===================================================== */}

      <div className="flex items-center">
        <img
          src="/dangote-dark-logo.png"
          alt="Dangote"
          className="h-12 w-auto object-contain"
        />
      </div>

      {/* =====================================================
          RIGHT SIDE
      ===================================================== */}

      <div className="flex items-center gap-4">

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <div
          ref={notificationRef}
          className="relative"
        >
          <button
            type="button"
            onClick={() =>
              setShowNotifications(
                (current) => !current
              )
            }
            className={`relative rounded-xl p-2.5 text-gray-600 transition hover:bg-gray-100 ${
              showNotifications
                ? "bg-gray-100"
                : ""
            }`}
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={21} />

            {/* Unread indicator */}
            {unreadCount > 0 && (
              <>
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-[#c95143]" />

                <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-[#c95143] px-1 py-0.5 text-[10px] font-bold text-white">
                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}
                </span>
              </>
            )}
          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
          ================================================= */}

          {showNotifications && (
            <div className="absolute right-0 top-14 z-[100] w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

              {/* Header */}

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Notifications
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount > 1
                            ? "s"
                            : ""
                        }`
                      : "You're all caught up"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 transition hover:text-rose-700 disabled:cursor-not-allowed disabled:text-gray-300"
                >
                  <CheckCheck size={15} />
                  Mark all read
                </button>
              </div>

              {/* Notification List */}

              <div className="max-h-[400px] overflow-y-auto">

                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Bell
                        size={22}
                        className="text-gray-400"
                      />
                    </div>

                    <p className="text-sm font-semibold text-gray-700">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                        className={`flex w-full gap-3 border-b border-gray-100 px-5 py-4 text-left transition hover:bg-gray-50 ${
                          !notification.read
                            ? "bg-rose-50/40"
                            : "bg-white"
                        }`}
                      >
                        {getNotificationIcon(
                          notification.type
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-bold text-gray-900">
                              {notification.title}
                            </p>

                            {!notification.read && (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c95143]" />
                            )}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-gray-500">
                            {notification.message}
                          </p>

                          <p className="mt-1.5 text-[11px] font-medium text-gray-400">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>

              {/* Footer */}

              <div className="border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowNotifications(false)
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  <X size={14} />
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* =================================================
            USER
        ================================================= */}

        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#145c50] font-bold text-white">
            {initials}
          </div>

          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-gray-900">
              {firstName}
            </p>

            <p className="text-xs text-gray-500">
              {role}
            </p>
          </div>
        </div>

        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <button
          type="button"
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
          title="Menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}