// ============================================================================
// AURUM OS — EXPERT ANALYSIS OF A BACKTEST
// Tags every trade with its context (news, session, trend, volatility,
// shock candles) and writes a trader's diagnosis of why the method worked
// or failed in the tested window.
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});
  const { atr, indexAtOrAfter } = A.ind;
  const H = 3600e3;

  function ema(bars, n) {
    const out = new Array(bars.length).fill(NaN);
    const k = 2 / (n + 1);
    let e = NaN;
    for (let i = 0; i < bars.length; i++) {
      e = isNaN(e) ? bars[i].c : bars[i].c * k + e * (1 - k);
      if (i >= n - 1) out[i] = e;
    }
    return out;
  }

  function nyHour(ms) {
    return parseInt(new Date(ms).toLocaleString('en-US', { timeZone: 'America/New_York', hour: 'numeric', hour12: false }), 10) % 24;
  }
  function session(ms) {
    const h = nyHour(ms);
    if (h >= 2 && h < 8) return 'London';
    if (h >= 8 && h < 12) return 'New York AM';
    if (h >= 12 && h < 17) return 'New York PM';
    return 'Asia / overnight';
  }

  function median(arr) {
    const a = arr.filter((x) => !isNaN(x)).sort((x, y) => x - y);
    return a.length ? a[a.length >> 1] : NaN;
  }

  // Adds t.ctx to each closed trade.
  function tagTrades(trades, htf, htfMs) {
    const a = atr(htf, 14);
    const e200 = ema(htf, 200);
    for (const t of trades) {
      if (t.open) continue;
      const si = Math.max(0, indexAtOrAfter(htf, t.setupTime) - 1);
      const near = A.news.between(t.entryTime - H, t.entryTime + 2 * H);
      const during = A.news.between(t.entryTime, t.exitTime).filter((e) => !near.includes(e));
      const medAtr = median(a.slice(Math.max(0, si - 100), si));
      const ratio = a[si] / medAtr;
      const vol = !isFinite(ratio) ? 'Normal' : ratio > 1.3 ? 'High' : ratio < 0.75 ? 'Low' : 'Normal';
      let trend = 'Unknown';
      if (!isNaN(e200[si])) {
        const up = htf[si].c > e200[si];
        trend = (up && t.dir === 1) || (!up && t.dir === -1) ? 'With trend' : 'Against trend';
      }
      let shock = false;
      const ei = indexAtOrAfter(htf, t.entryTime), xi = indexAtOrAfter(htf, t.exitTime);
      for (let k = Math.max(0, ei - 1); k <= Math.min(xi, htf.length - 1); k++) {
        if (htf[k].h - htf[k].l > 2.5 * (a[k] || Infinity)) { shock = true; break; }
      }
      t.ctx = {
        session: session(t.entryTime),
        newsNear: near, newsDuring: during,
        news: near.length || during.length ? 'News exposed' : 'No major news',
        vol, trend, shock,
      };
    }
    return trades;
  }

  function group(trades, keyFn, riskPct) {
    const m = new Map();
    for (const t of trades) {
      const k = keyFn(t);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(t);
    }
    return [...m.entries()].map(([label, ts]) => ({ label, stats: A.backtest.stats(ts, riskPct) }))
      .sort((x, y) => y.stats.n - x.stats.n);
  }

  const pf = (s) => (isFinite(s.pf) ? s.pf.toFixed(2) : '∞');
  const r1 = (x) => `${x >= 0 ? '+' : ''}${x.toFixed(1)}R`;

  // ctx: { trades, stats, htf, htfMs, market, strategy, cfg, startMs, compare, ablation, newsSkipped, newsFilter }
  function analyze(ctx) {
    const closed = ctx.trades.filter((t) => !t.open);
    tagTrades(closed, ctx.htf, ctx.htfMs);
    const s = ctx.stats;
    const name = ctx.market.name;
    const insights = []; // { tone: good|bad|warn|info, title, text }

    // 1. Market regime over the window
    const i0 = indexAtOrAfter(ctx.htf, ctx.startMs);
    const p0 = ctx.htf[Math.min(i0, ctx.htf.length - 1)].c, p1 = ctx.htf[ctx.htf.length - 1].c;
    const chg = ((p1 - p0) / p0) * 100;
    const regime = chg > 6 ? 'strong uptrend' : chg > 2 ? 'uptrend' : chg < -6 ? 'strong downtrend' : chg < -2 ? 'downtrend' : 'range';
    const longs = A.backtest.stats(closed.filter((t) => t.dir === 1), 1);
    const shorts = A.backtest.stats(closed.filter((t) => t.dir === -1), 1);
    let regimeText = `${name} moved ${chg >= 0 ? '+' : ''}${chg.toFixed(1)}% over the window (${regime}).`;
    if (longs.n || shorts.n) regimeText += ` Longs: ${longs.n} trades, ${r1(longs.netR)}. Shorts: ${shorts.n} trades, ${r1(shorts.netR)}.`;
    if (regime.includes('uptrend') && shorts.n >= 3 && shorts.netR < 0) regimeText += ' Selling into a rising market was the main drag — in a trend, take the side of the trend only.';
    if (regime.includes('downtrend') && longs.n >= 3 && longs.netR < 0) regimeText += ' Buying a falling market was the main drag — only take shorts while the trend is down.';
    insights.push({ tone: 'info', title: 'Market context', text: regimeText });

    // 2. News
    const newsT = closed.filter((t) => t.ctx.news === 'News exposed');
    const cleanT = closed.filter((t) => t.ctx.news !== 'News exposed');
    const sn = A.backtest.stats(newsT, 1), sc = A.backtest.stats(cleanT, 1);
    const evInWindow = A.news.between(ctx.startMs, ctx.htf[ctx.htf.length - 1].t + ctx.htfMs);
    if (newsT.length) {
      const worse = sn.avgR < sc.avgR - 0.25;
      const better = sn.avgR > sc.avgR + 0.25;
      const names = [...new Set(newsT.flatMap((t) => [...t.ctx.newsNear, ...t.ctx.newsDuring].map((e) => e.title.split(' (')[0])))].join(', ');
      insights.push({
        tone: worse ? 'bad' : better ? 'warn' : 'info',
        title: 'News impact',
        text: `${newsT.length} of ${closed.length} trades were exposed to red-folder USD news (${names}): ${r1(sn.netR)}, avg ${sn.avgR.toFixed(2)}R/trade vs ${sc.avgR.toFixed(2)}R on clean trades. ` +
          (worse ? 'News spikes are hurting this method — stops get swept by the release candle. Turn on the news filter.'
            : better ? 'News volatility helped reach targets here, but live slippage on releases is far worse than a backtest shows. Treat these wins with caution.'
            : 'News did not change the outcome much for this method in this window.'),
      });
    } else if (closed.length) {
      insights.push({ tone: 'good', title: 'News impact', text: `${evInWindow.length} high-impact USD releases happened in this window, but none of the trades was entered near or held through one.` });
    }
    if (ctx.newsFilter && ctx.newsSkipped) {
      insights.push({ tone: 'info', title: 'News filter', text: `The news filter skipped ${ctx.newsSkipped} entr${ctx.newsSkipped > 1 ? 'ies' : 'y'} within 2h before / 1h after a release.` });
    }

    // 3. Sessions
    const sess = group(closed, (t) => t.ctx.session, 1).filter((x) => x.stats.n >= 3);
    if (sess.length >= 2) {
      const best = [...sess].sort((a, b) => b.stats.avgR - a.stats.avgR)[0];
      const worst = [...sess].sort((a, b) => a.stats.avgR - b.stats.avgR)[0];
      if (best.label !== worst.label) {
        insights.push({
          tone: worst.stats.netR < 0 ? 'warn' : 'info', title: 'Best time to trade it',
          text: `${best.label} is the strongest session (${best.stats.n} trades, ${r1(best.stats.netR)}, PF ${pf(best.stats)}). ${worst.label} is the weakest (${r1(worst.stats.netR)}, PF ${pf(worst.stats)})${worst.stats.netR < 0 ? ' — consider skipping it' : ''}.`,
        });
      }
    }

    // 4. Trend alignment
    const wt = A.backtest.stats(closed.filter((t) => t.ctx.trend === 'With trend'), 1);
    const at = A.backtest.stats(closed.filter((t) => t.ctx.trend === 'Against trend'), 1);
    if (wt.n >= 3 && at.n >= 3) {
      const diff = wt.avgR - at.avgR;
      insights.push({
        tone: Math.abs(diff) > 0.3 ? (diff > 0 ? 'warn' : 'info') : 'info', title: 'Trend filter (EMA 200)',
        text: `With the ${ctx.htfLabel} EMA 200 trend: ${wt.n} trades, ${r1(wt.netR)}. Against it: ${at.n} trades, ${r1(at.netR)}. ` +
          (diff > 0.3 ? 'Counter-trend setups are giving back profit — only take setups in the direction of the EMA 200.'
            : diff < -0.3 ? 'This method works as a reversal tool here: counter-trend setups did better.'
            : 'Trend direction made little difference.'),
      });
    }

    // 5. Volatility & shocks
    const hi = A.backtest.stats(closed.filter((t) => t.ctx.vol === 'High'), 1);
    const lo = A.backtest.stats(closed.filter((t) => t.ctx.vol === 'Low'), 1);
    if (hi.n >= 3 && hi.avgR < s.avgR - 0.3) insights.push({ tone: 'warn', title: 'Volatility', text: `In high-volatility conditions (ATR > 1.3× normal) results dropped to ${r1(hi.netR)} on ${hi.n} trades. Reduce size or wait when candles are unusually large.` });
    if (lo.n >= 3 && lo.avgR < s.avgR - 0.3) insights.push({ tone: 'warn', title: 'Volatility', text: `In quiet markets (ATR < 0.75× normal) results dropped to ${r1(lo.netR)} on ${lo.n} trades — targets are too far for the available range.` });
    const shockT = closed.filter((t) => t.ctx.shock);
    if (shockT.length) {
      const ss = A.backtest.stats(shockT, 1);
      insights.push({ tone: ss.netR < 0 ? 'bad' : 'info', title: 'Shock candles', text: `${shockT.length} trades lived through a shock candle (range > 2.5× ATR — news, geopolitics or a liquidity event): ${r1(ss.netR)}. ${ss.netR < 0 ? 'These sudden moves cost money; a tighter news filter or smaller size around events helps.' : 'The method survived them.'}` });
    }

    // 6. Robustness across periods
    if (ctx.compare && ctx.compare.length > 1) {
      const bad = ctx.compare.filter((c) => c.stats.n >= 5 && c.stats.pf < 1);
      const good = ctx.compare.filter((c) => c.stats.n >= 5 && c.stats.pf >= 1.2);
      if (bad.length && good.length) insights.push({ tone: 'warn', title: 'Robustness', text: `Profitable over ${good.map((c) => c.period).join(', ')} but losing over ${bad.map((c) => c.period).join(', ')}. The edge depends on market conditions — not robust yet.` });
      else if (!bad.length && good.length === ctx.compare.filter((c) => c.stats.n >= 5).length && good.length >= 2) insights.push({ tone: 'good', title: 'Robustness', text: 'Profitable in every tested window with enough trades — a good sign the edge is real, not luck.' });
    }

    // 7. Which rules matter
    if (ctx.ablation && ctx.ablation.length && s.n >= 5) {
      const rules = ctx.ablation.filter((a) => !a.label.startsWith('Pattern'));
      const key = rules.filter((a) => a.stats.n > 0).sort((a, b) => a.stats.avgR - b.stats.avgR)[0];
      if (key && key.stats.avgR < s.avgR - 0.15) insights.push({ tone: 'good', title: 'Most important rule', text: `"${key.label}" carries the edge: without it, results fall to ${r1(key.stats.netR)} (PF ${pf(key.stats)}). Never skip it.` });
      const useless = rules.find((a) => a.stats.n >= s.n * 1.3 && a.stats.avgR >= s.avgR - 0.05 && a.stats.netR > s.netR);
      if (useless) insights.push({ tone: 'info', title: 'Rule you could relax', text: `Without "${useless.label}" you get more trades (${useless.stats.n}) with similar quality and a better total (${r1(useless.stats.netR)}). Worth testing on other periods before dropping it.` });
      const raw = ctx.ablation.find((a) => a.label.startsWith('Pattern'));
      if (raw && raw.stats.n >= 10 && raw.stats.pf < 1 && s.pf > 1) insights.push({ tone: 'info', title: 'Why confluences matter', text: `The pattern alone lost money (${raw.stats.n} trades, PF ${pf(raw.stats)}). Your confluences turn it into a winner — discipline on the checklist is the edge.` });
    }

    // 8. Prop-firm risk
    if (s.n >= 5) {
      const fits = s.maxDDPct <= 5;
      insights.push({ tone: fits ? 'good' : 'warn', title: 'Risk (prop firm view)', text: `At 1% risk per trade the worst drawdown was -${s.maxDDPct.toFixed(1)}% with up to ${s.maxLossStreak} loss${s.maxLossStreak === 1 ? "" : "es"} in a row. ${fits ? 'This fits typical prop rules (5% daily / 10% max).' : 'Too deep for most prop challenges at 1% — use 0.5% risk.'}` });
    }

    // Overall verdict
    const v = A.backtest.verdict(s);
    return {
      verdict: v,
      insights,
      breakdowns: {
        'News': group(closed, (t) => t.ctx.news, 1),
        'Session': group(closed, (t) => t.ctx.session, 1),
        'Trend (EMA 200)': group(closed, (t) => t.ctx.trend, 1),
        'Volatility': group(closed, (t) => `${t.ctx.vol} volatility`, 1),
        'Direction': group(closed, (t) => t.side, 1),
      },
      eventsInWindow: evInWindow,
    };
  }

  // Short chips describing one trade's context.
  function tradeChips(t) {
    if (!t.ctx) return [];
    const chips = [];
    const fmt = (e) => `${e.title.split(' (')[0]}${e.approx ? ' ≈' : ''}`;
    for (const e of t.ctx.newsNear) chips.push({ tone: 'bad', text: `⚠ ${fmt(e)} ${Math.round((e.t - t.entryTime) / 60000)} min from entry` });
    for (const e of t.ctx.newsDuring) chips.push({ tone: 'warn', text: `📰 ${fmt(e)} during trade` });
    if (t.ctx.shock) chips.push({ tone: 'warn', text: '⚡ Shock candle' });
    chips.push({ tone: 'info', text: t.ctx.session });
    chips.push({ tone: t.ctx.trend === 'With trend' ? 'good' : 'info', text: t.ctx.trend });
    if (t.ctx.vol !== 'Normal') chips.push({ tone: 'info', text: `${t.ctx.vol} vol` });
    return chips;
  }

  A.analysis = { analyze, tradeChips };
})(typeof window !== 'undefined' ? window : globalThis);
