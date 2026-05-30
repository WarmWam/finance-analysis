// validate-record.mjs - quick structural checks before publishing a Ledger Lens record.
//
// Usage:
//   node .codex/skills/equity-research/scripts/validate-record.mjs ./.tmp/MSFT-2026-05-30.json

import { readFileSync } from 'fs';
import { resolve } from 'path';

const REQUIRED_TOP = [
  'ticker', 'name', 'exchange', 'country', 'sector', 'analysis_date', 'rating',
  'summary_en', 'summary_th', 'body_en', 'body_th', 'data_snapshot',
];
const RATINGS = new Set(['bull', 'neutral', 'bear']);
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

  if (!Array.isArray(snapshot.peers)) fail('peers must be an array');
  if (snapshot.segments !== undefined) checkSegments(snapshot.segments);
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
