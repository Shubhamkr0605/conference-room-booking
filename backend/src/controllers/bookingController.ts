import { Response } from "express";
import { z } from "zod";

import {
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

import { Booking } from "../models/Booking.js";
import { Room } from "../models/Room.js";

/* =====================================================
   HELPERS
===================================================== */

/**
 * Validate a MongoDB ObjectId coming from req.params.
 *
 * Express/TypeScript can type route parameters as
 * string | string[] | undefined depending on the
 * installed type definitions.
 *
 * This helper safely converts that into a boolean.
 */
function isValidObjectId(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^[a-fA-F0-9]{24}$/.test(value)
  );
}

/* =====================================================
   VALIDATION SCHEMA
===================================================== */

const createBookingSchema = z.object({
  roomId: z
    .string()
    .min(1, "Room is required"),

  title: z
    .string()
    .trim()
    .min(
      2,
      "Title must be at least 2 characters"
    )
    .max(
      200,
      "Title is too long"
    ),

  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Date must be in YYYY-MM-DD format"
    ),

  startTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Start time must be in HH:mm format"
    ),

  endTime: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "End time must be in HH:mm format"
    ),

  description: z
    .string()
    .trim()
    .max(
      1000,
      "Description is too long"
    )
    .optional(),
});

/* =====================================================
   CREATE BOOKING
===================================================== */

export async function createBooking(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    /* ---------------------------------------------
       AUTHENTICATION
    --------------------------------------------- */

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /* ---------------------------------------------
       VALIDATE REQUEST BODY
    --------------------------------------------- */

    const result =
      createBookingSchema.safeParse(
        req.body
      );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message:
          result.error.issues[0]?.message ||
          "Invalid booking data",
      });
    }

    const {
      roomId,
      title,
      date,
      startTime,
      endTime,
      description,
    } = result.data;

    /* ---------------------------------------------
       VALIDATE ROOM ID
    --------------------------------------------- */

    if (!isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID",
      });
    }

    /* ---------------------------------------------
       VALIDATE DATE
    --------------------------------------------- */

    const bookingDate = new Date(
      `${date}T00:00:00`
    );

    if (
      Number.isNaN(
        bookingDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    /* ---------------------------------------------
       PREVENT PAST BOOKINGS
    --------------------------------------------- */

    const today = new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    if (bookingDate < today) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot book a room for a past date",
      });
    }

    /* ---------------------------------------------
       VALIDATE TIME RANGE
    --------------------------------------------- */

    if (startTime >= endTime) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be later than start time",
      });
    }

    /* ---------------------------------------------
       FIND ACTIVE ROOM
    --------------------------------------------- */

    const room =
      await Room.findOne({
        _id: roomId,
        isActive: true,
      });

    if (!room) {
      return res.status(404).json({
        success: false,
        message:
          "Room not found or is currently unavailable",
      });
    }

    /* ---------------------------------------------
       CHECK BOOKING CONFLICT
       
       Existing booking conflicts when:

       existing.startTime < new.endTime

       AND

       existing.endTime > new.startTime

       Example:

       09:00 - 10:00
       10:00 - 11:00

       Allowed.

       But:

       09:00 - 10:00
       09:30 - 10:30

       Not allowed.
    --------------------------------------------- */

    const conflictingBooking =
      await Booking.findOne({
        room: room._id,

        date,

        status: {
          $ne: "CANCELLED",
        },

        startTime: {
          $lt: endTime,
        },

        endTime: {
          $gt: startTime,
        },
      });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "This room is already booked for the selected time",
      });
    }

    /* ---------------------------------------------
       CREATE BOOKING
    --------------------------------------------- */

    const booking =
      await Booking.create({
        user: req.user.userId,

        room: room._id,

        title: title.trim(),

        date,

        startTime,

        endTime,

        description:
          description?.trim() ||
          undefined,

        status: "UPCOMING",
      });

    /* ---------------------------------------------
       POPULATE BOOKING
    --------------------------------------------- */

    const populatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "room",
          "name capacity location facilities"
        )
        .populate(
          "user",
          "name email department"
        );

    /* ---------------------------------------------
       RESPONSE
    --------------------------------------------- */

    return res.status(201).json({
      success: true,
      message:
        "Room booked successfully",

      booking:
        populatedBooking,
    });
  } catch (error) {
    console.error(
      "Create booking error:",
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
   GET MY BOOKINGS
===================================================== */

export async function getMyBookings(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    /* ---------------------------------------------
       AUTHENTICATION
    --------------------------------------------- */

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    /* ---------------------------------------------
       GET USER BOOKINGS
    --------------------------------------------- */

    const bookings =
      await Booking.find({
        user: req.user.userId,
      })
        .populate(
          "room",
          "name capacity location facilities"
        )
        .sort({
          date: -1,
          startTime: -1,
        });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get my bookings error:",
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
   CANCEL MY BOOKING
===================================================== */

export async function cancelMyBooking(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    /* ---------------------------------------------
       AUTHENTICATION
    --------------------------------------------- */

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required",
      });
    }

    /* ---------------------------------------------
       GET BOOKING ID
    --------------------------------------------- */

    const id: unknown =
      req.params.id;

    /* ---------------------------------------------
       VALIDATE BOOKING ID
    --------------------------------------------- */

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID",
      });
    }

    /* ---------------------------------------------
       FIND USER'S BOOKING
    --------------------------------------------- */

    const booking =
      await Booking.findOne({
        _id: id,
        user: req.user.userId,
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    /* ---------------------------------------------
       CHECK STATUS
    --------------------------------------------- */

    if (
      booking.status ===
      "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already cancelled",
      });
    }

    /* ---------------------------------------------
       CANCEL BOOKING
    --------------------------------------------- */

    booking.status =
      "CANCELLED";

    await booking.save();

    /* ---------------------------------------------
       RESPONSE
    --------------------------------------------- */

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Cancel my booking error:",
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
   GET ALL BOOKINGS — ADMIN
===================================================== */

export async function getAllBookings(
  _req: AuthenticatedRequest,
  res: Response
) {
  try {
    /* ---------------------------------------------
       GET ALL BOOKINGS
    --------------------------------------------- */

    const bookings =
      await Booking.find({})
        .populate(
          "room",
          "name capacity location facilities"
        )
        .populate(
          "user",
          "name email department role"
        )
        .sort({
          date: -1,
          startTime: -1,
        });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(
      "Get all bookings error:",
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
   ADMIN CANCEL BOOKING
===================================================== */

export async function adminCancelBooking(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    /* ---------------------------------------------
       GET BOOKING ID
    --------------------------------------------- */

    const id: unknown =
      req.params.id;

    /* ---------------------------------------------
       VALIDATE BOOKING ID
    --------------------------------------------- */

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking ID",
      });
    }

    /* ---------------------------------------------
       FIND BOOKING
    --------------------------------------------- */

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message:
          "Booking not found",
      });
    }

    /* ---------------------------------------------
       CHECK STATUS
    --------------------------------------------- */

    if (
      booking.status ===
      "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Booking is already cancelled",
      });
    }

    /* ---------------------------------------------
       CANCEL BOOKING
    --------------------------------------------- */

    booking.status =
      "CANCELLED";

    await booking.save();

    /* ---------------------------------------------
       RESPONSE
    --------------------------------------------- */

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    console.error(
      "Admin cancel booking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong",
    });
  }
}