"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { StatusBadge } from "@/components/status-badge";
import type { ModuleRecord } from "@/types/app.types";

export function DataTable({ rows }: { rows: ModuleRecord[] }) {
  const columns: ColumnDef<ModuleRecord>[] = Object.keys(rows[0] ?? { Empty: "No records" }).map((key) => ({
    accessorKey: key,
    header: key,
    cell: ({ getValue }) => {
      const value = getValue<unknown>();
      const lower = String(value).toLowerCase();
      const looksLikeStatus = ["status", "priority", "visible"].includes(key.toLowerCase()) || /queued|pending|approved|completed|active|urgent|expired|dispensed|reviewed|submitted/.test(lower);
      return looksLikeStatus ? <StatusBadge value={String(value)} /> : <span className="table-numeric">{formatCell(value)}</span>;
    },
  }));

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="max-h-[560px] max-w-full overflow-auto rounded-[0.5rem] border border-[var(--outline-variant)] overscroll-contain">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-[1] bg-[var(--surface-container-high)] text-[12px] font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="whitespace-nowrap px-4 py-3">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-[var(--outline-variant)] bg-white">
          {table.getRowModel().rows.map((row, index) => (
            <tr key={row.id} className={`transition hover:bg-[var(--surface-container-low)] ${index % 2 === 1 ? "bg-[var(--surface)]/40" : ""}`}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="max-w-[220px] break-words px-4 py-3 text-[var(--on-surface)]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
