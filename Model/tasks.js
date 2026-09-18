import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    taskName: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    location: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    deadline: {
      type: Schema.Types.Date,
      required: true,
    },
    budget: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
    },
    tags: {
      type: [Schema.Types.String],
      default: [],
    },
    requirements: {
      type: [Schema.Types.String],
      default: [],
    },
    details: {
      type: Schema.Types.String,
      trim: true,
    },
  },
  { timestamps: true },
);

const Task = model("Task", taskSchema);
export default Task;
