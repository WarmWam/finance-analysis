/* home.jsx — Home / Analysis List + state components (exported to window) */

function StockCard({ c, onOpen, lang }) {
  return (
    <button className="stock-card" onClick={() => onOpen(c.id)} style={{ textAlign: "left" }}>
      <div className="sc-top">
        <MonoLogo c={c} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sc-name">{c.name}</div>
          <div className="sc-meta">
            <span className="tk">{c.ticker}</span>
            <span className="sep-dot" />
            <span>{c.countryName} · {c.exchange}</span>
          </div>
          <div className="sc-meta" style={{ marginTop: 1 }}>{c.sector}</div>
        </div>
        <RatingPill rating={c.rating} label={c.ratingLabel} />
      </div>
      <div className="sc-summary">{c.summary}</div>
      <div className="sc-stats">
        <div className="sc-stat" style={{ marginRight: "auto" }}>
          <div className="k">{t('price_label', lang)}</div>
          <div className="v">{c.price.now}</div>
        </div>
        <div className="sc-stat">
          <div className="k">{t('market_cap', lang)}</div>
          <div className="v">{c.price.marketCap}</div>
        </div>
        <div className="sc-stat">
          <div className="k">{t('pe_label', lang)}</div>
          <div className="v">{c.price.pe}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
          <Sparkline data={c.financials.revenue} w={70} h={26} color="var(--accent)" />
          <div className="tiny muted" style={{ marginTop: 2 }}>{t('rev_5y_label', lang)}</div>
        </div>
      </div>
      <div className="sc-foot">
        <span className="tiny muted">{t('analyzed_at', lang)} {c.analysisDate}</span>
        <span className="tiny" style={{ color: "var(--accent-ink)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 3 }}>
          {t('view_analysis', lang)} <IconArrowRight style={{ width: 13, height: 13 }} />
        </span>
      </div>
    </button>
  );
}

function HomeList({ companies, onOpen, forceError, lang }) {
  const [q, setQ] = React.useState("");
  const [country, setCountry] = React.useState(null);
  const [rating, setRating] = React.useState(null);

  const countryLabel = (c) => {
    const key = 'c_' + String(c.country || '').toLowerCase();
    const translated = t(key, lang);
    return translated === key ? (c.countryName || c.country) : translated;
  };
  const countryCounts = (companies || []).reduce((acc, c) => {
    if (c.country) acc[c.country] = (acc[c.country] || 0) + 1;
    return acc;
  }, {});
  const countries = Array.from(
    new Map((companies || [])
      .filter((c) => c.country)
      .map((c) => [c.country, { code: c.country, label: countryLabel(c) }])
    ).values()
  ).sort((a, b) => a.label.localeCompare(b.label, lang === 'th' ? 'th' : 'en'));
  const ratings = [
    { code: "bull", label: t('rating_bull', lang) }, 
    { code: "neutral", label: t('rating_neutral', lang) }, 
    { code: "bear", label: t('rating_bear', lang) },
  ];

  if (forceError) return <ErrorState lang={lang} />;

  const filtered = companies.filter((c) => {
    if (country && c.country !== country) return false;
    if (rating && c.rating !== rating) return false;
    if (q.trim()) {
      const s = (c.name + " " + (c.nameTh || "") + " " + c.ticker + " " + c.sector).toLowerCase();
      if (!s.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });

  const hasFilter = country || rating || q.trim();

  return (
    <div className="container">
      <div className="home-hero">
        <div className="eyebrow">{t('latest_research_eyebrow', lang)}</div>
        <h1>{t('site_name', lang)}</h1>
        <p className="small muted" style={{ margin: "2px 0 0" }}>{t('tagline', lang)}</p>
      </div>

      <div style={{ display: "flex", gap: 10, margin: "6px 0 12px" }}>
        <div className="search">
          <IconSearch />
          <input placeholder={t('search_placeholder', lang)} value={q} onChange={(e) => setQ(e.target.value)} />
          {q && <button className="icon-btn" style={{ width: 30, height: 30, border: "none" }} onClick={() => setQ("")}><IconX style={{ width: 15, height: 15 }} /></button>}
        </div>
      </div>

      <div className="chips noscroll" style={{ marginBottom: 16 }}>
        {countries.map((c) => (
          <button key={c.code} className={"chip" + (country === c.code ? " on" : "")} onClick={() => setCountry(country === c.code ? null : c.code)}>
            {c.label}<span style={{ opacity: 0.55, fontSize: "0.85em", marginLeft: 4 }}>({countryCounts[c.code] || 0})</span>
          </button>
        ))}
        <span style={{ width: 1, background: "var(--border-2)", margin: "4px 2px", flex: "none" }} />
        {ratings.map((r) => (
          <button key={r.code} className={"chip" + (rating === r.code ? " on" : "")} onClick={() => setRating(rating === r.code ? null : r.code)}>
            <span className="dot" style={{ width: 7, height: 7, borderRadius: 99, background: r.code === "bull" ? "var(--bull)" : r.code === "bear" ? "var(--bear)" : "var(--warn)" }} />{r.label}
          </button>
        ))}
        {hasFilter && <button className="chip" onClick={() => { setCountry(null); setRating(null); setQ(""); }} style={{ color: "var(--accent-ink)" }}>{t('clear_filters', lang)}</button>}
      </div>

      {filtered.length === 0 ? (
        <EmptyState lang={lang} onClear={() => { setCountry(null); setRating(null); setQ(""); }} />
      ) : (
        <div className="card-grid">
          {filtered.map((c) => <StockCard key={c.id} c={c} onOpen={onOpen} lang={lang} />)}
        </div>
      )}
    </div>
  );
}

/* ---------- states ---------- */
function LoadingState() {
  return (
    <div className="container">
      <div className="home-hero">
        <div className="skel" style={{ width: 140, height: 12, marginBottom: 10 }} />
        <div className="skel" style={{ width: 220, height: 26 }} />
      </div>
      <div className="skel" style={{ height: 46, borderRadius: 13, margin: "12px 0 16px" }} />
      <div className="card-grid">
        {[0, 1, 2, 3].map((i) => (
          <div className="stock-card" key={i}>
            <div className="sc-top">
              <div className="skel" style={{ width: 42, height: 42, borderRadius: 11 }} />
              <div style={{ flex: 1 }}>
                <div className="skel" style={{ width: "70%", height: 15, marginBottom: 7 }} />
                <div className="skel" style={{ width: "45%", height: 11 }} />
              </div>
              <div className="skel" style={{ width: 70, height: 24, borderRadius: 99 }} />
            </div>
            <div className="skel" style={{ height: 32, marginTop: 4 }} />
            <div className="skel" style={{ height: 40, marginTop: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onClear, lang }) {
  return (
    <div className="state">
      <div className="ic-wrap"><IconEmpty style={{ width: 26, height: 26 }} /></div>
      <h3>{t('empty_state_title', lang)}</h3>
      <p>{t('empty_state_desc', lang)}</p>
      {onClear && <button className="btn" onClick={onClear}>{t('clear_filters', lang)}</button>}
    </div>
  );
}

function ErrorState({ onRetry, lang }) {
  return (
    <div className="state">
      <div className="ic-wrap" style={{ background: "var(--bear-soft)", color: "var(--bear)" }}><IconErrorIc style={{ width: 26, height: 26 }} /></div>
      <h3>{t('error_state_title', lang)}</h3>
      <p>{t('error_state_desc', lang)}</p>
      <button className="btn primary" onClick={onRetry}>{t('retry_btn', lang)}</button>
    </div>
  );
}

Object.assign(window, { HomeList, StockCard, LoadingState, EmptyState, ErrorState });
