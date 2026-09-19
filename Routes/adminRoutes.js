import express from "express";
import { login, logout } from "../controller/authController.js";
import { getProfile } from "../controller/userController.js";
import {
  getAllTasksForAdmin,
  getTaskById,
  setTaskApproval,
} from "../controller/taskController.js";
import checkToken from "../middlewares/checkToken.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router();

router.post("/login", login("admin"));

router.post("/logout", checkToken, logout);

router.get("/profile", checkToken, checkRole("admin"), getProfile);

router.get("/tasks", getAllTasksForAdmin);

router.get("/tasks/:id", getTaskById);

router.patch(
  "/tasks/:id/approval",
  checkToken,
  checkRole("admin"),
  setTaskApproval,
);

export default router;
