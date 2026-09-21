"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  department?: string;
  role: "ADMIN" | "EMPLOYEE";
  profileImage?: string;

  defaultLocation?: string;
  favoriteRoom?: string;
  defaultDuration: number;
  calendarView: "DAY" | "WEEK" | "MONTH";
  timezone: string;

  notifications: {
    bookingConfirmation: boolean;
    bookingCancellation: boolean;
    bookingReminder: boolean;
    roomAvailable: boolean;
  };

  workingHours: {
    [day: string]: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  /* =====================================================
     GET CURRENT USER
  ===================================================== */

  async function refreshUser() {
    try {
      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error(
        "Failed to fetch authenticated user:",
        error
      );

      setUser(null);
    }
  }

  /* =====================================================
     INITIAL AUTH CHECK
  ===================================================== */

  useEffect(() => {
    async function checkAuthentication() {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthentication();
  }, []);

  /* =====================================================
     LOGOUT
  ===================================================== */

  async function logout() {
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
      setUser(null);
      window.location.href = "/login";
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =====================================================
   AUTH HOOK
===================================================== */

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}