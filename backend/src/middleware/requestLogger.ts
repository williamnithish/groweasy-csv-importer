import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";
import { logger } from "../utils/logger";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  req.requestId = randomUUID();
  const start = Date.now();
  res.on("finish", () => {
    logger.info("request completed", {
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });
  next();
}
