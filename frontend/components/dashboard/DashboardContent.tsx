"use client";

import { useEffect, useMemo, useState } from "react";

import DashboardHeader from "./DashboardHeader";
import DateNavigation from "./DateNavigation";
import RoomFilters from "./RoomFilters";
import RoomCard from "./RoomCard";

import BookingModal from "@/components/bookings/BookingModal";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

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

  room:
    | string
    | {
        _id: string;
        name: string;
      };

  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;

  status:
    | "UPCOMING"
    | "COMPLETED"
    | "CANCELLED";
}

/* =====================================================
   COMPONENT
===================================================== */

export default function DashboardContent() {
  /* ===================================================
     STATE
  =================================================== */

  const [rooms, setRooms] =
    useState<Room[]>([]);

  const [bookings, setBookings] =
    useState<Booking[]>([]);

  const [selectedDate, setSelectedDate] =
    useState<Date>(new Date());

  const [selectedLocation, setSelectedLocation] =
    useState("All Locations");

  const [selectedRoom, setSelectedRoom] =
    useState("All Rooms");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ===================================================
     BOOKING MODAL
  =================================================== */

  const [bookingRoom, setBookingRoom] =
    useState<Room | null>(null);

  /* ===================================================
     FORMAT DATE FOR API / BOOKING MODAL
  =================================================== */

  function formatDate(date: Date): string {
    const year =
      date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* ===================================================
     FETCH ROOMS
  =================================================== */

  async function fetchRooms() {
    try {
      const response = await fetch(
        `${API_URL}/api/rooms`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
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

      setRooms(
        Array.isArray(data.rooms)
          ? data.rooms
          : []
      );
    } catch (error) {
      console.error(
        "Fetch rooms error:",
        error
      );

      throw error;
    }
  }

  /* ===================================================
     FETCH MY BOOKINGS
  =================================================== */

  async function fetchBookings() {
    try {
      const response = await fetch(
        `${API_URL}/api/bookings/my`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load bookings"
        );
      }

      setBookings(
        Array.isArray(data.bookings)
          ? data.bookings
          : []
      );
    } catch (error) {
      console.error(
        "Fetch bookings error:",
        error
      );

      throw error;
    }
  }

  /* ===================================================
     LOAD DASHBOARD DATA
  =================================================== */

  async function loadDashboardData() {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        fetchRooms(),
        fetchBookings(),
      ]);
    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    loadDashboardData();
  }, []);

  /* ===================================================
     LOCATION OPTIONS
  =================================================== */

  const locations = useMemo(() => {
    const uniqueLocations =
      Array.from(
        new Set(
          rooms.map(
            (room) =>
              room.location
          )
        )
      );

    return [
      "All Locations",
      ...uniqueLocations,
    ];
  }, [rooms]);

  /* ===================================================
     FILTER ROOMS
  =================================================== */

  const filteredRooms = useMemo(() => {
    return rooms.filter(
      (room) => {
        const locationMatches =
          selectedLocation ===
            "All Locations" ||
          room.location ===
            selectedLocation;

        const roomMatches =
          selectedRoom ===
            "All Rooms" ||
          room._id ===
            selectedRoom;

        return (
          locationMatches &&
          roomMatches
        );
      }
    );
  }, [
    rooms,
    selectedLocation,
    selectedRoom,
  ]);

  /* ===================================================
     GET BOOKING FOR SELECTED ROOM + DATE
  =================================================== */

  function getRoomBooking(
    roomId: string
  ): Booking | undefined {
    const date =
      formatDate(
        selectedDate
      );

    return bookings.find(
      (booking) => {
        /* Date must match */

        if (
          booking.date !== date
        ) {
          return false;
        }

        /* Cancelled bookings do not block the room */

        if (
          booking.status ===
          "CANCELLED"
        ) {
          return false;
        }

        /* Get booking room ID */

        const bookingRoomId =
          typeof booking.room ===
          "string"
            ? booking.room
            : booking.room._id;

        return (
          bookingRoomId ===
          roomId
        );
      }
    );
  }

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

    /*
     * Refresh room/booking information.
     * This makes a newly created booking
     * appear on the dashboard.
     */

    loadDashboardData();
  }

  /* ===================================================
     LOADING STATE
  =================================================== */

  if (loading) {
    return (
      <div className="space-y-6">

        <DashboardHeader />

        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

          <p className="mt-4 text-sm text-gray-500">
            Loading conference rooms...
          </p>

        </div>

      </div>
    );
  }

  /* ===================================================
     ERROR STATE
  =================================================== */

  if (error) {
    return (
      <div className="space-y-6">

        <DashboardHeader />

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <p className="font-semibold text-red-700">
            Unable to load dashboard
          </p>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadDashboardData
            }
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  /* ===================================================
     MAIN DASHBOARD
  =================================================== */

  return (
    <>
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <DashboardHeader />

        {/* =================================================
            DATE NAVIGATION + FILTERS
        ================================================= */}

        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">

          {/* DATE */}

          <DateNavigation
            selectedDate={
              selectedDate
            }
            onDateChange={
              setSelectedDate
            }
          />

          {/* FILTERS */}

          <RoomFilters
            locations={
              locations
            }
            selectedLocation={
              selectedLocation
            }
            onLocationChange={
              setSelectedLocation
            }
            rooms={rooms}
            selectedRoom={
              selectedRoom
            }
            onRoomChange={
              setSelectedRoom
            }
          />

        </div>

        {/* =================================================
            ROOM SECTION HEADER
        ================================================= */}

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-semibold text-gray-900">

              {selectedDate.toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  day: "numeric",
                }
              )}{" "}
              Rooms

            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose a room based on your
              requirements.
            </p>

          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">

            {filteredRooms.length}{" "}

            {filteredRooms.length ===
            1
              ? "Room"
              : "Rooms"}

          </div>

        </div>

        {/* =================================================
            ROOMS
        ================================================= */}

        {filteredRooms.length ===
        0 ? (

          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <p className="text-gray-500">
              No conference rooms found.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {filteredRooms.map(
              (room) => {

                const booking =
                  getRoomBooking(
                    room._id
                  );

                return (
                  <RoomCard
                    key={room._id}
                    room={room}
                    booking={booking}
                    onBook={
                      handleBookRoom
                    }
                  />
                );
              }
            )}

          </div>

        )}

      </div>

      {/* =================================================
          BOOKING MODAL
      ================================================= */}

      {bookingRoom && (
        <BookingModal
          isOpen={true}
          roomId={
            bookingRoom._id
          }
          roomName={
            bookingRoom.name
          }
          selectedDate={
            formatDate(
              selectedDate
            )
          }
          onClose={
            handleCloseBooking
          }
        />
      )}
    </>
  );
}