"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  IChartApi,
  LineStyle,
  Time,
  createChart,
} from "lightweight-charts";
import { Candle } from "@/types/stock";
import { bollinger, ema, macd, rsi, sma, Series } from "@/lib/indicators";

export interface Overlays {
  sma: boolean;
  ema: boolean;
  bb: boolean;
  rsi: boolean;
  macd: boolean;
}

const theme = {
  layout: {
    background: { type: ColorType.Solid, color: "#171717" },
    textColor: "#d4d4d4",
  },
  grid: {
    vertLines: { color: "#262626" },
    horzLines: { color: "#262626" },
  },
  rightPriceScale: { borderColor: "#404040" },
  timeScale: { borderColor: "#404040" },
} as const;

function toLine(candles: Candle[], values: Series) {
  return candles.map((c, i) => {
    const v = values[i];
    return v === null
      ? { time: c.time as Time }
      : { time: c.time as Time, value: v };
  });
}

export default function CandlestickChart({
  candles,
  overlays,
}: {
  candles: Candle[];
  overlays: Overlays;
}) {
  const mainRef = useRef<HTMLDivElement>(null);
  const rsiRef = useRef<HTMLDivElement>(null);
  const macdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;
    const closes = candles.map((c) => c.close);
    const charts: IChartApi[] = [];

    // ---- Main chart: candles + overlays ----
    const main = createChart(mainRef.current, { ...theme, autoSize: true });
    charts.push(main);

    const candleSeries = main.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderVisible: false,
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });
    candleSeries.setData(
      candles.map((c) => ({ ...c, time: c.time as Time }))
    );

    const addLine = (values: Series, color: string, style = LineStyle.Solid) => {
      const s = main.addLineSeries({
        color,
        lineWidth: 2,
        lineStyle: style,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      s.setData(toLine(candles, values));
    };

    if (overlays.sma) addLine(sma(closes, 20), "#facc15");
    if (overlays.ema) addLine(ema(closes, 50), "#38bdf8");
    if (overlays.bb) {
      const b = bollinger(closes, 20, 2);
      addLine(b.upper, "#a78bfa", LineStyle.Dashed);
      addLine(b.middle, "#a78bfa", LineStyle.Dotted);
      addLine(b.lower, "#a78bfa", LineStyle.Dashed);
    }

    // ---- RSI panel ----
    if (overlays.rsi && rsiRef.current) {
      const c = createChart(rsiRef.current, { ...theme, autoSize: true });
      charts.push(c);
      const s = c.addLineSeries({
        color: "#fb923c",
        lineWidth: 2,
        priceLineVisible: false,
        autoscaleInfoProvider: () => ({
          priceRange: { minValue: 0, maxValue: 100 },
        }),
      });
      s.setData(toLine(candles, rsi(closes, 14)));
      for (const price of [70, 30]) {
        s.createPriceLine({
          price,
          color: "#737373",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          axisLabelVisible: true,
          title: "",
        });
      }
    }

    // ---- MACD panel ----
    if (overlays.macd && macdRef.current) {
      const c = createChart(macdRef.current, { ...theme, autoSize: true });
      charts.push(c);
      const m = macd(closes, 12, 26, 9);

      const hist = c.addHistogramSeries({
        priceLineVisible: false,
        lastValueVisible: false,
      });
      hist.setData(
        candles.map((cd, i) => {
          const v = m.histogram[i];
          return v === null
            ? { time: cd.time as Time }
            : {
                time: cd.time as Time,
                value: v,
                color: v >= 0 ? "#22c55e99" : "#ef444499",
              };
        })
      );
      const line = c.addLineSeries({
        color: "#38bdf8",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      line.setData(toLine(candles, m.line));
      const sig = c.addLineSeries({
        color: "#fb923c",
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      });
      sig.setData(toLine(candles, m.signal));
    }

    // ---- Keep all time axes in sync (scroll/zoom one, all follow) ----
    let syncing = false;
    charts.forEach((src) => {
      src.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (syncing || !range) return;
        syncing = true;
        charts.forEach((dst) => {
          if (dst !== src) dst.timeScale().setVisibleLogicalRange(range);
        });
        syncing = false;
      });
    });

    // Show the most recent ~120 candles first
    main.timeScale().setVisibleLogicalRange({
      from: candles.length - 120,
      to: candles.length + 2,
    });

    return () => charts.forEach((c) => c.remove());
  }, [candles, overlays]);

  return (
    <div className="space-y-1">
      <div ref={mainRef} className="h-[360px] w-full" />
      {overlays.rsi && (
        <div>
          <p className="text-xs text-neutral-400">RSI (14)</p>
          <div ref={rsiRef} className="h-[120px] w-full" />
        </div>
      )}
      {overlays.macd && (
        <div>
          <p className="text-xs text-neutral-400">MACD (12, 26, 9)</p>
          <div ref={macdRef} className="h-[140px] w-full" />
        </div>
      )}
    </div>
  );
}