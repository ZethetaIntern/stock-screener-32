import { Tick } from "@/types/stock";

type Listener = (ticks: Tick[]) => void;
const listeners = new Set<Listener>();

export const tickBus = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  publish(ticks: Tick[]) {
    listeners.forEach((fn) => fn(ticks));
  },
};