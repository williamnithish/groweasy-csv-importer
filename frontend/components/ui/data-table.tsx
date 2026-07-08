"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  globalFilter,
  onGlobalFilterChange,
  pageSize = 10,
  emptyMessage = "No rows to show.",
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="max-h-[28rem] overflow-auto rounded-card border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface-raised">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap border-b border-border px-3 py-2 text-left font-mono text-[11px] font-medium uppercase tracking-wide text-ink-muted"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-surface even:bg-surface/60 hover:bg-surface-hover">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap border-b border-border px-3 py-2 text-ink">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center text-ink-muted">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-muted">
          Page {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
