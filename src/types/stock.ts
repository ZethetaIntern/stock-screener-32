export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  changePct: number;
  volume: number;
  marketCap: number;
  pe: number;
  high52: number;
  low52: number;
}

export interface Candle {
  time: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Tick {
  symbol: string;
  price: number;
  volume: number;
}