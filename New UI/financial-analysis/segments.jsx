/* segments.jsx — Business Segments analysis (exported to window) */

function segCompute(view, years) {
  const n = years.length;
  return view.segments.map((s) => {
    const margin = s.opinc ? s.rev.map((r, i) => (s.opinc[i] != null && r) ? (s.opinc[i] / r) * 100 : null) : null;
    const growth = s.rev.map((r, i) => i === 0 ? null : (s.rev[i - 1] ? ((r - s.rev[i - 1]) / Math.abs(s.rev[i - 1])) * 100 : null));
    const r0 = s.rev[0], rL = s.rev[n - 1];
    const cagr = (r0 > 0 && rL > 0) ? (Math.pow(rL / r0, 1 / (n - 1)) - 1) * 100 : null;
    return { ...s, margin, growth, latest: rL, cagr };
  });
}

const METRIC_LABELS = {
  revenue: { th: "รายได้", en: "Revenue" },
  opinc: { th: "กำไรจากการดำเนินงาน", en: "Operating income" },
  margin: { th: "อัตรากำไร", en: "Operating margin" },
  growth: { th: "การเติบโต YoY", en: "Growth" },
  assets: { th: "สินทรัพย์", en: "Assets" },
  capex: { th: "ลงทุน (Capex)", en: "Capex" },
};

function Segments({ company }) {
  const years = company.years;
  const views = company.segmentViews;
  const [viewId, setViewId] = React.useState(views[0].id);
  const view = views.find((v) => v.id === viewId) || views[0];
  const segs = React.useMemo(() => segCompute(view, years), [view, years]);

  // available metrics for this view
  const hasOpinc = view.segments.some((s) => s.opinc && s.opinc.some((v) => v != null));
  const hasAssets = view.segments.some((s) => s.assets && s.assets.some((v) => v != null));
  const hasCapex = view.segments.some((s) => s.capex && s.capex.some((v) => v != null));
  const metrics = ["revenue", "growth"];
  if (hasOpinc) { metrics.splice(1, 0, "opinc", "margin"); }
  if (hasAssets) metrics.push("assets");
  if (hasCapex) metrics.push("capex");

  const [metric, setMetric] = React.useState("revenue");
  React.useEffect(() => { if (!metrics.includes(metric)) setMetric("revenue"); }, [viewId]);
  const [mix, setMix] = React.useState(true);

  const isLevel = metric === "revenue" || metric === "assets" || metric === "capex";
  const isLine = metric === "opinc" || metric === "margin" || metric === "growth";
  const dataKey = metric === "revenue" ? "rev" : metric;

  const curncy = company.sym;
  const unitLabel = company.unit + " " + company.currency;

  // ---- data per chart ----
  function levelData() {
    return segs.map((s) => ({ ...s, data: s[metric] }));
  }

  return (
    <div>
      <div className="card" style={{ padding: 15 }}>
        {/* controls */}
        <div className="seg-controls" style={{ marginBottom: 14 }}>
          <div className="sel-wrap" style={{ flex: 1, minWidth: 150 }}>
            <select className="sel" value={viewId} onChange={(e) => setViewId(e.target.value)}>
              {views.map((v) => <option key={v.id} value={v.id}>{v.label} · {v.labelEn}</option>)}
            </select>
          </div>
          <div className="sel-wrap" style={{ flex: 1, minWidth: 150 }}>
            <select className="sel" value={metric} onChange={(e) => setMetric(e.target.value)}>
              {metrics.map((m) => <option key={m} value={m}>{METRIC_LABELS[m].th} · {METRIC_LABELS[m].en}</option>)}
            </select>
          </div>
          {isLevel && (
            <div className="seg" role="group">
              <button className={!mix ? "on" : ""} onClick={() => setMix(false)}>มูลค่า</button>
              <button className={mix ? "on" : ""} onClick={() => setMix(true)}>สัดส่วน %</button>
            </div>
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tiny muted">การเปิดเผย</span>
            <DiscBadge grade={view.disclosure} />
          </div>
        </div>

        {/* chart */}
        {isLevel ? (
          <StackedView segs={segs} years={years} metric={dataKey} mix={mix} unit={curncy + " " + unitLabel} />
        ) : (
          <LineChart
            series={segs.map((s) => ({ name: s.short, color: s.color, data: s[dataKey] }))}
            years={years}
            suffix={metric === "opinc" ? "" : "%"}
            unit={metric === "opinc" ? "หน่วย: " + curncy + " " + unitLabel : (metric === "margin" ? "อัตรากำไรจากการดำเนินงานแต่ละส่วนงาน (%)" : "อัตราการเติบโตรายได้ YoY (%)")}
            floor={metric === "margin" ? -60 : null}
            height={230}
          />
        )}

        {view.note && (metric === "opinc" || metric === "margin" || metric === "assets" || metric === "capex") && (
          <div className="note-row"><IconInfo style={{ width: 14, height: 14, flex: "none", marginTop: 1 }} />{view.note}</div>
        )}
      </div>

      {/* summary table */}
      <div className="section" style={{ marginTop: 14 }}>
        <div className="section-head"><div className="section-title">สรุปรายส่วนงาน <span className="en">Segment summary</span></div></div>
        <div className="tbl-wrap">
          <table className="fin">
            <thead>
              <tr>
                <th>ส่วนงาน</th>
                <th>รายได้ล่าสุด<small style={{ fontWeight: 400 }}>{years[years.length - 1]}</small></th>
                <th>สัดส่วน</th>
                <th>มาร์จิ้น</th>
                <th>CAGR 5Y</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const total = segs.reduce((a, s) => a + (s.latest || 0), 0);
                return segs.map((s) => {
                  const m = s.margin ? s.margin[years.length - 1] : null;
                  return (
                    <tr key={s.name}>
                      <td className="rowlabel"><span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span className="sw" style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flex: "none" }} />{s.name}</span></td>
                      <td><span className="num">{curncy}{fmtN(s.latest, 1)}</span></td>
                      <td><span className="num">{pct((s.latest / total) * 100, 1)}</span></td>
                      <td>{m != null ? <span className="num">{pct(m, 1)}</span> : <Missing text="—" />}</td>
                      <td>{s.cagr != null ? <Delta value={s.cagr} /> : <span className="dash">—</span>}</td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
        <div className="foot">CAGR = อัตราเติบโตเฉลี่ยต่อปีของรายได้ {years[0]}–{years[years.length - 1]} · มาร์จิ้น = กำไรดำเนินงาน/รายได้ (แสดงเมื่อบริษัทเปิดเผย)</div>
      </div>
    </div>
  );
}

/* horizontal 100%-stacked (mix) or scaled-absolute bars per year */
function StackedView({ segs, years, metric, mix, unit }) {
  const n = years.length;
  const totals = years.map((_, i) => segs.reduce((a, s) => a + ((s[metric] && s[metric][i]) || 0), 0));
  const maxTotal = Math.max(...totals, 1);
  return (
    <div>
      <div className="stacked">
        {years.map((yr, i) => {
          const total = totals[i];
          const outerW = mix ? 100 : (total / maxTotal) * 100;
          return (
            <div className="stack-yr" key={yr}>
              <span className="yr">{yr}</span>
              <div className="stack-bar" style={{ width: outerW + "%" }}>
                {segs.map((s) => {
                  const v = (s[metric] && s[metric][i]) || 0;
                  const w = total ? (v / total) * 100 : 0;
                  if (w <= 0) return null;
                  return <div key={s.name} className="stack-seg" style={{ width: w + "%", background: s.color }} title={s.name + ": " + fmtN(v, 1) + (mix ? " (" + fmtN(w, 0) + "%)" : "")} />;
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="seg-legend">
        {segs.map((s) => <span className="it" key={s.name}><span className="sw" style={{ background: s.color }} />{s.short}</span>)}
      </div>
      <div className="foot">{mix ? "สัดส่วน % ของแต่ละปี (100% stacked)" : "มูลค่าเทียบกัน · " + unit}</div>
    </div>
  );
}

Object.assign(window, { Segments });
