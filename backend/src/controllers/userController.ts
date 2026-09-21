import { Response } from "express";
import { z } from "zod";

import {
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

import { User } from "../models/User.js";

/* =====================================================
   VALIDATION
===================================================== */

const updateUserRoleSchema = z.object({
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

/* =====================================================
   OBJECT ID VALIDATION
===================================================== */

function isValidObjectId(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    /^[a-fA-F0-9]{24}$/.test(value)
  );
}

/* =====================================================
   GET ALL USERS
   ADMIN ONLY
===================================================== */

export async function getAllUsers(
  _req: AuthenticatedRequest,
  res: Response
) {
  try {
    const users = await User.find({})
      .select(
        "_id name email department role profileImage defaultLocation favoriteRoom defaultDuration calendarView timezone notifications workingHours createdAt updatedAt"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}

/* =====================================================
   UPDATE USER ROLE
   ADMIN ONLY
===================================================== */

export async function updateUserRole(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    /* -------------------------------------------------
       Authentication check
    ------------------------------------------------- */

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    /* -------------------------------------------------
       Validate user ID
    ------------------------------------------------- */

    const id: unknown = req.params.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    /* -------------------------------------------------
       Validate request body
    ------------------------------------------------- */

    const result =
      updateUserRoleSchema.safeParse(
        req.body
      );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message:
          "Role must be ADMIN or EMPLOYEE",
      });
    }

    const { role } = result.data;

    /* -------------------------------------------------
       Find target user
    ------------------------------------------------- */

    const targetUser =
      await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* -------------------------------------------------
       Prevent unnecessary role update
    ------------------------------------------------- */

    if (targetUser.role === role) {
      return res.status(400).json({
        success: false,
        message: `User is already ${role}`,
      });
    }

    /* -------------------------------------------------
       Prevent admin from removing own admin access
    ------------------------------------------------- */

    if (
      req.user.userId ===
        targetUser._id.toString() &&
      role === "EMPLOYEE"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot remove your own admin access",
      });
    }

    /* -------------------------------------------------
       Prevent removing the last administrator
    ------------------------------------------------- */

    if (
      targetUser.role === "ADMIN" &&
      role === "EMPLOYEE"
    ) {
      const adminCount =
        await User.countDocuments({
          role: "ADMIN",
        });

      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message:
            "At least one administrator must remain",
        });
      }
    }

    /* -------------------------------------------------
       Update role
    ------------------------------------------------- */

    targetUser.role = role;

    await targetUser.save();

    /* -------------------------------------------------
       Response
    ------------------------------------------------- */

    return res.status(200).json({
      success: true,
      message:
        role === "ADMIN"
          ? "User promoted to administrator"
          : "Administrator role removed",

      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        department:
          targetUser.department,
        role: targetUser.role,
      },
    });
  } catch (error) {
    console.error(
      "Update user role error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
}