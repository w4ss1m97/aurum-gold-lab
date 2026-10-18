// ============================================================================
// AURUM OS — TRADINGVIEW PINE SCRIPT v5 GENERATOR
// Outputs a strategy() that ports the rules of js/strategies.js so results can
// be double-checked in TradingView's Strategy Tester. Same swings (3-bar
// fractals), RSI 14, ATR 14, impulse ≥ 2× ATR, OTE 62–79%, FVG/OB in zone,
// confirmation candle, stop 0.1 ATR beyond the extreme, RR or 50% at 1R + BE.
// Shorts run the same LONG code on mirrored prices (sg = -1), like the engine.
//
// Differences vs the in-app engine (also written in the script header):
//  - Entry is always the next candle open on the chart timeframe.
//  - Red-folder USD news (FOMC, CPI, NFP) is injected from js/news.js as a
//    timestamp list: highlighted on the chart and usable as an entry filter.
//  - Target / partial levels use the signal close as the fill estimate until
//    the first bar in the trade closes, then the real fill (+ spread).
//  - If a candle touches stop and target, TradingView's intrabar model decides.
//  - The 50% partial counts as its own closed trade in TradingView's list.
// ============================================================================
(function (g) {
  const A = (g.Aurum = g.Aurum || {});

  const METHOD_LABEL = {
    crt: 'CRT',
    hiddenDivOte: 'Divergence cachée + OTE',
    doubleTop: 'Double Top / Bottom + OTE',
    oteSmt: 'OTE + SMT Or / Argent',
  };
  const PERIOD_DAYS = { '1M': 30, '3M': 91, '6M': 182, '1Y': 365 };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function pineDate(ms) {
    const d = new Date(ms);
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} 00:00 +0000`;
  }
  const b = (v) => (v ? 'true' : 'false');
  const num = (v, dec) => Number(v).toFixed(dec);

  // opts: { strategyId, cfg, market, rr, partialBE, period, entryTF, setupTFLabel, newsFilter }
  function generate(opts) {
    const mk = A.MARKETS[opts.market];
    const pairMk = A.MARKETS[mk.pair];
    const cfg = opts.cfg || {};
    const on = (k) => (cfg[k] === undefined ? true : !!cfg[k]);
    const rrOpt = opts.rr === 'struct' ? 'Structure' : `1:${opts.rr}`;
    const startMs = Date.now() - (PERIOD_DAYS[opts.period] || 91) * 86400000;
    const dec = mk.decimals;
    const notes = [];
    const SHORT = { 'FOMC rate decision': 'FOMC', 'US CPI (inflation)': 'CPI', 'US NFP (jobs / chômage)': 'NFP' };
    const evs = (A.news ? A.news.events() : []).filter((e) => e.t >= startMs - 7 * 86400000);
    const newsDecl = evs.length
      ? `var array<int> newsT = array.from(${evs.map((e) => e.t).join(', ')})\nvar array<string> newsN = array.from(${evs.map((e) => `"${SHORT[e.title] || e.title}${e.approx ? ' ≈' : ''}"`).join(', ')})`
      : 'var array<int> newsT = array.new<int>()\nvar array<string> newsN = array.new<string>()';

    return `//@version=5
// ============================================================================
// AurumOS · ${METHOD_LABEL[opts.strategyId]} — Méthode Firas Abdelmalek
// Généré par AurumOS Pine Lab. Graphique conseillé: OANDA:${mk.ticker} en ${opts.setupTFLabel || 'H4'}.
// Mêmes règles que le moteur de l'app: swings fractals 3 bougies, RSI 14, ATR 14,
// impulsion ≥ 2× ATR, zone OTE 62–79%, FVG/OB dans la zone, bougie de
// confirmation, stop 0.1 ATR au-delà de l'extrême, RR fixe ou 50% à 1R + BE.
// Les shorts appliquent exactement les mêmes règles sur les prix inversés.
// Différences: entrée à l'ouverture de la bougie suivante; si une bougie touche
// stop et objectif, c'est le modèle intrabar de TradingView qui tranche; le 50%
// à 1R apparaît comme un trade séparé dans la liste des trades.
${notes.join('\n')}${notes.length ? '\n' : ''}// ============================================================================
strategy("AurumOS · ${METHOD_LABEL[opts.strategyId]}", shorttitle="AurumOS", overlay=true, initial_capital=100000, default_qty_type=strategy.fixed, pyramiding=0, commission_type=strategy.commission.cash_per_contract, commission_value=${num(mk.spread / 2, dec + 1)}, max_bars_back=1000, max_labels_count=500)

// === 1. RÉGLAGES (copiés depuis l'app) ===
M_CRT = "${METHOD_LABEL.crt}"
M_HD = "${METHOD_LABEL.hiddenDivOte}"
M_DT = "${METHOD_LABEL.doubleTop}"
M_SMT = "${METHOD_LABEL.oteSmt}"
grpM = "Méthode"
grpC = "Confluences"
grpX = "Sortie & risque"
grpN = "News rouges USD"
methodSel = input.string("${METHOD_LABEL[opts.strategyId]}", "Méthode", options=[M_CRT, M_HD, M_DT, M_SMT], group=grpM)
useOte = input.bool(${b(on('ote'))}, "Zone OTE 62–79%", group=grpC, tooltip="Toutes les méthodes. Off = retracement ≥ 38.2% suffit.")
useDiv = input.bool(${b(on('hiddenDiv'))}, "Divergence cachée (RSI 14)", group=grpC, tooltip="Div. cachée + OTE, CRT, OTE + SMT")
useFvgOb = input.bool(${b(on('fvgOb'))}, "FVG ou OB dans la zone", group=grpC, tooltip="Toutes les méthodes")
useConfirm = input.bool(${b(on('confirm'))}, "Bougie de confirmation", group=grpC, tooltip="Div. cachée + OTE, Double Top, OTE + SMT")
useClean = input.bool(${b(on('clean'))}, "Correction propre (filtre points faibles)", group=grpC, tooltip="Toutes les méthodes")
useSmt = input.bool(${b(on('smt'))}, "Divergence SMT Or / Argent", group=grpC, tooltip="OTE + SMT uniquement")
pairSym = input.symbol("OANDA:${pairMk.ticker}", "Métal corrélé (SMT)", group=grpC)
rrMode = input.string("${rrOpt}", "Objectif", options=["1:1.5", "1:2", "1:3", "Structure"], group=grpX, tooltip="Structure = sommet/creux de l'impulsion (min 1R, sinon 2R)")
partialBE = input.bool(${b(opts.partialBE)}, "50% à 1R puis breakeven", group=grpX)
spreadPx = input.float(${num(mk.spread, dec)}, "Spread (en prix)", step=0.01, group=grpX)
riskPct = input.float(1.0, "Risque par trade (%)", step=0.25, group=grpX)
startTime = input.time(timestamp("${pineDate(startMs)}"), "Début du test", group=grpX, tooltip="Change cette date pour tester 1 mois, 3 mois, 6 mois…")
useNews = input.bool(${b(opts.newsFilter)}, "Bloquer les entrées près des news", group=grpN, tooltip="Pas d'entrée 2h avant / 1h après FOMC, CPI, NFP")
showNews = input.bool(true, "Afficher les news sur le graphique", group=grpN)

// === 2. CONSTANTES (identiques à js/strategies.js) ===
OTE_LO = 0.62
OTE_HI = 0.79
IMP_MIN = 2.0
MAX_PB = 40
STOP_BUF = 0.1
WARMUP = 60

// === NEWS ROUGES USD (calendrier intégré AurumOS; ≈ = date estimée) ===
${newsDecl}
newsNear(int t0) =>
    bool hit = false
    n = array.size(newsT)
    if n > 0
        for i = 0 to n - 1
            nt = array.get(newsT, i)
            if nt >= t0 - 3600000 and nt <= t0 + 7200000
                hit := true
                break
    hit
string newsHere = ""
if array.size(newsT) > 0
    for i = 0 to array.size(newsT) - 1
        nt = array.get(newsT, i)
        if nt >= time and nt < time_close
            newsHere := newsHere + (newsHere == "" ? "" : " + ") + array.get(newsN, i)
newsNow = newsNear(time_close)

atrV = ta.atr(14)
rsiV = ta.rsi(close, 14)
[pairHi, pairLo] = request.security(pairSym, timeframe.period, [high, low], gaps=barmerge.gaps_on, lookahead=barmerge.lookahead_off)

// Historique ATR / RSI / métal corrélé (buffer glissant indexé par bar_index)
BUF = 2000
var array<float> bAtr = array.new<float>()
var array<float> bRsi = array.new<float>()
var array<float> bPHi = array.new<float>()
var array<float> bPLo = array.new<float>()
var int bBase = 0
array.push(bAtr, atrV)
array.push(bRsi, rsiV)
array.push(bPHi, pairHi)
array.push(bPLo, pairLo)
if array.size(bAtr) > BUF
    array.shift(bAtr)
    array.shift(bRsi)
    array.shift(bPHi)
    array.shift(bPLo)
    bBase += 1

// === 3. PRIX "CÔTÉ LONG" — sg = 1 prix normaux, sg = -1 prix inversés (shorts) ===
pxH(int i, float sg) => sg > 0 ? high[bar_index - i] : -low[bar_index - i]
pxL(int i, float sg) => sg > 0 ? low[bar_index - i] : -high[bar_index - i]
pxO(int i, float sg) => sg * open[bar_index - i]
pxC(int i, float sg) => sg * close[bar_index - i]
rsiAt(int i, float sg) => sg > 0 ? array.get(bRsi, i - bBase) : 100 - array.get(bRsi, i - bBase)
atrAt(int i) => array.get(bAtr, i - bBase)
pairLowAt(int i, float sg) => sg > 0 ? array.get(bPLo, i - bBase) : -array.get(bPHi, i - bBase)

// Swings fractals 3/3 (connus 3 bougies après le pivot)
var array<int> pvHiI = array.new<int>()
var array<float> pvHiP = array.new<float>()
var array<int> pvLoI = array.new<int>()
var array<float> pvLoP = array.new<float>()
if bar_index >= 6
    isPH = true
    isPL = true
    for k = 0 to 6
        if k < 3
            if high[k] >= high[3]
                isPH := false
            if low[k] <= low[3]
                isPL := false
        else if k > 3
            if high[k] > high[3]
                isPH := false
            if low[k] < low[3]
                isPL := false
    if isPH
        array.push(pvHiI, bar_index - 3)
        array.push(pvHiP, high[3])
    if isPL
        array.push(pvLoI, bar_index - 3)
        array.push(pvLoP, low[3])
    if array.size(pvHiI) > 300
        array.shift(pvHiI)
        array.shift(pvHiP)
    if array.size(pvLoI) > 300
        array.shift(pvLoI)
        array.shift(pvLoP)

// Dernier pivot d'indice < beforeI
lastPiv(array<int> idx, array<float> px, int beforeI, float sg) =>
    int ri = na
    float rp = na
    n = array.size(idx)
    if n > 0
        for k = n - 1 to 0
            if array.get(idx, k) < beforeI
                ri := array.get(idx, k)
                rp := array.get(px, k) * sg
                break
    [ri, rp]

// === 4. BRIQUES (perspective LONG) ===
// Impulsion L -> H (≥ 2× ATR) puis pullback dont le plus bas date des 3 dernières bougies
impulse(array<int> hiI, array<float> hiP, array<int> loI, array<float> loP, float sg, bool reqOte) =>
    t = bar_index
    bool ok = false
    int hI = na
    float hP = na
    int lI = na
    float lP = na
    float rg = na
    float pl = na
    int plI = na
    float retr = na
    [h0, hp0] = lastPiv(hiI, hiP, t + 1, sg)
    if not na(h0) and t - h0 <= MAX_PB and t - h0 >= 2
        [l0, lp0] = lastPiv(loI, loP, h0, sg)
        if not na(l0) and t - l0 <= 900
            rg0 = hp0 - lp0
            if rg0 >= IMP_MIN * atrV
                float mn = na
                int mnI = na
                float mx = na
                for k = h0 + 1 to t
                    lv = pxL(k, sg)
                    hv = pxH(k, sg)
                    if na(mn) or lv < mn
                        mn := lv
                        mnI := k
                    if na(mx) or hv > mx
                        mx := hv
                if mx <= hp0 and mn > lp0 and mnI >= t - 3
                    r0 = (hp0 - mn) / rg0
                    good = reqOte ? (r0 >= OTE_LO and r0 <= OTE_HI) : r0 >= 0.382
                    if good
                        ok := true
                        hI := h0
                        hP := hp0
                        lI := l0
                        lP := lp0
                        rg := rg0
                        pl := mn
                        plI := mnI
                        retr := r0
    [ok, hI, hP, lI, lP, rg, pl, plI, retr]

// FVG haussier ou Order Block baissier (avant déplacement) dans la zone OTE touchée
fvgOrOb(int lI, int hI, float pl, float zTop, float zBot, float sg) =>
    bool found = false
    if pl <= zTop
        if lI + 2 <= hI
            for k = lI + 2 to hI
                fBot = pxH(k - 2, sg)
                fTop = pxL(k, sg)
                if fTop > fBot and math.max(fBot, zBot) <= math.min(fTop, zTop) and pl <= fTop
                    found := true
                    break
        if not found and lI <= hI - 1
            for k = lI to hI - 1
                bearOB = pxC(k, sg) < pxO(k, sg)
                nxBody = pxC(k + 1, sg) - pxO(k + 1, sg)
                disp = nxBody > 0 and nxBody >= 0.6 * atrAt(k + 1) and pxC(k + 1, sg) > pxH(k, sg)
                if bearOB and disp and math.max(pxL(k, sg), zBot) <= math.min(pxH(k, sg), zTop) and pl <= pxH(k, sg)
                    found := true
                    break
    found

// Bougie de confirmation: clôture haussière au-dessus du plus haut précédent, ou pin de rejet
confirmOk(float sg) =>
    t = bar_index
    bH = pxH(t, sg)
    bL = pxL(t, sg)
    bO = pxO(t, sg)
    bC = pxC(t, sg)
    cRng = bH - bL
    engulf = bC > bO and bC > pxH(t - 1, sg)
    pin = math.min(bO, bC) - bL >= 0.5 * cRng and bC >= bL + 0.66 * cRng
    cRng > 0 and (engulf or pin)

// Points faibles: pas de bougie impulsive contre le trade ni de FVG baissier dans la correction
cleanOk(int fromI, int toI, float sg) =>
    bool res = true
    if toI >= fromI
        for k = fromI to toI
            if pxO(k, sg) - pxC(k, sg) > 1.2 * atrAt(k)
                res := false
                break
            if k >= fromI + 2 and pxH(k, sg) < pxL(k - 2, sg)
                res := false
                break
    res

// SMT: l'actif balaie le plus bas antérieur du pullback, le métal corrélé ne fait pas plus bas
smtOk(int hI, float pl, int plI, float sg) =>
    bool res = false
    fromI = hI + 1
    refEnd = plI - 2
    if refEnd >= fromI
        float refMain = na
        float refPair = na
        for k = fromI to refEnd
            lv = pxL(k, sg)
            refMain := na(refMain) ? lv : math.min(refMain, lv)
            pv = pairLowAt(k, sg)
            if not na(pv)
                refPair := na(refPair) ? pv : math.min(refPair, pv)
        float nowPair = na
        hiK = math.min(plI + 1, bar_index)
        for k = plI - 1 to hiK
            pv = pairLowAt(k, sg)
            if not na(pv)
                nowPair := na(nowPair) ? pv : math.min(nowPair, pv)
        res := not na(refPair) and not na(nowPair) and pl < refMain and nowPair > refPair
    res

// === 5. MÉTHODES — retournent [signal, clé, stop, objectif structurel] (côté LONG) ===
detPullback(array<int> hiI, array<float> hiP, array<int> loI, array<float> loP, float sg, bool withSmt) =>
    [ok, hI, hP, lI, lP, rg, pl, plI, retr] = impulse(hiI, hiP, loI, loP, sg, useOte)
    bool sig = ok
    if sig and withSmt and useSmt
        sig := smtOk(hI, pl, plI, sg)
    if sig and useDiv
        sig := rsiAt(plI, sg) < rsiAt(lI, sg)
    if sig and useFvgOb
        sig := fvgOrOb(lI, hI, pl, hP - OTE_LO * rg, hP - OTE_HI * rg, sg)
    if sig and useConfirm
        sig := confirmOk(sg)
    if sig and useClean
        sig := cleanOk(hI + 1, bar_index - 1, sg)
    [sig, hI, pl - STOP_BUF * atrV, hP]

detCrt(array<int> hiI, array<float> hiP, array<int> loI, array<float> loP, float sg) =>
    t = bar_index
    c1H = pxH(t - 1, sg)
    c1L = pxL(t - 1, sg)
    c1O = pxO(t - 1, sg)
    c1C = pxC(t - 1, sg)
    c2L = pxL(t, sg)
    c2C = pxC(t, sg)
    rng1 = c1H - c1L
    clearR = c1C < c1O and (c1O - c1C) >= 0.5 * rng1 and rng1 >= 0.8 * atrAt(t - 1)
    bool sig = clearR and c2L < c1L and c2C > c1L and c2C < c1H
    if sig and (useOte or useDiv or useFvgOb or useClean)
        [ok, hI, hP, lI, lP, rg, pl, plI, retr] = impulse(hiI, hiP, loI, loP, sg, useOte)
        sig := ok and plI == t
        if sig and useDiv
            sig := rsiAt(plI, sg) < rsiAt(lI, sg)
        if sig and useFvgOb
            sig := fvgOrOb(lI, hI, pl, hP - OTE_LO * rg, hP - OTE_HI * rg, sg)
        if sig and useClean
            sig := cleanOk(hI + 1, t - 2, sg)
    [sig, t, c2L - STOP_BUF * atrV, c1H]

// Côté LONG = double bottom; le double top vient des prix inversés
detDouble(array<int> hiI, array<float> hiP, array<int> loI, array<float> loP, float sg) =>
    t = bar_index
    tol = 0.35 * atrV
    bool sig = false
    int key = na
    float stp = na
    float tgt = na
    [h0, hp0] = lastPiv(hiI, hiP, t + 1, sg)
    if not na(h0) and t - h0 <= MAX_PB
        [l0, lp0] = lastPiv(loI, loP, h0, sg)
        [b1, b1p] = lastPiv(loI, loP, t + 1, sg)
        if not na(l0) and not na(b1) and t - l0 <= 900
            rg = hp0 - lp0
            if rg >= IMP_MIN * atrV and b1 > h0 and t - b1 >= 4
                float b2 = na
                int b2I = na
                for k = t - 2 to t
                    lv = pxL(k, sg)
                    if na(b2) or lv < b2
                        b2 := lv
                        b2I := k
                if b2I > b1 + 2 and math.abs(b2 - b1p) <= tol
                    float ph = na
                    float lowAll = na
                    for k = h0 + 1 to t
                        ph := na(ph) ? pxH(k, sg) : math.max(ph, pxH(k, sg))
                        lowAll := na(lowAll) ? pxL(k, sg) : math.min(lowAll, pxL(k, sg))
                    if ph <= hp0 and lowAll >= b1p - tol and lowAll > lp0
                        float neck = na
                        for k = b1 + 1 to b2I - 1
                            neck := na(neck) ? pxH(k, sg) : math.max(neck, pxH(k, sg))
                        if neck - math.max(b1p, b2) >= 0.5 * atrV
                            deepest = math.min(b1p, b2)
                            retr = (hp0 - deepest) / rg
                            good = useOte ? (retr >= OTE_LO and retr <= OTE_HI) : retr >= 0.382
                            if good
                                bool s2 = true
                                if useFvgOb
                                    s2 := fvgOrOb(l0, h0, deepest, hp0 - OTE_LO * rg, hp0 - OTE_HI * rg, sg)
                                if s2 and useConfirm
                                    s2 := confirmOk(sg)
                                if s2 and useClean
                                    s2 := cleanOk(h0 + 1, t - 1, sg)
                                if s2
                                    sig := true
                                    key := b1
                                    stp := deepest - STOP_BUF * atrV
                                    tgt := hp0
    [sig, key, stp, tgt]

detect(array<int> hiI, array<float> hiP, array<int> loI, array<float> loP, float sg) =>
    bool dSig = false
    int dKey = na
    float dStop = na
    float dTgt = na
    if methodSel == M_CRT
        [s1, k1, st1, tg1] = detCrt(hiI, hiP, loI, loP, sg)
        dSig := s1
        dKey := k1
        dStop := st1
        dTgt := tg1
    else if methodSel == M_DT
        [s2, k2, st2, tg2] = detDouble(hiI, hiP, loI, loP, sg)
        dSig := s2
        dKey := k2
        dStop := st2
        dTgt := tg2
    else
        [s3, k3, st3, tg3] = detPullback(hiI, hiP, loI, loP, sg, methodSel == M_SMT)
        dSig := s3
        dKey := k3
        dStop := st3
        dTgt := tg3
    [dSig, dKey, dStop, dTgt]

// === 6. EXÉCUTION — une position à la fois, chaque setup n'est pris qu'une fois ===
[sigL, keyL, stopL, tgtL] = detect(pvHiI, pvHiP, pvLoI, pvLoP, 1.0)
[sigS, keyS, stopS, tgtS] = detect(pvLoI, pvLoP, pvHiI, pvHiP, -1.0)

rrFixed = rrMode == "1:1.5" ? 1.5 : rrMode == "1:3" ? 3.0 : 2.0
isStruct = rrMode == "Structure"
inWindow = bar_index >= WARMUP and time_close >= startTime and not (useNews and newsNow)

var int lastKeyL = na
var int lastKeyS = na
var int tDir = 0
var float tStop = na
var float tStruct = na
var float tTgt = na
var int tClosed = 0

if strategy.position_size == 0
    tDir := 0
    tTgt := na

// Gestion: niveaux recalculés depuis le vrai prix d'entrée (+ spread), stop à BE après le 50%
if strategy.position_size != 0 and tDir != 0
    fromId = tDir == 1 ? "Long" : "Short"
    fillPx = strategy.position_avg_price + tDir * spreadPx
    risk = (fillPx - tStop) * tDir
    if risk <= 0
        strategy.close(fromId, comment="Gap stop")
    else
        rrNow = isStruct ? (tStruct - fillPx) * tDir / risk : rrFixed
        if isStruct and not (rrNow >= 1)
            rrNow := 2.0
        tTgt := fillPx + tDir * rrNow * risk
        oneR = fillPx + tDir * risk
        usePart = partialBE and rrNow > 1
        partDone = strategy.closedtrades > tClosed
        if usePart and not partDone
            strategy.exit("TP1", fromId, qty_percent=50, limit=oneR, stop=tStop, comment="1R 50%")
            strategy.exit("TP2", fromId, limit=tTgt, stop=tStop, comment="TP")
        else if usePart
            strategy.exit("TP2", fromId, limit=tTgt, stop=fillPx, comment="TP / BE")
        else
            strategy.exit("TP", fromId, limit=tTgt, stop=tStop, comment="TP / SL")

int goDir = 0
float goStop = na
float goStruct = na
if inWindow
    if sigL and (na(lastKeyL) or keyL != lastKeyL)
        lastKeyL := keyL
        if strategy.position_size == 0 and close + spreadPx - stopL > 2 * spreadPx
            goDir := 1
            goStop := stopL
            goStruct := tgtL
    if sigS and (na(lastKeyS) or keyS != lastKeyS)
        lastKeyS := keyS
        if strategy.position_size == 0 and goDir == 0 and (-stopS) - (close - spreadPx) > 2 * spreadPx
            goDir := -1
            goStop := -stopS
            goStruct := -tgtS

if goDir != 0
    fromId = goDir == 1 ? "Long" : "Short"
    estFill = close + goDir * spreadPx
    riskE = (estFill - goStop) * goDir
    rrE = isStruct ? (goStruct - estFill) * goDir / riskE : rrFixed
    if isStruct and not (rrE >= 1)
        rrE := 2.0
    tgtE = estFill + goDir * rrE * riskE
    oneRE = estFill + goDir * riskE
    ordQty = strategy.equity * riskPct / 100.0 / riskE
    tDir := goDir
    tStop := goStop
    tStruct := goStruct
    tTgt := tgtE
    tClosed := strategy.closedtrades
    strategy.entry(fromId, goDir == 1 ? strategy.long : strategy.short, qty=ordQty)
    if partialBE and rrE > 1
        strategy.exit("TP1", fromId, qty_percent=50, limit=oneRE, stop=goStop, comment="1R 50%")
        strategy.exit("TP2", fromId, limit=tgtE, stop=goStop, comment="TP")
    else
        strategy.exit("TP", fromId, limit=tgtE, stop=goStop, comment="TP / SL")

// === 7. VISUEL ===
tag = methodSel == M_CRT ? "CRT" : methodSel == M_DT ? "Double" : methodSel == M_SMT ? "OTE+SMT" : "Div+OTE"
warn = newsNow ? "\\n⚠ news proche" : ""
if goDir == 1
    label.new(bar_index, low, "▲ " + tag + warn, style=label.style_label_up, color=color.new(color.green, 0), textcolor=color.white, size=size.small)
if goDir == -1
    label.new(bar_index, high, "▼ " + tag + warn, style=label.style_label_down, color=color.new(color.red, 0), textcolor=color.white, size=size.small)
bgcolor(showNews and newsHere != "" ? color.new(color.orange, 80) : na, title="News rouges")
if showNews and newsHere != ""
    label.new(bar_index, high, "📰 " + newsHere, yloc=yloc.abovebar, style=label.style_label_down, color=color.new(color.orange, 0), textcolor=color.black, size=size.tiny)
showLv = strategy.position_size != 0 or goDir != 0
plot(showLv ? tStop : na, "Stop", color=color.red, style=plot.style_linebr, linewidth=2)
plot(showLv ? tTgt : na, "Objectif", color=color.lime, style=plot.style_linebr, linewidth=2)

var table hud = table.new(position.bottom_right, 2, 7, bgcolor=color.new(#0f172a, 10), border_color=color.new(#facc15, 60), border_width=1)
if barstate.islast
    ct = strategy.closedtrades
    winR = ct > 0 ? 100.0 * strategy.wintrades / ct : 0.0
    pf = strategy.grossloss > 0 ? strategy.grossprofit / strategy.grossloss : 0.0
    table.cell(hud, 0, 0, "AurumOS", text_color=#facc15, text_size=size.small)
    table.cell(hud, 1, 0, tag, text_color=color.white, text_size=size.small)
    table.cell(hud, 0, 1, "Trades", text_color=color.silver, text_size=size.small)
    table.cell(hud, 1, 1, str.tostring(ct), text_color=color.white, text_size=size.small)
    table.cell(hud, 0, 2, "Gagnants", text_color=color.silver, text_size=size.small)
    table.cell(hud, 1, 2, str.tostring(winR, "#.0") + "%", text_color=color.white, text_size=size.small)
    table.cell(hud, 0, 3, "Profit factor", text_color=color.silver, text_size=size.small)
    table.cell(hud, 1, 3, str.tostring(pf, "#.00"), text_color=pf >= 1.5 ? color.lime : pf >= 1.1 ? color.yellow : color.red, text_size=size.small)
    table.cell(hud, 0, 4, "Net", text_color=color.silver, text_size=size.small)
    table.cell(hud, 1, 4, str.tostring(strategy.netprofit, "#,###") + " $", text_color=strategy.netprofit >= 0 ? color.lime : color.red, text_size=size.small)
    ddPct = strategy.max_drawdown / strategy.initial_capital * 100
    table.cell(hud, 0, 5, "Drawdown max", text_color=color.silver, text_size=size.small)
    table.cell(hud, 1, 5, "-" + str.tostring(ddPct, "#.0") + "%", text_color=ddPct <= 5 ? color.aqua : color.orange, text_size=size.small)
    verdict = ct < 15 ? "Trop peu de trades" : pf >= 1.5 ? "Edge positif ✓" : pf >= 1.1 ? "Edge faible" : "Pas d'edge ✗"
    table.cell(hud, 0, 6, "Verdict", text_color=color.silver, text_size=size.small)
    table.cell(hud, 1, 6, verdict, text_color=pf >= 1.5 and ct >= 15 ? color.lime : pf >= 1.1 ? color.yellow : color.red, text_size=size.small)
`;
  }

  A.pine = { generate, METHOD_LABEL };
})(typeof window !== 'undefined' ? window : globalThis);
