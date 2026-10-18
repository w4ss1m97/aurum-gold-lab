// ============================================================================
// AURUM OS — MARKETS & TIMEFRAMES
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});

  A.MARKETS = {
    XAU: { id: 'XAU', apiSymbol: 'XAU/USD', name: 'Gold', ticker: 'XAUUSD', contractOz: 100, spread: 0.30, decimals: 2, pair: 'XAG' },
    XAG: { id: 'XAG', apiSymbol: 'XAG/USD', name: 'Silver', ticker: 'XAGUSD', contractOz: 5000, spread: 0.03, decimals: 3, pair: 'XAU' },
  };

  const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;
  A.TIMEFRAMES = {
    M5:  { id: 'M5',  api: '5min',  ms: 5 * MIN,  label: '5m',    tv: '5' },
    M15: { id: 'M15', api: '15min', ms: 15 * MIN, label: '15m',   tv: '15' },
    H1:  { id: 'H1',  api: '1h',    ms: HOUR,     label: '1H',    tv: '60' },
    H4:  { id: 'H4',  api: '4h',    ms: 4 * HOUR, label: '4H',    tv: '240' },
    D1:  { id: 'D1',  api: '1day',  ms: DAY,      label: 'Daily', tv: 'D' },
  };
})(typeof window !== 'undefined' ? window : globalThis);
