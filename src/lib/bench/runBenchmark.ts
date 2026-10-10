import { applyFilters } from "@/lib/filters/applyFilters";
import { generateStocks } from "@/lib/data/generateStocks";
import { EMPTY_FILTERS, FilterCriteria } from "@/types/filters";

export interface BenchRow {
  scenario: string;
  rows: number;
  matched: number;
  min: number;
  median: number;
  p95: number;
}

const SCENARIOS: { name: string; f: Partial<FilterCriteria> }[] = [
  { name: "Sector only", f: { sectors: ["Technology"] } },
  { name: "Price range", f: { priceMin: 200, priceMax: 600 } },
  {
    name: "Multi-criteria (6)",
    f: {
      sectors: ["Technology", "Finance"],
      priceMin: 100,
      priceMax: 800,
      changeMin: -3,
      volumeMin: 500000,
      peMax: 40,
    },
  },
  // Worst case: nothing rejects rows early, so every row hits the string search
  { name: "Text search only", f: { search: "company 12" } },
];

function stats(times: number[]) {
  const s = [...times].sort((a, b) => a - b);
  return {
    min: s[0],
    median: s[Math.floor(s.length / 2)],
    p95: s[Math.floor(s.length * 0.95)],
  };
}

export function runBenchmark(
  sizes = [5000, 10000, 50000],
  runs = 50
): BenchRow[] {
  const out: BenchRow[] = [];
  for (const size of sizes) {
    const stocks = generateStocks(size);
    for (const sc of SCENARIOS) {
      const criteria = { ...EMPTY_FILTERS, ...sc.f };
      for (let i = 0; i < 5; i++) applyFilters(stocks, criteria); // JIT warm-up
      const times: number[] = [];
      let matched = 0;
      for (let i = 0; i < runs; i++) {
        const t0 = performance.now();
        matched = applyFilters(stocks, criteria).length;
        times.push(performance.now() - t0);
      }
      out.push({ scenario: sc.name, rows: size, matched, ...stats(times) });
    }
  }
  return out;
}