// Reusable UI pieces: nav, badges, list cards, and the company-page sections.

function RatingBadge({ rating, lang }) {
  const r = (window.RATINGS || {})[rating] || window.RATINGS.neutral;
  return <span className={`badge rating-${r.cls}`}>{r.emoji} {lang === 'th' ? r.label_th : r.label_en}</span>;
}

function CountryTag({ country, exchange }) {
  const c = (window.COUNTRIES || {})[country] || { flag: '🏳️', label: country || '' };
  return <span className="tag">{c.flag} {exchange || c.label}</span>;
}

function Nav({ lang, setLang }) {
  return (
    <header className="nav">
      <div className="nav-inner">
        <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <span className="brand-mark">◧</span>
          <span className="brand-name">{t('site_name', lang)}</span>
        </a>
        <nav className="nav-links">
          <a href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t('nav_all', lang)}</a>
          <button className="lang-toggle" onClick={() => setLang(lang === 'th' ? 'en' : 'th')}>
            {lang === 'th' ? 'EN' : 'ไทย'}
          </button>
        </nav>
      </div>
    </header>
  );
}

function Footer({ lang }) {
  return (
    <footer className="footer">
      <p className="disclaimer">⚠ {t('disclaimer', lang)}</p>
      <p className="copy">© {new Date().getFullYear()} {t('site_name', lang)}</p>
    </footer>
  );
}

// --- list page card ---------------------------------------------------------
function AnalysisCard({ a, lang }) {
  const cur = a.data_snapshot?.quote?.currency || '$';
  const mc = a.data_snapshot?.quote?.market_cap;
  return (
    <article className="card" onClick={() => navigate(`/company/${a.slug}`)}>
      <div className="card-top">
        <div className="card-id">
          <span className="ticker">{a.ticker}</span>
          <CountryTag country={a.country} exchange={a.exchange} />
        </div>
        <RatingBadge rating={a.rating} lang={lang} />
      </div>
      <h3 className="card-name">{lang === 'th' && a.name_th ? a.name_th : a.name}</h3>
      <p className="card-summary">{pick(a, 'summary', lang)}</p>
      <div className="card-meta">
        <span>{t('market_cap', lang)}: <b>{fmtBig(mc, cur)}</b></span>
        <span className="dot-sep">·</span>
        <span>{t('as_of', lang)} {fmtDate(a.analysis_date, lang)}</span>
      </div>
    </article>
  );
}

// --- company page sections --------------------------------------------------
function Snapshot({ a, lang }) {
  const s = a.data_snapshot || {};
  const q = s.quote || {};
  return (
    <div className="snapshot">
      <div className="snap-head">
        <div className="snap-id">
          <h1>{lang === 'th' && a.name_th ? a.name_th : a.name}</h1>
          <div className="snap-tags">
            <span className="ticker lg">{a.ticker}</span>
            <CountryTag country={a.country} exchange={a.exchange} />
            <span className="tag">{a.sector}</span>
          </div>
        </div>
        <RatingBadge rating={a.rating} lang={lang} />
      </div>
      <div className="snap-stats">
        <div className="stat">
          <span className="stat-val">{q.currency}{fmtNum(q.price, 2)}</span>
          <span className={`stat-chg ${q.change_pct >= 0 ? 'up' : 'down'}`}>{fmtSignedPct(q.change_pct)}</span>
        </div>
        <div className="stat"><span className="stat-k">{t('market_cap', lang)}</span><span className="stat-v">{fmtBig(q.market_cap, q.currency)}</span></div>
        <div className="stat"><span className="stat-k">{t('m_pe', lang)}</span><span className="stat-v">{fmtX(s.valuation?.pe)}</span></div>
        <div className="stat"><span className="stat-k">{t('as_of', lang)}</span><span className="stat-v">{fmtDate(a.analysis_date, lang)}</span></div>
      </div>
    </div>
  );
}

function Section({ id, title, children, sub }) {
  return (
    <section className="section" id={id}>
      <h2 className="section-title">{title}{sub && <span className="section-sub">{sub}</span>}</h2>
      {children}
    </section>
  );
}

function ValuationTable({ valuation, peers, lang }) {
  if (!valuation) return null;
  const rows = [
    ['m_pe', 'pe', 'pe_avg5'],
    ['m_fwd_pe', 'forward_pe', null],
    ['m_ps', 'ps', 'ps_avg5'],
    ['m_pb', 'pb', null],
    ['m_ev_ebitda', 'ev_ebitda', null],
    ['m_peg', 'peg', null],
  ];
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead><tr><th>{t('metric', lang)}</th><th>{t('current', lang)}</th><th>{t('m_5y_avg', lang)}</th></tr></thead>
        <tbody>
          {rows.map(([k, cur, avg]) => (
            <tr key={k}>
              <td>{t(k, lang)}</td>
              <td className="num">{fmtX(valuation[cur])}</td>
              <td className="num muted">{avg ? fmtX(valuation[avg]) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {peers && peers.length > 0 && (
        <div className="peers">
          <span className="peers-label">{t('vs_peer', lang)} ({t('m_pe', lang)}):</span>
          {peers.map(p => <span key={p.ticker} className="peer-chip">{p.ticker} {fmtX(p.pe, 0)}</span>)}
        </div>
      )}
    </div>
  );
}

function BalanceTable({ balance, currency, lang }) {
  if (!balance) return null;
  const rows = [
    ['m_cash', fmtBig(balance.cash, currency), balance.cash > 0],
    ['m_debt', fmtBig(balance.total_debt, currency), balance.total_debt < balance.cash],
    ['m_de', fmtNum(balance.de_ratio, 2), balance.de_ratio < 1],
    ['m_current', fmtX(balance.current_ratio), balance.current_ratio > 1.5],
    ['m_coverage', fmtX(balance.interest_coverage, 0), balance.interest_coverage > 5],
  ];
  return (
    <div className="table-wrap">
      <table className="data-table">
        <tbody>
          {rows.map(([k, v, good]) => (
            <tr key={k}>
              <td>{t(k, lang)}</td>
              <td className="num">{v}</td>
              <td className="num">{good ? '🟢' : '🟡'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilingCard({ filing, lang }) {
  if (!filing) return null;
  return (
    <div className="filing">
      <div className="filing-head">
        <span className="filing-type">{filing.type}</span>
        <span className="filing-date">{fmtDate(filing.date, lang)}</span>
        {filing.url && <a className="filing-link" href={filing.url} target="_blank" rel="noopener noreferrer">SEC / Filing ↗</a>}
      </div>
      <p>{pick(filing, 'highlight', lang)}</p>
    </div>
  );
}

function BulletList({ items, lang, kind }) {
  if (!items || !items.length) return null;
  return (
    <ul className={`bullets ${kind}`}>
      {items.map((it, i) => <li key={i}>{typeof it === 'string' ? it : (it[lang] || it.en)}</li>)}
    </ul>
  );
}

Object.assign(window, {
  RatingBadge, CountryTag, Nav, Footer, AnalysisCard,
  Snapshot, Section, ValuationTable, BalanceTable, FilingCard, BulletList,
});
