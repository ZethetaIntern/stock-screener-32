"use client";

import { useEffect, useState } from "react";

export default function FpsMeter() {
  const [fps, setFps] = useState(0);
  const [min, setMin] = useState<number | null>(null);

  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      frames++;
      if (now - last >= 1000) {
        const v = Math.round((frames * 1000) / (now - last));
        setFps(v);
        setMin((m) => (m === null ? v : Math.min(m, v)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <button
      onClick={() => setMin(null)}
      title="Click to reset the minimum"
      className="fixed right-3 top-3 z-50 rounded bg-black/80 px-3 py-1 font-mono text-xs text-green-400"
    >
      {fps} FPS | min {min ?? "-"}
    </button>
  );
}