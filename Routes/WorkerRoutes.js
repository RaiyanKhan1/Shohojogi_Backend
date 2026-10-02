import express from "express";
import { signup, login, logout } from "../controller/authController.js";
import { getProfile } from "../controller/userController.js";
import checkToken from "../middlewares/checkToken.js";
import checkRole from "../middlewares/checkRole.js";
import { applyToTask, getMyApplications } from "../Controller/applicationController.js";

const router = express.Router();

// Worker applies to a task.
router.post(
    "/tasks/:taskId/apply",
    checkToken,
    checkRole("worker"),
    applyToTask,
);

// Worker views their own applications.
router.get(
    "/applications",
    checkToken,
    checkRole("worker"),
    getMyApplications,
);

router.post("/signup", signup("worker"));

router.post("/login", login("worker"));

router.post("/logout", checkToken, logout);

router.get("/profile", checkToken, checkRole("worker"), getProfile);



export default router;
