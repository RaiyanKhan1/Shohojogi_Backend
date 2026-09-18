import express from "express";
import { signup, login, logout } from "../controller/authController.js";
import { getProfile } from "../controller/userController.js";
import {
  createTask,
  getTasks,
  getTaskById,
  deleteTaskById,
} from "../controller/taskController.js";
import checkToken from "../middlewares/checkToken.js";
import checkRole from "../middlewares/checkRole.js";
import { upload } from "../middlewares/multer.middleware.js";
import { multerErrorHandling } from "../middlewares/multerError.middleware.js";

const router = express.Router();

router.post("/signup", signup("client"));

router.post("/login", login("client"));

router.post("/logout", checkToken, logout);

router.get("/profile", checkToken, checkRole("client"), getProfile);

router.post(
  "/tasks",
  checkToken,
  checkRole("client"),
  upload.single("taskImage"),
  multerErrorHandling,
  createTask,
);

router.delete("/tasks/:id", checkToken, checkRole("client"), deleteTaskById);

router.get("/tasks", checkToken, checkRole("client"), getTasks);

router.get("/tasks/:id", checkToken, checkRole("client"), getTaskById);

export default router;
