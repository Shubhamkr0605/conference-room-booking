import type { Metadata } from "next";

import "./globals.css";

import { BookingProvider } from "@/context/BookingContext";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Conference Room Booking",
  description:
    "Conference Room Booking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}