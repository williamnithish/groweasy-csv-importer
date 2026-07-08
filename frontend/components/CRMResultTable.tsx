"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Download } from "lucide-react";
import { CrmRecord, ImportResult, SkippedRecord } from "@/types/crm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";

interface CRMResultTableProps {
  result: ImportResult;
}

const CRM_COLUMNS: ColumnDef<CrmRecord, any>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  {
    id: "mobile",
    header: "Mobile",
    accessorFn: (r) => [r.country_code, r.mobile_without_country_code].filter(Boolean).join(" "),
  },
  { accessorKey: "company", header: "Company" },
  { accessorKey: "city", header: "City" },
  {
    accessorKey: "crm_status",
    header: "Status",
    cell: (info) => {
      const value = info.getValue() as string;
      if (!value) return <span className="text-ink-faint">—</span>;
      const variant =
        value === "SALE_DONE"
          ? "good"
          : value === "BAD_LEAD"
          ? "bad"
          : value === "GOOD_LEAD_FOLLOW_UP"
          ? "info"
          : "warn";
      return <Badge variant={variant}>{value}</Badge>;
    },
  },
  { accessorKey: "data_source", header: "Source" },
  { accessorKey: "lead_owner", header: "Owner" },
];

const SKIPPED_COLUMNS: ColumnDef<SkippedRecord, any>[] = [
  { accessorKey: "reason", header: "Reason" },
  {
    id: "original",
    header: "Original row (preview)",
    accessorFn: (r) =>
      Object.entries(r.original_record)
        .slice(0, 4)
        .map(([k, v]) => `${k}: ${v}`)
        .join("  ·  "),
    cell: (info) => (
      <span className="font-mono text-xs text-ink-muted">{info.getValue() as string}</span>
    ),
  },
];

export function CRMResultTable({ result }: CRMResultTableProps) {
  const [tab, setTab] = useState<"imported" | "skipped">("imported");
  const [importedFilter, setImportedFilter] = useState("");
  const [skippedFilter, setSkippedFilter] = useState("");

  const csvDownloadUrl = useMemo(() => {
    if (result.imported.length === 0) return null;
    const headers = Object.keys(result.imported[0]);
    const lines = [
      headers.join(","),
      ...result.imported.map((row) =>
        headers
          .map((h) => `"${String((row as unknown as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    return URL.createObjectURL(blob);
  }, [result.imported]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex gap-1 rounded-md border border-border bg-surface p-1">
          <TabButton active={tab === "imported"} onClick={() => setTab("imported")}>
            Imported ({result.totalImported})
          </TabButton>
          <TabButton active={tab === "skipped"} onClick={() => setTab("skipped")}>
            Skipped ({result.totalSkipped})
          </TabButton>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
            <Input
              value={tab === "imported" ? importedFilter : skippedFilter}
              onChange={(e) =>
                tab === "imported" ? setImportedFilter(e.target.value) : setSkippedFilter(e.target.value)
              }
              placeholder="Search results…"
              className="pl-8"
            />
          </div>
          {csvDownloadUrl && (
            <Button variant="secondary" size="sm" asChild>
              <a href={csvDownloadUrl} download="groweasy_imported_leads.csv">
                <Download className="h-3.5 w-3.5" /> Export
              </a>
            </Button>
          )}
        </div>
      </div>

      {tab === "imported" ? (
        <DataTable
          data={result.imported}
          columns={CRM_COLUMNS}
          globalFilter={importedFilter}
          onGlobalFilterChange={setImportedFilter}
          emptyMessage="Nothing was imported from this file."
        />
      ) : (
        <DataTable
          data={result.skipped}
          columns={SKIPPED_COLUMNS}
          globalFilter={skippedFilter}
          onGlobalFilterChange={setSkippedFilter}
          emptyMessage="Nothing was skipped — every row had an email or mobile number."
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring rounded px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? "bg-amber text-canvas" : "text-ink-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
