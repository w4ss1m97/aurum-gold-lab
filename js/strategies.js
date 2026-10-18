// ============================================================================
// AURUM OS — STRATEGY LIBRARY (Méthodes de Firas Abdelmalek)
// Each strategy codes its rules for LONG setups only. Shorts are found by
// running the same code on a mirrored (price × -1) series, which guarantees
// both sides follow exactly the same rules.
//
// To add a new method: add an object to STRATEGIES with
//   id, name, source, desc, rules[], checklist[], confluences[], ltfTriggers[],
//   needsPair?, detectLong(ctx, t, cfg) -> [{ key, stop, target, reasons[] }]
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});
  const { atr, rsi, pivots, lastPivot, fvgAt, overlaps } = A.ind;

  const OTE_LO = 0.62, OTE_HI = 0.79;   // Zone OTE (Fibonacci 62% – 79%)
  const IMPULSE_MIN_ATR = 2.0;          // "range clair": impulse leg ≥ 2 × ATR
  const MAX_PULLBACK_BARS = 40;
  const STOP_BUFFER_ATR = 0.1;

  // ---------- Context (indicators computed once per series) ----------
  function mirrorBars(bars) {
    return bars.map((b) => ({ t: b.t, o: -b.o, h: -b.l, l: -b.h, c: -b.c }));
  }
  function mirrorPivots(p) {
    const flip = (x) => ({ ...x, price: -x.price });
    return { highs: p.lows.map(flip), lows: p.highs.map(flip) };
  }
  function buildCtx(bars, opts = {}) {
    const piv = pivots(bars, opts.left || 3, opts.right || 3);
    const r = rsi(bars, 14);
    const base = { bars, atr: atr(bars, 14), rsi: r, piv, mirrored: false };
    const mirror = { bars: mirrorBars(bars), atr: base.atr, rsi: r.map((x) => 100 - x), piv: mirrorPivots(piv), mirrored: true };
    return { long: base, short: mirror };
  }
  // Pair series aligned to the main series' timestamps (for SMT).
  function attachPair(ctx, mainBars, pairBars) {
    const byT = new Map(pairBars.map((b) => [b.t, b]));
    const aligned = mainBars.map((b) => byT.get(b.t) || null);
    ctx.long.pair = aligned;
    ctx.short.pair = aligned.map((b) => (b ? { t: b.t, o: -b.o, h: -b.l, l: -b.h, c: -b.c } : null));
  }

  // ---------- Shared building blocks (LONG perspective) ----------

  // Bullish impulse L -> H followed by a pullback whose low formed in the last
  // 3 bars. Returns null when there is no valid structure at bar t.
  function impulsePullback(c, t, requireOTE) {
    const { bars, piv } = c;
    const H = lastPivot(piv.highs, t);
    if (!H || t - H.i > MAX_PULLBACK_BARS || t - H.i < 2) return null;
    const L = lastPivot(piv.lows, t, H.i);
    if (!L) return null;
    const range = H.price - L.price;
    if (!(range >= IMPULSE_MIN_ATR * c.atr[t])) return null;

    let pl = Infinity, plI = -1, ph = -Infinity;
    for (let k = H.i + 1; k <= t; k++) {
      if (bars[k].l < pl) { pl = bars[k].l; plI = k; }
      if (bars[k].h > ph) ph = bars[k].h;
    }
    if (ph > H.price) return null;          // new high: pullback not in progress
    if (pl <= L.price) return null;         // 100% retraced: structure broken
    if (plI < t - 3) return null;           // the turn must be fresh

    const retr = (H.price - pl) / range;
    const zoneTop = H.price - OTE_LO * range;
    const zoneBot = H.price - OTE_HI * range;
    if (requireOTE) {
      if (retr < OTE_LO || retr > OTE_HI) return null;
    } else if (retr < 0.382) {
      return null;                          // too shallow to be a real correction
    }
    return { H, L, range, pl, plI, retr, zoneTop, zoneBot };
  }

  // Divergence cachée haussière: price makes a higher low, RSI a lower low.
  function hiddenDivLong(c, s) {
    return c.rsi[s.plI] < c.rsi[s.L.i];
  }

  // Bullish FVG or Order Block inside the OTE zone that the pullback reached.
  function fvgOrObInZone(c, s) {
    const { bars } = c;
    if (s.pl > s.zoneTop) return false;
    for (let k = s.L.i + 2; k <= s.H.i; k++) {
      const f = fvgAt(bars, k);
      if (f && f.dir === 1 && overlaps(f.bottom, f.top, s.zoneBot, s.zoneTop) && s.pl <= f.top) return true;
    }
    for (let k = s.L.i; k < s.H.i; k++) {
      const ob = bars[k], nx = bars[k + 1];
      const bearishOB = ob.c < ob.o;
      const displacement = nx.c > nx.o && nx.c - nx.o >= 0.6 * c.atr[k + 1] && nx.c > ob.h;
      if (bearishOB && displacement && overlaps(ob.l, ob.h, s.zoneBot, s.zoneTop) && s.pl <= ob.h) return true;
    }
    return false;
  }

  // Bougie de confirmation: bullish close above prior high, or a rejection pin.
  function confirmationLong(c, t) {
    const b = c.bars[t], p = c.bars[t - 1];
    const rng = b.h - b.l;
    if (rng <= 0) return false;
    const engulf = b.c > b.o && b.c > p.h;
    const pin = Math.min(b.o, b.c) - b.l >= 0.5 * rng && b.c >= b.l + 0.66 * rng;
    return engulf || pin;
  }

  // Points faibles: avoid corrections made of impulsive candles or that leave
  // a bearish FVG (strength against the trade).
  function cleanCorrection(c, fromI, toI) {
    for (let k = fromI; k <= toI; k++) {
      const b = c.bars[k];
      if (b.o - b.c > 1.2 * c.atr[k]) return false;
      const f = k >= fromI + 2 ? fvgAt(c.bars, k) : null;
      if (f && f.dir === -1) return false;
    }
    return true;
  }

  // SMT Or/Argent: traded asset sweeps the earlier pullback low, the
  // correlated asset fails to make a lower low.
  function smtLong(c, s, t) {
    if (!c.pair) return false;
    const from = s.H.i + 1, refEnd = s.plI - 2;
    if (refEnd < from) return false;
    let refMain = Infinity, refPair = Infinity;
    for (let k = from; k <= refEnd; k++) {
      refMain = Math.min(refMain, c.bars[k].l);
      if (c.pair[k]) refPair = Math.min(refPair, c.pair[k].l);
    }
    if (!isFinite(refPair)) return false;
    let nowPair = Infinity;
    for (let k = s.plI - 1; k <= Math.min(s.plI + 1, t); k++) if (c.pair[k]) nowPair = Math.min(nowPair, c.pair[k].l);
    return s.pl < refMain && isFinite(nowPair) && nowPair > refPair;
  }

  function stopBelow(c, t, price) {
    return price - STOP_BUFFER_ATR * c.atr[t];
  }

  // ---------- Strategy definitions ----------
  const STRATEGIES = {
    hiddenDivOte: {
      id: 'hiddenDivOte',
      name: 'Divergence cachée + Zone OTE',
      short: 'Div. cachée + OTE',
      source: 'PDF 6.3 — Méthode Firas Abdelmalek',
      desc: 'Pullback into the 62–79% zone with a hidden RSI divergence, an FVG/OB and a confirmation candle.',
      rules: [
        'Impulse leg (≥ 2× ATR) then a correction',
        'Correction ends in the OTE zone (Fib 62% – 79%)',
        'Hidden divergence: price higher low, RSI(14) lower low',
        'FVG or Order Block inside the zone',
        'Confirmation candle (engulfing close or rejection pin)',
      ],
      checklist: [
        'Clear impulse leg, then a calm correction (no impulsive candles)?',
        'Price inside the OTE zone (Fib 62% – 79%)?',
        'Hidden divergence on RSI confirmed?',
        'FVG or Order Block tapped inside the zone?',
        'Confirmation candle closed?',
      ],
      confluences: [
        { key: 'ote', label: 'Zone OTE 62–79%', def: true },
        { key: 'hiddenDiv', label: 'Divergence cachée (RSI 14)', def: true },
        { key: 'fvgOb', label: 'FVG ou OB dans la zone', def: true },
        { key: 'confirm', label: 'Bougie de confirmation', def: true },
        { key: 'clean', label: 'Correction propre (filtre points faibles)', def: true },
      ],
      ltfTriggers: ['fvg', 'ifvg'],
      detectLong(c, t, cfg) {
        const s = impulsePullback(c, t, cfg.ote);
        if (!s) return [];
        if (cfg.hiddenDiv && !hiddenDivLong(c, s)) return [];
        if (cfg.fvgOb && !fvgOrObInZone(c, s)) return [];
        if (cfg.confirm && !confirmationLong(c, t)) return [];
        if (cfg.clean && !cleanCorrection(c, s.H.i + 1, t - 1)) return [];
        return [{
          key: `hd:${s.H.i}`,
          stop: stopBelow(c, t, s.pl),
          target: s.H.price,
          reasons: [`Retracement ${(s.retr * 100).toFixed(0)}%`, cfg.hiddenDiv ? 'Div. cachée' : null, cfg.fvgOb ? 'FVG/OB' : null].filter(Boolean),
        }];
      },
    },

    crt: {
      id: 'crt',
      name: 'CRT — Candle Range Theory',
      short: 'CRT',
      source: 'PDF 6.2 — Méthode Firas Abdelmalek',
      desc: 'Candle 2 sweeps candle 1\'s low/high and closes back inside its range, ideally in the OTE zone; entry on a lower-timeframe FVG.',
      rules: [
        'Candle 1: clear range (body ≥ 50%, range ≥ 0.8× ATR) after a correction',
        'Candle 2 sweeps the liquidity beyond candle 1\'s low (high for shorts)',
        'Candle 2 closes back inside candle 1\'s range',
        'HTF confluence: hidden divergence + OTE zone + FVG/OB',
        'LTF: FVG or IFVG + impulse in the trade direction',
      ],
      checklist: [
        'Candle 1 has a clear range after a correction?',
        'Candle 2 swept candle 1\'s low (or high)?',
        'Candle 2 closed back inside candle 1\'s range?',
        'HTF: OTE zone + hidden divergence + FVG/OB aligned?',
        'LTF FVG / IFVG with impulse confirmed?',
      ],
      confluences: [
        { key: 'ote', label: 'Sweep dans la zone OTE', def: true },
        { key: 'hiddenDiv', label: 'Divergence cachée (RSI 14)', def: true },
        { key: 'fvgOb', label: 'FVG ou OB dans la zone', def: false },
        { key: 'clean', label: 'Correction propre (filtre points faibles)', def: false },
      ],
      ltfTriggers: ['fvg', 'ifvg'],
      expiryBars: 1,
      detectLong(c, t, cfg) {
        if (t < 2) return [];
        const c1 = c.bars[t - 1], c2 = c.bars[t];
        const rng1 = c1.h - c1.l;
        const clearRange = c1.c < c1.o && (c1.o - c1.c) >= 0.5 * rng1 && rng1 >= 0.8 * c.atr[t - 1];
        if (!clearRange) return [];
        if (!(c2.l < c1.l && c2.c > c1.l && c2.c < c1.h)) return [];
        const reasons = ['C2 sweep + close inside C1'];
        if (cfg.ote || cfg.hiddenDiv || cfg.fvgOb || cfg.clean) {
          const s = impulsePullback(c, t, cfg.ote);
          if (!s || s.plI !== t) return [];
          if (cfg.hiddenDiv && !hiddenDivLong(c, s)) return [];
          if (cfg.fvgOb && !fvgOrObInZone(c, s)) return [];
          if (cfg.clean && !cleanCorrection(c, s.H.i + 1, t - 2)) return [];
          reasons.push(`Retracement ${(s.retr * 100).toFixed(0)}%`);
        }
        return [{ key: `crt:${t}`, stop: stopBelow(c, t, c2.l), target: c1.h, reasons }];
      },
    },

    doubleTop: {
      id: 'doubleTop',
      name: 'Double Top / Double Bottom + OTE',
      short: 'Double Top',
      source: 'PDF 6.4 — Méthode Firas Abdelmalek',
      desc: 'Two equal tops (bottoms) formed inside the OTE zone of the previous leg, with FVG/OB and a confirmation candle.',
      rules: [
        'Impulse leg (≥ 2× ATR) then a correction',
        'Two equal tops (±0.35 ATR) formed in the OTE zone (bottoms for longs)',
        'FVG or Order Block in the zone',
        'Price action confirmation candle',
        'LTF: FVG / IFVG or a minor double top',
      ],
      checklist: [
        'Clear impulse leg, then a correction?',
        'Two equal tops (or bottoms) inside the OTE zone?',
        'FVG or Order Block in the zone?',
        'Confirmation candle closed?',
        'LTF: FVG / IFVG or minor double top formed?',
      ],
      confluences: [
        { key: 'ote', label: 'Tops dans la zone OTE', def: true },
        { key: 'fvgOb', label: 'FVG ou OB dans la zone', def: true },
        { key: 'confirm', label: 'Bougie de confirmation', def: true },
        { key: 'clean', label: 'Correction propre (filtre points faibles)', def: true },
      ],
      ltfTriggers: ['fvg', 'ifvg', 'mini'],
      // LONG side = double bottom. Shorts (double top) come from the mirror.
      detectLong(c, t, cfg) {
        const { bars, piv } = c;
        const H = lastPivot(piv.highs, t);
        if (!H || t - H.i > MAX_PULLBACK_BARS) return [];
        const L = lastPivot(piv.lows, t, H.i);
        if (!L) return [];
        const range = H.price - L.price;
        if (!(range >= IMPULSE_MIN_ATR * c.atr[t])) return [];
        const B1 = lastPivot(piv.lows, t);
        if (!B1 || B1.i <= H.i || t - B1.i < 4) return [];
        const tol = 0.35 * c.atr[t];
        let b2 = Infinity, b2I = -1;
        for (let k = t - 2; k <= t; k++) if (bars[k].l < b2) { b2 = bars[k].l; b2I = k; }
        if (b2I <= B1.i + 2 || Math.abs(b2 - B1.price) > tol) return [];
        let ph = -Infinity, lowest = Infinity;
        for (let k = H.i + 1; k <= t; k++) { ph = Math.max(ph, bars[k].h); lowest = Math.min(lowest, bars[k].l); }
        if (ph > H.price || lowest < B1.price - tol || lowest <= L.price) return [];
        let neck = -Infinity;
        for (let k = B1.i + 1; k < b2I; k++) neck = Math.max(neck, bars[k].h);
        if (neck - Math.max(B1.price, b2) < 0.5 * c.atr[t]) return [];   // real bounce between the bottoms
        const deepest = Math.min(B1.price, b2);
        const retr = (H.price - deepest) / range;
        if (cfg.ote ? (retr < OTE_LO || retr > OTE_HI) : retr < 0.382) return [];
        const s = { H, L, range, pl: deepest, plI: b2I, retr, zoneTop: H.price - OTE_LO * range, zoneBot: H.price - OTE_HI * range };
        if (cfg.fvgOb && !fvgOrObInZone(c, s)) return [];
        if (cfg.confirm && !confirmationLong(c, t)) return [];
        if (cfg.clean && !cleanCorrection(c, H.i + 1, t - 1)) return [];
        return [{
          key: `dt:${B1.i}`,
          stop: stopBelow(c, t, deepest),
          target: H.price,
          reasons: [`Double ${c.mirrored ? 'top' : 'bottom'} @ ${(retr * 100).toFixed(0)}%`, cfg.fvgOb ? 'FVG/OB' : null].filter(Boolean),
        }];
      },
    },

    oteSmt: {
      id: 'oteSmt',
      name: 'Zone OTE + Divergence SMT (Or / Argent)',
      short: 'OTE + SMT',
      source: 'Section 4 Niveau 5 — OTE (docx)',
      desc: 'OTE pullback where gold and silver disagree: one makes a lower low, the other does not (SMT divergence).',
      needsPair: true,
      rules: [
        'Impulse leg (≥ 2× ATR) then a correction into the OTE zone (62–79%)',
        'SMT: the traded metal sweeps its pullback low, the other metal holds',
        'Order Block or FVG in the zone',
        'Confirmation candle',
        'Optional: hidden RSI divergence (Firas OTE method)',
      ],
      checklist: [
        'Price inside the OTE zone (Fib 62% – 79%)?',
        'SMT: gold and silver diverge at the low (or high)?',
        'Order Block or FVG in the zone?',
        'Confirmation candle closed?',
        'Support / resistance respected?',
      ],
      confluences: [
        { key: 'ote', label: 'Zone OTE 62–79%', def: true },
        { key: 'smt', label: 'Divergence SMT Or / Argent', def: true },
        { key: 'hiddenDiv', label: 'Divergence cachée (RSI 14)', def: false },
        { key: 'fvgOb', label: 'FVG ou OB dans la zone', def: true },
        { key: 'confirm', label: 'Bougie de confirmation', def: true },
        { key: 'clean', label: 'Correction propre (filtre points faibles)', def: false },
      ],
      ltfTriggers: ['fvg', 'ifvg'],
      detectLong(c, t, cfg) {
        const s = impulsePullback(c, t, cfg.ote);
        if (!s) return [];
        if (cfg.smt && !smtLong(c, s, t)) return [];
        if (cfg.hiddenDiv && !hiddenDivLong(c, s)) return [];
        if (cfg.fvgOb && !fvgOrObInZone(c, s)) return [];
        if (cfg.confirm && !confirmationLong(c, t)) return [];
        if (cfg.clean && !cleanCorrection(c, s.H.i + 1, t - 1)) return [];
        return [{
          key: `smt:${s.H.i}`,
          stop: stopBelow(c, t, s.pl),
          target: s.H.price,
          reasons: [`Retracement ${(s.retr * 100).toFixed(0)}%`, cfg.smt ? 'SMT' : null, cfg.fvgOb ? 'FVG/OB' : null].filter(Boolean),
        }];
      },
    },
  };

  function defaultConfig(strategyId) {
    const cfg = {};
    for (const c of STRATEGIES[strategyId].confluences) cfg[c.key] = c.def;
    return cfg;
  }

  A.STRATEGIES = STRATEGIES;
  A.strategy = { buildCtx, attachPair, defaultConfig };
})(typeof window !== 'undefined' ? window : globalThis);
