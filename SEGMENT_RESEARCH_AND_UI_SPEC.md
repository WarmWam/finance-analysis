# Segment Research & UI Spec

This spec designs the next Ledger Lens layer: segment-level business analysis.
The goal is to cover most listed companies in the US, Japan, China, Hong Kong,
and similar markets without hard-coding one company style.

## Research Basis

Segment reporting is not standardized by a fixed list of business lines. The
common principle across major regimes is that segment disclosure usually follows
how management runs the company:

- US GAAP ASC 280: management approach; reportable segments are based on how
  management organizes the business for decisions and performance review.
- IFRS 8: operating segments follow internal reports reviewed by the CODM; also
  requires entity-wide product/service and geographic disclosures when relevant.
- Japan ASBJ Statement No.17: segment disclosure standard; Japan filings commonly
  show reportable segment sales, segment profit, assets, and adjustments.
- China ASBE No.35: requires segment disclosure for multi-business or
  cross-regional businesses; distinguishes business and geographical segments.

The design implication: use flexible segment sets/lenses, not a fixed schema like
`segment1`, `segment2`, `segment3`.

## Coverage Model

Use two separate concepts:

1. **Industry/Sector Classification**
   Store broad peer context such as GICS sector/industry. GICS is useful for
   peers and valuation context, but it assigns a company to one principal
   business activity, so it cannot explain conglomerates or multi-engine
   companies by itself.

2. **Segment Disclosure Lenses**
   Store the company's actual reported business breakdown. A company can have
   more than one lens, for example Alphabet has reportable segments
   (`Google Services`, `Google Cloud`, `Other Bets`) and product revenue lines
   (`Search`, `YouTube ads`, etc.).

## Main Business Disclosure Archetypes

These 9 archetypes should cover almost everything we will see in US, Japan,
China, and Hong Kong equities.

| # | Archetype | What It Covers | Examples | UI Need |
|---|---|---|---|---|
| 1 | Single segment / pure-play | One main business; segment disclosure is minimal | many SaaS, semiconductor, small manufacturers | Hide segment chart or show single-segment card |
| 2 | Product / service lines | Revenue by products/services | Apple product lines, Alphabet product revenue, medical devices | 100% revenue mix, growth by line |
| 3 | Management reportable segments | Segments used internally by CODM | Alphabet Services/Cloud/Other Bets, Amazon NA/Intl/AWS | Revenue + operating income + margin |
| 4 | Geographic regions | Regions are the main economic lens | Bridgestone, Fast Retailing, many Japan exporters | Region mix, FX sensitivity note |
| 5 | Channel / customer type | DTC vs wholesale, enterprise vs consumer, online vs offline | retail, software, consumer brands | Channel mix, margin if disclosed |
| 6 | Platform / marketplace model | GMV, take rate, ads, logistics, cloud, merchant services | Alibaba, JD, Meituan, Amazon marketplace | Revenue + operating metrics, not just sales |
| 7 | Financial balance-sheet model | Banks, insurers, brokers, lending arms | banks, insurers, Toyota Financial Services | NII, premiums, loans, AUM, combined ratio |
| 8 | Asset / commodity / regulated model | Energy, miners, utilities, REITs, infrastructure | oil & gas, utilities, real estate | Volume, realized price, reserves/rate base |
| 9 | Holding / conglomerate / investment model | Many unrelated businesses or investment holdings | Berkshire, SoftBank, Tencent investments | NAV-like view, segment value, investment gains |

## Proposed Snapshot Shape

Add optional `data_snapshot.segments`. The current site can continue to work when
this field is absent.

```jsonc
{
  "data_snapshot": {
    "segments": {
      "source_standard": "ASC 280",
      "source_url": "https://...",
      "currency": "$",
      "fiscal_years": [2021, 2022, 2023, 2024, 2025],
      "primary_lens": "reportable_segments",
      "disclosure_quality": "A",
      "notes": [
        "Product revenue is disclosed, but product-level operating income is not."
      ],
      "sets": [
        {
          "id": "reportable_segments",
          "label_en": "Reportable Segments",
          "label_th": "ส่วนงานที่บริษัทรายงาน",
          "kind": "management",
          "metrics": ["revenue", "operating_income", "assets", "capex"],
          "items": [
            {
              "id": "google-cloud",
              "name_en": "Google Cloud",
              "name_th": "Google Cloud",
              "description_en": "Cloud infrastructure, platforms, and Workspace.",
              "annual": [
                {
                  "year": 2025,
                  "revenue": 50000000000,
                  "operating_income": 8000000000,
                  "assets": null,
                  "capex": null
                }
              ]
            }
          ],
          "reconciliation": [
            {
              "year": 2025,
              "consolidated_revenue": 402836000000,
              "segment_revenue_total": 402836000000,
              "eliminations": 0,
              "unallocated": 0
            }
          ]
        },
        {
          "id": "product_revenue",
          "label_en": "Product Revenue",
          "label_th": "รายได้แยกตามผลิตภัณฑ์",
          "kind": "product",
          "metrics": ["revenue"],
          "items": []
        }
      ]
    }
  }
}
```

## UI Design

Add a new section after Revenue & Profit:

### Business Segments

Controls:

- Segment set dropdown: `Reportable Segments`, `Product Revenue`, `Geography`,
  `Channel`, or other sets found in the filing.
- Metric dropdown: `Revenue`, `Operating Income`, `Operating Margin`,
  `YoY Growth`, `Assets`, `Capex`.
- Toggle: `Absolute` vs `Mix %`.

Charts:

- 100% stacked bar for revenue/profit mix over 5 years.
- Absolute stacked bar for scale.
- Segment margin line or small multiples when operating income is available.
- Segment table with latest value, 5Y CAGR, latest mix %, margin, trend label.

Disclosure states:

- If a metric is not disclosed, show `Not disclosed` rather than estimating.
- If product revenue exists but product profit does not, show revenue mix only.
- If there is one segment, show a compact card and explain that no meaningful
  segment breakdown was disclosed.

## Skill Research Instructions

When researching a company, the finance skill should:

1. Find the latest annual filing first: 10-K/20-F, annual report, securities
   report, or China annual report.
2. Search inside the filing for: `segment`, `operating segments`,
   `reportable segments`, `revenue by`, `geographic`, `product`, `customer`,
   `CODM`, `chief operating decision maker`, `分部`, `セグメント`.
3. Extract the primary reportable segments for 5 fiscal years when available.
4. Extract secondary product/service revenue and geography if disclosed.
5. For each segment/year, capture only disclosed values:
   `revenue`, `external_revenue`, `intersegment_revenue`, `operating_income`,
   `adjusted_ebitda`, `assets`, `capex`, `depreciation`, `unit_volume`,
   `operating_metric`.
6. Reconcile segment revenue/profit to consolidated totals. Store eliminations
   and unallocated corporate costs separately.
7. Choose an archetype from the 9 above and write one short interpretation:
   which segment is the growth engine, profit engine, cash drain, or risk source.
8. Set unknown values to `null`; never infer product-level profit if the company
   does not disclose it.
9. Add `disclosure_quality`:
   - `A`: revenue and operating profit by segment for 5 years.
   - `B`: revenue by segment but partial profit or shorter history.
   - `C`: only qualitative or one-year data.
   - `D`: no useful segment disclosure.

## Implementation Phases

1. Extend `snapshot-shape.md` with optional `segments`.
2. Update the skill to research and populate `segments`.
3. Add UI section with dropdowns and 100% stacked bar.
4. Backfill one example each:
   - Alphabet: reportable + product revenue.
   - Amazon: reportable segments.
   - Toyota: automotive + financial services + geography if available.
   - Alibaba/Tencent: platform/conglomerate style, with disclosure notes.

## Reference Links

- ASC 280 / FASB-style management approach:
  https://dart.deloitte.com/USDART/home/codification/presentation/asc280-10/roadmap-segment-reporting/chapter-3-reportable-segments/3-1-overview
- IFRS 8 operating segments:
  https://www.ifrs.org/content/dam/ifrs/publications/pdf-standards/english/2021/issued/part-a/ifrs-8-operating-segments.pdf?bypass=on
- IFRS 8 entity-wide disclosures:
  https://www.grantthornton.global/en/insights/articles/ifrs-8/ifrs-8-entity-wide-disclosures/
- Japan ASBJ Statement No.17:
  https://www.asb-j.jp/en/accounting_standards/y2008/2008-0321.html
- China ASBE No.35 Segment Reporting:
  https://www.cbize.com/upload/lawregulation/No.35.pdf
- GICS industry classification:
  https://www.msci.com/our-solutions/indexes/gics
