"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { generateStocks } from "@/lib/data/generateStocks";
import StockTable from "./table/StockTable";
import LiveFeedPanel from "./LiveFeedPanel";
import FilterBar from "./FilterBar";
import FpsMeter from "./FpsMeter";
import dynamic from "next/dynamic";

const ChartPanel = dynamic(() => import("./chart/ChartPanel"), { ssr: false });

export default function Screener() {
  const setStocks = useStore((s) => s.setStocks);

  useEffect(() => {
    setStocks(generateStocks());
  }, [setStocks]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <FpsMeter />
      <h1 className="mb-4 text-2xl font-bold">Real-Time Stock Screener</h1>
      <LiveFeedPanel />
      <FilterBar />
      <ChartPanel />
      <StockTable />
    </main>
  );
}