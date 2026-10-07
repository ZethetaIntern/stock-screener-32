import { StateCreator } from "zustand";
import { FilterCriteria, EMPTY_FILTERS } from "@/types/filters";
import type { StoreState } from "./index";

export interface FiltersSlice {
  filters: FilterCriteria;
  // Row indexes that pass the filters. null = no filtering active.
  matchedIndexes: number[] | null;
  lastFilterMs: number | null; // for the benchmark in Part 7
  setFilter: <K extends keyof FilterCriteria>(
    key: K,
    value: FilterCriteria[K]
  ) => void;
  resetFilters: () => void;
  setMatched: (indexes: number[] | null, ms: number | null) => void;
}

export const createFiltersSlice: StateCreator<
  StoreState,
  [],
  [],
  FiltersSlice
> = (set) => ({
  filters: EMPTY_FILTERS,
  matchedIndexes: null,
  lastFilterMs: null,

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () =>
    set({ filters: EMPTY_FILTERS, matchedIndexes: null, lastFilterMs: null }),

  setMatched: (matchedIndexes, lastFilterMs) =>
    set({ matchedIndexes, lastFilterMs }),
});