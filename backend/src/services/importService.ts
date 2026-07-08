import pLimit from "p-limit";
import { parseCsvBuffer } from "../csv/parser";
import { extractBatch } from "../ai/extractor";
import { chunk } from "../utils/batch";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { CrmRecord, ImportResult, RawCsvRow, SkippedRecord } from "../types/crm";

/**
 * Orchestrates the full import pipeline:
 *   1. Parse the uploaded CSV into raw rows.
 *   2. Split rows into fixed-size batches.
 *   3. Send batches to the AI extractor with bounded concurrency.
 *   4. Merge all batch results into a single ImportResult.
 *
 * A failure in one batch (after retries) does not fail the whole import;
 * the offending rows are recorded as skipped with the failure reason so the
 * rest of the file still gets imported.
 */
export async function runImportPipeline(fileBuffer: Buffer): Promise<ImportResult> {
  const rows = await parseCsvBuffer(fileBuffer);
  const batches = chunk(rows, env.batchSize);
  const limit = pLimit(env.maxConcurrency);

  logger.info("Starting import pipeline", {
    totalRows: rows.length,
    totalBatches: batches.length,
    batchSize: env.batchSize,
    concurrency: env.maxConcurrency,
  });

  const imported: CrmRecord[] = [];
  const skipped: SkippedRecord[] = [];

  const batchPromises = batches.map((batch, index) =>
    limit(async () => {
      try {
        const result = await extractBatch(batch, index);
        imported.push(...result.records);
        skipped.push(...result.skipped);
      } catch (error) {
        logger.error("Batch failed after all retries; skipping rows in this batch", {
          batchIndex: index,
          message: (error as Error).message,
        });
        for (const row of batch) {
          skipped.push({
            reason: "AI extraction failed for this batch after retries",
            original_record: row as unknown as Record<string, unknown>,
          });
        }
      }
    })
  );

  await Promise.all(batchPromises);

  return {
    imported,
    skipped,
    totalImported: imported.length,
    totalSkipped: skipped.length,
  };
}

/** Exposed separately so it can be unit tested without touching the AI layer. */
export async function parseOnly(fileBuffer: Buffer): Promise<RawCsvRow[]> {
  return parseCsvBuffer(fileBuffer);
}
