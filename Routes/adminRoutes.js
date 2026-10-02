import express from "express";

import {
  login,
  logout,
} from "../controller/authController.js";

import { getProfile } from "../controller/userController.js";

import {
  getAllTasksForAdmin,
  getTaskById,
  setTaskApproval,
} from "../controller/taskController.js";
import {
  getAllVerifications,
  getVerificationById,
  reviewVerification,
} from "../Controller/verificationController.js";

import checkToken from "../middlewares/checkToken.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router();

// Admin login is public because the user is not authenticated yet.
router.post("/login", login("admin"));

// Everything below this line requires:
// 1. A valid JWT
// 2. The user's role must be "admin"
router.use(checkToken, checkRole("admin"));

// Logout
router.post("/logout", logout);

// Admin profile
router.get("/profile", getProfile);

// Admin task management
router.get("/tasks", getAllTasksForAdmin);

router.get("/tasks/:id", getTaskById);

router.patch("/tasks/:id/approval", setTaskApproval);

// TODO: add checkToken + checkRole("admin") back once admin login exists.
router.get("/verifications", getAllVerifications);

router.get("/verifications/:id", getVerificationById);

router.patch("/verifications/:id/review", reviewVerification);

export default router;