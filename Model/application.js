import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
    {
        task: {
            type: Schema.Types.ObjectId,
            ref: "Task",
            required: true,
            index: true,
        },

        worker: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
            index: true,
        },

        // Client's rating of the worker for this task (1-5).
        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },

        ratedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true },
);

// One application per worker per task.
applicationSchema.index(
    { task: 1, worker: 1 },
    { unique: true },
);

const Application = model("Application", applicationSchema);

export default Application;