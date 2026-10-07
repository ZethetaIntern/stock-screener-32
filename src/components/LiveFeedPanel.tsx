"use client";

import { useState } from "react";
import { useLiveFeed } from "@/lib/stream/useLiveFeed";

const RATES = [100, 500, 1000, 2500, 5000];

export default function LiveFeedPanel() {
  const [enabled, setEnabled] = useState(false);
  const [rate, setRate] = useState(1000);
  const stats = useLiveFeed(rate, enabled);

  const dot =
    stats.status === "live"
      ? "bg-green-400"
      : stats.status === "connecting"
      ? "bg-yellow-400"
      : "bg-neutral-500";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 rounded border border-neutral-700 bg-neutral-900 p-3 text-sm text-neutral-100">
      <button
        onClick={() => setEnabled((e) => !e)}
        className={`rounded px-3 py-1 text-white ${
          enabled ? "bg-red-600" : "bg-blue-600"
        }`}
      >
        {enabled ? "Stop feed" : "Start feed"}
      </button>

      <label className="flex items-center gap-2">
        Rate
        <select
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="rounded bg-neutral-800 px-2 py-1"
        >
          {RATES.map((r) => (
            <option key={r} value={r}>
              {r.toLocaleString()} ticks/s
            </option>
          ))}
        </select>
      </label>

      <span className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {stats.status}
      </span>
      <span>Received: {stats.ticksPerSec.toLocaleString()} ticks/s</span>
      <span>UI updates: {stats.flushesPerSec}/s</span>
      <span>Last store update: {stats.lastFlushMs.toFixed(2)} ms</span>
    </div>
  );
}