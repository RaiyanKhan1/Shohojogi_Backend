import multer from "multer";
import path from "path";

const dir = process.env.ENV === "development" ? "uploads" : "/tmp/uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .split(" ")
      .join("-");
    cb(null, base + Date.now() + Math.ceil(Math.random() * 1e5) + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG and WebP images are allowed"));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
});

export const VERIFICATION_DOCS = [
  "nidFront",
  "nidBack",
  "cv",
  "policeClearance",
  "utilityBill",
];

export const uploadVerificationDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: VERIFICATION_DOCS.length },
}).fields(VERIFICATION_DOCS.map((name) => ({ name, maxCount: 1 })));
