import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { importRouter } from "./routes/importRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/requestLogger";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin }));
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use(requestLogger);
  app.use(express.json());

  app.use("/api", importRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
