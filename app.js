// ============================================================================
// AURUM OS — GOLD (XAUUSD) SETUP LAB, MACRO/GEOPOLITICAL RADAR & EXECUTION APP
// ============================================================================

const state = {
  activeTab: 'lab',
  prices: { XAU: null, XAG: null },
  redNewsLockoutActive: false,

  // 1. Backtest Lab configuration (persisted per device)
  lab: {
    market: 'XAU',
    strategyId: 'crt',
    setupTF: 'H4',
    entryTF: 'M15',
    period: '3M',
    rr: 2,
    partialBE: true,
    newsFilter: false,
    cfgByStrategy: {},
    results: null,
    running: false,
    status: '',
    showAllTrades: false,
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
// TAB 1: BACKTEST LAB — real candles (Twelve Data) × Firas methods
// ============================================================================
const PERIODS = { '1M': 30, '3M': 91, '6M': 182, '1Y': 365 };
const DAY_MS = 24 * 3600 * 1000;
const SETUP_TFS = ['H1', 'H4', 'D1'];
const ENTRY_TFS = ['SAME', 'M5', 'M15', 'H1'];
const M5_MAX_DAYS = 91; // keeps M5 downloads within the free API limits

const LAB_PREFS_KEY = 'aurum.lab.prefs';
function saveLabPrefs() {
  const { market, strategyId, setupTF, entryTF, period, rr, partialBE, newsFilter, cfgByStrategy } = state.lab;
  try { localStorage.setItem(LAB_PREFS_KEY, JSON.stringify({ market, strategyId, setupTF, entryTF, period, rr, partialBE, newsFilter, cfgByStrategy })); } catch (e) { /* ignore */ }
}
function loadLabPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(LAB_PREFS_KEY) || 'null');
    if (p && Aurum.STRATEGIES[p.strategyId]) Object.assign(state.lab, p);
  } catch (e) { /* ignore */ }
}

function currentStrategy() { return Aurum.STRATEGIES[state.lab.strategyId]; }
function currentCfg() {
  const id = state.lab.strategyId;
  if (!state.lab.cfgByStrategy[id]) state.lab.cfgByStrategy[id] = Aurum.strategy.defaultConfig(id);
  return state.lab.cfgByStrategy[id];
}
function entryAllowed(tf) {
  if (tf === 'SAME') return true;
  return Aurum.TIMEFRAMES[tf].ms < Aurum.TIMEFRAMES[state.lab.setupTF].ms;
}
function periodAllowed(p) {
  return !(state.lab.entryTF === 'M5' && PERIODS[p] > M5_MAX_DAYS);
}
function tfLabel(tf) { return tf === 'SAME' ? 'Same TF' : Aurum.TIMEFRAMES[tf].label; }

function seg(items, activeVal, onclick, labelFn, disabledFn) {
  return items.map((v) => {
    const active = v === activeVal;
    const disabled = disabledFn ? disabledFn(v) : false;
    const cls = disabled
      ? 'bg-slate-900/40 border-slate-800/60 text-slate-600 cursor-not-allowed'
      : active
      ? 'bg-yellow-400 border-yellow-400 text-slate-950'
      : 'bg-slate-900 border-slate-700 text-slate-200 active:scale-95';
    return `<button ${disabled ? 'disabled' : `onclick="${onclick}('${v}')"`} class="flex-1 h-11 rounded-xl border text-sm font-bold transition ${cls}">${labelFn ? labelFn(v) : v}</button>`;
  }).join('');
}

function renderSetupLab() {
  const L = state.lab;
  const strat = currentStrategy();
  const cfg = currentCfg();

  document.getElementById('labMarket').innerHTML = Object.values(Aurum.MARKETS).map((m) => {
    const active = L.market === m.id;
    return `<button onclick="labSet('market','${m.id}')" class="flex-1 rounded-2xl border p-3 text-left transition active:scale-95 ${active ? 'bg-yellow-400/15 border-yellow-400' : 'bg-slate-900 border-slate-700'}">
      <div class="text-base font-bold ${active ? 'text-yellow-300' : 'text-white'}">${m.id === 'XAU' ? '🥇' : '🥈'} ${m.name}</div>
      <div class="text-xs text-slate-400 mt-0.5">${m.ticker}</div>
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
  document.getElementById('labEntryTF').innerHTML = seg(ENTRY_TFS, L.entryTF, 'labSetEntry', tfLabel, (v) => !entryAllowed(v));
  document.getElementById('labPeriod').innerHTML = seg(Object.keys(PERIODS), L.period, 'labSetPeriod', null, (v) => !periodAllowed(v));
  document.getElementById('labPeriodNote').textContent = L.entryTF === 'M5' ? '5m entries are limited to 3 months of history (free API limits).' : '';
  document.getElementById('labRR').innerHTML = seg(['1.5', '2', '3', 'struct'], String(L.rr), 'labSetRR', (v) => (v === 'struct' ? 'Structure' : `1:${v}`));
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

  const key = Aurum.data.getApiKey();
  document.getElementById('apiKeyInput').value = key ? '••••••••' + key.slice(-4) : '';
  document.getElementById('apiKeyState').innerHTML = key
    ? '<span class="text-emerald-400 font-semibold">Key saved on this device ✓</span>'
    : '<span class="text-amber-300 font-semibold">No key yet — backtests need one (free).</span>';

  const busy = L.running;
  document.getElementById('runBtn').disabled = busy;
  document.getElementById('compareBtn').disabled = busy;
  document.getElementById('runBtn').classList.toggle('opacity-60', busy);
  document.getElementById('compareBtn').classList.toggle('opacity-60', busy);
  document.getElementById('labStatus').textContent = L.status || '';

  renderLabResults();
}

function labSet(field, val) {
  state.lab[field] = val;
  state.lab.results = null;
  if (field === 'strategyId') { state.pad.checks = [true, true, true, true, true]; renderTradePad(); }
  if (field === 'market') { updateHeaderMarket(); recalcOrderPad(); }
  saveLabPrefs();
  renderSetupLab();
}
function labSetTF(tf) {
  state.lab.setupTF = tf;
  if (!entryAllowed(state.lab.entryTF)) state.lab.entryTF = 'SAME';
  labSet('setupTF', tf);
}
function labSetEntry(tf) {
  state.lab.entryTF = tf;
  if (!periodAllowed(state.lab.period)) state.lab.period = '3M';
  labSet('entryTF', tf);
}
function labSetPeriod(p) { labSet('period', p); }
function labSetRR(v) { labSet('rr', v === 'struct' ? 'struct' : parseFloat(v)); recalcOrderPad(); }
function labToggleNews() { labSet('newsFilter', document.getElementById('labNews').checked); }
function labTogglePartial() { labSet('partialBE', document.getElementById('labPartial').checked); recalcOrderPad(); }
function labToggleConf(key) {
  const cfg = currentCfg();
  cfg[key] = !cfg[key];
  state.lab.results = null;
  saveLabPrefs();
  renderSetupLab();
}

function saveApiKey() {
  const v = document.getElementById('apiKeyInput').value.trim();
  if (!v || v.startsWith('••')) { showToast('Paste your Twelve Data API key first'); return; }
  Aurum.data.setApiKey(v);
  showToast('API key saved on this device');
  renderSetupLab();
  refreshLivePrices();
}
async function clearMarketCache() {
  await Aurum.data.clearCache();
  showToast('Downloaded candles cleared');
}

function setLabStatus(msg) {
  state.lab.status = msg;
  const el = document.getElementById('labStatus');
  if (el) el.textContent = msg;
}

async function runLab(compareAll) {
  const L = state.lab;
  if (!Aurum.data.getApiKey()) {
    document.getElementById('dataSettings').scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Add your free Twelve Data API key to run backtests');
    return;
  }
  const strat = currentStrategy();
  const cfg = { ...currentCfg() };
  const htfMs = Aurum.TIMEFRAMES[L.setupTF].ms;
  const sameTF = L.entryTF === 'SAME';
  const periods = compareAll ? Object.keys(PERIODS).filter(periodAllowed) : [L.period];
  const maxDays = Math.max(...periods.map((p) => PERIODS[p]));
  const now = Date.now();
  const histStart = now - maxDays * DAY_MS;

  L.running = true;
  setLabStatus('Preparing…');
  renderSetupLab();
  try {
    const onStatus = (m) => setLabStatus(m);
    const htf = await Aurum.data.getBars(L.market, L.setupTF, histStart - 120 * htfMs, onStatus);
    const ltf = sameTF ? null : await Aurum.data.getBars(L.market, L.entryTF, histStart - 4 * htfMs, onStatus);
    const pairId = Aurum.MARKETS[L.market].pair;
    const pairHtf = strat.needsPair && cfg.smt ? await Aurum.data.getBars(pairId, L.setupTF, histStart - 120 * htfMs, onStatus) : null;
    if (htf.length < 80) throw new Error('Not enough candles returned for this timeframe');
    setLabStatus('Running backtest…');
    await new Promise((r) => setTimeout(r, 30));

    const base = {
      strategy: strat, htf, ltf, pairHtf, htfMs,
      ltfMs: sameTF ? 0 : Aurum.TIMEFRAMES[L.entryTF].ms,
      rr: L.rr, partialBE: L.partialBE, newsFilter: L.newsFilter, spread: Aurum.MARKETS[L.market].spread, riskPct: 1,
    };
    const startFor = (p) => now - PERIODS[p] * DAY_MS;
    const main = Aurum.backtest.run({ ...base, cfg, startMs: startFor(L.period) });

    const compare = compareAll
      ? periods.map((p) => ({ period: p, stats: Aurum.backtest.run({ ...base, cfg, startMs: startFor(p) }).stats }))
      : null;

    const ablation = strat.confluences.filter((c) => cfg[c.key]).map((c) => ({
      label: c.label,
      stats: Aurum.backtest.run({ ...base, cfg: { ...cfg, [c.key]: false }, startMs: startFor(L.period) }).stats,
    }));
    const allOff = {};
    strat.confluences.forEach((c) => (allOff[c.key] = false));
    ablation.push({ label: 'Pattern only (no confluences)', stats: Aurum.backtest.run({ ...base, cfg: allOff, startMs: startFor(L.period) }).stats });
    ablation.push({
      label: L.newsFilter ? 'Without news filter' : 'With news filter (skip red news)',
      stats: Aurum.backtest.run({ ...base, newsFilter: !L.newsFilter, cfg, startMs: startFor(L.period) }).stats,
    });

    const analysis = Aurum.analysis.analyze({
      trades: main.trades, stats: main.stats, htf, htfMs, htfLabel: tfLabel(L.setupTF),
      market: Aurum.MARKETS[L.market], startMs: startFor(L.period),
      compare, ablation, newsSkipped: main.newsSkipped, newsFilter: L.newsFilter,
    });

    L.results = {
      ...main, compare, ablation, analysis,
      meta: {
        market: L.market, strategyId: L.strategyId, setupTF: L.setupTF, entryTF: L.entryTF,
        period: L.period, rr: L.rr, partialBE: L.partialBE, newsFilter: L.newsFilter,
        from: htf.length ? startFor(L.period) : now, to: htf[htf.length - 1].t,
      },
    };
    L.showAllTrades = false;
    setLabStatus('');
  } catch (e) {
    const msg = e.message === 'NO_KEY' ? 'Add your API key first' : e.message;
    setLabStatus(`⚠️ ${msg}`);
    showToast(msg);
  } finally {
    L.running = false;
    renderSetupLab();
    if (L.results) document.getElementById('labResults').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

const fmtR = (r) => `${r >= 0 ? '+' : ''}${r.toFixed(1)}R`;
const fmtPF = (pf) => (isFinite(pf) ? pf.toFixed(2) : '∞');
const fmtDate = (ms) => new Date(ms).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
const fmtDateTime = (ms) => new Date(ms).toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

function statTile(label, value, sub, color) {
  return `<div class="bg-slate-900 rounded-2xl p-3 border border-slate-800">
    <div class="text-xs text-slate-400">${label}</div>
    <div class="text-2xl font-extrabold mt-0.5 ${color}">${value}</div>
    <div class="text-xs text-slate-500 mt-0.5">${sub}</div>
  </div>`;
}

function equitySvg(curve) {
  const W = 320, H = 130, pad = 8;
  if (curve.length < 2) return `<div class="h-32 flex items-center justify-center text-sm text-slate-500">No trades to draw</div>`;
  const min = Math.min(0, ...curve), max = Math.max(0, ...curve);
  const span = max - min || 1;
  const x = (i) => pad + (i / (curve.length - 1)) * (W - 2 * pad);
  const y = (v) => H - pad - ((v - min) / span) * (H - 2 * pad);
  const pts = curve.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  const up = curve[curve.length - 1] >= 0;
  const col = up ? '#34d399' : '#fb7185';
  return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-36">
    <line x1="${pad}" x2="${W - pad}" y1="${y(0)}" y2="${y(0)}" stroke="#475569" stroke-width="1" stroke-dasharray="4,4"/>
    <text x="${W - pad}" y="${y(0) - 4}" text-anchor="end" font-size="10" fill="#64748b">0R</text>
    <polygon points="${x(0)},${y(0)} ${pts} ${x(curve.length - 1)},${y(0)}" fill="${col}" fill-opacity="0.12"/>
    <polyline points="${pts}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="${x(curve.length - 1)}" cy="${y(curve[curve.length - 1])}" r="3.5" fill="${col}"/>
  </svg>`;
}

function statsRow(label, s, highlight) {
  const pfCol = s.n === 0 ? 'text-slate-500' : s.pf >= 1.3 ? 'text-emerald-400' : s.pf >= 1 ? 'text-yellow-300' : 'text-rose-400';
  return `<tr class="border-t border-slate-800 ${highlight ? 'bg-yellow-400/5' : ''}">
    <td class="py-2.5 pr-2 text-sm font-semibold text-slate-200">${label}</td>
    <td class="py-2.5 px-1 text-sm text-right text-slate-300">${s.n}</td>
    <td class="py-2.5 px-1 text-sm text-right text-slate-300">${s.n ? s.winRate.toFixed(0) + '%' : '—'}</td>
    <td class="py-2.5 px-1 text-sm text-right font-bold ${pfCol}">${s.n ? fmtPF(s.pf) : '—'}</td>
    <td class="py-2.5 pl-1 text-sm text-right font-bold ${s.netR >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${s.n ? fmtR(s.netR) : '—'}</td>
  </tr>`;
}
const statsHead = (first) => `<tr class="text-xs text-slate-500"><th class="text-left font-medium pb-1">${first}</th><th class="text-right font-medium pb-1">Trades</th><th class="text-right font-medium pb-1">Win</th><th class="text-right font-medium pb-1">PF</th><th class="text-right font-medium pb-1">Net</th></tr>`;

function renderLabResults() {
  const box = document.getElementById('labResults');
  const R = state.lab.results;
  if (!R) {
    box.innerHTML = `<div class="text-center py-6">
      <div class="text-3xl">📊</div>
      <div class="text-base font-semibold text-white mt-2">No results yet</div>
      <div class="text-sm text-slate-400 mt-1">Pick a market, a method and timeframes, then tap <b class="text-yellow-300">Run backtest</b>.</div>
    </div>`;
    return;
  }
  const s = R.stats, m = R.meta;
  const strat = Aurum.STRATEGIES[m.strategyId];
  const v = Aurum.backtest.verdict(s);
  const vStyle = {
    good: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200',
    ok: 'bg-yellow-500/10 border-yellow-500/40 text-yellow-100',
    bad: 'bg-rose-500/10 border-rose-500/40 text-rose-200',
    weak: 'bg-slate-800 border-slate-700 text-slate-200',
    none: 'bg-slate-800 border-slate-700 text-slate-200',
  }[v.level];
  const vIcon = { good: '✅', ok: '⚖️', bad: '❌', weak: '⚠️', none: 'ℹ️' }[v.level];
  const mk = Aurum.MARKETS[m.market];
  const closed = R.trades.filter((t) => !t.open);
  const openT = R.trades.find((t) => t.open);
  const list = [...closed].reverse();
  const shown = state.lab.showAllTrades ? list : list.slice(0, 12);

  box.innerHTML = `
    <div>
      <div class="text-sm text-slate-400">${mk.name} · ${tfLabel(m.setupTF)} setup → ${tfLabel(m.entryTF)} entry · ${m.rr === 'struct' ? 'Structure target' : '1:' + m.rr}${m.partialBE ? ' · 50% at 1R' : ''}</div>
      <div class="text-lg font-bold text-white mt-0.5">${strat.name}</div>
      <div class="text-sm text-slate-400">Last ${m.period} · ${fmtDate(m.from)} → ${fmtDate(m.to)}</div>
    </div>

    <div class="rounded-2xl border p-3 text-sm leading-snug ${vStyle}">${vIcon} ${v.text}</div>

    <div class="grid grid-cols-2 gap-2">
      ${statTile('Win rate', s.n ? s.winRate.toFixed(0) + '%' : '—', `${s.wins} won · ${s.losses} lost · ${s.be} BE`, 'text-white')}
      ${statTile('Profit factor', s.n ? fmtPF(s.pf) : '—', 'Gains ÷ losses', s.pf >= 1.3 ? 'text-emerald-400' : s.pf >= 1 ? 'text-yellow-300' : 'text-rose-400')}
      ${statTile('Net result', s.n ? fmtR(s.netR) : '—', `${s.returnPct >= 0 ? '+' : ''}${s.returnPct.toFixed(1)}% at 1% risk`, s.netR >= 0 ? 'text-emerald-400' : 'text-rose-400')}
      ${statTile('Max drawdown', s.n ? '-' + s.maxDDR.toFixed(1) + 'R' : '—', `-${s.maxDDPct.toFixed(1)}% at 1% risk`, s.maxDDPct <= 5 ? 'text-sky-300' : 'text-amber-300')}
    </div>
    <div class="grid grid-cols-3 gap-2 text-center">
      <div class="bg-slate-900 rounded-xl p-2 border border-slate-800"><div class="text-xs text-slate-400">Trades</div><div class="text-base font-bold text-white">${s.n}</div><div class="text-xs text-slate-500">${s.longs}L / ${s.shorts}S</div></div>
      <div class="bg-slate-900 rounded-xl p-2 border border-slate-800"><div class="text-xs text-slate-400">Avg / trade</div><div class="text-base font-bold ${s.avgR >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${s.n ? fmtR(s.avgR).replace('.0R', 'R') : '—'}</div><div class="text-xs text-slate-500">${s.avgR.toFixed(2)}R</div></div>
      <div class="bg-slate-900 rounded-xl p-2 border border-slate-800"><div class="text-xs text-slate-400">Loss streak</div><div class="text-base font-bold text-white">${s.maxLossStreak}</div><div class="text-xs text-slate-500">~${s.avgHoldH.toFixed(0)}h hold</div></div>
    </div>

    <div class="bg-slate-950 rounded-2xl p-3 border border-slate-800">
      <div class="text-sm font-semibold text-slate-200 mb-1">Equity curve (cumulative R)</div>
      ${equitySvg(s.curve)}
    </div>

    ${expertBlock(R)}

    ${R.compare ? `
    <div class="bg-slate-950 rounded-2xl p-3 border border-slate-800">
      <div class="text-sm font-semibold text-slate-200">Same rules across periods</div>
      <div class="text-xs text-slate-500 mb-2">A real edge stays positive in every window.</div>
      <table class="w-full">${statsHead('Period')}${R.compare.map((c) => statsRow('Last ' + c.period, c.stats, c.period === m.period)).join('')}</table>
    </div>` : ''}

    <div class="bg-slate-950 rounded-2xl p-3 border border-slate-800">
      <div class="text-sm font-semibold text-slate-200">Which rule adds edge?</div>
      <div class="text-xs text-slate-500 mb-2">Same test, removing one confluence at a time. If PF drops without a rule, that rule matters.</div>
      <table class="w-full">${statsHead('Test')}${statsRow('All your rules', s, true)}${R.ablation.map((a) => statsRow(a.label.startsWith('Pattern') || a.label.includes('news filter') ? a.label : 'Without: ' + a.label, a.stats)).join('')}</table>
    </div>

    <div class="bg-slate-950 rounded-2xl p-3 border border-slate-800">
      <div class="flex items-center justify-between mb-2">
        <div class="text-sm font-semibold text-slate-200">Trades (${closed.length})</div>
        <div class="text-xs text-slate-500">newest first</div>
      </div>
      ${openT ? `<div class="mb-2 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sm text-sky-200">🔵 Open now: ${openT.side} @ ${openT.entry.toFixed(mk.decimals)} · SL ${openT.stop.toFixed(mk.decimals)} · TP ${openT.target.toFixed(mk.decimals)}</div>` : ''}
      <div class="space-y-1.5">
        ${shown.length ? shown.map((t) => `
          <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md text-xs font-bold ${t.dir === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}">${t.side}</span>
                <span class="text-sm text-slate-300">${fmtDateTime(t.entryTime)}</span>
              </div>
              <span class="text-base font-bold ${t.r > 0.05 ? 'text-emerald-400' : t.r < -0.05 ? 'text-rose-400' : 'text-slate-300'}">${t.r >= 0 ? '+' : ''}${t.r.toFixed(2)}R</span>
            </div>
            <div class="text-xs text-slate-400 mt-1">${t.entry.toFixed(mk.decimals)} → ${t.exitPrice.toFixed(mk.decimals)} · ${t.outcome === 'TP' ? 'Target hit' : t.outcome === 'BE' ? 'Partial + breakeven' : 'Stopped'} · ${t.trigger}</div>
            <div class="text-xs text-slate-500">${t.reasons.join(' · ')}</div>
            <div class="flex flex-wrap gap-1 mt-1.5">${Aurum.analysis.tradeChips(t).map((c) => `<span class="px-1.5 py-0.5 rounded-md text-[11px] font-medium ${CHIP[c.tone]}">${c.text}</span>`).join('')}</div>
          </div>`).join('') : '<div class="text-sm text-slate-500 py-2">No closed trades in this period.</div>'}
      </div>
      ${list.length > 12 ? `<button onclick="state.lab.showAllTrades=!state.lab.showAllTrades;renderLabResults()" class="w-full mt-2 h-10 rounded-xl bg-slate-800 text-sm font-semibold text-slate-200">${state.lab.showAllTrades ? 'Show fewer' : `Show all ${list.length} trades`}</button>` : ''}
    </div>

    <button onclick="sendLabSetupToTradePad()" class="w-full h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm active:scale-[0.99] transition">
      Use this method's checklist in Trade Pad →
    </button>
  `;
}

const CHIP = {
  good: 'bg-emerald-500/15 text-emerald-300',
  bad: 'bg-rose-500/15 text-rose-300',
  warn: 'bg-amber-500/15 text-amber-200',
  info: 'bg-slate-800 text-slate-300',
};
const TONE = {
  good: { box: 'border-emerald-500/30 bg-emerald-500/5', icon: '✅' },
  bad: { box: 'border-rose-500/30 bg-rose-500/5', icon: '❌' },
  warn: { box: 'border-amber-500/30 bg-amber-500/5', icon: '⚠️' },
  info: { box: 'border-slate-700 bg-slate-900', icon: '💡' },
};

function expertBlock(R) {
  const a = R.analysis;
  if (!a) return '';
  const ev = a.eventsInWindow;
  const bd = Object.entries(a.breakdowns).filter(([, rows]) => rows.length > 1);
  return `
    <div class="bg-slate-950 rounded-2xl p-3 border border-yellow-500/30 space-y-2">
      <div>
        <div class="text-base font-bold text-yellow-300">🧠 Expert analysis</div>
        <div class="text-xs text-slate-500">Why it worked or failed: news, sessions, trend, volatility.</div>
      </div>
      ${a.insights.map((i) => `
        <div class="rounded-xl border p-3 ${TONE[i.tone].box}">
          <div class="text-sm font-bold text-white">${TONE[i.tone].icon} ${i.title}</div>
          <div class="text-sm text-slate-300 mt-1 leading-snug">${i.text}</div>
        </div>`).join('')}
      ${bd.map(([title, rows]) => `
        <div class="pt-1">
          <table class="w-full">${statsHead(title)}${rows.map((x) => statsRow(x.label, x.stats)).join('')}</table>
        </div>`).join('')}
      <details class="pt-1">
        <summary class="text-sm font-semibold text-slate-300 cursor-pointer">Red-folder USD news in this window (${ev.length})</summary>
        <div class="mt-2 space-y-1">
          ${ev.map((e) => `<div class="flex justify-between text-xs text-slate-400"><span>${e.title}${e.approx ? ' <span class="text-slate-600">(≈ date)</span>' : ''}</span><span>${fmtDateTime(e.t)}</span></div>`).join('') || '<div class="text-xs text-slate-500">None</div>'}
        </div>
        <div class="text-xs text-slate-600 mt-2">Built-in schedule: FOMC, CPI, NFP. Dates marked ≈ are estimated.</div>
      </details>
    </div>`;
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
function padPrice() { return state.prices[state.lab.market]; }

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
  document.getElementById('outTP1Price').textContent = px ? `@ ${(px + slDollars).toFixed(mk.decimals)}` : 'long, from live price';
  document.getElementById('outTP2').textContent = `+$${tp2Cash.toLocaleString()} (${rr}R)`;
  document.getElementById('outTP2Price').textContent = px ? `@ ${(px + slDollars * rr).toFixed(mk.decimals)}` : '';
  document.getElementById('outTP2Label').textContent = `FINAL TP (${rr}R)`;
}

function copyMT5Ticket() {
  const mk = padMarket();
  const px = padPrice();
  if (!px) { showToast('Live price unavailable — add your API key in Backtest'); return; }
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
// LIVE PRICES (Twelve Data) + HEADER
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

function renderPrices() {
  for (const id of ['XAU', 'XAG']) {
    const el = document.getElementById(`price${id}`);
    const px = state.prices[id];
    if (el) el.textContent = px ? px.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: Aurum.MARKETS[id].decimals }) : '—';
  }
}

async function refreshLivePrices() {
  if (!Aurum.data.getApiKey() || document.hidden) return;
  try {
    const [xau, xag] = await Promise.all([Aurum.data.getPrice('XAU'), Aurum.data.getPrice('XAG')]);
    if (xau) state.prices.XAU = xau;
    if (xag) state.prices.XAG = xag;
    renderPrices();
    recalcOrderPad();
  } catch (e) { /* offline or rate-limited: keep last prices */ }
}
setInterval(refreshLivePrices, 5 * 60 * 1000);

// Initialize App on Load
window.addEventListener('DOMContentLoaded', () => {
  loadLabPrefs();
  state.lab.running = false;
  state.lab.status = '';
  renderSetupLab();
  renderMacroRadar();
  renderTradePad();
  renderJournal();
  updateHeaderMarket();
  renderPrices();
  refreshLivePrices();
});
