// DELETE /api/delete-analysis?slug=...
// Admin-only maintenance endpoint for removing one published analysis row.

export default async function handler(req, res) {
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }

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

  const slug = (req.query?.slug || body.slug || '').toString().trim().toLowerCase();
  if (!slug) return res.status(400).json({ error: 'missing slug' });

  const r = await fetch(`${sbUrl}/rest/v1/analyses?slug=eq.${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: {
      apikey: sbKey,
      Authorization: `Bearer ${sbKey}`,
      Prefer: 'return=representation',
    },
  });
  const text = await r.text();
  if (!r.ok) return res.status(500).json({ error: 'Supabase delete failed', status: r.status, detail: text });

  let deleted; try { deleted = JSON.parse(text); } catch { deleted = []; }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: true, slug, deleted_count: Array.isArray(deleted) ? deleted.length : 0, deleted });
}
