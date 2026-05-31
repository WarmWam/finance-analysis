/* report.jsx — Company Report page (exported to window) */

function moneyU(c, v, dec) {
  if (v === null || v === undefined) return null;
  return c.sym + fmtN(v, dec);
}

/* ---------------- Snapshot header ---------------- */
function Snapshot({ c, lang }) {
  const ch = c.price.changePct;
  const a = c.analysts || {};
  const hasTarget = a.avgNum > 0 && a.nowNum > 0;
  const upside = hasTarget ? ((a.avgNum - a.nowNum) / a.nowNum) * 100 : null;
  return (
    <div className="snapshot container">
      <div className="snap-top">
        <MonoLogo c={c} size={52} />
        <div className="snap-id">
          <div className="snap-name">{c.name}{c.nameEn ? <span className="en" style={{ fontSize: 14, marginLeft: 7 }}>{c.nameEn}</span> : null}</div>
          <div className="snap-sub">
            <span className="tk">{c.ticker}</span><span className="sep-dot" />
            <span>{c.exchange}</span><span className="sep-dot" />
            <span>{c.countryName}</span><span className="sep-dot" />
            <span>{c.sector}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <RatingPill rating={c.rating} label={c.ratingLabel} size="lg" />
          {hasTarget && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Delta value={upside} />
              <span className="tiny muted">{t('vs_avg_target', lang)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="price-row">
        <div className="num price-now">{c.price.now}</div>
        <div className="price-cur">{c.priceCcy || c.currency}</div>
        <Delta value={ch} />
        <div className="price-asof">{t('price_asof_date', lang)}<br />{c.price.asOf}</div>
      </div>
      {c.fxNote && <div className="tiny muted" style={{ marginTop: 8, display: "inline-flex", gap: 5, alignItems: "center" }}><IconInfo style={{ width: 13, height: 13 }} />{c.fxNote}</div>}

      <div className="snap-stats">
        <div className="snap-stat"><div className="k">{t('market_cap', lang)}</div><div className="v">{c.price.marketCap}</div></div>
        <div className="snap-stat"><div className="k">{t('pe_label', lang)}</div><div className="v">{c.price.pe}</div></div>
        <div className="snap-stat"><div className="k">{t('forward_pe_label', lang)}</div><div className="v">{c.price.peFwd}</div></div>
        <div className="snap-stat"><div className="k">{t('analysis_date_label', lang)}</div><div className="v" style={{ fontSize: 13, fontFamily: "var(--font)", fontWeight: 600 }}>{c.analysisDate}</div></div>
      </div>
    </div>
  );
}

/* ---------------- Verdict ---------------- */
function toneStyle(tone) {
  if (tone === "up") return { bg: "var(--bull-soft)", fg: "var(--bull)" };
  if (tone === "down") return { bg: "var(--bear-soft)", fg: "var(--bear)" };
  return { bg: "var(--warn-soft)", fg: "var(--warn)" };
}
function VQ({ q, item, lang }) {
  const ts = toneStyle(item.tone);
  const ic = item.tone === "up" ? <IconArrowUp /> : item.tone === "down" ? <IconArrowDown /> : <IconArrowRight />;
  return (
    <div className="vq">
      <div className="vq-ic" style={{ background: ts.bg, color: ts.fg }}>{React.cloneElement(ic, { style: { width: 16, height: 16 } })}</div>
      <div>
        <div className="q">{q}</div>
        <div className="a">{item.label}</div>
        <div className="tiny muted" style={{ marginTop: 4 }}>{item.detail}</div>
      </div>
    </div>
  );
}
function Verdict({ c, lang }) {
  const v = c.verdict;
  return (
    <div className="container section">
      <div className="verdict">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="section-title" style={{ fontSize: 16 }}>{t('our_view_title', lang)} <span className="en">Our view</span></div>
          <RatingPill rating={c.rating} label={c.ratingLabel} />
        </div>
        <div className="verdict-thesis" style={{ marginTop: 12, lineHeight: 1.6 }}>
          <MD src={c.thesis} />
        </div>
        <div className="verdict-grid">
          <VQ q={t('q_interesting', lang)} item={v.interesting} lang={lang} />
          <VQ q={t('q_margin', lang)} item={v.margin} lang={lang} />
          <VQ q={t('q_mainBiz', lang)} item={v.mainBiz} lang={lang} />
          <VQ q={t('q_valuation', lang)} item={v.valuation} lang={lang} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Price action ---------------- */
function PriceAction({ c, lang }) {
  const history = c.priceHistory;
  if (!history || !history.candles || history.candles.length < 2) return null;
  const candles = history.candles;
  const first = candles[0], last = candles[candles.length - 1];
  const change = ((last.close - first.close) / Math.abs(first.close || 1)) * 100;
  const up = change >= 0;
  const rangeText = `${candles.length} trading days`;
  const source = history.source || 'Market chart data';
  const sourceNode = history.sourceUrl
    ? <a href={history.sourceUrl} target="_blank" rel="noopener noreferrer">{source}</a>
    : source;

  return (
    <div className="container section">
      <div className="section-head">
        <div className="section-title">{lang === 'th' ? 'กราฟราคา 1 ปี' : '1Y Price Chart'} <span className="en">Daily candles</span></div>
        <div className={"delta " + (up ? "up" : "down")} style={{ fontSize: 12 }}>
          {up ? <IconArrowUp /> : <IconArrowDown />}
          {up ? "+" : ""}{fmtN(change, 1)}%
        </div>
      </div>
      <div className="card price-action-card">
        <CandlestickChart history={history} height={270} currency={c.currency} />
        <div className="price-action-foot">
          <span>{lang === 'th' ? 'ช่วงข้อมูล' : 'Range'}: {history.range || '1y'} · {history.interval || '1d'} · {rangeText}</span>
          <span>{lang === 'th' ? 'แหล่งข้อมูล' : 'Source'}: {sourceNode}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Financials ---------------- */
function Financials({ c, lang }) {
  const f = c.financials, years = c.years, n = years.length, margins = c.margins;
  
  // Tab states: 'both' (Revenue + Net Income), 'revenue' (Revenue only), 'netIncome' (Net Income only), 'margin' (Net Margin)
  const [activeTab, setActiveTab] = React.useState('both');

  const finRows = [
    { key: "revenue", th: t('revenue_label', lang), en: "Revenue", unit: true },
    { key: "grossProfit", th: t('gross_profit_label', lang), en: "Gross profit", unit: true },
    { key: "operatingIncome", th: t('operating_income_label', lang), en: "Operating income", unit: true },
    { key: "netIncome", th: t('net_income_label', lang), en: "Net income", unit: true, hl: true },
    { key: "eps", th: t('eps_label', lang), en: "EPS", eps: true },
    { key: "fcf", th: t('fcf_label', lang), en: "Free cash flow", unit: true },
  ];

  let series = [];
  if (activeTab === 'both') {
    series = [
      { kind: "bar", name: t('revenue_legend', lang), color: "var(--accent)", data: f.revenue },
      { kind: "bar", name: t('netinc_legend', lang), color: "var(--bull)", data: f.netIncome },
    ];
  } else if (activeTab === 'revenue') {
    series = [
      { kind: "bar", name: t('revenue_legend', lang), color: "var(--accent)", data: f.revenue },
    ];
  } else if (activeTab === 'netIncome') {
    series = [
      { kind: "bar", name: t('netinc_legend', lang), color: "var(--bull)", data: f.netIncome },
    ];
  } else if (activeTab === 'margin') {
    series = [
      { kind: "line", name: t('margin_legend_net', lang), color: "var(--ink)", data: margins.net },
    ];
  }

  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">{t('sec_performance', lang)} <span className="en">Revenue & profit</span></div></div>
      <div className="card" style={{ padding: "15px 14px 12px" }}>
        {/* Tab selection buttons */}
        <div className="chips noscroll" style={{ marginBottom: 14, background: "none", padding: 0 }}>
          <button className={"chip" + (activeTab === 'both' ? " on" : "")} onClick={() => setActiveTab('both')}>
            {t('chart_both', lang)}
          </button>
          <button className={"chip" + (activeTab === 'revenue' ? " on" : "")} onClick={() => setActiveTab('revenue')}>
            {t('revenue_label', lang)}
          </button>
          <button className={"chip" + (activeTab === 'netIncome' ? " on" : "")} onClick={() => setActiveTab('netIncome')}>
            {t('net_income_label', lang)}
          </button>
          <button className={"chip" + (activeTab === 'margin' ? " on" : "")} onClick={() => setActiveTab('margin')}>
            {t('margin_legend_net', lang)}
          </button>
        </div>
        <BarLineChart series={series} years={years} unitSuffix={c.unitSuffix} currency={c.currency} height={250} />
      </div>

      <div className="tbl-wrap" style={{ marginTop: 12 }}>
        <table className="fin">
          <thead>
            <tr>
              <th>{t('items_label', lang)} <span style={{ fontWeight: 400, fontSize: '11px', display: 'block', color: 'var(--ink-3)', marginTop: 2 }}>({t('unit_label', lang)}: {c.sym} {c.unit})</span></th>
              {years.map((y) => <th key={y}>{y}</th>)}
              <th>YoY</th>
            </tr>
          </thead>
          <tbody>
            {finRows.map((r) => {
              const arr = f[r.key] || [];
              const allNull = arr.every((v) => v == null);
              const last = arr[n - 1], prev = arr[n - 2];
              const dec = r.eps ? (Math.abs(last || 0) >= 100 ? 0 : 2) : 1;
              return (
                <tr key={r.key} className={r.hl ? "hl" : ""}>
                  <td className="rowlabel">{r.th}<small>{r.en}{r.eps ? " · " + c.sym + "/หุ้น" : ""}</small></td>
                  {arr.map((v, i) => {
                    let cls = "";
                    if (i > 0 && v !== null && arr[i - 1] !== null) {
                      if (v > arr[i - 1]) cls = "cell-better";
                      else if (v < arr[i - 1]) cls = "cell-worse";
                    }
                    return (
                      <td key={i} className={cls}>
                        {v == null ? <span className="dash">—</span> : <span className="num">{r.eps ? c.sym + fmtN(v, dec) : fmtN(v, 1)}</span>}
                      </td>
                    );
                  })}
                  <td>{allNull ? <span className="dash">—</span> : <Delta value={yoy(last, prev)} />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="foot">{t('financials_foot', lang)}</div>
    </div>
  );
}

/* ---------------- Margins ---------------- */
function Margins({ c, lang }) {
  const m = c.margins, years = c.years;
  
  const [showGross, setShowGross] = React.useState(true);
  const [showOp, setShowOp] = React.useState(true);
  const [showNet, setShowNet] = React.useState(true);

  const series = [];
  if (showGross && m.gross && m.gross.some((v) => v != null)) series.push({ name: t('margin_legend_gross', lang), color: "var(--c2)", data: m.gross });
  if (showOp) series.push({ name: t('margin_legend_operating', lang), color: "var(--accent)", data: m.operating });
  if (showNet) series.push({ name: t('margin_legend_net', lang), color: "var(--ink)", data: m.net });
  
  const lastOp = m.operating[years.length - 1], firstOp = m.operating[0];
  const trendUp = lastOp > firstOp;
  return (
    <div className="container section">
      <div className="section-head">
        <div className="section-title">{t('sec_margins', lang)} <span className="en">Margin trend</span></div>
        <div className={"delta " + (trendUp ? "up" : "down")} style={{ fontSize: 12 }}>
          {trendUp ? <IconArrowUp /> : <IconArrowDown />} Operating {trendUp ? t('improved_lbl', lang) : t('declined_lbl', lang)}
        </div>
      </div>
      <div className="card" style={{ padding: "15px 14px 12px" }}>
        {/* Interactive Margin Chips */}
        <div className="chips noscroll" style={{ marginBottom: 14, background: "none", padding: 0 }}>
          {m.gross && m.gross.some((v) => v != null) && (
            <button className={"chip" + (showGross ? " on" : "")} onClick={() => setShowGross(!showGross)}>
              <span className="dot" style={{ width: 7, height: 7, borderRadius: 99, background: "var(--c2)" }} />
              {t('margin_legend_gross', lang)}
            </button>
          )}
          <button className={"chip" + (showOp ? " on" : "")} onClick={() => setShowOp(!showOp)}>
            <span className="dot" style={{ width: 7, height: 7, borderRadius: 99, background: "var(--accent)" }} />
            {t('margin_legend_operating', lang)}
          </button>
          <button className={"chip" + (showNet ? " on" : "")} onClick={() => setShowNet(!showNet)}>
            <span className="dot" style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ink)" }} />
            {t('margin_legend_net', lang)}
          </button>
        </div>

        <LineChart series={series} years={years} floor={-60} height={220} unit={t('margin_of_rev_lbl', lang)} />
        {(!m.gross || !m.gross.some((v) => v != null)) && <div className="note-row"><IconInfo style={{ width: 14, height: 14, flex: "none", marginTop: 1 }} />{t('no_gross_margin_note', lang)}</div>}
      </div>
    </div>
  );
}

/* ---------------- Valuation ---------------- */
function valTone(now, avg, lang) {
  if (now < avg * 0.92) return { tag: t('cheaper_past', lang), cls: "bull" };
  if (now > avg * 1.08) return { tag: t('pricier_past', lang), cls: "bear" };
  return { tag: t('close_avg', lang), cls: "neutral" };
}
function ValRow({ r, lang }) {
  const span = r.high - r.low || 1;
  const nowPos = Math.max(0, Math.min(100, ((r.now - r.low) / span) * 100));
  const avgPos = Math.max(0, Math.min(100, ((r.avg5 - r.low) / span) * 100));
  const peerPos = r.peer != null ? Math.max(0, Math.min(100, ((r.peer - r.low) / span) * 100)) : null;
  const tTone = valTone(r.now, r.avg5, lang);
  const ts = toneStyle(tTone.cls === "bull" ? "up" : tTone.cls === "bear" ? "down" : "neutral");
  return (
    <div style={{ padding: "13px 0", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifycontent: "space-between", alignitems: "baseline", gap: 10 }}>
        <div className="val-k">{r.k}{r.en ? <span className="en">{r.en}</span> : null}</div>
        <div style={{ display: "flex", alignitems: "center", gap: 9, marginLeft: "auto" }}>
          <span className="num" style={{ fontWeight: 600, fontSize: 15 }}>{fmtN(r.now, 1)}×</span>
          <span className="cheap-tag" style={{ background: ts.bg, color: ts.fg }}>{tTone.tag}</span>
        </div>
      </div>
      <div className="range-track">
        <div className="range-line" />
        <div className="range-fill" style={{ left: Math.min(nowPos, avgPos) + "%", width: Math.abs(nowPos - avgPos) + "%" }} />
        <div className="range-avg" style={{ left: avgPos + "%" }} title={"average 5Y " + fmtN(r.avg5, 1)} />
        {peerPos != null && <div style={{ position: "absolute", top: 9, left: peerPos + "%", width: 9, height: 9, borderRadius: 99, background: "var(--surface)", border: "2px solid var(--ink-4)", transform: "translateX(-50%)" }} title={"peer " + fmtN(r.peer, 1)} />}
        <div className="range-now" style={{ left: nowPos + "%", background: ts.fg }} title={"current " + fmtN(r.now, 1)} />
      </div>
      <div className="range-cap">
        <span>{t('min_label', lang)} {fmtN(r.low, 1)}</span>
        <span>{t('avg5y_label', lang)} {fmtN(r.avg5, 1)} · peer {r.peer != null ? fmtN(r.peer, 1) : "—"}</span>
        <span>{t('max_label', lang)} {fmtN(r.high, 1)}</span>
      </div>
    </div>
  );
}
function Valuation({ c, lang }) {
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">{t('valuation_title', lang)} <span className="en">Valuation</span></div><div className="section-note">{t('valuation_subtitle', lang)}</div></div>
      <div className="card" style={{ padding: "2px 15px 14px" }}>
        {c.valuation.map((r) => <ValRow key={r.k} r={r} lang={lang} />)}
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <span className="tiny muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 11, borderRadius: 99, background: "var(--accent)", display: "inline-block" }} />{t('legend_current', lang)}</span>
          <span className="tiny muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 2, height: 12, background: "var(--ink-3)", display: "inline-block" }} />{t('legend_avg5y', lang)}</span>
          <span className="tiny muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 99, border: "2px solid var(--ink-4)", display: "inline-block" }} />{t('legend_peer', lang)}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Balance sheet ---------------- */
function Balance({ c, lang }) {
  const b = c.balance;
  const col = b.score >= 80 ? "var(--bull)" : b.score >= 65 ? "var(--warn)" : "var(--bear)";
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">{t('balance_sheet_title', lang)} <span className="en">Balance sheet</span></div></div>
      <div className="card" style={{ padding: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div>
            <div className="tiny muted">{t('strength_score', lang)}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
              <span className="num" style={{ fontSize: 26, fontWeight: 600, color: col }}>{b.score}</span>
              <span className="small" style={{ color: col, fontWeight: 600 }}>{b.label}</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ height: 8, borderRadius: 99, background: "var(--bg-2)", overflow: "hidden" }}>
              <div style={{ width: b.score + "%", height: "100%", background: col, borderRadius: 99 }} />
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
          {b.items.map((it) => (
            <div key={it.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--border)", gap: 10 }}>
              <span className="small" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: it.good === true ? "var(--bull)" : it.good === false ? "var(--bear)" : "var(--ink-4)", flex: "none" }} />
                {it.k}<span className="en tiny">{it.en}</span>
              </span>
              <span className="num small" style={{ fontWeight: 600 }}>{it.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Analyst consensus ---------------- */
function Analysts({ c, lang }) {
  const a = c.analysts;
  
  const dist = [
    { k: "strongBuy", label: "Strong Buy", th: t('rating_sbuy', lang), col: "var(--bull)" },
    { k: "buy", label: "Buy", th: t('rating_buy', lang), col: "#4cae6a" },
    { k: "hold", label: "Hold", th: t('rating_hold', lang), col: "var(--warn)" },
    { k: "sell", label: "Sell", th: t('rating_sell', lang), col: "#e0795f" },
    { k: "strongSell", label: "Strong Sell", th: t('rating_ssell', lang), col: "var(--bear)" },
  ];

  const total = dist.reduce((s, d) => s + (a[d.k] || 0), 0);
  const maxc = Math.max(...dist.map((d) => a[d.k] || 0), 1);
  const span = a.highNum - a.lowNum || 1;
  const nowPos = Math.max(0, Math.min(100, ((a.nowNum - a.lowNum) / span) * 100));
  const avgPos = Math.max(0, Math.min(100, ((a.avgNum - a.lowNum) / span) * 100));
  const lowPos = 0, highPos = 100;
  const upside = ((a.avgNum - a.nowNum) / a.nowNum) * 100;
  const up = upside >= 0;
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">{t('analyst_consensus_title', lang)} <span className="en">Analyst consensus</span></div><div className="section-note">{total} {t('analyst_firms_unit', lang)}</div></div>
      <div className="consensus-wrap">
        <div className="card" style={{ padding: 15 }}>
          <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>{t('recommendations_lbl', lang)} <span className="en">Recommendations</span></div>
          {dist.map((d) => {
            const cnt = a[d.k] || 0;
            return (
              <div className="dist-row" key={d.k}>
                <span className="lab">{d.th} <span className="en tiny">{d.label}</span></span>
                <span className="dist-bar"><span style={{ width: (cnt / maxc) * 100 + "%", background: d.col }} /></span>
                <span className="cnt">{cnt}</span>
              </div>
            );
          })}
        </div>

        <div className="card target-card">
          <div className="target-now">
            <div>
              <div className="tiny muted">{t('avg_target', lang)} <span className="en">Avg target</span></div>
              <div className="num" style={{ fontSize: 22, fontWeight: 600 }}>{a.targetAvg}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="tiny muted">{up ? "upside" : "downside"} {t('from_current_price', lang)}</div>
              <div className={"num " + (up ? "delta up" : "delta down")} style={{ fontSize: 20, fontWeight: 700, justifyContent: "flex-end" }}>{up ? "+" : ""}{fmtN(upside, 1)}%</div>
            </div>
          </div>
          <div className="target-bar">
            <div className="tb-track" />
            <div className="tb-mark" style={{ left: lowPos + "%" }}><div className="pin" /><div className="v">{a.targetLow}</div><div className="l">{t('low_label', lang)}</div></div>
            <div className="tb-mark" style={{ left: avgPos + "%" }}><div className="pin" /><div className="v">{a.targetAvg}</div><div className="l">{t('avg_label', lang)}</div></div>
            <div className="tb-mark" style={{ left: highPos + "%" }}><div className="pin" /><div className="v">{a.targetHigh}</div><div className="l">{t('high_label', lang)}</div></div>
            <div className="tb-now" style={{ left: nowPos + "%" }}><div className="dot" /><div className="cap">{t('current_price', lang)} {c.price.now}</div></div>
          </div>
          <div className="foot" style={{ marginTop: 18 }}>{t('target_track_foot', lang)}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Filing / Catalysts / Risks / Disclaimer ---------------- */
function Filing({ c, lang }) {
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">{t('latest_filing_title', lang)} <span className="en">Latest filing</span></div></div>
      <a href={c.filing.url} target="_blank" rel="noopener noreferrer" className="card" style={{ padding: 15, display: "flex", gap: 13, textDecoration: "none", color: "inherit", cursor: "pointer" }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--accent-soft)", color: "var(--accent-ink)", display: "grid", placeItems: "center", flex: "none" }}><IconDoc style={{ width: 19, height: 19 }} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            {c.filing.title}
            <IconArrowRight style={{ width: 14, height: 14, color: "var(--accent-ink)" }} />
          </div>
          <div className="tiny muted" style={{ margin: "1px 0 6px" }}>{c.filing.date}</div>
          <div className="small dim" style={{ lineHeight: 1.55 }}>{c.filing.highlight}</div>
        </div>
      </a>
    </div>
  );
}
function CatalystsRisks({ c, lang }) {
  return (
    <div className="container section">
      <div className="cr-grid">
        <div className="card" style={{ padding: 15 }}>
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: "var(--bull)", display: "inline-flex" }}><IconBolt style={{ width: 17, height: 17 }} /></span>{t('catalysts_title', lang)} <span className="en">Catalysts</span></div>
          <ul className="cr-list">
            {c.catalysts.map((tText, i) => <li key={i}><span className="cr-mk" style={{ background: "var(--bull-soft)", color: "var(--bull)" }}><IconCheck style={{ width: 12, height: 12 }} /></span>{tText}</li>)}
          </ul>
        </div>
        <div className="card" style={{ padding: 15 }}>
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: "var(--bear)", display: "inline-flex" }}><IconAlert style={{ width: 17, height: 17 }} /></span>{t('risks_title', lang)} <span className="en">Risks</span></div>
          <ul className="cr-list">
            {c.risks.map((tText, i) => <li key={i}><span className="cr-mk" style={{ background: "var(--bear-soft)", color: "var(--bear)" }}><IconAlert style={{ width: 11, height: 11 }} /></span>{tText}</li>)}
          </ul>
        </div>
      </div>
      <div className="disclaimer" style={{ marginTop: 14 }}>
        {t('disclaimer_text', lang).replace('{analysisDate}', c.analysisDate)}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
function Report({ c, onBack, lang }) {
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 230);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  React.useEffect(() => { window.scrollTo(0, 0); }, [c.id]);

  return (
    <div>
      <div className="report-head">
        <div className={"rh-compact" + (compact ? " show" : "")}>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={onBack}><IconBack style={{ width: 16, height: 16 }} /></button>
          <MonoLogo c={c} size={28} />
          <span className="nm">{c.name}</span>
          <span className="num small muted">{c.price.now}</span>
          <span style={{ marginLeft: "auto" }}><RatingPill rating={c.rating} label={c.ratingLabel} /></span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 6 }}>
        <button className="backlink" onClick={onBack}><IconBack />{t('back_to_list', lang)}</button>
      </div>

      <Snapshot c={c} lang={lang} />
      <Verdict c={c} lang={lang} />
      <PriceAction c={c} lang={lang} />
      <Financials c={c} lang={lang} />
      <Margins c={c} lang={lang} />

      <div className="container section">
        <div className="section-head"><div className="section-title">{t('business_segments_title', lang)} <span className="en">Business segments</span></div></div>
      </div>
      <div className="container"><Segments company={c} lang={lang} /></div>

      <Valuation c={c} lang={lang} />
      <Balance c={c} lang={lang} />
      <Analysts c={c} lang={lang} />
      <Filing c={c} lang={lang} />
      <CatalystsRisks c={c} lang={lang} />
    </div>
  );
}

function AnalysisView({ a, lang }) {
  const adapted = adaptRecord(a, lang);
  return <Report c={adapted} onBack={() => {}} lang={lang} />;
}

Object.assign(window, { Report, AnalysisView });
