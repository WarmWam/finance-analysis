---
name: equity-research
description: >-
  Research and publish a one-company equity analysis to the Ledger Lens finance
  web app. Use when the user says "research TICKER", "research COMPANY",
  "analyze STOCK",
  "วิเคราะห์หุ้น ชื่อหุ้น", "ทำบทวิเคราะห์ บริษัท", or asks Codex to create a
  stock report for US, Korea, Japan, China, Hong Kong, or Taiwan listings. The
  skill gathers current quote data, financial history, valuation, filings,
  analyst views, business segments, bilingual Thai/English editorial, validates
  the JSON snapshot, and publishes through the existing /api/publish endpoint.
---

# Ledger Lens Equity Research

Create one published Ledger Lens article for one listed company. The web UI is
the contract: produce the same `data_snapshot` shape every time so charts,
segment views, analyst ranges, and tables render consistently.

## Contract

- Use the same record shape as `references/snapshot-shape.md`.
- For multi-business companies, add `data_snapshot.segments` using
  `references/segment-shape.md`.
- Save the record to `./.tmp/<ticker>-<date>.json`.
- Run `scripts/validate-record.mjs` before publishing.
- Publish with `scripts/publish.mjs`, which reads `LEDGER_ADMIN_TOKEN` from the
  repo `.env` and POSTs to Ledger Lens.

## Workflow

1. Resolve the company to the exchange ticker:
   - Samsung Electronics -> `005930.KS`, KOSPI, KR.
   - Toyota -> `7203.T`, TSE, JP.
   - Tencent -> `0700.HK`, HKEX, HK.
   - TSMC -> `2330.TW`, TWSE, TW.

2. Gather current data. Browse/search because quote, analyst, and filing data
   changes. Prefer primary sources first, then reputable aggregators:
   - Company IR annual reports and earnings releases.
   - DART for Korea, EDINET for Japan, HKEXnews for Hong Kong, SEC EDGAR for US.
   - Exchange or broker/market data pages for current quote and market cap.
   - Yahoo Finance, TradingView, StockAnalysis, Macrotrends, CompaniesMarketCap,
     Koyfin-style pages, or FMP endpoint as secondary cross-checks.

3. Capture the required facts:
   - Current quote: price, change %, market cap, currency, and the date/time used.
   - 5 years of annual revenue, gross profit, operating income, net income, EPS,
     and free cash flow. Use raw units.
   - Valuation: trailing P/E, forward P/E, P/S, P/B, EV/EBITDA, PEG, plus 5-year
     average P/E and P/S when available.
   - Balance sheet: cash, total debt, debt/equity, current ratio, interest coverage.
   - Analyst consensus and target price range.
   - Latest filing/report URL, date, type, and one concrete highlight.
   - 2-4 peers with current P/E.
   - Segment data where disclosed. Never invent segment profit if only revenue is
     disclosed; use `null` and explain the limit in segment notes.

4. Analyze with a real verdict:
   - Decide `bull`, `neutral`, or `bear`.
   - Explain growth, margin trend, valuation, balance sheet resilience, catalysts,
     and risks.
   - For complex groups, identify the growth engine, profit engine, weak segment,
     and disclosure quality.
   - Write natural Thai for Thai investors; do not mechanically translate English.

5. Build the JSON record:
   - `summary_en` and `summary_th`: 1-3 sharp lines for the home card.
   - `body_en` and `body_th`: markdown narrative with headings and specific numbers.
   - `catalysts` and `risks`: 2-4 concrete items each.
   - `data_snapshot`: exact display data for the web app.

6. Validate and publish from the repo root:

```powershell
node .codex/skills/equity-research/scripts/validate-record.mjs ./.tmp/<ticker>-<date>.json
node .codex/skills/equity-research/scripts/publish.mjs ./.tmp/<ticker>-<date>.json
```

7. Verify:
   - Open `/api/company?slug=<slug>` or the live `/company/<slug>` page.
   - Confirm the article loads, current price appears in snapshot and analyst
     chart, and segment UI appears when `segments` exists.
   - Tell the user the live URL, rating, and the 2-3 most important reasons.

## Codex Quality Bar

- Cross-check headline numbers across at least two sources unless one primary
  filing/source is definitive.
- Use `null` for unavailable values; do not fill gaps with guesses.
- Keep all money values in raw units, not formatted strings.
- Keep the final JSON parseable and deterministic.
- If the source data conflicts, prefer the filing for historical financials and
  current market data for price/market cap; mention the conflict briefly.
- If publishing fails, report the HTTP error and do not pretend the article is live.
