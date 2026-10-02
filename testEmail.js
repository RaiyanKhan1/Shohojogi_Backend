import "dotenv/config";
import { sendEmail } from "./utils/email.js";

const test = async () => {
    await sendEmail({
        to: process.env.EMAIL_USER,
        subject: "Shohojogi Email Test",
        html: `
            <h2>Email system works! 🎉</h2>
            <p>This is a test email from the Shohojogi backend.</p>
        `,
    });
};

test();