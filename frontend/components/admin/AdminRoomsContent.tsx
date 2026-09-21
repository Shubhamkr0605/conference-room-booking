"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Building2,
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Power,
  MapPin,
  Users,
  X,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

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
  createdAt: string;
  updatedAt: string;
}

interface RoomsResponse {
  success: boolean;
  rooms: Room[];
  message?: string;
}

interface RoomResponse {
  success: boolean;
  room?: Room;
  message?: string;
}

/* =====================================================
   FORM TYPE
===================================================== */

interface RoomFormData {
  name: string;
  capacity: string;
  location: string;
  description: string;
  facilities: string[];
}

/* =====================================================
   CONFIRMATION MODAL TYPE
===================================================== */

interface StatusConfirmation {
  room: Room;
  action: "activate" | "deactivate";
}

/* =====================================================
   EMPTY FORM
===================================================== */

const emptyForm: RoomFormData = {
  name: "",
  capacity: "",
  location: "",
  description: "",
  facilities: [],
};

/* =====================================================
   COMPONENT
===================================================== */

export default function AdminRoomsContent() {
  /* ===================================================
     STATE
  =================================================== */

  const [rooms, setRooms] = useState<Room[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | "ACTIVE" | "INACTIVE">(
      "ALL"
    );

  /* ===================================================
     CREATE / EDIT MODAL
  =================================================== */

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingRoom, setEditingRoom] =
    useState<Room | null>(null);

  const [formData, setFormData] =
    useState<RoomFormData>(emptyForm);

  const [facilityInput, setFacilityInput] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  /* ===================================================
     STATUS UPDATE
  =================================================== */

  const [updatingRoomId, setUpdatingRoomId] =
    useState<string | null>(null);

  /* ===================================================
     STATUS CONFIRMATION MODAL
  =================================================== */

  const [statusConfirmation, setStatusConfirmation] =
    useState<StatusConfirmation | null>(null);

  /* ===================================================
     FETCH ALL ROOMS
  =================================================== */

  async function fetchRooms(
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
        `${API_URL}/api/rooms/admin`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const result: RoomsResponse =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Failed to load rooms"
        );

        return;
      }

      setRooms(result.rooms || []);
    } catch (error) {
      console.error(
        "Fetch rooms error:",
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

  /* ===================================================
     INITIAL LOAD
  =================================================== */

  useEffect(() => {
    fetchRooms();
  }, []);

  /* ===================================================
     OPEN CREATE MODAL
  =================================================== */

  function openCreateModal() {
    setEditingRoom(null);

    setFormData({
      ...emptyForm,
    });

    setFacilityInput("");
    setError("");
    setSuccessMessage("");

    setIsModalOpen(true);
  }

  /* ===================================================
     OPEN EDIT MODAL
  =================================================== */

  function openEditModal(room: Room) {
    setEditingRoom(room);

    setFormData({
      name: room.name,
      capacity: String(room.capacity),
      location: room.location,
      description: room.description || "",
      facilities: room.facilities || [],
    });

    setFacilityInput("");
    setError("");
    setSuccessMessage("");

    setIsModalOpen(true);
  }

  /* ===================================================
     CLOSE CREATE / EDIT MODAL
  =================================================== */

  function closeModal() {
    if (saving) {
      return;
    }

    setIsModalOpen(false);
    setEditingRoom(null);

    setFormData({
      ...emptyForm,
    });

    setFacilityInput("");
  }

  /* ===================================================
     FORM CHANGE
  =================================================== */

  function updateFormField(
    field: keyof RoomFormData,
    value: string
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /* ===================================================
     ADD FACILITY
  =================================================== */

  function addFacility() {
    const facility =
      facilityInput.trim();

    if (!facility) {
      return;
    }

    const alreadyExists =
      formData.facilities.some(
        (item) =>
          item.toLowerCase() ===
          facility.toLowerCase()
      );

    if (alreadyExists) {
      setFacilityInput("");
      return;
    }

    if (
      formData.facilities.length >= 30
    ) {
      setError(
        "You can add a maximum of 30 facilities."
      );

      return;
    }

    setFormData((current) => ({
      ...current,
      facilities: [
        ...current.facilities,
        facility,
      ],
    }));

    setFacilityInput("");
    setError("");
  }

  /* ===================================================
     REMOVE FACILITY
  =================================================== */

  function removeFacility(
    facilityToRemove: string
  ) {
    setFormData((current) => ({
      ...current,
      facilities:
        current.facilities.filter(
          (facility) =>
            facility !==
            facilityToRemove
        ),
    }));
  }

  /* ===================================================
     FACILITY ENTER KEY
  =================================================== */

  function handleFacilityKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      addFacility();
    }
  }

  /* ===================================================
     VALIDATE FORM
  =================================================== */

  function validateForm(): string | null {
    const name =
      formData.name.trim();

    const location =
      formData.location.trim();

    const capacity =
      Number(formData.capacity);

    if (name.length < 2) {
      return "Room name must be at least 2 characters.";
    }

    if (name.length > 100) {
      return "Room name is too long.";
    }

    if (
      !formData.capacity.trim() ||
      !Number.isInteger(capacity) ||
      capacity < 1
    ) {
      return "Capacity must be a whole number greater than 0.";
    }

    if (capacity > 1000) {
      return "Capacity cannot exceed 1000.";
    }

    if (location.length < 2) {
      return "Location is required.";
    }

    if (location.length > 200) {
      return "Location is too long.";
    }

    if (
      formData.description.length >
      1000
    ) {
      return "Description is too long.";
    }

    return null;
  }

  /* ===================================================
     SAVE ROOM
  =================================================== */

  async function saveRoom(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    /*
     * If the user typed a facility but
     * forgot to press Enter, include it.
     */

    const facilities = [
      ...formData.facilities,
    ];

    const pendingFacility =
      facilityInput.trim();

    if (
      pendingFacility &&
      !facilities.some(
        (item) =>
          item.toLowerCase() ===
          pendingFacility.toLowerCase()
      )
    ) {
      facilities.push(
        pendingFacility
      );
    }

    if (facilities.length > 30) {
      setError(
        "You can add a maximum of 30 facilities."
      );

      return;
    }

    const payload = {
      name: formData.name.trim(),

      capacity: Number(
        formData.capacity
      ),

      location:
        formData.location.trim(),

      description:
        formData.description.trim() ||
        undefined,

      facilities,
    };

    try {
      setSaving(true);

      const isEditing =
        Boolean(editingRoom);

      const url = isEditing
        ? `${API_URL}/api/rooms/${editingRoom?._id}`
        : `${API_URL}/api/rooms`;

      const response = await fetch(
        url,
        {
          method: isEditing
            ? "PATCH"
            : "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload
          ),
        }
      );

      const result: RoomResponse =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Failed to save room"
        );

        return;
      }

      /*
       * Update local state instead of
       * requiring a full page refresh.
       */

      if (result.room) {
        if (isEditing) {
          setRooms((currentRooms) =>
            currentRooms.map(
              (room) =>
                room._id ===
                result.room?._id
                  ? result.room!
                  : room
            )
          );
        } else {
          setRooms((currentRooms) => [
            result.room!,
            ...currentRooms,
          ]);
        }
      }

      setSuccessMessage(
        isEditing
          ? "Room updated successfully."
          : "Room created successfully."
      );

      closeModal();
    } catch (error) {
      console.error(
        "Save room error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /* ===================================================
     OPEN STATUS CONFIRMATION
  =================================================== */

  function toggleRoomStatus(
    room: Room
  ) {
    setError("");
    setSuccessMessage("");

    setStatusConfirmation({
      room,
      action: room.isActive
        ? "deactivate"
        : "activate",
    });
  }

  /* ===================================================
     CLOSE STATUS CONFIRMATION
  =================================================== */

  function closeStatusConfirmation() {
    if (updatingRoomId) {
      return;
    }

    setStatusConfirmation(null);
  }

  /* ===================================================
     CONFIRM STATUS UPDATE
  =================================================== */

  async function confirmStatusUpdate() {
    if (!statusConfirmation) {
      return;
    }

    const {
      room,
      action,
    } = statusConfirmation;

    const newStatus =
      action === "activate";

    try {
      setUpdatingRoomId(room._id);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        `${API_URL}/api/rooms/${room._id}/status`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            isActive: newStatus,
          }),
        }
      );

      const result: RoomResponse =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            `Failed to ${action} room`
        );

        return;
      }

      setRooms((currentRooms) =>
        currentRooms.map(
          (currentRoom) =>
            currentRoom._id ===
            room._id
              ? {
                  ...currentRoom,
                  isActive:
                    newStatus,
                }
              : currentRoom
        )
      );

      setSuccessMessage(
        newStatus
          ? "Room activated successfully."
          : "Room deactivated successfully."
      );

      setStatusConfirmation(null);
    } catch (error) {
      console.error(
        "Update room status error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setUpdatingRoomId(null);
    }
  }

  /* ===================================================
     FILTER ROOMS
  =================================================== */

  const filteredRooms = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return rooms.filter((room) => {
      const matchesSearch =
        !searchValue ||
        room.name
          .toLowerCase()
          .includes(searchValue) ||
        room.location
          .toLowerCase()
          .includes(searchValue) ||
        room.description
          ?.toLowerCase()
          .includes(searchValue) ||
        room.facilities.some(
          (facility) =>
            facility
              .toLowerCase()
              .includes(searchValue)
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" &&
          room.isActive) ||
        (statusFilter === "INACTIVE" &&
          !room.isActive);

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    rooms,
    search,
    statusFilter,
  ]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const totalRooms =
    rooms.length;

  const activeRooms =
    rooms.filter(
      (room) => room.isActive
    ).length;

  const inactiveRooms =
    rooms.filter(
      (room) => !room.isActive
    ).length;

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-gray-500"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading rooms...
          </p>
        </div>
      </div>
    );
  }

  /* ===================================================
     UI
  =================================================== */

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
            Rooms
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage conference rooms and their availability.
          </p>
        </div>

        <div className="flex gap-3">

          <button
            type="button"
            onClick={() =>
              fetchRooms(true)
            }
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
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

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            <Plus size={18} />

            Add Room
          </button>

        </div>
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="mb-6 grid gap-5 sm:grid-cols-3">

        {/* Total */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <Building2
                size={21}
                className="text-gray-700"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Rooms
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {totalRooms}
              </p>
            </div>

          </div>
        </div>

        {/* Active */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2
                size={21}
                className="text-green-600"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Active Rooms
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {activeRooms}
              </p>
            </div>

          </div>
        </div>

        {/* Inactive */}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              <XCircle
                size={21}
                className="text-gray-500"
              />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Inactive Rooms
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {inactiveRooms}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            className="text-lg font-bold text-red-500 hover:text-red-700"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">

          <span>
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
            className="text-lg font-bold text-green-500 hover:text-green-700"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

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
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search rooms by name, location or facility..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white"
            />

          </div>

          {/* Status */}

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "ALL"
                  | "ACTIVE"
                  | "INACTIVE"
              )
            }
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none"
          >
            <option value="ALL">
              All Status
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>

        </div>
      </div>

      {/* =================================================
          ROOM LIST
      ================================================= */}

      {filteredRooms.length === 0 ? (

        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">

          <Building2
            size={40}
            className="mx-auto text-gray-300"
          />

          <h3 className="mt-4 text-base font-bold text-gray-700">
            No rooms found
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Try changing your search or status filter.
          </p>

          <button
            type="button"
            onClick={
              openCreateModal
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
          >
            <Plus size={17} />

            Add Room
          </button>

        </div>

      ) : (

        <div className="grid gap-5 xl:grid-cols-2">

          {filteredRooms.map(
            (room) => {

              const isUpdating =
                updatingRoomId ===
                room._id;

              return (
                <article
                  key={room._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >

                  {/* Room Header */}

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                        <Building2
                          size={23}
                          className="text-gray-700"
                        />
                      </div>

                      <div className="min-w-0">

                        <h2 className="truncate text-lg font-bold text-gray-900">
                          {room.name}
                        </h2>

                        <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">

                          <MapPin
                            size={15}
                          />

                          <span>
                            {room.location}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* Status */}

                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        room.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >

                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          room.isActive
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />

                      {room.isActive
                        ? "ACTIVE"
                        : "INACTIVE"}

                    </span>

                  </div>

                  {/* Room Details */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">

                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">

                      <Users
                        size={17}
                        className="text-gray-500"
                      />

                      <div>

                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          Capacity
                        </p>

                        <p className="text-sm font-semibold text-gray-700">
                          {room.capacity}{" "}
                          {room.capacity ===
                          1
                            ? "person"
                            : "people"}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5">

                      <MapPin
                        size={17}
                        className="text-gray-500"
                      />

                      <div>

                        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                          Location
                        </p>

                        <p className="truncate text-sm font-semibold text-gray-700">
                          {room.location}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* Description */}

                  {room.description && (
                    <p className="mt-4 text-sm leading-6 text-gray-500">
                      {room.description}
                    </p>
                  )}

                  {/* Facilities */}

                  {room.facilities.length >
                    0 && (
                    <div className="mt-4">

                      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
                        Facilities
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {room.facilities.map(
                          (
                            facility
                          ) => (
                            <span
                              key={
                                facility
                              }
                              className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                            >
                              {
                                facility
                              }
                            </span>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* Actions */}

                  <div className="mt-5 flex items-center justify-end gap-2 border-t border-gray-100 pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          room
                        )
                      }
                      disabled={
                        isUpdating
                      }
                      className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      <Pencil
                        size={14}
                      />

                      Edit

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleRoomStatus(
                          room
                        )
                      }
                      disabled={
                        isUpdating
                      }
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        room.isActive
                          ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >

                      {isUpdating ? (
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />
                      ) : (
                        <Power
                          size={14}
                        />
                      )}

                      {room.isActive
                        ? "Deactivate"
                        : "Activate"}

                    </button>

                  </div>

                </article>
              );
            }
          )}

        </div>
      )}

      {/* =================================================
          ADD / EDIT ROOM MODAL
      ================================================= */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  {editingRoom
                    ? "Edit Room"
                    : "Add New Room"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingRoom
                    ? "Update the room details below."
                    : "Create a new conference room."}
                </p>

              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>

            </div>

            {/* Modal Form */}

            <form
              onSubmit={saveRoom}
              className="p-6"
            >

              <div className="grid gap-5 sm:grid-cols-2">

                {/* Room Name */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Room Name
                  </label>

                  <input
                    type="text"
                    value={
                      formData.name
                    }
                    onChange={(event) =>
                      updateFormField(
                        "name",
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. Board Room"
                    maxLength={100}
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-50"
                  />

                </div>

                {/* Capacity */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Capacity
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="1000"
                    step="1"
                    value={
                      formData.capacity
                    }
                    onChange={(event) =>
                      updateFormField(
                        "capacity",
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. 12"
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-50"
                  />

                </div>

                {/* Location */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={
                      formData.location
                    }
                    onChange={(event) =>
                      updateFormField(
                        "location",
                        event.target
                          .value
                      )
                    }
                    placeholder="e.g. 2nd Floor"
                    maxLength={200}
                    disabled={saving}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-50"
                  />

                </div>

                {/* Description */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={
                      formData.description
                    }
                    onChange={(event) =>
                      updateFormField(
                        "description",
                        event.target
                          .value
                      )
                    }
                    placeholder="Describe the room..."
                    maxLength={1000}
                    rows={4}
                    disabled={saving}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-50"
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {
                      formData
                        .description
                        .length
                    }
                    /1000
                  </p>

                </div>

                {/* Facilities */}

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Facilities
                  </label>

                  <div className="flex gap-2">

                    <input
                      type="text"
                      value={
                        facilityInput
                      }
                      onChange={(
                        event
                      ) =>
                        setFacilityInput(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={
                        handleFacilityKeyDown
                      }
                      placeholder="e.g. Projector"
                      disabled={saving}
                      className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-400 disabled:bg-gray-50"
                    />

                    <button
                      type="button"
                      onClick={
                        addFacility
                      }
                      disabled={
                        saving ||
                        !facilityInput.trim()
                      }
                      className="rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Add
                    </button>

                  </div>

                  <p className="mt-2 text-xs text-gray-400">
                    Type a facility and press Enter or click Add.
                  </p>

                  {/* Facility Chips */}

                  {formData.facilities
                    .length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">

                      {formData.facilities.map(
                        (
                          facility
                        ) => (
                          <span
                            key={
                              facility
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700"
                          >

                            {
                              facility
                            }

                            <button
                              type="button"
                              onClick={() =>
                                removeFacility(
                                  facility
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-full text-gray-400 hover:text-red-500"
                            >
                              <X
                                size={
                                  13
                                }
                              />
                            </button>

                          </span>
                        )
                      )}

                    </div>
                  )}

                </div>

              </div>

              {/* Form Error */}

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Buttons */}

              <div className="mt-6 flex justify-end gap-3 border-t border-gray-100 pt-5">

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={saving}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {saving ? (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingRoom
                      ? "Save Changes"
                      : "Create Room"}

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =================================================
          ACTIVATE / DEACTIVATE CONFIRMATION MODAL
      ================================================= */}

      {statusConfirmation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-[2px]"
          onClick={closeStatusConfirmation}
        >

          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Icon */}

            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                statusConfirmation.action ===
                "deactivate"
                  ? "bg-red-100"
                  : "bg-green-100"
              }`}
            >

              {statusConfirmation.action ===
              "deactivate" ? (
                <AlertTriangle
                  size={27}
                  className="text-red-600"
                />
              ) : (
                <Power
                  size={27}
                  className="text-green-600"
                />
              )}

            </div>

            {/* Title + Message */}

            <div className="mt-5 text-center">

              <h3 className="text-xl font-bold text-gray-900">

                {statusConfirmation.action ===
                "deactivate"
                  ? "Deactivate Room?"
                  : "Activate Room?"}

              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">

                Are you sure you want to{" "}

                <span className="font-semibold text-gray-800">
                  {statusConfirmation.action ===
                  "deactivate"
                    ? "deactivate"
                    : "activate"}
                </span>{" "}

                <span className="font-semibold text-gray-800">
                  "{statusConfirmation.room.name}"
                </span>
                ?

              </p>

              {/* Deactivate warning */}

              {statusConfirmation.action ===
                "deactivate" && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-left">

                  <div className="flex gap-3">

                    <AlertTriangle
                      size={17}
                      className="mt-0.5 shrink-0 text-red-500"
                    />

                    <p className="text-xs leading-5 text-red-600">
                      Employees will no longer be able to book this room while it is inactive.
                    </p>

                  </div>

                </div>
              )}

              {/* Activate information */}

              {statusConfirmation.action ===
                "activate" && (
                <div className="mt-4 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-left">

                  <div className="flex gap-3">

                    <Power
                      size={17}
                      className="mt-0.5 shrink-0 text-green-600"
                    />

                    <p className="text-xs leading-5 text-green-700">
                      This room will become available for employees to book again.
                    </p>

                  </div>

                </div>
              )}

            </div>

            {/* Buttons */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={
                  closeStatusConfirmation
                }
                disabled={
                  Boolean(
                    updatingRoomId
                  )
                }
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmStatusUpdate
                }
                disabled={
                  Boolean(
                    updatingRoomId
                  )
                }
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  statusConfirmation.action ===
                  "deactivate"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >

                {updatingRoomId ? (
                  <span className="flex items-center justify-center gap-2">

                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />

                    Please wait...

                  </span>
                ) : statusConfirmation.action ===
                  "deactivate" ? (
                  "Deactivate"
                ) : (
                  "Activate"
                )}

              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}