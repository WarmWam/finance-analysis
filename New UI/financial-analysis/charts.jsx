/* charts.jsx — minimal responsive SVG charts (exported to window)
   Thin lines / slim bars, few colors, readable on mobile. */

function niceBounds(min, max) {
  if (min === max) { max = max + 1; min = min - 1; }
  const span = max - min;
  const pad = span * 0.12;
  let lo = min - pad, hi = max + pad;
  if (min >= 0) lo = 0;                 // anchor at 0 when all positive
  if (max <= 0) hi = 0;
  return { lo, hi };
}

/* tiny sparkline for cards: data[], up/down color auto from first→last */
function Sparkline({ data, w, h, color }) {
  const W = w || 64, H = h || 22;
  const vals = data.filter((v) => v !== null && v !== undefined);
  if (vals.length < 2) return <svg width={W} height={H} />;
  const min = Math.min(...vals), max = Math.max(...vals);
  const { lo, hi } = niceBounds(min, max);
  const n = data.length;
  const x = (i) => (i / (n - 1)) * (W - 2) + 1;
  const y = (v) => H - 2 - ((v - lo) / (hi - lo)) * (H - 4);
  let d = "";
  data.forEach((v, i) => { if (v == null) return; d += (d ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); });
  const col = color || (data[n - 1] >= data[0] ? "var(--up)" : "var(--down)");
  return (
    <svg width={W} height={H} className="spark">
      <path d={d} fill="none" stroke={col} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(n - 1)} cy={y(data[n - 1])} r="2.4" fill={col} />
    </svg>
  );
}

/* Revenue bars + profit line(s). series = [{kind:'bar'|'line', name, color, data[]}] */
function BarLineChart({ series, years, unit, fmt, height }) {
  const W = 680, H = height || 240;
  const padL = 6, padR = 6, padT = 20, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const all = [];
  series.forEach((s) => s.data.forEach((v) => { if (v != null) all.push(v); }));
  if (!all.length) return null;
  const { lo, hi } = niceBounds(Math.min(...all), Math.max(...all));
  const n = years.length;
  const x = (i) => padL + (i + 0.5) * (plotW / n);
  const y = (v) => padT + (hi - v) / (hi - lo) * plotH;
  const bw = (plotW / n) * 0.46;
  const f = fmt || ((v) => fmtN(v, 1));
  // gridlines (3)
  const ticks = [lo, lo + (hi - lo) / 2, hi];
  const zeroY = lo < 0 && hi > 0 ? y(0) : null;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" preserveAspectRatio="xMidYMid meet">
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="gridline" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} strokeDasharray={Math.abs(t) < 1e-6 ? "0" : "3 4"} opacity={Math.abs(t) < 1e-6 ? 0.9 : 0.5} />
            <text className="axis-lab" x={W - padR} y={y(t) - 3} textAnchor="end">{f(t)}</text>
          </g>
        ))}
        {zeroY != null && <line x1={padL} x2={W - padR} y1={zeroY} y2={zeroY} stroke="var(--ink-4)" strokeWidth="1.2" />}
        {/* bars */}
        {series.filter((s) => s.kind === "bar").map((s) =>
          s.data.map((v, i) => {
            if (v == null) return null;
            const y0 = zeroY != null ? zeroY : y(lo);
            const yv = y(v);
            const top = Math.min(y0, yv), hh = Math.abs(yv - y0);
            return <rect key={s.name + i} x={x(i) - bw / 2} y={top} width={bw} height={Math.max(hh, 1)} rx="3" fill={s.color} opacity="0.92" />;
          })
        )}
        {/* lines */}
        {series.filter((s) => s.kind === "line").map((s) => {
          let d = "";
          s.data.forEach((v, i) => { if (v == null) return; d += (d ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); });
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              {s.data.map((v, i) => v == null ? null : <circle key={i} cx={x(i)} cy={y(v)} r="3.2" fill="var(--surface)" stroke={s.color} strokeWidth="2.2" />)}
            </g>
          );
        })}
        {/* x labels */}
        {years.map((yr, i) => <text key={yr} className="axis-lab" x={x(i)} y={H - 8} textAnchor="middle">{yr}</text>)}
      </svg>
      <ChartLegend series={series} />
      {unit && <div className="foot">หน่วย: {unit}</div>}
    </div>
  );
}

/* multi-line chart (margins, growth). series=[{name,color,data[]}] in % */
function LineChart({ series, years, height, unit, suffix, floor }) {
  const W = 680, H = height || 220;
  const padL = 6, padR = 6, padT = 18, padB = 26;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const all = [];
  series.forEach((s) => s.data.forEach((v) => { if (v != null) all.push(v); }));
  if (!all.length) return null;
  let mn = Math.min(...all), mx = Math.max(...all);
  if (floor != null) mn = Math.max(mn, floor);
  const { lo, hi } = niceBounds(mn, mx);
  const n = years.length;
  const x = (i) => padL + (i / (n - 1)) * plotW;
  const y = (v) => padT + (hi - Math.max(v, lo)) / (hi - lo) * plotH;
  const ticks = [lo, lo + (hi - lo) / 2, hi];
  const zeroY = lo < 0 && hi > 0 ? padT + (hi - 0) / (hi - lo) * plotH : null;
  const sfx = suffix === undefined ? "%" : suffix;
  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" preserveAspectRatio="xMidYMid meet">
        {ticks.map((t, i) => (
          <g key={i}>
            <line className="gridline" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} strokeDasharray="3 4" opacity="0.5" />
            <text className="axis-lab" x={W - padR} y={y(t) - 3} textAnchor="end">{fmtN(t, t > 100 || t < -100 ? 0 : 1)}{sfx}</text>
          </g>
        ))}
        {zeroY != null && <line x1={padL} x2={W - padR} y1={zeroY} y2={zeroY} stroke="var(--ink-4)" strokeWidth="1.2" />}
        {series.map((s) => {
          let d = "";
          s.data.forEach((v, i) => { if (v == null) return; d += (d ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); });
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              {s.data.map((v, i) => v == null ? null : <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--surface)" stroke={s.color} strokeWidth="2.2" />)}
            </g>
          );
        })}
        {years.map((yr, i) => <text key={yr} className="axis-lab" x={x(i)} y={H - 8} textAnchor="middle">{yr}</text>)}
      </svg>
      <ChartLegend series={series} lines />
      {unit && <div className="foot">{unit}</div>}
    </div>
  );
}

function ChartLegend({ series, lines }) {
  return (
    <div className="chart-legend">
      {series.map((s) => (
        <span className="it" key={s.name}>
          <span className={lines || s.kind === "line" ? "ln" : "sq"} style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  );
}

Object.assign(window, { Sparkline, BarLineChart, LineChart, ChartLegend, niceBounds });
