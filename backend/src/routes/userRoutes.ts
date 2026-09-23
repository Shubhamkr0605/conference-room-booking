import { Router } from "express";

import {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  updateUserRole,
} from "../controllers/userController.js";

import {
  requireAuth,
} from "../middleware/authMiddleware.js";

import {
  requireRole,
} from "../middleware/roleMiddleware.js";

const router = Router();

/* =====================================================
   CURRENT USER PROFILE
===================================================== */

/*
 * GET /api/users/me
 *
 * Returns the currently logged-in user's profile
 * and settings.
 */
router.get(
  "/me",
  requireAuth,
  getMyProfile
);

/*
 * PATCH /api/users/me
 *
 * Updates the currently logged-in user's
 * profile and booking preferences.
 */
router.patch(
  "/me",
  requireAuth,
  updateMyProfile
);

/* =====================================================
   ADMIN USER MANAGEMENT
===================================================== */

/*
 * GET /api/users
 *
 * Only ADMIN users can access this.
 */
router.get(
  "/",
  requireAuth,
  requireRole("ADMIN"),
  getAllUsers
);

/*
 * PATCH /api/users/:id/role
 *
 * Only ADMIN users can change another user's role.
 */
router.patch(
  "/:id/role",
  requireAuth,
  requireRole("ADMIN"),
  updateUserRole
);

export default router;