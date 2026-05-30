# Record shape & analysis framework

The record you POST is one JSON object. `/api/publish` stores it in the Supabase
`analyses` table; the website renders it. Get the shape right and the page just works.

## The record object

```jsonc
{
  "ticker": "NVDA",              // exchange ticker; KR/JP use suffix e.g. "005930.KS", "7203.T"
  "name": "NVIDIA Corporation",  // English legal name
  "name_th": "เอ็นวิเดีย",        // Thai name (transliterate if no common Thai name)
  "exchange": "NASDAQ",          // NASDAQ / NYSE / KOSPI / TSE / HKEX / SSE ...
  "country": "US",               // US / KR / JP / CN / HK / TW  (drives the flag tag)
  "sector": "Semiconductors",
  "analysis_date": "2026-05-30", // today (YYYY-MM-DD); also forms the slug
  "rating": "bull",              // bull | neutral | bear  (your verdict)
  "summary_en": "One to three punchy lines for the home card.",
  "summary_th": "สรุป 1-3 บรรทัดสำหรับการ์ดหน้าแรก",
  "body_en": "## What they do\\n...markdown...",   // the full "Our Take", markdown
  "body_th": "## ทำธุรกิจอะไร\\n...markdown...",
  "catalysts": [ { "en": "...", "th": "..." } ],   // 2-3 items
  "risks":     [ { "en": "...", "th": "..." } ],   // 2-4 items
  "data_snapshot": { /* see below — the frozen numbers */ }
}
```
`slug` is derived server-side (`ticker-analysis_date`), so you can omit it.
Re-publishing the same ticker+date overwrites that day's analysis.

## data_snapshot (the frozen numbers the charts/tables render)

All money values are in **raw units** (e.g. 96_307_000_000, not "96.3B"). Margins
are computed by the UI from the annual figures, so you don't supply them separately.

```jsonc
{
  "quote": { "price": 892.50, "change_pct": 2.31, "market_cap": 2190000000000, "currency": "$" },
  "valuation": { "pe": 45.2, "forward_pe": 32.1, "ps": 22.4, "pb": 48.1,
                 "ev_ebitda": 38.6, "peg": 1.2, "pe_avg5": 38.0, "ps_avg5": 16.2 },
  "annual": [   // ascending by year, ~5 years; the bar + margin charts use this
    { "year": 2021, "revenue": 16675000000, "gross_profit": 10396000000,
      "operating_income": 4532000000, "net_income": 4332000000, "eps": 1.73, "fcf": 4694000000 }
    // ... 2022, 2023, 2024, 2025
  ],
  "balance": { "cash": 26000000000, "total_debt": 8460000000, "de_ratio": 0.37,
               "current_ratio": 4.2, "interest_coverage": 120 },
  "analyst": { "strong_buy": 28, "buy": 12, "hold": 5, "sell": 1,
               "target_avg": 1050, "target_low": 750, "target_high": 1400 },
  "peers": [ { "ticker": "AMD", "pe": 98 }, { "ticker": "AVGO", "pe": 41 } ],
  "filing": { "type": "10-K", "date": "2026-02-26", "url": "https://www.sec.gov/...",
              "highlight_en": "FY25 revenue +58% YoY...", "highlight_th": "รายได้ปี FY25 +58%..." },
  "insider": [ { "name": "J. Huang (CEO)", "action": "sell", "shares": 120000, "date": "2026-03-15" } ],
  "segments": { /* optional — see segment-shape.md for multi-business companies */ }
}
```

**`currency`** is the display symbol: `$` US, `₩` Korea, `¥` Japan/China, `HK$` HK, `NT$` Taiwan.
Any field you genuinely can't source: set numbers to `null` and arrays to `[]` rather
than guessing. The UI shows `—` for nulls and hides empty sections gracefully.

**`filing.type`** by country: US `10-K`/`10-Q` (foreign ADR `20-F`); Korea `사업보고서`
(annual) / `분기보고서` (quarterly); Japan `有価証券報告書` / `四半期報告書`; China A-share
`年度报告`, H-share `Annual Report`.

## The 11-section analysis framework (what to actually think about)

The page renders these sections; your job is to fill them with real, sourced judgment.

1. **Snapshot** — price, market cap, P/E, rating. (from `quote` + `valuation` + `rating`)
2. **Business overview** — what they do, where revenue comes from, the moat. (in `body`)
3. **Revenue & profit** — 5y trend; is growth accelerating or stalling? (`annual`)
4. **Margins** — gross/operating/net trend; expanding = pricing power. (derived from `annual`)
5. **Valuation** — P/E, P/S, P/B, EV/EBITDA, PEG vs the 5y average and peers. Cheap or priced for perfection?
6. **Balance sheet** — cash vs debt, current ratio, interest coverage. Can it survive a bad year?
7. **Analyst consensus** — the Street's distribution and price target range.
8. **Latest filing** — one honest highlight from the most recent 10-K/10-Q (or local equivalent).
9. **Catalysts** — 2-3 concrete things that could push the stock up.
10. **Risks** — 2-4 real risks (competition, regulation, customer concentration, macro, valuation).
11. **Our Take** — the synthesis: bull case, bear case, and your verdict with reasoning. This is the value.

Write `body_en`/`body_th` as the Our Take narrative (use `## headings`, `**bold**`,
`- bullets`). Keep it sharp and specific — numbers and judgment, not generic filler.
The Thai version should read naturally, not a literal word-for-word translation.
