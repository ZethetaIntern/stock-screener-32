"use client";

import { useMemo, useState } from "react";
import { useStore } from "@/store";
import { generateCandles } from "@/lib/data/generateCandles";
import CandlestickChart, { Overlays } from "./CandlestickChart";

const BUTTONS: { key: keyof Overlays; label: string; color: string }[] = [
  { key: "sma", label: "SMA 20", color: "bg-yellow-500" },
  { key: "ema", label: "EMA 50", color: "bg-sky-500" },
  { key: "bb", label: "Bollinger", color: "bg-violet-500" },
  { key: "rsi", label: "RSI 14", color: "bg-orange-500" },
  { key: "macd", label: "MACD", color: "bg-cyan-500" },
];

export default function ChartPanel() {
  const symbol = useStore((s) => s.selectedSymbol);
  const [overlays, setOverlays] = useState<Overlays>({
    sma: true,
    ema: false,
    bb: false,
    rsi: false,
    macd: false,
  });

  // Candles depend only on the selected symbol, not on live price ticks
  const candles = useMemo(() => {
    if (!symbol) return null;
    const { stocks, indexBySymbol } = useStore.getState();
    const stock = stocks[indexBySymbol[symbol]];
    return stock ? generateCandles(symbol, stock.price) : null;
  }, [symbol]);

  return (
    <div className="mb-4 rounded border border-neutral-700 bg-neutral-900 p-3 text-neutral-100">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="mr-2 text-lg font-semibold">{symbol ?? "Chart"}</h2>
        {BUTTONS.map((b) => (
          <button
            key={b.key}
            onClick={() => setOverlays((o) => ({ ...o, [b.key]: !o[b.key] }))}
            className={`rounded-full border px-3 py-1 text-xs ${
              overlays[b.key]
                ? `${b.color} border-transparent text-black`
                : "border-neutral-600 text-neutral-300"
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {candles ? (
        <CandlestickChart candles={candles} overlays={overlays} />
      ) : (
        <p className="py-16 text-center text-sm text-neutral-400">
          Click any row in the table to chart that stock.
        </p>
      )}
    </div>
  );
}