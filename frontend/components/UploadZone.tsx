"use client";

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileAccepted: (file: File) => void;
  disabled?: boolean;
}

const SAMPLE_SOURCE_HEADERS = ["Full Name", "WhatsApp", "Lead Stage", "Mail ID", "Remarks"];
const SAMPLE_SCHEMA_FIELDS = ["name", "mobile", "crm_status", "email", "crm_note"];

export function UploadZone({ onFileAccepted, disabled }: UploadZoneProps) {
  const [rejection, setRejection] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: FileRejection[]) => {
      setRejection(null);
      if (rejected.length > 0) {
        setRejection(rejected[0].errors[0]?.message ?? "That file couldn't be accepted.");
        return;
      }
      if (accepted[0]) onFileAccepted(accepted[0]);
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    multiple: false,
    accept: { "text/csv": [".csv"], "application/vnd.ms-excel": [".csv"] },
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        {...getRootProps()}
        className={cn(
          "focus-ring group relative w-full cursor-pointer rounded-card border-2 border-dashed px-8 py-14 text-center transition-colors",
          isDragActive
            ? "border-amber bg-amber/5"
            : "border-border-strong bg-surface hover:border-ink-faint",
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud
          className={cn(
            "mx-auto mb-4 h-9 w-9 transition-colors",
            isDragActive ? "text-amber" : "text-ink-faint group-hover:text-ink-muted"
          )}
        />
        <p className="font-display text-base font-medium text-ink">
          {isDragActive ? "Drop it here" : "Drag any CSV here, or click to browse"}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Facebook leads, Google Ads exports, agency sheets, manual spreadsheets — any column
          layout works.
        </p>
      </div>

      {rejection && (
        <div className="flex w-full items-center gap-2 rounded-md border border-signal-red/30 bg-signal-red/10 px-4 py-2.5 text-sm text-signal-red">
          <FileWarning className="h-4 w-4 shrink-0" />
          {rejection}
        </div>
      )}

      <SchemaMappingPreview />
    </div>
  );
}

/**
 * The signature visual: a live sketch of the actual mechanism this product
 * performs — arbitrary source columns resolving onto the fixed CRM schema,
 * regardless of how they're named.
 */
function SchemaMappingPreview() {
  return (
    <div className="w-full rounded-card border border-border bg-surface/60 px-6 py-5">
      <p className="mb-4 text-center text-xs uppercase tracking-wider text-ink-faint">
        Any column name in → the same 15 CRM fields out
      </p>
      <div className="flex items-center justify-center gap-6 overflow-x-auto">
        <div className="flex flex-col gap-2">
          {SAMPLE_SOURCE_HEADERS.map((h) => (
            <span
              key={h}
              className="whitespace-nowrap rounded border border-border-strong bg-surface-raised px-2.5 py-1 font-mono text-[11px] text-ink-muted"
            >
              {h}
            </span>
          ))}
        </div>
        <svg width="72" height="132" viewBox="0 0 72 132" className="shrink-0 text-amber/70">
          {SAMPLE_SOURCE_HEADERS.map((_, i) => (
            <path
              key={i}
              d={`M0,${13 + i * 26} C 30,${13 + i * 26} 42,66 72,66`}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="none"
              className="animate-flow-dash"
              style={{ animationDelay: `${i * 0.12}s` }}
            />
          ))}
        </svg>
        <div className="flex flex-col gap-2">
          {SAMPLE_SCHEMA_FIELDS.map((f) => (
            <span
              key={f}
              className="whitespace-nowrap rounded border border-amber/30 bg-amber/10 px-2.5 py-1 font-mono text-[11px] text-amber-soft"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
