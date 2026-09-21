"use client";

export default function DashboardHeader() {
  return (
    <section className="mb-8">
      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#c95143]">
            Conference Rooms
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Room Availability
          </h1>

          <p className="mt-2 text-gray-600">
            Find and book a conference room for your meeting.
          </p>
        </div>

        <div className="flex w-fit rounded-xl border border-[#e7dcd8] bg-white p-1 shadow-sm">
          <button
            type="button"
            className="rounded-lg bg-[#151515] px-5 py-2 text-sm font-bold text-white"
          >
            Day
          </button>

          <button
            type="button"
            className="rounded-lg px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Week
          </button>

          <button
            type="button"
            className="rounded-lg px-5 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
          >
            Month
          </button>
        </div>
      </div>
    </section>
  );
}