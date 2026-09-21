"use client";

interface Room {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  isActive: boolean;
}

interface RoomFiltersProps {
  locations: string[];
  selectedLocation: string;
  onLocationChange: (
    location: string
  ) => void;

  rooms: Room[];
  selectedRoom: string;
  onRoomChange: (
    roomId: string
  ) => void;
}

export default function RoomFilters({
  locations,
  selectedLocation,
  onLocationChange,
  rooms,
  selectedRoom,
  onRoomChange,
}: RoomFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {/* Location Filter */}

      <select
        value={selectedLocation}
        onChange={(event) =>
          onLocationChange(
            event.target.value
          )
        }
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-400"
      >
        <option value="All Locations">
          All Locations
        </option>

        {locations
          .filter(
            (location) =>
              location !==
              "All Locations"
          )
          .map((location) => (
            <option
              key={location}
              value={location}
            >
              {location}
            </option>
          ))}
      </select>

      {/* Room Filter */}

      <select
        value={selectedRoom}
        onChange={(event) =>
          onRoomChange(
            event.target.value
          )
        }
        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-400"
      >
        <option value="All Rooms">
          All Rooms
        </option>

        {rooms.map((room) => (
          <option
            key={room._id}
            value={room._id}
          >
            {room.name}
          </option>
        ))}
      </select>
    </div>
  );
}