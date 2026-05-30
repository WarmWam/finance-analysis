// Main app: routing, data loading, and page assembly.

const { useState, useEffect, useMemo } = React;

// Data access. Phase 1 reads window.MOCK_ANALYSES; once the API is live and
// window.USE_MOCK is false, these hit the serverless endpoints instead.
async function fetchList() {
  if (window.USE_MOCK) return (window.MOCK_ANALYSES || []).slice();
  const r = await fetch('/api/companies', { cache: 'no-store' });
  if (!r.ok) throw new Error(`companies ${r.status}`);
  return r.json();
}
async function fetchOne(slug) {
  if (window.USE_MOCK) return (window.MOCK_ANALYSES || []).find(a => a.slug === slug) || null;
  const r = await fetch(`/api/company?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
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
  useEffect(() => {
    let active = true;
    const load = () => fetchList()
      .then(items => { if (active) { setList(items); setErr(null); } })
      .catch(e => { if (active) setErr(e.message); });
    load();
    window.addEventListener('focus', load);
    return () => { active = false; window.removeEventListener('focus', load); };
  }, []);

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

  return (
    <main className="container article">
      <a className="back" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>{t('back', lang)}</a>
      <AnalysisView a={a} lang={lang} />
    </main>
  );
}

// AdminPage lives in admin.jsx (loaded before this file).

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
