// adapter.js — Transforms production database / mock data format to New UI components format

(function () {
  // Clearbit's free logo API was discontinued (logo.clearbit.com no longer
  // resolves), so drop those URLs and let MonoLogo render its letter tile.
  function cleanLogoUrl(url) {
    if (!url || /(^https?:)?\/\/logo\.clearbit\.com\//i.test(url)) return '';
    return url;
  }

  function getUnitAndFactor(revList, currency) {
    const vals = (revList || []).filter(v => v !== null && v !== undefined);
    if (vals.length === 0) return { factor: 1e9, unit: 'พันล้าน', unitEn: 'billion ' + currency };
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    if (avg >= 1e12) {
      return { factor: 1e12, unit: 'ล้านล้าน', unitEn: 'trillion ' + currency };
    } else if (avg >= 1e8) {
      return { factor: 1e9, unit: 'พันล้าน', unitEn: 'billion ' + currency };
    } else if (avg >= 1e5) {
      return { factor: 1e6, unit: 'ล้าน', unitEn: 'million ' + currency };
    } else {
      return { factor: 1, unit: '', unitEn: currency };
    }
  }

  function computeBalanceScore(bal) {
    if (!bal) return 50;
    if (bal.health_score !== undefined && bal.health_score !== null) return bal.health_score;
    let score = 100;
    const de = bal.de_ratio || 0;
    if (de > 1.5) score -= 15;
    if (de > 2.5) score -= 15;
    const cr = bal.current_ratio || 1.5;
    if (cr < 1.2) score -= 15;
    if (cr < 0.8) score -= 15;
    const ic = bal.interest_coverage || 5;
    if (ic < 3) score -= 10;
    if (ic < 1.5) score -= 10;
    const netDebt = (bal.total_debt || 0) - (bal.cash || 0);
    if (netDebt > 0) score -= 5;
    return Math.max(0, Math.min(100, score));
  }

  function getBalanceLabel(score, lang) {
    const { t } = window;
    if (score >= 85) return t('bal_very_strong', lang);
    if (score >= 70) return t('bal_strong', lang);
    if (score >= 50) return t('bal_neutral', lang);
    return t('bal_weak', lang);
  }

  function flattenSegments(apiSegments, factor, lang) {
    const { pick } = window;
    if (!apiSegments || !apiSegments.sets) return [];
    const colors = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)', 'var(--c5)', 'var(--c6)', 'var(--c7)', 'var(--c8)'];
    return apiSegments.sets.map((set, setIdx) => {
      return {
        id: set.id,
        label: pick(set, 'label', lang),
        labelEn: set.label_en || set.label_th,
        disclosure: apiSegments.disclosure_quality || 'A',
        note: pick(apiSegments, 'note', lang) || (set.notes && pick({note_th: set.notes[0], note_en: set.notes[0]}, 'note', lang)),
        segments: set.items.map((item, itemIdx) => {
          const rev = (item.annual || []).map(row => row.revenue === null || row.revenue === undefined ? null : row.revenue / factor);
          const opinc = (item.annual || []).map(row => row.operating_income === null || row.operating_income === undefined ? null : row.operating_income / factor);
          const assets = (item.annual || []).map(row => row.assets === null || row.assets === undefined ? null : row.assets / factor);
          const capex = (item.annual || []).map(row => row.capex === null || row.capex === undefined ? null : row.capex / factor);
          return {
            id: item.id || `seg-${itemIdx}`,
            name: pick(item, 'name', lang) || item.name_en || item.name_th,
            short: pick(item, 'name', lang) || item.name_en || item.name_th,
            color: colors[itemIdx % colors.length],
            rev: rev.every(v => v === null) ? null : rev,
            opinc: opinc.every(v => v === null) ? null : opinc,
            assets: assets.every(v => v === null) ? null : assets,
            capex: capex.every(v => v === null) ? null : capex
          };
        })
      };
    });
  }

  function adaptRecord(apiRecord, lang) {
    if (!apiRecord) return null;
    const { pick, t, fmtBig, fmtN, fmtDate } = window;
    const snap = apiRecord.data_snapshot || {};
    const quote = snap.quote || {};
    const ccy = quote.currency || '$';
    // UI labels follow `lang` (English); the written analysis stays Thai.
    const CL = 'th';
    
    // Auto-detect unit & factor based on revenues
    const rawRevenues = (snap.annual || []).map(r => r.revenue);
    const { factor, unit, unitEn } = getUnitAndFactor(rawRevenues, ccy);

    const years = (snap.annual || []).map(row => row.year);

    // Mapped financials
    const financials = {
      revenue: (snap.annual || []).map(row => row.revenue === null || row.revenue === undefined ? null : row.revenue / factor),
      grossProfit: (snap.annual || []).map(row => row.gross_profit === null || row.gross_profit === undefined ? null : row.gross_profit / factor),
      operatingIncome: (snap.annual || []).map(row => row.operating_income === null || row.operating_income === undefined ? null : row.operating_income / factor),
      netIncome: (snap.annual || []).map(row => row.net_income === null || row.net_income === undefined ? null : row.net_income / factor),
      eps: (snap.annual || []).map(row => row.eps),
      fcf: (snap.annual || []).map(row => row.fcf === null || row.fcf === undefined ? null : row.fcf / factor)
    };

    // Mapped margins
    const margins = {
      gross: (snap.annual || []).map(row => {
        if (row.gross_profit === null || row.revenue === null || row.revenue === 0) return null;
        return (row.gross_profit / row.revenue) * 100;
      }),
      operating: (snap.annual || []).map(row => {
        if (row.operating_income === null || row.revenue === null || row.revenue === 0) return null;
        return (row.operating_income / row.revenue) * 100;
      }),
      net: (snap.annual || []).map(row => {
        if (row.net_income === null || row.revenue === null || row.revenue === 0) return null;
        return (row.net_income / row.revenue) * 100;
      })
    };

    // Rating mapping
    const ratingLabels = {
      bull: lang === 'th' ? 'เชิงบวก / ซื้อ' : 'Bullish / Buy',
      bear: lang === 'th' ? 'เชิงลบ / ระวัง' : 'Bearish / Caution',
      neutral: lang === 'th' ? 'ถือ / เป็นกลาง' : 'Neutral / Hold'
    };

    // Verdict mapping
    const recordVerdict = apiRecord.verdict || snap.verdict;
    const verdict = recordVerdict ? {
      interesting: {
        label: pick(recordVerdict.interesting, 'label', CL),
        tone: recordVerdict.interesting.tone || 'neutral',
        detail: pick(recordVerdict.interesting, 'detail', CL)
      },
      margin: {
        label: pick(recordVerdict.margin, 'label', CL),
        tone: recordVerdict.margin.tone || 'neutral',
        detail: pick(recordVerdict.margin, 'detail', CL)
      },
      mainBiz: {
        label: pick(recordVerdict.mainBiz, 'label', CL),
        tone: recordVerdict.mainBiz.tone || 'neutral',
        detail: pick(recordVerdict.mainBiz, 'detail', CL)
      },
      valuation: {
        label: pick(recordVerdict.valuation, 'label', CL),
        tone: recordVerdict.valuation.tone || 'neutral',
        detail: pick(recordVerdict.valuation, 'detail', CL)
      }
    } : {
      interesting: { label: t('v_interesting_lbl', lang), tone: 'neutral', detail: t('v_interesting_det', lang) },
      margin: { label: t('v_margin_lbl', lang), tone: 'neutral', detail: t('v_margin_det', lang) },
      mainBiz: { label: t('v_mainBiz_lbl', lang), tone: 'neutral', detail: t('v_mainBiz_det', lang) },
      valuation: { label: t('v_valuation_lbl', lang), tone: 'neutral', detail: t('v_valuation_det', lang) }
    };

    // Valuation mapping
    const valMap = [
      { k: "P/E", en: "P/E", key: "pe", avgKey: "pe_avg5" },
      { k: "Forward P/E", en: "Forward P/E", key: "forward_pe", avgKey: "forward_pe_avg5" },
      { k: "P/S", en: "P/S", key: "ps", avgKey: "ps_avg5" },
      { k: "P/B", en: "P/B", key: "pb", avgKey: "pb_avg5" },
      { k: "EV/EBITDA", en: "EV/EBITDA", key: "ev_ebitda", avgKey: "ev_ebitda_avg5" },
      { k: "PEG", en: "PEG", key: "peg", avgKey: "peg_avg5" }
    ];
    const snapVal = snap.valuation || {};
    const valuation = valMap.map(item => {
      const now = snapVal[item.key];
      const avg5 = snapVal[item.avgKey] || snapVal[item.key + '_avg5'] || null;
      const low = snapVal[item.key + '_low'] || null;
      const high = snapVal[item.key + '_high'] || null;
      const peer = snapVal[item.key + '_peer'] || null;
      return {
        k: item.k,
        en: item.en,
        now: now === undefined ? null : now,
        avg5: avg5,
        low: low,
        high: high,
        peer: peer
      };
    });

    // Balance sheet mapping
    const bal = snap.balance || {};
    const balanceScore = computeBalanceScore(bal);
    const balanceLabel = getBalanceLabel(balanceScore, lang);
    const balanceItems = [
      { k: lang === 'th' ? "เงินสด" : "Cash & equivalents", en: "Cash", v: fmtBig(bal.cash, ccy), good: bal.cash > 0 },
      { k: lang === 'th' ? "หนี้สินรวม" : "Total debt", en: "Total debt", v: fmtBig(bal.total_debt, ccy), good: bal.total_debt < bal.cash },
      { k: lang === 'th' ? "หนี้สินต่อทุน" : "D/E ratio", en: "D/E", v: bal.de_ratio !== undefined && bal.de_ratio !== null ? fmtN(bal.de_ratio, 2) : '—', good: bal.de_ratio < 1.5 },
      { k: lang === 'th' ? "อัตราส่วนสภาพคล่อง" : "Current ratio", en: "Current ratio", v: bal.current_ratio ? `${fmtN(bal.current_ratio, 1)}x` : '—', good: bal.current_ratio > 1.2 },
      { k: lang === 'th' ? "ความสามารถจ่ายดอกเบี้ย" : "Interest coverage", en: "Interest coverage", v: bal.interest_coverage ? `${fmtN(bal.interest_coverage, 1)}x` : '—', good: bal.interest_coverage > 1.5 }
    ];

    // Analyst mapping
    const snapAna = snap.analyst || {};
    const priceNow = quote.price || 0;
    const analysts = {
      strongBuy: snapAna.strong_buy || 0,
      buy: snapAna.buy || 0,
      hold: snapAna.hold || 0,
      sell: snapAna.sell || 0,
      strongSell: snapAna.strong_sell || 0,
      targetLow: fmtN(snapAna.target_low),
      targetAvg: fmtN(snapAna.target_avg),
      targetHigh: fmtN(snapAna.target_high),
      nowNum: priceNow,
      lowNum: snapAna.target_low || 0,
      avgNum: snapAna.target_avg || 0,
      highNum: snapAna.target_high || 0
    };

    const rawHistory = snap.price_history || null;
    const priceHistory = rawHistory && Array.isArray(rawHistory.candles) ? {
      source: rawHistory.source || '',
      sourceUrl: rawHistory.source_url || '',
      symbol: rawHistory.symbol || apiRecord.ticker || '',
      interval: rawHistory.interval || '1d',
      range: rawHistory.range || '1y',
      currency: rawHistory.currency || ccy,
      fetchedAt: rawHistory.fetched_at || '',
      candles: rawHistory.candles.map(d => ({
        date: d.date,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
        adjClose: d.adj_close,
        volume: d.volume
      })).filter(d => d.date && d.open != null && d.high != null && d.low != null && d.close != null)
    } : null;

    // Filing mapping
    const snapFil = snap.filing || {};
    const filing = {
      title: snapFil.type || 'Filing',
      date: fmtDate(snapFil.date, lang) || '',
      url: snapFil.url || '',
      highlight: pick(snapFil, 'highlight', CL)
    };

    return {
      id: apiRecord.ticker ? apiRecord.ticker.toLowerCase() : '',
      slug: apiRecord.slug || '',
      ticker: apiRecord.ticker || '',
      exchange: apiRecord.exchange || '',
      country: apiRecord.country || '',
      countryName: lang === 'th'
        ? (apiRecord.country_name_th || snap.country_name_th || (apiRecord.country === 'US' ? 'สหรัฐอเมริกา' : apiRecord.country === 'KR' ? 'เกาหลีใต้' : apiRecord.country === 'JP' ? 'ญี่ปุ่น' : apiRecord.country === 'TH' ? 'ไทย' : apiRecord.country === 'HK' ? 'ฮ่องกง' : apiRecord.country))
        : (apiRecord.country === 'US' ? 'United States' : apiRecord.country === 'KR' ? 'South Korea' : apiRecord.country === 'JP' ? 'Japan' : apiRecord.country === 'TH' ? 'Thailand' : apiRecord.country === 'HK' ? 'Hong Kong' : apiRecord.country === 'CN' ? 'China' : apiRecord.country === 'TW' ? 'Taiwan' : apiRecord.country),
      sector: pick(apiRecord, 'sector', lang) || snap.sector_th || snap.sector_en || apiRecord.sector,
      sectorEn: apiRecord.sector_en || snap.sector_en || apiRecord.sector,
      name: apiRecord.name,
      nameTh: apiRecord.name_th || '',
      logoUrl: cleanLogoUrl(apiRecord.logo_url || snap.logo_url || ''),
      logoText: apiRecord.logo_text || snap.logo_text || apiRecord.name[0],
      logoColor: apiRecord.logo_color || snap.logo_color || '#3a5bd9',
      logoInk: apiRecord.logo_ink || snap.logo_ink || '#fff',
      currency: ccy,
      sym: ccy,
      unit: lang === 'th' ? unit : unitEn,
      unitEn: unitEn,
      unitSuffix: factor === 1e12 ? 'T' : factor === 1e9 ? 'B' : factor === 1e6 ? 'M' : '',
      years: years,
      rating: apiRecord.rating || 'neutral',
      ratingLabel: ratingLabels[apiRecord.rating] || ratingLabels.neutral,
      analysisDate: fmtDate(apiRecord.analysis_date, lang),
      price: {
        now: fmtN(quote.price),
        changePct: quote.change_pct,
        marketCap: fmtBig(quote.market_cap, ccy),
        marketCapNum: (quote.market_cap === null || quote.market_cap === undefined) ? null : quote.market_cap,
        marketCapUsdNum: (quote.market_cap_usd === null || quote.market_cap_usd === undefined) ? null : quote.market_cap_usd,
        pe: fmtN(snapVal.pe),
        peFwd: fmtN(snapVal.forward_pe),
        asOf: fmtDate(apiRecord.analysis_date, lang)
      },
      summary: pick(apiRecord, 'summary', CL),
      thesis: pick(apiRecord, 'body', CL),
      verdict: verdict,
      financials: financials,
      margins: margins,
      priceHistory: priceHistory,
      segmentViews: flattenSegments(snap.segments, factor, lang),
      valuation: valuation,
      balance: {
        score: balanceScore,
        label: balanceLabel,
        items: balanceItems
      },
      analysts: analysts,
      filing: filing,
      catalysts: (apiRecord.catalysts || []).map(item => item[CL] || item.en || ''),
      risks: (apiRecord.risks || []).map(item => item[CL] || item.en || '')
    };
  }

  window.adaptRecord = adaptRecord;
})();
