import { describe, it, expect } from "vitest";
import { sma, ema, bollinger, rsi, macd } from "./index";

describe("indicators", () => {
  it("sma", () => {
    expect(sma([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it("ema", () => {
    expect(ema([1, 2, 3, 4, 5], 3)).toEqual([null, null, 2, 3, 4]);
  });

  it("bollinger collapses on a flat series", () => {
    const b = bollinger(new Array(25).fill(10), 20, 2);
    expect(b.upper[24]).toBe(10);
    expect(b.lower[24]).toBe(10);
  });

  it("rsi is 100 for a strictly rising series", () => {
    const up = Array.from({ length: 30 }, (_, i) => i + 1);
    expect(rsi(up, 14)[29]).toBe(100);
  });

  it("macd keeps the input length and warms up first", () => {
    const v = Array.from({ length: 60 }, (_, i) => Math.sin(i / 5) * 10 + 100);
    const m = macd(v);
    expect(m.line.length).toBe(60);
    expect(m.line[24]).toBeNull(); // slow EMA needs 26 values
    expect(m.line[25]).not.toBeNull();
    expect(m.histogram[59]).not.toBeNull();
  });
});