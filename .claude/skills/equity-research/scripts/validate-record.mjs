// validate-record.mjs — structural checks before publishing a Ledger Lens record.
// Run this on the assembled JSON before publish.mjs; it catches the mistakes that
// would otherwise render as blank charts or a 500 from /api/publish.
//
// Usage:
//   node .claude/skills/equity-research/scripts/validate-record.mjs ./.tmp/NVDA-2026-05-30.json

import { readFileSync } from 'fs';
import { resolve } from 'path';

const REQUIRED_TOP = [
  'ticker', 'name', 'exchange', 'country', 'sector', 'analysis_date', 'rating',
  'summary_en', 'summary_th', 'body_en', 'body_th', 'data_snapshot',
];
const RATINGS = new Set(['bull', 'neutral', 'bear']);
const TONES  = new Set(['up', 'neutral', 'down']);
const VERDICT_KEYS = ['interesting', 'margin', 'mainBiz', 'valuation'];
const MONEY_KEYS = ['revenue', 'gross_profit', 'operating_income', 'net_income', 'fcf'];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function isNumOrNull(value) {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

function checkRequired(record) {
  for (const key of REQUIRED_TOP) {
    if (record[key] === undefined || record[key] === null || record[key] === '') fail(`missing ${key}`);
  }
  if (!RATINGS.has(record.rating)) fail(`rating must be one of ${Array.from(RATINGS).join(', ')}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.analysis_date || '')) fail('analysis_date must be YYYY-MM-DD');
  if (record.verdict) checkVerdict(record.verdict);
}

function checkVerdict(verdict) {
  for (const key of VERDICT_KEYS) {
    const card = verdict[key];
    if (!card) { fail(`verdict.${key} is missing`); continue; }
    if (!card.label_en && !card.label_th) fail(`verdict.${key} needs label_en or label_th`);
    if (card.tone && !TONES.has(card.tone)) fail(`verdict.${key}.tone must be up | neutral | down`);
  }
}

function checkSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return fail('data_snapshot must be an object');

  const quote = snapshot.quote || {};
  for (const key of ['price', 'change_pct', 'market_cap']) {
    if (!isNumOrNull(quote[key])) fail(`quote.${key} must be number or null`);
  }
  if (!quote.currency || typeof quote.currency !== 'string') fail('quote.currency is required');

  if (!Array.isArray(snapshot.annual) || snapshot.annual.length < 3) {
    fail('annual must contain at least 3 years');
  } else {
    let prev = -Infinity;
    for (const row of snapshot.annual) {
      if (!Number.isInteger(row.year)) fail('annual[].year must be an integer');
      if (row.year <= prev) fail('annual must be sorted ascending by year');
      prev = row.year;
      for (const key of MONEY_KEYS) {
        if (!isNumOrNull(row[key])) fail(`annual ${row.year}.${key} must be number or null`);
      }
      if (!isNumOrNull(row.eps)) fail(`annual ${row.year}.eps must be number or null`);
    }
  }

  for (const area of ['valuation', 'balance', 'analyst']) {
    if (!snapshot[area] || typeof snapshot[area] !== 'object') fail(`${area} must be an object`);
  }

  // filing: prefer bilingual highlight_en / highlight_th; warn if only 'highlight' present
  if (snapshot.filing) {
    const f = snapshot.filing;
    if (!f.highlight_en && !f.highlight_th && f.highlight)
      console.warn('WARN: filing.highlight found — rename to highlight_en / highlight_th for bilingual support');
    if (!f.highlight_en && !f.highlight_th && !f.highlight)
      fail('filing.highlight_en (or highlight_th) is required');
  }

  if (snapshot.price_history !== undefined && snapshot.price_history !== null) {
    checkPriceHistory(snapshot.price_history);
  }

  if (!Array.isArray(snapshot.peers)) fail('peers must be an array');
  if (snapshot.segments !== undefined) checkSegments(snapshot.segments);
}

function checkPriceHistory(history) {
  if (!history || typeof history !== 'object') return fail('price_history must be an object');
  if (!history.source || typeof history.source !== 'string') fail('price_history.source is required');
  if (history.source_url && (typeof history.source_url !== 'string' || !history.source_url.startsWith('http'))) {
    fail('price_history.source_url must be a URL when present');
  }
  if (!history.symbol || typeof history.symbol !== 'string') fail('price_history.symbol is required');
  if (history.interval && history.interval !== '1d') console.warn('WARN: price_history.interval should be 1d');
  if (history.range && history.range !== '1y') console.warn('WARN: price_history.range should be 1y');
  if (!Array.isArray(history.candles)) return fail('price_history.candles must be an array');
  if (history.candles.length < 20) fail('price_history.candles must contain at least 20 valid rows');
  if (history.candles.length < 180) console.warn(`WARN: price_history has only ${history.candles.length} candles`);

  let prevDate = '';
  for (let i = 0; i < history.candles.length; i += 1) {
    const row = history.candles[i];
    const label = `price_history.candles[${i}]`;
    if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) fail(`${label}.date must be YYYY-MM-DD`);
    if (row.date && prevDate && row.date <= prevDate) fail(`${label}.date must be strictly ascending`);
    prevDate = row.date || prevDate;
    for (const key of ['open', 'high', 'low', 'close']) {
      if (typeof row[key] !== 'number' || !Number.isFinite(row[key])) fail(`${label}.${key} must be a finite number`);
    }
    if (row.volume !== null && row.volume !== undefined && (typeof row.volume !== 'number' || row.volume < 0)) {
      fail(`${label}.volume must be a non-negative number or null`);
    }
    if (isNumOrNull(row.open) && isNumOrNull(row.high) && isNumOrNull(row.low) && isNumOrNull(row.close)) {
      if (row.high < Math.max(row.open, row.close, row.low)) fail(`${label}.high must be >= open, close, and low`);
      if (row.low > Math.min(row.open, row.close, row.high)) fail(`${label}.low must be <= open, close, and high`);
    }
  }
}

function checkSegments(segments) {
  if (!segments || typeof segments !== 'object') return fail('segments must be an object');
  if (!Array.isArray(segments.sets) || !segments.sets.length) fail('segments.sets must be a non-empty array');
  if (!segments.primary_lens) fail('segments.primary_lens is required');
  if (!segments.archetype) fail('segments.archetype is required');

  for (const set of segments.sets || []) {
    if (!set.id) fail('segments.sets[].id is required');
    if (!Array.isArray(set.items) || !set.items.length) fail(`segment set ${set.id} needs items`);
    for (const item of set.items || []) {
      if (!item.id && !item.name_en) fail(`segment set ${set.id} has an item without id/name_en`);
      if (!Array.isArray(item.annual) || !item.annual.length) fail(`segment item ${item.id || item.name_en} needs annual rows`);
      for (const row of item.annual || []) {
        if (!Number.isInteger(row.year)) fail(`segment item ${item.id || item.name_en} has invalid year`);
        for (const [key, value] of Object.entries(row)) {
          if (key === 'year') continue;
          if (!isNumOrNull(value)) fail(`segment ${item.id || item.name_en}.${row.year}.${key} must be number or null`);
        }
      }
    }
  }
}

const file = process.argv[2];
if (!file) {
  console.error('usage: node validate-record.mjs <record.json>');
  process.exit(1);
}

let record;
try {
  record = JSON.parse(readFileSync(resolve(file), 'utf8'));
} catch (error) {
  console.error(`ERROR: cannot parse JSON: ${error.message}`);
  process.exit(1);
}

checkRequired(record);
checkSnapshot(record.data_snapshot);

if (process.exitCode) {
  console.error('Validation failed.');
  process.exit(process.exitCode);
}

console.log('OK: record validation passed');
