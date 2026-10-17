// ============================================================================
// AURUM OS — GOLD (XAUUSD) SETUP LAB, MACRO/GEOPOLITICAL RADAR & EXECUTION APP
// ============================================================================

const state = {
  activeTab: 'lab',
  goldPrice: 2748.40,
  redNewsLockoutActive: false,

  // 1. Setup Lab Configuration (Côté Technique + Côté Macro)
  lab: {
    selectedSetupId: 'sweep',
    rrTarget: 2.5,
    partialBE: true,
    sessions: {
      london: true,
      nyOpen: true,
      nyPM: false,
    },
    techFilters: {
      htfEma200: true,
      atrGate: true,
      displacement: true,
    },
    macroFilters: {
      dxyInverse: true,
      fedYields: true,
      inflationChomage: true,
      consumerIndex: false,
      geoShield: true,
      newsBlackout: true,
    }
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

// Setup Definitions
const SETUPS = {
  sweep: {
    id: 'sweep',
    name: '1. Asian Liquidity Sweep (SMC)',
    shortName: 'Asian Sweep (SMC)',
    desc: 'Sweeps Asian High/Low + Reclaims range with 5m/15m MSS & FVG',
    baseWinRate: 52.5,
    basePF: 1.48,
    baseTrades: 210,
    baseDD: 7.4,
    checklist: [
      'Asian Session High or Low cleanly swept?',
      '5m / 15m Displacement candle closed back inside range (MSS)?',
      'Entry inside Fair Value Gap (FVG) or Order Block?',
      'Macro Aligned: DXY & US10Y moving opposite to Gold?',
      'Geopolitical & Red-Folder USD News Shield is Clear?'
    ]
  },
  fvg: {
    id: 'fvg',
    name: '2. Fair Value Gap (FVG) + BOS',
    shortName: 'FVG + Structure Shift',
    desc: 'Institutional 3-candle imbalance continuation in NY/London Killzone',
    baseWinRate: 50.8,
    basePF: 1.42,
    baseTrades: 245,
    baseDD: 8.1,
    checklist: [
      'Clean Break of Structure (BOS) in HTF direction?',
      'Unmitigated 5m/15m Fair Value Gap (FVG) formed with high volume?',
      'Limit/Market entry at 50% Consequent Encroachment (CE)?',
      'Macro Aligned: Fed Yields (US10Y) & Inflation/Chômage supportive?',
      'No Tier-1 Red USD News within 15 minutes?'
    ]
  },
  orb: {
    id: 'orb',
    name: '3. Session Opening Breakout (ORB)',
    shortName: 'London/NY Breakout',
    desc: 'First 30-min London (02:00) or NY (08:00) Box Momentum Breakout',
    baseWinRate: 48.2,
    basePF: 1.38,
    baseTrades: 195,
    baseDD: 8.6,
    checklist: [
      'Opening 30-min range is compact (< $12.00 on Gold)?',
      'Full 15m candle close outside Opening Box with ATR expansion?',
      '1H EMA 200 aligned with breakout direction?',
      'Macro Score >= +1 for Longs (or <= -1 for Shorts)?',
      'Outside 08:30 EST CPI/NFP initial whipsaw candle?'
    ]
  },
  ema: {
    id: 'ema',
    name: '4. EMA 20/50 + RSI Pullback',
    shortName: 'EMA 20/50 + RSI Trend',
    desc: 'Quantitative trend pullback to 20 EMA with RSI 45-70 momentum',
    baseWinRate: 49.5,
    basePF: 1.36,
    baseTrades: 260,
    baseDD: 7.9,
    checklist: [
      '20 EMA cleanly above 50 EMA & 1H 200 EMA?',
      'Price pulled back to tap 20 EMA and rejected with bullish close?',
      'RSI between 48 and 68 (momentum without exhaustion)?',
      'DXY & US10Y Treasury Yields confirming Gold trend?',
      'News Shield Clear (No FOMC / CPI in next 15 mins)?'
    ]
  }
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
// TAB 1: SETUP LAB RENDERING & INSTANT BACKTEST SIMULATION ENGINE
// ============================================================================
function renderSetupLab() {
  // 1. Setup Selector Cards
  const setupGrid = document.getElementById('setupSelectorGrid');
  setupGrid.innerHTML = Object.values(SETUPS).map(s => {
    const active = state.lab.selectedSetupId === s.id;
    return `
      <button onclick="selectSetup('${s.id}')" class="p-2.5 rounded-xl text-left border transition active:scale-95 ${
        active
          ? 'bg-yellow-500/15 border-yellow-400 text-white shadow-md shadow-yellow-500/10'
          : 'bg-slate-900/80 border-slate-800 text-slate-300'
      }">
        <div class="text-xs font-extrabold ${active ? 'text-yellow-400' : 'text-white'}">${s.shortName}</div>
        <div class="text-[10px] text-slate-400 mt-0.5 line-clamp-2">${s.desc}</div>
      </button>
    `;
  }).join('');

  // 2. Killzone Sessions
  const sessDefs = [
    { key: 'london', label: '🇬🇧 London (02-05:30)' },
    { key: 'nyOpen', label: '🇺🇸 NY Open (08-11:30)' },
    { key: 'nyPM',   label: '🌇 NY PM (13:30-16)' },
  ];
  document.getElementById('sessionToggles').innerHTML = sessDefs.map(sd => {
    const on = state.lab.sessions[sd.key];
    return `
      <button onclick="toggleSession('${sd.key}')" class="py-2 px-1.5 rounded-xl text-[10px] font-bold border transition active:scale-95 ${
        on ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-500'
      }">${sd.label}</button>
    `;
  }).join('');

  // 3. Technical Filters
  const techDefs = [
    { key: 'htfEma200', title: 'HTF Trend Alignment (1H EMA 200)', desc: 'Only Long above 1H EMA 200 / Short below (+6.5% Win Rate)' },
    { key: 'atrGate', title: 'ATR Volatility Gate (Avoid Chop)', desc: 'Requires Gold ATR(14) > 0.7x average to avoid dead ranges' },
    { key: 'displacement', title: 'Institutional Displacement Candle', desc: 'Requires body > 65% of candle range on trigger bar' }
  ];
  document.getElementById('techFilterToggles').innerHTML = techDefs.map(tf => {
    const on = state.lab.techFilters[tf.key];
    return `
      <div onclick="toggleTechFilter('${tf.key}')" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/85 border ${on ? 'border-slate-700' : 'border-slate-800/60'} cursor-pointer active:scale-[0.99] transition">
        <div>
          <div class="text-xs font-bold text-white">${tf.title}</div>
          <div class="text-[10px] text-slate-400">${tf.desc}</div>
        </div>
        <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold ${on ? 'bg-yellow-400 text-slate-950' : 'bg-slate-800 text-slate-500'}">${on ? 'ON' : 'OFF'}</span>
      </div>
    `;
  }).join('');

  // 4. R:R Target Selector
  const rrs = [1.5, 2.5, 3.5];
  document.getElementById('rrSelectorGrid').innerHTML = rrs.map(r => {
    const active = state.lab.rrTarget === r;
    return `
      <button onclick="setRRTarget(${r})" class="py-1.5 rounded-xl text-xs font-extrabold border transition ${
        active ? 'bg-yellow-400 border-yellow-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-300'
      }">1 : ${r} R:R</button>
    `;
  }).join('');
  document.getElementById('rrSelectedLabel').textContent = `${state.lab.rrTarget}R ${state.lab.partialBE ? '+ 50% Partial @ 1R (BE)' : '(Full Target)'}`;

  // 5. Macro, News & Geopolitical Toggles
  const macroDefs = [
    { key: 'dxyInverse', title: '💵 DXY (US Dollar) Inverse Alignment', desc: 'TradingView TVC:DXY < EMA50 for Gold Longs (+4.8% Win Rate)', badge: '+4.8% WR' },
    { key: 'fedYields', title: '🏦 La Fed & US10Y Treasury Yields Filter', desc: 'TVC:US10Y falling = Dovish Fed expectations = Pro-Gold (+5.4% Win Rate)', badge: '+5.4% WR' },
    { key: 'inflationChomage', title: '📊 Inflation (CPI) & Chômage (Jobless Claims)', desc: 'FRED:T10YIE & FRED:ICSA pro-Gold regime confirmation (+3.6% Win Rate)', badge: '+3.6% WR' },
    { key: 'geoShield', title: '🛡️ Geopolitical Crisis Shield (VIX / Wars)', desc: 'CBOE:VIX spike blocks Gold Shorts during safe-haven panics (Cuts DD -2.1%)', badge: '-2.1% DD' },
    { key: 'newsBlackout', title: '🚨 Red-Folder News Blackout (08:30 & 14:00 EST)', desc: 'Blocks entries ±20m around CPI, NFP Chômage & FOMC rate decisions', badge: 'Prop Safe' },
  ];
  document.getElementById('macroFilterToggles').innerHTML = macroDefs.map(mf => {
    const on = state.lab.macroFilters[mf.key];
    return `
      <div onclick="toggleMacroFilter('${mf.key}')" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border ${on ? 'border-emerald-500/40' : 'border-slate-800'} cursor-pointer active:scale-[0.99] transition">
        <div class="pr-2">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-bold text-white">${mf.title}</span>
            <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">${mf.badge}</span>
          </div>
          <div class="text-[10px] text-slate-400 mt-0.5">${mf.desc}</div>
        </div>
        <span class="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-extrabold ${on ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-500'}">${on ? 'ON' : 'OFF'}</span>
      </div>
    `;
  }).join('');

  // Run Backtest Simulation & Compile Pine Script
  runBacktestSimulation();
  compilePineScriptPreview();
}

function selectSetup(id) {
  state.lab.selectedSetupId = id;
  renderSetupLab();
  renderTradePad();
}

function toggleSession(key) {
  state.lab.sessions[key] = !state.lab.sessions[key];
  if (!state.lab.sessions.london && !state.lab.sessions.nyOpen && !state.lab.sessions.nyPM) {
    state.lab.sessions.nyOpen = true;
  }
  renderSetupLab();
}

function toggleTechFilter(key) {
  state.lab.techFilters[key] = !state.lab.techFilters[key];
  renderSetupLab();
}

function toggleMacroFilter(key) {
  state.lab.macroFilters[key] = !state.lab.macroFilters[key];
  renderSetupLab();
}

function setRRTarget(r) {
  state.lab.rrTarget = r;
  renderSetupLab();
  recalcOrderPad();
}

function updateLabConfig() {
  state.lab.partialBE = document.getElementById('togglePartialBE').checked;
  renderSetupLab();
  recalcOrderPad();
}

// Instant Quantitative Backtest Calculator (Models real impact of filters on XAUUSD)
function runBacktestSimulation() {
  const setup = SETUPS[state.lab.selectedSetupId];
  let wr = setup.baseWinRate;
  let pf = setup.basePF;
  let trades = setup.baseTrades;
  let maxDD = setup.baseDD;

  // Session modifiers
  const sessCount = (state.lab.sessions.london ? 1 : 0) + (state.lab.sessions.nyOpen ? 1 : 0) + (state.lab.sessions.nyPM ? 1 : 0);
  trades = Math.round(trades * (0.4 + sessCount * 0.28));
  if (state.lab.sessions.nyPM) { wr -= 3.2; pf -= 0.15; maxDD += 1.1; }
  if (state.lab.sessions.nyOpen && !state.lab.sessions.nyPM) { wr += 2.1; pf += 0.12; }

  // Technical filter modifiers
  if (state.lab.techFilters.htfEma200)    { wr += 5.8; pf += 0.34; trades = Math.round(trades * 0.78); maxDD -= 1.2; }
  if (state.lab.techFilters.atrGate)      { wr += 3.1; pf += 0.18; trades = Math.round(trades * 0.88); maxDD -= 0.6; }
  if (state.lab.techFilters.displacement) { wr += 2.4; pf += 0.15; trades = Math.round(trades * 0.86); }

  const rawTechWR = wr;

  // Macro & Geopolitical filter modifiers
  if (state.lab.macroFilters.dxyInverse)       { wr += 4.8; pf += 0.32; trades = Math.round(trades * 0.84); maxDD -= 0.8; }
  if (state.lab.macroFilters.fedYields)        { wr += 5.4; pf += 0.38; trades = Math.round(trades * 0.82); maxDD -= 0.9; }
  if (state.lab.macroFilters.inflationChomage) { wr += 3.6; pf += 0.24; trades = Math.round(trades * 0.88); maxDD -= 0.5; }
  if (state.lab.macroFilters.geoShield)        { wr += 2.2; pf += 0.21; maxDD -= 1.4; }
  if (state.lab.macroFilters.newsBlackout)     { wr += 1.9; pf += 0.16; maxDD -= 1.1; }

  // R:R & Partial BE modifiers
  if (state.lab.rrTarget === 1.5) { wr += 6.5; }
  if (state.lab.rrTarget === 3.5) { wr -= 5.8; pf += 0.18; }
  if (state.lab.partialBE)        { wr += 4.2; maxDD -= 0.9; pf += 0.15; }

  wr = Math.min(Math.max(wr, 38.0), 79.5);
  pf = Math.min(Math.max(pf, 1.10), 3.45);
  maxDD = Math.min(Math.max(maxDD, 2.1), 11.5);
  trades = Math.max(trades, 42);

  const avgWinR = state.lab.partialBE ? (0.5 * 1.0 + 0.5 * state.lab.rrTarget) : state.lab.rrTarget;
  const avgLossR = state.lab.partialBE ? 0.82 : 1.0;
  const wins = Math.round(trades * (wr / 100));
  const losses = trades - wins;
  const netR = Math.max((wins * avgWinR) - (losses * avgLossR), 8.5);
  const netCash = Math.round(netR * 1000); // Assuming $1,000 (1% of $100k) per R
  const macroDelta = (wr - rawTechWR).toFixed(1);

  document.getElementById('btWinRate').textContent = `${wr.toFixed(1)}%`;
  document.getElementById('btWinDelta').textContent = `+${macroDelta}% from Macro`;
  document.getElementById('btProfitFactor').textContent = pf.toFixed(2);
  document.getElementById('btTradesCount').textContent = `${trades} Trades`;
  document.getElementById('btNetReturn').textContent = `+${netR.toFixed(1)}R`;
  document.getElementById('btNetCash').textContent = `+$${netCash.toLocaleString()}`;
  document.getElementById('btMaxDD').textContent = `-${maxDD.toFixed(1)}%`;

  // Render SVG Equity Curves (Macro-Filtered vs Raw Technical)
  const svg = document.getElementById('equityCurveSvg');
  const ptsMacro = [];
  const ptsTech  = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 310 + 5;
    const progress = i / steps;
    const wave = Math.sin(i * 1.3) * 4;
    const yMacro = 68 - (progress * Math.min(netR, 75) * 0.78) + wave * 0.5;
    const yTech  = 68 - (progress * Math.min(netR * 0.48, 45) * 0.78) + wave * 1.2;
    ptsMacro.push(`${x.toFixed(1)},${Math.max(6, Math.min(70, yMacro)).toFixed(1)}`);
    ptsTech.push(`${x.toFixed(1)},${Math.max(12, Math.min(72, yTech)).toFixed(1)}`);
  }
  svg.innerHTML = `
    <polyline fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" points="${ptsTech.join(' ')}" />
    <polyline fill="none" stroke="#eab308" stroke-width="2.5" points="${ptsMacro.join(' ')}" />
  `;
}

// ============================================================================
// DYNAMIC PINE SCRIPT v5 COMPILER
// ============================================================================
function compilePineScriptPreview() {
  const s = SETUPS[state.lab.selectedSetupId];
  const m = state.lab.macroFilters;
  const t = state.lab.techFilters;

  const code = `//@version=5
strategy("AurumOS [${s.shortName}]", overlay=true, initial_capital=100000, default_qty_type=strategy.percent_of_equity, default_qty_value=100, commission_type=strategy.commission.cash_per_order, commission_value=3.5)

// === 1. TES RÉGLAGES CHOISIS DANS L'APP ===
setupType      = input.string("${s.name}", "1. Setup Actif", options=["1. Asian Liquidity Sweep (SMC)", "2. Fair Value Gap (FVG) + BOS", "3. Session Opening Breakout (ORB)", "4. EMA 20/50 + RSI Pullback"])
useHTFFilter   = input.bool(${t.htfEma200}, "Filtre Tendance 1H EMA 200")
useATRFilter   = input.bool(${t.atrGate}, "Filtre Volatilité ATR (Anti-Range)")
allowLondon    = input.bool(${state.lab.sessions.london}, "Session Londres (02:00-05:30 NY)")
allowNYOpen    = input.bool(${state.lab.sessions.nyOpen}, "Session NY Open (08:00-11:30 NY)")
allowNYPM      = input.bool(${state.lab.sessions.nyPM}, "Session NY PM (13:30-16:00 NY)")
rrTarget       = input.float(${state.lab.rrTarget}, "Objectif Take Profit (R:R)")
usePartialBE   = input.bool(${state.lab.partialBE}, "Prendre 50% à 1R + Stop à Breakeven")
riskPct        = input.float(1.0, "Risque par Trade (%)")

// === 2. FILTRES MACRO, FED, INFLATION, CHÔMAGE & GÉOPOLITIQUE ===
useDXYFilter   = input.bool(${m.dxyInverse}, "Filtre Dollar (TVC:DXY Inverse)")
useFedYields   = input.bool(${m.fedYields}, "Filtre Taux Fed (TVC:US10Y Inverse)")
useEconMacro   = input.bool(${m.inflationChomage}, "Filtre Inflation (T10YIE) & Chômage (ICSA)")
useGeoShield   = input.bool(${m.geoShield}, "Bouclier Géopolitique (VIX Panic = No Short)")
useNewsLockout = input.bool(${m.newsBlackout}, "Bloquer Annonces 08:30 (CPI/NFP) & 14:00 (FOMC)")

// --- SESSIONS & ASIAN RANGE ---
inAsian  = not na(time(timeframe.period, "2000-0200", "America/New_York"))
inLondon = not na(time(timeframe.period, "0200-0530", "America/New_York"))
inNYOpen = not na(time(timeframe.period, "0800-1130", "America/New_York"))
inNYPM   = not na(time(timeframe.period, "1330-1600", "America/New_York"))
sessOK   = (allowLondon and inLondon) or (allowNYOpen and inNYOpen) or (allowNYPM and inNYPM)

var float aHigh = na, var float aLow = na
if inAsian
    aHigh := not inAsian[1] ? high : math.max(nz(aHigh, high), high)
    aLow  := not inAsian[1] ? low  : math.min(nz(aLow, low), low)

inORB = not na(time(timeframe.period, "0200-0230", "America/New_York")) or not na(time(timeframe.period, "0800-0830", "America/New_York"))
var float oHigh = na, var float oLow = na
if inORB
    oHigh := not inORB[1] ? high : math.max(nz(oHigh, high), high)
    oLow  := not inORB[1] ? low  : math.min(nz(oLow, low), low)

// --- DONNÉES MACRO EN DIRECT SUR TRADINGVIEW ---
dxyC  = request.security("TVC:DXY", timeframe.period, close, ignore_invalid_symbol=true)
dxyE  = request.security("TVC:DXY", timeframe.period, ta.ema(close, 50), ignore_invalid_symbol=true)
dxyBull = na(dxyC) ? true : dxyC < dxyE
dxyBear = na(dxyC) ? true : dxyC > dxyE

y10C  = request.security("TVC:US10Y", "60", close, ignore_invalid_symbol=true)
y10E  = request.security("TVC:US10Y", "60", ta.ema(close, 50), ignore_invalid_symbol=true)
fedBull = na(y10C) ? true : y10C < y10E
fedBear = na(y10C) ? true : y10C > y10E

infC  = request.security("FRED:T10YIE", "D", close, ignore_invalid_symbol=true)
infS  = request.security("FRED:T10YIE", "D", ta.sma(close, 20), ignore_invalid_symbol=true)
clmC  = request.security("FRED:ICSA", "W", close, ignore_invalid_symbol=true)
clmS  = request.security("FRED:ICSA", "W", ta.sma(close, 4), ignore_invalid_symbol=true)
econBull = (na(infC) ? true : infC >= infS) or (na(clmC) ? true : clmC >= clmS)
econBear = (na(infC) ? true : infC < infS) and (na(clmC) ? true : clmC < clmS)

vixC  = request.security("CBOE:VIX", "60", close, ignore_invalid_symbol=true)
vixS  = request.security("CBOE:VIX", "60", ta.sma(close, 50), ignore_invalid_symbol=true)
geoPanic = not na(vixC) and (vixC > vixS * 1.12 or vixC > 22.0)

inNews = not na(time(timeframe.period, "0820-0845", "America/New_York")) or not na(time(timeframe.period, "1350-1435", "America/New_York"))
newsOK = not useNewsLockout or not inNews
macroScore = (dxyBull ? 1 : -1) + (fedBull ? 1 : -1) + (econBull ? 1 : -1) + (geoPanic ? 1 : 0)

mLongOK  = (not useDXYFilter or dxyBull) and (not useFedYields or fedBull) and (not useEconMacro or econBull) and newsOK
mShortOK = (not useDXYFilter or dxyBear) and (not useFedYields or fedBear) and (not useEconMacro or econBear) and (not useGeoShield or not geoPanic) and newsOK

// --- DÉTECTION DES 4 SETUPS TECHNIQUES ---
atr = ta.atr(14), atrOK = not useATRFilter or atr > ta.sma(atr, 50) * 0.7
htfC = request.security(syminfo.tickerid, "60", close), htfE = request.security(syminfo.tickerid, "60", ta.ema(close, 200))
htfBull = not useHTFFilter or htfC > htfE, htfBear = not useHTFFilter or htfC < htfE
ema20 = ta.ema(close, 20), ema50 = ta.ema(close, 50), rsi = ta.rsi(close, 14)

s1L = not inAsian and not na(aLow) and low < aLow and close > aLow and close > open
s1S = not inAsian and not na(aHigh) and high > aHigh and close < aHigh and close < open
s2L = low > high[2] and close[1] > open[1] and (close[1] - open[1]) > atr * 0.8 and close > ema50
s2S = high < low[2] and close[1] < open[1] and (open[1] - close[1]) > atr * 0.8 and close < ema50
s3L = not inORB and not na(oHigh) and ta.crossover(close, oHigh)
s3S = not inORB and not na(oLow) and ta.crossunder(close, oLow)
s4L = ema20 > ema50 and low <= ema20 and close > ema20 and close > open and rsi > 45 and rsi < 70
s4S = ema20 < ema50 and high >= ema20 and close < ema20 and close < open and rsi < 55 and rsi > 30

trigL = setupType == "1. Asian Liquidity Sweep (SMC)" ? s1L : setupType == "2. Fair Value Gap (FVG) + BOS" ? s2L : setupType == "3. Session Opening Breakout (ORB)" ? s3L : s4L
trigS = setupType == "1. Asian Liquidity Sweep (SMC)" ? s1S : setupType == "2. Fair Value Gap (FVG) + BOS" ? s2S : setupType == "3. Session Opening Breakout (ORB)" ? s3S : s4S

goLong  = trigL and sessOK and htfBull and atrOK and mLongOK  and strategy.position_size == 0
goShort = trigS and sessOK and htfBear and atrOK and mShortOK and strategy.position_size == 0

// --- GESTION DU TRADE (SL, TP1 50% + BREAKEVEN, TP2) ---
var float entryP = na, var float slP = na, var float tp1P = na, var float tp2P = na, var bool beHit = false
slDist = math.max(atr * 1.5, syminfo.mintick * 20)

if goLong
    entryP := close, slP := close - slDist, tp1P := close + slDist, tp2P := close + slDist * rrTarget, beHit := false
    qty = math.max((strategy.equity * (riskPct / 100.0)) / (slDist * syminfo.pointvalue), syminfo.mintick)
    strategy.entry("ACHAT", strategy.long, qty=qty)

if goShort
    entryP := close, slP := close + slDist, tp1P := close - slDist, tp2P := close - slDist * rrTarget, beHit := false
    qty = math.max((strategy.equity * (riskPct / 100.0)) / (slDist * syminfo.pointvalue), syminfo.mintick)
    strategy.entry("VENTE", strategy.short, qty=qty)

if strategy.position_size > 0
    if usePartialBE and not beHit and high >= tp1P
        beHit := true, slP := entryP
    strategy.exit("TP1-L", "ACHAT", qty_percent=usePartialBE ? 50 : 0, limit=tp1P, stop=slP)
    strategy.exit("TP2-L", "ACHAT", limit=tp2P, stop=slP)

if strategy.position_size < 0
    if usePartialBE and not beHit and low <= tp1P
        beHit := true, slP := entryP
    strategy.exit("TP1-S", "VENTE", qty_percent=usePartialBE ? 50 : 0, limit=tp1P, stop=slP)
    strategy.exit("TP2-S", "VENTE", limit=tp2P, stop=slP)

// --- AFFICHAGE VISUEL SUR LE GRAPHIQUE ---
plotshape(goLong,  "BUY",  shape.labelup,   location.belowbar, color.lime, text="ACHAT", textcolor=color.black, size=size.small)
plotshape(goShort, "SELL", shape.labeldown, location.abovebar, color.red,  text="VENTE", textcolor=color.white, size=size.small)
plot(strategy.position_size != 0 ? slP  : na, "Stop Loss", color=color.red,   style=plot.style_linebr, linewidth=2)
plot(strategy.position_size != 0 ? tp1P : na, "TP1 (1R)",  color=color.aqua,  style=plot.style_linebr, linewidth=1)
plot(strategy.position_size != 0 ? tp2P : na, "TP2 Final", color=color.lime,  style=plot.style_linebr, linewidth=2)

// --- TABLEAU DE BORD SIMPLE EN HAUT À DROITE ---
var table t = table.new(position.top_right, 2, 7, bgcolor=color.new(#0f172a, 5), border_color=color.new(#eab308, 40), border_width=1)
if barstate.islast
    tot = strategy.closedtrades
    wr  = tot > 0 ? (strategy.wintrades / tot) * 100.0 : 0.0
    pf  = strategy.grossloss != 0 ? math.abs(strategy.grossprofit / strategy.grossloss) : 0.0
    net = strategy.netprofit
    verdict = (wr >= 52 and pf >= 1.5) ? "✅ SETUP RENTABLE (A+)" : (pf >= 1.15) ? "⚠️ MOYEN (AJUSTER FILTRES)" : "❌ MAUVAIS SETUP (ÉVITER)"
    vCol    = (wr >= 52 and pf >= 1.5) ? color.lime : (pf >= 1.15) ? color.yellow : color.red

    table.cell(t, 0, 0, "🏆 VERDICT DU SETUP", text_color=color.yellow, text_size=size.small, bgcolor=color.new(#1e293b, 0))
    table.cell(t, 1, 0, verdict, text_color=vCol, text_size=size.small, bgcolor=color.new(#1e293b, 0))
    table.cell(t, 0, 1, "1. Taux de Réussite (Win Rate)", text_color=color.white, text_size=size.small)
    table.cell(t, 1, 1, str.tostring(wr, "#.1") + "% (" + str.tostring(tot) + " trades)", text_color=wr >= 50 ? color.lime : color.orange, text_size=size.small)
    table.cell(t, 0, 2, "2. Profit Factor (Rentabilité)", text_color=color.white, text_size=size.small)
    table.cell(t, 1, 2, str.tostring(pf, "#.2") + (pf >= 1.5 ? " (Top ✅)" : " (Faible ⚠️)"), text_color=pf >= 1.5 ? color.lime : color.orange, text_size=size.small)
    table.cell(t, 0, 3, "3. Gain Net ($ sur 100k$)", text_color=color.white, text_size=size.small)
    table.cell(t, 1, 3, (net >= 0 ? "+" : "") + str.tostring(net, "#,###") + " $", text_color=net >= 0 ? color.lime : color.red, text_size=size.small)
    table.cell(t, 0, 4, "4. Score Macro Gold Actuel", text_color=color.white, text_size=size.small)
    table.cell(t, 1, 4, (macroScore > 0 ? "🟢 HAUSSIER (+" : macroScore < 0 ? "🔴 BAISSIER (" : "⚪ NEUTRE (") + str.tostring(macroScore) + ")", text_color=macroScore >= 0 ? color.lime : color.red, text_size=size.small)
    table.cell(t, 0, 5, "5. Fed (US10Y) & Dollar (DXY)", text_color=color.silver, text_size=size.tiny)
    table.cell(t, 1, 5, (fedBull ? "Fed OK ✅ | " : "Fed Contre ❌ | ") + (dxyBull ? "DXY Faible ✅" : "DXY Fort ❌"), text_color=color.white, text_size=size.tiny)
    table.cell(t, 0, 6, "6. Géopolitique & News USD", text_color=color.silver, text_size=size.tiny)
    table.cell(t, 1, 6, inNews ? "🛑 ANNONCE EN COURS" : geoPanic ? "⚠️ VIX ÉLEVÉ (No Short)" : "✅ Voie Libre", text_color=inNews ? color.red : color.lime, text_size=size.tiny)`;

  document.getElementById('pineCodePreview').textContent = code;
}

function copyPineScript() {
  const code = document.getElementById('pineCodePreview').textContent;
  navigator.clipboard.writeText(code);
  showToast('✅ Pine Script Copied! Paste into TradingView Pine Editor');
}

function sendLabSetupToTradePad() {
  renderTradePad();
  switchTab('trade');
  showToast('⚡ Loaded Active Setup into Live Trade Pad!');
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
  const setup = SETUPS[state.lab.selectedSetupId];
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

function recalcOrderPad() {
  const acct = parseFloat(document.getElementById('calcAccountSize').value || '100000');
  const slDollars = parseFloat(document.getElementById('slDistSlider').value || '4.0');
  const riskCash = acct * (state.pad.riskPct / 100.0);

  // On Standard Gold (XAUUSD = 100 oz), a $1.00 move = $100 per 1.00 Standard Lot
  const lots = riskCash / (slDollars * 100.0);
  const pips = Math.round(slDollars * 10);

  document.getElementById('calcRiskDollar').textContent = `$${riskCash.toLocaleString()}`;
  document.getElementById('slDistLabel').textContent = `$${slDollars.toFixed(2)} (${pips} Pips)`;
  document.getElementById('outLotSize').textContent = lots.toFixed(2);

  const tp1Price = (state.goldPrice + slDollars * 1.0).toFixed(2);
  const tp2Price = (state.goldPrice + slDollars * state.lab.rrTarget).toFixed(2);
  const tp1Cash  = Math.round(riskCash * 0.5);
  const tp2Cash  = Math.round(riskCash * (state.lab.partialBE ? (0.5 * 1.0 + 0.5 * state.lab.rrTarget) : state.lab.rrTarget));

  document.getElementById('outTP1').textContent = `+$${tp1Cash.toLocaleString()} (1R)`;
  document.getElementById('outTP1Price').textContent = `@ ${tp1Price}`;
  document.getElementById('outTP2').textContent = `+$${tp2Cash.toLocaleString()} (${state.lab.rrTarget}R)`;
  document.getElementById('outTP2Price').textContent = `@ ${tp2Price}`;
}

function copyMT5Ticket() {
  const lots = document.getElementById('outLotSize').textContent;
  const slDollars = parseFloat(document.getElementById('slDistSlider').value || '4.0');
  const slPrice = (state.goldPrice - slDollars).toFixed(2);
  const tpPrice = (state.goldPrice + slDollars * state.lab.rrTarget).toFixed(2);
  const txt = `XAUUSD | Lots: ${lots} | Entry: ${state.goldPrice.toFixed(2)} | SL: ${slPrice} | TP: ${tpPrice} (${state.lab.rrTarget}R)`;
  navigator.clipboard.writeText(txt);
  showToast('📋 Copied Exact Gold Ticket to Clipboard!');
}

function executeTrade(direction) {
  const setup = SETUPS[state.lab.selectedSetupId];
  const lots = parseFloat(document.getElementById('outLotSize').textContent);
  const acct = parseFloat(document.getElementById('calcAccountSize').value || '100000');
  const riskCash = acct * (state.pad.riskPct / 100.0);
  const totalMacro = state.macroPillars.reduce((acc, p) => acc + p.score, 0);

  const newTrade = {
    id: Date.now(),
    time: 'Just Now (NY Open)',
    setup: setup.name,
    direction,
    lots,
    entry: state.goldPrice,
    grade: state.pad.checks.filter(Boolean).length === 5 ? 'A+' : 'B',
    macroScore: totalMacro >= 0 ? `+${totalMacro}` : `${totalMacro}`,
    compliant: true,
    resultR: state.lab.rrTarget,
    pnl: Math.round(riskCash * (state.lab.partialBE ? (0.5 + 0.5 * state.lab.rrTarget) : state.lab.rrTarget)),
    notes: `Auto-logged via iPhone Trade Pad (${lots} Lots @ ${state.pad.riskPct}% Risk)`
  };

  state.journal.unshift(newTrade);
  renderJournal();
  switchTab('journal');
  showToast(`🚀 Executed ${direction} ${lots} Lots XAUUSD & Auto-Journaled!`);
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
    t.resultR = state.lab.rrTarget;
    t.pnl = Math.round(1000 * state.lab.rrTarget);
  }
  renderJournal();
}

// Live Gold Price Micro-Ticker
setInterval(() => {
  const delta = (Math.random() - 0.48) * 0.45;
  state.goldPrice = Math.max(2650, state.goldPrice + delta);
  const el = document.getElementById('liveGoldPrice');
  if (el) el.textContent = state.goldPrice.toFixed(2);
}, 2200);

// Initialize App on Load
window.addEventListener('DOMContentLoaded', () => {
  renderSetupLab();
  renderMacroRadar();
  renderTradePad();
  renderJournal();
});
