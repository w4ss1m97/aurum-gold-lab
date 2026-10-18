// ============================================================================
// AURUM OS — INDICATORS & PRICE-ACTION PRIMITIVES
// Bars are { t (open time, ms UTC), o, h, l, c }. Every function is causal:
// a value at index i only uses bars[0..i] unless documented otherwise.
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});

  // Wilder ATR
  function atr(bars, n = 14) {
    const out = new Array(bars.length).fill(NaN);
    let prev = NaN;
    for (let i = 0; i < bars.length; i++) {
      const b = bars[i];
      const tr = i === 0 ? b.h - b.l : Math.max(b.h - b.l, Math.abs(b.h - bars[i - 1].c), Math.abs(b.l - bars[i - 1].c));
      if (i < n) {
        prev = isNaN(prev) ? tr : prev + tr;
        if (i === n - 1) { prev = prev / n; out[i] = prev; }
      } else {
        prev = (prev * (n - 1) + tr) / n;
        out[i] = prev;
      }
    }
    return out;
  }

  // Wilder RSI on closes
  function rsi(bars, n = 14) {
    const out = new Array(bars.length).fill(NaN);
    let gain = 0, loss = 0;
    for (let i = 1; i < bars.length; i++) {
      const d = bars[i].c - bars[i - 1].c;
      const up = Math.max(d, 0), dn = Math.max(-d, 0);
      if (i <= n) {
        gain += up; loss += dn;
        if (i === n) { gain /= n; loss /= n; out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss); }
      } else {
        gain = (gain * (n - 1) + up) / n;
        loss = (loss * (n - 1) + dn) / n;
        out[i] = loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
      }
    }
    return out;
  }

  // Fractal swing pivots. A pivot at index i is only *known* at index i + right.
  // Returns { highs: [{i, price, confirmedAt}], lows: [...] } sorted by i.
  function pivots(bars, left = 3, right = 3) {
    const highs = [], lows = [];
    for (let i = left; i < bars.length - right; i++) {
      let isH = true, isL = true;
      for (let k = i - left; k <= i + right; k++) {
        if (k === i) continue;
        if (bars[k].h >= bars[i].h && (k > i || bars[k].h > bars[i].h)) isH = false;
        if (bars[k].l <= bars[i].l && (k > i || bars[k].l < bars[i].l)) isL = false;
        if (!isH && !isL) break;
      }
      if (isH) highs.push({ i, price: bars[i].h, confirmedAt: i + right });
      if (isL) lows.push({ i, price: bars[i].l, confirmedAt: i + right });
    }
    return { highs, lows };
  }

  // Last pivot in `list` with index < beforeI that is confirmed by index `nowI`.
  function lastPivot(list, nowI, beforeI = Infinity) {
    for (let k = list.length - 1; k >= 0; k--) {
      const p = list[k];
      if (p.confirmedAt <= nowI && p.i < beforeI) return p;
    }
    return null;
  }

  // 3-candle Fair Value Gap that completes at index i (known at close of i).
  // dir 1 = bullish gap [bars[i-2].h, bars[i].l]; dir -1 = bearish gap [bars[i].h, bars[i-2].l].
  function fvgAt(bars, i) {
    if (i < 2) return null;
    const a = bars[i - 2], c = bars[i];
    if (c.l > a.h) return { dir: 1, i, bottom: a.h, top: c.l };
    if (c.h < a.l) return { dir: -1, i, bottom: c.h, top: a.l };
    return null;
  }

  function overlaps(lo1, hi1, lo2, hi2) {
    return Math.max(lo1, lo2) <= Math.min(hi1, hi2);
  }

  // Aggregate bars into a larger timeframe (UTC-aligned buckets).
  function resample(bars, tfMs) {
    const out = [];
    let cur = null;
    for (const b of bars) {
      const t = Math.floor(b.t / tfMs) * tfMs;
      if (!cur || cur.t !== t) {
        if (cur) out.push(cur);
        cur = { t, o: b.o, h: b.h, l: b.l, c: b.c };
      } else {
        cur.h = Math.max(cur.h, b.h);
        cur.l = Math.min(cur.l, b.l);
        cur.c = b.c;
      }
    }
    if (cur) out.push(cur);
    return out;
  }

  // Index of the first bar with t >= time (binary search).
  function indexAtOrAfter(bars, time) {
    let lo = 0, hi = bars.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (bars[mid].t < time) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  A.ind = { atr, rsi, pivots, lastPivot, fvgAt, overlaps, resample, indexAtOrAfter };
})(typeof window !== 'undefined' ? window : globalThis);
