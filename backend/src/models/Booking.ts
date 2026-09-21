import mongoose, { Document, Schema } from "mongoose";

export type BookingStatus =
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED";

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;

  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;

  status: BookingStatus;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    room: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
      index: true,
    },

    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: [
        "UPCOMING",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "UPCOMING",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
 * Useful when checking room availability
 * for a particular date.
 */
bookingSchema.index({
  room: 1,
  date: 1,
  status: 1,
});

bookingSchema.index({
  user: 1,
  date: 1,
});

export const Booking = mongoose.model<IBooking>(
  "Booking",
  bookingSchema
);