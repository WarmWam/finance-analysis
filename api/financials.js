// GET /api/financials?ticker=NVDA  (admin only — requires x-admin-token header)
//
// Fetches from Financial Modeling Prep and normalizes into the `data_snapshot`
// shape documented in mock-data.js. Each section is fetched independently and
// wrapped in try/catch: on the free tier some endpoints (or non-US tickers) may
// be unavailable, so a failure leaves that section null + adds a _warnings note
// instead of failing the whole request. The admin form can fill gaps by hand.
//
// ⚠ FMP field names: verified against the FMP v3 "stable" response shape. If FMP
// returns different keys for your plan, adjust ONLY the mapping blocks below.

const FMP_BASE = 'https://financialmodelingprep.com/api';

async function fmp(path, key) {
  const sep = path.includes('?') ? '&' : '?';
  const r = await fetch(`${FMP_BASE}${path}${sep}apikey=${key}`);
  if (!r.ok) throw new Error(`FMP ${path} -> ${r.status}`);
  return r.json();
}
const num = (v) => (v == null || v === '' || isNaN(Number(v)) ? null : Number(v));

export default async function handler(req, res) {
  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const key = process.env.FMP_API_KEY;
  if (!key) return res.status(500).json({ error: 'FMP_API_KEY not configured' });

  const ticker = (req.query?.ticker || '').toString().trim().toUpperCase();
  if (!ticker) return res.status(400).json({ error: 'missing ticker' });

  const warnings = [];
  const snapshot = {
    quote: {}, valuation: {}, annual: [], balance: {},
    analyst: {}, peers: [], filing: null, insider: [],
  };
  const meta = {};

  // --- Company profile (name, exchange, sector, country, logo, currency) ----
  try {
    const p = (await fmp(`/v3/profile/${ticker}`, key))[0] || {};
    meta.name = p.companyName || ticker;
    meta.exchange = p.exchangeShortName || p.exchange || '';
    meta.sector = p.sector || '';
    meta.country = p.country || '';
    meta.logo_url = p.image || '';
    snapshot.quote.currency = p.currency ? currencySymbol(p.currency) : '$';
    snapshot.quote.price = num(p.price);
    snapshot.quote.market_cap = num(p.mktCap);
  } catch (e) { warnings.push('profile: ' + e.message); }

  // --- Quote (price change %, pe) -------------------------------------------
  try {
    const q = (await fmp(`/v3/quote/${ticker}`, key))[0] || {};
    snapshot.quote.price = num(q.price) ?? snapshot.quote.price;
    snapshot.quote.change_pct = num(q.changesPercentage);
    snapshot.quote.market_cap = num(q.marketCap) ?? snapshot.quote.market_cap;
    snapshot.valuation.pe = num(q.pe);
  } catch (e) { warnings.push('quote: ' + e.message); }

  // --- Income statement (5y) + cash flow (FCF) ------------------------------
  try {
    const inc = await fmp(`/v3/income-statement/${ticker}?period=annual&limit=6`, key);
    const cf  = await fmp(`/v3/cash-flow-statement/${ticker}?period=annual&limit=6`, key).catch(() => []);
    const fcfByYear = {};
    (Array.isArray(cf) ? cf : []).forEach(r => { fcfByYear[r.calendarYear] = num(r.freeCashFlow); });
    snapshot.annual = (Array.isArray(inc) ? inc : [])
      .map(r => ({
        year: Number(r.calendarYear),
        revenue: num(r.revenue),
        gross_profit: num(r.grossProfit),
        operating_income: num(r.operatingIncome),
        net_income: num(r.netIncome),
        eps: num(r.eps ?? r.epsdiluted),
        fcf: fcfByYear[r.calendarYear] ?? null,
      }))
      .sort((a, b) => a.year - b.year); // ascending for the charts
  } catch (e) { warnings.push('income: ' + e.message); }

  // --- Valuation ratios (TTM) -----------------------------------------------
  try {
    const rt = (await fmp(`/v3/ratios-ttm/${ticker}`, key))[0] || {};
    snapshot.valuation.pe        = snapshot.valuation.pe ?? num(rt.peRatioTTM);
    snapshot.valuation.ps        = num(rt.priceToSalesRatioTTM);
    snapshot.valuation.pb        = num(rt.priceToBookRatioTTM);
    snapshot.valuation.ev_ebitda = num(rt.enterpriseValueMultipleTTM);
    snapshot.valuation.peg       = num(rt.pegRatioTTM);
    snapshot.balance.current_ratio     = num(rt.currentRatioTTM);
    snapshot.balance.de_ratio          = num(rt.debtEquityRatioTTM);
    snapshot.balance.interest_coverage = num(rt.interestCoverageTTM);
  } catch (e) { warnings.push('ratios: ' + e.message); }

  // --- Balance sheet (cash, debt) -------------------------------------------
  try {
    const bs = (await fmp(`/v3/balance-sheet-statement/${ticker}?period=annual&limit=1`, key))[0] || {};
    snapshot.balance.cash = num(bs.cashAndShortTermInvestments ?? bs.cashAndCashEquivalents);
    snapshot.balance.total_debt = num(bs.totalDebt);
  } catch (e) { warnings.push('balance: ' + e.message); }

  // --- Analyst consensus + price target -------------------------------------
  try {
    const rec = (await fmp(`/v3/analyst-stock-recommendations/${ticker}`, key))[0] || {};
    snapshot.analyst.strong_buy = num(rec.analystRatingsStrongBuy) ?? 0;
    snapshot.analyst.buy        = num(rec.analystRatingsbuy) ?? 0;
    snapshot.analyst.hold       = num(rec.analystRatingsHold) ?? 0;
    snapshot.analyst.sell       = (num(rec.analystRatingsSell) ?? 0) + (num(rec.analystRatingsStrongSell) ?? 0);
  } catch (e) { warnings.push('recommendations: ' + e.message); }
  try {
    const pt = await fmp(`/v4/price-target-consensus?symbol=${ticker}`, key);
    const c = Array.isArray(pt) ? pt[0] : pt;
    if (c) {
      snapshot.analyst.target_avg  = num(c.targetConsensus ?? c.targetMedian);
      snapshot.analyst.target_low  = num(c.targetLow);
      snapshot.analyst.target_high = num(c.targetHigh);
    }
  } catch (e) { warnings.push('price-target: ' + e.message); }

  // --- Peers (one batch quote for their P/E) --------------------------------
  try {
    const sp = await fmp(`/v4/stock_peers?symbol=${ticker}`, key);
    const list = (Array.isArray(sp) ? sp[0]?.peersList : sp?.peersList) || [];
    const top = list.slice(0, 4);
    if (top.length) {
      const quotes = await fmp(`/v3/quote/${top.join(',')}`, key).catch(() => []);
      snapshot.peers = (Array.isArray(quotes) ? quotes : []).map(q => ({ ticker: q.symbol, pe: num(q.pe) }));
    }
  } catch (e) { warnings.push('peers: ' + e.message); }

  res.status(200).json({ ticker, meta, snapshot, _warnings: warnings });
}

// Minimal currency-code -> symbol map (extend as needed).
function currencySymbol(code) {
  return ({ USD: '$', KRW: '₩', JPY: '¥', CNY: '¥', HKD: 'HK$', TWD: 'NT$', EUR: '€', GBP: '£', THB: '฿' })[code] || (code + ' ');
}
