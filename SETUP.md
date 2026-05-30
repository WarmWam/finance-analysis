# Setup — by-hand steps

These are the steps only you can do (accounts, keys, domain). Everything in
between is already wired in code. Do them in order; each unblocks the next phase.

---

## 1. Supabase (free database)

1. Go to https://supabase.com → **New project** (free tier).
2. Project name: `ledger-lens` · pick a region near Thailand (Singapore).
3. Once created: **SQL Editor** → paste the contents of [`schema.sql`](schema.sql) → **Run**.
4. **Project Settings → API**, copy:
   - `Project URL`  → this is `SUPABASE_URL`
   - `anon public` key → this is `SUPABASE_ANON_KEY`
   - `service_role` key → this is `SUPABASE_SERVICE_KEY` *(secret — never commit)*
5. Paste the URL + anon key into [`config.js`](config.js), and set `window.USE_MOCK = false`.

## 2. Financial Modeling Prep (free financial data)

1. Go to https://site.financialmodelingprep.com → sign up (free tier, ~250 req/day).
2. Copy your API key → this is `FMP_API_KEY`.
3. (Free tier is US-focused. For 🇰🇷/🇯🇵/🇨🇳 names, the admin form will let you
   fill numbers by hand into the same snapshot.)

## 3. Vercel environment variables

In the Vercel project → **Settings → Environment Variables**, add:

| Name | Value | Notes |
|------|-------|-------|
| `SUPABASE_URL` | from step 1 | |
| `SUPABASE_SERVICE_KEY` | service_role key | **secret** |
| `FMP_API_KEY` | from step 2 | **secret** |
| `ADMIN_TOKEN` | a long random string you invent | protects the publish endpoint |

> ⚠️ **Commit author must be `WarmWam`** or the Vercel git integration blocks the
> deploy. This repo is already configured with that author.

## 4. Domain + Google AdSense (Phase 4)

1. Buy a domain (Cloudflare Registrar or Namecheap, ~$10/yr). Suggestions:
   `ledgerlens.co`, `ledgerlens.app`.
2. In Vercel → **Domains** → add it; Vercel gives you the DNS records.
3. Publish ~20 real analyses first (AdSense needs real content to approve).
4. Apply at https://adsense.google.com → add the verification snippet to
   `index.html` `<head>` → wait for review.

---

## Where each secret lives

| Secret | Lives in | Exposed to browser? |
|--------|----------|---------------------|
| `SUPABASE_ANON_KEY` | `config.js` | ✅ yes — safe (RLS read-only) |
| `SUPABASE_SERVICE_KEY` | Vercel env only | ❌ never |
| `FMP_API_KEY` | Vercel env only | ❌ never |
| `ADMIN_TOKEN` | Vercel env + you | ❌ never |
