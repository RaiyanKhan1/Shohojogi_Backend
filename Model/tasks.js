import { Schema, model } from "mongoose";

const imageSchema = new Schema(
  {
    url: String,
    publicId: String,
  },
  { _id: false },
);

export const TASK_CATEGORIES = [
  "Home Services",
  "Electricians & Plumbers",
  "Appliance & AC Repair",
  "Carpentry & Painting",
  "Drivers & Transport",
  "Movers & Shifting",
  "Delivery & Food Runs",
  "Errands & Bill Payments",
  "Tutors",
  "Child Care",
  "Elderly & Patient Care",
  "Security Guards",
  "Event Specialists",
  "Tour Guides",
  "Beauty & Grooming",
  "Tech Support",
];

const taskSchema = new Schema(
  {
    taskImage: imageSchema,

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

    category: {
      type: Schema.Types.String,
      enum: TASK_CATEGORIES,
      required: true,
      index: true,
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

    status: {
      type: Schema.Types.String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

const Task = model("Task", taskSchema);

export default Task;
