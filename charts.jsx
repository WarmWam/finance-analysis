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
            <span className="t-current" style={{ left: `${pctRange(quote.price, analyst.target_low, analyst.target_high)}%` }}>
              {t('current_price', lang)}: <b>{currency}{fmtNum(quote.price, 2)}</b>
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

Object.assign(window, { RevenueProfitChart, MarginTrendChart, AnalystChart });
