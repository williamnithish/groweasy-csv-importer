import { Request, Response } from "express";
import { runImportPipeline } from "../services/importService";
import { HttpError } from "../middleware/errorHandler";

export async function importCsvHandler(req: Request, res: Response) {
  if (!req.file) {
    throw new HttpError(400, "No CSV file uploaded. Attach it under the 'file' field.");
  }

  const result = await runImportPipeline(req.file.buffer);

  res.status(200).json(result);
}

export function healthCheckHandler(_req: Request, res: Response) {
  res.status(200).json({ status: "ok", service: "groweasy-csv-importer-backend" });
}
