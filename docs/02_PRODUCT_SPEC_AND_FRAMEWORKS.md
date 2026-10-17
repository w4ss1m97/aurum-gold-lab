# 02. Product Specification & Configurable Frameworks Engine

## 1. Core User Journey (The 15-Second iPhone Trade Workflow)

When a Gold trader spots a potential trade on their chart, they open **AurumOS** on their iPhone:

1. **Glance at Top Status Bar (2s):** Checks active Killzone session (`NY Open Active`), live `XAUUSD` price + `DXY` correlation badge, and verifies the **News Shield** is green (`No Red USD News for 2h 15m`).
2. **Select & Check Framework (5s):** Taps their strategy (e.g., `Gold NY Liquidity Sweep`). Checks off the 4 required confluence rules. The app automatically calculates a **Setup Grade (`A+`, `B`, or `Blocked`)**.
3. **Size & Slide to Execute (5s):** Sets Stop Loss distance (e.g., `35 pips / $3.50` on Gold) and Target (`2.5R`). The app displays the exact Lot Size (`1.43 Lots = $500 / 0.5% Risk`) and auto-configures `TP1 (50% off at 1.5R + Move SL to Breakeven)`. User slides **"Slide to Execute Long"**.
4. **Auto-Journaled (0s):** The trade is immediately logged with all checked rules, timestamp, session, news state, and R-multiple target.

---

## 2. Module-by-Module Functional Specifications

### Module 1: Configurable Trading Frameworks Engine ("Playbook OS")

Traders can create custom frameworks from scratch or clone pre-loaded **Gold Pro Templates**.

#### A. Pre-Loaded Gold (`XAUUSD`) Templates
1. **ICT NY Silver Bullet / Liquidity Sweep (10:00–11:00 AM EST)**
   * *Auto-Rule:* Current time within NY AM Session window.
   * *Manual Rules:*
     * [ ] Asian or London High/Low liquidity swept?
     * [ ] 5m/15m Displacement with Market Structure Shift (MSS)?
     * [ ] Entry inside Fair Value Gap (FVG) / Order Block?
     * [ ] `DXY` (US Dollar Index) showing inverse divergence?
2. **London Open Asian Range Breakout (03:00–05:30 AM EST)**
   * *Auto-Rule:* Asian range height `< $18.00` (not already exhausted).
   * *Manual Rules:*
     * [ ] Clean 15m candle close outside Asian Box?
     * [ ] H1 / H4 Trend aligned with breakout direction?
     * [ ] Minimum `1:2` Risk-to-Reward to next major liquidity pool?
3. **Gold Mean Reversion / VWAP Bounce**
   * *Manual Rules:*
     * [ ] Price tapped +/- 2nd Standard Deviation of Session VWAP?
     * [ ] HTF Key Support/Resistance level confluence?
     * [ ] Exhaustion wick + volume spike present?

#### B. Custom Framework Builder (User Configurable)
Every framework allows the trader to configure:
* **Name & Tag Color:** e.g., `"My A+ Gold Scalp"`
* **Allowed Instruments:** e.g., `XAUUSD`, `EURUSD`, `NAS100`
* **Allowed Trading Sessions:** Toggle `Asian`, `London`, `NY AM`, `NY PM`
* **Checklist Rules:**
  * **Mandatory Gatekeeper Rules:** Must be checked to unlock execution.
  * **Bonus Confluence Rules:** Increases Setup Grade from `B` to `A` or `A+`.
* **Dynamic Risk Scaling by Grade:**
  * `A+ Setup (100% score)` $\rightarrow$ Allow up to `1.0%` account risk.
  * `B Setup (75% score)` $\rightarrow$ Automatically cap risk at `0.5%` account risk.
  * `< 75% score` $\rightarrow$ **Execution Locked (FOMO Protection).**

---

### Module 2: Precision `XAUUSD` Lot Calculator & 1-Click Execution Pad

Gold (`XAUUSD`) lot sizing is the #1 source of accidental account blowups on mobile.

#### Key Features:
* **Smart Gold Input Modes:**
  * **By Price Levels:** Enter Entry (`2745.50`), Stop Loss (`2742.00`), Take Profit (`2754.25`).
  * **By Dollar/Pip Distance:** Drag an iPhone slider for Stop Loss (`$3.50 / 35 pips`).
* **Broker Contract Normalization:**
  * Standard Prop/CFD (`1 Lot = 100 oz`, where `$1.00 move = $100 per lot`).
  * Mini/Micro or Futures (`GC` / `MGC` contracts).
* **Automated Trade Management Presets:**
  * **Split Orders / Partial TPs:** e.g., Automatically split into 2 positions (`TP1: 50% at 1R`, `TP2: 50% at 2.5R`).
  * **Auto-Breakeven Trigger:** Automatically move SL to Entry (`+0.1R` buffer) once `1R` is hit.
* **Dual Execution Modes:**
  * **Direct API Execution:** Fires straight into connected MT5 / cTrader / TradeLocker / Paper Account.
  * **Companion Quick-Copy Mode:** One-tap copies exact Lot Size, SL, and TP with floating overlay instructions for instant paste into any standalone broker app.

---

### Module 3: Prop-Firm Account Shield & Contextual News Radar

Built specifically around the strict rules of **FTMO, FundingPips, The5ers, Maven, and Topstep**.

#### A. Red-Folder USD & Gold News Guardrail
* Live feed of USD High-Impact events (`CPI`, `Core PCE`, `NFP`, `FOMC Rate Decision`, `Fed Chair Powell`, `ISM PMI`, `Jobless Claims`).
* **Configurable News Window:** e.g., *"Lock new executions 15 minutes before and 15 minutes after Tier-1 USD News."*
* **Visual Alert Banner:** Turns the entire top of the iPhone app crimson red during the restricted news window with a live countdown timer.

#### B. Daily Drawdown & Tilt Circuit Breaker
* **Max Daily Loss Lock:** Set to e.g. `3.0%` (gives a `2%` safety buffer before a prop firm's `5%` hard breach).
* **Max Trades Per Day:** e.g., Max `3 trades/day`.
* **Revenge Trade Cooldown Timer:** Automatically enforces a `30-minute cooldown lock` after 2 consecutive losses.
* **Emergency "Flatten All" Button:** 1-tap panic button on iPhone to close all open Gold positions and cancel pending orders immediately.

---

### Module 4: Zero-Friction Auto-Journal & Edge Analytics

Because data is captured *before* and *during* the trade, the journal requires zero manual typing.

#### Core Analytics Cards:
1. **The "Cost of Indiscipline" Card (Hero Metric):**
   * Compares PnL of **Rule-Compliant Trades (`A+ / A`)** vs. **Rule-Breaking / Forced Overrides (`C / FOMO`)**.
   * Example: *"Following your framework made +\$4,850 (71% Win Rate). Breaking rules cost you -\$1,920."*
2. **Framework Leaderboard:**
   * Ranks each custom framework by Win Rate, Profit Factor, and Expectancy in `R`.
3. **Gold Session Heatmap:**
   * Breaks down performance across `Asian Session`, `London Open`, `NY Open`, and `London Close`.
4. **1-Tap Post-Trade Reflection:**
   * When a trade closes, a quick iPhone notification/sheet lets the user tap 1 tag (`Followed Plan`, `Moved SL Too Early`, `Exited Early`, `News Spike`) and optionally attach a TradingView screenshot link.
