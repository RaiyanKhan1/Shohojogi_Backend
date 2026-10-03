import { Schema, model } from "mongoose";

export const ROLES = ["client", "worker", "admin"];

const userSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: Schema.Types.String,
      required: true,
    },
    role: {
      type: Schema.Types.String,
      required: true,
      enum: ROLES,
    },
    isVerified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    // Average rating (1-5) given by clients; 0 means not rated yet.
    rating: {
      type: Schema.Types.Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Schema.Types.Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true },
);

const User = model("User", userSchema);
export default User;
