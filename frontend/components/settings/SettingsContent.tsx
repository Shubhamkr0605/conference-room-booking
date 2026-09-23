"use client";

import {
  Bell,
  CalendarDays,
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Save,
  User,
  Building2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =====================================================
   TYPES
===================================================== */

type CalendarView =
  | "DAY"
  | "WEEK"
  | "MONTH";

interface SettingsData {
  name: string;
  email: string;
  department: string;
  role: string;

  defaultLocation: string;

  defaultView: CalendarView;

  defaultDuration: string;

  bookingConfirmation: boolean;
  bookingCancellation: boolean;
  bookingReminder: boolean;
}

interface ProfileResponse {
  success: boolean;

  user?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    role: "ADMIN" | "EMPLOYEE";

    defaultLocation?: string;

    defaultDuration: number;

    calendarView: CalendarView;

    timezone?: string;

    notifications?: {
      bookingConfirmation?: boolean;
      bookingCancellation?: boolean;
      bookingReminder?: boolean;
      roomAvailable?: boolean;
    };
  };

  message?: string;
}

/* =====================================================
   DEFAULT SETTINGS
===================================================== */

const defaultSettings: SettingsData = {
  name: "",
  email: "",
  department: "",
  role: "EMPLOYEE",

  defaultLocation: "",

  defaultView: "WEEK",

  defaultDuration: "60 minutes",

  bookingConfirmation: true,
  bookingCancellation: true,
  bookingReminder: true,
};

/* =====================================================
   DURATION HELPERS
===================================================== */

function durationToLabel(
  duration: number
): string {
  switch (duration) {
    case 15:
      return "15 minutes";

    case 30:
      return "30 minutes";

    case 45:
      return "45 minutes";

    case 60:
      return "1 hour";

    case 90:
      return "1.5 hours";

    case 120:
      return "2 hours";

    default:
      return `${duration} minutes`;
  }
}

function labelToDuration(
  value: string
): number {
  switch (value) {
    case "15 minutes":
      return 15;

    case "30 minutes":
      return 30;

    case "45 minutes":
      return 45;

    case "1 hour":
      return 60;

    case "1.5 hours":
      return 90;

    case "2 hours":
      return 120;

    default: {
      const parsed = Number(
        value.replace(" minutes", "")
      );

      return Number.isFinite(parsed)
        ? parsed
        : 60;
    }
  }
}

/* =====================================================
   COMPONENT
===================================================== */

export default function SettingsContent() {
  const [settings, setSettings] =
    useState<SettingsData>(
      defaultSettings
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =====================================================
     CHANGE PASSWORD STATE
  ===================================================== */

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/users/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const result: ProfileResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load profile"
          );
        }

        if (!result.user) {
          throw new Error(
            "User profile was not returned"
          );
        }

        const user = result.user;

        setSettings({
          name: user.name || "",

          email: user.email || "",

          department:
            user.department || "",

          role: user.role,

          defaultLocation:
            user.defaultLocation || "",

          defaultView:
            user.calendarView || "WEEK",

          defaultDuration:
            durationToLabel(
              user.defaultDuration || 60
            ),

          bookingConfirmation:
            user.notifications
              ?.bookingConfirmation ?? true,

          bookingCancellation:
            user.notifications
              ?.bookingCancellation ?? true,

          bookingReminder:
            user.notifications
              ?.bookingReminder ?? true,
        });
      } catch (error) {
        console.error(
          "Load profile error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  /* =====================================================
     UPDATE SETTING
  ===================================================== */

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
    setSuccessMessage("");
  }

  /* =====================================================
     SAVE SETTINGS
  ===================================================== */

  async function handleSave() {
    try {
      setSaving(true);
      setSaved(false);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/api/users/me`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: settings.name.trim(),

            department:
              settings.department.trim(),

            defaultLocation:
              settings.defaultLocation.trim(),

            defaultDuration:
              labelToDuration(
                settings.defaultDuration
              ),

            calendarView:
              settings.defaultView,

            notifications: {
              bookingConfirmation:
                settings.bookingConfirmation,

              bookingCancellation:
                settings.bookingCancellation,

              bookingReminder:
                settings.bookingReminder,
            },
          }),
        }
      );

      const result: ProfileResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Failed to save settings"
        );
      }

      setSaved(true);

      setSuccessMessage(
        "Your settings have been saved successfully."
      );

      setTimeout(() => {
        setSaved(false);
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Save settings error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save your settings."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     CHANGE PASSWORD
  ===================================================== */

  function openPasswordModal() {
    setPasswordError("");
    setPasswordSuccess("");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

    setShowPasswordModal(true);
  }

  function closePasswordModal() {
    if (passwordLoading) {
      return;
    }

    setShowPasswordModal(false);

    setPasswordError("");
    setPasswordSuccess("");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  }

  async function handleChangePassword(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    /* ---------- Client validation ---------- */

    if (!currentPassword) {
      setPasswordError(
        "Please enter your current password."
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );
      return;
    }

    if (newPassword.length > 128) {
      setPasswordError(
        "New password cannot exceed 128 characters."
      );
      return;
    }

    if (!confirmPassword) {
      setPasswordError(
        "Please confirm your new password."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation password do not match."
      );
      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const result: {
        success: boolean;
        message?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to change password."
        );
      }

      setPasswordSuccess(
        "Password changed successfully. Redirecting to login..."
      );

      /*
       * Clear sensitive values immediately.
       */
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      /*
       * The backend clears the access token.
       * Send the user to login so they can
       * authenticate using the new password.
       */
      setTimeout(() => {
        window.location.href =
          "/login";
      }, 1500);
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to change password."
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function handleLogout() {
    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      window.location.href =
        "/login";
    }
  }

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={32}
            className="mx-auto animate-spin text-[#10275F]"
          />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading your settings...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <>
      <div className="min-h-screen p-5 md:p-8 lg:p-10">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
            Account
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Settings
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your profile, booking
            preferences and notifications.
          </p>
        </div>

        <div className="mx-auto max-w-5xl space-y-6">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p>{error}</p>
            </div>
          )}

          {/* =================================================
              SUCCESS
          ================================================= */}

          {successMessage && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
              <Check
                size={20}
                className="mt-0.5 shrink-0"
              />

              <p>{successMessage}</p>
            </div>
          )}

          {/* =================================================
              PROFILE
          ================================================= */}

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

              {/* Name */}

              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Full Name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#10275F]/60"
                  />

                  <input
                    id="name"
                    type="text"
                    value={settings.name}
                    onChange={(event) =>
                      updateSetting(
                        "name",
                        event.target.value
                      )
                    }
                    className="h-14 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] pl-12 pr-4 text-sm text-[#10275F] outline-none transition focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5"
                  />

                </div>

              </div>

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Work Email
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#10275F]/60"
                  />

                  <input
                    id="email"
                    type="email"
                    value={settings.email}
                    disabled
                    className="h-14 w-full cursor-not-allowed rounded-xl border border-[#D5DEEF] bg-gray-100 pl-12 pr-4 text-sm text-gray-500 outline-none"
                  />

                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Your company email cannot be
                  changed here.
                </p>

              </div>

              {/* Department */}

              <div>

                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Department
                </label>

                <div className="relative">

                  <Building2
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#10275F]/60"
                  />

                  <input
                    id="department"
                    type="text"
                    value={
                      settings.department
                    }
                    onChange={(event) =>
                      updateSetting(
                        "department",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Engineering"
                    className="h-14 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] pl-12 pr-4 text-sm text-[#10275F] outline-none transition placeholder:text-slate-400 focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5"
                  />

                </div>

              </div>

              {/* Role */}

              <div>

                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Account Role
                </label>

                <input
                  id="role"
                  type="text"
                  value={
                    settings.role ===
                    "ADMIN"
                      ? "Administrator"
                      : "Employee"
                  }
                  disabled
                  className="h-14 w-full cursor-not-allowed rounded-xl border border-[#D5DEEF] bg-gray-100 px-4 text-sm text-gray-500 outline-none"
                />

                <p className="mt-2 text-xs text-gray-500">
                  Your role can only be changed
                  by an administrator.
                </p>

              </div>

            </div>

          </section>

          {/* =================================================
              BOOKING PREFERENCES
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-6 py-5 md:px-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <CalendarDays
                    size={20}
                    className="text-[#10275F]"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Booking Preferences
                  </h2>

                  <p className="text-sm text-gray-500">
                    Customize your default booking
                    experience.
                  </p>
                </div>

              </div>

            </div>

            <div className="grid gap-5 p-6 md:grid-cols-3 md:p-7">

              {/* Default Location */}

              <div>

                <label
                  htmlFor="defaultLocation"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Default Location
                </label>

                <div className="relative">

                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#10275F]/60"
                  />

                  <input
                    id="defaultLocation"
                    type="text"
                    value={
                      settings.defaultLocation
                    }
                    onChange={(event) =>
                      updateSetting(
                        "defaultLocation",
                        event.target.value
                      )
                    }
                    placeholder="Main Office"
                    className="h-14 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] pl-12 pr-4 text-sm text-[#10275F] outline-none transition placeholder:text-slate-400 focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5"
                  />

                </div>

              </div>

              {/* Calendar View */}

              <div>

                <label
                  htmlFor="defaultView"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Default Calendar View
                </label>

                <select
                  id="defaultView"
                  value={
                    settings.defaultView
                  }
                  onChange={(event) =>
                    updateSetting(
                      "defaultView",
                      event.target
                        .value as CalendarView
                    )
                  }
                  className="h-14 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] px-4 text-sm text-[#10275F] outline-none transition focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5"
                >
                  <option value="DAY">
                    Day
                  </option>

                  <option value="WEEK">
                    Week
                  </option>

                  <option value="MONTH">
                    Month
                  </option>
                </select>

              </div>

              {/* Duration */}

              <div>

                <label
                  htmlFor="defaultDuration"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Default Duration
                </label>

                <select
                  id="defaultDuration"
                  value={
                    settings.defaultDuration
                  }
                  onChange={(event) =>
                    updateSetting(
                      "defaultDuration",
                      event.target.value
                    )
                  }
                  className="h-14 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] px-4 text-sm text-[#10275F] outline-none transition focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5"
                >
                  <option>
                    15 minutes
                  </option>

                  <option>
                    30 minutes
                  </option>

                  <option>
                    45 minutes
                  </option>

                  <option>
                    1 hour
                  </option>

                  <option>
                    1.5 hours
                  </option>

                  <option>
                    2 hours
                  </option>
                </select>

              </div>

            </div>

          </section>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

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
                    you receive.
                  </p>
                </div>

              </div>

            </div>

            <div className="divide-y divide-gray-100">

              {/* Confirmation */}

              <label className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5 md:px-7">

                <div>

                  <p className="font-semibold text-gray-900">
                    Booking Confirmation
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Receive a notification when a
                    booking is successfully created.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={
                    settings.bookingConfirmation
                  }
                  onChange={(event) =>
                    updateSetting(
                      "bookingConfirmation",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[#10275F]"
                />

              </label>

              {/* Cancellation */}

              <label className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5 md:px-7">

                <div>

                  <p className="font-semibold text-gray-900">
                    Booking Cancellation
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Receive a notification when a
                    booking is cancelled.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={
                    settings.bookingCancellation
                  }
                  onChange={(event) =>
                    updateSetting(
                      "bookingCancellation",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[#10275F]"
                />

              </label>

              {/* Reminder */}

              <label className="flex cursor-pointer items-center justify-between gap-5 px-6 py-5 md:px-7">

                <div>

                  <p className="font-semibold text-gray-900">
                    Booking Reminder
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Receive reminders before your
                    upcoming meetings.
                  </p>

                </div>

                <input
                  type="checkbox"
                  checked={
                    settings.bookingReminder
                  }
                  onChange={(event) =>
                    updateSetting(
                      "bookingReminder",
                      event.target.checked
                    )
                  }
                  className="h-5 w-5 accent-[#10275F]"
                />

              </label>

            </div>

          </section>

          {/* =================================================
              SECURITY
          ================================================= */}

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-100 px-6 py-5 md:px-7">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <Lock
                    size={20}
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Security
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage your account security.
                  </p>
                </div>

              </div>

            </div>

            <div className="p-6 md:p-7">

              <button
                type="button"
                onClick={
                  openPasswordModal
                }
                className="rounded-xl border border-[#D5DEEF] px-5 py-3 text-sm font-semibold text-[#10275F] transition hover:bg-[#F8FAFD]"
              >
                Change Password
              </button>

            </div>

          </section>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />

              Logout
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#10275F] px-7 text-sm font-bold text-white shadow-lg shadow-[#10275F]/20 transition hover:bg-[#0B2151] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : saved ? (
                <>
                  <Check size={18} />

                  Saved
                </>
              ) : (
                <>
                  <Save size={18} />

                  Save Changes
                </>
              )}
            </button>

          </div>

        </div>

      </div>

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ===================================================== */}

      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closePasswordModal();
            }
          }}
        >

          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-7"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>

                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                  <Lock
                    size={21}
                    className="text-[#10275F]"
                  />
                </div>

                <h2 className="text-xl font-bold text-gray-900">
                  Change Password
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Update your account password.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closePasswordModal
                }
                disabled={passwordLoading}
                aria-label="Close"
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>

            </div>

            {/* Password Form */}

            <form
              onSubmit={
                handleChangePassword
              }
              className="space-y-5"
            >

              {/* Current Password */}

              <div>

                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Current Password
                </label>

                <div className="relative">

                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      currentPassword
                    }
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    disabled={
                      passwordLoading
                    }
                    className="h-13 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] px-4 pr-12 text-sm text-[#10275F] outline-none transition placeholder:text-slate-400 focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      passwordLoading
                    }
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showCurrentPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* New Password */}

              <div>

                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  New Password
                </label>

                <div className="relative">

                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Enter your new password"
                    disabled={
                      passwordLoading
                    }
                    className="h-13 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] px-4 pr-12 text-sm text-[#10275F] outline-none transition placeholder:text-slate-400 focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      passwordLoading
                    }
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showNewPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Password must contain 8 to 128
                  characters.
                </p>

              </div>

              {/* Confirm Password */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-[#10275F]"
                >
                  Confirm New Password
                </label>

                <div className="relative">

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      confirmPassword
                    }
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    autoComplete="new-password"
                    placeholder="Confirm your new password"
                    disabled={
                      passwordLoading
                    }
                    className="h-13 w-full rounded-xl border border-[#D5DEEF] bg-[#F8FAFD] px-4 pr-12 text-sm text-[#10275F] outline-none transition placeholder:text-slate-400 focus:border-[#10275F] focus:bg-white focus:ring-4 focus:ring-[#10275F]/5 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={
                      passwordLoading
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff
                        size={18}
                      />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}

              {passwordError && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    {passwordError}
                  </p>

                </div>
              )}

              {/* Success */}

              {passwordSuccess && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                  <Check
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <p>
                    {passwordSuccess}
                  </p>

                </div>
              )}

              {/* Modal Actions */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={
                    closePasswordModal
                  }
                  disabled={
                    passwordLoading
                  }
                  className="h-12 rounded-xl border border-[#D5DEEF] px-5 text-sm font-semibold text-[#10275F] transition hover:bg-[#F8FAFD] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    passwordLoading
                  }
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#10275F] px-5 text-sm font-bold text-white shadow-lg shadow-[#10275F]/20 transition hover:bg-[#0B2151] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Changing...
                    </>
                  ) : (
                    <>
                      <Lock size={17} />

                      Change Password
                    </>
                  )}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}
    </>
  );
}