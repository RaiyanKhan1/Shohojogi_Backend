import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import Verification from "../Model/verification.js";
import User from "../model/user.js";
import { VERIFICATION_DOCS } from "../middlewares/multer.middleware.js";
import { deleteFiles } from "../utils/fileUtils.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// WORKER: Submit verification documents.
export const submitVerification = async (req, res) => {
  const files = req.files || {};
  const tempPaths = Object.values(files)
    .flat()
    .map((file) => file.path);
  const uploaded = [];

  try {
    const address = req.body.address?.trim();
    const missing = VERIFICATION_DOCS.filter((key) => !files[key]?.[0]);

    if (!address || missing.length) {
      return res.status(400).json({
        error: "Address and all documents are required",
        missing,
      });
    }

    const existing = await Verification.findOne({ worker: req.user.id });
    if (existing) {
      return res.status(409).json({
        error: "You have already submitted your documents",
        status: existing.status,
      });
    }

    const results = await Promise.all(
      VERIFICATION_DOCS.map(async (key) => {
        const result = await cloudinary.uploader.upload(files[key][0].path, {
          folder: `worker_verifications/${req.user.id}`,
        });
        uploaded.push(result.public_id);
        return [key, { url: result.secure_url, publicId: result.public_id }];
      }),
    );

    const verification = await Verification.create({
      worker: req.user.id,
      address,
      documents: Object.fromEntries(results),
    });

    return res.status(201).json({
      message: "Documents submitted successfully",
      verification,
    });
  } catch (err) {
    // Don't leave orphaned files on Cloudinary if anything failed.
    await Promise.allSettled(
      uploaded.map((id) => cloudinary.uploader.destroy(id)),
    );
    return res.status(400).json({ error: err.message });
  } finally {
    deleteFiles(tempPaths);
  }
};

// WORKER: View own verification status.
export const getMyVerification = async (req, res) => {
  try {
    const verification = await Verification.findOne({
      worker: req.user.id,
    }).select("-__v");

    return res.status(200).json({ verification });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// ADMIN: List verification requests, optionally filtered by ?status=
export const getAllVerifications = async (req, res) => {
  const { status } = req.query;

  try {
    const filter = status ? { status } : {};
    const verifications = await Verification.find(filter)
      .select("-__v")
      .populate("worker", "name email isVerified")
      .sort({ createdAt: -1 });

    return res.status(200).json(verifications);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// ADMIN: View one verification request.
export const getVerificationById = async (req, res) => {
  const { id } = req.params;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid verification ID" });
  }

  try {
    const verification = await Verification.findById(id)
      .select("-__v")
      .populate("worker", "name email isVerified")
      .populate("reviewedBy", "name email");

    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    return res.status(200).json(verification);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

// ADMIN: Approve or reject a verification request.
export const reviewVerification = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!isValidId(id)) {
    return res.status(400).json({ error: "Invalid verification ID" });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res
      .status(400)
      .json({ error: "Status must be 'approved' or 'rejected'" });
  }

  if (status === "rejected" && !rejectionReason?.trim()) {
    return res.status(400).json({ error: "Rejection reason is required" });
  }

  try {
    const verification = await Verification.findByIdAndUpdate(
      id,
      {
        status,
        rejectionReason: status === "rejected" ? rejectionReason.trim() : null,
        reviewedBy: req.user?.id,
        reviewedAt: new Date(),
      },
      { new: true, runValidators: true },
    ).populate("worker", "name email");

    if (!verification) {
      return res.status(404).json({ error: "Verification not found" });
    }

    await User.findByIdAndUpdate(verification.worker._id, {
      isVerified: status === "approved",
    });

    return res.status(200).json({
      message: `Verification ${status}`,
      verification,
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
