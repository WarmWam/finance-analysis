/* app.jsx — shell, hash routing, loading/error, tweaks */

const ACCENTS = {
  blue:   ["#3a5bd9", "#2c46ac", "#eaeefb", "#f3f6fe"],
  teal:   ["#0d8f86", "#0a6f68", "#e2f3f0", "#f0faf8"],
  violet: ["#6d4bd8", "#5538b0", "#efe9fb", "#f7f3fd"],
  slate:  ["#46566f", "#33425a", "#ebeef2", "#f4f6f9"],
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": ["#3a5bd9", "#2c46ac", "#eaeefb", "#f3f6fe"],
  "radius": 14,
  "homeState": "ปกติ"
}/*EDITMODE-END*/;

function parseHash() {
  const h = window.location.hash || "";
  const m = h.match(/#\/company\/([^/?]+)/);
  return m ? { route: "report", id: decodeURIComponent(m[1]) } : { route: "home", id: null };
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const data = window.LL_DATA;
  const [nav, setNav] = React.useState(parseHash());
  const [loading, setLoading] = React.useState(true);

  // initial load shimmer
  React.useEffect(() => {
    const id = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(id);
  }, []);

  // hash routing
  React.useEffect(() => {
    const onHash = () => setNav(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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

  const open = (id) => { window.location.hash = "#/company/" + encodeURIComponent(id); };
  const back = () => { window.location.hash = "#/"; };

  const company = nav.route === "report" ? data.companies.find((c) => c.id === nav.id) : null;

  let body;
  if (loading) {
    body = <LoadingState />;
  } else if (nav.route === "report") {
    body = company
      ? <Report c={company} onBack={back} />
      : <div className="container"><ErrorState onRetry={back} /></div>;
  } else {
    body = <HomeList companies={data.companies} onOpen={open} forceError={t.homeState === "error"} />;
  }
  // home loading/error preview via tweak
  if (nav.route === "home" && !loading && t.homeState === "loading") body = <LoadingState />;

  return (
    <div className="app">
      <div className="appbar">
        <div className="appbar-inner">
          <button className="brand" onClick={back} style={{ background: "none" }}>
            <span className="brand-mark" />
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.1, alignItems: "flex-start" }}>
              <span className="brand-name">Ledger Lens</span>
              <span className="brand-sub">Equity research</span>
            </span>
          </button>
          <div style={{ marginLeft: "auto" }} />
          <span className="badge ghost tiny">TH · ไทย</span>
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
