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

function getNiceStepForBarChart(maxVal) {
  const target = maxVal * 1.15; // Ensure at least 15% headroom for bar top labels
  const targetStep = target / 3;
  if (targetStep <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(targetStep)));
  const normalized = targetStep / magnitude; // between 1.0 and 10.0
  
  let stepMultiplier;
  if (normalized <= 1.0) stepMultiplier = 1.0;
  else if (normalized <= 1.5) stepMultiplier = 1.5;
  else if (normalized <= 2.0) stepMultiplier = 2.0;
  else if (normalized <= 2.5) stepMultiplier = 2.5;
  else if (normalized <= 3.0) stepMultiplier = 3.0;
  else if (normalized <= 4.0) stepMultiplier = 4.0;
  else if (normalized <= 5.0) stepMultiplier = 5.0;
  else if (normalized <= 7.5) stepMultiplier = 7.5;
  else stepMultiplier = 10.0;
  
  return stepMultiplier * magnitude;
}

function getNiceBoundsForBarChart(minVal, maxVal) {
  if (minVal >= 0) {
    const step = getNiceStepForBarChart(Math.max(maxVal, 1));
    return { lo: 0, hi: step * 3 };
  }

  if (maxVal <= 0) {
    const step = getNiceStepForBarChart(Math.max(Math.abs(minVal), 1));
    return { lo: -step * 3, hi: 0 };
  }

  const maxAbs = Math.max(Math.abs(minVal), Math.abs(maxVal), 1);
  const step = getNiceStepForBarChart(maxAbs);
  return {
    lo: -Math.ceil(Math.abs(minVal) / step) * step,
    hi: Math.ceil(maxVal / step) * step,
  };
}

/* Revenue bars + profit line(s). series = [{kind:'bar'|'line', name, color, data[]}] */
function BarLineChart({ series, years, unit, fmt, height, unitSuffix, currency }) {
  const W = 680, H = height || 240;
  const padL = 6, padR = 6, padT = 32, padB = 26; // padT is 32 to give room for YoY growth labels
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const all = [];
  series.forEach((s) => s.data.forEach((v) => { if (v != null) all.push(v); }));
  if (!all.length) return null;

  const barSeries = series.filter((s) => s.kind === "bar");
  const lineSeries = series.filter((s) => s.kind === "line");

  let lo, hi;
  if (barSeries.length === 0 && lineSeries.length > 0) {
    // Pure line chart (like Net Margin), center it nicely
    const minVal = Math.min(...all), maxVal = Math.max(...all);
    const bounds = niceBounds(minVal, maxVal);
    lo = bounds.lo;
    hi = bounds.hi;
  } else {
    // Bar chart, anchor around zero while keeping negative bars inside the plot.
    const minVal = Math.min(...all);
    const maxVal = Math.max(...all);
    const bounds = getNiceBoundsForBarChart(minVal, maxVal);
    lo = bounds.lo;
    hi = bounds.hi;
  }

  const n = years.length;
  const x = (i) => padL + (i + 0.5) * (plotW / n);
  const y = (v) => padT + (hi - v) / (hi - lo) * plotH;
  
  const numBars = barSeries.length;
  const bw = (plotW / n) * 0.44 / Math.max(numBars, 1);
  const suffix = unitSuffix || "";
  const maxVal = Math.max(...all, 1);
  const decimals = maxVal >= 10 ? 0 : 2;

  // gridlines
  const ticks = [lo, lo + (hi - lo) / 3, lo + 2 * (hi - lo) / 3, hi];
  const zeroY = lo < 0 && hi > 0 ? y(0) : null;
  const clampY = (v, min, max) => Math.max(min, Math.min(max, v));

  return (
    <div className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" preserveAspectRatio="xMidYMid meet">
        {/* Gridlines */}
        {ticks.map((t, i) => {
          const isTop = i === ticks.length - 1;
          const cleanVal = Number(t.toFixed(4));
          const formattedVal = Number.isInteger(cleanVal) ? cleanVal.toString() : cleanVal.toFixed(1);
          const displayLabel = barSeries.length === 0 
            ? (isTop ? formattedVal + "%" : formattedVal)
            : formattedVal;
          return (
            <g key={i}>
              <line className="gridline" x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={Math.abs(t) < 1e-6 ? "0" : "3 4"} opacity={Math.abs(t) < 1e-6 ? 0.9 : 0.5} />
              <text className="axis-lab" x={W - padR} y={y(t) - 4} textAnchor="end" fill="var(--ink-3)">{displayLabel}</text>
            </g>
          );
        })}
        {barSeries.length > 0 && suffix && (
          <text 
            className="axis-lab" 
            x={W - padR} 
            y={y(lo) + 13} 
            textAnchor="end" 
            fill="var(--ink-3)" 
            fontSize="10.5" 
            fontWeight="700"
          >
            {currency ? `(${currency}${suffix})` : `(${suffix})`}
          </text>
        )}
        {zeroY != null && <line x1={padL} x2={W - padR} y1={zeroY} y2={zeroY} stroke="var(--ink-4)" strokeWidth="1.2" />}

        {/* Side-by-side Bars */}
        {barSeries.map((s, sIdx) =>
          s.data.map((v, i) => {
            if (v == null) return null;
            let xPos = x(i);
            if (numBars === 2) {
              xPos = x(i) + (sIdx === 0 ? -bw/2 - 2 : bw/2 + 2);
            }
            const y0 = zeroY != null ? zeroY : y(lo);
            const yv = y(v);
            const top = Math.min(y0, yv), hh = Math.abs(yv - y0);
            const labelY = v < 0
              ? clampY(yv + 14, padT + 11, H - padB - 3)
              : clampY(yv - 6, padT + 11, H - padB - 3);
            return (
              <g key={s.name + i}>
                <rect x={xPos - bw/2} y={top} width={bw} height={Math.max(hh, 1)} rx="3" fill={s.color} opacity="0.92" />
                {/* Bar top label */}
                <text x={xPos} y={labelY} textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="600">{v.toFixed(decimals)}</text>
              </g>
            );
          })
        )}

        {/* Connecting dashed YoY growth lines (for the first bar series, i.e. Revenue) */}
        {barSeries.length > 0 && (() => {
          const s0 = barSeries[0];
          return s0.data.map((v, i) => {
            if (i === 0) return null;
            const vPrev = s0.data[i - 1], vCur = v;
            if (vPrev == null || vCur == null || vPrev === 0) return null;
            const g = ((vCur - vPrev) / Math.abs(vPrev)) * 100;
            const yPrev = y(vPrev), yCur = y(vCur);
            let xPrev = x(i - 1), xCur = x(i);
            if (numBars === 2) {
              xPrev = x(i - 1) - bw/2 - 2;
              xCur = x(i) - bw/2 - 2;
            }
            const x1 = xPrev + bw/2 + 4, y1 = yPrev;
            const x2 = xCur - bw/2 - 4, y2 = yCur;
            const labelY = clampY((y1 + y2) / 2 - 8, padT + 11, H - padB - 3);
            return (
              <g key={'growth' + i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={g >= 0 ? "var(--bull)" : "var(--bear)"} strokeDasharray="3 3" strokeWidth="1.2" opacity="0.8" />
                <text x={(x1 + x2) / 2} y={labelY} textAnchor="middle" fill={g >= 0 ? "var(--bull)" : "var(--bear)"} fontSize="11" fontWeight="700">
                  {(g >= 0 ? "+" : "") + g.toFixed(1) + "%"}
                </text>
              </g>
            );
          });
        })()}

        {/* Lines */}
        {lineSeries.map((s) => {
          let d = "";
          s.data.forEach((v, i) => { if (v == null) return; d += (d ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1); });
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              {s.data.map((v, i) => (
                v == null ? null : (
                  <g key={i}>
                    <circle cx={x(i)} cy={y(v)} r="3.6" fill="var(--surface)" stroke={s.color} strokeWidth="2.2" />
                    {/* Line value label */}
                    <text x={x(i)} y={y(v) - 8} textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="600">{v.toFixed(1) + "%"}</text>
                  </g>
                )
              ))}
            </g>
          );
        })}

        {/* x labels */}
        {years.map((yr, i) => <text key={yr} className="axis-lab" x={x(i)} y={H - 8} textAnchor="middle" fill="var(--ink-2)" fontSize="11">{yr}</text>)}
      </svg>
      <ChartLegend series={series} />
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
              {s.data.map((v, i) => {
                if (v == null) return null;
                const prev = s.data[i - 1];
                const diff = prev != null ? v - prev : null;
                return (
                  <g key={i}>
                    <circle cx={x(i)} cy={y(v)} r="3" fill="var(--surface)" stroke={s.color} strokeWidth="2.2" />
                    {/* Line value label */}
                    <text x={x(i)} y={y(v) - 8} textAnchor="middle" fill="var(--ink)" fontSize="10.5" fontWeight="600">{v.toFixed(1) + "%"}</text>
                    {/* YoY change percentage points */}
                    {diff !== null && (
                      <text x={(x(i - 1) + x(i)) / 2} y={(y(prev) + y(v)) / 2 - 6} textAnchor="middle" fill={diff >= 0 ? "var(--bull)" : "var(--bear)"} fontSize="9.5" fontWeight="700">
                        {(diff >= 0 ? "+" : "") + diff.toFixed(1) + "%"}
                      </text>
                    )}
                  </g>
                );
              })}
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
