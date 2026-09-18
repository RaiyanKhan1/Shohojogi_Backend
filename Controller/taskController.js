import Task from "../model/tasks.js";

export const createTask = async (req, res) => {
  const { taskName, location, deadline, budget, tags, requirements, details } =
    req.body;

  if (!taskName || !location || !deadline || budget === undefined) {
    return res
      .status(400)
      .json({ error: "Task name, location, deadline and budget are required" });
  }

  try {
    const newTask = new Task({
      postedBy: req.user.id,
      taskName,
      location,
      deadline,
      budget,
      tags,
      requirements,
      details,
    });

    const savedTask = await newTask.save();

    return res.status(201).json({
      message: "Task posted successfully",
      task: savedTask,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
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
  try {
    const task = await Task.findById(req.params.id)
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
