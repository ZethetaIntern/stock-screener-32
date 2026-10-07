"use client";

import { useRef } from "react";

export default function PriceCell({ value }: { value: number }) {
  const state = useRef<{ value: number; dir: "up" | "down" | null }>({
    value,
    dir: null,
  });

  if (state.current.value !== value) {
    state.current = {
      value,
      dir: value > state.current.value ? "up" : "down",
    };
  }
  const { dir } = state.current;

  // Changing the key remounts the span, which restarts the CSS animation
  return (
    <span key={value} className={dir ? `flash-${dir}` : ""}>
      {value.toFixed(2)}
    </span>
  );
}