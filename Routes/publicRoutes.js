import express from "express";
import {
  getApprovedTasks,
  getApprovedTaskById,
} from "../controller/taskController.js";

const router = express.Router();

router.get("/tasks", getApprovedTasks);

router.get("/tasks/:id", getApprovedTaskById);

export default router;
