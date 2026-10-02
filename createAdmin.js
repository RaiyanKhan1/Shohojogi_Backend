import mongoose from "mongoose";
import "dotenv/config";

import User from "./model/user.js";
import { hashPassword } from "./utils/helpers.js";

const createAdmin = async () => {
    try {
        // Connect to the same database used by the application
        await mongoose.connect(process.env.DATABASE_URL, {
            dbName: "shohojogi",
        });

        console.log("Connected to database");

        // CHANGE THESE
        const name = "Ahnaf";
        const email = "auhad@gmail.com";
        const password = "auhad04";

        // Check whether this email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log(
                `A user with the email "${email}" already exists.`
            );
            return;
        }

        // Hash the password using your existing helper
        const hashedPassword = await hashPassword(password);

        // Create the admin
        const admin = new User({
            name,
            email,
            password: hashedPassword,
            role: "admin",
        });

        await admin.save();

        console.log("================================");
        console.log("Admin account created successfully!");
        console.log(`Name:  ${name}`);
        console.log(`Email: ${email}`);
        console.log("================================");
    } catch (error) {
        console.error("Failed to create admin:", error);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();