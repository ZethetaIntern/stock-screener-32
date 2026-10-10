import { Candle } from "@/types/stock";

// Same PRNG as the stock generator, so each symbol always gets the same history
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Daily candles ending today. The whole series is scaled so the last close
// equals the stock's current price.
export function generateCandles(
  symbol: string,
  endPrice: number,
  count = 300
): Candle[] {
  const r = rng(hash(symbol));
  const DAY = 86400;
  const today = Math.floor(Date.now() / 1000 / DAY) * DAY;

  const raw: Candle[] = [];
  let prevClose = 100;
  const drift = (r() - 0.5) * 0.002; // each symbol gets its own trend

  for (let i = 0; i < count; i++) {
    const open = prevClose;
    const close = Math.max(1, open * (1 + drift + (r() - 0.5) * 0.04));
    const high = Math.max(open, close) * (1 + r() * 0.01);
    const low = Math.min(open, close) * (1 - r() * 0.01);
    raw.push({ time: today - (count - 1 - i) * DAY, open, high, low, close });
    prevClose = close;
  }

  const k = endPrice / raw[raw.length - 1].close;
  return raw.map((c) => ({
    time: c.time,
    open: +(c.open * k).toFixed(2),
    high: +(c.high * k).toFixed(2),
    low: +(c.low * k).toFixed(2),
    close: +(c.close * k).toFixed(2),
  }));
}