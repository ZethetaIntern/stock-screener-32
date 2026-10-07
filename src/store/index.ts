import { create } from "zustand";
import { QuotesSlice, createQuotesSlice } from "./quotesSlice";
import { FiltersSlice, createFiltersSlice } from "./filtersSlice";
import { UiSlice, createUiSlice } from "./uiSlice";

export type StoreState = QuotesSlice & FiltersSlice & UiSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createQuotesSlice(...a),
  ...createFiltersSlice(...a),
  ...createUiSlice(...a),
}));
