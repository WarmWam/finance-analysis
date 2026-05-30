// publish.mjs — POST one analysis record to the Ledger Lens /api/publish endpoint.
//
// Usage:   node publish.mjs <path-to-record.json>
//
// Reads credentials from environment, falling back to a .env file found by
// walking up from the current directory (so you can keep the secret in
// finance-analysis/.env, which is gitignored). Required values:
//   LEDGER_ADMIN_TOKEN   — the ADMIN_TOKEN you set in Vercel env
//   LEDGER_PUBLISH_URL    — optional; defaults to the live deployment
//
// The record JSON must match the shape in references/snapshot-shape.md.

import { readFileSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';

const DEFAULT_URL = 'https://finance-analysis-eight.vercel.app/api/publish';

function loadDotenv() {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const p = join(dir, '.env');
    if (existsSync(p)) {
      for (const line of readFileSync(p, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (m && process.env[m[1]] === undefined) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
      }
    }
    const up = dirname(dir);
    if (up === dir) break;
    dir = up;
  }
}

async function main() {
  loadDotenv();
  const file = process.argv[2];
  if (!file) { console.error('usage: node publish.mjs <record.json>'); process.exit(1); }

  const token = process.env.LEDGER_ADMIN_TOKEN;
  const url = process.env.LEDGER_PUBLISH_URL || DEFAULT_URL;
  if (!token) {
    console.error('ERROR: LEDGER_ADMIN_TOKEN not set. Add it to finance-analysis/.env:');
    console.error('  LEDGER_ADMIN_TOKEN=your-admin-token');
    process.exit(1);
  }

  let record;
  try { record = JSON.parse(readFileSync(resolve(file), 'utf8')); }
  catch (e) { console.error('Cannot read/parse record JSON:', e.message); process.exit(1); }

  if (!record.ticker) { console.error('ERROR: record has no "ticker".'); process.exit(1); }

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
    body: JSON.stringify(record),
  });
  const text = await r.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }

  if (!r.ok) {
    console.error(`PUBLISH FAILED (HTTP ${r.status}):`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    process.exit(1);
  }
  const base = url.replace(/\/api\/publish$/, '');
  console.log('✓ Published:', data.slug);
  console.log('  View:', `${base}/company/${data.slug}`);
}

main().catch(e => { console.error(e); process.exit(1); });
