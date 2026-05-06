"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import type { ModuleRecord } from "@/types/app.types";

type RowLink = {
  hrefBase: string;
  idField?: string;
  label: string;
};

export function DataTable({ rows, rowLink }: { rows: ModuleRecord[]; rowLink?: RowLink }) {
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

  if (rowLink) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const id = row.original[rowLink.idField ?? "id"];
        if (!id) return <span className="text-[var(--on-surface-variant)]">Unavailable</span>;
        return (
          <Link href={`${rowLink.hrefBase}/${id}`} className="font-semibold text-primary hover:underline">
            {rowLink.label}
          </Link>
        );
      },
    });
  }

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="max-h-[560px] max-w-full overflow-auto rounded-lg border border-border overscroll-contain">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 z-[1] bg-[#f1f5f9] text-xs font-semibold uppercase tracking-[0.02em] text-[var(--on-surface-variant)]">
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
        <tbody className="divide-y divide-border bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="transition hover:bg-[#f8fafc]">
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
