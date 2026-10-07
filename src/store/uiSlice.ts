import { StateCreator } from "zustand";
import type { StoreState } from "./index";

export interface UiSlice {
  selectedSymbol: string | null;
  sort: { id: string; desc: boolean } | null;
  selectSymbol: (symbol: string | null) => void;
  setSort: (sort: { id: string; desc: boolean } | null) => void;
}

export const createUiSlice: StateCreator<StoreState, [], [], UiSlice> = (
  set
) => ({
  selectedSymbol: null,
  sort: null,
  selectSymbol: (selectedSymbol) => set({ selectedSymbol }),
  setSort: (sort) => set({ sort }),
});