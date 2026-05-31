// POST /api/publish  (admin only — requires x-admin-token header)
// Upserts one analysis (editorial fields + frozen data_snapshot) into Supabase,
// keyed on the unique `slug`. This is the ONLY write path; it runs with the
// service-role key, which bypasses RLS.

// ISO currency by listing country (the `currency` field is only a display symbol,
// and ¥ is ambiguous JPY/CNY — country is the reliable key).
const CCY_BY_COUNTRY = { US: 'USD', KR: 'KRW', JP: 'JPY', CN: 'CNY', HK: 'HKD', TW: 'TWD', GB: 'GBP', SG: 'SGD' };

// Freeze a USD market cap on the snapshot so the home grid can sort across
// currencies. Point-in-time: the rate is captured now and never re-fetched at
// read time. Never blocks publishing if the FX lookup fails.
async function injectMarketCapUsd(snap, country) {
  try {
    const q = snap && snap.quote;
    if (!q || q.market_cap == null || q.market_cap_usd != null) return;
    const iso = CCY_BY_COUNTRY[country] || null;
    if (iso === 'USD') { q.market_cap_usd = q.market_cap; q.fx_usd_per_unit = 1; return; }
    if (!iso) return;
    const fx = await fetch('https://open.er-api.com/v6/latest/USD').then(r => (r.ok ? r.json() : null)).catch(() => null);
    const rate = fx && fx.rates && fx.rates[iso]; // units of `iso` per 1 USD
    if (rate) {
      q.market_cap_usd = q.market_cap / rate;
      q.fx_usd_per_unit = 1 / rate;
      q.fx_as_of = (fx.time_last_update_utc || '').toString();
    }
  } catch { /* FX is best-effort; never block a publish */ }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  const token = req.headers['x-admin-token'];
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbUrl || !sbKey) return res.status(500).json({ error: 'Supabase env not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  const ticker = (body.ticker || '').toString().trim();
  if (!ticker) return res.status(400).json({ error: 'missing ticker' });

  const analysis_date = body.analysis_date || new Date().toISOString().slice(0, 10);
  const slug = (body.slug || `${ticker}-${analysis_date}`).toString().toLowerCase().replace(/[^a-z0-9.-]+/g, '-');

  const row = {
    ticker,
    slug,
    name: body.name || ticker,
    name_th: body.name_th || null,
    exchange: body.exchange || null,
    country: body.country || null,
    sector: body.sector || null,
    logo_url: body.logo_url || null,
    analysis_date,
    rating: body.rating || 'neutral',
    summary_en: body.summary_en || null,
    summary_th: body.summary_th || null,
    body_en: body.body_en || null,
    body_th: body.body_th || null,
    catalysts: body.catalysts || [],
    risks: body.risks || [],
    data_snapshot: (() => {
      const snap = body.data_snapshot || {};
      snap.verdict = body.verdict || null;
      snap.logo_text = body.logo_text || null;
      snap.logo_color = body.logo_color || null;
      snap.logo_ink = body.logo_ink || null;
      snap.country_name_th = body.country_name_th || null;
      snap.sector_th = body.sector_th || null;
      snap.sector_en = body.sector_en || null;
      return snap;
    })(),
    published: body.published !== false,
    updated_at: new Date().toISOString(),
  };

  // Freeze USD market cap (best-effort) before persisting.
  await injectMarketCapUsd(row.data_snapshot, row.country);

  const r = await fetch(`${sbUrl}/rest/v1/analyses?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: sbKey,
      Authorization: `Bearer ${sbKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(row),
  });
  const text = await r.text();
  if (!r.ok) return res.status(500).json({ error: 'Supabase upsert failed', status: r.status, detail: text });

  let saved; try { saved = JSON.parse(text); } catch { saved = text; }
  res.status(200).json({ ok: true, slug, saved: Array.isArray(saved) ? saved[0] : saved });
}
