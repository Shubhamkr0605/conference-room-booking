"use client";

import {
  CalendarDays,
  MapPin,
  Users,
  Wifi,
  Monitor,
  Video,
  Tv,
  Presentation,
} from "lucide-react";

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

interface Room {
  _id: string;
  name: string;
  capacity: number;
  location: string;
  description?: string;
  facilities: string[];
  isActive: boolean;
  booking?: Booking;
}

interface RoomCardProps {
  room: Room;
  selectedDate: Date;
}

export default function RoomCard({
  room,
  selectedDate,
}: RoomCardProps) {
  const booking = room.booking;

  const formatTime = (
    time?: string
  ) => {
    if (!time) return "";

    const [hours, minutes] =
      time.split(":");

    const date = new Date();

    date.setHours(
      Number(hours),
      Number(minutes)
    );

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getFacilityIcon = (
    facility: string
  ) => {
    const value =
      facility.toLowerCase();

    if (value.includes("wi-fi")) {
      return <Wifi size={15} />;
    }

    if (
      value.includes("projector")
    ) {
      return (
        <Presentation size={15} />
      );
    }

    if (
      value.includes("video")
    ) {
      return <Video size={15} />;
    }

    if (value.includes("tv")) {
      return <Tv size={15} />;
    }

    if (
      value.includes("whiteboard")
    ) {
      return (
        <Monitor size={15} />
      );
    }

    return (
      <Monitor size={15} />
    );
  };

  const handleBookRoom = () => {
    window.dispatchEvent(
      new CustomEvent(
        "open-booking-modal",
        {
          detail: {
            roomId: room._id,
            roomName: room.name,
            selectedDate,
          },
        }
      )
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* TOP BORDER */}

      <div className="h-2 bg-[#d65345]" />

      <div className="p-6">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {room.name}
            </h3>

            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
              <MapPin size={16} />

              <span>
                {room.location}
              </span>
            </div>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              booking
                ? "bg-red-50 text-red-600"
                : "bg-green-50 text-green-600"
            }`}
          >
            {booking
              ? "OCCUPIED"
              : "AVAILABLE"}
          </span>
        </div>

        {/* CAPACITY */}

        <div className="mt-5 rounded-xl bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-white p-2">
              <Users
                size={20}
                className="text-gray-600"
              />
            </div>

            <div>
              <p className="text-xs text-gray-400">
                Capacity
              </p>

              <p className="font-semibold text-gray-900">
                {room.capacity}{" "}
                {room.capacity === 1
                  ? "Person"
                  : "People"}
              </p>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}

        {room.description && (
          <p className="mt-4 text-sm text-gray-500">
            {room.description}
          </p>
        )}

        {/* FACILITIES */}

        {room.facilities?.length >
          0 && (
          <div className="mt-5">
            <p className="mb-3 text-sm font-semibold text-gray-900">
              Facilities
            </p>

            <div className="grid grid-cols-2 gap-2">
              {room.facilities
                .slice(0, 4)
                .map(
                  (facility) => (
                    <div
                      key={
                        facility
                      }
                      className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600"
                    >
                      {getFacilityIcon(
                        facility
                      )}

                      <span>
                        {facility}
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>
        )}

        {/* BOOKING SCHEDULE */}

        {booking && (
          <div className="mt-5 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <CalendarDays
                size={18}
                className="text-gray-500"
              />

              <div>
                <p className="text-xs text-gray-400">
                  Schedule
                </p>

                <p className="text-sm font-semibold text-gray-900">
                  {formatTime(
                    booking.startTime
                  )}{" "}
                  -{" "}
                  {formatTime(
                    booking.endTime
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOOK BUTTON */}

        <button
          type="button"
          onClick={handleBookRoom}
          disabled={Boolean(
            booking
          )}
          className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
            booking
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-[#111827] text-white hover:bg-[#1f2937]"
          }`}
        >
          {booking
            ? "OCCUPIED"
            : "BOOK ROOM"}
        </button>
      </div>
    </div>
  );
}