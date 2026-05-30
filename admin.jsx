// Admin publish flow (route: /admin). Not linked from the public nav.
// Flow: enter ticker -> Fetch (FMP via /api/financials) -> review/edit fields
// and the JSON snapshot -> live preview -> Publish (/api/publish). Both API
// calls send the admin token in the x-admin-token header. The token is the
// ADMIN_TOKEN you set in Vercel env; it's kept in localStorage for convenience.

const { useState } = React;

const BLANK = {
  ticker: '', name: '', name_th: '', exchange: '', country: '', sector: '',
  logo_url: '', analysis_date: new Date().toISOString().slice(0, 10), rating: 'neutral',
  summary_en: '', summary_th: '', body_en: '', body_th: '',
};

function zip(enText, thText) {
  const en = (enText || '').split('\n').map(s => s.trim()).filter(Boolean);
  const th = (thText || '').split('\n').map(s => s.trim()).filter(Boolean);
  const n = Math.max(en.length, th.length);
  return Array.from({ length: n }, (_, i) => ({ en: en[i] || '', th: th[i] || '' }));
}

function AdminPage({ lang }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [form, setForm] = useState(BLANK);
  const [snapshotText, setSnapshotText] = useState('{}');
  const [catEn, setCatEn] = useState(''); const [catTh, setCatTh] = useState('');
  const [riskEn, setRiskEn] = useState(''); const [riskTh, setRiskTh] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [pvLang, setPvLang] = useState('th');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const saveToken = (v) => { setToken(v); localStorage.setItem('admin_token', v); };

  let snapshot = {};
  let snapErr = null;
  try { snapshot = JSON.parse(snapshotText || '{}'); } catch (e) { snapErr = e.message; }

  const record = {
    ...form,
    slug: `${form.ticker}-${form.analysis_date}`.toLowerCase().replace(/[^a-z0-9.-]+/g, '-'),
    catalysts: zip(catEn, catTh),
    risks: zip(riskEn, riskTh),
    data_snapshot: snapshot,
  };

  async function fetchFinancials() {
    if (!form.ticker) { setStatus({ err: 'ใส่ ticker ก่อน' }); return; }
    setBusy(true); setStatus(null); setWarnings([]);
    try {
      const r = await fetch(`/api/financials?ticker=${encodeURIComponent(form.ticker)}`, {
        headers: { 'x-admin-token': token },
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
      setForm(f => ({
        ...f,
        name: data.meta?.name || f.name,
        exchange: data.meta?.exchange || f.exchange,
        sector: data.meta?.sector || f.sector,
        country: countryFromExchange(data.meta?.exchange, data.meta?.country) || f.country,
        logo_url: data.meta?.logo_url || f.logo_url,
      }));
      setSnapshotText(JSON.stringify(data.snapshot, null, 2));
      setWarnings(data._warnings || []);
      setStatus({ ok: `ดึงข้อมูล ${form.ticker} แล้ว — ตรวจ/เติมส่วนที่ขาด แล้วกด Publish` });
    } catch (e) {
      setStatus({ err: 'Fetch ล้มเหลว: ' + e.message });
    } finally { setBusy(false); }
  }

  async function publish() {
    if (snapErr) { setStatus({ err: 'JSON snapshot ผิด: ' + snapErr }); return; }
    setBusy(true); setStatus(null);
    try {
      const r = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(record),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || data.error || `HTTP ${r.status}`);
      setStatus({ ok: `เผยแพร่แล้ว → /company/${data.slug}`, slug: data.slug });
    } catch (e) {
      setStatus({ err: 'Publish ล้มเหลว: ' + e.message });
    } finally { setBusy(false); }
  }

  return (
    <main className="container admin">
      <h1>Admin · เผยแพร่บทวิเคราะห์</h1>

      <label className="fld">
        <span>Admin token</span>
        <input type="password" value={token} onChange={(e) => saveToken(e.target.value)} placeholder="ADMIN_TOKEN จาก Vercel env" />
      </label>

      <div className="admin-row">
        <label className="fld grow">
          <span>Ticker</span>
          <input value={form.ticker} onChange={set('ticker')} placeholder="NVDA / 005930.KS / 7203.T" />
        </label>
        <button className="btn" onClick={fetchFinancials} disabled={busy}>
          {busy ? '...' : '⟳ Fetch financials'}
        </button>
      </div>

      {status && <p className={status.err ? 'error' : 'ok-msg'}>{status.err || status.ok}
        {status.slug && <> · <a href={`/company/${status.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/company/${status.slug}`); }}>เปิดดู</a></>}
      </p>}
      {warnings.length > 0 && (
        <div className="warn-box">
          <b>ข้อมูลบางส่วนดึงไม่ได้ (เติมมือในช่อง JSON snapshot):</b>
          <ul>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
        </div>
      )}

      <div className="admin-grid">
        <label className="fld"><span>ชื่อ (EN)</span><input value={form.name} onChange={set('name')} /></label>
        <label className="fld"><span>ชื่อ (TH)</span><input value={form.name_th} onChange={set('name_th')} /></label>
        <label className="fld"><span>Exchange</span><input value={form.exchange} onChange={set('exchange')} placeholder="NASDAQ" /></label>
        <label className="fld"><span>Country</span>
          <select value={form.country} onChange={set('country')}>
            <option value="">—</option>
            {Object.keys(window.COUNTRIES).map(c => <option key={c} value={c}>{window.COUNTRIES[c].flag} {c}</option>)}
          </select>
        </label>
        <label className="fld"><span>Sector</span><input value={form.sector} onChange={set('sector')} /></label>
        <label className="fld"><span>วันที่วิเคราะห์</span><input type="date" value={form.analysis_date} onChange={set('analysis_date')} /></label>
        <label className="fld"><span>Rating</span>
          <select value={form.rating} onChange={set('rating')}>
            <option value="bull">🟢 Bullish</option>
            <option value="neutral">🟡 Neutral</option>
            <option value="bear">🔴 Bearish</option>
          </select>
        </label>
      </div>

      <label className="fld"><span>สรุปสั้น (EN)</span><textarea rows="2" value={form.summary_en} onChange={set('summary_en')} /></label>
      <label className="fld"><span>สรุปสั้น (TH)</span><textarea rows="2" value={form.summary_th} onChange={set('summary_th')} /></label>
      <label className="fld"><span>Our Take — เนื้อหาเต็ม (EN, markdown)</span><textarea rows="8" value={form.body_en} onChange={set('body_en')} /></label>
      <label className="fld"><span>Our Take — เนื้อหาเต็ม (TH, markdown)</span><textarea rows="8" value={form.body_th} onChange={set('body_th')} /></label>

      <div className="admin-grid">
        <label className="fld"><span>ปัจจัยหนุน (EN, บรรทัดละข้อ)</span><textarea rows="4" value={catEn} onChange={(e) => setCatEn(e.target.value)} /></label>
        <label className="fld"><span>ปัจจัยหนุน (TH, บรรทัดละข้อ)</span><textarea rows="4" value={catTh} onChange={(e) => setCatTh(e.target.value)} /></label>
        <label className="fld"><span>ปัจจัยเสี่ยง (EN, บรรทัดละข้อ)</span><textarea rows="4" value={riskEn} onChange={(e) => setRiskEn(e.target.value)} /></label>
        <label className="fld"><span>ปัจจัยเสี่ยง (TH, บรรทัดละข้อ)</span><textarea rows="4" value={riskTh} onChange={(e) => setRiskTh(e.target.value)} /></label>
      </div>

      <label className="fld">
        <span>data_snapshot (JSON — แก้ตัวเลขที่ดึงไม่ได้ตรงนี้) {snapErr && <em className="err-inline">⚠ {snapErr}</em>}</span>
        <textarea rows="14" className="mono" value={snapshotText} onChange={(e) => setSnapshotText(e.target.value)} />
      </label>

      <div className="admin-actions">
        <button className="btn primary" onClick={publish} disabled={busy || !!snapErr}>↑ Publish</button>
        <span className="muted">slug: <code>{record.slug}</code></span>
      </div>

      <div className="admin-preview">
        <div className="preview-head">
          <h2>ตัวอย่างก่อนเผยแพร่</h2>
          <button className="lang-toggle" onClick={() => setPvLang(pvLang === 'th' ? 'en' : 'th')}>{pvLang === 'th' ? 'EN' : 'ไทย'}</button>
        </div>
        <div className="preview-frame article">
          {snapErr ? <p className="error">แก้ JSON snapshot ก่อนถึงจะพรีวิวได้</p>
            : <AnalysisView a={record} lang={pvLang} />}
        </div>
      </div>
    </main>
  );
}

// Best-effort country inference from exchange when FMP omits it.
function countryFromExchange(ex, country) {
  if (country && window.COUNTRIES[country]) return country;
  const map = { NASDAQ: 'US', NYSE: 'US', KOSPI: 'KR', KOSDAQ: 'KR', TSE: 'JP', JPX: 'JP', HKEX: 'HK', HKSE: 'HK', SSE: 'CN', SZSE: 'CN', TWSE: 'TW' };
  return map[(ex || '').toUpperCase()] || '';
}

Object.assign(window, { AdminPage });
