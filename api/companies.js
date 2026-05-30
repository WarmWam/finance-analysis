// GET /api/companies — list published analyses for the home grid.
// Reads from Supabase with the service key (server-side). Returns card-relevant
// columns only (excludes the long body_* fields to keep the payload small; the
// quote inside data_snapshot is needed for the market-cap line).

export default async function handler(req, res) {
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbUrl || !sbKey) return res.status(500).json({ error: 'Supabase env not configured' });

  const cols = 'ticker,slug,name,name_th,exchange,country,sector,rating,summary_en,summary_th,analysis_date,data_snapshot';
  const url = `${sbUrl}/rest/v1/analyses?select=${cols}&published=eq.true&order=analysis_date.desc`;

  const r = await fetch(url, {
    headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
  });
  if (!r.ok) return res.status(500).json({ error: 'Supabase error', status: r.status });
  const rows = await r.json();

  // Trim the snapshot down to just the quote — that's all the card renders.
  const slim = (Array.isArray(rows) ? rows : []).map(a => ({
    ...a,
    data_snapshot: { quote: a.data_snapshot?.quote || {} },
  }));

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(slim);
}
