import { Router } from "express";

import {
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