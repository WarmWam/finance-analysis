---
name: equity-research
description: >-
  Research and publish a one-company equity analysis to the Ledger Lens finance
  blog. Use this whenever the user wants to analyze, research, or write up a
  publicly traded company or stock — phrases like "research NVDA", "วิเคราะห์หุ้น
  Samsung", "analyze Toyota", "ทำบทวิเคราะห์ Apple", "เจาะหุ้น <ชื่อ>", or just a
  ticker/company name with intent to study it. Covers US, Korea, Japan, China,
  Hong Kong, and Taiwan listings. The skill researches the latest financials,
  filings, valuation, and analyst views, writes a bilingual (Thai/English)
  11-section analysis, and publishes it to the live website. Trigger this even
  when the user doesn't say "publish" — producing the analysis IS publishing it.
  Do NOT use for day-trading setups, gold/forex/XAUUSD, or price-action questions
  (that's the fx-trading skill), nor for portfolio-wide or macro-only requests.
---

# Equity Research → Ledger Lens

Turn a company name or ticker into a published, bilingual equity analysis on the
Ledger Lens site. The output is a single web page with charts (revenue, margins),
valuation tables, and a written "Our Take" — backed by a point-in-time snapshot of
the numbers as of today.

## How the pieces fit

You do the hard part — research and judgment. A bundled script handles the upload.
The website only displays; it never re-fetches, so the numbers you freeze today are
what readers see, matched to today's date. That's the whole point: an honest record
of "here's what it looked like, and here's what I thought, on this day."

## Workflow

### 1. Identify the company
Resolve the user's input to a ticker + exchange. For non-US names, use the suffix
the data world expects (Samsung → `005930.KS`, Toyota → `7203.T`, Tencent → `0700.HK`).
Confirm the country so the right flag and filing type are used.

### 2. Research (use WebSearch — get *current* numbers)
Search for the most recent data. Run several focused searches rather than one broad
one. You need:
- **Quote**: price, day change %, market cap, and the currency it trades in.
- **5 years of annual** revenue, gross profit, operating income, net income, EPS, free cash flow.
- **Valuation**: P/E, forward P/E, P/S, P/B, EV/EBITDA, PEG — and the ~5-year average P/E and P/S for context.
- **Balance sheet**: cash, total debt, debt/equity, current ratio, interest coverage.
- **Analyst consensus**: counts (strong buy / buy / hold / sell) and price target low/avg/high.
- **Latest filing**: the most recent 10-K/10-Q (or 20-F / 사업보고서 / 有価証券報告書 / 年度报告), its date, URL, and one real highlight.
- **Peers**: 2-4 comparable companies and their P/E.

Good sources: the company's investor-relations page, SEC EDGAR (US), DART (Korea),
EDINET (Japan), HKEXnews (HK), stockanalysis.com, macrotrends, Yahoo Finance,
TradingView. Cross-check at least the headline figures across two sources. If a
data point is genuinely unavailable, use `null` — never invent numbers. A published
analysis with a few honest gaps beats a confident fabrication.

### 3. Analyze — the 11-section framework
Read `references/snapshot-shape.md` for the framework and the exact JSON shape. Form
an actual opinion: is growth accelerating? Are margins expanding (pricing power) or
compressing? Is it cheap or priced for perfection versus its own history and peers?
Can the balance sheet survive a bad year? Decide a **rating** (`bull`/`neutral`/`bear`)
and be able to defend it.

### 4. Write the editorial (bilingual)
- `summary_en` / `summary_th`: 1-3 sharp lines for the home card.
- `body_en` / `body_th`: the "Our Take" in markdown — business overview, why it matters,
  the bull case, the bear case, and your verdict. Specific, numbers-driven, no filler.
- `catalysts` / `risks`: 2-4 concrete items each, as `{ "en": ..., "th": ... }`.

Write Thai that reads naturally to a Thai investor — not a literal translation. The
two languages should make the same argument, each in its own idiom.

### 5. Assemble the record JSON
Build the full record object (see `references/snapshot-shape.md`). All money in raw
units. Set `analysis_date` to today. Save it to a temp file, e.g.
`./.tmp/<ticker>-<date>.json`.

### 6. Publish
Run the bundled script from the skill directory:

```bash
node scripts/publish.mjs ./.tmp/<ticker>-<date>.json
```

It POSTs to `/api/publish` with the admin token and prints the live URL. The token
is read from `finance-analysis/.env` (`LEDGER_ADMIN_TOKEN=...`) — see "First-time
setup" below. On success you'll see `✓ Published: <slug>` and a link.

### 7. Confirm
Give the user the published URL and a 2-3 line recap of your verdict. Offer to revise
the rating or re-run if they push back — re-publishing the same ticker+date overwrites.

## First-time setup (once)

The publish script needs the write token. Put it in `finance-analysis/.env`
(gitignored — never commit it):

```
LEDGER_ADMIN_TOKEN=the-admin-token-you-set-in-vercel
```

Optionally override the target with `LEDGER_PUBLISH_URL=` if the deployment URL changes.

## Notes

- **Save a local copy too** if the user wants a file: write the rendered Our Take to
  `./reports/<ticker>-<date>.md` alongside publishing. Publishing is primary.
- **One company per run.** If asked for several, do them one at a time so each gets
  real research, and confirm between.
- **This is educational analysis, not advice.** The site already carries that
  disclaimer; keep the tone analytical and honest about uncertainty.
