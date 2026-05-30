# Ledger Lens — บทวิเคราะห์หุ้นรายบริษัท

Plain-English equity research, one company a day. A bilingual (TH/EN) finance
blog: each post analyzes one company with charts (revenue, margins), valuation
tables, balance-sheet health, analyst consensus, and a written "Our Take".

Built to the same lightweight stack as the pm25-chiangmai project:
**React 18 + esbuild + Supabase + Vercel** — no framework, no in-browser Babel.

## How it works

```
Admin (you, each morning):
  enter ticker → fetch live financials (FMP) → paste Claude's analysis (TH/EN)
  → Publish → the numbers are FROZEN into a point-in-time snapshot in Supabase

Public site:
  reads only from Supabase → never calls the data API → scales for free,
  numbers always match the analysis date
```

## Architecture

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | React 18 (global scope) + esbuild | `app.jsx`, `components.jsx`, `charts.jsx`, `helpers.jsx` |
| Charts | hand-rolled SVG | no chart library, tiny bundle |
| API | Vercel serverless (`api/`) | proxies FMP + Supabase, keeps keys server-side |
| DB | Supabase (Postgres) | one `analyses` table, `data_snapshot` jsonb |
| Host | Vercel | `vercel.json` build + SPA rewrites |

## Commands

```bash
npm install
node build.mjs          # compile JSX -> dist/ (hashed bundle)
node serve-preview.mjs   # local preview on http://localhost:3200
```

## Status

- [x] **Phase 1** — Scaffold, build pipeline, full company page + charts (mock data)
- [x] **Phase 2** — `api/` functions (companies, company, financials, publish) + admin
      publish flow with live preview. *Code complete & UI-verified; goes live once
      you do the SETUP.md account steps (Supabase + FMP + Vercel env).*
- [x] **Phase 3** — FMP auto-fetch wired into the admin Fetch button (`api/financials.js`).
      *Field mappings may need a one-pass tweak against your real FMP plan's responses.*
- [ ] **Phase 4** — SEO prerender, domain, Google AdSense

See [SETUP.md](SETUP.md) for the by-hand steps (Supabase, FMP key, env vars, domain).

> ⚠ For educational purposes only. Not investment advice.
