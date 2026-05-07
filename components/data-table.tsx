"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ModuleRecord } from "@/types/app.types";

type RowLink = {
  hrefBase: string;
  idField?: string;
  label: string;
};

export function DataTable({
  rows,
  rowLink,
  hiddenColumns = [],
  columnLabels = {},
}: {
  rows: ModuleRecord[];
  rowLink?: RowLink;
  hiddenColumns?: string[];
  columnLabels?: Record<string, string>;
}) {
  const hidden = new Set(hiddenColumns);
  const columns: ColumnDef<ModuleRecord>[] = Object.keys(rows[0] ?? { Empty: "No records" })
    .filter((key) => !hidden.has(key))
    .map((key) => ({
    accessorKey: key,
    header: columnLabels[key] ?? key,
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
    <TableFrame scrollClassName="max-h-[560px]">
      <Table>
        <TableHeader className="sticky top-0 z-[1]">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={Math.max(columns.length, 1)} className="py-10 text-center text-[#607084]">
                No records visible for this role
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="max-w-[220px] break-words">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableFrame>
  );
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}
