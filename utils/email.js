import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendEmail = async ({
    to,
    subject,
    html,
}) => {
    try {
        await transporter.sendMail({
            from: `"Shohojogi" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`Email sent to ${to}`);
        return true;
    } catch (error) {
        console.error("Email sending failed:", error);
        return false;
    }
};

export const sendNewApplicationEmail = async ({
    clientEmail,
    clientName,
    workerName,
    taskName,
}) => {
    return sendEmail({
        to: clientEmail,
        subject: `New application for "${taskName}"`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>New Application</h2>

                <p>Hi ${clientName},</p>

                <p>
                    <strong>${workerName}</strong> has applied
                    to your task:
                </p>

                <p>
                    <strong>${taskName}</strong>
                </p>

                <p>
                    Log in to Shohojogi to review the application.
                </p>

                <p>
                    — Shohojogi
                </p>
            </div>
        `,
    });
};

export const sendApplicationAcceptedEmail = async ({
    workerEmail,
    workerName,
    taskName,
}) => {
    return sendEmail({
        to: workerEmail,
        subject: `Your application was accepted`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Application Accepted 🎉</h2>

                <p>Hi ${workerName},</p>

                <p>
                    Your application for
                    <strong>${taskName}</strong>
                    has been accepted.
                </p>

                <p>
                    The client has selected you for the task.
                </p>

                <p>
                    — Shohojogi
                </p>
            </div>
        `,
    });
};

export const sendApplicationRejectedEmail = async ({
    workerEmail,
    workerName,
    taskName,
}) => {
    return sendEmail({
        to: workerEmail,
        subject: `Update on your application`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Application Update</h2>

                <p>Hi ${workerName},</p>

                <p>
                    Your application for
                    <strong>${taskName}</strong>
                    was not selected for this task.
                </p>

                <p>
                    You can continue exploring other opportunities
                    on Shohojogi.
                </p>

                <p>
                    — Shohojogi
                </p>
            </div>
        `,
    });
};