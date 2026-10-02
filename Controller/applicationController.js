import mongoose from "mongoose";
import Application from "../Model/application.js";
import Task from "../model/tasks.js";
import User from "../model/user.js";

import {
  sendNewApplicationEmail,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
} from "../utils/email.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// WORKER: Apply to an approved task.
export const applyToTask = async (req, res) => {
  const { taskId } = req.params;

  if (!isValidId(taskId)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    // Only workers approved by an admin may apply.
    const applicant = await User.findById(req.user.id).select("isVerified");

    if (!applicant?.isVerified) {
      return res.status(403).json({
        error:
          "Only verified workers can apply. Please complete your verification first.",
      });
    }

    const task = await Task.findOne({
      _id: taskId,
      status: "approved",
    });

    if (!task) {
      return res.status(404).json({
        error: "Task not found or not open for applications",
      });
    }

    if (task.postedBy.toString() === req.user.id) {
      return res.status(403).json({
        error: "You cannot apply to your own task",
      });
    }

    const application = await Application.create({
      task: task._id,
      worker: req.user.id,
    });

    // Get the client who posted the task.
    const client = await User.findById(task.postedBy).select("name email");

    // Get the worker who submitted the application.
    const worker = await User.findById(req.user.id).select("name");

    // Send notification email.
    // Email failure does NOT affect the application itself.
    if (client?.email) {
      await sendNewApplicationEmail({
        clientEmail: client.email,
        clientName: client.name,
        workerName: worker?.name || "A worker",
        taskName: task.taskName,
      });
    }

    return res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        error: "You have already applied to this task",
      });
    }

    console.error("Apply to task error:", err);

    return res.status(500).json({
      error: "Unable to submit application",
    });
  }
};

// WORKER: Check their own applications.
export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      worker: req.user.id,
    })
      .populate("task", "taskName location budget deadline status taskImage")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (err) {
    console.error("Get worker applications error:", err);

    return res.status(500).json({
      error: "Unable to load your applications",
    });
  }
};

// CLIENT: Retrieve applications for their own tasks only.
export const getClientApplications = async (req, res) => {
  try {
    const clientTasks = await Task.find({
      postedBy: req.user.id,
    }).select("_id");

    const taskIds = clientTasks.map((task) => task._id);

    const applications = await Application.find({
      task: { $in: taskIds },
    })
      .populate("task", "taskName location budget deadline status")
      .populate("worker", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (err) {
    console.error("Get client applications error:", err);

    return res.status(500).json({
      error: "Unable to load applications",
    });
  }
};

// CLIENT: Accept or reject an application for their own task.
export const updateApplicationStatus = async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;

  if (!isValidId(applicationId)) {
    return res.status(400).json({
      error: "Invalid application ID",
    });
  }

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({
      error: "Status must be accepted or rejected",
    });
  }

  try {
    const application = await Application.findById(applicationId)
      .populate("task", "postedBy taskName")
      .populate("worker", "name email");

    if (!application) {
      return res.status(404).json({
        error: "Application not found",
      });
    }

    // Verify that this client owns the task.
    if (application.task.postedBy.toString() !== req.user.id) {
      return res.status(403).json({
        error: "You can only manage applications for your own tasks",
      });
    }

    application.status = status;
    await application.save();

    // Notify the worker after the status has been saved.
    if (application.worker?.email) {
      if (status === "accepted") {
        await sendApplicationAcceptedEmail({
          workerEmail: application.worker.email,
          workerName: application.worker.name,
          taskName: application.task.taskName,
        });
      } else {
        await sendApplicationRejectedEmail({
          workerEmail: application.worker.email,
          workerName: application.worker.name,
          taskName: application.task.taskName,
        });
      }
    }

    return res.status(200).json({
      message: `Application ${status}`,
      application,
    });
  } catch (err) {
    console.error("Update application status error:", err);

    return res.status(500).json({
      error: "Unable to update application",
    });
  }
};
