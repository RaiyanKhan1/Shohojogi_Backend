import { Schema, model } from "mongoose";

export const VERIFICATION_STATUSES = ["pending", "approved", "rejected"];

const documentSchema = new Schema(
  {
    url: { type: Schema.Types.String, required: true },
    publicId: { type: Schema.Types.String, required: true },
  },
  { _id: false },
);

const verificationSchema = new Schema(
  {
    worker: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    address: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    documents: {
      nidFront: { type: documentSchema, required: true },
      nidBack: { type: documentSchema, required: true },
      cv: { type: documentSchema, required: true },
      policeClearance: { type: documentSchema, required: true },
      utilityBill: { type: documentSchema, required: true },
    },
    status: {
      type: Schema.Types.String,
      enum: VERIFICATION_STATUSES,
      default: "pending",
    },
    rejectionReason: {
      type: Schema.Types.String,
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Schema.Types.Date,
    },
  },
  { timestamps: true },
);

const Verification = model("Verification", verificationSchema);
export default Verification;
