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

function Segments({ company, lang }) {
  const years = company.years;
  const views = company.segmentViews;

  if (!views || views.length === 0) {
    return (
      <div className="card" style={{ padding: 24, color: "var(--ink-3)", textAlign: "center" }}>
        <IconInfo style={{ width: 22, height: 22, margin: "0 auto 8px", color: "var(--ink-4)" }} />
        <div>{t('segment_not_disclosed', lang)}</div>
      </div>
    );
  }

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
  const [mix, setMix] = React.useState(false); // default to Value mode as requested

  // Multi-select segment filter using deselected IDs set
  const [deselectedIds, setDeselectedIds] = React.useState([]);
  React.useEffect(() => { setDeselectedIds([]); }, [viewId]); // reset filter on view change

  const isLevel = metric === "revenue" || metric === "assets" || metric === "capex";
  const isLine = metric === "opinc" || metric === "margin" || metric === "growth";
  const dataKey = metric === "revenue" ? "rev" : metric;

  const curncy = company.sym;
  const unitLabel = company.unit + " " + company.currency;

  const toggleSegment = (id) => {
    if (deselectedIds.length === 0) {
      // If all were active, clicking one isolates it (turns all others OFF)
      const others = segs.filter(s => s.id !== id).map(s => s.id);
      setDeselectedIds(others);
    } else {
      // Already in filtered state
      if (deselectedIds.includes(id)) {
        // Toggle ON (remove from deselected list)
        setDeselectedIds(deselectedIds.filter(x => x !== id));
      } else {
        // Toggle OFF (add to deselected list)
        // Prevent turning all off (if it's the last active one, reset to all ON)
        if (deselectedIds.length < segs.length - 1) {
          setDeselectedIds([...deselectedIds, id]);
        } else {
          setDeselectedIds([]);
        }
      }
    }
  };

  const selectAll = () => {
    setDeselectedIds([]);
  };

  return (
    <div>
      {/* Dynamic Segment Filter */}
      {isLevel && (
        <div style={{ marginBottom: 12 }}>
          <div className="tiny muted" style={{ marginBottom: 6, fontWeight: 600 }}>{t('segment_focus', lang)}</div>
          <div className="chips noscroll" style={{ background: "none", padding: 0 }}>
            <button className={"chip" + (deselectedIds.length === 0 ? " on" : "")} onClick={selectAll}>
              {t('segment_all', lang)}
            </button>
            {segs.map((s) => {
              const active = !deselectedIds.includes(s.id);
              return (
                <button key={s.id} className={"chip" + (active ? " on" : "")} onClick={() => toggleSegment(s.id)}>
                  <span className="dot" style={{ width: 7, height: 7, borderRadius: 99, background: active ? s.color : "var(--ink-4)", marginRight: 5, display: "inline-block" }} />
                  {s.short}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
              <button className={!mix ? "on" : ""} onClick={() => setMix(false)}>{t('val_label', lang)}</button>
              <button className={mix ? "on" : ""} onClick={() => setMix(true)}>{t('pct_label', lang)}</button>
            </div>
          )}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span className="tiny muted">{t('disclosure_label', lang)}</span>
            <DiscBadge grade={view.disclosure} />
          </div>
        </div>

        {/* chart */}
        {isLevel ? (
          <StackedView segs={segs} years={years} metric={dataKey} mix={mix} unit={curncy + " " + unitLabel} lang={lang} deselectedIds={deselectedIds} curncy={curncy} unitSuffix={company.unitSuffix} />
        ) : (
          <LineChart
            series={segs.filter(s => !deselectedIds.includes(s.id)).map((s) => ({ name: s.short, color: s.color, data: s[dataKey] }))}
            years={years}
            suffix={metric === "opinc" ? "" : "%"}
            unit={metric === "opinc" ? t('unit_label', lang) + ": " + curncy + " " + unitLabel : (metric === "margin" ? t('op_margin_segments_lbl', lang) : t('rev_growth_segments_lbl', lang))}
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
        <div className="section-head"><div className="section-title">{t('segment_summary_title', lang)} <span className="en">Segment summary</span></div></div>
        <div className="tbl-wrap">
          <table className="fin">
            <thead>
              <tr>
                <th>{t('segment_col', lang)}</th>
                <th>{t('revenue_latest_col', lang)}<small style={{ fontWeight: 400 }}>{years[years.length - 1]}</small></th>
                <th>{t('share_col', lang)}</th>
                <th>{t('margin_col', lang)}</th>
                <th>{t('cagr_5y_col', lang)}</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const activeSegs = segs.filter(s => !deselectedIds.includes(s.id));
                const total = activeSegs.reduce((a, s) => a + (s.latest || 0), 0);
                return activeSegs.map((s) => {
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
        <div className="foot">{t('cagr_desc', lang)}</div>
      </div>
    </div>
  );
}

function StackedView({ segs, years, metric, mix, unit, lang, deselectedIds = [], curncy, unitSuffix }) {
  const n = years.length;
  
  // Calculate totals per year
  const totals = years.map((_, i) => {
    return segs.reduce((sum, s) => {
      if (deselectedIds.includes(s.id)) return sum;
      return sum + ((s[metric] && s[metric][i]) || 0);
    }, 0);
  });

  const maxTotal = Math.max(...totals, 1);
  const lo = 0;
  const hi = mix ? 100 : maxTotal * 1.15; // 15% top padding for labels

  const W = 680, H = 260;
  const padL = 36, padR = 6, padT = 36, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  
  const x = (i) => padL + (i + 0.5) * (plotW / n);
  const y = (v) => padT + (1 - v / (mix ? 100 : hi)) * plotH;
  const bw = 52;
  const suffix = unitSuffix || "";

  const ticks = mix ? [0, 50, 100] : [0, hi/2, hi];

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" preserveAspectRatio="xMidYMid meet">
        {/* Horizontal gridlines */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="gridline" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={Math.abs(t) < 1e-6 ? "0" : "3 4"} opacity="0.5" />
            <text className="axis-lab" x={padL - 6} y={y(t) + 3} textAnchor="end" fill="var(--ink-3)">{t.toFixed(0) + (mix ? "%" : suffix)}</text>
          </g>
        ))}

        {/* Stacked Bars */}
        {years.map((yr, i) => {
          const totalVal = totals[i];
          let accum = 0;
          
          return (
            <g key={yr}>
              {segs.map((s) => {
                if (deselectedIds.includes(s.id)) return null;
                const v = (s[metric] && s[metric][i]) || 0;
                if (v <= 0) return null;

                let rectH, top;
                if (mix) {
                  const pctVal = totalVal > 0 ? (v / totalVal) * 100 : 0;
                  rectH = (pctVal / 100) * plotH;
                  top = padT + (1 - (accum + pctVal) / 100) * plotH;
                  accum += pctVal;

                  return (
                    <g key={s.name}>
                      <rect x={x(i) - bw/2} y={top} width={bw} height={Math.max(rectH, 1)} rx="2" fill={s.color} opacity="0.9" />
                      {rectH > 14 && (
                        <text x={x(i)} y={top + rectH/2 + 4} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600">{pctVal.toFixed(0) + "%"}</text>
                      )}
                    </g>
                  );
                } else {
                  rectH = (v / hi) * plotH;
                  top = padT + (1 - (accum + v) / hi) * plotH;
                  accum += v;

                  return (
                    <g key={s.name}>
                      <rect x={x(i) - bw/2} y={top} width={bw} height={Math.max(rectH, 1)} rx="2" fill={s.color} opacity="0.9" />
                      {rectH > 14 && (
                        <text x={x(i)} y={top + rectH/2 + 4} textAnchor="middle" fill="#fff" fontSize="10.5" fontWeight="600">{v.toFixed(1) + suffix}</text>
                      )}
                    </g>
                  );
                }
              })}

              {/* Total above the bar (absolute mode only) */}
              {!mix && totalVal > 0 && (
                <text x={x(i)} y={y(totalVal) - 8} textAnchor="middle" fill="var(--ink)" fontSize="11" fontWeight="700">
                  {curncy + totalVal.toFixed(1) + suffix}
                </text>
              )}
            </g>
          );
        })}

        {/* Connecting dashed YoY growth lines (absolute mode only) */}
        {!mix && (() => {
          return years.map((yr, i) => {
            if (i === 0) return null;
            const vPrev = totals[i - 1], vCur = totals[i];
            if (vPrev <= 0 || vCur <= 0) return null;
            const g = ((vCur - vPrev) / vPrev) * 100;
            const yPrev = y(vPrev), yCur = y(vCur);
            const xPrev = x(i - 1) + bw/2 + 4;
            const xCur = x(i) - bw/2 - 4;
            return (
              <g key={'seg-growth' + i}>
                <line x1={xPrev} y1={yPrev} x2={xCur} y2={yCur} stroke={g >= 0 ? "var(--bull)" : "var(--bear)"} strokeDasharray="3 3" strokeWidth="1.2" opacity="0.8" />
                <text x={(xPrev + xCur) / 2} y={(yPrev + yCur) / 2 - 8} textAnchor="middle" fill={g >= 0 ? "var(--bull)" : "var(--bear)"} fontSize="11" fontWeight="700">
                  {(g >= 0 ? "+" : "") + g.toFixed(1) + "%"}
                </text>
              </g>
            );
          });
        })()}

        {/* X Axis Labels */}
        {years.map((yr, i) => (
          <text key={yr} className="axis-lab" x={x(i)} y={H - 8} textAnchor="middle" fill="var(--ink-2)" fontSize="11">{yr}</text>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="chart-legend" style={{ marginTop: 12 }}>
        {segs.map((s) => (
          <span className="it" key={s.name}>
            <span className="sq" style={{ background: s.color }} />
            {s.short}
          </span>
        ))}
      </div>
      <div className="foot">{mix ? t('stacked_desc', lang) : t('value_desc', lang) + " · " + unit}</div>
    </div>
  );
}

Object.assign(window, { Segments });
