import crypto from "node:crypto";
import mongoose from "mongoose";
import Application from "../Model/application.js";
import Payment from "../Model/payment.js";
import User from "../model/user.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const SSLCZ_BASE_URL =
    process.env.SSLCZ_IS_LIVE === "true"
        ? "https://securepay.sslcommerz.com"
        : "https://sandbox.sslcommerz.com";

const backendUrl = () =>
    (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`)
        .replace(/\/+$/, "");

const frontendUrl = () =>
    (process.env.FRONTEND_URL || process.env.ALLOWED_ORIGIN || "http://localhost:5173")
        .replace(/\/+$/, "");

const redirectToResult = (res, result, tranId) => {
    const query = tranId ? `?tran_id=${encodeURIComponent(tranId)}` : "";
    return res.redirect(`${frontendUrl()}/payment/${result}${query}`);
};

// Ask SSLCommerz to confirm the payment instead of trusting the callback body.
const validatePayment = async (valId) => {
    const params = new URLSearchParams({
        val_id: valId,
        store_id: process.env.SSLCZ_STORE_ID,
        store_passwd: process.env.SSLCZ_STORE_PASSWD,
        format: "json",
    });

    const response = await fetch(
        `${SSLCZ_BASE_URL}/validator/api/validationserverAPI.php?${params}`,
    );

    return response.json();
};

// CLIENT: Start an SSLCommerz payment to accept a worker's application.
export const initPayment = async (req, res) => {
    const { applicationId } = req.params;

    if (!isValidId(applicationId)) {
        return res.status(400).json({ error: "Invalid application ID" });
    }

    if (!process.env.SSLCZ_STORE_ID || !process.env.SSLCZ_STORE_PASSWD) {
        return res.status(500).json({ error: "Payment gateway is not configured" });
    }

    try {
        const application = await Application.findById(applicationId)
            .populate("task", "postedBy taskName budget location");

        if (!application || !application.task) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Verify that this client owns the task.
        if (application.task.postedBy.toString() !== req.user.id) {
            return res.status(403).json({
                error: "You can only manage applications for your own tasks",
            });
        }

        if (application.status !== "pending") {
            return res.status(409).json({
                error: `Application is already ${application.status}`,
            });
        }

        const amount = Number(application.task.budget);

        // SSLCommerz rejects payments below 10 BDT.
        if (!Number.isFinite(amount) || amount < 10) {
            return res.status(400).json({
                error: "Task budget must be at least 10 tk to pay online",
            });
        }

        const client = await User.findById(req.user.id).select("name email");

        const tranId = `SHJ-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

        await Payment.create({
            tranId,
            application: application._id,
            task: application.task._id,
            client: req.user.id,
            amount,
        });

        const callbackBase = `${backendUrl()}/api/payment`;

        const body = new URLSearchParams({
            store_id: process.env.SSLCZ_STORE_ID,
            store_passwd: process.env.SSLCZ_STORE_PASSWD,
            total_amount: amount.toFixed(2),
            currency: "BDT",
            tran_id: tranId,
            success_url: `${callbackBase}/success`,
            fail_url: `${callbackBase}/fail`,
            cancel_url: `${callbackBase}/cancel`,
            ipn_url: `${callbackBase}/ipn`,
            shipping_method: "NO",
            product_name: application.task.taskName || "Task payment",
            product_category: "Service",
            product_profile: "non-physical-goods",
            cus_name: client?.name || "Client",
            cus_email: client?.email || "client@example.com",
            cus_add1: application.task.location || "Dhaka",
            cus_city: "Dhaka",
            cus_country: "Bangladesh",
            cus_phone: "01700000000",
            value_a: application._id.toString(),
        });

        const response = await fetch(`${SSLCZ_BASE_URL}/gwprocess/v4/api.php`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        const data = await response.json().catch(() => ({}));

        if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
            await Payment.updateOne({ tranId }, { status: "failed" });

            console.error("SSLCommerz init error:", data);

            return res.status(502).json({
                error: data.failedreason || "Unable to start payment",
            });
        }

        return res.status(200).json({
            url: data.GatewayPageURL,
            tranId,
        });
    } catch (err) {
        console.error("Init payment error:", err);

        return res.status(500).json({ error: "Unable to start payment" });
    }
};

// SSLCommerz: Redirects the client here after a successful payment.
export const paymentSuccess = async (req, res) => {
    const { tran_id: tranId, val_id: valId } = req.body;

    try {
        const payment = await Payment.findOne({ tranId });

        if (!payment || !valId) {
            return redirectToResult(res, "failed", tranId);
        }

        if (payment.status === "paid") {
            return redirectToResult(res, "success", tranId);
        }

        const validation = await validatePayment(valId);

        const isValid =
            ["VALID", "VALIDATED"].includes(validation.status) &&
            validation.tran_id === tranId &&
            Number(validation.amount) >= payment.amount;

        if (!isValid) {
            payment.status = "failed";
            await payment.save();

            console.error("SSLCommerz validation failed:", validation);

            return redirectToResult(res, "failed", tranId);
        }

        payment.status = "paid";
        payment.valId = valId;
        payment.bankTranId = validation.bank_tran_id;
        payment.cardType = validation.card_type;
        await payment.save();

        // Accept the worker only after the payment is confirmed.
        await Application.updateOne(
            { _id: payment.application },
            { status: "accepted" },
        );

        return redirectToResult(res, "success", tranId);
    } catch (err) {
        console.error("Payment success error:", err);

        return redirectToResult(res, "failed", tranId);
    }
};

// SSLCommerz: Redirects the client here when the payment fails.
export const paymentFail = async (req, res) => {
    const { tran_id: tranId } = req.body;

    try {
        await Payment.updateOne(
            { tranId, status: "pending" },
            { status: "failed" },
        );
    } catch (err) {
        console.error("Payment fail error:", err);
    }

    return redirectToResult(res, "failed", tranId);
};

// SSLCommerz: Redirects the client here when they cancel the payment.
export const paymentCancel = async (req, res) => {
    const { tran_id: tranId } = req.body;

    try {
        await Payment.updateOne(
            { tranId, status: "pending" },
            { status: "cancelled" },
        );
    } catch (err) {
        console.error("Payment cancel error:", err);
    }

    return redirectToResult(res, "cancelled", tranId);
};

// SSLCommerz: Server-to-server notification (needs a public BACKEND_URL).
export const paymentIpn = async (req, res) => {
    const { tran_id: tranId, val_id: valId, status } = req.body;

    try {
        const payment = await Payment.findOne({ tranId });

        if (!payment) {
            return res.status(404).json({ error: "Payment not found" });
        }

        if (payment.status === "paid") {
            return res.status(200).json({ message: "Already processed" });
        }

        if (status !== "VALID" || !valId) {
            payment.status = status === "CANCELLED" ? "cancelled" : "failed";
            await payment.save();
            return res.status(200).json({ message: "Payment not completed" });
        }

        const validation = await validatePayment(valId);

        if (
            ["VALID", "VALIDATED"].includes(validation.status) &&
            validation.tran_id === tranId &&
            Number(validation.amount) >= payment.amount
        ) {
            payment.status = "paid";
            payment.valId = valId;
            payment.bankTranId = validation.bank_tran_id;
            payment.cardType = validation.card_type;
            await payment.save();

            await Application.updateOne(
                { _id: payment.application },
                { status: "accepted" },
            );
        }

        return res.status(200).json({ message: "IPN received" });
    } catch (err) {
        console.error("Payment IPN error:", err);

        return res.status(500).json({ error: "Unable to process IPN" });
    }
};
