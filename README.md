# Real-Time Stock Screener

A front-end stock screener built with Next.js 14, React 18, TypeScript, Zustand and TanStack Table. It streams simulated live prices for 5,000 stocks, filters them in a Web Worker, and charts any stock with five technical indicators.

## Features
- Virtualized table of 5,000 stocks (TanStack Table + TanStack Virtual), sortable
- Simulated WebSocket price stream (100 to 5,000 ticks/s) with batched UI updates and price-change flashes
- Multi-criteria filter engine (search, sectors, price, change %, volume, market cap, P/E) running in a Web Worker
- Candlestick chart (lightweight-charts) with SMA 20, EMA 50, Bollinger Bands, RSI 14 and MACD
- Unit tests for indicators and the filter engine (Vitest)

## Getting started
```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit tests
npm run build && npm start   # production build
```
Benchmark page: `/bench`.

## Architecture
```
MockSocket --JSON ticks--> buffer (Map, latest price per symbol)
                              |  flush every 200 ms (requestAnimationFrame)
                              v
                     Zustand store: applyTicks() -- ONE update per batch
                       |-- quotes slice --> StockTable (virtualized)
                       |-- ui slice     --> selectedSymbol --> ChartPanel
                       '-- filters slice --> Web Worker --> matchedIndexes --> StockTable
                              ^                  ^
                     tickBus forwards each batch to the worker so its data copy stays current
```

```
src/
  app/           pages (home, /bench)
  components/    table/, chart/, FilterBar, LiveFeedPanel, FpsMeter
  store/         Zustand slices: quotes, filters, ui
  lib/
    data/        seeded stock and candle generators
    indicators/  sma, ema, bollinger, rsi, macd (pure functions)
    filters/     applyFilters (pure), useFilterWorker
    stream/      MockSocket, useLiveFeed, tickBus
    bench/       benchmark runner
  workers/       filter.worker.ts
  types/
```

## Design decisions
1. **Pure logic in `lib/`.** Indicators and the filter engine have no React dependency, so they are unit-tested and reusable inside the worker.
2. **Virtualization.** Only visible rows plus a 10-row overscan exist in the DOM (27 to 37 of 5,000).
3. **Conflation and batching.** The socket delivers ticks in 50 ms bursts, the buffer keeps only the latest price per symbol, and the UI flushes every 200 ms. Render rate no longer depends on tick rate.
4. **Zustand slices and selectors.** Components subscribe only to the state they use, so price ticks do not re-render the filter bar or chart.
5. **Off-main-thread filtering.** The worker holds its own copy of the data and returns row indexes instead of cloned objects. Request IDs discard stale results.
6. **Separate indicator panels.** lightweight-charts v4 has no panes, so RSI and MACD are separate charts with synchronized time axes. Warm-up points are kept as empty points so indexes stay aligned.
7. **Deterministic data.** Stocks and candle history are seeded, so benchmarks and charts are reproducible.

## Performance results
Measured on: TODO (CPU, RAM, browser version), production build, Incognito.

| Measurement | Result |
|---|---|
| Filter compute, 5,000 rows ( 0.20 / 0.30 ) 
| Filter compute, 50,000 rows (1.30 / 1.50)
| Store update at 1,000 ticks/s | 0.50 ms |
| Store update at 5,000 ticks/s | 1.70 ms |
| UI updates at 1,000 and 5,000 ticks/s | 5 per second |
| Rows in DOM | 27 to 37 |
| FPS while streaming 5,000 ticks/s (60 / min 1)
| Lighthouse Performance (68 / 69)

**Methodology.** Filter times are the worker's compute time (the pure function, 50 runs after warm-up). The 150 ms input debounce is a deliberate UX choice and is excluded. Store update time covers only the Zustand write, not the React re-render.

## Testing
`npm test` runs TODO tests covering all five indicators and the filter engine, including a 200 ms performance assertion on 5,000 rows.

## Known limitations
- Data is simulated, and the socket is a mock with the same interface shape as `WebSocket`.
- Sorting runs on the main thread after filtering. It is fast at 5,000 rows, but a much larger dataset would need it moved into the worker.
- Candle history is generated, not real market data.
- Next.js is pinned to 14 as the brief requires, so `npm audit` reports advisories from that dependency tree.