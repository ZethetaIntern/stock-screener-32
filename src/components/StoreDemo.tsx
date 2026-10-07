"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { generateStocks } from "@/lib/data/generateStocks";

export default function StoreDemo() {
  // Selectors: subscribe to ONLY what this component needs
  const count = useStore((s) => s.stocks.length);
  const firstPrice = useStore((s) => s.stocks[0]?.price);
  const setStocks = useStore((s) => s.setStocks);
  const applyTicks = useStore((s) => s.applyTicks);

  useEffect(() => {
    setStocks(generateStocks());
  }, [setStocks]);

  const fireTicks = () => {
    const ticks = Array.from({ length: 500 }, (_, i) => ({
      symbol: `STK${String(i).padStart(4, "0")}`,
      price: +(10 + Math.random() * 990).toFixed(2),
      volume: 100,
    }));
    const t0 = performance.now();
    applyTicks(ticks);
    console.log(`500 ticks applied in ${(performance.now() - t0).toFixed(2)}ms`);
  };

  return (
    <div className="p-6 space-y-3">
      <p>Stocks in store: {count}</p>
      <p>STK0000 price: {firstPrice}</p>
      <button
        onClick={fireTicks}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        Apply 500 random ticks
      </button>
    </div>
  );
}