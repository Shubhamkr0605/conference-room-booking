import { Response } from "express";

import {
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

import { User } from "../models/User.js";
import { Room } from "../models/Room.js";
import { Booking } from "../models/Booking.js";

/* =====================================================
   TYPES
===================================================== */

type BookingStatus =
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED";

/* =====================================================
   DATE / TIME HELPERS
===================================================== */

const APP_TIMEZONE =
  process.env.APP_TIMEZONE ||
  "Asia/Kolkata";

function getCurrentDateAndTime() {
  const now = new Date();

  const formatter =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: APP_TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    );

  const parts =
    formatter.formatToParts(now);

  const values: Record<
    string,
    string
  > = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      values[part.type] =
        part.value;
    }
  }

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
  };
}

/* =====================================================
   CALCULATE EFFECTIVE BOOKING STATUS
===================================================== */

function getEffectiveBookingStatus(
  date: string,
  endTime: string,
  storedStatus: BookingStatus
): BookingStatus {
  if (
    storedStatus === "CANCELLED"
  ) {
    return "CANCELLED";
  }

  const {
    date: today,
    time: currentTime,
  } = getCurrentDateAndTime();

  if (date < today) {
    return "COMPLETED";
  }

  if (date > today) {
    return "UPCOMING";
  }

  if (endTime <= currentTime) {
    return "COMPLETED";
  }

  return "UPCOMING";
}

/* =====================================================
   ADMIN DASHBOARD
===================================================== */

export async function getAdminDashboard(
  _req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      date: today,
      time: currentTime,
    } = getCurrentDateAndTime();

    /* =================================================
       BASIC COUNTS
    ================================================= */

    const [
      totalUsers,
      totalRooms,
      activeRooms,
      inactiveRooms,
      totalBookings,
      cancelledBookings,
      upcomingBookings,
      completedBookings,
      todayBookings,
    ] = await Promise.all([
      User.countDocuments({}),

      Room.countDocuments({}),

      Room.countDocuments({
        isActive: true,
      }),

      Room.countDocuments({
        isActive: false,
      }),

      Booking.countDocuments({}),

      Booking.countDocuments({
        status: "CANCELLED",
      }),

      /* =================================================
         UPCOMING BOOKINGS
      ================================================= */

      Booking.countDocuments({
        status: {
          $ne: "CANCELLED",
        },

        $or: [
          {
            date: {
              $gt: today,
            },
          },

          {
            date: today,
            endTime: {
              $gt: currentTime,
            },
          },
        ],
      }),

      /* =================================================
         COMPLETED BOOKINGS
      ================================================= */

      Booking.countDocuments({
        status: {
          $ne: "CANCELLED",
        },

        $or: [
          {
            date: {
              $lt: today,
            },
          },

          {
            date: today,
            endTime: {
              $lte: currentTime,
            },
          },
        ],
      }),

      /* =================================================
         TODAY'S BOOKINGS
      ================================================= */

      Booking.countDocuments({
        date: today,

        status: {
          $ne: "CANCELLED",
        },
      }),
    ]);

    /* =================================================
       RECENT BOOKINGS
    ================================================= */

    const recentBookingsRaw =
      await Booking.find({})
        .populate(
          "user",
          "name email department"
        )
        .populate(
          "room",
          "name location capacity"
        )
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .lean();

    const recentBookings =
      recentBookingsRaw.map(
        (booking) => ({
          ...booking,

          status:
            getEffectiveBookingStatus(
              booking.date,
              booking.endTime,
              booking.status
            ),
        })
      );

    /* =================================================
       ROOM BOOKING STATISTICS
    ================================================= */

    const roomUtilization =
      await Booking.aggregate([
        {
          $match: {
            status: {
              $ne: "CANCELLED",
            },
          },
        },

        {
          $group: {
            _id: "$room",

            bookingCount: {
              $sum: 1,
            },
          },
        },

        {
          $lookup: {
            from: "rooms",

            localField: "_id",

            foreignField: "_id",

            as: "room",
          },
        },

        {
          $unwind: {
            path: "$room",

            preserveNullAndEmptyArrays:
              true,
          },
        },

        {
          $project: {
            _id: 0,

            roomId: "$room._id",

            roomName: "$room.name",

            location:
              "$room.location",

            bookingCount: 1,
          },
        },

        {
          $sort: {
            bookingCount: -1,
          },
        },

        {
          $limit: 10,
        },
      ]);

    /* =================================================
       ROOM UTILIZATION PERCENTAGE
    ================================================= */

    const highestBookingCount =
      roomUtilization.length > 0
        ? roomUtilization[0]
            .bookingCount
        : 0;

    const formattedRoomUtilization =
      roomUtilization.map(
        (room) => ({
          roomId: room.roomId,

          roomName:
            room.roomName,

          location:
            room.location,

          bookingCount:
            room.bookingCount,

          percentage:
            highestBookingCount > 0
              ? Math.round(
                  (room.bookingCount /
                    highestBookingCount) *
                    100
                )
              : 0,
        })
      );

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        totalRooms,
        activeRooms,
        inactiveRooms,
        totalBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        todayBookings,
      },

      recentBookings,

      roomUtilization:
        formattedRoomUtilization,
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong",
    });
  }
}

/* =====================================================
   ADMIN REPORTS
===================================================== */

export async function getAdminReports(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const period =
      typeof req.query.period === "string"
        ? req.query.period
        : "month";

    const now = new Date();

    const currentYear =
      now.getFullYear();

    const currentMonth =
      now.getMonth();

    let startDate: Date;
    let endDate: Date;

    /* =================================================
       DATE RANGE
    ================================================= */

    switch (period) {
      case "today": {
        startDate = new Date(
          currentYear,
          currentMonth,
          now.getDate()
        );

        endDate = new Date(
          currentYear,
          currentMonth,
          now.getDate() + 1
        );

        break;
      }

      case "week": {
        const day =
          now.getDay();

        const difference =
          day === 0
            ? 6
            : day - 1;

        startDate = new Date(
          currentYear,
          currentMonth,
          now.getDate() -
            difference
        );

        endDate = new Date(
          startDate
        );

        endDate.setDate(
          endDate.getDate() + 7
        );

        break;
      }

      case "month": {
        startDate = new Date(
          currentYear,
          currentMonth,
          1
        );

        endDate = new Date(
          currentYear,
          currentMonth + 1,
          1
        );

        break;
      }

      case "all": {
        startDate = new Date(0);

        endDate = new Date(
          8640000000000000
        );

        break;
      }

      default: {
        return res.status(400).json({
          success: false,
          message:
            "Invalid period. Use today, week, month, or all",
        });
      }
    }

    /* =================================================
       BOOKINGS IN SELECTED PERIOD
    ================================================= */

    const bookings =
      await Booking.find({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      })
        .populate(
          "user",
          "name email department"
        )
        .populate(
          "room",
          "name location capacity"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    /* =================================================
       BASIC COUNTS
    ================================================= */

    const totalBookings =
      bookings.length;

    const upcomingBookings =
      bookings.filter(
        (booking) =>
          booking.status ===
          "UPCOMING"
      ).length;

    const completedBookings =
      bookings.filter(
        (booking) =>
          booking.status ===
          "COMPLETED"
      ).length;

    const cancelledBookings =
      bookings.filter(
        (booking) =>
          booking.status ===
          "CANCELLED"
      ).length;

    /* =================================================
       ROOM UTILIZATION
    ================================================= */

    const roomMap =
      new Map<
        string,
        {
          roomId: string;
          roomName: string;
          location: string;
          bookingCount: number;
        }
      >();

    for (const booking of bookings) {
      if (
        booking.status ===
        "CANCELLED"
      ) {
        continue;
      }

      const room =
        booking.room as
          | {
              _id: unknown;
              name: string;
              location: string;
            }
          | null;

      if (!room) {
        continue;
      }

      const roomId =
        String(room._id);

      const existing =
        roomMap.get(roomId);

      if (existing) {
        existing.bookingCount +=
          1;
      } else {
        roomMap.set(roomId, {
          roomId,
          roomName:
            room.name,
          location:
            room.location,
          bookingCount: 1,
        });
      }
    }

    const roomUtilization =
      Array.from(
        roomMap.values()
      ).sort(
        (a, b) =>
          b.bookingCount -
          a.bookingCount
      );

    const highestReportBookingCount =
      roomUtilization.length > 0
        ? roomUtilization[0]
            .bookingCount
        : 0;

    const formattedReportRoomUtilization =
      roomUtilization.map(
        (room) => ({
          ...room,

          percentage:
            highestReportBookingCount >
            0
              ? Math.round(
                  (room.bookingCount /
                    highestReportBookingCount) *
                    100
                )
              : 0,
        })
      );

    /* =================================================
       EMPLOYEE ACTIVITY
    ================================================= */

    const employeeMap =
      new Map<
        string,
        {
          userId: string;
          name: string;
          email: string;
          department?: string;
          bookingCount: number;
        }
      >();

    for (const booking of bookings) {
      if (
        booking.status ===
        "CANCELLED"
      ) {
        continue;
      }

      const user =
        booking.user as
          | {
              _id: unknown;
              name: string;
              email: string;
              department?: string;
            }
          | null;

      if (!user) {
        continue;
      }

      const userId =
        String(user._id);

      const existing =
        employeeMap.get(userId);

      if (existing) {
        existing.bookingCount +=
          1;
      } else {
        employeeMap.set(userId, {
          userId,
          name: user.name,
          email: user.email,
          department:
            user.department,
          bookingCount: 1,
        });
      }
    }

    const employeeActivity =
      Array.from(
        employeeMap.values()
      ).sort(
        (a, b) =>
          b.bookingCount -
          a.bookingCount
      );

    /* =================================================
       DAILY BOOKING TREND
    ================================================= */

    const dailyMap =
      new Map<
        string,
        number
      >();

    for (const booking of bookings) {
      if (
        booking.status ===
        "CANCELLED"
      ) {
        continue;
      }

      const date =
        booking.date;

      dailyMap.set(
        date,
        (dailyMap.get(date) ||
          0) + 1
      );
    }

    const dailyBookings =
      Array.from(
        dailyMap.entries()
      )
        .sort(
          ([dateA], [dateB]) =>
            dateA.localeCompare(
              dateB
            )
        )
        .map(
          ([date, count]) => ({
            date,
            count,
          })
        );

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      period,

      dateRange: {
        startDate,
        endDate,
      },

      summary: {
        totalBookings,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
      },

      roomUtilization:
        formattedReportRoomUtilization,

      employeeActivity,

      dailyBookings,

      recentBookings:
        bookings.slice(0, 20),
    });
  } catch (error) {
    console.error(
      "Admin reports error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong",
    });
  }
}