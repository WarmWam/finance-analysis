// Shared helpers: i18n, number formatting, a tiny markdown renderer, routing.
// --- i18n -------------------------------------------------------------------
function t(key, lang) {
  const activeLang = lang || (document.documentElement && document.documentElement.lang) || 'th';
  const e = (window.STR || {})[key];
  if (!e) return key;
  return e[activeLang] || e.en || key;
}

// Pick a bilingual field from a record: pick(rec, 'summary', lang) -> summary_th|summary_en
function pick(rec, base, lang) {
  if (!rec) return '';
  return rec[`${base}_${lang}`] || rec[`${base}_en`] || rec[`${base}_th`] || '';
}

// --- number formatting ------------------------------------------------------
// Compact money: 2_190_000_000_000 -> "$2.19T". currency symbol configurable.
function fmtBig(n, cur = '$') {
  if (n == null || isNaN(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${cur}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${sign}${cur}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6)  return `${sign}${cur}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3)  return `${sign}${cur}${(abs / 1e3).toFixed(1)}K`;
  return `${sign}${cur}${abs.toFixed(0)}`;
}
function fmtPct(n, digits = 1) {
  if (n == null || isNaN(n)) return '—';
  return `${n.toFixed(digits)}%`;
}
function fmtNum(n, digits = 1) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: digits });
}
function fmtX(n, digits = 1) {
  if (n == null || isNaN(n)) return '—';
  return `${n.toFixed(digits)}x`;
}
function fmtSignedPct(n) {
  if (n == null || isNaN(n)) return '—';
  const s = n >= 0 ? '▲ +' : '▼ ';
  return `${s}${n.toFixed(2)}%`;
}
function fmtDate(d, lang) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00') : d;
  return date.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric' });
}

// --- tiny markdown ----------------------------------------------------------
// Supports: ## headings, **bold**, *italic*, - bullets, paragraphs. Enough for
// pasted "Our Take" content; intentionally minimal and dependency-free.
function mdToHtml(src) {
  if (!src) return '';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s) => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  let html = '', list = false;
  const closeList = () => { if (list) { html += '</ul>'; list = false; } };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { closeList(); continue; }
    if (/^###\s/.test(line)) { closeList(); html += `<h4>${inline(line.slice(4))}</h4>`; }
    else if (/^##\s/.test(line)) { closeList(); html += `<h3>${inline(line.slice(3))}</h3>`; }
    else if (/^[-*]\s/.test(line)) { if (!list) { html += '<ul>'; list = true; } html += `<li>${inline(line.slice(2))}</li>`; }
    else { closeList(); html += `<p>${inline(line)}</p>`; }
  }
  closeList();
  return html;
}

function MD({ src }) {
  return React.createElement('div', { className: 'md', dangerouslySetInnerHTML: { __html: mdToHtml(src) } });
}

// --- routing (History API) --------------------------------------------------
// Routes: "/" (home), "/company/:slug", "/admin"
function parseRoute(pathname) {
  const p = (pathname || '/').replace(/\/+$/, '') || '/';
  if (p === '/' || p === '') return { name: 'home' };
  if (p === '/admin') return { name: 'admin' };
  const m = p.match(/^\/company\/(.+)$/);
  if (m) return { name: 'company', slug: decodeURIComponent(m[1]) };
  return { name: 'home' };
}
function navigate(to) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
function useRoute() {
  const { useState, useEffect } = React;
  const [route, setRoute] = useState(parseRoute(window.location.pathname));
  useEffect(() => {
    const on = () => setRoute(parseRoute(window.location.pathname));
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  return route;
}

// Derived YoY growth series from an annual array.
function yoyArray(arr, key) {
  return arr.map((row, i) => {
    if (i === 0) return null;
    const prev = arr[i - 1][key], cur = row[key];
    if (!prev || prev === 0) return null;
    return ((cur - prev) / Math.abs(prev)) * 100;
  });
}

// Expose to the global scope so the other IIFE-wrapped source files can use them.
Object.assign(window, {
  t, pick, fmtBig, fmtPct, fmtNum, fmtX, fmtSignedPct, fmtDate,
  mdToHtml, MD, parseRoute, navigate, useRoute, yoyArray,
});

