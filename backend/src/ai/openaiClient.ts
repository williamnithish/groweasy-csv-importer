import { GoogleGenAI } from "@google/genai";
import { env } from "../config/env";

let client: GoogleGenAI | null = null;

/** Lazily instantiates a single shared Gemini client. */
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    if (!env.geminiApiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    client = new GoogleGenAI({
      apiKey: env.geminiApiKey,
    });
  }

  return client;
}