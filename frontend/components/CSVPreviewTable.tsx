"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { RawCsvRow } from "@/types/crm";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";

interface CSVPreviewTableProps {
  headers: string[];
  rows: RawCsvRow[];
}

export function CSVPreviewTable({ headers, rows }: CSVPreviewTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<RawCsvRow, any>[]>(
    () =>
      headers.map((h) => ({
        accessorKey: h,
        header: h,
        cell: (info: any) => {
          const value = info.getValue();
          return (
            <span className="whitespace-nowrap">
              {value === undefined || value === null || value === "" ? (
                <span className="text-ink-faint">—</span>
              ) : (
                String(value)
              )}
            </span>
          );
        },
      })),
    [headers]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="font-mono text-xs text-ink-muted">
          {rows.length.toLocaleString()} rows · {headers.length} columns detected
        </p>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search preview…"
            className="pl-8"
          />
        </div>
      </div>

      <DataTable
        data={rows}
        columns={columns}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        emptyMessage="No rows match your search."
      />
    </div>
  );
}
