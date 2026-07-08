import multer from "multer";
import { env } from "../config/env";

export class InvalidFileTypeError extends Error {
  constructor(message = "Only .csv files are accepted") {
    super(message);
    this.name = "InvalidFileTypeError";
  }
}

const storage = multer.memoryStorage();

export const csvUpload = multer({
  storage,
  limits: {
    fileSize: env.maxUploadSizeMb * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      file.originalname.toLowerCase().endsWith(".csv");
    if (!isCsv) {
      cb(new InvalidFileTypeError());
      return;
    }
    cb(null, true);
  },
});
