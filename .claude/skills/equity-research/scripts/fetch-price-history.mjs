// Fetch 1-year daily OHLCV candles from Yahoo Finance's chart endpoint.
// Usage:
//   node scripts/fetch-price-history.mjs AAPL [output.json]

import fs from 'node:fs/promises';

const symbol = process.argv[2];
const output = process.argv[3];

if (!symbol) {
  console.error('usage: node fetch-price-history.mjs <yahoo-symbol> [output.json]');
  process.exit(1);
}

const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&events=history&includeAdjustedClose=true`;

const res = await fetch(url, {
  headers: {
    'user-agent': 'LedgerLensResearch/1.0',
    accept: 'application/json',
  },
});

if (!res.ok) {
  throw new Error(`Yahoo chart request failed: HTTP ${res.status}`);
}

const json = await res.json();
const result = json?.chart?.result?.[0];
const error = json?.chart?.error;
if (!result || error) {
  throw new Error(`Yahoo chart returned no result${error ? `: ${JSON.stringify(error)}` : ''}`);
}

const meta = result.meta || {};
const quote = result.indicators?.quote?.[0] || {};
const adj = result.indicators?.adjclose?.[0]?.adjclose || [];
const timestamps = result.timestamp || [];

const round = (v) => (v === null || v === undefined || Number.isNaN(Number(v)) ? null : Number(Number(v).toFixed(4)));
const candles = timestamps.map((ts, i) => ({
  date: new Date(ts * 1000).toISOString().slice(0, 10),
  open: round(quote.open?.[i]),
  high: round(quote.high?.[i]),
  low: round(quote.low?.[i]),
  close: round(quote.close?.[i]),
  adj_close: round(adj[i]),
  volume: quote.volume?.[i] === null || quote.volume?.[i] === undefined ? null : Number(quote.volume[i]),
})).filter((d) => d.open !== null && d.high !== null && d.low !== null && d.close !== null);

if (candles.length < 20) {
  throw new Error(`Yahoo chart returned too few valid candles: ${candles.length}`);
}

const payload = {
  source: 'Yahoo Finance chart',
  source_url: url,
  symbol,
  interval: '1d',
  range: '1y',
  currency: meta.currency || null,
  exchange: meta.exchangeName || meta.fullExchangeName || null,
  timezone: meta.timezone || null,
  fetched_at: new Date().toISOString(),
  candles,
};

const text = JSON.stringify(payload, null, 2);
if (output) {
  await fs.writeFile(output, text + '\n', 'utf8');
} else {
  console.log(text);
}
