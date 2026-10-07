import { Stock, Tick } from "@/types/stock";

export class MockSocket {
  static readonly INTERVAL_MS = 50;

  readyState = 0; // 0 connecting, 1 open, 3 closed
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;

  private symbols: string[];
  private prices: Float64Array;
  private ticksPerSecond: number;
  private carry = 0;
  private openTimer: ReturnType<typeof setTimeout>;
  private tickTimer: ReturnType<typeof setInterval> | null = null;

  constructor(stocks: Stock[], ticksPerSecond = 1000) {
    this.symbols = stocks.map((s) => s.symbol);
    this.prices = Float64Array.from(stocks, (s) => s.price);
    this.ticksPerSecond = ticksPerSecond;

    // Simulate the connection handshake (300ms)
    this.openTimer = setTimeout(() => {
      this.readyState = 1;
      this.onopen?.();
      this.tickTimer = setInterval(() => this.emit(), MockSocket.INTERVAL_MS);
    }, 300);
  }

  setRate(ticksPerSecond: number) {
    this.ticksPerSecond = ticksPerSecond;
  }

  close() {
    clearTimeout(this.openTimer);
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.readyState = 3;
    this.onclose?.();
  }

  private emit() {
    // Ticks per 50ms burst; carry keeps fractional ticks so the rate stays exact
    this.carry += (this.ticksPerSecond * MockSocket.INTERVAL_MS) / 1000;
    const n = Math.floor(this.carry);
    this.carry -= n;
    if (n === 0) return;

    const ticks: Tick[] = new Array(n);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * this.symbols.length);
      const drift = (Math.random() - 0.5) * 0.004; // random walk, max ±0.2%
      const price = Math.max(1, +(this.prices[idx] * (1 + drift)).toFixed(2));
      this.prices[idx] = price;
      ticks[i] = {
        symbol: this.symbols[idx],
        price,
        volume: Math.floor(Math.random() * 500),
      };
    }
    // Real sockets deliver strings, so serialize like a server would
    this.onmessage?.({ data: JSON.stringify(ticks) });
  }
}