import { Router } from "express";
import { csvUpload } from "../middleware/upload";
import { importCsvHandler, healthCheckHandler } from "../controllers/importController";

export const importRouter = Router();

importRouter.get("/health", healthCheckHandler);
importRouter.post("/import", csvUpload.single("file"), importCsvHandler);
