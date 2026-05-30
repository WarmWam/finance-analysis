// GET /api/company?slug=... — one full published analysis (all fields).

export default async function handler(req, res) {
  const slug = (req.query?.slug || '').toString();
  if (!slug) return res.status(400).json({ error: 'missing slug' });

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_KEY;
  if (!sbUrl || !sbKey) return res.status(500).json({ error: 'Supabase env not configured' });

  const url = `${sbUrl}/rest/v1/analyses?slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`;
  const r = await fetch(url, {
    headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
  });
  if (!r.ok) return res.status(500).json({ error: 'Supabase error', status: r.status });
  const rows = await r.json();
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) return res.status(404).json({ error: 'not found' });

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(row);
}
