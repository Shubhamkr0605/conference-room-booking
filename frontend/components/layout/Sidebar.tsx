"use client";

import {
  Building2,
  CalendarDays,
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  ClipboardList,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const employeeMenuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Bookings",
    href: "/bookings",
    icon: CalendarDays,
  },
  {
    label: "Rooms",
    href: "/rooms",
    icon: Building2,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

const adminMenuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "All Bookings",
    href: "/admin/bookings",
    icon: ClipboardList,
  },
  {
    label: "Rooms",
    href: "/admin/rooms",
    icon: Building2,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  const menuItems = isAdmin
    ? adminMenuItems
    : employeeMenuItems;

  return (
    <aside className="hidden h-screen w-[263px] shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">

      {/* Logo / Brand */}
      <div className="flex h-[82px] shrink-0 items-center border-b border-gray-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900">
          <Building2
            size={21}
            className="text-white"
          />
        </div>

        <div className="ml-3">
          <h2 className="text-base font-bold text-gray-900">
            Conference
          </h2>

          <p className="text-xs text-gray-400">
            Room Booking
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
          {isAdmin ? "Admin Menu" : "Menu"}
        </p>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/admin" &&
                pathname.startsWith(
                  `${item.href}/`
                ));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-rose-100 text-rose-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={20} />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User */}
      <div className="shrink-0 border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
            {user?.name
              ?.trim()
              .split(/\s+/)
              .map((name) => name[0])
              .join("")
              .slice(0, 2)
              .toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {isAdmin ? "Administrator" : "Employee"}
            </p>
          </div>

        </div>
      </div>

    </aside>
  );
}