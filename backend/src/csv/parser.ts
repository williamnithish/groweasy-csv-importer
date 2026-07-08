import { Readable } from "stream";
import csvParser from "csv-parser";
import { RawCsvRow } from "../types/crm";
import { env } from "../config/env";

export class CsvTooLargeError extends Error {
  constructor(limit: number) {
    super(`CSV exceeds the maximum allowed row count of ${limit}`);
    this.name = "CsvTooLargeError";
  }
}

export class EmptyCsvError extends Error {
  constructor() {
    super("CSV file is empty or contains no data rows");
    this.name = "EmptyCsvError";
  }
}

/**
 * Streams a CSV buffer into an array of raw rows.
 * - Deduplicates duplicate headers (col, col_2, col_3, ...) so no column is
 *   silently dropped or overwritten.
 * - Strips BOM artifacts from header names.
 * - Enforces a maximum row count to protect memory on very large files.
 */
export function parseCsvBuffer(buffer: Buffer): Promise<RawCsvRow[]> {
  return new Promise((resolve, reject) => {
    const rows: RawCsvRow[] = [];
    const seenHeaderCounts = new Map<string, number>();

    const stream = Readable.from(buffer)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => {
            const cleaned = header.replace(/^\uFEFF/, "").trim() || "column";
            const count = seenHeaderCounts.get(cleaned) ?? 0;
            seenHeaderCounts.set(cleaned, count + 1);
            return count === 0 ? cleaned : `${cleaned}_${count + 1}`;
          },
        })
      )
      .on("data", (row: RawCsvRow) => {
        if (rows.length >= env.maxUploadRows) {
          stream.destroy(new CsvTooLargeError(env.maxUploadRows));
          return;
        }
        rows.push(row);
      })
      .on("end", () => {
        if (rows.length === 0) {
          reject(new EmptyCsvError());
          return;
        }
        resolve(rows);
      })
      .on("error", (err: Error) => reject(err));
  });
}
