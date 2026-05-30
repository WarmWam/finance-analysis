# Optional segment analysis shape

Use this when the company has multiple business engines, geographies, channels,
or product/service lines. Leave `data_snapshot.segments` absent when the company
is a clean single-segment business and the filing does not disclose meaningful
segment data.

## Segment archetypes

Classify the company with one primary archetype:

1. `single_segment` - one main business; little or no segment disclosure.
2. `product_service` - product or service revenue lines.
3. `reportable_segments` - CODM / management reportable segments.
4. `geography` - regions are the main operating lens.
5. `channel_customer` - DTC/wholesale, enterprise/consumer, online/offline.
6. `platform_marketplace` - GMV, take rate, marketplace, logistics, ads.
7. `financial_services` - bank, insurer, broker, lending or leasing arm.
8. `asset_commodity_regulated` - energy, mining, utilities, REITs, infrastructure.
9. `holding_conglomerate` - holding company, investment company, conglomerate.

## JSON shape

```jsonc
"segments": {
  "source_standard": "ASC 280",       // ASC 280 | IFRS 8 | J-GAAP | ASBE 35 | Company KPI
  "source_url": "https://...",
  "currency": "$",
  "fiscal_years": [2021, 2022, 2023, 2024, 2025],
  "primary_lens": "reportable_segments",
  "archetype": "reportable_segments",
  "disclosure_quality": "A",          // A | B | C | D
  "notes": [
    "Product revenue is disclosed, but product-level operating income is not."
  ],
  "sets": [
    {
      "id": "reportable_segments",
      "label_en": "Reportable Segments",
      "label_th": "ส่วนงานที่บริษัทรายงาน",
      "kind": "management",           // management | product | geography | channel | metric
      "metrics": ["revenue", "operating_income", "assets", "capex"],
      "items": [
        {
          "id": "cloud",
          "name_en": "Cloud",
          "name_th": "Cloud",
          "description_en": "Cloud infrastructure and SaaS products.",
          "annual": [
            {
              "year": 2025,
              "revenue": 50000000000,
              "external_revenue": null,
              "intersegment_revenue": null,
              "operating_income": 8000000000,
              "adjusted_ebitda": null,
              "assets": null,
              "capex": null,
              "depreciation": null,
              "unit_volume": null,
              "operating_metric": null
            }
          ]
        }
      ],
      "reconciliation": [
        {
          "year": 2025,
          "consolidated_revenue": 100000000000,
          "segment_revenue_total": 100000000000,
          "consolidated_operating_income": 25000000000,
          "segment_operating_income_total": 27000000000,
          "eliminations": 0,
          "unallocated": -2000000000
        }
      ]
    }
  ]
}
```

## Research rules

- Search latest annual filing first, then quarterly updates.
- Search filing text for: `segment`, `operating segments`, `reportable segments`,
  `revenue by`, `geographic`, `product`, `customer`, `CODM`, `chief operating
  decision maker`, `分部`, `セグメント`.
- Capture 5 years when available; use shorter history if the segment structure
  changed, and note the change.
- Reconcile segment totals to consolidated totals; store eliminations and
  unallocated corporate costs separately.
- Do not estimate segment operating income if the company only discloses revenue.
- Use `null` for missing values and explain disclosure limits in `notes`.
- Set disclosure quality:
  - `A`: 5-year revenue and profit by segment.
  - `B`: revenue plus partial profit or shorter history.
  - `C`: one-year or mostly qualitative segment data.
  - `D`: no useful segment disclosure.
