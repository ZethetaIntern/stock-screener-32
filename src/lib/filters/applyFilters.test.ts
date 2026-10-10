import { describe, it, expect } from "vitest";
import { applyFilters, isFilterActive } from "./applyFilters";
import { generateStocks } from "../data/generateStocks";
import { EMPTY_FILTERS } from "../../types/filters";

const stocks = generateStocks(5000);

describe("applyFilters", () => {
  it("reports no active filter for empty criteria", () => {
    expect(isFilterActive(EMPTY_FILTERS)).toBe(false);
  });

  it("returns every row when no criteria are set", () => {
    expect(applyFilters(stocks, EMPTY_FILTERS)).toHaveLength(5000);
  });

  it("filters by sector", () => {
    const idx = applyFilters(stocks, { ...EMPTY_FILTERS, sectors: ["Technology"] });
    expect(idx.length).toBeGreaterThan(0);
    expect(idx.every((i) => stocks[i].sector === "Technology")).toBe(true);
  });

  it("combines criteria with AND logic", () => {
    const idx = applyFilters(stocks, {
      ...EMPTY_FILTERS,
      sectors: ["Energy"],
      priceMin: 500,
      peMax: 20,
    });
    expect(
      idx.every((i) => {
        const s = stocks[i];
        return s.sector === "Energy" && s.price >= 500 && s.pe <= 20;
      })
    ).toBe(true);
  });

  it("searches symbol and name case-insensitively", () => {
    const idx = applyFilters(stocks, { ...EMPTY_FILTERS, search: "stk0072" });
    expect(idx.map((i) => stocks[i].symbol)).toEqual(["STK0072"]);
  });

  it("filters 5,000 rows in under 200 ms (median of 20 runs)", () => {
    const criteria = { ...EMPTY_FILTERS, search: "company 1", priceMin: 100 };
    const times: number[] = [];
    for (let i = 0; i < 20; i++) {
      const t0 = performance.now();
      applyFilters(stocks, criteria);
      times.push(performance.now() - t0);
    }
    times.sort((a, b) => a - b);
    expect(times[10]).toBeLessThan(200);
  });
});