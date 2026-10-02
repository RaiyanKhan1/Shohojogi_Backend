import { Schema, model } from "mongoose";

const paymentSchema = new Schema(
    {
        tranId: {
            type: String,
            required: true,
            unique: true,
        },

        application: {
            type: Schema.Types.ObjectId,
            ref: "Application",
            required: true,
            index: true,
        },

        task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
        },

        client: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            default: "BDT",
        },

        status: {
            type: String,
            enum: ["pending", "paid", "failed", "cancelled"],
            default: "pending",
            index: true,
        },

        // Filled in from the SSLCommerz validation response.
        valId: String,
        bankTranId: String,
        cardType: String,
    },
    { timestamps: true },
);

const Payment = model("Payment", paymentSchema);

export default Payment;
