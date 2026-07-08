import Papa from "papaparse";
import { ParsedCsv, RawCsvRow } from "@/types/crm";

export class CsvParseError extends Error {}

/**
 * Parses a File into headers + rows entirely client-side.
 * Deduplicates repeated headers (col, col_2, col_3, ...) so no column of
 * data is silently overwritten, matching the backend's parsing behavior.
 */
export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: dedupeHeaderFactory(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const fatal = results.errors.find((e) => e.type === "Delimiter" || e.type === "Quotes");
          if (fatal) {
            reject(new CsvParseError(fatal.message));
            return;
          }
        }
        const rows = results.data.filter((row) =>
          Object.values(row).some((v) => v !== undefined && v !== null && String(v).trim() !== "")
        ) as RawCsvRow[];

        if (rows.length === 0) {
          reject(new CsvParseError("This CSV has no data rows."));
          return;
        }

        resolve({
          fileName: file.name,
          headers: results.meta.fields ?? Object.keys(rows[0]),
          rows,
        });
      },
      error: (err) => reject(new CsvParseError(err.message)),
    });
  });
}

function dedupeHeaderFactory() {
  const seen = new Map<string, number>();
  return (header: string) => {
    const cleaned = header.replace(/^\uFEFF/, "").trim() || "column";
    const count = seen.get(cleaned) ?? 0;
    seen.set(cleaned, count + 1);
    return count === 0 ? cleaned : `${cleaned}_${count + 1}`;
  };
}
