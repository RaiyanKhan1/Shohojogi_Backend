import express from "express";
import mongoose from "mongoose";
import dns from "node:dns";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import log from "./middlewares/logger.js";
import clientRoutes from "./routes/clientRoutes.js";
import workerRoutes from "./routes/workerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

if (process.env.DNS_SERVERS) {
  dns.setServers(process.env.DNS_SERVERS.split(","));
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadDir =
  process.env.ENV === "development" ? "uploads" : "/tmp/uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const app = express();
const PORT = process.env.PORT || 4000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, { dbName: "shohojogi" });
    console.log("Connected to database");
  } catch (err) {
    console.log(`Error connecting to database ${err}`);
    process.exit(1);
  }
};

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.ALLOWED_ORIGIN,
  }),
);
app.use(log);

app.get("/api", (req, res) => res.json({ message: "API is working" }));

app.use("/api/client", clientRoutes);

app.use("/api/worker", workerRoutes);

app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

export default app;
