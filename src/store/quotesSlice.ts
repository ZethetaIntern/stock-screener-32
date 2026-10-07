import { StateCreator } from "zustand";
import { Stock, Tick } from "@/types/stock";
import type { StoreState } from "./index";

export interface QuotesSlice {
  stocks: Stock[];
  indexBySymbol: Record<string, number>;
  setStocks: (stocks: Stock[]) => void;
  applyTicks: (ticks: Tick[]) => void;
}

export const createQuotesSlice: StateCreator<
  StoreState,
  [],
  [],
  QuotesSlice
> = (set) => ({
  stocks: [],
  indexBySymbol: {},

  setStocks: (stocks) => {
    const indexBySymbol: Record<string, number> = {};
    stocks.forEach((s, i) => (indexBySymbol[s.symbol] = i));
    set({ stocks, indexBySymbol });
  },

  // Apply a whole batch of ticks in ONE state update
  applyTicks: (ticks) =>
    set((state) => {
      const next = state.stocks.slice(); // new array reference
      for (const t of ticks) {
        const i = state.indexBySymbol[t.symbol];
        if (i === undefined) continue;
        const prev = next[i];
        // Recover the opening price from the current price and change %
        const base = prev.price / (1 + prev.changePct / 100);
        next[i] = {
          ...prev,
          price: t.price,
          volume: prev.volume + t.volume,
          changePct: +((t.price / base - 1) * 100).toFixed(2),
        };
      }
      return { stocks: next };
    }),
});