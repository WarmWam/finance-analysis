// validate-record.mjs — Comprehensive Pre-Flight Schema and Financial Math Validator
//
// Usage:   node .codex/skills/equity-research/scripts/validate-record.mjs <path-to-record.json>
//
// Validates:
//   1. Structural integrity against snapshot-shape.md and segment-shape.md
//   2. Character integrity (scans for double escaped \\n sequences causing UI bugs)
//   3. Financial Math Reconciliation (checks margins, EPS, and solvency bounds)
//   4. Segment Reconciliation (matches consolidated vs segment sums + unallocated)

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function log(label, message, type = 'info') {
  const colors = {
    error: '\x1b[31m[ERROR]\x1b[0m',
    warning: '\x1b[33m[WARNING]\x1b[0m',
    success: '\x1b[32m[SUCCESS]\x1b[0m',
    info: '\x1b[36m[INFO]\x1b[0m',
  };
  console.log(`${colors[type] || ''} ${label}: ${message}`);
}

function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node .codex/skills/equity-research/scripts/validate-record.mjs <path-to-record.json>');
    process.exit(1);
  }

  const filePath = resolve(fileArg);
  if (!existsSync(filePath)) {
    log('File Path', `File not found at ${filePath}`, 'error');
    process.exit(1);
  }

  let record;
  try {
    record = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (e) {
    log('JSON Parse', `Invalid JSON file: ${e.message}`, 'error');
    process.exit(1);
  }

  let errorsCount = 0;
  let warningsCount = 0;

  function assert(condition, label, message, severity = 'error') {
    if (!condition) {
      log(label, message, severity);
      if (severity === 'error') errorsCount++;
      else warningsCount++;
      return false;
    }
    return true;
  }

  log('Initialization', `Starting pre-flight audit for: ${record.ticker || 'UNKNOWN'}`, 'info');

  // ==========================================
  // 1. TOP LEVEL SCHEMA CHECKS
  // ==========================================
  assert(record.ticker && typeof record.ticker === 'string', 'Schema: ticker', 'Ticker must be a valid non-empty string');
  assert(record.name && typeof record.name === 'string', 'Schema: name', 'English name must be a valid string');
  assert(record.name_th && typeof record.name_th === 'string', 'Schema: name_th', 'Thai name must be a valid string');
  assert(['NASDAQ', 'NYSE', 'KOSPI', 'TSE', 'HKEX', 'SSE', 'SZSE', 'SET'].includes(record.exchange), 'Schema: exchange', `Exchange "${record.exchange}" is uncommon or empty`, 'warning');
  assert(record.country && record.country.length === 2, 'Schema: country', 'Country code must be a 2-character ISO code (e.g., US, KR)');
  assert(record.analysis_date && /^\d{4}-\d{2}-\d{2}$/.test(record.analysis_date), 'Schema: analysis_date', 'Date must match YYYY-MM-DD');
  assert(['bull', 'neutral', 'bear'].includes(record.rating), 'Schema: rating', 'Rating must be "bull", "neutral", or "bear"');

  // NEW logo, sector, country and verdict validations
  assert(record.logo_url === undefined || record.logo_url === null || record.logo_url === '' || (typeof record.logo_url === 'string' && record.logo_url.startsWith('http')), 'Schema: logo_url', 'logo_url must be an http(s) image URL when provided');
  assert(record.logo_text && typeof record.logo_text === 'string' && record.logo_text.length >= 1 && record.logo_text.length <= 4, 'Schema: logo_text', 'logo_text must be a string of 1-4 characters');
  assert(record.logo_color && typeof record.logo_color === 'string' && /^#[0-9a-fA-F]{3,6}$/.test(record.logo_color), 'Schema: logo_color', 'logo_color must be a valid hex color starting with #');
  assert(record.country_name_th && typeof record.country_name_th === 'string', 'Schema: country_name_th', 'country_name_th is required and must be a string');
  assert(record.sector_th && typeof record.sector_th === 'string', 'Schema: sector_th', 'sector_th is required and must be a string');
  assert(record.sector_en && typeof record.sector_en === 'string', 'Schema: sector_en', 'sector_en is required and must be a string');

  if (assert(record.verdict && typeof record.verdict === 'object', 'Schema: verdict', 'verdict object is required')) {
    ['interesting', 'margin', 'mainBiz', 'valuation'].forEach(key => {
      const vCard = record.verdict[key];
      if (assert(vCard && typeof vCard === 'object', `Verdict: ${key}`, `verdict.${key} card is required`)) {
        assert(['up', 'down', 'neutral'].includes(vCard.tone), `Verdict: ${key}.tone`, `verdict.${key}.tone must be "up", "down", or "neutral"`);
        assert(vCard.label_th && typeof vCard.label_th === 'string', `Verdict: ${key}.label_th`, `verdict.${key}.label_th is required`);
        assert(vCard.label_en && typeof vCard.label_en === 'string', `Verdict: ${key}.label_en`, `verdict.${key}.label_en is required`);
      }
    });
  }

  assert(record.summary_en && record.summary_en.length > 10, 'Schema: summary_en', 'English summary is missing or too short');
  assert(record.summary_th && record.summary_th.length > 10, 'Schema: summary_th', 'Thai summary is missing or too short');

  // Narrative validation
  assert(record.body_en && record.body_en.includes('##'), 'Narrative: body_en', 'English narrative body must contain markdown headings (##)');
  assert(record.body_th && record.body_th.includes('##'), 'Narrative: body_th', 'Thai narrative body must contain markdown headings (##)');

  // Catalysts and risks arrays
  if (assert(Array.isArray(record.catalysts) && record.catalysts.length >= 2, 'Schema: catalysts', 'Catalysts must be an array with at least 2 items')) {
    record.catalysts.forEach((c, idx) => {
      assert(c.en && typeof c.en === 'string', `Catalysts[${idx}].en`, 'Catalyst English item must be a non-empty string');
      assert(c.th && typeof c.th === 'string', `Catalysts[${idx}].th`, 'Catalyst Thai item must be a non-empty string');
    });
  }

  if (assert(Array.isArray(record.risks) && record.risks.length >= 2, 'Schema: risks', 'Risks must be an array with at least 2 items')) {
    record.risks.forEach((r, idx) => {
      assert(r.en && typeof r.en === 'string', `Risks[${idx}].en`, 'Risk English item must be a non-empty string');
      assert(r.th && typeof r.th === 'string', `Risks[${idx}].th`, 'Risk Thai item must be a non-empty string');
    });
  }

  // ==========================================
  // 2. CHARACTER INTEGRITY (DOUBLE-ESCAPE AUDIT)
  // ==========================================
  // We scan the raw text content of the file for the literal characters "\\" followed by "n".
  // Note: JSON.parse automatically parses "\n" (which is saved as `\n` or `\\n` in raw text) correctly.
  // But if the file was written with literal double escape `\\n` in Javascript, it is stored as `\\\\n`
  // which parses into Javascript as `\n` text instead of a real newline!
  const rawFileText = readFileSync(filePath, 'utf8');
  
  // Look for double-escaped newlines in JSON strings: "body_en": "...\\n..."
  // If we find \\\\n in the raw file, that means a double escape was parsed by JSON as literal '\n'
  const doubleEscapeRegex = /\\\\n/g;
  const matches = rawFileText.match(doubleEscapeRegex);
  assert(!matches, 'Character Integrity', `Detected ${matches ? matches.length : 0} occurrences of literal double-escaped newlines (\\\\n) in the file. These will render as literal '\\n' text on the UI. Make sure to replace them with standard single-escaped newlines.`, 'error');

  // ==========================================
  // 3. CONSOLIDATED FINANCIALS MATH CHECKS
  // ==========================================
  const snap = record.data_snapshot;
  if (assert(snap, 'Schema: data_snapshot', 'Missing "data_snapshot" object')) {
    // Quote check
    if (assert(snap.quote, 'Snapshot: quote', 'Missing "quote" object')) {
      assert(typeof snap.quote.price === 'number', 'Quote: price', 'Price must be a number');
      assert(typeof snap.quote.change_pct === 'number', 'Quote: change_pct', 'Change percent must be a number');
      assert(typeof snap.quote.market_cap === 'number' && snap.quote.market_cap > 0, 'Quote: market_cap', 'Market cap must be a raw positive integer');
      assert(['$', '₩', '¥', 'HK$', 'NT$', '฿'].includes(snap.quote.currency), 'Quote: currency', `Uncommon currency symbol "${snap.quote.currency}"`, 'warning');
    }

    // Valuation check
    if (assert(snap.valuation, 'Snapshot: valuation', 'Missing "valuation" object')) {
      const v = snap.valuation;
      assert(v.pe === null || typeof v.pe === 'number', 'Valuation: pe', 'P/E must be a number or null');
      assert(v.forward_pe === null || typeof v.forward_pe === 'number', 'Valuation: forward_pe', 'Forward P/E must be a number or null');
      assert(v.ps === null || typeof v.ps === 'number', 'Valuation: ps', 'P/S must be a number or null');
      assert(v.pb === null || typeof v.pb === 'number', 'Valuation: pb', 'P/B must be a number or null');
      assert(v.ev_ebitda === null || typeof v.ev_ebitda === 'number', 'Valuation: ev_ebitda', 'EV/EBITDA must be a number or null');
      assert(v.peg === null || typeof v.peg === 'number', 'Valuation: peg', 'PEG must be a number or null');

      // NEW range checks
      const metrics = ['pe', 'forward_pe', 'ps', 'pb', 'ev_ebitda', 'peg'];
      metrics.forEach(m => {
        const low = v[m + '_low'];
        const high = v[m + '_high'];
        const peer = v[m + '_peer'];
        assert(low === undefined || low === null || typeof low === 'number', `Valuation: ${m}_low`, `${m}_low must be a number or null`);
        assert(high === undefined || high === null || typeof high === 'number', `Valuation: ${m}_high`, `${m}_high must be a number or null`);
        assert(peer === undefined || peer === null || typeof peer === 'number', `Valuation: ${m}_peer`, `${m}_peer must be a number or null`);
        if (typeof low === 'number' && typeof high === 'number') {
          assert(low <= high, `Valuation: ${m}_range`, `${m}_low (${low}) must be less than or equal to ${m}_high (${high})`);
        }
      });
    }

    // Annual figures math check
    if (assert(Array.isArray(snap.annual) && snap.annual.length >= 3, 'Snapshot: annual', 'Annual financials must be an array of at least 3 years')) {
      let prevYear = 0;
      snap.annual.forEach((ann, idx) => {
        assert(ann.year > prevYear, `Annual[${idx}].year`, 'Years must be in strictly ascending order');
        prevYear = ann.year;

        // Verify metrics are raw numbers
        assert(typeof ann.revenue === 'number', `Annual[${ann.year}].revenue`, 'Revenue must be a raw number');
        assert(typeof ann.gross_profit === 'number', `Annual[${ann.year}].gross_profit`, 'Gross Profit must be a raw number');
        assert(ann.operating_income === null || typeof ann.operating_income === 'number', `Annual[${ann.year}].operating_income`, 'Operating Income must be a number or null');
        assert(ann.net_income === null || typeof ann.net_income === 'number', `Annual[${ann.year}].net_income`, 'Net Income must be a number or null');
        assert(ann.eps === null || typeof ann.eps === 'number', `Annual[${ann.year}].eps`, 'EPS must be a number or null');
        assert(ann.fcf === null || typeof ann.fcf === 'number', `Annual[${ann.year}].fcf`, 'FCF must be a number or null');

        // Math relationships
        if (ann.operating_income !== null && ann.revenue > 0) {
          assert(Math.abs(ann.operating_income) <= ann.revenue * 1.5, `Annual[${ann.year}].operating_income`, 'Operating Income magnitude is unsustainably large compared to revenue', 'warning');
        }
        if (ann.net_income !== null && ann.revenue > 0) {
          assert(ann.net_income <= ann.revenue, `Annual[${ann.year}].net_income`, 'Net Income cannot exceed revenue under standard accounting rules');
        }
      });
    }

    // Balance sheet checks
    if (assert(snap.balance, 'Snapshot: balance', 'Missing "balance" object')) {
      const b = snap.balance;
      assert(typeof b.cash === 'number', 'Balance: cash', 'Cash must be a raw integer');
      assert(typeof b.total_debt === 'number', 'Balance: total_debt', 'Total debt must be a raw integer');
      assert(b.de_ratio === null || typeof b.de_ratio === 'number', 'Balance: de_ratio', 'Debt/Equity must be a number or null');
      assert(b.current_ratio === null || typeof b.current_ratio === 'number', 'Balance: current_ratio', 'Current ratio must be a number or null');
      assert(b.interest_coverage === null || typeof b.interest_coverage === 'number', 'Balance: interest_coverage', 'Interest coverage must be a number or null');
      assert(b.health_score === undefined || b.health_score === null || (typeof b.health_score === 'number' && b.health_score >= 0 && b.health_score <= 100), 'Balance: health_score', 'health_score must be a number between 0 and 100');
    }

    // Analyst Consensus checks
    if (assert(snap.analyst, 'Snapshot: analyst', 'Missing "analyst" object')) {
      const a = snap.analyst;
      assert(typeof a.strong_buy === 'number', 'Analyst: strong_buy', 'Strong Buy count must be a number');
      assert(typeof a.buy === 'number', 'Analyst: buy', 'Buy count must be a number');
      assert(typeof a.hold === 'number', 'Analyst: hold', 'Hold count must be a number');
      assert(typeof a.sell === 'number', 'Analyst: sell', 'Sell count must be a number');
      assert(a.strong_sell === undefined || a.strong_sell === null || typeof a.strong_sell === 'number', 'Analyst: strong_sell', 'Strong Sell count must be a number');
      assert(a.target_avg === null || typeof a.target_avg === 'number', 'Analyst: target_avg', 'Average price target must be a number or null');
      if (a.target_low && a.target_high) {
        assert(a.target_low <= a.target_high, 'Analyst: target bounds', 'Target low must be less than or equal to target high');
      }
    }

    // Peer checks
    if (assert(Array.isArray(snap.peers), 'Snapshot: peers', 'Peers must be a valid array')) {
      snap.peers.forEach((p, idx) => {
        assert(p.ticker && typeof p.ticker === 'string', `Peers[${idx}].ticker`, 'Peer ticker must be a non-empty string');
        assert(p.pe === null || typeof p.pe === 'number', `Peers[${idx}].pe`, 'Peer P/E must be a number or null');
      });
    }

    // Filing checks
    if (assert(snap.filing, 'Snapshot: filing', 'Missing "filing" object')) {
      const f = snap.filing;
      assert(f.type && typeof f.type === 'string', 'Filing: type', 'Filing type is required (e.g. 10-K, 10-Q)');
      assert(f.date && /^\d{4}-\d{2}-\d{2}$/.test(f.date), 'Filing: date', 'Filing date must match YYYY-MM-DD');
      assert(f.url && f.url.startsWith('http'), 'Filing: url', 'Filing URL must be a valid web link');
      assert(f.highlight_en && f.highlight_en.length > 5, 'Filing: highlight_en', 'English filing highlight is missing or too short');
      assert(f.highlight_th && f.highlight_th.length > 5, 'Filing: highlight_th', 'Thai filing highlight is missing or too short');
    }

    // Optional daily price history for candlestick chart.
    if (snap.price_history !== undefined && snap.price_history !== null) {
      const ph = snap.price_history;
      assert(ph.source && typeof ph.source === 'string', 'Price history: source', 'source is required');
      assert(ph.source_url === undefined || ph.source_url === null || (typeof ph.source_url === 'string' && ph.source_url.startsWith('http')), 'Price history: source_url', 'source_url must be a URL when present');
      assert(ph.symbol && typeof ph.symbol === 'string', 'Price history: symbol', 'symbol is required');
      assert(ph.interval === '1d', 'Price history: interval', 'interval should be 1d for daily candles', 'warning');
      assert(ph.range === '1y', 'Price history: range', 'range should be 1y', 'warning');
      assert(Array.isArray(ph.candles), 'Price history: candles', 'candles must be an array');
      if (Array.isArray(ph.candles)) {
        assert(ph.candles.length >= 20, 'Price history: candle count', 'At least 20 valid candles are required');
        if (ph.candles.length < 180) {
          log('Price history', `Only ${ph.candles.length} candles found; acceptable for new listings but short for a 1Y chart`, 'warning');
        }
        let prevDate = '';
        ph.candles.forEach((c, idx) => {
          const label = `Price history[${idx}]`;
          assert(c.date && /^\d{4}-\d{2}-\d{2}$/.test(c.date), `${label}.date`, 'date must match YYYY-MM-DD');
          if (c.date && prevDate) assert(c.date > prevDate, `${label}.date_order`, 'candles must be strictly ascending by date');
          prevDate = c.date || prevDate;
          ['open', 'high', 'low', 'close'].forEach(k => {
            assert(typeof c[k] === 'number' && Number.isFinite(c[k]), `${label}.${k}`, `${k} must be a finite number`);
          });
          assert(c.volume === null || c.volume === undefined || (typeof c.volume === 'number' && c.volume >= 0), `${label}.volume`, 'volume must be a non-negative number or null');
          if (typeof c.open === 'number' && typeof c.high === 'number' && typeof c.low === 'number' && typeof c.close === 'number') {
            assert(c.high >= Math.max(c.open, c.close, c.low), `${label}.high`, 'high must be >= open, close, and low');
            assert(c.low <= Math.min(c.open, c.close, c.high), `${label}.low`, 'low must be <= open, close, and high');
          }
        });
      }
    }

    // ==========================================
    // 4. SEGMENT RECONCILIATION MATH CHECKS
    // ==========================================
    if (snap.segments) {
      log('Segments Audit', 'Initiating multi-business segment reconciliation...', 'info');
      const seg = snap.segments;
      assert(seg.source_standard && typeof seg.source_standard === 'string', 'Segments: source_standard', 'Segment disclosure standard (e.g., ASC 280, IFRS 8) is required');
      assert(Array.isArray(seg.fiscal_years) && seg.fiscal_years.length > 0, 'Segments: fiscal_years', 'Segments must define fiscal years');
      assert(['single_segment', 'product_service', 'reportable_segments', 'geography', 'channel_customer', 'platform_marketplace', 'financial_services', 'asset_commodity_regulated', 'holding_conglomerate'].includes(seg.archetype), 'Segments: archetype', `Segment archetype "${seg.archetype}" is invalid`);
      assert(['A', 'B', 'C', 'D'].includes(seg.disclosure_quality), 'Segments: disclosure_quality', 'Disclosure quality must be A, B, C, or D');

      if (assert(Array.isArray(seg.sets) && seg.sets.length > 0, 'Segments: sets', 'Segments must contain at least one metrics set')) {
        seg.sets.forEach((set, setIdx) => {
          const setLabel = set.id || `Set[${setIdx}]`;
          assert(set.id && typeof set.id === 'string', `Segments.sets[${setIdx}].id`, 'Segment set must have a valid ID string');
          assert(set.label_en && typeof set.label_en === 'string', `${setLabel}: label_en`, 'Segment set label_en must be a string');
          assert(set.label_th && typeof set.label_th === 'string', `${setLabel}: label_th`, 'Segment set label_th must be a string');
          assert(Array.isArray(set.metrics) && set.metrics.length > 0, `${setLabel}: metrics`, 'Metrics array is empty');

          const hasRevenue = set.metrics.includes('revenue');
          const hasOperatingIncome = set.metrics.includes('operating_income');

          // Validate items
          if (assert(Array.isArray(set.items) && set.items.length > 0, `${setLabel}: items`, 'Items array is empty')) {
            set.items.forEach((item, itemIdx) => {
              const itemLabel = `${setLabel}.items[${item.id || itemIdx}]`;
              assert(item.id && typeof item.id === 'string', `${itemLabel}.id`, 'Item must have a valid ID string');
              assert(item.name_en && typeof item.name_en === 'string', `${itemLabel}: name_en`, 'Item name_en must be a string');
              assert(item.name_th && typeof item.name_th === 'string', `${itemLabel}: name_th`, 'Item name_th must be a string');
              
              if (assert(Array.isArray(item.annual), `${itemLabel}: annual`, 'Annual data is missing or not an array')) {
                item.annual.forEach((ann, annIdx) => {
                  assert(seg.fiscal_years.includes(ann.year), `${itemLabel}.annual[${annIdx}].year`, `Year ${ann.year} is not listed in top-level fiscal_years`);
                  if (hasRevenue) {
                    assert(ann.revenue === null || typeof ann.revenue === 'number', `${itemLabel}.annual[${ann.year}].revenue`, 'Revenue must be a raw number or null');
                  }
                  if (hasOperatingIncome) {
                    assert(ann.operating_income === null || typeof ann.operating_income === 'number', `${itemLabel}.annual[${ann.year}].operating_income`, 'Operating Income must be a number or null');
                  }
                });
              }
            });
          }

          // Validate reconciliation
          if (assert(Array.isArray(set.reconciliation) && set.reconciliation.length > 0, `${setLabel}: reconciliation`, 'Reconciliation data is missing or empty')) {
            set.reconciliation.forEach((recon, idx) => {
              const yearLabel = `${setLabel}.reconciliation[${recon.year}]`;
              assert(seg.fiscal_years.includes(recon.year), `${yearLabel}`, `Year ${recon.year} is not listed in top-level fiscal_years`);
              
              // Find consolidated values from top-level annual array
              const consolidatedYearData = snap.annual.find(a => a.year === recon.year);
              if (consolidatedYearData) {
                if (hasRevenue && recon.consolidated_revenue !== null) {
                  assert(recon.consolidated_revenue === consolidatedYearData.revenue, `${yearLabel}: consolidated_revenue`, `Reconciliation consolidated revenue (${recon.consolidated_revenue}) does not match annual consolidated revenue (${consolidatedYearData.revenue})`);
                }
                if (hasOperatingIncome && recon.consolidated_operating_income !== null && consolidatedYearData.operating_income !== null) {
                  assert(recon.consolidated_operating_income === consolidatedYearData.operating_income, `${yearLabel}: consolidated_operating_income`, `Reconciliation consolidated operating income (${recon.consolidated_operating_income}) does not match annual consolidated operating income (${consolidatedYearData.operating_income})`);
                }
              }

              // Mathematical check for Segment Sums + Unallocated + Eliminations = Consolidated
              if (hasRevenue) {
                let segmentSum = 0;
                let hasNull = false;
                set.items.forEach(item => {
                  const ann = item.annual.find(a => a.year === recon.year);
                  if (ann) {
                    if (ann.revenue === null) hasNull = true;
                    else segmentSum += ann.revenue;
                  }
                });

                if (!hasNull) {
                  assert(recon.segment_revenue_total === segmentSum, `${yearLabel}: segment_revenue_total`, `Reconciliation segment total (${recon.segment_revenue_total}) does not match sum of individual segment items (${segmentSum})`);
                  
                  // Smart fallback: If only general "unallocated" is present and is negative, it represents corporate operating expenses, so we assume unallocated revenue is 0 or unallocated_revenue.
                  const unallocatedRev = typeof recon.unallocated_revenue === 'number' 
                    ? recon.unallocated_revenue 
                    : (recon.unallocated > 0 ? recon.unallocated : 0);
                  const elimRev = typeof recon.eliminations_revenue === 'number'
                    ? recon.eliminations_revenue
                    : (recon.eliminations || 0);

                  const computedConsolidated = recon.segment_revenue_total + elimRev + unallocatedRev;
                  const diff = Math.abs(computedConsolidated - recon.consolidated_revenue);
                  const threshold = recon.consolidated_revenue * 0.03; // Allow up to 3% rounding / corporate item tolerance
                  
                  assert(diff <= threshold, `${yearLabel}: revenue math`, `Revenue sum mismatch! Segment Total (${recon.segment_revenue_total}) + Eliminations (${elimRev}) + Unallocated Revenue (${unallocatedRev}) = ${computedConsolidated}, which differs from Consolidated (${recon.consolidated_revenue}) by ${diff}`);
                  if (diff > 0 && diff <= threshold) {
                    log(`${yearLabel}: revenue math`, `Minor segment revenue reconciliation variance of ${diff} (within 3% threshold). Passed.`, 'warning');
                  }
                }
              }

              if (hasOperatingIncome) {
                let segmentSum = 0;
                let hasNull = false;
                set.items.forEach(item => {
                  const ann = item.annual.find(a => a.year === recon.year);
                  if (ann) {
                    if (ann.operating_income === null) hasNull = true;
                    else segmentSum += ann.operating_income;
                  }
                });

                if (!hasNull) {
                  assert(recon.segment_operating_income_total === segmentSum, `${yearLabel}: segment_operating_income_total`, `Reconciliation segment operating income total (${recon.segment_operating_income_total}) does not match sum of individual segment operating income items (${segmentSum})`);
                  
                  const unallocatedOp = typeof recon.unallocated_operating === 'number' 
                    ? recon.unallocated_operating 
                    : (recon.unallocated || 0);
                  const elimOp = typeof recon.eliminations_operating === 'number'
                    ? recon.eliminations_operating
                    : (recon.eliminations || 0);

                  const computedConsolidated = recon.segment_operating_income_total + elimOp + unallocatedOp;
                  const diff = Math.abs(computedConsolidated - recon.consolidated_operating_income);
                  const threshold = Math.abs(recon.consolidated_operating_income) * 0.03; // Allow up to 3% rounding / corporate item tolerance
                  
                  assert(diff <= threshold, `${yearLabel}: operating_income math`, `Operating Income sum mismatch! Segment Total (${recon.segment_operating_income_total}) + Eliminations (${elimOp}) + Unallocated Operating (${unallocatedOp}) = ${computedConsolidated}, which differs from Consolidated (${recon.consolidated_operating_income}) by ${diff}`);
                  if (diff > 0 && diff <= threshold) {
                    log(`${yearLabel}: operating_income math`, `Minor segment operating income reconciliation variance of ${diff} (within 3% threshold). Passed.`, 'warning');
                  }
                }
              }
            });
          }
        });
      }
    } else {
      log('Segments Audit', 'No segments object found. Skipping segment reconciliation (Clean single-segment business).', 'info');
    }
  }

  // ==========================================
  // FINAL REPORT
  // ==========================================
  console.log('\n-----------------------------------------------');
  log('Audit Completed', `Errors found: ${errorsCount} | Warnings found: ${warningsCount}`, errorsCount > 0 ? 'error' : warningsCount > 0 ? 'warning' : 'success');

  if (errorsCount > 0) {
    log('Conclusion', 'Validation FAILED. Please fix all blocking errors prior to publication.', 'error');
    process.exit(1);
  } else {
    log('Conclusion', 'Validation PASSED. The record is 100% compliant and ready to publish!', 'success');
    process.exit(0);
  }
}

main();
