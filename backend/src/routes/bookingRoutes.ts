import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  cancelMyBooking,
  getAllBookings,
  adminCancelBooking,
} from "../controllers/bookingController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

const router = Router();

/* =====================================================
   EMPLOYEE + ADMIN
===================================================== */

/* Create booking */
router.post(
  "/",
  requireAuth,
  createBooking
);

/* Get current user's bookings */
router.get(
  "/my",
  requireAuth,
  getMyBookings
);

/* Cancel current user's booking */
router.patch(
  "/:id/cancel",
  requireAuth,
  cancelMyBooking
);

/* =====================================================
   ADMIN ONLY
===================================================== */

/* Get all bookings */
router.get(
  "/admin",
  requireAuth,
  requireRole("ADMIN"),
  getAllBookings
);

/* Cancel any booking */
router.patch(
  "/:id/admin-cancel",
  requireAuth,
  requireRole("ADMIN"),
  adminCancelBooking
);

export default router;