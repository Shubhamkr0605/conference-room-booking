"use client";

import {
  Monitor,
  Presentation,
  Tv,
  Users,
  Wifi,
  Search,
  Loader2,
  AlertCircle,
  MapPin,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { format } from "date-fns";

import BookingModal from "@/components/bookings/BookingModal";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

/* =====================================================
   ROOM TYPE
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

/* =====================================================
   COMPONENT
===================================================== */

export default function RoomsContent() {
  /* ===================================================
     STATE
  =================================================== */

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [bookingRoom, setBookingRoom] =
    useState<Room | null>(null);

  const [search, setSearch] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     TODAY
  =================================================== */

  const today = format(
    new Date(),
    "yyyy-MM-dd"
  );

  /* ===================================================
     FETCH ROOMS
  =================================================== */

  async function fetchRooms() {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/rooms`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load rooms"
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to load rooms"
        );
      }

      setRooms(
        data.rooms || []
      );
    } catch (error) {
      console.error(
        "Fetch rooms error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load conference rooms"
      );
    } finally {
      setIsLoading(false);
    }
  }

  /* ===================================================
     LOAD ROOMS
  =================================================== */

  useEffect(() => {
    fetchRooms();
  }, []);

  /* ===================================================
     SEARCH
  =================================================== */

  const filteredRooms =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return rooms;
      }

      return rooms.filter(
        (room) => {
          return (
            room.name
              .toLowerCase()
              .includes(query) ||

            room.location
              .toLowerCase()
              .includes(query) ||

            room.description
              ?.toLowerCase()
              .includes(query) ||

            room.facilities.some(
              (facility) =>
                facility
                  .toLowerCase()
                  .includes(query)
            )
          );
        }
      );
    }, [rooms, search]);

  /* ===================================================
     OPEN BOOKING MODAL
  =================================================== */

  function handleBookRoom(
    room: Room
  ) {
    setBookingRoom(room);
  }

  /* ===================================================
     CLOSE BOOKING MODAL
  =================================================== */

  function handleCloseBooking() {
    setBookingRoom(null);
  }

  /* ===================================================
     LOADING STATE
  =================================================== */

  if (isLoading) {
    return (
      <div className="min-h-screen p-5 md:p-8 lg:p-10">
        <div className="flex min-h-[500px] items-center justify-center">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
            <Loader2
              size={20}
              className="animate-spin"
            />

            Loading conference rooms...
          </div>
        </div>
      </div>
    );
  }

  /* ===================================================
     ERROR STATE
  =================================================== */

  if (error) {
    return (
      <div className="min-h-screen p-5 md:p-8 lg:p-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
            Conference Rooms
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Rooms
          </h1>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div>
              <h2 className="font-bold">
                Unable to load rooms
              </h2>

              <p className="mt-1 text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchRooms}
                className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ===================================================
     MAIN UI
  =================================================== */

  return (
    <div className="min-h-screen p-5 md:p-8 lg:p-10">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
          Conference Rooms
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
          Rooms
        </h1>

        <p className="mt-2 text-gray-600">
          Find the perfect conference room for your
          next meeting.
        </p>
      </div>

      {/* =================================================
          SEARCH
      ================================================= */}

      <div className="mb-7">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search rooms, location or facilities..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
          />
        </div>
      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {filteredRooms.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <Search
              size={24}
              className="text-gray-400"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            No rooms found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {rooms.length === 0
              ? "There are currently no active conference rooms."
              : "Try changing your search."}
          </p>
        </div>
      ) : (
        /* =================================================
           ROOM GRID
        ================================================= */

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRooms.map(
            (room) => (
              <div
                key={room._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* =====================================
                    ROOM COLOR
                ===================================== */}

                <div className="h-2 bg-[#c95143]" />

                <div className="p-6">

                  {/* ===================================
                      ROOM HEADER
                  =================================== */}

                  <div className="mb-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {room.name}
                        </h2>

                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin
                            size={14}
                          />

                          {room.location}
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                        Available
                      </span>
                    </div>
                  </div>

                  {/* ===================================
                      CAPACITY
                  =================================== */}

                  <div className="mb-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
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
                        {room.capacity}{" "}
                        People
                      </p>
                    </div>
                  </div>

                  {/* ===================================
                      DESCRIPTION
                  =================================== */}

                  {room.description && (
                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-gray-500">
                      {room.description}
                    </p>
                  )}

                  {/* ===================================
                      FACILITIES
                  =================================== */}

                  <div>
                    <p className="mb-3 text-sm font-bold text-gray-900">
                      Facilities
                    </p>

                    {room.facilities.length >
                    0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {room.facilities.map(
                          (
                            facility
                          ) => (
                            <div
                              key={
                                facility
                              }
                              className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
                            >
                              {facility ===
                                "Projector" && (
                                <Presentation
                                  size={
                                    14
                                  }
                                />
                              )}

                              {facility ===
                                "Whiteboard" && (
                                <Monitor
                                  size={
                                    14
                                  }
                                />
                              )}

                              {facility ===
                                "TV Display" && (
                                <Tv
                                  size={
                                    14
                                  }
                                />
                              )}

                              {facility ===
                                "Wi-Fi" && (
                                <Wifi
                                  size={
                                    14
                                  }
                                />
                              )}

                              {facility}
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

                  {/* ===================================
                      BOOK ROOM BUTTON
                  =================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      handleBookRoom(
                        room
                      )
                    }
                    className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-700"
                  >
                    BOOK ROOM
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {/* =================================================
          BOOKING MODAL
      ================================================= */}

      {bookingRoom && (
        <BookingModal
          isOpen={true}
          roomId={bookingRoom._id}
          roomName={bookingRoom.name}
          selectedDate={today}
          onClose={
            handleCloseBooking
          }
        />
      )}
    </div>
  );
}