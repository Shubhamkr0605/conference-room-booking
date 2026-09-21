"use client";

import {
  Bell,
  CalendarDays,
  Check,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Save,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface SettingsData {
  name: string;
  email: string;
  role: string;

  defaultLocation: string;
  defaultView: "Day" | "Week" | "Month";
  defaultDuration: string;

  bookingConfirmation: boolean;
  bookingCancellation: boolean;
  bookingReminder: boolean;
}

const defaultSettings: SettingsData = {
  name: "User",
  email: "user@example.com",
  role: "Employee",

  defaultLocation: "Main Office",
  defaultView: "Day",
  defaultDuration: "30 minutes",

  bookingConfirmation: true,
  bookingCancellation: true,
  bookingReminder: true,
};

export default function SettingsContent() {
  const {
    user,
    isLoading: authLoading,
    logout,
  } = useAuth();

  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [saved, setSaved] = useState(false);

  /*
   * =====================================================
   * LOAD USER + LOCAL SETTINGS
   * =====================================================
   */

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    try {
      const savedSettings =
        localStorage.getItem("conference-settings");

      let localSettings: Partial<SettingsData> = {};

      if (savedSettings) {
        localSettings = JSON.parse(savedSettings);
      }

      const calendarViewMap: Record<
        "DAY" | "WEEK" | "MONTH",
        "Day" | "Week" | "Month"
      > = {
        DAY: "Day",
        WEEK: "Week",
        MONTH: "Month",
      };

      const durationMap: Record<number, string> = {
        15: "15 minutes",
        30: "30 minutes",
        45: "45 minutes",
        60: "1 hour",
        120: "2 hours",
      };

      setSettings({
        name: user.name || "User",
        email: user.email || "user@example.com",
        role:
          user.role === "ADMIN"
            ? "Admin"
            : "Employee",

        defaultLocation:
          localSettings.defaultLocation ??
          user.defaultLocation ??
          "Main Office",

        defaultView:
          localSettings.defaultView ??
          calendarViewMap[user.calendarView] ??
          "Week",

        defaultDuration:
          localSettings.defaultDuration ??
          durationMap[user.defaultDuration] ??
          "30 minutes",

        bookingConfirmation:
          localSettings.bookingConfirmation ??
          user.notifications.bookingConfirmation,

        bookingCancellation:
          localSettings.bookingCancellation ??
          user.notifications.bookingCancellation,

        bookingReminder:
          localSettings.bookingReminder ??
          user.notifications.bookingReminder,
      });
    } catch (error) {
      console.error(
        "Failed to load settings:",
        error
      );

      setSettings((current) => ({
        ...current,
        name: user.name || "User",
        email: user.email || "user@example.com",
        role:
          user.role === "ADMIN"
            ? "Admin"
            : "Employee",
      }));
    }
  }, [user, authLoading]);

  /*
   * =====================================================
   * UPDATE SETTING
   * =====================================================
   */

  function updateSetting<
    K extends keyof SettingsData
  >(
    key: K,
    value: SettingsData[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  }

  /*
   * =====================================================
   * SAVE SETTINGS
   *
   * For now preferences are stored locally.
   * Later we will connect this to the backend
   * /api/users/settings endpoint.
   * =====================================================
   */

  function handleSave() {
    try {
      localStorage.setItem(
        "conference-settings",
        JSON.stringify({
          defaultLocation:
            settings.defaultLocation,

          defaultView:
            settings.defaultView,

          defaultDuration:
            settings.defaultDuration,

          bookingConfirmation:
            settings.bookingConfirmation,

          bookingCancellation:
            settings.bookingCancellation,

          bookingReminder:
            settings.bookingReminder,
        })
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error
      );
    }
  }

  /*
   * =====================================================
   * LOGOUT
   * =====================================================
   */

  async function handleLogout() {
    await logout();
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading settings...
        </p>
      </div>
    );
  }

  /*
   * =====================================================
   * PAGE
   * =====================================================
   */

  return (
    <div className="min-h-screen p-5 md:p-8 lg:p-10">
      {/* PAGE HEADER */}

      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
          Account
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Settings
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your profile, booking preferences
          and notifications.
        </p>
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* =====================================================
            PROFILE
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50">
                <User
                  size={20}
                  className="text-rose-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Profile
                </h2>

                <p className="text-sm text-gray-500">
                  Your account information
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2 md:p-7">
            {/* Full Name */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full Name
              </label>

              <div className="relative">
                <User
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="name"
                  type="text"
                  value={settings.name}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Email */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  value={settings.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 py-3 pl-10 pr-4 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Role */}

            <div>
              <label
                htmlFor="role"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Role
              </label>

              <input
                id="role"
                type="text"
                value={settings.role}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            BOOKING PREFERENCES
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <CalendarDays
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Booking Preferences
                </h2>

                <p className="text-sm text-gray-500">
                  Customize your booking experience
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-3 md:p-7">
            {/* Default Location */}

            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Default Location
              </label>

              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  id="location"
                  value={settings.defaultLocation}
                  onChange={(event) =>
                    updateSetting(
                      "defaultLocation",
                      event.target.value
                    )
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
                >
                  <option>Main Office</option>
                  <option>North Office</option>
                  <option>South Office</option>
                </select>
              </div>
            </div>

            {/* Calendar View */}

            <div>
              <label
                htmlFor="view"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Default Calendar View
              </label>

              <select
                id="view"
                value={settings.defaultView}
                onChange={(event) =>
                  updateSetting(
                    "defaultView",
                    event.target.value as
                      | "Day"
                      | "Week"
                      | "Month"
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              >
                <option value="Day">
                  Day
                </option>

                <option value="Week">
                  Week
                </option>

                <option value="Month">
                  Month
                </option>
              </select>
            </div>

            {/* Duration */}

            <div>
              <label
                htmlFor="duration"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Default Duration
              </label>

              <select
                id="duration"
                value={settings.defaultDuration}
                onChange={(event) =>
                  updateSetting(
                    "defaultDuration",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
              >
                <option value="15 minutes">
                  15 minutes
                </option>

                <option value="30 minutes">
                  30 minutes
                </option>

                <option value="45 minutes">
                  45 minutes
                </option>

                <option value="1 hour">
                  1 hour
                </option>

                <option value="2 hours">
                  2 hours
                </option>
              </select>
            </div>
          </div>
        </section>

        {/* =====================================================
            NOTIFICATIONS
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Bell
                  size={20}
                  className="text-amber-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Notifications
                </h2>

                <p className="text-sm text-gray-500">
                  Choose which booking notifications
                  you receive
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            <NotificationRow
              title="Booking Confirmation"
              description="Receive a notification when a booking is successfully created."
              enabled={
                settings.bookingConfirmation
              }
              onToggle={() =>
                updateSetting(
                  "bookingConfirmation",
                  !settings.bookingConfirmation
                )
              }
            />

            <NotificationRow
              title="Booking Cancellation"
              description="Receive a notification when a booking is cancelled."
              enabled={
                settings.bookingCancellation
              }
              onToggle={() =>
                updateSetting(
                  "bookingCancellation",
                  !settings.bookingCancellation
                )
              }
            />

            <NotificationRow
              title="Booking Reminder"
              description="Receive a reminder before your meeting starts."
              enabled={
                settings.bookingReminder
              }
              onToggle={() =>
                updateSetting(
                  "bookingReminder",
                  !settings.bookingReminder
                )
              }
            />
          </div>
        </section>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5 md:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <Lock
                  size={20}
                  className="text-purple-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Security
                </h2>

                <p className="text-sm text-gray-500">
                  Manage your account security
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-7">
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  alert(
                    "Change password will be connected to the authentication API."
                  )
                }
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                <Lock size={17} />
                Change Password
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            SAVE BUTTON
        ===================================================== */}

        <div className="flex flex-col items-stretch justify-end gap-3 pb-8 sm:flex-row sm:items-center">
          {saved && (
            <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
              <Check size={17} />
              Settings saved successfully
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-7 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-gray-700"
          >
            <Save size={17} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   NOTIFICATION ROW
===================================================== */

function NotificationRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-5 px-6 py-5 md:px-7">
      <div className="min-w-0">
        <h3 className="text-sm font-bold text-gray-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-emerald-500"
            : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}