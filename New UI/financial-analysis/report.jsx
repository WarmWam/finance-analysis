/* report.jsx — Company Report page (exported to window) */

function moneyU(c, v, dec) {
  if (v === null || v === undefined) return null;
  return c.sym + fmtN(v, dec);
}

/* ---------------- Snapshot header ---------------- */
function Snapshot({ c }) {
  const ch = c.price.changePct;
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
        <RatingPill rating={c.rating} label={c.ratingLabel} size="lg" />
      </div>

      <div className="price-row">
        <div className="num price-now">{c.price.now}</div>
        <div className="price-cur">{c.priceCcy || c.currency}</div>
        <Delta value={ch} />
        <div className="price-asof">ราคา ณ วันที่วิเคราะห์<br />{c.price.asOf}</div>
      </div>
      {c.fxNote && <div className="tiny muted" style={{ marginTop: 8, display: "inline-flex", gap: 5, alignItems: "center" }}><IconInfo style={{ width: 13, height: 13 }} />{c.fxNote}</div>}

      <div className="snap-stats">
        <div className="snap-stat"><div className="k">Market cap</div><div className="v">{c.price.marketCap}</div></div>
        <div className="snap-stat"><div className="k">P/E</div><div className="v">{c.price.pe}</div></div>
        <div className="snap-stat"><div className="k">Forward P/E</div><div className="v">{c.price.peFwd}</div></div>
        <div className="snap-stat"><div className="k">วันที่วิเคราะห์</div><div className="v" style={{ fontSize: 13, fontFamily: "var(--font)", fontWeight: 600 }}>{c.analysisDate}</div></div>
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
function VQ({ q, item }) {
  const t = toneStyle(item.tone);
  const ic = item.tone === "up" ? <IconArrowUp /> : item.tone === "down" ? <IconArrowDown /> : <IconArrowRight />;
  return (
    <div className="vq">
      <div className="vq-ic" style={{ background: t.bg, color: t.fg }}>{React.cloneElement(ic, { style: { width: 16, height: 16 } })}</div>
      <div>
        <div className="q">{q}</div>
        <div className="a">{item.label}</div>
        <div className="tiny muted" style={{ marginTop: 4 }}>{item.detail}</div>
      </div>
    </div>
  );
}
function Verdict({ c }) {
  const v = c.verdict;
  return (
    <div className="container section">
      <div className="verdict">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="section-title" style={{ fontSize: 16 }}>มุมมองของเรา <span className="en">Our view</span></div>
          <RatingPill rating={c.rating} label={c.ratingLabel} />
        </div>
        <p className="verdict-thesis">{c.thesis}</p>
        <div className="verdict-grid">
          <VQ q="หุ้นนี้น่าสนใจไหม?" item={v.interesting} />
          <VQ q="กำไร / margin ดีขึ้นหรือแย่ลง?" item={v.margin} />
          <VQ q="ธุรกิจไหนทำเงินหลัก?" item={v.mainBiz} />
          <VQ q="Valuation แพงหรือถูก?" item={v.valuation} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- Financials ---------------- */
const FIN_ROWS = [
  { key: "revenue", th: "รายได้", en: "Revenue", unit: true },
  { key: "grossProfit", th: "กำไรขั้นต้น", en: "Gross profit", unit: true },
  { key: "operatingIncome", th: "กำไรดำเนินงาน", en: "Operating income", unit: true },
  { key: "netIncome", th: "กำไรสุทธิ", en: "Net income", unit: true, hl: true },
  { key: "eps", th: "กำไรต่อหุ้น", en: "EPS", eps: true },
  { key: "fcf", th: "กระแสเงินสดอิสระ", en: "Free cash flow", unit: true },
];
function Financials({ c }) {
  const f = c.financials, years = c.years, n = years.length;
  const series = [
    { kind: "bar", name: "รายได้ Revenue", color: "var(--accent-bar)", data: f.revenue },
    { kind: "line", name: "กำไรดำเนินงาน Op. income", color: "var(--c2)", data: f.operatingIncome },
    { kind: "line", name: "กำไรสุทธิ Net income", color: "var(--ink)", data: f.netIncome },
  ];
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">รายได้ & กำไร 5 ปี <span className="en">Revenue & profit</span></div></div>
      <div className="card" style={{ padding: "15px 14px 12px" }}>
        <BarLineChart series={series} years={years} unit={c.sym + " " + c.unit + " " + c.currency} height={250} />
      </div>

      <div className="tbl-wrap" style={{ marginTop: 12 }}>
        <table className="fin">
          <thead>
            <tr>
              <th>รายการ</th>
              {years.map((y) => <th key={y}>{y}</th>)}
              <th>YoY</th>
            </tr>
          </thead>
          <tbody>
            {FIN_ROWS.map((r) => {
              const arr = f[r.key];
              const allNull = arr.every((v) => v == null);
              const last = arr[n - 1], prev = arr[n - 2];
              const dec = r.eps ? (Math.abs(last || 0) >= 100 ? 0 : 2) : 1;
              return (
                <tr key={r.key} className={r.hl ? "hl" : ""}>
                  <td className="rowlabel">{r.th}<small>{r.en}{r.eps ? " · " + c.sym + "/หุ้น" : ""}</small></td>
                  {arr.map((v, i) => (
                    <td key={i}>{v == null ? <span className="dash">—</span> : <span className="num">{r.eps ? c.sym + fmtN(v, dec) : c.sym + fmtN(v, 1)}</span>}</td>
                  ))}
                  <td>{allNull ? <span className="dash">—</span> : <Delta value={yoy(last, prev)} />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="foot">หน่วยมูลค่า: {c.sym} {c.unit} ({c.unitEn}) · EPS = {c.sym}/หุ้น · “—” = ไม่เปิดเผย/ไม่มีข้อมูล</div>
    </div>
  );
}

/* ---------------- Margins ---------------- */
function Margins({ c }) {
  const m = c.margins, years = c.years;
  const series = [];
  if (m.gross.some((v) => v != null)) series.push({ name: "ขั้นต้น Gross", color: "var(--c2)", data: m.gross });
  series.push({ name: "ดำเนินงาน Operating", color: "var(--accent)", data: m.operating });
  series.push({ name: "สุทธิ Net", color: "var(--ink)", data: m.net });
  const lastOp = m.operating[years.length - 1], firstOp = m.operating[0];
  const trendUp = lastOp > firstOp;
  return (
    <div className="container section">
      <div className="section-head">
        <div className="section-title">แนวโน้มอัตรากำไร <span className="en">Margin trend</span></div>
        <div className={"delta " + (trendUp ? "up" : "down")} style={{ fontSize: 12 }}>
          {trendUp ? <IconArrowUp /> : <IconArrowDown />} Operating {trendUp ? "ดีขึ้น" : "แย่ลง"}
        </div>
      </div>
      <div className="card" style={{ padding: "15px 14px 12px" }}>
        <LineChart series={series} years={years} floor={-60} height={220} unit="อัตรากำไรเทียบยอดขาย (% of revenue)" />
        {!m.gross.some((v) => v != null) && <div className="note-row"><IconInfo style={{ width: 14, height: 14, flex: "none", marginTop: 1 }} />บริษัทไม่เปิดเผยกำไรขั้นต้น (gross profit) แยกต่างหาก — แสดงเฉพาะอัตรากำไรดำเนินงานและสุทธิ</div>}
      </div>
    </div>
  );
}

/* ---------------- Valuation ---------------- */
function valTone(now, avg) {
  if (now < avg * 0.92) return { tag: "ถูกกว่าอดีต", cls: "bull" };
  if (now > avg * 1.08) return { tag: "แพงกว่าอดีต", cls: "bear" };
  return { tag: "ใกล้ค่าเฉลี่ย", cls: "neutral" };
}
function ValRow({ r }) {
  const span = r.high - r.low || 1;
  const nowPos = Math.max(0, Math.min(100, ((r.now - r.low) / span) * 100));
  const avgPos = Math.max(0, Math.min(100, ((r.avg5 - r.low) / span) * 100));
  const peerPos = r.peer != null ? Math.max(0, Math.min(100, ((r.peer - r.low) / span) * 100)) : null;
  const t = valTone(r.now, r.avg5);
  const tt = toneStyle(t.cls === "bull" ? "up" : t.cls === "bear" ? "down" : "neutral");
  return (
    <div style={{ padding: "13px 0", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
        <div className="val-k">{r.k}{r.en ? <span className="en">{r.en}</span> : null}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span className="num" style={{ fontWeight: 600, fontSize: 15 }}>{fmtN(r.now, 1)}×</span>
          <span className="cheap-tag" style={{ background: tt.bg, color: tt.fg }}>{t.tag}</span>
        </div>
      </div>
      <div className="range-track">
        <div className="range-line" />
        <div className="range-fill" style={{ left: Math.min(nowPos, avgPos) + "%", width: Math.abs(nowPos - avgPos) + "%" }} />
        <div className="range-avg" style={{ left: avgPos + "%" }} title={"เฉลี่ย 5 ปี " + fmtN(r.avg5, 1)} />
        {peerPos != null && <div style={{ position: "absolute", top: 9, left: peerPos + "%", width: 9, height: 9, borderRadius: 99, background: "var(--surface)", border: "2px solid var(--ink-4)", transform: "translateX(-50%)" }} title={"peer " + fmtN(r.peer, 1)} />}
        <div className="range-now" style={{ left: nowPos + "%", background: tt.fg }} title={"ปัจจุบัน " + fmtN(r.now, 1)} />
      </div>
      <div className="range-cap"><span>ต่ำสุด {fmtN(r.low, 1)}</span><span>เฉลี่ย5ปี {fmtN(r.avg5, 1)} · peer {r.peer != null ? fmtN(r.peer, 1) : "—"}</span><span>สูงสุด {fmtN(r.high, 1)}</span></div>
    </div>
  );
}
function Valuation({ c }) {
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">มูลค่าหุ้น <span className="en">Valuation</span></div><div className="section-note">เทียบช่วง 5 ปี & peers</div></div>
      <div className="card" style={{ padding: "2px 15px 14px" }}>
        {c.valuation.map((r) => <ValRow key={r.k} r={r} />)}
        <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
          <span className="tiny muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 11, height: 11, borderRadius: 99, background: "var(--accent)", display: "inline-block" }} />ปัจจุบัน</span>
          <span className="tiny muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 2, height: 12, background: "var(--ink-3)", display: "inline-block" }} />เฉลี่ย 5 ปี</span>
          <span className="tiny muted" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 99, border: "2px solid var(--ink-4)", display: "inline-block" }} />peer</span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Balance sheet ---------------- */
function Balance({ c }) {
  const b = c.balance;
  const col = b.score >= 80 ? "var(--bull)" : b.score >= 65 ? "var(--warn)" : "var(--bear)";
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">สุขภาพงบดุล <span className="en">Balance sheet</span></div></div>
      <div className="card" style={{ padding: 15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <div>
            <div className="tiny muted">คะแนนความแข็งแกร่ง</div>
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
const DIST = [
  { k: "strongBuy", label: "Strong Buy", th: "ซื้อมาก", col: "var(--bull)" },
  { k: "buy", label: "Buy", th: "ซื้อ", col: "#4cae6a" },
  { k: "hold", label: "Hold", th: "ถือ", col: "var(--warn)" },
  { k: "sell", label: "Sell", th: "ขาย", col: "#e0795f" },
  { k: "strongSell", label: "Strong Sell", th: "ขายมาก", col: "var(--bear)" },
];
function Analysts({ c }) {
  const a = c.analysts;
  const total = DIST.reduce((s, d) => s + (a[d.k] || 0), 0);
  const maxc = Math.max(...DIST.map((d) => a[d.k] || 0), 1);
  const span = a.highNum - a.lowNum || 1;
  const nowPos = Math.max(0, Math.min(100, ((a.nowNum - a.lowNum) / span) * 100));
  const avgPos = Math.max(0, Math.min(100, ((a.avgNum - a.lowNum) / span) * 100));
  const lowPos = 0, highPos = 100;
  const upside = ((a.avgNum - a.nowNum) / a.nowNum) * 100;
  const up = upside >= 0;
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">มุมมองนักวิเคราะห์ <span className="en">Analyst consensus</span></div><div className="section-note">{total} สำนัก</div></div>
      <div className="consensus-wrap">
        <div className="card" style={{ padding: 15 }}>
          <div className="small" style={{ fontWeight: 600, marginBottom: 6 }}>คำแนะนำ <span className="en">Recommendations</span></div>
          {DIST.map((d) => {
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
              <div className="tiny muted">ราคาเป้าหมายเฉลี่ย <span className="en">Avg target</span></div>
              <div className="num" style={{ fontSize: 22, fontWeight: 600 }}>{a.targetAvg}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="tiny muted">{up ? "upside" : "downside"} จากราคาปัจจุบัน</div>
              <div className={"num " + (up ? "delta up" : "delta down")} style={{ fontSize: 20, fontWeight: 700, justifyContent: "flex-end" }}>{up ? "+" : ""}{fmtN(upside, 1)}%</div>
            </div>
          </div>
          <div className="target-bar">
            <div className="tb-track" />
            <div className="tb-mark" style={{ left: lowPos + "%" }}><div className="pin" /><div className="v">{a.targetLow}</div><div className="l">ต่ำ</div></div>
            <div className="tb-mark" style={{ left: avgPos + "%" }}><div className="pin" /><div className="v">{a.targetAvg}</div><div className="l">เฉลี่ย</div></div>
            <div className="tb-mark" style={{ left: highPos + "%" }}><div className="pin" /><div className="v">{a.targetHigh}</div><div className="l">สูง</div></div>
            <div className="tb-now" style={{ left: nowPos + "%" }}><div className="dot" /><div className="cap">ราคาปัจจุบัน {c.price.now}</div></div>
          </div>
          <div className="foot" style={{ marginTop: 18 }}>เส้นแสดงช่วงราคาเป้าหมาย ต่ำ–สูง · จุดน้ำเงินคือราคา ณ วันที่วิเคราะห์</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Filing / Catalysts / Risks / Disclaimer ---------------- */
function Filing({ c }) {
  return (
    <div className="container section">
      <div className="section-head"><div className="section-title">ไฮไลต์รายงานล่าสุด <span className="en">Latest filing</span></div></div>
      <div className="card" style={{ padding: 15, display: "flex", gap: 13 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--accent-soft)", color: "var(--accent-ink)", display: "grid", placeItems: "center", flex: "none" }}><IconDoc style={{ width: 19, height: 19 }} /></div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{c.filing.title}</div>
          <div className="tiny muted" style={{ margin: "1px 0 6px" }}>{c.filing.date}</div>
          <div className="small dim" style={{ lineHeight: 1.55 }}>{c.filing.highlight}</div>
        </div>
      </div>
    </div>
  );
}
function CatalystsRisks({ c }) {
  return (
    <div className="container section">
      <div className="cr-grid">
        <div className="card" style={{ padding: 15 }}>
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: "var(--bull)", display: "inline-flex" }}><IconBolt style={{ width: 17, height: 17 }} /></span>ปัจจัยหนุน <span className="en">Catalysts</span></div>
          <ul className="cr-list">
            {c.catalysts.map((t, i) => <li key={i}><span className="cr-mk" style={{ background: "var(--bull-soft)", color: "var(--bull)" }}><IconCheck style={{ width: 12, height: 12 }} /></span>{t}</li>)}
          </ul>
        </div>
        <div className="card" style={{ padding: 15 }}>
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ color: "var(--bear)", display: "inline-flex" }}><IconAlert style={{ width: 17, height: 17 }} /></span>ความเสี่ยง <span className="en">Risks</span></div>
          <ul className="cr-list">
            {c.risks.map((t, i) => <li key={i}><span className="cr-mk" style={{ background: "var(--bear-soft)", color: "var(--bear)" }}><IconAlert style={{ width: 11, height: 11 }} /></span>{t}</li>)}
          </ul>
        </div>
      </div>
      <div className="disclaimer" style={{ marginTop: 14 }}>
        <strong>ข้อจำกัดความรับผิดชอบ (Disclaimer):</strong> ข้อมูลและบทวิเคราะห์นี้สร้างขึ้นเพื่อการศึกษาเท่านั้น ไม่ถือเป็นคำแนะนำในการลงทุน ตัวเลขบางส่วนเป็นข้อมูลตัวอย่าง (mock) เพื่อการออกแบบ ผู้ลงทุนควรศึกษาข้อมูลและปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจ · ราคาและตัวเลขอ้างอิง ณ {c.analysisDate}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */
function Report({ c, onBack }) {
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
          <span style={{ marginLeft: "auto" }}><RatingPill rating={c.rating} label={c.rating === "bull" ? "เชิงบวก" : c.rating === "bear" ? "เชิงลบ" : "เป็นกลาง"} /></span>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 6 }}>
        <button className="backlink" onClick={onBack}><IconBack />กลับไปรายการหุ้น</button>
      </div>

      <Snapshot c={c} />
      <Verdict c={c} />
      <Financials c={c} />
      <Margins c={c} />

      <div className="container section">
        <div className="section-head"><div className="section-title">ธุรกิจแยกตามส่วนงาน <span className="en">Business segments</span></div></div>
      </div>
      <div className="container"><Segments company={c} /></div>

      <Valuation c={c} />
      <Balance c={c} />
      <Analysts c={c} />
      <Filing c={c} />
      <CatalystsRisks c={c} />
    </div>
  );
}

Object.assign(window, { Report });
