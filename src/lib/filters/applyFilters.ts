import { Stock } from "@/types/stock";
import { FilterCriteria } from "@/types/filters";

export function isFilterActive(f: FilterCriteria): boolean {
  return (
    f.search.trim() !== "" ||
    f.sectors.length > 0 ||
    f.priceMin !== null ||
    f.priceMax !== null ||
    f.changeMin !== null ||
    f.changeMax !== null ||
    f.volumeMin !== null ||
    f.marketCapMin !== null ||
    f.peMin !== null ||
    f.peMax !== null
  );
}

// Returns the indexes of stocks that match ALL active criteria (AND logic)
export function applyFilters(stocks: Stock[], f: FilterCriteria): number[] {
  const q = f.search.trim().toLowerCase();
  const sectorSet = f.sectors.length ? new Set(f.sectors) : null;
  const out: number[] = [];

  for (let i = 0; i < stocks.length; i++) {
    const s = stocks[i];

    if (sectorSet && !sectorSet.has(s.sector)) continue;
    if (f.priceMin !== null && s.price < f.priceMin) continue;
    if (f.priceMax !== null && s.price > f.priceMax) continue;
    if (f.changeMin !== null && s.changePct < f.changeMin) continue;
    if (f.changeMax !== null && s.changePct > f.changeMax) continue;
    if (f.volumeMin !== null && s.volume < f.volumeMin) continue;
    if (f.marketCapMin !== null && s.marketCap < f.marketCapMin) continue;
    if (f.peMin !== null && s.pe < f.peMin) continue;
    if (f.peMax !== null && s.pe > f.peMax) continue;
    // Text search last, because it is the most expensive check
    if (
      q &&
      !s.symbol.toLowerCase().includes(q) &&
      !s.name.toLowerCase().includes(q)
    )
      continue;

    out.push(i);
  }
  return out;
}