import { Stock } from "@/types/stock";

const SECTORS = ["Technology", "Finance", "Healthcare", "Energy",
  "Consumer", "Industrials", "Utilities", "Materials"];

// Deterministic PRNG (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateStocks(count = 5000, seed = 42): Stock[] {
  const r = rng(seed);
  return Array.from({ length: count }, (_, i) => {
    const price = +(10 + r() * 990).toFixed(2);
    return {
      symbol: `STK${String(i).padStart(4, "0")}`,
      name: `Company ${i}`,
      sector: SECTORS[Math.floor(r() * SECTORS.length)],
      price,
      changePct: +((r() - 0.5) * 10).toFixed(2),
      volume: Math.floor(r() * 5_000_000),
      marketCap: Math.floor(price * (1e6 + r() * 1e9)),
      pe: +(5 + r() * 60).toFixed(1),
      high52: +(price * (1 + r() * 0.5)).toFixed(2),
      low52: +(price * (1 - r() * 0.5)).toFixed(2),
    };
  });
}