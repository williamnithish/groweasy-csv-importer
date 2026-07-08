import pRetry from "p-retry";
import { getGeminiClient } from "./openaiClient";
import { buildBatchPrompt, SYSTEM_PROMPT } from "./prompt";
import { parseAiResponse, AiResponse } from "../validators/crmSchema";
import { RawCsvRow } from "../types/crm";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export async function extractBatch(
  rows: RawCsvRow[],
  batchIndex: number
): Promise<AiResponse> {
  return pRetry(
    async () => {
      logger.info(`========== Batch ${batchIndex} ==========`);

      const client = getGeminiClient();
      logger.info("Gemini client created");

      logger.info(`Sending ${rows.length} rows to Gemini`);

      const response = await client.models.generateContent({
        model: env.geminiModel,
        contents: `${SYSTEM_PROMPT}

${buildBatchPrompt(rows)}`,
        config: {
          temperature: env.geminiTemperature,
        },
      });

      logger.info("Gemini response received");

      const content = response.text;

      logger.info(`Response length: ${content?.length}`);

      if (!content || content.trim().length === 0) {
        throw new Error("Empty response from Gemini");
      }

      logger.info("Parsing AI response...");

      const parsed = parseAiResponse(content);

      logger.info("AI response parsed successfully");

      const totalReturned =
        parsed.records.length + parsed.skipped.length;

      if (totalReturned !== rows.length) {
        logger.warn("AI returned a different row count than expected", {
          batchIndex,
          expected: rows.length,
          received: totalReturned,
        });
      }

      logger.info(`Batch ${batchIndex} completed`);

      return parsed;
    },
    {
      retries: env.aiMaxRetries,
      onFailedAttempt: (error) => {
        logger.warn("AI batch attempt failed", {
          batchIndex,
          attempt: error.attemptNumber,
          retriesLeft: error.retriesLeft,
          message: error.message,
        });
      },
    }
  );
}