export interface FilterCriteria {
  search: string;
  sectors: string[];
  priceMin: number | null;
  priceMax: number | null;
  changeMin: number | null;
  changeMax: number | null;
  volumeMin: number | null;
  marketCapMin: number | null;
  peMin: number | null;
  peMax: number | null;
}

export const EMPTY_FILTERS: FilterCriteria = {
  search: "",
  sectors: [],
  priceMin: null,
  priceMax: null,
  changeMin: null,
  changeMax: null,
  volumeMin: null,
  marketCapMin: null,
  peMin: null,
  peMax: null,
};