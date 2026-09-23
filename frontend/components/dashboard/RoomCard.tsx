"use client";

import {
  Monitor,
  Presentation,
  Tv,
  Users,
  Wifi,
  MapPin,
} from "lucide-react";

/* =====================================================
   TYPES
===================================================== */

interface Room {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  description?: string;
  facilities: string[];
  isActive: boolean;
}

interface Booking {
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

interface RoomCardProps {
  room: Room;
  booking?: Booking;
  onBook: (room: Room) => void;
}

/* =====================================================
   COMPONENT
===================================================== */

export default function RoomCard({
  room,
  booking,
  onBook,
}: RoomCardProps) {
  /* ===================================================
     ROOM STATUS
  =================================================== */

  const isBooked =
    !!booking &&
    booking.status !== "CANCELLED";

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">

      {/* =================================================
          TOP ACCENT
      ================================================= */}

      <div className="h-2 bg-[#c95143]" />

      <div className="flex flex-1 flex-col p-6">

        {/* =================================================
            ROOM HEADER
        ================================================= */}

        <div className="mb-5">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <h2 className="truncate text-2xl font-bold text-gray-900">
                {room.name}
              </h2>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">

                <MapPin
                  size={14}
                  className="shrink-0"
                />

                <span className="truncate">
                  {room.location}
                </span>

              </div>

            </div>

            {/* STATUS */}

            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                isBooked
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {isBooked
                ? "BOOKED"
                : "AVAILABLE"}
            </span>

          </div>

        </div>

        {/* =================================================
            CAPACITY
        ================================================= */}

        <div className="mb-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">

            <Users
              size={19}
              className="text-gray-700"
            />

          </div>

          <div>

            <p className="text-xs text-gray-400">
              Capacity
            </p>

            <p className="text-sm font-bold text-gray-900">
              {room.capacity} People
            </p>

          </div>

        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {room.description && (
          <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-500">
            {room.description}
          </p>
        )}

        {/* =================================================
            EXISTING BOOKING
        ================================================= */}

        {isBooked && booking && (
          <div className="mb-5 rounded-xl bg-red-50 px-4 py-3">

            <p className="text-xs font-semibold text-red-500">
              Booked
            </p>

            <p className="mt-1 line-clamp-2 text-sm font-bold text-gray-900">
              {booking.title}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {booking.startTime} -{" "}
              {booking.endTime}
            </p>

          </div>
        )}

        {/* =================================================
            FACILITIES
        ================================================= */}

        <div className="flex-1">

          <p className="mb-3 text-sm font-bold text-gray-900">
            Facilities
          </p>

          {room.facilities.length >
          0 ? (

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

              {room.facilities.map(
                (facility) => (

                  <div
                    key={facility}
                    className="flex min-w-0 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
                  >

                    {/* PROJECTOR */}

                    {facility ===
                      "Projector" && (
                      <Presentation
                        size={14}
                        className="shrink-0"
                      />
                    )}

                    {/* WHITEBOARD */}

                    {facility ===
                      "Whiteboard" && (
                      <Monitor
                        size={14}
                        className="shrink-0"
                      />
                    )}

                    {/* TV */}

                    {facility ===
                      "TV Display" && (
                      <Tv
                        size={14}
                        className="shrink-0"
                      />
                    )}

                    {/* WIFI */}

                    {facility ===
                      "Wi-Fi" && (
                      <Wifi
                        size={14}
                        className="shrink-0"
                      />
                    )}

                    <span className="truncate">
                      {facility}
                    </span>

                  </div>

                )
              )}

            </div>

          ) : (

            <p className="text-xs text-gray-400">
              No facilities listed
            </p>

          )}

        </div>

        {/* =================================================
            BOOK ROOM BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={() =>
            onBook(room)
          }
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
        >
          BOOK ROOM
        </button>

      </div>

    </div>
  );
}