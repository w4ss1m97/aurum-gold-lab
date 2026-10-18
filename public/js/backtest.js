// ============================================================================
// AURUM OS — BACKTEST ENGINE
// 1. Scan the setup timeframe (HTF) bar by bar for strategy setups.
// 2. Wait for an entry trigger on the entry timeframe (LTF): FVG, IFVG or a
//    minor double top/bottom. Same TF -> enter at the next bar's open.
// 3. Manage the trade bar by bar: stop, partial at 1R + breakeven, target.
//    If a bar touches both stop and target, the stop is assumed first.
// One position at a time. Spread is charged on every trade.
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});
  const { atr, pivots, fvgAt, indexAtOrAfter } = A.ind;
  const { buildCtx, attachPair } = A.strategy;

  const WARMUP = 60;

  function buildLtfCtx(bars) {
    const a = atr(bars, 14);
    const piv = pivots(bars, 2, 2);
    const mirror = bars.map((b) => ({ t: b.t, o: -b.o, h: -b.l, l: -b.h, c: -b.c }));
    const flip = (x) => ({ ...x, price: -x.price });
    return {
      long: { bars, atr: a, piv },
      short: { bars: mirror, atr: a, piv: { highs: piv.lows.map(flip), lows: piv.highs.map(flip) } },
    };
  }

  // LTF trigger at bar j (LONG perspective on c.bars). winStart: first LTF bar
  // of the setup's pullback, used to look for FVGs to invert / minor bottoms.
  function ltfTrigger(c, j, winStart, triggers) {
    const b = c.bars[j];
    if (triggers.includes('fvg')) {
      const f = fvgAt(c.bars, j);
      if (f && f.dir === 1 && b.c > b.o) return 'LTF FVG';
    }
    if (triggers.includes('ifvg')) {
      for (let k = Math.max(winStart, 2); k < j; k++) {
        const f = fvgAt(c.bars, k);
        if (f && f.dir === -1 && b.c > f.top && c.bars[j - 1].c <= f.top) return 'LTF IFVG';
      }
    }
    if (triggers.includes('mini')) {
      const lows = c.piv.lows;
      let p2 = null, p1 = null;
      for (let k = lows.length - 1; k >= 0; k--) {
        const p = lows[k];
        if (p.confirmedAt > j) continue;
        if (p.i < winStart) break;
        if (!p2) p2 = p; else { p1 = p; break; }
      }
      if (p1 && p2 && Math.abs(p1.price - p2.price) <= 0.25 * c.atr[j]) {
        let neck = -Infinity;
        for (let k = p1.i + 1; k < p2.i; k++) neck = Math.max(neck, c.bars[k].h);
        if (b.c > neck && c.bars[j - 1].c <= neck) return 'LTF mini double bottom';
      }
    }
    return null;
  }

  // Simulate a LONG trade on c.bars (mirrored for shorts) from index `from`.
  function manage(bars, from, entry, stop, target, partialBE) {
    const risk = entry - stop;
    const oneR = entry + risk;
    const usePartial = partialBE && target > oneR;
    let sl = stop, partialDone = false;
    for (let j = from; j < bars.length; j++) {
      const b = bars[j];
      if (b.l <= sl) {
        const r = partialDone ? 0.5 + 0.5 * (sl - entry) / risk : (sl - entry) / risk;
        return { exitIdx: j, exitPrice: sl, r, outcome: partialDone ? 'BE' : 'SL' };
      }
      if (b.h >= target) {
        const full = (target - entry) / risk;
        return { exitIdx: j, exitPrice: target, r: usePartial ? 0.5 + 0.5 * full : full, outcome: 'TP' };
      }
      if (usePartial && !partialDone && b.h >= oneR) { partialDone = true; sl = entry; }
    }
    return null; // still open at the end of the data
  }

  // params: { strategy, cfg, htf, ltf (null = same TF), pairHtf, htfMs, ltfMs,
  //           rr (number | 'struct'), partialBE, spread, startMs, riskPct }
  function run(p) {
    const strat = p.strategy;
    const ctx = buildCtx(p.htf);
    if (strat.needsPair && p.pairHtf) attachPair(ctx, p.htf, p.pairHtf);
    const sameTF = !p.ltf;
    const ltfCtx = sameTF ? null : buildLtfCtx(p.ltf);
    const triggers = strat.ltfTriggers || ['fvg', 'ifvg'];
    const expiryBars = strat.expiryBars || 2;

    const trades = [];
    const seen = new Set();
    let busyUntil = -Infinity;
    let blocked = 0, newsSkipped = 0;

    for (let t = WARMUP; t < p.htf.length - 1; t++) {
      const closeTime = p.htf[t].t + p.htfMs;
      if (closeTime < p.startMs) continue;
      for (const side of ['long', 'short']) {
        const c = ctx[side];
        const dir = side === 'long' ? 1 : -1;
        const setups = strat.detectLong(c, t, p.cfg);
        for (const s of setups) {
          const key = `${side}:${s.key}`;
          if (seen.has(key)) continue;
          seen.add(key);
          if (closeTime < busyUntil) { blocked++; continue; }

          // ---- Entry (all prices in LONG/mirrored space) ----
          let entry, entryTime, mgmtBars, mgmtFrom, trigger;
          if (sameTF) {
            mgmtBars = c.bars;
            entry = c.bars[t + 1].o;
            entryTime = p.htf[t + 1].t;
            mgmtFrom = t + 1;
            trigger = 'Next candle open';
          } else {
            const lc = ltfCtx[side];
            const j0 = indexAtOrAfter(p.ltf, closeTime);
            const jEnd = indexAtOrAfter(p.ltf, closeTime + expiryBars * p.htfMs);
            const winStart = indexAtOrAfter(p.ltf, closeTime - 3 * p.htfMs);
            for (let j = j0; j < Math.min(jEnd, lc.bars.length); j++) {
              if (lc.bars[j].l <= s.stop) break;                 // invalidated before entry
              const why = ltfTrigger(lc, j, winStart, triggers);
              if (why) {
                entry = lc.bars[j].c;
                entryTime = p.ltf[j].t + p.ltfMs;
                mgmtBars = lc.bars;
                mgmtFrom = j + 1;
                trigger = why;
                break;
              }
            }
            if (entry === undefined) continue;                   // no trigger: setup expired
          }

          // News filter: no entry 2h before or 1h after a high-impact USD release.
          if (p.newsFilter && A.news && A.news.between(entryTime - 3600e3, entryTime + 2 * 3600e3).length) { newsSkipped++; continue; }

          const fill = entry + p.spread;                         // buy at the ask
          const risk = fill - s.stop;
          if (!(risk > p.spread * 2)) continue;
          let target, rrUsed;
          if (p.rr === 'struct') {
            rrUsed = (s.target - fill) / risk;
            if (!(rrUsed >= 1)) { rrUsed = 2; }
            target = fill + rrUsed * risk;
          } else {
            rrUsed = p.rr;
            target = fill + rrUsed * risk;
          }
          const res = manage(mgmtBars, mgmtFrom, fill, s.stop, target, p.partialBE);
          const unm = (x) => (dir === 1 ? x : -x);
          const tr = {
            dir, side: dir === 1 ? 'LONG' : 'SHORT',
            setupTime: closeTime, entryTime,
            entry: unm(fill), stop: unm(s.stop), target: unm(target), rr: rrUsed,
            trigger, reasons: s.reasons,
          };
          if (!res) {
            tr.open = true;
            trades.push(tr);
            busyUntil = Infinity;
            continue;
          }
          const mgmtTfMs = sameTF ? p.htfMs : p.ltfMs;
          tr.exitTime = mgmtBars === c.bars ? p.htf[res.exitIdx].t + mgmtTfMs : p.ltf[res.exitIdx].t + mgmtTfMs;
          tr.exitPrice = unm(res.exitPrice);
          tr.r = res.r;
          tr.outcome = res.outcome;
          trades.push(tr);
          busyUntil = tr.exitTime;
        }
      }
    }
    const closed = trades.filter((x) => !x.open && x.entryTime >= p.startMs);
    return { trades: trades.filter((x) => x.entryTime >= p.startMs), stats: stats(closed, p.riskPct || 1), blocked, newsSkipped };
  }

  function stats(trades, riskPct) {
    const n = trades.length;
    let wins = 0, losses = 0, be = 0, grossW = 0, grossL = 0, cum = 0, peak = 0, maxDDR = 0;
    let eq = 100, eqPeak = 100, maxDDPct = 0, streak = 0, maxStreak = 0, longs = 0, holdMs = 0;
    const curve = [0];
    for (const t of trades) {
      if (t.r > 0.05) { wins++; grossW += t.r; streak = 0; }
      else if (t.r < -0.05) { losses++; grossL += -t.r; streak++; maxStreak = Math.max(maxStreak, streak); }
      else { be++; if (t.r > 0) grossW += t.r; else grossL += -t.r; }
      if (t.dir === 1) longs++;
      holdMs += t.exitTime - t.entryTime;
      cum += t.r;
      peak = Math.max(peak, cum);
      maxDDR = Math.max(maxDDR, peak - cum);
      eq *= 1 + (t.r * riskPct) / 100;
      eqPeak = Math.max(eqPeak, eq);
      maxDDPct = Math.max(maxDDPct, (1 - eq / eqPeak) * 100);
      curve.push(cum);
    }
    return {
      n, wins, losses, be, longs, shorts: n - longs,
      winRate: n ? (wins / n) * 100 : 0,
      netR: cum,
      avgR: n ? cum / n : 0,
      pf: grossL > 0 ? grossW / grossL : (grossW > 0 ? Infinity : 0),
      maxDDR, maxDDPct,
      returnPct: eq - 100,
      maxLossStreak: maxStreak,
      avgHoldH: n ? holdMs / n / 3600000 : 0,
      curve,
    };
  }

  // Plain-language verdict from an experienced trader's point of view.
  function verdict(s) {
    if (s.n === 0) return { level: 'none', text: 'No trades in this period. Loosen a confluence or test a longer period.' };
    if (s.n < 15) return { level: 'weak', text: `Only ${s.n} trades — too few to trust. Test 6 months or 1 year before drawing conclusions.` };
    if (s.pf >= 1.5 && s.avgR > 0.2) return { level: 'good', text: `Positive edge: profit factor ${s.pf.toFixed(2)} on ${s.n} trades. Confirm it holds across the other periods before trading it live.` };
    if (s.pf >= 1.1) return { level: 'ok', text: `Small edge (PF ${s.pf.toFixed(2)}). Costs and slippage can erase it — try a stricter filter or another timeframe.` };
    return { level: 'bad', text: `No edge (PF ${s.pf.toFixed(2)}). These rules lost money on this market and timeframe in this period.` };
  }

  A.backtest = { run, stats, verdict };
})(typeof window !== 'undefined' ? window : globalThis);
