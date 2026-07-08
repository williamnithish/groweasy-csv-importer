import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  // Server
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  geminiTemperature: Number(process.env.GEMINI_TEMPERATURE ?? 0),

  // Import Pipeline
  batchSize: Number(process.env.BATCH_SIZE ?? 20),
  maxConcurrency: Number(process.env.MAX_CONCURRENCY ?? 5),
  aiMaxRetries: Number(process.env.AI_MAX_RETRIES ?? 3),
  maxUploadRows: Number(process.env.MAX_UPLOAD_ROWS ?? 100000),
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 25),
};

export function assertGeminiConfigured(): void {
  required("GEMINI_API_KEY", env.geminiApiKey);
}