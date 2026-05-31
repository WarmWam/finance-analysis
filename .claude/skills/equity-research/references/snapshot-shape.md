# Record shape & analysis framework

The record you POST is one JSON object. `/api/publish` stores it in the Supabase
`analyses` table; the website renders it via `adapter.js`. Get the shape right and
the page just works.

## The record object (top-level)

```jsonc
{
  // --- Identity ---
  "ticker":        "NVDA",              // exchange ticker; KR/JP use suffix e.g. "005930.KS"
  "name":          "NVIDIA Corporation",// English legal name
  "name_th":       "เอ็นวิเดีย",        // Thai name (transliterate if no common Thai name)
  "exchange":      "NASDAQ",            // NASDAQ | NYSE | KRX | TSE | HKEX | SSE ...
  "country":       "US",               // US | KR | JP | CN | HK | TW  (drives flag tag)
  "sector":        "Semiconductors",   // English sector label (fallback)
  "sector_en":     "Semiconductors",   // explicit English sector (optional if same as sector)
  "sector_th":     "เซมิคอนดักเตอร์",   // Thai sector (optional — adapter uses if present)

  // --- Branding (optional — adapter falls back to first letter of name) ---
  "logo_url":      "",                  // square logo image URL; leave "" to use the monogram. Do NOT use logo.clearbit.com (discontinued).
  "logo_text":     "N",                 // 1-2 char monogram shown when no logo_url
  "logo_color":    "#76b900",           // background colour of the monogram tile
  "logo_ink":      "#ffffff",           // text colour on the monogram tile

  // --- Analysis meta ---
  "analysis_date": "2026-05-30",        // today (YYYY-MM-DD); forms part of the slug
  "rating":        "bull",             // bull | neutral | bear  (your verdict)
  "slug":          "",                  // omit — server derives it as ticker-analysis_date

  // --- Editorial (bilingual) ---
  "summary_en": "One to three punchy lines for the home card.",
  "summary_th": "สรุป 1-3 บรรทัดสำหรับการ์ดหน้าแรก",
  "body_en":    "## What they do\n...markdown 'Our Take'...",
  "body_th":    "## ทำธุรกิจอะไร\n...markdown 'มุมมองของเรา'...",

  "catalysts": [ { "en": "...", "th": "..." } ],  // 2-3 items
  "risks":     [ { "en": "...", "th": "..." } ],  // 2-4 items

  // --- Verdict (optional — if omitted the UI falls back to generic labels) ---
  // verdict answers the 4 standard questions shown in the "Our View" card.
  // tone must be "up" | "neutral" | "down"  (drives the colour/icon).
  "verdict": {
    "interesting": { "label_en": "High interest", "label_th": "น่าสนใจสูง",
                     "detail_en": "FCF growing fast", "detail_th": "FCF ขยายตัวเร็ว",
                     "tone": "up" },
    "margin":      { "label_en": "Margins expanding", "label_th": "มาร์จิ้นดีขึ้น",
                     "detail_en": "Op. margin 2% → 11%", "detail_th": "Op. margin 2% → 11%",
                     "tone": "up" },
    "mainBiz":     { "label_en": "AWS is the profit engine", "label_th": "AWS คือเครื่องยนต์กำไร",
                     "detail_en": "AWS ≈ 60% of op. income", "detail_th": "AWS ≈ 60% ของกำไรดำเนินงาน",
                     "tone": "up" },
    "valuation":   { "label_en": "Expensive but justified", "label_th": "แพงแต่สมเหตุผล",
                     "detail_en": "P/E 38 near 5y avg", "detail_th": "P/E 38 ใกล้ค่าเฉลี่ย 5 ปี",
                     "tone": "neutral" }
  },

  "data_snapshot": { /* see below */ }
}
```

`slug` is derived server-side (`ticker-analysis_date`), so omit it.
Re-publishing the same ticker+date overwrites that day's analysis.

---

## data_snapshot (frozen numbers — charts & tables render from this)

All money values are **raw units** (e.g. `96_307_000_000`, not `"96.3B"`).
Margins are computed by `adapter.js` from the annual figures; do not supply them.

```jsonc
{
  // --- Quote ---
  "quote": {
    "price":      892.50,          // current price in native currency
    "change_pct": 2.31,            // day change %
    "market_cap": 2190000000000,   // market cap in native currency (raw)
    "currency":   "$"              // display symbol: $ ₩ ¥ HK$ NT$
  },

  // --- 5-year annual financials (ascending by year, ≥ 3 rows required) ---
  "annual": [
    {
      "year":             2021,
      "revenue":          16675000000,   // total revenue
      "gross_profit":     10396000000,   // null if not disclosed
      "operating_income": 4532000000,    // EBIT / operating income
      "net_income":       4332000000,    // net income attributable to shareholders
      "eps":              1.73,          // diluted EPS in native currency (not raw)
      "fcf":              4694000000     // free cash flow; null if not disclosed
    }
    // ... repeat for 2022, 2023, 2024, 2025
  ],

  // --- Valuation multiples ---
  // Required: pe, forward_pe, ps, pb, ev_ebitda, peg, pe_avg5, ps_avg5
  // Optional range/peer fields power the range-bar visualization.
  // Naming: <metric>_avg5 | <metric>_low | <metric>_high | <metric>_peer
  "valuation": {
    "pe":               45.2,   "pe_avg5":         38.0,
    "pe_low":           18.0,   "pe_high":         98.0,   "pe_peer":   55.0,
    "forward_pe":       32.1,   "forward_pe_avg5": 28.0,
    "ps":               22.4,   "ps_avg5":         16.2,
    "ps_low":            8.0,   "ps_high":         40.0,   "ps_peer":   18.0,
    "pb":               48.1,   "pb_avg5":         35.0,
    "ev_ebitda":        38.6,   "ev_ebitda_avg5":  30.0,
    "peg":               1.2,   "peg_avg5":         1.4
    // Add *_low, *_high, *_peer for any metric where you have 5-year history data.
    // Omit fields you can't source — adapter renders "—" for nulls.
  },

  // --- Balance sheet ---
  "balance": {
    "cash":               26000000000,  // cash & equivalents (raw)
    "total_debt":          8460000000,  // total debt (raw)
    "de_ratio":                  0.37,  // debt/equity ratio
    "current_ratio":             4.20,  // current ratio
    "interest_coverage":       120.00,  // EBIT / interest expense; null if no debt
    "health_score":              null   // optional 0-100 override; adapter auto-computes if null
  },

  // --- Analyst consensus ---
  "analyst": {
    "strong_buy":  28,
    "buy":         12,
    "hold":         5,
    "sell":         1,
    "strong_sell":  0,
    "target_avg":  1050,   // consensus price target (native currency, raw number)
    "target_low":   750,
    "target_high": 1400
  },

  // --- Peers (for valuation context) ---
  "peers": [
    { "ticker": "AMD",  "pe": 98 },
    { "ticker": "AVGO", "pe": 41 }
  ],

  // --- 1-year daily price history (optional but preferred for new records) ---
  "price_history": {
    "source": "Yahoo Finance chart",
    "source_url": "https://query1.finance.yahoo.com/v8/finance/chart/NVDA?range=1y&interval=1d&events=history&includeAdjustedClose=true",
    "symbol": "NVDA",
    "interval": "1d",
    "range": "1y",
    "currency": "USD",
    "exchange": "NMS",
    "timezone": "America/New_York",
    "fetched_at": "2026-05-30T10:00:00.000Z",
    "candles": [
      { "date": "2025-05-30", "open": 108.12, "high": 110.45, "low": 106.77, "close": 109.30, "adj_close": 109.30, "volume": 280000000 }
    ]
  },

  // --- Latest filing ---
  "filing": {
    "type":         "10-K",              // US: 10-K / 10-Q / 20-F
                                          // KR: 사업보고서 / 분기보고서
                                          // JP: 有価証券報告書 / 四半期報告書
                                          // CN: 年度报告 / Annual Report
    "date":         "2026-02-26",        // YYYY-MM-DD
    "url":          "https://www.sec.gov/...",
    "highlight_en": "FY25 revenue +58% YoY driven by AI/Data Center.",
    "highlight_th": "รายได้ปี FY25 +58% YoY จากกลุ่ม AI / Data Center"
  },

  // --- Insider transactions (optional, 3-5 recent) ---
  "insider": [
    { "name": "J. Huang (CEO)", "action": "sell", "shares": 120000, "date": "2026-03-15" }
  ],

  // --- Segments (optional) ---
  // Include when the company has multiple material business lines.
  // Omit for single-segment companies.
  // See segment-shape.md for the full shape.
  "segments": { /* see segment-shape.md */ }
}
```

---

## The 11-section analysis framework

The page renders these sections in order. Fill each with real, sourced judgment.

| # | Section | Data source |
|---|---------|-------------|
| 1 | **Snapshot** | `quote` + `valuation.pe` + `rating` |
| 2 | **Our View (verdict)** | `verdict` + `rating` + `body` |
| 3 | **1Y price chart** | `price_history` (daily candlesticks, optional) |
| 4 | **Revenue & profit 5y** | `annual` (bar + line chart) |
| 5 | **Margin trend** | derived from `annual` (gross/op/net %) |
| 6 | **Business segments** | `segments` (if present) |
| 7 | **Valuation** | `valuation` — range bars vs 5y avg & peers |
| 8 | **Balance sheet** | `balance` — score + line items |
| 9 | **Analyst consensus** | `analyst` — distribution + target range |
| 10 | **Latest filing** | `filing` |
| 11 | **Catalysts** | `catalysts` |
| 12 | **Risks + Disclaimer** | `risks` |

`body_en`/`body_th` is the "Our Take" narrative (markdown with `## headings`,
`**bold**`, `- bullets`). Keep it specific and number-driven — no filler.

---

## Currency reference

| Country | currency field | Raw unit |
|---------|---------------|----------|
| US      | `$`           | USD      |
| Korea   | `₩`           | KRW      |
| Japan   | `¥`           | JPY      |
| Hong Kong | `HK$`       | HKD      |
| Taiwan  | `NT$`         | TWD      |
| China   | `¥` (or `CNY`) | CNY     |

Use `null` for any field you genuinely cannot source — the UI shows `—` for nulls
and hides empty sections gracefully. Never invent numbers.

`price_history` is optional so old records still render. For new records, prefer
1-year daily OHLCV candles in ascending date order. Use raw listing-currency
prices, keep `source_url` for auditability, and never synthesize missing candles.
