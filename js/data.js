// ============================================================================
// AURUM OS — MARKET DATA (Twelve Data API + IndexedDB cache)
// Free plan: 8 requests/minute, 800/day, max 5000 bars per request.
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});

  // Markets and timeframes live in js/markets.js (load it first).
  const MARKETS = A.MARKETS;
  const TIMEFRAMES = A.TIMEFRAMES;
  const MIN = 60 * 1000;

  const PAGE = 5000;
  const KEY_STORAGE = 'aurum.twelvedata.key';
  const CACHE_MAX_AGE = 30 * MIN;

  function getApiKey() {
    try { return localStorage.getItem(KEY_STORAGE) || ''; } catch (e) { return ''; }
  }
  function setApiKey(k) {
    try { localStorage.setItem(KEY_STORAGE, (k || '').trim()); } catch (e) { /* private mode */ }
  }

  // ---------- IndexedDB cache ----------
  let dbPromise = null;
  function db() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open('aurum-market', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('series');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch (e) { resolve(null); }
    });
    return dbPromise;
  }
  async function cacheGet(key) {
    const d = await db();
    if (!d) return null;
    return new Promise((resolve) => {
      const r = d.transaction('series').objectStore('series').get(key);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => resolve(null);
    });
  }
  async function cachePut(key, val) {
    const d = await db();
    if (!d) return;
    return new Promise((resolve) => {
      const tx = d.transaction('series', 'readwrite');
      tx.objectStore('series').put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // ---------- API ----------
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const fmtUTC = (ms) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ');
  const parseUTC = (s) => Date.parse(s.length <= 10 ? s + 'T00:00:00Z' : s.replace(' ', 'T') + 'Z');

  async function apiCall(params, onStatus) {
    const key = getApiKey();
    if (!key) throw new Error('NO_KEY');
    const qs = new URLSearchParams({ ...params, apikey: key, timezone: 'UTC', format: 'JSON' });
    for (let attempt = 0; attempt < 4; attempt++) {
      const res = await fetch(`https://api.twelvedata.com/time_series?${qs}`);
      const json = await res.json();
      if (json.status === 'ok') return json;
      if (json.code === 429) {
        // Per-minute limit hit: wait for the window to reset.
        for (let s = 62; s > 0; s--) { onStatus && onStatus(`API limit reached — waiting ${s}s…`); await sleep(1000); }
        continue;
      }
      if (json.code === 400 && /no data/i.test(json.message || '')) return { values: [] };
      throw new Error(json.message || `Twelve Data error ${json.code}`);
    }
    throw new Error('Twelve Data rate limit — try again in a minute');
  }

  // Fetch bars for [startMs, now], paging backwards 5000 bars at a time.
  async function fetchRange(market, tf, startMs, onStatus) {
    const all = new Map();
    let end = Date.now();
    let page = 0;
    while (true) {
      page++;
      onStatus && onStatus(`Downloading ${MARKETS[market].name} ${TIMEFRAMES[tf].label} — page ${page}…`);
      const json = await apiCall({
        symbol: MARKETS[market].apiSymbol,
        interval: TIMEFRAMES[tf].api,
        outputsize: PAGE,
        end_date: fmtUTC(end),
      }, onStatus);
      const vals = json.values || [];
      for (const v of vals) {
        const t = parseUTC(v.datetime);
        all.set(t, { t, o: +v.open, h: +v.high, l: +v.low, c: +v.close });
      }
      if (vals.length < PAGE) break;
      const oldest = Math.min(...vals.map((v) => parseUTC(v.datetime)));
      if (oldest <= startMs) break;
      end = oldest - 1000;
    }
    return [...all.values()].sort((a, b) => a.t - b.t);
  }

  function mergeBars(a, b) {
    const m = new Map();
    for (const x of a) m.set(x.t, x);
    for (const x of b) m.set(x.t, x);
    return [...m.values()].sort((p, q) => p.t - q.t);
  }

  // Returns bars covering at least [startMs, now]. Uses the cache when it is
  // fresh and only downloads the missing recent part when possible.
  async function getBars(market, tf, startMs, onStatus) {
    const key = `${market}|${tf}`;
    const cached = await cacheGet(key);
    const now = Date.now();
    if (cached && cached.bars.length && cached.bars[0].t <= startMs + TIMEFRAMES[tf].ms * 3) {
      if (now - cached.fetchedAt < CACHE_MAX_AGE) return cached.bars;
      const lastT = cached.bars[cached.bars.length - 1].t;
      const fresh = await fetchRange(market, tf, lastT, onStatus);
      const bars = mergeBars(cached.bars, fresh);
      await cachePut(key, { bars, fetchedAt: now });
      return bars;
    }
    const bars = await fetchRange(market, tf, startMs, onStatus);
    const merged = cached ? mergeBars(cached.bars, bars) : bars;
    await cachePut(key, { bars: merged, fetchedAt: now });
    return merged;
  }

  async function getPrice(market) {
    const key = getApiKey();
    if (!key) return null;
    const res = await fetch(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(MARKETS[market].apiSymbol)}&apikey=${key}`);
    const json = await res.json();
    return json.price ? parseFloat(json.price) : null;
  }

  async function clearCache() {
    const d = await db();
    if (!d) return;
    return new Promise((resolve) => {
      const tx = d.transaction('series', 'readwrite');
      tx.objectStore('series').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  A.data = { getApiKey, setApiKey, getBars, getPrice, clearCache };
})(typeof window !== 'undefined' ? window : globalThis);
