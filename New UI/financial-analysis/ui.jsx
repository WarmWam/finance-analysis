/* ui.jsx — icons, formatters, small shared components (exported to window) */

/* ---------- formatters ---------- */
function fmtN(n, dec) {
  if (n === null || n === undefined || Number.isNaN(n)) return null;
  const d = dec === undefined ? (Math.abs(n) >= 100 ? 0 : 1) : dec;
  return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function pct(n, dec) { const s = fmtN(n, dec === undefined ? 1 : dec); return s === null ? null : s + "%"; }
function yoy(cur, prev) {
  if (cur === null || prev === null || cur === undefined || prev === undefined) return null;
  if (prev === 0) return null;
  // when crossing zero the % is misleading — flag it
  if ((prev < 0) !== (cur < 0)) return { cross: true, dir: cur > prev ? "up" : "down" };
  return ((cur - prev) / Math.abs(prev)) * 100;
}

/* ---------- icons (simple geometric strokes) ---------- */
const I = (p) => React.createElement("svg", Object.assign({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className: "ic" }, p.svg), p.children);
const IconSearch = (p) => <I svg={p}><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3"></path></I>;
const IconChevron = (p) => <I svg={p}><path d="M9 6l6 6-6 6"></path></I>;
const IconBack = (p) => <I svg={p}><path d="M15 6l-6 6 6 6"></path></I>;
const IconArrowUp = (p) => <I svg={p}><path d="M12 19V5M6 11l6-6 6 6"></path></I>;
const IconArrowDown = (p) => <I svg={p}><path d="M12 5v14M6 13l6 6 6-6"></path></I>;
const IconArrowRight = (p) => <I svg={p}><path d="M5 12h14M13 6l6 6-6 6"></path></I>;
const IconCheck = (p) => <I svg={p}><path d="M5 12l5 5L20 6"></path></I>;
const IconX = (p) => <I svg={p}><path d="M6 6l12 12M18 6L6 18"></path></I>;
const IconBolt = (p) => <I svg={p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"></path></I>;
const IconAlert = (p) => <I svg={p}><path d="M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"></path></I>;
const IconDoc = (p) => <I svg={p}><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"></path><path d="M14 3v5h5M9 13h6M9 17h6"></path></I>;
const IconInfo = (p) => <I svg={p}><circle cx="12" cy="12" r="9"></circle><path d="M12 11v5M12 8h.01"></path></I>;
const IconGlobe = (p) => <I svg={p}><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z"></path></I>;
const IconEmpty = (p) => <I svg={p}><circle cx="11" cy="11" r="7"></circle><path d="M21 21l-4.3-4.3M8 11h6"></path></I>;
const IconErrorIc = (p) => <I svg={p}><circle cx="12" cy="12" r="9"></circle><path d="M15 9l-6 6M9 9l6 6"></path></I>;
const IconScale = (p) => <I svg={p}><path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7zM17 7l-3 7h6l-3-7z"></path></I>;

/* ---------- small components ---------- */
function Delta({ value, suffix, ppt }) {
  // value: number (%), or {cross:true,dir} object, or null
  if (value === null || value === undefined) return <span className="dash">—</span>;
  if (typeof value === "object" && value.cross) {
    const up = value.dir === "up";
    return (
      <span className={"delta " + (up ? "up" : "down")}>
        {up ? <IconArrowUp /> : <IconArrowDown />} พลิก{up ? "บวก" : "ลบ"}
      </span>
    );
  }
  const up = value > 0.05, down = value < -0.05;
  const cls = up ? "up" : down ? "down" : "flat";
  const sign = up ? "+" : "";
  return (
    <span className={"delta " + cls}>
      {up ? <IconArrowUp /> : down ? <IconArrowDown /> : null}
      {sign}{fmtN(value, 1)}{ppt ? " pt" : "%"}{suffix || ""}
    </span>
  );
}

function RatingPill({ rating, label, size }) {
  const map = { bull: { t: "Bullish", ic: <IconArrowUp /> }, bear: { t: "Bearish", ic: <IconArrowDown /> }, neutral: { t: "Neutral", ic: <IconArrowRight /> } };
  const m = map[rating] || map.neutral;
  return (
    <span className={"rating-pill " + rating} style={size === "lg" ? { fontSize: 14, padding: "7px 14px 7px 11px" } : null}>
      {m.ic}{label || m.t}
    </span>
  );
}

function DiscBadge({ grade }) {
  return <span className={"disc-badge disc-" + grade} title={"คุณภาพการเปิดเผยข้อมูล (disclosure) เกรด " + grade}>{grade}</span>;
}

function MonoLogo({ c, size }) {
  const s = size || 44;
  const txt = c.logoText || c.name[0];
  const small = txt.length > 1;
  return (
    <div className="mono-logo" style={{ width: s, height: s, background: c.logoColor, color: c.logoInk || "#fff", fontSize: small ? s * 0.3 : s * 0.46 }}>
      {txt}
    </div>
  );
}

function Missing({ text }) {
  return <span className="missing"><IconInfo style={{ width: 12, height: 12 }} />{text || "ไม่เปิดเผย"}</span>;
}

Object.assign(window, {
  fmtN, pct, yoy,
  IconSearch, IconChevron, IconBack, IconArrowUp, IconArrowDown, IconArrowRight,
  IconCheck, IconX, IconBolt, IconAlert, IconDoc, IconInfo, IconGlobe, IconEmpty, IconErrorIc, IconScale,
  Delta, RatingPill, DiscBadge, MonoLogo, Missing,
});
