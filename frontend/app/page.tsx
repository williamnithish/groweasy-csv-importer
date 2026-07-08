"use client";

import { useState } from "react";
import { RotateCcw, Workflow } from "lucide-react";
import { ParsedCsv, ImportResult } from "@/types/crm";
import { parseCsvFile, CsvParseError } from "@/lib/csv";
import { importCsv, ApiError } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { UploadZone } from "@/components/UploadZone";
import { CSVPreviewTable } from "@/components/CSVPreviewTable";
import { ImportButton } from "@/components/ImportButton";
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SummaryCards } from "@/components/SummaryCards";
import { CRMResultTable } from "@/components/CRMResultTable";
import { Button } from "@/components/ui/button";

type Stage = "upload" | "preview" | "importing" | "result";

export default function HomePage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  // The raw File is kept alongside the client-side preview: the frontend only
  // parses for display (Step 2 of the spec), the backend re-reads and streams
  // the original file for the AI mapping step (Step 4).
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  async function handleFile(file: File) {
    setError(null);
    try {
      const data = await parseCsvFile(file);
      setParsed(data);
      setPendingFile(file);
      setStage("preview");
    } catch (err) {
      const message = err instanceof CsvParseError ? err.message : "Could not parse that file.";
      setError(message);
      push({ title: "Couldn't read that CSV", description: message, variant: "error" });
    }
  }

  async function handleConfirmImport() {
    if (!pendingFile) return;
    setStage("importing");
    setError(null);
    try {
      const res = await importCsv(pendingFile);
      setResult(res);
      setStage("result");
      push({
        title: "Import complete",
        description: `${res.totalImported.toLocaleString()} imported, ${res.totalSkipped.toLocaleString()} skipped.`,
        variant: "success",
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "The import failed unexpectedly.";
      setError(message);
      setStage("preview");
      push({ title: "Import failed", description: message, variant: "error" });
    }
  }

  function reset() {
    setStage("upload");
    setParsed(null);
    setPendingFile(null);
    setResult(null);
    setError(null);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-6 py-12 sm:py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber/10 text-amber">
            <Workflow className="h-4 w-4" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-ink">GrowEasy</p>
            <p className="-mt-0.5 text-[11px] text-ink-faint">CSV Importer</p>
          </div>
        </div>
        {stage !== "upload" && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Start over
          </Button>
        )}
      </header>

      {stage === "upload" && (
        <section className="animate-fade-up flex flex-col gap-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Import any lead sheet, no matter how it&apos;s structured
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              Upload a CSV from Facebook, Google Ads, your real-estate CRM, or a manual
              spreadsheet. The importer figures out what each column means and maps it onto the
              GrowEasy schema — you just confirm before anything is written.
            </p>
          </div>
          <UploadZone onFileAccepted={handleFile} />
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
        </section>
      )}

      {stage === "preview" && parsed && (
        <section className="animate-fade-up flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-lg font-medium text-ink">{parsed.fileName}</h2>
            <p className="text-sm text-ink-muted">
              This is exactly what&apos;s in your file — nothing has been sent anywhere yet.
              Review it, then confirm to run the AI mapping.
            </p>
          </div>
          <CSVPreviewTable headers={parsed.headers} rows={parsed.rows} />
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}
          <div className="flex justify-end border-t border-border pt-6">
            <ImportButton onClick={handleConfirmImport} loading={false} rowCount={parsed.rows.length} />
          </div>
        </section>
      )}

      {stage === "importing" && (
        <section className="animate-fade-up">
          <LoadingOverlay
            title="Mapping your rows onto the CRM schema…"
            subtitle="Rows are being batched and sent for AI extraction. This can take a moment for larger files."
          />
        </section>
      )}

      {stage === "result" && result && (
        <section className="animate-fade-up flex flex-col gap-6">
          <SummaryCards result={result} />
          <CRMResultTable result={result} />
        </section>
      )}
    </main>
  );
}
