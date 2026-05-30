-- ============================================================================
--  Finance Analysis — Supabase schema
--  Run this in the Supabase SQL editor once, after creating your project.
-- ============================================================================

-- One row per published analysis. The editorial content (Our Take, rating)
-- plus a FROZEN snapshot of the financial numbers as of the analysis date.
-- The public site reads only from this table — it never calls the data API.
create table if not exists analyses (
  id             bigint generated always as identity primary key,

  -- Identity
  ticker         text not null,              -- NVDA, 005930.KS, 7203.T, 0700.HK
  slug           text not null unique,       -- nvda-2026-05-30  (URL key)
  name           text not null,              -- NVIDIA Corporation
  name_th        text,                       -- เอ็นวิเดีย
  exchange       text,                       -- NASDAQ / KOSPI / TSE / HKEX
  country        text,                       -- US / KR / JP / CN
  sector         text,
  logo_url       text,

  -- Editorial (bilingual)
  analysis_date  date not null,              -- the "as of" date
  rating         text,                       -- bull / neutral / bear
  summary_en     text,                       -- 1-3 line card summary
  summary_th     text,
  body_en        text,                       -- full markdown "Our Take"
  body_th        text,
  catalysts      jsonb default '[]',         -- [{ "en": "...", "th": "..." }]
  risks          jsonb default '[]',

  -- Frozen numbers (everything the charts/tables render), shape documented
  -- in mock-data.js. Populated from the data API at publish time.
  data_snapshot  jsonb not null default '{}',

  published      boolean default false,
  views          bigint  default 0,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

create index if not exists analyses_ticker_idx    on analyses (ticker);
create index if not exists analyses_published_idx on analyses (published, analysis_date desc);

-- ----------------------------------------------------------------------------
--  Row Level Security: public can READ published rows only.
--  All writes go through the serverless api/ functions using the service-role
--  key (which bypasses RLS), so no write policy is granted to anon here.
-- ----------------------------------------------------------------------------
alter table analyses enable row level security;

drop policy if exists "public reads published" on analyses;
create policy "public reads published"
  on analyses for select
  using (published = true);
