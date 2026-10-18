// ============================================================================
// AURUM OS — GOLD (XAUUSD) SETUP LAB, MACRO/GEOPOLITICAL RADAR & EXECUTION APP
// ============================================================================

const state = {
  activeTab: 'lab',
  redNewsLockoutActive: false,

  // 1. Backtest Lab configuration (persisted per device)
  lab: {
    market: 'XAU',
    strategyId: 'crt',
    setupTF: 'H1',
    period: '6M',
    rr: 2,
    partialBE: true,
    newsFilter: false,
    cfgByStrategy: {},
    generated: null,
  },

  // 2. Live Macro, Fed, Inflation, Chômage & Geopolitics Regime State
  macroPillars: [
    {
      id: 'fed',
      title: '1. La Fed & Taux US (US10Y / Real Yields)',
      ticker: 'TVC:US10Y • FRED:DFII10',
      status: 'Bullish Gold (+1)',
      score: 1,
      reading: 'US10Y @ 4.02% (Falling below EMA50) • 82% Fed Cut Odds',
      explanation: 'Falling Treasury yields lower the opportunity cost of holding Gold (XAUUSD).'
    },
    {
      id: 'dxy',
      title: '2. Force du Dollar US (DXY Index)',
      ticker: 'TVC:DXY',
      status: 'Bullish Gold (+1)',
      score: 1,
      reading: 'DXY @ 102.85 (-0.42% Intraday Bearish Structure)',
      explanation: 'Weakening USD directly boosts XAUUSD buying pressure during NY Open.'
    },
    {
      id: 'inflation',
      title: '3. Inflation US (CPI / Core PCE / Breakevens)',
      ticker: 'ECONOMICS:USCPI • FRED:T10YIE',
      status: 'Bullish Gold (+1)',
      score: 1,
      reading: '10Y Breakeven Inflation @ 2.34% (Expanding Hedge Demand)',
      explanation: 'Sticky inflation + dovish Fed rate path creates institutional Gold inflows.'
    },
    {
      id: 'chomage',
      title: '4. Chômage & Emploi US (NFP / Jobless Claims)',
      ticker: 'FRED:ICSA • ECONOMICS:USUR',
      status: 'Bullish Gold (+1)',
      score: 1,
      reading: 'Jobless Claims: 242K (> 4-Wk Avg) • Unemployment: 4.2%',
      explanation: 'Rising US unemployment (chômage) forces the Federal Reserve to cut interest rates.'
    },
    {
      id: 'consumer',
      title: '5. Consumer Index (Michigan / CB Confidence)',
      ticker: 'FRED:UMCSENT • ECONOMICS:USCCI',
      status: 'Neutral (0)',
      score: 0,
      reading: 'Consumer Sentiment: 68.9 (Slightly Softening)',
      explanation: 'Weakening consumer confidence signals slower GDP growth and safe-haven demand.'
    },
    {
      id: 'geopolitics',
      title: '6. Géopolitique & Safe-Haven (Middle East / VIX)',
      ticker: 'CBOE:GVZ • CBOE:VIX • Central Banks',
      status: 'Safe-Haven Bid (+1)',
      score: 1,
      reading: 'VIX @ 21.8 (Elevated) • Central Bank Gold Buying Active',
      explanation: 'Geopolitical tension active: Short setups on Gold are blocked by Crisis Shield.'
    }
  ],

  // 3. Economic Calendar (Red-Folder USD Events)
  economicEvents: [
    { time: '08:30 EST', title: 'US Core CPI (Inflation YoY & MoM)', impact: 'HIGH', forecast: '3.2%', previous: '3.3%', effect: 'Lower CPI = Weak USD = 🚀 Gold Spike Up' },
    { time: '08:30 EST', title: 'US Initial Jobless Claims (Chômage)', impact: 'HIGH', forecast: '240K', previous: '235K', effect: 'Higher Claims = Weak Labor = 🚀 Gold Bullish' },
    { time: '10:00 EST', title: 'US Michigan Consumer Sentiment Index', impact: 'MED', forecast: '69.0', previous: '70.1', effect: 'Lower Confidence = Safe-Haven Gold Bid' },
    { time: '14:00 EST', title: 'FOMC Rate Decision & Fed Chair Powell', impact: 'HIGH', forecast: 'Cut 25bps', previous: 'Hold', effect: 'Dovish Tone = 300+ Pip Gold Rally' },
  ],

  // 4. Trade Pad State
  pad: {
    riskPct: 1.0,
    checks: [true, true, true, true, true]
  },

  // 5. Auto-Journal Logged Trades
  journal: [
    {
      id: 101,
      time: 'Today 09:42 EST',
      setup: '1. Asian Liquidity Sweep (SMC)',
      direction: 'LONG',
      lots: 2.50,
      entry: 2739.50,
      grade: 'A+',
      macroScore: '+4',
      compliant: true,
      resultR: 2.5,
      pnl: 2500,
      notes: 'Asian Low swept + 5m FVG + DXY dumping + US10Y falling'
    },
    {
      id: 102,
      time: 'Yesterday 10:15 EST',
      setup: '2. Fair Value Gap (FVG) + BOS',
      direction: 'LONG',
      lots: 2.00,
      entry: 2728.00,
      grade: 'A+',
      macroScore: '+3',
      compliant: true,
      resultR: 2.5,
      pnl: 2000,
      notes: 'NY Silver Bullet window + Chômage Claims higher than expected'
    },
    {
      id: 103,
      time: 'Oct 15 08:29 EST',
      setup: 'Forced Short Before News',
      direction: 'SHORT',
      lots: 1.50,
      entry: 2714.20,
      grade: 'C (Broken Rules)',
      macroScore: '+3 (Fought Macro)',
      compliant: false,
      resultR: -1.0,
      pnl: -800,
      notes: 'Shorted Gold against Geopolitical Safe-Haven & falling US10Y'
    },
    {
      id: 104,
      time: 'Oct 14 03:20 EST',
      setup: '1. Asian Liquidity Sweep (SMC)',
      direction: 'LONG',
      lots: 2.20,
      entry: 2705.80,
      grade: 'A+',
      macroScore: '+3',
      compliant: true,
      resultR: 1.15,
      pnl: 1150,
      notes: 'London Open sweep, hit TP1 (50% @ +1R) + trailed TP2'
    }
  ]
};

// ============================================================================
// TAB NAVIGATION & DRAWER CONTROLS
// ============================================================================
function switchTab(tabId) {
  state.activeTab = tabId;
  ['lab', 'macro', 'trade', 'journal'].forEach(id => {
    const sec = document.getElementById(`tab-${id}`);
    const nav = document.getElementById(`nav-${id}`);
    if (id === tabId) {
      sec.classList.remove('hidden');
      nav.className = 'flex flex-col items-center justify-center py-1 rounded-xl text-yellow-400 bg-yellow-500/10';
    } else {
      sec.classList.add('hidden');
      nav.className = 'flex flex-col items-center justify-center py-1 rounded-xl text-slate-400';
    }
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleChartDrawer() {
  const drawer = document.getElementById('tvChartDrawer');
  drawer.classList.toggle('hidden');
}

function showToast(msg) {
  const box = document.getElementById('toastBox');
  box.textContent = msg;
  box.classList.remove('hidden');
  setTimeout(() => box.classList.add('hidden'), 2600);
}

// ============================================================================
// TAB 1: PINE SCRIPT LAB — generate a TradingView strategy for a Firas method,
// with a guide, expert tips and the red-folder news of the test window.
// ============================================================================
const PERIODS = { '1M': 30, '3M': 91, '6M': 182, '1Y': 365 };
const DAY_MS = 24 * 3600 * 1000;
const SETUP_TFS = ['H1', 'H4', 'D1'];

const LAB_PREFS_KEY = 'aurum.lab.prefs';
function saveLabPrefs() {
  const { market, strategyId, setupTF, period, rr, partialBE, newsFilter, cfgByStrategy } = state.lab;
  try { localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({ market, strategyId, setupTF, period, rr, partialBE, newsFilter, cfgByStrategy })); } catch (e) { /* ignore */ }
}
function loadLabPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null');
    if (!p || !Aurum.STRATEGIES[p.strategyId]) return;
    const { market, strategyId, setupTF, period, rr, partialBE, newsFilter, cfgByStrategy } = p;
    Object.assign(state.lab, { market, strategyId, partialBE: !!partialBE, newsFilter: !!newsFilter, cfgByStrategy: cfgByStrategy || {} });
    if (SETUP_TFS.includes(setupTF)) state.lab.setupTF = setupTF;
    if (PERIODS[period]) state.lab.period = period;
    if (rr === 'struct' || [1.5, 2, 3].includes(rr)) state.lab.rr = rr;
  } catch (e) { /* ignore */ }
}

function currentStrategy() { return Aurum.STRATEGIES[state.lab.strategyId]; }
function currentCfg() {
  const id = state.lab.strategyId;
  if (!state.lab.cfgByStrategy[id]) state.lab.cfgByStrategy[id] = Aurum.strategy.defaultConfig(id);
  return state.lab.cfgByStrategy[id];
}
function tfLabel(tf) { return Aurum.TIMEFRAMES[tf].label; }

function seg(items, activeVal, onclick, labelFn) {
  return items.map((v) => {
    const active = String(v) === String(activeVal);
    const cls = active ? 'bg-yellow-400 border-yellow-400 text-slate-950' : 'bg-slate-900 border-slate-700 text-slate-200 active:scale-95';
    return `<button onclick="${onclick}('${v}')" class="flex-1 h-11 rounded-xl border text-sm font-bold transition ${cls}">${labelFn ? labelFn(v) : v}</button>`;
  }).join('');
}

// Expert tips per method (from the PDFs' "points faibles / points forts").
const METHOD_TIPS = {
  crt: {
    best: 'Use it on 4H or Daily candles: the bigger the reference candle, the more liquidity its sweep takes.',
    tips: [
      'Candle 1 must come after a correction made of small candles. If the correction itself is impulsive, skip it.',
      'Watch for FVGs and breakouts inside the correction: they show strength against your trade.',
      'Weak point: candle 3 can manipulate again toward other liquidity (BSL / SSL), and CRT does not always respect the OTE zone. That is why the stop sits beyond candle 2\'s wick, never inside it.',
      'Manually, you would refine the entry on a lower timeframe FVG / IFVG. The script enters at the next candle open, so manual results can be a bit better.',
    ],
  },
  hiddenDivOte: {
    best: 'Best on 1H and 4H, in the direction of the bigger trend.',
    tips: [
      'Long: support + hidden bullish divergence (price higher low, RSI lower low) + OTE zone + OB or FVG + confirmation candle. Short: the mirror image at resistance.',
      'The divergence is measured on RSI 14 between the impulse low and the pullback low.',
      'No confirmation candle = no trade. The backtest showed this rule carries most of the edge.',
      'A correction with big impulsive candles or an FVG against you is a warning sign (the "Correction propre" filter).',
    ],
  },
  doubleTop: {
    best: 'Best on 1H / 4H after a clean impulse leg.',
    tips: [
      'The two tops (or bottoms) must form inside the OTE zone of the previous leg: 62% – 79%.',
      'Watch the 38.2% level: it is weak support but can be risky, because a double bottom can form there instead.',
      'Strong point: a new minor double top on the lower timeframe confirms the entry. Check it by eye on 15m before taking a trade.',
      'Avoid corrections made of impulsive candles, and watch for FVGs and breakouts.',
    ],
  },
  oteSmt: {
    best: 'Run it on gold (OANDA:XAUUSD) with silver as the pair, on 1H or 4H.',
    tips: [
      'Gold and silver usually move together. SMT divergence = one makes a lower low (or higher high) and the other refuses. This shows smart money accumulating.',
      'The OTE zone (62% – 79% Fibonacci) is the "optimal trade entry": low risk, high reward.',
      'Firas OTE method: resistance / support + hidden divergence + OTE + OB or FVG + confirmation candle. Turn on "Divergence cachée" in the settings to test the full version.',
      'If silver data is missing on your plan, the SMT check cannot pass. Change the pair symbol in the settings.',
    ],
  },
};

const NEWS_EXPLAIN = {
  FOMC: 'Fed rate decision (14:00 New York / 20:00 Paris, press conference 30 min later). Hawkish (higher rates) = USD up = gold down. Dovish (cuts) = gold up. Spikes both ways in seconds.',
  CPI: 'US inflation (08:30 New York / 14:30 Paris). Hotter than forecast = USD up = gold down. Cooler = gold up.',
  NFP: 'US jobs report (08:30 New York / 14:30 Paris, usually the first Friday). Strong jobs = USD up = gold down. Weak jobs / rising unemployment (chômage) = gold up.',
};

function renderSetupLab() {
  const L = state.lab;
  const strat = currentStrategy();
  const cfg = currentCfg();

  document.getElementById('labMarket').innerHTML = Object.values(Aurum.MARKETS).map((m) => {
    const active = L.market === m.id;
    return `<button onclick="labSet('market','${m.id}')" class="flex-1 rounded-2xl border p-3 text-left transition active:scale-95 ${active ? 'bg-yellow-400/15 border-yellow-400' : 'bg-slate-900 border-slate-700'}">
      <div class="text-base font-bold ${active ? 'text-yellow-300' : 'text-white'}">${m.id === 'XAU' ? '🥇' : '🥈'} ${m.name}</div>
      <div class="text-xs text-slate-400 mt-0.5">OANDA:${m.ticker}</div>
    </button>`;
  }).join('');

  document.getElementById('labStrategies').innerHTML = Object.values(Aurum.STRATEGIES).map((s) => {
    const active = L.strategyId === s.id;
    return `<button onclick="labSet('strategyId','${s.id}')" class="w-full rounded-2xl border p-3 text-left transition active:scale-[0.99] ${active ? 'bg-yellow-400/10 border-yellow-400' : 'bg-slate-900 border-slate-700'}">
      <div class="flex items-center justify-between gap-2">
        <span class="text-[15px] font-bold ${active ? 'text-yellow-300' : 'text-white'}">${s.name}</span>
        ${active ? '<span class="text-yellow-300 text-lg leading-none">●</span>' : ''}
      </div>
      <div class="text-sm text-slate-400 mt-1 leading-snug">${s.desc}</div>
      <div class="text-xs text-slate-500 mt-1">${s.source}</div>
    </button>`;
  }).join('');

  document.getElementById('labSetupTF').innerHTML = seg(SETUP_TFS, L.setupTF, 'labSetTF', tfLabel);
  document.getElementById('labPeriod').innerHTML = seg(Object.keys(PERIODS), L.period, 'labSetPeriod');
  document.getElementById('labRR').innerHTML = seg(['1.5', '2', '3', 'struct'], L.rr, 'labSetRR', (v) => (v === 'struct' ? 'Structure' : `1:${v}`));
  document.getElementById('labPartial').checked = L.partialBE;
  document.getElementById('labNews').checked = L.newsFilter;

  document.getElementById('labConfluences').innerHTML = strat.confluences.map((c) => {
    const on = cfg[c.key];
    return `<button onclick="labToggleConf('${c.key}')" class="w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition active:scale-[0.99] ${on ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-slate-900 border-slate-700'}">
      <span class="text-sm font-semibold ${on ? 'text-white' : 'text-slate-400'}">${c.label}</span>
      <span class="shrink-0 w-12 h-7 rounded-full p-1 transition ${on ? 'bg-emerald-400' : 'bg-slate-700'}"><span class="block w-5 h-5 rounded-full bg-white transition ${on ? 'translate-x-5' : ''}"></span></span>
    </button>`;
  }).join('');

  document.getElementById('labRules').innerHTML = strat.rules.map((r, i) => `<li class="flex gap-2"><span class="text-yellow-400 font-bold">${i + 1}.</span><span>${r}</span></li>`).join('');

  renderPineOut();
}

// Any change makes the generated script stale until the button is pressed again.
function labChanged() {
  state.lab.generated = null;
  saveLabPrefs();
  renderSetupLab();
}
function labSet(field, val) {
  state.lab[field] = val;
  if (field === 'strategyId') { state.pad.checks = [true, true, true, true, true]; renderTradePad(); }
  if (field === 'market') { updateHeaderMarket(); recalcOrderPad(); }
  labChanged();
}
function labSetTF(tf) { labSet('setupTF', tf); }
function labSetPeriod(p) { labSet('period', p); }
function labSetRR(v) { labSet('rr', v === 'struct' ? 'struct' : parseFloat(v)); recalcOrderPad(); }
function labToggleNews() { labSet('newsFilter', document.getElementById('labNews').checked); }
function labTogglePartial() { labSet('partialBE', document.getElementById('labPartial').checked); recalcOrderPad(); }
function labToggleConf(key) {
  const cfg = currentCfg();
  cfg[key] = !cfg[key];
  labChanged();
}

function generatePine() {
  const L = state.lab;
  const code = Aurum.pine.generate({
    strategyId: L.strategyId, cfg: currentCfg(), market: L.market, rr: L.rr, partialBE: L.partialBE,
    period: L.period, setupTFLabel: tfLabel(L.setupTF), newsFilter: L.newsFilter,
  });
  L.generated = { code, at: Date.now(), snapshot: { ...L, cfg: { ...currentCfg() } } };
  renderPineOut();
  document.getElementById('pineOut').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('✅ Pine Script ready — tap Copy');
}

function copyText(txt) {
  // iOS Safari: the Clipboard API needs HTTPS; fall back to a selected textarea + execCommand.
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(txt).then(() => true, () => legacyCopy(txt));
  return Promise.resolve(legacyCopy(txt));
}
function legacyCopy(txt) {
  const ta = document.createElement('textarea');
  ta.value = txt;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
  document.body.appendChild(ta);
  ta.focus();
  ta.setSelectionRange(0, txt.length);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  ta.remove();
  return ok;
}
function copyPineScript() {
  const G = state.lab.generated;
  if (!G) return;
  copyText(G.code).then((ok) => {
    showToast(ok ? '✅ Copied — paste it in TradingView\'s Pine Editor' : 'Copy blocked — open "Show the code" and copy it by hand');
    const btn = document.getElementById('copyPineBtn');
    if (ok && btn) { btn.textContent = '✓ Copied'; setTimeout(() => { btn.textContent = '📋 Copy Pine Script'; }, 2000); }
  });
}

const fmtDateTime = (ms) => new Date(ms).toLocaleString(undefined, { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function guideCard(title, body) {
  return `<div class="rounded-2xl bg-slate-900 border border-slate-800 p-3">
    <div class="text-base font-bold text-white">${title}</div>
    <div class="mt-2 text-sm text-slate-300 leading-snug">${body}</div>
  </div>`;
}

function renderPineOut() {
  const box = document.getElementById('pineOut');
  const G = state.lab.generated;
  if (!G) {
    box.innerHTML = `<div class="text-center py-5">
      <div class="text-3xl">⚡</div>
      <div class="text-base font-semibold text-white mt-2">Choose your settings, then tap Generate</div>
      <div class="text-sm text-slate-400 mt-1">You get a TradingView script, a step-by-step guide and expert tips for the method.</div>
    </div>`;
    return;
  }
  const S = G.snapshot;
  const strat = Aurum.STRATEGIES[S.strategyId];
  const mk = Aurum.MARKETS[S.market];
  const tips = METHOD_TIPS[S.strategyId];
  const start = G.at - PERIODS[S.period] * DAY_MS;
  const events = Aurum.news.between(start, G.at + 14 * DAY_MS);
  const past = events.filter((e) => e.t <= G.at);
  const next = events.filter((e) => e.t > G.at);
  const short = (t) => (t.startsWith('FOMC') ? 'FOMC' : t.includes('CPI') ? 'CPI' : 'NFP');
  const tvUrl = `https://www.tradingview.com/chart/?symbol=OANDA%3A${mk.ticker}&interval=${Aurum.TIMEFRAMES[S.setupTF].tv}`;
  const rulesOn = strat.confluences.filter((c) => S.cfg[c.key]).map((c) => c.label);

  box.innerHTML = `
    <div>
      <div class="text-sm text-slate-400">Ready for TradingView</div>
      <div class="text-lg font-bold text-white">${strat.name}</div>
      <div class="text-sm text-slate-300">OANDA:${mk.ticker} · ${tfLabel(S.setupTF)} chart · last ${S.period} · ${S.rr === 'struct' ? 'structure target' : '1:' + S.rr}${S.partialBE ? ' · 50% at 1R' : ''}${S.newsFilter ? ' · news filter ON' : ''}</div>
      <div class="text-xs text-slate-500 mt-1">Rules on: ${rulesOn.join(' · ') || 'pattern only'}</div>
    </div>

    <button id="copyPineBtn" onclick="copyPineScript()" class="w-full h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 font-extrabold text-base active:scale-[0.99] transition">📋 Copy Pine Script</button>
    <a href="${tvUrl}" target="_blank" rel="noopener" class="flex items-center justify-center w-full h-12 rounded-2xl bg-slate-900 border border-slate-700 text-slate-100 font-bold text-sm">📈 Open OANDA:${mk.ticker} ${tfLabel(S.setupTF)} in TradingView</a>

    ${guideCard('1 · How to test it in TradingView', `<ol class="space-y-1.5 list-decimal pl-5">
      <li>Tap <b>Copy Pine Script</b> above.</li>
      <li>Open TradingView (a free account is enough) on <b>OANDA:${mk.ticker}</b>, timeframe <b>${tfLabel(S.setupTF)}</b>.</li>
      <li>Open <b>Pine Editor</b> (bottom of the screen on desktop), delete everything, paste.</li>
      <li>Tap <b>Add to chart</b>. Green ▲ / red ▼ labels show the entries, with the red stop line and green target line.</li>
      <li>Open the <b>Strategy Tester</b> tab: Overview, then List of trades.</li>
      <li>To change the method, rules, target or dates without coming back here, click the ⚙ settings of the strategy on the chart.</li>
    </ol>
    <p class="text-xs text-slate-500 mt-2">Easiest on a computer. The TradingView phone app can run scripts, but editing is harder.</p>`)}

    ${guideCard('2 · How to read the results', `<ul class="space-y-1.5">
      <li>📊 <b>Total closed trades:</b> under 30 trades, the result is luck, not proof. Test a longer period or a lower timeframe.</li>
      <li>🎯 <b>Percent profitable:</b> with a 1:2 target, about 40% winners is already break-even.</li>
      <li>💰 <b>Profit factor:</b> gains ÷ losses. Under 1 loses money, 1.3+ is good, 1.5+ is strong.</li>
      <li>📉 <b>Max drawdown:</b> the worst dip. For a prop firm, keep it under 5–10%.</li>
      <li>🔍 In <b>List of trades</b>, click each loser to see it on the chart. Was it near a 📰 news label? Against the trend? At a weak level?</li>
      <li>🧾 With "50% at 1R", one trade shows as 2 lines in the list (the half closed at 1R, then the rest).</li>
      <li>📅 To compare 1M / 3M / 6M: change <b>Début du test</b> in the settings. TradingView only tests the candles it loaded; if a long period gives few trades, switch to 4H.</li>
    </ul>`)}

    ${guideCard(`3 · Expert tips — ${strat.short}`, `<p class="text-yellow-200 mb-2">⭐ ${tips.best}</p>
      <ul class="space-y-1.5">${tips.tips.map((t) => `<li>• ${t}</li>`).join('')}</ul>
      <div class="mt-3 pt-3 border-t border-slate-800">
        <div class="font-semibold text-slate-200 mb-1">General rules from experience</div>
        <ul class="space-y-1.5">
          <li>• The best gold moves come at the London open (08:00–11:00 Paris) and the New York open (14:30–17:00 Paris). The Asian session is often a range: be careful there.</li>
          <li>• Trade in the direction of the higher-timeframe trend first. Counter-trend setups need every confluence.</li>
          <li>• Silver moves about 1.5–2× more than gold in %. Expect wider stops and more fake breaks.</li>
          <li>• Risk 0.5–1% per trade. After 3 losses in a row, stop for the day.</li>
          <li>• The script is mechanical. Your eye adds the context (clean structure, liquidity, news): use the script to find setups, and your judgment to filter them.</li>
        </ul>
      </div>`)}

    ${guideCard('4 · Red-folder USD news', `<p class="mb-2">These are the releases that move gold the most. In the script they show as 📰 orange candles${S.newsFilter ? ', and no entry is taken from 2h before to 1h after them' : '. Turn on "Skip red-folder news" to block entries around them'}.</p>
      <ul class="space-y-1.5 mb-3">${Object.entries(NEWS_EXPLAIN).map(([k, v]) => `<li><b class="text-amber-300">${k}:</b> ${v}</li>`).join('')}</ul>
      ${next.length ? `<div class="font-semibold text-slate-200">Coming up</div>
      <div class="space-y-1 mb-3">${next.map((e) => `<div class="flex justify-between gap-2 text-xs"><span class="text-amber-300 font-bold">${short(e.title)}${e.approx ? ' ≈' : ''}</span><span class="text-slate-300">${fmtDateTime(e.t)}</span></div>`).join('')}</div>` : ''}
      <details>
        <summary class="font-semibold text-slate-200 cursor-pointer">In your test window (${past.length})</summary>
        <div class="space-y-1 mt-2">${past.map((e) => `<div class="flex justify-between gap-2 text-xs"><span class="text-amber-300 font-bold">${short(e.title)}${e.approx ? ' ≈' : ''}</span><span class="text-slate-400">${fmtDateTime(e.t)}</span></div>`).join('') || '<div class="text-xs text-slate-500">None</div>'}</div>
      </details>
      <p class="text-xs text-slate-500 mt-2">Built-in schedule: FOMC dates are official. CPI / NFP dates marked ≈ are estimates; check ForexFactory for the exact day.</p>`)}

    <details class="rounded-2xl bg-slate-900 border border-slate-800 p-3">
      <summary class="text-base font-bold text-white cursor-pointer">Show the code</summary>
      <pre class="mt-2 max-h-80 overflow-auto bg-slate-950 rounded-lg p-2 text-[11px] leading-snug text-emerald-300 font-mono whitespace-pre select-text">${G.code.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</pre>
    </details>
  `;
}

function sendLabSetupToTradePad() {
  renderTradePad();
  switchTab('trade');
  showToast(`Loaded ${currentStrategy().short} checklist into Trade Pad`);
}

// ============================================================================
// TAB 2: MACRO, FED, INFLATION, CHÔMAGE & GEOPOLITICS RADAR
// ============================================================================
function renderMacroRadar() {
  const totalScore = state.macroPillars.reduce((acc, p) => acc + p.score, 0);
  const scoreEl = document.getElementById('macroScoreBig');
  const biasEl  = document.getElementById('macroBiasText');
  const hudBadge = document.getElementById('hudMacroBadge');

  const sign = totalScore > 0 ? `+${totalScore}` : `${totalScore}`;
  scoreEl.textContent = `${sign} / +6`;

  if (totalScore >= 2) {
    scoreEl.className = 'text-2xl font-black text-emerald-400';
    biasEl.textContent = 'BULLISH GOLD REGIME (LONGS FAVORED)';
    biasEl.className = 'text-[11px] font-bold text-emerald-300';
    hudBadge.textContent = `Macro: ${sign} Bullish`;
    hudBadge.className = 'font-semibold text-emerald-400';
  } else if (totalScore <= -2) {
    scoreEl.className = 'text-2xl font-black text-rose-400';
    biasEl.textContent = 'BEARISH GOLD REGIME (SHORTS FAVORED)';
    biasEl.className = 'text-[11px] font-bold text-rose-300';
    hudBadge.textContent = `Macro: ${sign} Bearish`;
    hudBadge.className = 'font-semibold text-rose-400';
  } else {
    scoreEl.className = 'text-2xl font-black text-yellow-400';
    biasEl.textContent = 'NEUTRAL / MIXED MACRO REGIME';
    biasEl.className = 'text-[11px] font-bold text-yellow-300';
    hudBadge.textContent = `Macro: ${sign} Neutral`;
    hudBadge.className = 'font-semibold text-yellow-400';
  }

  // Render the 6 Macro Pillars with tap-to-cycle regime
  document.getElementById('macroPillarsList').innerHTML = state.macroPillars.map((p, idx) => {
    const badgeClass = p.score > 0
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : p.score < 0
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : 'bg-slate-800 text-slate-300 border-slate-700';

    return `
      <div onclick="cyclePillarScore(${idx})" class="glass-card rounded-2xl p-3 cursor-pointer active:scale-[0.99] transition">
        <div class="flex items-center justify-between gap-2">
          <div>
            <div class="text-xs font-extrabold text-white">${p.title}</div>
            <div class="text-[10px] font-mono text-yellow-400/90">${p.ticker}</div>
          </div>
          <span class="shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-black border ${badgeClass}">
            ${p.score > 0 ? 'Bullish Gold (+1)' : p.score < 0 ? 'Bearish Gold (-1)' : 'Neutral (0)'}
          </span>
        </div>
        <div class="text-xs font-semibold text-slate-200 mt-2 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800">
          ${p.reading}
        </div>
        <div class="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between">
          <span>${p.explanation}</span>
          <span class="text-yellow-400 font-bold shrink-0 ml-2">Tap to test ↻</span>
        </div>
      </div>
    `;
  }).join('');

  // Render Economic Calendar
  document.getElementById('economicCalendarList').innerHTML = state.economicEvents.map(ev => `
    <div class="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
      <div>
        <div class="flex items-center gap-1.5">
          <span class="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px] font-black">${ev.impact}</span>
          <span class="text-[11px] font-mono font-bold text-slate-300">${ev.time}</span>
          <span class="text-xs font-bold text-white">${ev.title}</span>
        </div>
        <div class="text-[10px] text-emerald-400 mt-1">${ev.effect}</div>
      </div>
      <div class="text-right shrink-0 text-[10px] text-slate-400 font-mono">
        <div>Fcst: <b class="text-white">${ev.forecast}</b></div>
        <div>Prev: ${ev.previous}</div>
      </div>
    </div>
  `).join('');
}

function cyclePillarScore(idx) {
  const cur = state.macroPillars[idx].score;
  state.macroPillars[idx].score = cur === 1 ? -1 : cur === -1 ? 0 : 1;
  renderMacroRadar();
  renderTradePad();
}

function applyMacroPreset(preset) {
  if (preset === 'dovish_geo') {
    state.macroPillars.forEach(p => p.score = 1);
    showToast('🕊️ Loaded: Dovish Fed + Rising Chômage + Geopolitical Safe-Haven (+6)');
  } else if (preset === 'current') {
    const scores = [1, 1, 1, 1, 0, 1];
    state.macroPillars.forEach((p, i) => p.score = scores[i]);
    showToast('⚡ Loaded: Current Bullish Gold Macro Regime (+5)');
  } else if (preset === 'hot_cpi') {
    const scores = [-1, -1, -1, -1, 0, 0];
    state.macroPillars.forEach((p, i) => p.score = scores[i]);
    showToast('🔥 Loaded: Hot CPI Inflation Shock + Strong NFP Jobs (-4 Bearish Gold)');
  } else {
    state.macroPillars.forEach(p => p.score = 0);
    showToast('⚖️ Loaded: Neutral Mixed Macro Regime (0)');
  }
  renderMacroRadar();
  renderTradePad();
}

function toggleNewsSimulation() {
  state.redNewsLockoutActive = !state.redNewsLockoutActive;
  const banner = document.getElementById('redNewsBanner');
  const pill   = document.getElementById('newsShieldPill');
  const btn    = document.getElementById('simNewsBtn');

  if (state.redNewsLockoutActive) {
    banner.classList.remove('hidden');
    pill.textContent = '🛑 CPI Lock';
    pill.className = 'px-2.5 py-1.5 rounded-lg bg-red-500/25 border border-red-500 text-[11px] font-bold text-red-300 animate-pulse';
    btn.textContent = '✅ Clear CPI Lockout';
    showToast('🚨 RED-FOLDER USD NEWS ACTIVE — Execution Pad Locked!');
  } else {
    banner.classList.add('hidden');
    pill.textContent = '🛡️ Clear';
    pill.className = 'px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-[11px] font-bold text-emerald-400';
    btn.textContent = '⚡ Simulate CPI Now';
    showToast('🛡️ News Window Clear — Execution Unlocked');
  }
  renderTradePad();
}

// ============================================================================
// TAB 3: TRADE PAD (PRE-TRADE CHECKLIST GATEKEEPER + XAUUSD LOT CALCULATOR)
// ============================================================================
function renderTradePad() {
  const setup = currentStrategy();
  document.getElementById('activePadSetupTitle').textContent = setup.name;

  const container = document.getElementById('tradeChecklistContainer');
  container.innerHTML = setup.checklist.map((item, idx) => {
    const checked = state.pad.checks[idx];
    return `
      <div onclick="togglePadCheck(${idx})" class="flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
        checked ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-slate-900/90 border-slate-800 text-slate-400'
      }">
        <span class="text-xs font-semibold pr-2">${item}</span>
        <span class="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black ${
          checked ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-600'
        }">${checked ? '✓' : ''}</span>
      </div>
    `;
  }).join('');

  const checkedCount = state.pad.checks.filter(Boolean).length;
  const badge = document.getElementById('setupGradeBadge');
  const execBox = document.getElementById('executionButtonsBox');

  if (state.redNewsLockoutActive) {
    badge.textContent = '🛑 LOCKED (RED USD NEWS)';
    badge.className = 'px-2.5 py-1 rounded-xl font-black text-xs bg-red-500/25 text-red-300 border border-red-500';
    execBox.classList.add('opacity-40', 'pointer-events-none');
  } else if (checkedCount === 5) {
    badge.textContent = 'Grade: A+ (100% Unlocked)';
    badge.className = 'px-2.5 py-1 rounded-xl font-black text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    execBox.classList.remove('opacity-40', 'pointer-events-none');
  } else if (checkedCount === 4) {
    badge.textContent = 'Grade: B (80% Unlocked)';
    badge.className = 'px-2.5 py-1 rounded-xl font-black text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
    execBox.classList.remove('opacity-40', 'pointer-events-none');
  } else {
    badge.textContent = `🔒 LOCKED (${checkedCount}/5 Rules)`;
    badge.className = 'px-2.5 py-1 rounded-xl font-black text-xs bg-rose-500/20 text-rose-400 border border-rose-500/40';
    execBox.classList.add('opacity-40', 'pointer-events-none');
  }

  recalcOrderPad();
}

function togglePadCheck(idx) {
  state.pad.checks[idx] = !state.pad.checks[idx];
  renderTradePad();
}

function setRiskPct(pct) {
  state.pad.riskPct = pct;
  document.querySelectorAll('.risk-pill').forEach(btn => {
    if (btn.textContent.includes(`${pct}%`)) {
      btn.className = 'risk-pill flex-1 py-1 rounded text-[11px] font-bold bg-yellow-500 text-slate-950';
    } else {
      btn.className = 'risk-pill flex-1 py-1 rounded text-[11px] font-bold bg-slate-800 text-slate-300';
    }
  });
  recalcOrderPad();
}

// Target R used by the pad ('Structure' falls back to 2R for sizing).
function padRR() { return state.lab.rr === 'struct' ? 2 : state.lab.rr; }
function padMarket() { return Aurum.MARKETS[state.lab.market]; }
function padPrice() {
  const v = parseFloat(document.getElementById('padEntryPrice').value);
  return v > 0 ? v : null;
}

function recalcOrderPad() {
  const mk = padMarket();
  const acct = parseFloat(document.getElementById('calcAccountSize').value || '100000');
  const slider = document.getElementById('slDistSlider');
  // Silver moves ~1/80th of gold in dollars: rescale the stop slider per market.
  const range = mk.id === 'XAU' ? { min: 1.5, max: 15, step: 0.5, def: 4 } : { min: 0.02, max: 0.6, step: 0.01, def: 0.1 };
  if (slider.dataset.market !== mk.id) {
    Object.assign(slider, { min: range.min, max: range.max, step: range.step, value: range.def });
    slider.dataset.market = mk.id;
    document.getElementById('slMinLabel').textContent = `Tight ($${range.min})`;
    document.getElementById('slMaxLabel').textContent = `Wide ($${range.max})`;
  }
  const slDollars = parseFloat(slider.value);
  const riskCash = acct * (state.pad.riskPct / 100.0);
  const rr = padRR();

  // Lots = risk ÷ (stop distance in $ × ounces per lot). Gold: 100 oz, Silver: 5000 oz.
  const lots = riskCash / (slDollars * mk.contractOz);

  document.getElementById('padContractLabel').textContent = `${mk.ticker}: 1 lot = ${mk.contractOz.toLocaleString()} oz`;
  document.getElementById('padCalcTitle').textContent = `Step 2 • ${mk.name} position size`;
  document.getElementById('calcRiskDollar').textContent = `$${riskCash.toLocaleString()}`;
  document.getElementById('slDistLabel').textContent = `$${slDollars.toFixed(mk.decimals)}`;
  document.getElementById('outLotSize').textContent = lots.toFixed(2);

  const px = padPrice();
  const tp2Cash = Math.round(riskCash * (state.lab.partialBE ? (0.5 + 0.5 * rr) : rr));
  document.getElementById('outTP1').textContent = `+$${Math.round(riskCash * 0.5).toLocaleString()} (1R)`;
  document.getElementById('outTP1Price').textContent = px ? `@ ${(px + slDollars).toFixed(mk.decimals)} (long)` : 'enter a price above';
  document.getElementById('outTP2').textContent = `+$${tp2Cash.toLocaleString()} (${rr}R)`;
  document.getElementById('outTP2Price').textContent = px ? `@ ${(px + slDollars * rr).toFixed(mk.decimals)}` : '';
  document.getElementById('outTP2Label').textContent = `FINAL TP (${rr}R)`;
}

function copyMT5Ticket() {
  const mk = padMarket();
  const px = padPrice();
  if (!px) { showToast('Type your entry price first'); return; }
  const lots = document.getElementById('outLotSize').textContent;
  const slDollars = parseFloat(document.getElementById('slDistSlider').value);
  const rr = padRR();
  const txt = `${mk.ticker} BUY | Lots: ${lots} | Entry: ${px.toFixed(mk.decimals)} | SL: ${(px - slDollars).toFixed(mk.decimals)} | TP: ${(px + slDollars * rr).toFixed(mk.decimals)} (${rr}R)`;
  navigator.clipboard.writeText(txt);
  showToast(`Copied ${mk.ticker} ticket`);
}

function executeTrade(direction) {
  const setup = currentStrategy();
  const mk = padMarket();
  const lots = parseFloat(document.getElementById('outLotSize').textContent);
  const acct = parseFloat(document.getElementById('calcAccountSize').value || '100000');
  const riskCash = acct * (state.pad.riskPct / 100.0);
  const totalMacro = state.macroPillars.reduce((acc, p) => acc + p.score, 0);
  const rr = padRR();

  state.journal.unshift({
    id: Date.now(),
    time: new Date().toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    setup: `${mk.name} · ${setup.short}`,
    direction,
    lots,
    entry: padPrice() || 0,
    grade: state.pad.checks.filter(Boolean).length === 5 ? 'A+' : 'B',
    macroScore: totalMacro >= 0 ? `+${totalMacro}` : `${totalMacro}`,
    compliant: true,
    resultR: rr,
    pnl: Math.round(riskCash * (state.lab.partialBE ? (0.5 + 0.5 * rr) : rr)),
    notes: `Logged from Trade Pad (${lots} lots ${mk.ticker} @ ${state.pad.riskPct}% risk)`,
  });
  renderJournal();
  switchTab('journal');
  showToast(`Logged ${direction} ${lots} lots ${mk.ticker}`);
}

// ============================================================================
// TAB 4: AUTO-JOURNAL & BEHAVIORAL ANALYTICS
// ============================================================================
function renderJournal() {
  const totalPnL = state.journal.reduce((acc, t) => acc + t.pnl, 0);
  const pnlEl = document.getElementById('journalTotalPnL');
  pnlEl.textContent = `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`;
  pnlEl.className = `text-lg font-black ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;

  const list = document.getElementById('journalListContainer');
  list.innerHTML = state.journal.map((t, idx) => `
    <div class="p-3 rounded-xl bg-slate-900/90 border ${t.pnl >= 0 ? 'border-emerald-500/30' : 'border-rose-500/30'} space-y-1.5">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-black ${t.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${t.direction} ${t.lots}L</span>
          <span class="text-xs font-bold text-white">${t.setup}</span>
        </div>
        <button onclick="cycleTradeOutcome(${idx})" class="px-2 py-0.5 rounded-lg text-xs font-black ${t.pnl >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">
          ${t.pnl >= 0 ? `+$${t.pnl.toLocaleString()} (+${t.resultR}R)` : `-$${Math.abs(t.pnl).toLocaleString()} (-1R)`} ↻
        </button>
      </div>
      <div class="flex items-center justify-between text-[10px] text-slate-400">
        <span>Entry: <b class="text-slate-200">${t.entry.toFixed(2)}</b> • Grade: <b class="text-yellow-400">${t.grade}</b> • Macro: <b class="text-emerald-400">${t.macroScore}</b></span>
        <span>${t.time}</span>
      </div>
      <div class="text-[10px] text-slate-400 italic">${t.notes}</div>
    </div>
  `).join('');
}

function cycleTradeOutcome(idx) {
  const t = state.journal[idx];
  if (t.resultR > 0) {
    t.resultR = -1.0;
    t.pnl = -1000;
  } else {
    t.resultR = padRR();
    t.pnl = Math.round(1000 * padRR());
  }
  renderJournal();
}

// ============================================================================
// HEADER (TradingView chart follows the selected market)
// ============================================================================
function updateHeaderMarket() {
  const mk = padMarket();
  const tv = document.getElementById('tvFrame');
  const sym = `OANDA:${mk.ticker}`;
  if (tv && !tv.src.includes(encodeURIComponent(sym))) {
    tv.src = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_xau&symbol=${encodeURIComponent(sym)}&interval=15&hidesidetoolbar=1&symboledit=1&saveimage=0&toolbarbg=0f172a&studies=%5B%5D&theme=dark&style=1&timezone=America%2FNew_York`;
    document.getElementById('tvTitle').textContent = `TradingView — ${sym} (15m)`;
  }
}

// Initialize App on Load
window.addEventListener('DOMContentLoaded', () => {
  loadLabPrefs();
  renderSetupLab();
  renderMacroRadar();
  renderTradePad();
  renderJournal();
  updateHeaderMarket();
});
