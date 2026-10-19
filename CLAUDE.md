# CLAUDE.md — AurumOS (Gold & Silver Pine Lab)

## Goal
iPhone PWA (static HTML + vanilla JS + Tailwind CDN) for trading gold/silver with Firas Abdelmalek's methods
(CRT, hidden divergence + OTE, double top, OTE + SMT). Its main tool generates TradingView Pine scripts to backtest manually.

## Commands
- Run locally: `python3 -m http.server 8765` (config in `.claude/launch.json`), open http://localhost:8765
- Syntax check: `node --check app.js && for f in js/*.js; do node --check $f; done`
- Deploy: push to `main` (a friend uses the deployed app remotely — don't push untested changes)

## Hard rules
- `public/` mirrors the root: after editing `index.html`, `app.js` or `js/*.js`, copy into `public/`
  (`public/index.html` uses absolute paths `/js/…`, `/app.js`) and bump the `?v=N` cache-buster in both.
- Pine generator changes (`js/pine.js`): test in TradingView first by pushing to a temporary branch,
  then merge to `main`. Keep detection off during warm-up and array reads bounds-safe (RE10045).
- Trades come only from the method rules; news (FOMC/CPI/NFP) is a hint only, never an entry filter.
- No API keys or secrets in the repo (Twelve Data was removed on purpose).

## Where things are
- `app.js` — UI (Pine Lab, Macro, Trade Pad, Journal); `js/pine.js` — Pine generator;
  `js/strategies.js` — method rules; `js/news.js` — news calendar (2026 CPI/NFP dates ≈ estimated);
  `js/markets.js` — gold/silver specs.
- Unused for now (in-app backtest engine, not loaded): `js/backtest.js`, `js/analysis.js`, `js/data.js`.
- Docs: `docs/01…04_*.md` (product/market background, read only if needed).
- Session notes: `.claude/session-notes.md` (read first, update at the end of each task)

## Conventions
- UI in English with French method terms; Pine scripts in French. Commits: imperative summary + bullet details.
