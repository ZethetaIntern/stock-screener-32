"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/store";
import { Tick } from "@/types/stock";
import { MockSocket } from "./MockSocket";
import { tickBus } from "./tickBus";

const FLUSH_MS = 200;

export interface FeedStats {
  status: "off" | "connecting" | "live";
  ticksPerSec: number;
  flushesPerSec: number;
  lastFlushMs: number;
}

const OFF: FeedStats = {
  status: "off",
  ticksPerSec: 0,
  flushesPerSec: 0,
  lastFlushMs: 0,
};

export function useLiveFeed(rate: number, enabled: boolean): FeedStats {
  const [stats, setStats] = useState<FeedStats>(OFF);
  const socketRef = useRef<MockSocket | null>(null);
  const rateRef = useRef(rate);
  rateRef.current = rate;

  const ready = useStore((s) => s.stocks.length > 0);
  const applyTicks = useStore((s) => s.applyTicks);

  // Changing the rate adjusts the live socket without reconnecting
  useEffect(() => {
    socketRef.current?.setRate(rate);
  }, [rate]);

  useEffect(() => {
    if (!enabled || !ready) {
      setStats(OFF);
      return;
    }

    const buffer = new Map<string, Tick>();
    let received = 0;
    let flushes = 0;
    let lastFlushMs = 0;

    const socket = new MockSocket(useStore.getState().stocks, rateRef.current);
    socketRef.current = socket;
    setStats({ ...OFF, status: "connecting" });

    socket.onopen = () => setStats((s) => ({ ...s, status: "live" }));

    socket.onmessage = (ev) => {
      const ticks: Tick[] = JSON.parse(ev.data);
      received += ticks.length;
      for (const t of ticks) {
        const existing = buffer.get(t.symbol);
        if (existing) {
          existing.price = t.price; // keep the latest price
          existing.volume += t.volume; // but sum the volume
        } else {
          buffer.set(t.symbol, { ...t });
        }
      }
    };

    const flush = () => {
      if (buffer.size === 0) return;
      const batch = Array.from(buffer.values());
      buffer.clear();
      const t0 = performance.now();
      applyTicks(batch);
      tickBus.publish(batch);
      lastFlushMs = performance.now() - t0;
      flushes++;
    };

    // Flush on animation frames, at most once every FLUSH_MS
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      if (now - last >= FLUSH_MS) {
        last = now;
        flush();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Publish stats once per second
    const statsTimer = setInterval(() => {
      const snap = { ticksPerSec: received, flushesPerSec: flushes, lastFlushMs };
      received = 0;
      flushes = 0;
      setStats((s) => ({ ...s, ...snap }));
    }, 1000);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(statsTimer);
      socket.close();
      socketRef.current = null;
    };
  }, [enabled, ready, applyTicks]);

  return stats;
}