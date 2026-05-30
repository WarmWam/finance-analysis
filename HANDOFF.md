# HANDOFF — for any agent (Codex / Antigravity / Claude) continuing this project

Read this first. It captures the current state, the non-obvious gotchas that will
break you if ignored, and the exact remaining tasks. Pair it with [README.md](README.md)
(architecture) and [SETUP.md](SETUP.md) (account steps).

## Current state — DONE & LIVE

- **Live:** https://finance-analysis-eight.vercel.app
- **Repo:** https://github.com/WarmWam/finance-analysis (branch `main`)
- **Verified working:** home `200`; `/api/companies` → `[]` (Supabase connected,
  `analyses` table exists, no rows yet); `/api/company` → `404` for unknown slug;
  `/api/financials` → `401` without admin token; SPA rewrites (`/admin`,
  `/company/*`) → `200`.
- **What's built:** Phases 1–3 (see README roadmap). Bilingual TH/EN finance blog,
  full company page with hand-rolled SVG charts, point-in-time snapshot model,
  `/admin` publish flow with live preview.
- **No articles published yet.** Home shows the empty state until the first publish.

## ⚠️ Gotchas — ignore these and you WILL break the build/deploy

1. **IIFE + global scope.** `build.mjs` wraps each source file in its own IIFE.
   A `function foo(){}` in one file is **not** visible to another. Every symbol
   used across files MUST be re-exported at the end of its file via
   `Object.assign(window, { foo, ... })`. The app uses the **global** `React`
   (classic JSX runtime, `jsx: 'transform'`) — do not `import React`.

2. **Commit author MUST be `WarmWam`** (`git config user.name WarmWam`). The Vercel
   git integration is tied to that account; a different author gets the deploy
   BLOCKED. Email stays `asuna.posie@gmail.com`. (Repo is already configured.)

3. **Never put `SUPABASE_SERVICE_KEY` (or `FMP_API_KEY`, `ADMIN_TOKEN`) in
   `config.js`** or any committed file — `config.js` is bundled into client JS.
   Only `SUPABASE_URL` + `SUPABASE_ANON_KEY` go there. Secrets live in Vercel env.

4. **`index.html` build markers:** the build replaces everything between
   `<!-- app scripts -->` and `</body>` with the hashed bundle. Do NOT write the
   literal string `</body>` inside any comment/text before the real one, or the
   slice breaks (this bit us once).

5. **Build order matters** (`build.mjs` `order` array): helpers/charts/components
   must load before `admin.jsx` and `app.jsx` so their `window` exports exist.

6. **`window.USE_MOCK`** in `config.js`: `false` = read from `api/` (production).
   Set `true` only for local mock-data preview (no Supabase needed).

## Data model

One Supabase table `analyses` (see [schema.sql](schema.sql)). Editorial fields +
a frozen `data_snapshot` jsonb. The exact snapshot shape is documented at the top
of [mock-data.js](mock-data.js) — that file is the source of truth for the shape
the charts/tables expect. RLS: public can SELECT `published=true`; all writes go
through `api/publish.js` with the service key.

## Remaining tasks (in priority order)

### A. Finish Phase 3 — verify FMP field mappings  *(needs a real FMP key)*
`api/financials.js` was written without a live key to test against. When the user
adds `FMP_API_KEY` and clicks **Fetch financials** in `/admin`, compare the result
to FMP's actual JSON for that plan. Fix ONLY the mapping blocks (each section is
clearly commented). FMP recently introduced a "stable" API namespace — if v3 paths
404, the base/paths in the `fmp()` helper are the single place to change.
The `_warnings` array already surfaces which sections failed.

### B. Phase 4 — SEO + AdSense readiness
- **Prerender for SEO/AdSense.** The site is currently client-rendered, so crawlers
  see an empty `#root`. Add a build step that reads published `analyses` from
  Supabase and emits static HTML per `/company/:slug` (and a real home list) into
  `dist/`, so each page ships real content. Extend `build.mjs` (it already writes
  `dist/index.html`); generate one HTML file per slug with the analysis text inlined
  in `<main>` plus `<title>`/`<meta description>`/OpenGraph per company. Keep the
  client bundle for interactivity (hydrate or just progressive-enhance).
- **`sitemap.xml` + `robots.txt`** generated at build from the published slugs.
- **JSON-LD** (`Article` / `FinancialProduct`) per company page for rich results.
- **Google AdSense:** add the AdSense script to `index.html` `<head>` and ad slots
  in the article layout (e.g. after the snapshot and between sections in
  `AnalysisView`, `components.jsx`). Needs ~20 real articles before applying.
- **Custom domain** via Vercel (see SETUP.md step 4).

### C. Future — social/video
Each analysis is markdown; add an endpoint or build step that condenses `body_*`
into a 60-second script (hook + 3 points + takeaway) for YouTube Shorts / Reels.

## Local dev

```bash
npm install
node build.mjs           # -> dist/ (hashed bundle)
node serve-preview.mjs    # http://localhost:3200  (serves dist/, SPA fallback)
```
`serve-preview.mjs` does not proxy `/api/*`; for full local testing set
`USE_MOCK=true`, or test against the deployed URL.

## Env vars (Vercel project settings)

| Name | Secret? | Status |
|------|---------|--------|
| `SUPABASE_URL` | no | set |
| `SUPABASE_SERVICE_KEY` | **yes** | set |
| `ADMIN_TOKEN` | **yes** | set (protects `/admin` fetch + publish) |
| `FMP_API_KEY` | **yes** | NOT set yet — Fetch button needs it |
