"use client";

import { useMemo, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useStore } from "@/store";
import { columns } from "./columns";

const ROW_HEIGHT = 36;

export default function StockTable() {
  const stocks = useStore((s) => s.stocks);
  const matched = useStore((s) => s.matchedIndexes);
  const sort = useStore((s) => s.sort);
  const setSort = useStore((s) => s.setSort);
  const selectedSymbol = useStore((s) => s.selectedSymbol);
  const selectSymbol = useStore((s) => s.selectSymbol);

  // If a filter result exists (Stage 5), show only those rows
  const data = useMemo(
    () => (matched ? matched.map((i) => stocks[i]) : stocks),
    [stocks, matched]
  );

  const sorting = useMemo<SortingState>(() => (sort ? [sort] : []), [sort]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: (updater: Updater<SortingState>) => {
      const next = typeof updater === "function" ? updater(sorting) : updater;
      setSort(next[0] ?? null);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.symbol,
    enableMultiSort: false,
  });

  const rows = table.getRowModel().rows;
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    <div>
      <p className="mb-2 text-sm text-neutral-400">
        Total rows: {rows.length.toLocaleString()} | Rows in DOM:{" "}
        <span className="text-green-400">{virtualRows.length}</span>
      </p>

      <div
        ref={parentRef}
        className="h-[600px] overflow-auto rounded border border-neutral-700 bg-neutral-900 text-neutral-100"
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 bg-neutral-800"
          style={{ width: table.getTotalSize() }}
        >
          {table.getHeaderGroups().map((hg) => (
            <div key={hg.id} className="flex">
              {hg.headers.map((h) => (
                <div
                  key={h.id}
                  style={{ width: h.getSize() }}
                  onClick={h.column.getToggleSortingHandler()}
                  className="shrink-0 cursor-pointer select-none px-3 py-2 text-sm font-semibold hover:bg-neutral-700"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                  {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ??
                    null}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Virtualized body */}
        <div
          className="relative"
          style={{ height: virtualizer.getTotalSize(), width: table.getTotalSize() }}
        >
          {virtualRows.map((v) => {
            const row = rows[v.index];
            return (
              <div
                key={row.id}
                onClick={() => selectSymbol(row.original.symbol)}
                className={`absolute left-0 top-0 flex w-full cursor-pointer border-b border-neutral-800 text-sm hover:bg-neutral-800 ${
                  row.original.symbol === selectedSymbol ? "bg-blue-950" : ""
                }`}
                style={{
                  height: ROW_HEIGHT,
                  transform: `translateY(${v.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="shrink-0 truncate px-3 leading-9"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}