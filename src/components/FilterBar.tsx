"use client";

import { useStore } from "@/store";
import { useFilterWorker } from "@/lib/filters/useFilterWorker";
import { FilterCriteria } from "@/types/filters";

const SECTORS = ["Technology", "Finance", "Healthcare", "Energy",
  "Consumer", "Industrials", "Utilities", "Materials"];

type NumKey =
  | "priceMin" | "priceMax" | "changeMin" | "changeMax"
  | "volumeMin" | "marketCapMin" | "peMin" | "peMax";

function NumInput({ label, k }: { label: string; k: NumKey }) {
  const value = useStore((s) => s.filters[k]);
  const setFilter = useStore((s) => s.setFilter);
  return (
    <label className="flex flex-col gap-1 text-xs text-neutral-400">
      {label}
      <input
        type="number"
        value={value ?? ""}
        onChange={(e) =>
          setFilter(k, e.target.value === "" ? null : Number(e.target.value))
        }
        className="w-24 rounded bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
      />
    </label>
  );
}

export default function FilterBar() {
  useFilterWorker();

  const search = useStore((s) => s.filters.search);
  const sectors = useStore((s) => s.filters.sectors);
  const setFilter = useStore((s) => s.setFilter);
  const resetFilters = useStore((s) => s.resetFilters);
  const matched = useStore((s) => s.matchedIndexes);
  const total = useStore((s) => s.stocks.length);
  const ms = useStore((s) => s.lastFilterMs);

  const toggleSector = (sec: string) => {
    const next: FilterCriteria["sectors"] = sectors.includes(sec)
      ? sectors.filter((x) => x !== sec)
      : [...sectors, sec];
    setFilter("sectors", next);
  };

  return (
    <div className="mb-4 space-y-3 rounded border border-neutral-700 bg-neutral-900 p-3 text-neutral-100">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Search
          <input
            value={search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Symbol or name"
            className="w-44 rounded bg-neutral-800 px-2 py-1 text-sm text-neutral-100"
          />
        </label>
        <NumInput label="Price min" k="priceMin" />
        <NumInput label="Price max" k="priceMax" />
        <NumInput label="Change % min" k="changeMin" />
        <NumInput label="Change % max" k="changeMax" />
        <NumInput label="Volume min" k="volumeMin" />
        <NumInput label="Mkt cap min" k="marketCapMin" />
        <NumInput label="P/E min" k="peMin" />
        <NumInput label="P/E max" k="peMax" />
        <button
          onClick={resetFilters}
          className="rounded bg-neutral-700 px-3 py-1 text-sm hover:bg-neutral-600"
        >
          Reset
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {SECTORS.map((sec) => (
          <button
            key={sec}
            onClick={() => toggleSector(sec)}
            className={`rounded-full border px-3 py-1 text-xs ${
              sectors.includes(sec)
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-neutral-600 text-neutral-300"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      <p className="text-sm text-neutral-300">
        {matched
          ? `Filtered ${total.toLocaleString()} → ${matched.length.toLocaleString()} rows in ${ms?.toFixed(2)} ms`
          : `Showing all ${total.toLocaleString()} rows (no filters)`}
      </p>
    </div>
  );
}