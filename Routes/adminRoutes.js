import express from "express";
import { login, logout } from "../controller/authController.js";
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

router.post("/login", login("admin"));

router.post("/logout", checkToken, logout);

router.get("/profile", checkToken, checkRole("admin"), getProfile);

router.get("/tasks", getAllTasksForAdmin);

router.get("/tasks/:id", getTaskById);

router.patch("/tasks/:id/approval", setTaskApproval);

// TODO: add checkToken + checkRole("admin") back once admin login exists.
router.get("/verifications", getAllVerifications);

router.get("/verifications/:id", getVerificationById);

router.patch("/verifications/:id/review", reviewVerification);

export default router;
