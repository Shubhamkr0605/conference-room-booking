"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Users,
  Search,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Mail,
  Building2,
  Lock,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =====================================================
   TYPES
===================================================== */

interface User {
  _id: string;
  name: string;
  email: string;
  department?: string;
  role: "ADMIN" | "EMPLOYEE";
  createdAt: string;
}

interface UsersResponse {
  success: boolean;
  users: User[];
  message?: string;
}

interface RoleUpdateResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    department?: string;
    role: "ADMIN" | "EMPLOYEE";
  };
}

/* =====================================================
   COMPONENT
===================================================== */

export default function AdminUsersContent() {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<
      "ALL" | "ADMIN" | "EMPLOYEE"
    >("ALL");

  const [updatingUserId, setUpdatingUserId] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =====================================================
     FETCH USERS
  ===================================================== */

  async function fetchUsers(
    showRefresh = false
  ) {
    try {
      setError("");
      setSuccessMessage("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_URL}/api/users`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result: UsersResponse =
        await response.json();

      /*
       * API errors such as 401/403 are expected
       * responses, not JavaScript exceptions.
       */
      if (!response.ok) {
        setError(
          result.message ||
            "Failed to load users"
        );

        return;
      }

      setUsers(result.users);
    } catch (error) {
      /*
       * This is reserved for actual network
       * or unexpected JavaScript errors.
       */
      console.error(
        "Fetch users request failed:",
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

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchUsers();
  }, []);

  /* =====================================================
     CHANGE USER ROLE
  ===================================================== */

  async function changeRole(
    userId: string,
    role: "ADMIN" | "EMPLOYEE"
  ) {
    /*
     * Prevent changing the currently logged-in
     * user's own role from the frontend.
     *
     * The backend also protects this operation.
     */
    if (
      currentUser?.id &&
      currentUser.id === userId
    ) {
      setError(
        "You cannot change your own admin access."
      );

      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to change this user's role to ${role}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingUserId(userId);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/api/users/${userId}/role`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            role,
          }),
        }
      );

      const result: RoleUpdateResponse =
        await response.json();

      /*
       * IMPORTANT:
       *
       * Do NOT throw an Error here.
       *
       * A 400/403 from the backend is an expected
       * API response and should be displayed normally.
       */
      if (!response.ok) {
        setError(
          result.message ||
            "Failed to update user role"
        );

        return;
      }

      /*
       * Update the local user list after
       * successful backend update.
       */
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role,
              }
            : user
        )
      );

      setSuccessMessage(
        result.message ||
          "User role updated successfully."
      );
    } catch (error) {
      /*
       * This catch is only for actual network
       * or unexpected errors.
       */
      console.error(
        "Role update request failed:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  /* =====================================================
     FILTER USERS
  ===================================================== */

  const filteredUsers = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.name
          .toLowerCase()
          .includes(searchValue) ||
        user.email
          .toLowerCase()
          .includes(searchValue) ||
        user.department
          ?.toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "ALL" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [users, search, roleFilter]);

  /* =====================================================
     STATISTICS
  ===================================================== */

  const totalAdmins = users.filter(
    (user) => user.role === "ADMIN"
  ).length;

  const totalEmployees = users.filter(
    (user) => user.role === "EMPLOYEE"
  ).length;

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-gray-500"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <main className="min-h-screen bg-gray-50 p-6 lg:p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            Users
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage employees and administrator roles.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          STATISTICS
      ================================================= */}

      <div className="mb-6 grid gap-5 sm:grid-cols-3">

        {/* Total Users */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <Users
                size={21}
                className="text-gray-700"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Users
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {users.length}
              </p>
            </div>

          </div>
        </div>

        {/* Administrators */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <ShieldCheck
                size={21}
                className="text-gray-700"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Administrators
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {totalAdmins}
              </p>
            </div>

          </div>
        </div>

        {/* Employees */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <UserRound
                size={21}
                className="text-gray-700"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Employees
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {totalEmployees}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* =================================================
          ERROR MESSAGE
      ================================================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 font-bold text-red-500 hover:text-red-700"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          SUCCESS MESSAGE
      ================================================= */}

      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">

          <span>{successMessage}</span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="shrink-0 font-bold text-green-500 hover:text-green-700"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 md:flex-row">

          {/* Search */}

          <div className="relative flex-1">

            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email or department..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />

          </div>

          {/* Role Filter */}

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value as
                  | "ALL"
                  | "ADMIN"
                  | "EMPLOYEE"
              )
            }
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none"
          >
            <option value="ALL">
              All Roles
            </option>

            <option value="EMPLOYEE">
              Employees
            </option>

            <option value="ADMIN">
              Administrators
            </option>
          </select>

        </div>

      </div>

      {/* =================================================
          USERS TABLE
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Table Header */}

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

          <div>
            <h2 className="font-bold text-gray-900">
              All Users
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {filteredUsers.length} user
              {filteredUsers.length !== 1
                ? "s"
                : ""}{" "}
              shown
            </p>
          </div>

        </div>

        {/* Empty State */}

        {filteredUsers.length === 0 ? (
          <div className="p-10 text-center">

            <Users
              size={35}
              className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm font-medium text-gray-600">
              No users found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Try changing your search or filter.
            </p>

          </div>
        ) : (

          /* Table */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left">

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    User
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Department
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Role
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Joined
                  </th>

                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredUsers.map((user) => {

                  const isCurrentUser =
                    currentUser?.id ===
                    user._id;

                  const isUpdating =
                    updatingUserId ===
                    user._id;

                  return (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 last:border-0"
                    >

                      {/* =================================================
                          USER
                      ================================================= */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-600">
                            {user.name
                              .trim()
                              .split(/\s+/)
                              .map(
                                (name) =>
                                  name[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>

                            <div className="flex items-center gap-2">

                              <p className="text-sm font-semibold text-gray-900">
                                {user.name}
                              </p>

                              {isCurrentUser && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                                  YOU
                                </span>
                              )}

                            </div>

                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">

                              <Mail size={12} />

                              {user.email}

                            </div>

                          </div>

                        </div>

                      </td>

                      {/* =================================================
                          DEPARTMENT
                      ================================================= */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-gray-600">

                          <Building2
                            size={15}
                            className="text-gray-400"
                          />

                          {user.department ||
                            "Not specified"}

                        </div>

                      </td>

                      {/* =================================================
                          ROLE
                      ================================================= */}

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                            user.role ===
                            "ADMIN"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          {user.role}
                        </span>

                      </td>

                      {/* =================================================
                          JOINED
                      ================================================= */}

                      <td className="px-5 py-4 text-sm text-gray-600">

                        {new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}

                      </td>

                      {/* =================================================
                          ACTION
                      ================================================= */}

                      <td className="px-5 py-4">

                        {isCurrentUser ? (

                          <div className="flex items-center gap-2">

                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
                              <Lock size={13} />

                              {user.role ===
                              "ADMIN"
                                ? "Admin"
                                : "Employee"}
                            </div>

                          </div>

                        ) : (

                          <select
                            value={user.role}
                            disabled={
                              isUpdating
                            }
                            onChange={(
                              event
                            ) =>
                              changeRole(
                                user._id,
                                event
                                  .target
                                  .value as
                                  | "ADMIN"
                                  | "EMPLOYEE"
                              )
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <option value="EMPLOYEE">
                              Employee
                            </option>

                            <option value="ADMIN">
                              Admin
                            </option>

                          </select>

                        )}

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </section>

    </main>
  );
}