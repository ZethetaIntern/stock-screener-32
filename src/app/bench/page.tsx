"use client";

import { useState } from "react";
import { runBenchmark, BenchRow } from "@/lib/bench/runBenchmark";

export default function BenchPage() {
  const [rows, setRows] = useState<BenchRow[] | null>(null);
  const [running, setRunning] = useState(false);

  const run = () => {
    setRunning(true);
    // Let the button state paint before the blocking run starts
    setTimeout(() => {
      setRows(runBenchmark());
      setRunning(false);
    }, 50);
  };

  return (
    <main className="mx-auto max-w-4xl p-6 text-neutral-100">
      <h1 className="mb-2 text-2xl font-bold">Filter benchmark</h1>
      <p className="mb-4 text-sm text-neutral-400">
        50 runs per scenario after a 5-run warm-up. Times are in milliseconds
        for the same pure function the Web Worker runs.
      </p>
      <button
        onClick={run}
        disabled={running}
        className="mb-4 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {running ? "Running..." : "Run benchmark"}
      </button>

      {rows && (
        <table className="w-full border border-neutral-700 text-sm">
          <thead className="bg-neutral-800 text-left">
            <tr>
              {["Scenario", "Rows", "Matched", "Min", "Median", "P95"].map((h) => (
                <th key={h} className="px-3 py-2">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-neutral-800">
                <td className="px-3 py-2">{r.scenario}</td>
                <td className="px-3 py-2">{r.rows.toLocaleString()}</td>
                <td className="px-3 py-2">{r.matched.toLocaleString()}</td>
                <td className="px-3 py-2">{r.min.toFixed(2)}</td>
                <td className="px-3 py-2">{r.median.toFixed(2)}</td>
                <td className="px-3 py-2">{r.p95.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}