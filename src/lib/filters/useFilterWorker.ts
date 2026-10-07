"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store";
import { isFilterActive } from "./applyFilters";
import type { WorkerIn, WorkerOut } from "@/workers/filter.worker";
import { tickBus } from "@/lib/stream/tickBus";

export function useFilterWorker() {
  const workerRef = useRef<Worker | null>(null);
  const reqId = useRef(0);
  const ready = useStore((s) => s.stocks.length > 0);
  const filters = useStore((s) => s.filters);
  const setMatched = useStore((s) => s.setMatched);

  // Create the worker once and send it the initial dataset
  useEffect(() => {
    if (!ready) return;
    const worker = new Worker(
      new URL("../../workers/filter.worker.ts", import.meta.url)
    );
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerOut>) => {
      const { id, indexes, ms } = e.data;
      if (id !== reqId.current) return; // ignore stale results
      if (!isFilterActive(useStore.getState().filters)) return;
      setMatched(indexes, ms);
    };

    const init: WorkerIn = { type: "init", stocks: useStore.getState().stocks };
    worker.postMessage(init);

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [ready, setMatched]);

  // Send filter changes (debounced) to the worker
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    if (!isFilterActive(filters)) {
      reqId.current++; // invalidate any in-flight result
      setMatched(null, null);
      return;
    }

    const timer = setTimeout(() => {
      const id = ++reqId.current;
      const msg: WorkerIn = { type: "filter", id, criteria: filters };
      worker.postMessage(msg);
    }, 150);

    return () => clearTimeout(timer);
  }, [filters, ready, setMatched]);

  // Forward live ticks to the worker so its data stays current
    // Forward live ticks to the worker so its data stays current
  useEffect(() => {
    return tickBus.subscribe((ticks) => {
      const msg: WorkerIn = { type: "ticks", ticks };
      workerRef.current?.postMessage(msg);
    });
  }, []);

  return workerRef;
}