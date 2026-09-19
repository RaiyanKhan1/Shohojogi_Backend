import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Task from "../model/tasks.js";
import { deleteFiles } from "../utils/fileUtils.js";

export const createTask = async (req, res) => {
  const { taskName, location, deadline, budget, tags, requirements, details } =
    req.body;

  if (!taskName || !location || !deadline || budget === undefined) {
    return res
      .status(400)
      .json({ error: "Task name, location, deadline and budget are required" });
  }

  try {
    let taskImage;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "task_images",
      });

      taskImage = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    const newTask = new Task({
      postedBy: req.user.id,
      taskName,
      location,
      deadline,
      budget,
      tags,
      requirements,
      details,
      taskImage,
    });

    const savedTask = await newTask.save();

    return res.status(201).json({
      message: "Task posted successfully",
      task: savedTask,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  } finally {
    if (req.file) deleteFiles([req.file.path]);
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .select("-__v")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  try {
    const task = await Task.findById(id)
      .select("-__v")
      .populate("postedBy", "name email");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json(task);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const deleteTaskById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    if (task.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only delete your own tasks" });
    }

    if (task.taskImage?.publicId) {
      await cloudinary.uploader.destroy(task.taskImage.publicId);
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({ message: "Task deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const setTaskApproval = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid task id" });
  }

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      error: "status must be pending, approved, or rejected",
    });
  }

  try {
    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    )
      .select("-__v")
      .populate("postedBy", "name email");

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    return res.status(200).json({
      message: `Task ${status}`,
      task,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const getAllTasksForAdmin = async (req, res) => {
  const { status } = req.query;

  const filter = {};

  if (["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  try {
    const tasks = await Task.find(filter)
      .select("-__v")
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
