// Main app: routing, data loading, and page assembly.

const { useState, useEffect, useMemo } = React;

// Data access. Phase 1 reads window.MOCK_ANALYSES; once the API is live and
// window.USE_MOCK is false, these hit the serverless endpoints instead.
async function fetchList() {
  if (window.USE_MOCK) return (window.MOCK_ANALYSES || []).slice();
  const r = await fetch('/api/companies');
  if (!r.ok) throw new Error(`companies ${r.status}`);
  return r.json();
}
async function fetchOne(slug) {
  if (window.USE_MOCK) return (window.MOCK_ANALYSES || []).find(a => a.slug === slug) || null;
  const r = await fetch(`/api/company?slug=${encodeURIComponent(slug)}`);
  if (!r.ok) throw new Error(`company ${r.status}`);
  return r.json();
}

function usePersistentLang() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'th');
  useEffect(() => { localStorage.setItem('lang', lang); document.documentElement.lang = lang; }, [lang]);
  return [lang, setLang];
}

// --- Home -------------------------------------------------------------------
function HomePage({ lang }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => { fetchList().then(setList).catch(e => setErr(e.message)); }, []);

  return (
    <main className="container">
      <section className="hero">
        <h1>{t('site_name', lang)}</h1>
        <p>{t('tagline', lang)}</p>
      </section>
      <h2 className="list-title">{t('latest', lang)}</h2>
      {err && <p className="error">{err}</p>}
      {!list && !err && <p className="muted">{t('loading', lang)}</p>}
      {list && list.length === 0 && <p className="muted">{t('empty', lang)}</p>}
      {list && (
        <div className="grid">
          {list.map(a => <AnalysisCard key={a.slug} a={a} lang={lang} />)}
        </div>
      )}
    </main>
  );
}

// --- Company ----------------------------------------------------------------
function CompanyPage({ slug, lang }) {
  const [a, setA] = useState(null);
  const [err, setErr] = useState(null);
  useEffect(() => {
    setA(null);
    fetchOne(slug).then(setA).catch(e => setErr(e.message));
    window.scrollTo(0, 0);
  }, [slug]);

  if (err) return <main className="container"><p className="error">{err}</p></main>;
  if (!a) return <main className="container"><p className="muted">{t('loading', lang)}</p></main>;

  const s = a.data_snapshot || {};
  const cur = s.quote?.currency || '$';

  return (
    <main className="container article">
      <a className="back" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t('back', lang)}</a>
      <Snapshot a={a} lang={lang} />

      <Section id="take" title={t('sec_take', lang)}>
        <MD src={pick(a, 'body', lang)} />
      </Section>

      <Section id="performance" title={t('sec_performance', lang)}>
        <RevenueProfitChart annual={s.annual} currency={cur} lang={lang} />
      </Section>

      <Section id="margins" title={t('sec_margins', lang)}>
        <MarginTrendChart annual={s.annual} lang={lang} />
      </Section>

      <div className="two-col">
        <Section id="valuation" title={t('sec_valuation', lang)}>
          <ValuationTable valuation={s.valuation} peers={s.peers} lang={lang} />
        </Section>
        <Section id="balance" title={t('sec_balance', lang)}>
          <BalanceTable balance={s.balance} currency={cur} lang={lang} />
        </Section>
      </div>

      <Section id="analyst" title={t('sec_analyst', lang)}>
        <AnalystChart analyst={s.analyst} currency={cur} lang={lang} />
      </Section>

      <Section id="filing" title={t('sec_filing', lang)}>
        <FilingCard filing={s.filing} lang={lang} />
      </Section>

      <div className="two-col">
        <Section id="catalysts" title={t('sec_catalysts', lang)}>
          <BulletList items={a.catalysts} lang={lang} kind="catalysts" />
        </Section>
        <Section id="risks" title={t('sec_risks', lang)}>
          <BulletList items={a.risks} lang={lang} kind="risks" />
        </Section>
      </div>
    </main>
  );
}

// --- Admin (placeholder for Phase 2) ----------------------------------------
function AdminPage({ lang }) {
  return (
    <main className="container">
      <h1>Admin</h1>
      <p className="muted">
        Phase 2: paste analysis → fetch financials → freeze snapshot → publish.
        Wired once Supabase env vars are set (see SETUP.md).
      </p>
    </main>
  );
}

// --- Root -------------------------------------------------------------------
function App() {
  const [lang, setLang] = usePersistentLang();
  const route = useRoute();
  let page;
  if (route.name === 'company') page = <CompanyPage slug={route.slug} lang={lang} />;
  else if (route.name === 'admin') page = <AdminPage lang={lang} />;
  else page = <HomePage lang={lang} />;

  return (
    <React.Fragment>
      <Nav lang={lang} setLang={setLang} />
      {page}
      <Footer lang={lang} />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
