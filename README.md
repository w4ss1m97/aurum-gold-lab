# AurumOS (GoldGuard) — The Gold & Prop-Firm Trading Co-Pilot

> **Tagline:** *Stop blowing accounts. Lock in your framework, size Gold (`XAUUSD`) in 1 second, shield against Red-Folder USD news, and auto-journal every trade from your iPhone.*

---

## 1. Executive Summary

Retail and prop-firm traders—especially those trading **Gold (`XAUUSD` / `GC`)**—suffer from a fatal workflow gap:
1. They chart on **TradingView**.
2. They execute manually on **MetaTrader 5 (MT5) / cTrader / TradeLocker** on their iPhone, guessing lot sizes under pressure.
3. They forget to check **ForexFactory** for Red-Folder USD news (CPI, NFP, FOMC) and get wiped out by slippage.
4. They break their own trading strategy rules due to FOMO or revenge trading.
5. They pay \$49/month for passive journals (**TradeZella**, **TraderSync**) that only tell them what went wrong *after* they already lost their \$100k Prop Firm account.

**AurumOS** is a **Mobile-First (iPhone) Execution, Risk Shield & Discipline SaaS** that sits between a trader's brain and their broker. It turns trading strategies into **configurable, interactive checklists that physically unlock the 1-Click Execution Pad**, automatically calculates exact `XAUUSD` lot sizes, enforces Prop-Firm drawdown/news lockouts, and writes the trading journal automatically at the moment of execution.

---

## 2. Repository Documentation Index

| Document | Description |
| :--- | :--- |
| [**01. Market & Competitor Analysis**](./docs/01_MARKET_AND_COMPETITORS.md) | Deep dive into competitors (`TradeZella`, `Magic Keys`, `TraderSync`, `MQL5 EAs`), pricing models, market gaps, and our SaaS monetization strategy. |
| [**02. Product Specification & Framework Engine**](./docs/02_PRODUCT_SPEC_AND_FRAMEWORKS.md) | Detailed breakdown of the 4 core pillars: Configurable Frameworks, `XAUUSD` 1-Click Lot Calculator & Order Pad, News/Drawdown Shield, and Auto-Journaling Analytics. |
| [**03. Technical Architecture & iPhone Implementation Plan**](./docs/03_TECHNICAL_ARCHITECTURE_AND_IPHONE_PLAN.md) | Mobile-first iPhone UI/UX blueprint, broker API integration (MT4/MT5/cTrader/TradeLocker), data feeds, database schema, and step-by-step build roadmap. |

---

## 3. The 4 Unfair Advantages

1. **"Unlock-to-Trade" Configurable Frameworks:** Traders build or select their setup (*ICT Silver Bullet*, *Asian Range Sweep*, *London Breakout*). The Buy/Sell slider stays locked until mandatory checklist rules and automated market conditions are met.
2. **1-Second `XAUUSD` Risk & Lot Calculator:** Handles broker-specific Gold contract specs (`100 oz` standard vs mini/micro), auto-calculates exact lot size from Entry-to-SL distance and `% Risk`, and sets automatic partial Take-Profits (`TP1`, `TP2`, Auto-Breakeven).
3. **Prop-Firm Account Shield (News + Tilt Lock):** Automatically disables execution 15 minutes before/after Tier-1 USD Red-Folder News and locks the app for the day if the user hits their daily drawdown limit (e.g., `-2.5%`) or max consecutive losses.
4. **Zero-Friction Auto-Journal:** Because the trader checks off their setup rules *before* executing, the trade is logged with 100% context (setup tag, rule compliance score, session, news context, R-multiple) with zero post-trade homework.
