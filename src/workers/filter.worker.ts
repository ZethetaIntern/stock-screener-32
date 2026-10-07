import { Stock, Tick } from "@/types/stock";
import { FilterCriteria } from "@/types/filters";
import { applyFilters } from "@/lib/filters/applyFilters";

export type WorkerIn =
  | { type: "init"; stocks: Stock[] }
  | { type: "ticks"; ticks: Tick[] }
  | { type: "filter"; id: number; criteria: FilterCriteria };

export type WorkerOut = { type: "result"; id: number; indexes: number[]; ms: number };

let stocks: Stock[] = [];
let indexBySymbol = new Map<string, number>();
let lastCriteria: FilterCriteria | null = null;
let lastId = 0;

function run() {
  if (!lastCriteria) return;
  const t0 = performance.now();
  const indexes = applyFilters(stocks, lastCriteria);
  const ms = performance.now() - t0;
  (self as unknown as Worker).postMessage({
    type: "result",
    id: lastId,
    indexes,
    ms,
  } satisfies WorkerOut);
}

self.onmessage = (e: MessageEvent<WorkerIn>) => {
  const msg = e.data;

  if (msg.type === "init") {
    stocks = msg.stocks.map((s) => ({ ...s }));
    indexBySymbol = new Map(stocks.map((s, i) => [s.symbol, i]));
  } else if (msg.type === "ticks") {
    for (const t of msg.ticks) {
      const i = indexBySymbol.get(t.symbol);
      if (i === undefined) continue;
      const s = stocks[i];
      const base = s.price / (1 + s.changePct / 100);
      s.price = t.price;
      s.volume += t.volume;
      s.changePct = +((t.price / base - 1) * 100).toFixed(2);
    }
    run(); // re-filter so results stay correct as prices move
  } else if (msg.type === "filter") {
    lastCriteria = msg.criteria;
    lastId = msg.id;
    run();
  }
};
