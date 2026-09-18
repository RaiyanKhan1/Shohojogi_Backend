import mongoose from "mongoose";
import "dotenv/config";
import User from "../model/user.js";
import { hashPassword } from "../utils/helpers.js";

const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.log("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.DATABASE_URL);

  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

  if (existing) {
    console.log(`A user already exists with ${ADMIN_EMAIL} (role: ${existing.role})`);
  } else {
    const admin = await User.create({
      name: ADMIN_NAME || "Admin",
      email: ADMIN_EMAIL,
      password: await hashPassword(ADMIN_PASSWORD),
      role: "admin",
    });
    console.log(`Admin created: ${admin.email}`);
  }

  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.log(`Seed failed: ${err.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
