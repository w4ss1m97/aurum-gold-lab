// ============================================================================
// AURUM OS — HIGH-IMPACT USD NEWS CALENDAR (built-in schedule)
// FOMC decisions are the Fed's published dates. CPI / NFP are BLS release
// dates through 2025; 2026 dates are approximate (rule-based) and flagged.
// Times are New York time, converted to UTC with US daylight-saving rules.
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});

  const FOMC = {
    2024: ['01-31', '03-20', '05-01', '06-12', '07-31', '09-18', '11-07', '12-18'],
    2025: ['01-29', '03-19', '05-07', '06-18', '07-30', '09-17', '10-29', '12-10'],
    2026: ['01-28', '03-18', '04-29', '06-17', '07-29', '09-16', '10-28', '12-09'],
  };
  const CPI = {
    2024: ['01-11', '02-13', '03-12', '04-10', '05-15', '06-12', '07-11', '08-14', '09-11', '10-10', '11-13', '12-11'],
    2025: ['01-15', '02-12', '03-12', '04-10', '05-13', '06-11', '07-15', '08-12', '09-11', '10-24', '12-18'],
  };
  const CPI_APPROX = {
    2026: ['01-13', '02-11', '03-11', '04-10', '05-12', '06-10', '07-14', '08-12', '09-11', '10-14', '11-12', '12-10'],
  };
  const NFP = {
    2024: ['01-05', '02-02', '03-08', '04-05', '05-03', '06-07', '07-05', '08-02', '09-06', '10-04', '11-01', '12-06'],
    2025: ['01-10', '02-07', '03-07', '04-04', '05-02', '06-06', '07-03', '08-01', '09-05', '11-20', '12-16'],
  };

  // US DST: 2nd Sunday of March -> 1st Sunday of November.
  function nthSunday(y, month, n) {
    const d = new Date(Date.UTC(y, month, 1));
    const first = (7 - d.getUTCDay()) % 7 + 1;
    return first + 7 * (n - 1);
  }
  function etToUtc(y, m, d, hh, mm) {
    const dstStart = Date.UTC(y, 2, nthSunday(y, 2, 2), 7);
    const dstEnd = Date.UTC(y, 10, nthSunday(y, 10, 1), 6);
    const naive = Date.UTC(y, m - 1, d, hh, mm);
    const offsetH = naive + 5 * 3600e3 >= dstStart && naive + 4 * 3600e3 < dstEnd ? 4 : 5;
    return naive + offsetH * 3600e3;
  }
  function firstFriday(y, m) {
    const d = new Date(Date.UTC(y, m - 1, 1));
    return 1 + ((5 - d.getUTCDay() + 7) % 7);
  }

  let cache = null;
  function events() {
    if (cache) return cache;
    const out = [];
    const add = (table, title, hh, mm, approx) => {
      for (const y of Object.keys(table)) for (const md of table[y]) {
        const [m, d] = md.split('-').map(Number);
        out.push({ t: etToUtc(+y, m, d, hh, mm), title, approx: !!approx });
      }
    };
    add(FOMC, 'FOMC rate decision', 14, 0);
    add(CPI, 'US CPI (inflation)', 8, 30);
    add(CPI_APPROX, 'US CPI (inflation)', 8, 30, true);
    add(NFP, 'US NFP (jobs / chômage)', 8, 30);
    for (let m = 1; m <= 12; m++) {
      out.push({ t: etToUtc(2026, m, firstFriday(2026, m), 8, 30), title: 'US NFP (jobs / chômage)', approx: true });
    }
    out.sort((a, b) => a.t - b.t);
    cache = out;
    return out;
  }

  // Events with time in [from, to].
  function between(from, to) {
    return events().filter((e) => e.t >= from && e.t <= to);
  }

  A.news = { events, between };
})(typeof window !== 'undefined' ? window : globalThis);
