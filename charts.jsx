// Hand-rolled, dependency-free SVG charts (same spirit as pm25-chiangmai).
// All sized via viewBox so they scale fluidly; colors come from CSS variables.

const CHART_W = 640, CHART_H = 280, PAD = { t: 16, r: 16, b: 36, l: 56 };

function niceMax(v) {
  if (v <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

// Revenue (bars) + Net income (bars), grouped per year. Values in raw units.
function RevenueProfitChart({ annual, currency, lang }) {
  if (!annual || !annual.length) return null;
  const innerW = CHART_W - PAD.l - PAD.r, innerH = CHART_H - PAD.t - PAD.b;
  const max = niceMax(Math.max(...annual.map(d => Math.max(d.revenue || 0, d.net_income || 0))));
  const n = annual.length;
  const slot = innerW / n;
  const bw = Math.min(34, slot * 0.34);
  const y = (v) => PAD.t + innerH - (v / max) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => f * max);

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="chart" role="img">
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={CHART_W - PAD.r} y1={y(tk)} y2={y(tk)} className="grid" />
            <text x={PAD.l - 8} y={y(tk) + 4} className="axis-label" textAnchor="end">{fmtBig(tk, '')}</text>
          </g>
        ))}
        {annual.map((d, i) => {
          const cx = PAD.l + slot * i + slot / 2;
          return (
            <g key={i}>
              <rect x={cx - bw - 2} y={y(d.revenue)} width={bw} height={PAD.t + innerH - y(d.revenue)} className="bar-rev" rx="2" />
              <rect x={cx + 2} y={y(d.net_income)} width={bw} height={PAD.t + innerH - y(d.net_income)} className="bar-net" rx="2" />
              <text x={cx} y={CHART_H - PAD.b + 18} className="axis-label" textAnchor="middle">{d.year}</text>
            </g>
          );
        })}
      </svg>
      <div className="legend">
        <span><i className="sw sw-rev" /> {t('m_revenue', lang)}</span>
        <span><i className="sw sw-net" /> {t('m_net_income', lang)}</span>
      </div>
    </div>
  );
}

// Margin trend: three lines (gross / operating / net), values are %.
function MarginTrendChart({ annual, lang }) {
  if (!annual || !annual.length) return null;
  const rows = annual.map(d => ({
    year: d.year,
    gross: d.revenue ? (d.gross_profit / d.revenue) * 100 : null,
    op:    d.revenue ? (d.operating_income / d.revenue) * 100 : null,
    net:   d.revenue ? (d.net_income / d.revenue) * 100 : null,
  }));
  const innerW = CHART_W - PAD.l - PAD.r, innerH = CHART_H - PAD.t - PAD.b;
  const vals = rows.flatMap(r => [r.gross, r.op, r.net]).filter(v => v != null);
  const max = niceMax(Math.max(...vals, 10));
  const min = Math.min(0, ...vals);
  const n = rows.length;
  const x = (i) => PAD.l + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
  const y = (v) => PAD.t + innerH - ((v - min) / (max - min)) * innerH;
  const path = (key) => rows.map((r, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(r[key])}`).join(' ');
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => min + f * (max - min));
  const series = [
    { key: 'gross', cls: 'ln-gross', label: t('m_gross_margin', lang) },
    { key: 'op',    cls: 'ln-op',    label: t('m_op_margin', lang) },
    { key: 'net',   cls: 'ln-net',   label: t('m_net_margin', lang) },
  ];

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="chart" role="img">
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={CHART_W - PAD.r} y1={y(tk)} y2={y(tk)} className="grid" />
            <text x={PAD.l - 8} y={y(tk) + 4} className="axis-label" textAnchor="end">{tk.toFixed(0)}%</text>
          </g>
        ))}
        {rows.map((r, i) => (
          <text key={i} x={x(i)} y={CHART_H - PAD.b + 18} className="axis-label" textAnchor="middle">{r.year}</text>
        ))}
        {series.map(s => (
          <g key={s.key}>
            <path d={path(s.key)} className={`line ${s.cls}`} fill="none" />
            {rows.map((r, i) => <circle key={i} cx={x(i)} cy={y(r[s.key])} r="3" className={`dot ${s.cls}`} />)}
          </g>
        ))}
      </svg>
      <div className="legend">
        {series.map(s => <span key={s.key}><i className={`sw ${s.cls}`} /> {s.label}</span>)}
      </div>
    </div>
  );
}

// Analyst consensus: horizontal stacked count bar + target range.
function AnalystChart({ analyst, quote, currency, lang }) {
  if (!analyst) return null;
  const buckets = [
    { k: 'strong_buy', cls: 'seg-sbuy', label: 'Strong Buy' },
    { k: 'buy',        cls: 'seg-buy',  label: t('buy', lang) },
    { k: 'hold',       cls: 'seg-hold', label: t('hold', lang) },
    { k: 'sell',       cls: 'seg-sell', label: t('sell', lang) },
  ];
  const total = buckets.reduce((s, b) => s + (analyst[b.k] || 0), 0) || 1;
  const hasCurrentPrice =
    quote && Number.isFinite(quote.price) &&
    Number.isFinite(analyst.target_low) &&
    Number.isFinite(analyst.target_high);
  const currentPos = hasCurrentPrice ? pctRange(quote.price, analyst.target_low, analyst.target_high) : null;
  const currentEdge = currentPos < 16 ? ' edge-left' : currentPos > 84 ? ' edge-right' : '';
  return (
    <div className="analyst">
      <div className="consensus-bar">
        {buckets.map(b => {
          const w = ((analyst[b.k] || 0) / total) * 100;
          if (!w) return null;
          return <div key={b.k} className={`seg ${b.cls}`} style={{ width: `${w}%` }} title={`${b.label}: ${analyst[b.k]}`} />;
        })}
      </div>
      <div className="legend">
        {buckets.map(b => <span key={b.k}><i className={`sw ${b.cls}`} /> {b.label} ({analyst[b.k] || 0})</span>)}
      </div>
      <div className="target-range">
        <div className="target-track">
          <span className="t-low">{fmtNum(analyst.target_low, 0)}</span>
          <span className="t-avg" style={{ left: `${pctPos(analyst)}%` }}>
            {t('price_target', lang)}: <b>{fmtNum(analyst.target_avg, 0)}</b>
          </span>
          {hasCurrentPrice && (
            <span className={`t-current${currentEdge}`} style={{ left: `${currentPos}%` }}>
              <span className="t-current-label">{t('current_price', lang)}: <b>{currency}{fmtNum(quote.price, 2)}</b></span>
            </span>
          )}
          <span className="t-high">{fmtNum(analyst.target_high, 0)}</span>
        </div>
      </div>
    </div>
  );
}
function pctPos(a) {
  return pctRange(a.target_avg, a.target_low, a.target_high);
}
function pctRange(value, low, high) {
  if (high === low) return 50;
  return Math.max(4, Math.min(96, ((value - low) / (high - low)) * 100));
}

// Segment analysis: flexible business/product/geography lenses. The data shape
// is optional and lives under data_snapshot.segments.
const SEGMENT_COLORS = ['#1f6feb', '#15a06b', '#d8b54a', '#7c5cff', '#d2453a', '#2aa198', '#bf7b30', '#5f6b7a'];

function SegmentAnalysisChart({ segments, currency, lang }) {
  const sets = (segments?.sets || []).filter(s => s && s.items && s.items.length);
  const [setId, setSetId] = React.useState('');
  const [metric, setMetric] = React.useState('revenue');
  const [mode, setMode] = React.useState('mix');
  if (!sets.length) return null;
  const set = sets.find(s => s.id === setId) || sets[0];
  const metrics = segmentMetrics(set, lang);
  const activeMetric = metrics.some(m => m.key === metric) ? metric : (metrics[0]?.key || 'revenue');
  const lineMode = activeMetric === 'operating_margin' || activeMetric === 'revenue_growth';
  const canMix = !lineMode && segmentCanMix(set, activeMetric);
  const activeMode = canMix ? mode : 'absolute';

  return (
    <div className="segment-panel">
      <div className="segment-controls">
        <label>
          <span>{t('segment_set', lang)}</span>
          <select value={set.id} onChange={(e) => { setSetId(e.target.value); setMetric('revenue'); setMode('mix'); }}>
            {sets.map(s => <option key={s.id} value={s.id}>{segmentSetLabel(s, lang)}</option>)}
          </select>
        </label>
        <label>
          <span>{t('segment_metric', lang)}</span>
          <select value={activeMetric} onChange={(e) => { setMetric(e.target.value); setMode(e.target.value === 'revenue' ? 'mix' : 'absolute'); }}>
            {metrics.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </label>
        {!lineMode && (
          <div className="segment-toggle" role="group" aria-label={t('segment_view', lang)}>
            <button className={activeMode === 'absolute' ? 'active' : ''} onClick={() => setMode('absolute')}>{t('segment_absolute', lang)}</button>
            <button className={activeMode === 'mix' ? 'active' : ''} onClick={() => setMode('mix')} disabled={!canMix}>{t('segment_mix', lang)}</button>
          </div>
        )}
      </div>

      {lineMode
        ? <SegmentLineChart set={set} metric={activeMetric} lang={lang} />
        : <SegmentStackedChart set={set} metric={activeMetric} mode={activeMode} currency={currency || segments.currency || '$'} lang={lang} />}

      <SegmentTable set={set} currency={currency || segments.currency || '$'} lang={lang} />
      {(segments.notes || set.notes) && (
        <p className="segment-note">{[...(segments.notes || []), ...(set.notes || [])].join(' ')}</p>
      )}
      {segments.disclosure_quality && (
        <p className="segment-quality">{t('segment_disclosure', lang)}: <b>{segments.disclosure_quality}</b></p>
      )}
    </div>
  );
}

function SegmentStackedChart({ set, metric, mode, currency, lang }) {
  const years = segmentYears(set);
  const items = segmentItemsWithMetric(set, metric);
  if (!years.length || !items.length) return <p className="muted">{t('segment_not_disclosed', lang)}</p>;
  const innerW = CHART_W - PAD.l - PAD.r, innerH = CHART_H - PAD.t - PAD.b;
  const slot = innerW / years.length;
  const bw = Math.min(48, slot * 0.55);
  const rows = years.map(year => {
    const vals = items.map(item => ({ item, value: segmentValue(item, year, metric) || 0 }));
    const pos = vals.filter(v => v.value > 0).reduce((s, v) => s + v.value, 0);
    const neg = vals.filter(v => v.value < 0).reduce((s, v) => s + v.value, 0);
    return { year, vals, pos, neg };
  });
  const mix = mode === 'mix';
  const maxPos = mix ? 100 : niceMax(Math.max(...rows.map(r => r.pos), 1));
  const minNeg = mix ? 0 : Math.min(0, ...rows.map(r => r.neg));
  const span = maxPos - minNeg || 1;
  const y = (v) => PAD.t + ((maxPos - v) / span) * innerH;
  const ticks = mix ? [0, 25, 50, 75, 100] : [minNeg, 0, maxPos * 0.5, maxPos].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="chart-wrap segment-chart-wrap">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="chart" role="img">
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={CHART_W - PAD.r} y1={y(tk)} y2={y(tk)} className="grid" />
            <text x={PAD.l - 8} y={y(tk) + 4} className="axis-label" textAnchor="end">{mix ? `${tk}%` : fmtBig(tk, '')}</text>
          </g>
        ))}
        {rows.map((row, i) => {
          const cx = PAD.l + slot * i + slot / 2;
          const total = row.pos || 1;
          let pos = 0, neg = 0;
          return (
            <g key={row.year}>
              {row.vals.map(({ item, value }, j) => {
                if (value === 0) return null;
                const draw = mix ? (Math.max(0, value) / total) * 100 : value;
                const from = value >= 0 ? pos : neg;
                const to = value >= 0 ? pos + draw : neg + draw;
                if (value >= 0) pos = to; else neg = to;
                const y1 = y(Math.max(from, to));
                const y2 = y(Math.min(from, to));
                return <rect key={item.id || item.name_en} x={cx - bw / 2} y={y1} width={bw} height={Math.max(1, y2 - y1)} fill={SEGMENT_COLORS[j % SEGMENT_COLORS.length]} rx="2" />;
              })}
              <text x={cx} y={CHART_H - PAD.b + 18} className="axis-label" textAnchor="middle">{row.year}</text>
            </g>
          );
        })}
      </svg>
      <SegmentLegend items={items} lang={lang} />
    </div>
  );
}

function SegmentLineChart({ set, metric, lang }) {
  const years = segmentYears(set);
  const items = segmentItemsWithMetric(set, metric);
  if (!years.length || !items.length) return <p className="muted">{t('segment_not_disclosed', lang)}</p>;
  const innerW = CHART_W - PAD.l - PAD.r, innerH = CHART_H - PAD.t - PAD.b;
  const vals = items.flatMap(item => years.map(year => segmentValue(item, year, metric))).filter(v => v != null && isFinite(v));
  const max = niceMax(Math.max(...vals, 10));
  const min = Math.min(0, ...vals);
  const x = (i) => PAD.l + (years.length === 1 ? innerW / 2 : (innerW * i) / (years.length - 1));
  const y = (v) => PAD.t + innerH - ((v - min) / (max - min || 1)) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => min + f * (max - min));

  return (
    <div className="chart-wrap segment-chart-wrap">
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="chart" role="img">
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={CHART_W - PAD.r} y1={y(tk)} y2={y(tk)} className="grid" />
            <text x={PAD.l - 8} y={y(tk) + 4} className="axis-label" textAnchor="end">{tk.toFixed(0)}%</text>
          </g>
        ))}
        {years.map((year, i) => <text key={year} x={x(i)} y={CHART_H - PAD.b + 18} className="axis-label" textAnchor="middle">{year}</text>)}
        {items.map((item, j) => {
          const points = years.map((year, i) => ({ x: x(i), y: y(segmentValue(item, year, metric)), v: segmentValue(item, year, metric) })).filter(p => p.v != null && isFinite(p.v));
          if (points.length < 2) return null;
          return (
            <g key={item.id || item.name_en}>
              <path d={points.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')} className="line" stroke={SEGMENT_COLORS[j % SEGMENT_COLORS.length]} fill="none" />
              {points.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="3" fill={SEGMENT_COLORS[j % SEGMENT_COLORS.length]} />)}
            </g>
          );
        })}
      </svg>
      <SegmentLegend items={items} lang={lang} />
    </div>
  );
}

function SegmentLegend({ items, lang }) {
  return (
    <div className="legend segment-legend">
      {items.map((item, i) => (
        <span key={item.id || item.name_en}><i className="sw" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} /> {segmentItemLabel(item, lang)}</span>
      ))}
    </div>
  );
}

function SegmentTable({ set, currency, lang }) {
  const years = segmentYears(set);
  const latest = years[years.length - 1];
  const items = set.items || [];
  const revenueTotal = items.reduce((s, item) => s + Math.max(0, segmentValue(item, latest, 'revenue') || 0), 0) || 1;
  return (
    <div className="table-wrap segment-table-wrap">
      <table className="data-table segment-table">
        <thead>
          <tr>
            <th>{t('segment_business', lang)}</th>
            <th>{latest || t('current', lang)} {t('m_revenue', lang)}</th>
            <th>{t('segment_share', lang)}</th>
            <th>{t('m_op_margin', lang)}</th>
            <th>{t('segment_cagr', lang)}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const revenue = segmentValue(item, latest, 'revenue');
            const opMargin = segmentValue(item, latest, 'operating_margin');
            const share = revenue != null ? (Math.max(0, revenue) / revenueTotal) * 100 : null;
            return (
              <tr key={item.id || item.name_en}>
                <td>{segmentItemLabel(item, lang)}</td>
                <td className="num">{fmtBig(revenue, currency)}</td>
                <td className="num">{fmtPct(share, 1)}</td>
                <td className="num">{fmtPct(opMargin, 1)}</td>
                <td className="num">{fmtPct(segmentCagr(item, 'revenue'), 1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function segmentSetLabel(set, lang) {
  return set[`label_${lang}`] || set.label_en || set.id || '';
}
function segmentItemLabel(item, lang) {
  return item[`name_${lang}`] || item.name_en || item.id || '';
}
function segmentYears(set) {
  const ys = new Set();
  (set.items || []).forEach(item => (item.annual || []).forEach(row => row.year != null && ys.add(row.year)));
  return Array.from(ys).sort((a, b) => a - b);
}
function segmentRow(item, year) {
  return (item.annual || []).find(row => row.year === year) || {};
}
function segmentValue(item, year, metric) {
  const row = segmentRow(item, year);
  if (metric === 'operating_margin') {
    return row.revenue ? (row.operating_income / row.revenue) * 100 : null;
  }
  if (metric === 'revenue_growth') {
    const rows = (item.annual || []).slice().sort((a, b) => a.year - b.year);
    const i = rows.findIndex(r => r.year === year);
    if (i <= 0 || !rows[i - 1].revenue) return null;
    return ((rows[i].revenue - rows[i - 1].revenue) / Math.abs(rows[i - 1].revenue)) * 100;
  }
  return row[metric] ?? null;
}
function segmentMetrics(set, lang) {
  const base = [
    ['revenue', 'm_revenue'],
    ['operating_income', 'm_op_income'],
    ['operating_margin', 'm_op_margin'],
    ['revenue_growth', 'm_revenue_growth'],
    ['assets', 'm_assets'],
    ['capex', 'm_capex'],
  ];
  const metrics = base
    .filter(([key]) => key === 'operating_margin'
      ? segmentHasMetric(set, 'revenue') && segmentHasMetric(set, 'operating_income')
      : key === 'revenue_growth'
        ? segmentHasGrowth(set)
        : segmentHasMetric(set, key))
    .map(([key, label]) => ({ key, label: t(label, lang) }));
  return metrics.length ? metrics : [{ key: 'revenue', label: t('m_revenue', lang) }];
}
function segmentHasMetric(set, metric) {
  return (set.items || []).some(item => (item.annual || []).some(row => row[metric] != null));
}
function segmentHasGrowth(set) {
  return (set.items || []).some(item => (item.annual || []).filter(row => row.revenue != null).length >= 2);
}
function segmentItemsWithMetric(set, metric) {
  return (set.items || []).filter(item => segmentYears(set).some(year => segmentValue(item, year, metric) != null));
}
function segmentCanMix(set, metric) {
  return segmentItemsWithMetric(set, metric).every(item => segmentYears(set).every(year => (segmentValue(item, year, metric) || 0) >= 0));
}
function segmentCagr(item, metric) {
  const rows = (item.annual || []).filter(r => r[metric] != null && r[metric] > 0).sort((a, b) => a.year - b.year);
  if (rows.length < 2) return null;
  const first = rows[0], last = rows[rows.length - 1];
  const years = last.year - first.year;
  if (years <= 0) return null;
  return (Math.pow(last[metric] / first[metric], 1 / years) - 1) * 100;
}

Object.assign(window, { RevenueProfitChart, MarginTrendChart, AnalystChart, SegmentAnalysisChart });
