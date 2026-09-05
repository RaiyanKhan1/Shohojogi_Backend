import { Schema, model } from "mongoose";

export const ROLES = ["client", "worker"];

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
  },
  { timestamps: true },
);

const User = model("User", userSchema);
export default User;
