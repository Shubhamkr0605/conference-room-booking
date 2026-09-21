import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "ADMIN" | "EMPLOYEE";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  department?: string;
  role: UserRole;
  profileImage?: string;

  defaultLocation?: string;
  favoriteRoom?: mongoose.Types.ObjectId;
  defaultDuration: number;
  calendarView: "DAY" | "WEEK" | "MONTH";
  timezone: string;

  notifications: {
    bookingConfirmation: boolean;
    bookingCancellation: boolean;
    bookingReminder: boolean;
    roomAvailable: boolean;
  };

  workingHours: {
    monday: {
      enabled: boolean;
      start: string;
      end: string;
    };

    tuesday: {
      enabled: boolean;
      start: string;
      end: string;
    };

    wednesday: {
      enabled: boolean;
      start: string;
      end: string;
    };

    thursday: {
      enabled: boolean;
      start: string;
      end: string;
    };

    friday: {
      enabled: boolean;
      start: string;
      end: string;
    };

    saturday: {
      enabled: boolean;
      start: string;
      end: string;
    };

    sunday: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

/* =====================================================
   WORKING DAY SCHEMA
===================================================== */

const workingDaySchema = new Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },

    start: {
      type: String,
      default: "09:00",
    },

    end: {
      type: String,
      default: "18:00",
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   USER SCHEMA
===================================================== */

const userSchema = new Schema<IUser>(
  {
    /* -------------------- Basic Information -------------------- */

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    department: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    /* -------------------- Role -------------------- */

    role: {
      type: String,
      enum: ["ADMIN", "EMPLOYEE"],
      default: "EMPLOYEE",
      required: true,
      index: true,
    },

    /* -------------------- Profile -------------------- */

    profileImage: {
      type: String,
      trim: true,
    },

    /* -------------------- Booking Preferences -------------------- */

    defaultLocation: {
      type: String,
      trim: true,
    },

    favoriteRoom: {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },

    defaultDuration: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },

    calendarView: {
      type: String,
      enum: ["DAY", "WEEK", "MONTH"],
      default: "WEEK",
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    /* -------------------- Notifications -------------------- */

    notifications: {
      bookingConfirmation: {
        type: Boolean,
        default: true,
      },

      bookingCancellation: {
        type: Boolean,
        default: true,
      },

      bookingReminder: {
        type: Boolean,
        default: true,
      },

      roomAvailable: {
        type: Boolean,
        default: false,
      },
    },

    /* -------------------- Working Hours -------------------- */

    workingHours: {
      monday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      tuesday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      wednesday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      thursday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      friday: {
        type: workingDaySchema,
        default: () => ({}),
      },

      saturday: {
        type: workingDaySchema,
        default: () => ({
          enabled: false,
        }),
      },

      sunday: {
        type: workingDaySchema,
        default: () => ({
          enabled: false,
        }),
      },
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   MODEL
===================================================== */

export const User = mongoose.model<IUser>(
  "User",
  userSchema
);