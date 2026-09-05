import express from "express";
import { addClient } from "../Controller/clientController"
const router = express.Router;


router.get('/',addClient);

export default router