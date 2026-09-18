import express from "express";
import { signup, login, logout } from "../controller/authController.js";
import { getProfile } from "../controller/userController.js";
import {
  createTask,
  getTasks,
  getTaskById,
} from "../controller/taskController.js";
import checkToken from "../middlewares/checkToken.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router();

router.post("/signup", signup("client"));

router.post("/login", login("client"));

router.post("/logout", checkToken, logout);

router.get("/profile", checkToken, checkRole("client"), getProfile);

router.post("/tasks", checkToken, checkRole("client"), createTask);

router.get("/tasks", checkToken, checkRole("client"), getTasks);

router.get("/tasks/:id", checkToken, checkRole("client"), getTaskById);

export default router;
