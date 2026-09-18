import fs from "fs";

export const deleteFiles = (paths) => {
  paths.forEach((p) =>
    fs.unlink(
      p,
      (err) => err && console.error("Temp file delete failed:", err),
    ),
  );
};
