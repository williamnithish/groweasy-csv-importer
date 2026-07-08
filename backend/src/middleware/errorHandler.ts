import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { CsvTooLargeError, EmptyCsvError } from "../csv/parser";
import { InvalidFileTypeError } from "./upload";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  logger.error("Unhandled error", { requestId: req.requestId, message: err.message });

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof EmptyCsvError) {
    return res.status(400).json({ error: err.message });
  }
  if (err instanceof CsvTooLargeError) {
    return res.status(413).json({ error: err.message });
  }
  if (err instanceof InvalidFileTypeError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  return res.status(500).json({ error: "Internal server error" });
}
