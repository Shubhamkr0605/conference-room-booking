"use client";

import { Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user } = useAuth();

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
            REAL DATABASE NOTIFICATIONS
        ================================================= */}

        <NotificationBell />

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
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>
    </header>
  );
}