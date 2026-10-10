export type Series = (number | null)[];

const nulls = (n: number): Series => new Array(n).fill(null);

// Simple moving average
export function sma(v: number[], period: number): Series {
  const out = nulls(v.length);
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i];
    if (i >= period) sum -= v[i - period];
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

// Exponential moving average, seeded with the SMA of the first `period` values
export function ema(v: number[], period: number): Series {
  const out = nulls(v.length);
  if (v.length < period) return out;
  const k = 2 / (period + 1);
  let prev = 0;
  for (let i = 0; i < period; i++) prev += v[i];
  prev /= period;
  out[period - 1] = prev;
  for (let i = period; i < v.length; i++) {
    prev = v[i] * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

// Bollinger Bands: SMA +/- mult * standard deviation
export function bollinger(v: number[], period = 20, mult = 2) {
  const middle = sma(v, period);
  const upper = nulls(v.length);
  const lower = nulls(v.length);
  for (let i = period - 1; i < v.length; i++) {
    const mean = middle[i] as number;
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) variance += (v[j] - mean) ** 2;
    const sd = Math.sqrt(variance / period);
    upper[i] = mean + mult * sd;
    lower[i] = mean - mult * sd;
  }
  return { upper, middle, lower };
}

// RSI with Wilder's smoothing
export function rsi(v: number[], period = 14): Series {
  const out = nulls(v.length);
  if (v.length <= period) return out;
  const toRsi = (g: number, l: number) => (l === 0 ? 100 : 100 - 100 / (1 + g / l));

  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = v[i] - v[i - 1];
    gain += Math.max(d, 0);
    loss += Math.max(-d, 0);
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  out[period] = toRsi(avgGain, avgLoss);

  for (let i = period + 1; i < v.length; i++) {
    const d = v[i] - v[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(d, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-d, 0)) / period;
    out[i] = toRsi(avgGain, avgLoss);
  }
  return out;
}

// MACD: (fast EMA - slow EMA), a signal EMA of that line, and the histogram
export function macd(v: number[], fast = 12, slow = 26, signalPeriod = 9) {
  const f = ema(v, fast);
  const s = ema(v, slow);
  const line: Series = v.map((_, i) =>
    f[i] !== null && s[i] !== null ? (f[i] as number) - (s[i] as number) : null
  );

  const signal = nulls(v.length);
  const first = line.findIndex((x) => x !== null);
  if (first >= 0) {
    const sig = ema(line.slice(first) as number[], signalPeriod);
    sig.forEach((x, j) => (signal[first + j] = x));
  }

  const histogram: Series = v.map((_, i) =>
    line[i] !== null && signal[i] !== null
      ? (line[i] as number) - (signal[i] as number)
      : null
  );
  return { line, signal, histogram };
}