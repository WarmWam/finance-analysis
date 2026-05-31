/* app.jsx — shell, History API routing, loading/error, tweaks & bilingual integration */

const ACCENTS = {
  blue:   ["#3a5bd9", "#2c46ac", "#eaeefb", "#f3f6fe"],
  teal:   ["#0d8f86", "#0a6f68", "#e2f3f0", "#f0faf8"],
  violet: ["#6d4bd8", "#5538b0", "#efe9fb", "#f7f3fd"],
  slate:  ["#46566f", "#33425a", "#ebeef2", "#f4f6f9"],
};

const TWEAK_DEFAULTS = {
  "accent": ["#3a5bd9", "#2c46ac", "#eaeefb", "#f3f6fe"],
  "radius": 14,
  "homeState": "ปกติ"
};

// Data access. Phase 1 reads window.MOCK_ANALYSES; once the API is live and
// window.USE_MOCK is false, these hit the serverless endpoints instead.
async function fetchList() {
  if (window.USE_MOCK) return (window.MOCK_ANALYSES || []).slice();
  const r = await fetch('/api/companies', { cache: 'no-store' });
  if (!r.ok) throw new Error(`companies ${r.status}`);
  return r.json();
}
async function fetchOne(slug) {
  if (window.USE_MOCK) {
    const s = (slug || '').toLowerCase();
    return (window.MOCK_ANALYSES || []).find(a => 
      (a.slug || '').toLowerCase() === s || 
      (a.ticker || '').toLowerCase() === s
    ) || null;
  }
  const r = await fetch(`/api/company?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`company ${r.status}`);
  return r.json();
}

// UI is English-only (analysis content stays Thai via the adapter). The language
// toggle was removed; keep a fixed 'en' so all t()-driven labels render English.
function usePersistentLang() {
  const [lang] = React.useState('en');
  React.useEffect(() => { document.documentElement.lang = 'en'; }, []);
  return [lang, () => {}];
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLang] = usePersistentLang();
  const route = useRoute();
  
  const [list, setList] = React.useState(null);
  const [activeCompany, setActiveCompany] = React.useState(null);
  const [err, setErr] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  // Home filters live here (not in HomeList) so they survive in-app back
  // navigation; a full page refresh remounts App and clears them.
  const [homeFilter, setHomeFilter] = React.useState({ country: null, rating: null, q: "", sort: null });

  // apply tweak css vars
  React.useEffect(() => {
    const r = document.documentElement;
    const a = t.accent || ACCENTS.blue;
    r.style.setProperty("--accent", a[0]);
    r.style.setProperty("--accent-ink", a[1]);
    r.style.setProperty("--accent-soft", a[2]);
    r.style.setProperty("--accent-softer", a[3]);
    r.style.setProperty("--r", t.radius + "px");
    r.style.setProperty("--r-sm", Math.max(5, t.radius - 6) + "px");
    r.style.setProperty("--r-lg", (t.radius + 6) + "px");
  }, [t.accent, t.radius]);

  // Load companies list on home
  React.useEffect(() => {
    if (route.name !== 'home') return;
    setLoading(true);
    let active = true;
    fetchList()
      .then(items => {
        if (active) {
          const adapted = items.map(item => adaptRecord(item, lang));
          setList(adapted);
          setErr(null);
          setLoading(false);
        }
      })
      .catch(e => {
        if (active) {
          setErr(e.message);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [route.name, lang]);

  // Load active company on report page
  React.useEffect(() => {
    if (route.name !== 'company') {
      setActiveCompany(null);
      return;
    }
    setLoading(true);
    let active = true;
    fetchOne(route.slug)
      .then(item => {
        if (active) {
          if (item) {
            const adapted = adaptRecord(item, lang);
            setActiveCompany(adapted);
            setErr(null);
          } else {
            setErr("Company not found");
          }
          setLoading(false);
        }
      })
      .catch(e => {
        if (active) {
          setErr(e.message);
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [route.name, route.slug, lang]);

  const openCompany = (id) => {
    const found = list ? list.find(c => c.id === id) : null;
    const slug = found ? found.slug : id;
    navigate('/company/' + encodeURIComponent(slug));
  };
  const goHome = () => { navigate('/'); };

  let body;
  if (loading || t.homeState === "loading") {
    body = <LoadingState />;
  } else if (route.name === 'admin') {
    body = <AdminPage lang={lang} />;
  } else if (route.name === 'company') {
    body = activeCompany
      ? <Report c={activeCompany} onBack={goHome} lang={lang} />
      : <div className="container"><ErrorState lang={lang} onRetry={goHome} /></div>;
  } else {
    body = list
      ? <HomeList companies={list} onOpen={openCompany} forceError={err || t.homeState === "error"} lang={lang} filter={homeFilter} setFilter={setHomeFilter} />
      : <LoadingState />;
  }

  return (
    <div className="app">
      <div className="appbar">
        <div className="appbar-inner">
          <button className="brand" onClick={goHome} style={{ background: "none", border: "none", padding: 0 }}>
            <span className="brand-mark" />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, alignItems: "flex-start" }}>
              <span className="brand-name">Ledger Lens</span>
              <span className="brand-sub">Stock analysis</span>
            </span>
          </button>
        </div>
      </div>

      <div className="page">{body}</div>

      <TweaksPanel>
        <TweakSection label="ธีมสี · Accent" />
        <TweakColor label="สีนำสายตา" value={t.accent}
          options={[ACCENTS.blue, ACCENTS.teal, ACCENTS.violet, ACCENTS.slate]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="รูปทรง · Shape" />
        <TweakSlider label="ความมนการ์ด" value={t.radius} min={6} max={22} step={2} unit="px"
          onChange={(v) => setTweak("radius", v)} />
        <TweakSection label="พรีวิวสถานะ · States" />
        <TweakRadio label="หน้า Home" value={t.homeState}
          options={["ปกติ", "loading", "error"]}
          onChange={(v) => setTweak("homeState", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
