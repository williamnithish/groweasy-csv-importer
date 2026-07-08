import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getNumber(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (value === undefined || value === "") {
    return defaultValue;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number.`);
  }

  return parsed;
}

export const env = {
  // Server
  port: getNumber("PORT", 8080),
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  // Gemini
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  geminiTemperature: getNumber("GEMINI_TEMPERATURE", 0),

  // Import Pipeline
  batchSize: getNumber("BATCH_SIZE", 20),
  maxConcurrency: getNumber("MAX_CONCURRENCY", 5),
  aiMaxRetries: getNumber("AI_MAX_RETRIES", 3),
  maxUploadRows: getNumber("MAX_UPLOAD_ROWS", 100000),
  maxUploadSizeMb: getNumber("MAX_UPLOAD_SIZE_MB", 25),
};

export function assertGeminiConfigured(): void {
  required("GEMINI_API_KEY", env.geminiApiKey);
}