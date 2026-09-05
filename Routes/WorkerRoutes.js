import express from "express";
import { signup, login } from "../controller/authController.js";
import { getProfile } from "../controller/userController.js";
import checkToken from "../middlewares/checkToken.js";
import checkRole from "../middlewares/checkRole.js";

const router = express.Router();

router.post("/signup", signup("worker"));

router.post("/login", login("worker"));

router.get("/profile", checkToken, checkRole("worker"), getProfile);

export default router;
