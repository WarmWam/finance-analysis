// Phase 1 demo data. Documents the exact shape of `data_snapshot` and the
// analysis record. Once Supabase + api/ are live, set window.USE_MOCK = false
// in config.js and this file is ignored (the build skips it if deleted).
//
// analysis record shape (mirrors the `analyses` table):
//   { ticker, slug, name, name_th, exchange, country, sector, logo_url,
//     analysis_date, rating, summary_en, summary_th, body_en, body_th,
//     catalysts:[{en,th}], risks:[{en,th}], data_snapshot:{...} }
//
// data_snapshot shape (everything the charts/tables render — frozen at publish):
//   quote:     { price, change_pct, market_cap, currency }
//   valuation: { pe, forward_pe, ps, pb, ev_ebitda, peg, pe_avg5, ps_avg5 }
//   annual:    [{ year, revenue, gross_profit, operating_income, net_income, eps, fcf }]  // ascending
//   balance:   { cash, total_debt, de_ratio, current_ratio, interest_coverage }
//   analyst:   { strong_buy, buy, hold, sell, target_avg, target_low, target_high }
//   peers:     [{ ticker, pe }]
//   filing:    { type, date, url, highlight_en, highlight_th }
//   insider:   [{ name, action, shares, date }]

window.MOCK_ANALYSES = [
  {
    ticker: 'NVDA', slug: 'nvda-2026-05-30', name: 'NVIDIA Corporation', name_th: 'เอ็นวิเดีย',
    exchange: 'NASDAQ', country: 'US', sector: 'Semiconductors', logo_url: '',
    analysis_date: '2026-05-30', rating: 'bull',
    summary_en: 'The data-center AI accelerator monopoly keeps printing record margins — but the valuation already prices in flawless execution.',
    summary_th: 'เจ้าตลาดชิป AI ดาต้าเซ็นเตอร์ที่ทำกำไรสถิติต่อเนื่อง — แต่ราคาหุ้นสะท้อนความสมบูรณ์แบบไปแล้ว',
    body_en: `## What they do\nNVIDIA designs the GPUs and networking that train and run nearly every large AI model. **Data Center** is now ~88% of revenue, eclipsing the legacy gaming business.\n\n## Why it matters\nThe **CUDA** software moat locks developers in — switching to a rival chip means rewriting years of code. That moat is why gross margin sits above **70%**, unheard of for a hardware company.\n\n## The catch\nAt **45x earnings** the stock needs growth to stay near-vertical. Any hyperscaler capex pause, or AMD/custom-silicon traction, compresses both earnings *and* the multiple at once.`,
    body_th: `## ทำธุรกิจอะไร\nNVIDIA ออกแบบ GPU และระบบเครือข่ายที่ใช้เทรนและรันโมเดล AI ขนาดใหญ่แทบทุกตัว ปัจจุบันกลุ่ม **Data Center** คิดเป็น ~88% ของรายได้ แซงธุรกิจเกมเดิมไปแล้ว\n\n## ทำไมถึงสำคัญ\nกำแพงซอฟต์แวร์ **CUDA** ผูกนักพัฒนาไว้ — จะย้ายไปใช้ชิปคู่แข่งต้องเขียนโค้ดใหม่หลายปี กำแพงนี้คือเหตุผลที่กำไรขั้นต้นสูงเกิน **70%** ซึ่งหาไม่ได้ในบริษัทฮาร์ดแวร์ทั่วไป\n\n## จุดที่ต้องระวัง\nที่ระดับ **45 เท่าของกำไร** หุ้นต้องโตแบบเกือบตั้งฉากต่อไป หาก capex ของกลุ่มคลาวด์ชะลอ หรือ AMD/ชิปออกแบบเองเริ่มแย่งตลาด จะกดทั้งกำไร *และ* ตัวคูณพร้อมกัน`,
    catalysts: [
      { en: 'Blackwell ramp drives another data-center revenue step-up', th: 'การ ramp ชิป Blackwell ดันรายได้ดาต้าเซ็นเตอร์ขึ้นอีกขั้น' },
      { en: 'Sovereign-AI deals open a new buyer category beyond hyperscalers', th: 'ดีล Sovereign-AI เปิดกลุ่มลูกค้าใหม่นอกเหนือกลุ่มคลาวด์' },
    ],
    risks: [
      { en: 'Customer concentration — a handful of cloud buyers drive most demand', th: 'ลูกค้ากระจุกตัว — ดีมานด์ส่วนใหญ่มาจากผู้ซื้อคลาวด์ไม่กี่ราย' },
      { en: 'Export controls on China can erase a revenue segment overnight', th: 'มาตรการคุมส่งออกไปจีนลบรายได้ทั้งกลุ่มได้ในชั่วข้ามคืน' },
      { en: 'Valuation leaves no room for a single soft quarter', th: 'มูลค่าหุ้นไม่เหลือที่ว่างให้ผิดคาดแม้แต่ไตรมาสเดียว' },
    ],
    data_snapshot: {
      quote: { price: 892.50, change_pct: 2.31, market_cap: 2190e9, currency: '$' },
      valuation: { pe: 45.2, forward_pe: 32.1, ps: 22.4, pb: 48.1, ev_ebitda: 38.6, peg: 1.2, pe_avg5: 38.0, ps_avg5: 16.2 },
      annual: [
        { year: 2021, revenue: 16675e6, gross_profit: 10396e6, operating_income: 4532e6,  net_income: 4332e6,  eps: 1.73,  fcf: 4694e6 },
        { year: 2022, revenue: 26914e6, gross_profit: 17475e6, operating_income: 10041e6, net_income: 9752e6,  eps: 3.85,  fcf: 8132e6 },
        { year: 2023, revenue: 26974e6, gross_profit: 15356e6, operating_income: 4224e6,  net_income: 4368e6,  eps: 1.74,  fcf: 3808e6 },
        { year: 2024, revenue: 60922e6, gross_profit: 44301e6, operating_income: 32972e6, net_income: 29760e6, eps: 11.93, fcf: 27021e6 },
        { year: 2025, revenue: 96307e6, gross_profit: 73172e6, operating_income: 58818e6, net_income: 52680e6, eps: 21.10, fcf: 46210e6 },
      ],
      balance: { cash: 26000e6, total_debt: 8460e6, de_ratio: 0.37, current_ratio: 4.2, interest_coverage: 120 },
      analyst: { strong_buy: 28, buy: 12, hold: 5, sell: 1, target_avg: 1050, target_low: 750, target_high: 1400 },
      peers: [ { ticker: 'AMD', pe: 98 }, { ticker: 'AVGO', pe: 41 }, { ticker: 'INTC', pe: 33 } ],
      filing: { type: '10-K', date: '2026-02-26', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NVDA&type=10-K',
        highlight_en: 'FY25 revenue +58% YoY; data center +93%. Guidance points to continued supply-constrained demand for Blackwell.',
        highlight_th: 'รายได้ปี FY25 +58% YoY กลุ่มดาต้าเซ็นเตอร์ +93% แนวโน้มชี้ว่าดีมานด์ Blackwell ยังถูกจำกัดด้วยกำลังผลิต' },
      insider: [
        { name: 'J. Huang (CEO)', action: 'sell', shares: 120000, date: '2026-03-15' },
        { name: 'C. Kress (CFO)', action: 'sell', shares: 30000,  date: '2026-03-10' },
      ],
    },
  },
  {
    ticker: '005930.KS', slug: 'samsung-2026-05-28', name: 'Samsung Electronics', name_th: 'ซัมซุง อิเล็กทรอนิกส์',
    exchange: 'KOSPI', country: 'KR', sector: 'Semiconductors / Consumer Tech', logo_url: '',
    analysis_date: '2026-05-28', rating: 'neutral',
    summary_en: 'A memory-cycle recovery is lifting earnings, but the HBM gap versus SK Hynix keeps it a step behind the AI trade.',
    summary_th: 'วัฏจักรหน่วยความจำฟื้นช่วยดันกำไร แต่ช่องว่าง HBM เทียบ SK Hynix ทำให้ตามหลังธีม AI อยู่ก้าวหนึ่ง',
    body_en: `## What they do\nSamsung is the world's largest memory maker and a top smartphone and display vendor. The swing factor for the stock is the **DRAM/NAND price cycle**.\n\n## Where it stands\nThe memory downturn has bottomed and prices are recovering, lifting margins off depressed lows. But in **high-bandwidth memory (HBM)** — the kind AI accelerators need — Samsung trails SK Hynix on qualification at the key customer.\n\n## Our read\nCheap on book value with a cyclical tailwind, but it lacks the clean AI narrative. A *value* holding, not a momentum one.`,
    body_th: `## ทำธุรกิจอะไร\nซัมซุงเป็นผู้ผลิตหน่วยความจำรายใหญ่ที่สุดในโลก และเป็นเจ้าตลาดสมาร์ทโฟนและจอแสดงผล ตัวแปรสำคัญของหุ้นคือ **วัฏจักรราคา DRAM/NAND**\n\n## สถานะปัจจุบัน\nขาลงของหน่วยความจำผ่านจุดต่ำสุดแล้ว ราคากำลังฟื้น ดันมาร์จิ้นขึ้นจากฐานต่ำ แต่ในกลุ่ม **HBM** ที่ชิป AI ต้องใช้ ซัมซุงยังตามหลัง SK Hynix เรื่องการผ่านการรับรองกับลูกค้ารายสำคัญ\n\n## มุมมองเรา\nถูกเมื่อเทียบมูลค่าทางบัญชี และมีลมหนุนเชิงวัฏจักร แต่ขาดเรื่องเล่า AI ที่ชัด เหมาะเป็นหุ้น *value* มากกว่าหุ้นโมเมนตัม`,
    catalysts: [
      { en: 'HBM3E qualification at the lead AI customer would re-rate the stock', th: 'การผ่านรับรอง HBM3E กับลูกค้า AI รายนำจะรีเรตหุ้น' },
      { en: 'Memory up-cycle expands margins through 2026', th: 'วัฏจักรหน่วยความจำขาขึ้นช่วยขยายมาร์จิ้นตลอดปี 2026' },
    ],
    risks: [
      { en: 'Memory is deeply cyclical — pricing can reverse fast', th: 'ธุรกิจหน่วยความจำเป็นวัฏจักรจัด ราคาพลิกได้เร็ว' },
      { en: 'Foundry losses drag group margins', th: 'ผลขาดทุนธุรกิจ foundry กดมาร์จิ้นรวม' },
    ],
    data_snapshot: {
      quote: { price: 78900, change_pct: -0.63, market_cap: 470e12, currency: '₩' },
      valuation: { pe: 14.8, forward_pe: 11.2, ps: 1.6, pb: 1.3, ev_ebitda: 5.1, peg: 0.7, pe_avg5: 13.0, ps_avg5: 1.5 },
      annual: [
        { year: 2021, revenue: 279600e9, gross_profit: 110000e9, operating_income: 51630e9, net_income: 39900e9, eps: 5777, fcf: 20000e9 },
        { year: 2022, revenue: 302230e9, gross_profit: 112000e9, operating_income: 43380e9, net_income: 55650e9, eps: 8057, fcf: 16000e9 },
        { year: 2023, revenue: 258940e9, gross_profit: 80000e9,  operating_income: 6570e9,  net_income: 15490e9, eps: 2131, fcf: -4000e9 },
        { year: 2024, revenue: 300870e9, gross_profit: 102000e9, operating_income: 32730e9, net_income: 34450e9, eps: 4950, fcf: 12000e9 },
        { year: 2025, revenue: 315000e9, gross_profit: 116000e9, operating_income: 41000e9, net_income: 40200e9, eps: 5810, fcf: 18000e9 },
      ],
      balance: { cash: 95000e9, total_debt: 12000e9, de_ratio: 0.05, current_ratio: 2.4, interest_coverage: 60 },
      analyst: { strong_buy: 18, buy: 14, hold: 6, sell: 0, target_avg: 95000, target_low: 70000, target_high: 120000 },
      peers: [ { ticker: 'SK Hynix', pe: 9 }, { ticker: 'Micron', pe: 16 }, { ticker: 'TSMC', pe: 24 } ],
      filing: { type: '사업보고서', date: '2026-03-12', url: 'https://dart.fss.or.kr',
        highlight_en: 'FY25 operating profit recovered to ₩41T as memory prices rebounded; HBM revenue still a minority of DRAM mix.',
        highlight_th: 'กำไรดำเนินงาน FY25 ฟื้นเป็น 41 ล้านล้านวอนจากราคาหน่วยความจำที่กลับมา รายได้ HBM ยังเป็นส่วนน้อยของพอร์ต DRAM' },
      insider: [],
    },
  },
  {
    ticker: '7203.T', slug: 'toyota-2026-05-25', name: 'Toyota Motor', name_th: 'โตโยต้า มอเตอร์',
    exchange: 'TSE', country: 'JP', sector: 'Automotive', logo_url: '',
    analysis_date: '2026-05-25', rating: 'bull',
    summary_en: 'The hybrid-first bet looks vindicated as pure-EV demand cools — record profits, yet still trades like a slow-growth automaker.',
    summary_th: 'การเดิมพันไฮบริดก่อนใครดูถูกทาง เมื่อดีมานด์ EV ล้วนแผ่วลง — กำไรสถิติ แต่ราคายังถูกเหมือนค่ายรถโตช้า',
    body_en: `## What they do\nToyota is the world's largest automaker by volume, with an unmatched **hybrid** lineup and a famously efficient production system.\n\n## Why it's working\nAs consumers hesitate on full EVs, Toyota's hybrids are exactly the product the market wants right now. A weak yen further inflates repatriated overseas profit.\n\n## The case\nRecord earnings, a fortress balance sheet, and a sub-**10x** multiple. The risk is a yen reversal and the long-term EV transition it has been slow to embrace.`,
    body_th: `## ทำธุรกิจอะไร\nโตโยต้าเป็นค่ายรถยนต์ที่ขายได้มากที่สุดในโลกตามจำนวนคัน มีไลน์อัพ **ไฮบริด** ที่ไม่มีใครเทียบ และระบบการผลิตที่มีประสิทธิภาพระดับตำนาน\n\n## ทำไมถึงไปได้ดี\nเมื่อผู้บริโภคลังเลกับ EV ล้วน รถไฮบริดของโตโยต้าคือสินค้าที่ตลาดต้องการพอดีในตอนนี้ เงินเยนอ่อนยังช่วยเพิ่มกำไรจากต่างประเทศเมื่อแปลงกลับ\n\n## เหตุผลการลงทุน\nกำไรสถิติ งบดุลแข็งแกร่ง และตัวคูณต่ำกว่า **10 เท่า** ความเสี่ยงคือเงินเยนกลับทิศ และการเปลี่ยนผ่านสู่ EV ระยะยาวที่บริษัทปรับตัวช้า`,
    catalysts: [
      { en: 'Hybrid demand stays strong while rivals discount EVs', th: 'ดีมานด์ไฮบริดยังแข็งแกร่งขณะคู่แข่งต้องลดราคา EV' },
      { en: 'Solid-state battery roadmap could reset the EV narrative', th: 'โรดแมปแบตเตอรี่ solid-state อาจพลิกเรื่องเล่า EV' },
    ],
    risks: [
      { en: 'A stronger yen directly cuts reported profit', th: 'เงินเยนแข็งค่าลดกำไรที่รายงานโดยตรง' },
      { en: 'Late to pure-EV scale versus Chinese makers', th: 'ตามหลังการสเกล EV ล้วนเทียบค่ายจีน' },
    ],
    data_snapshot: {
      quote: { price: 3120, change_pct: 1.08, market_cap: 48e12, currency: '¥' },
      valuation: { pe: 9.6, forward_pe: 9.1, ps: 0.9, pb: 1.2, ev_ebitda: 8.2, peg: 1.0, pe_avg5: 10.5, ps_avg5: 0.8 },
      annual: [
        { year: 2021, revenue: 27214e9, gross_profit: 5100e9, operating_income: 2197e9, net_income: 2245e9, eps: 162, fcf: 2900e9 },
        { year: 2022, revenue: 31379e9, gross_profit: 5600e9, operating_income: 2995e9, net_income: 2850e9, eps: 205, fcf: 1500e9 },
        { year: 2023, revenue: 37154e9, gross_profit: 6200e9, operating_income: 2725e9, net_income: 2451e9, eps: 179, fcf: 1100e9 },
        { year: 2024, revenue: 45095e9, gross_profit: 8100e9, operating_income: 5353e9, net_income: 4944e9, eps: 366, fcf: 3800e9 },
        { year: 2025, revenue: 47000e9, gross_profit: 8400e9, operating_income: 4800e9, net_income: 4500e9, eps: 340, fcf: 3500e9 },
      ],
      balance: { cash: 9000e9, total_debt: 30000e9, de_ratio: 1.1, current_ratio: 1.3, interest_coverage: 25 },
      analyst: { strong_buy: 9, buy: 8, hold: 7, sell: 1, target_avg: 3600, target_low: 2800, target_high: 4400 },
      peers: [ { ticker: 'Honda', pe: 8 }, { ticker: 'VW', pe: 4 }, { ticker: 'GM', pe: 6 } ],
      filing: { type: '有価証券報告書', date: '2026-05-10', url: 'https://disclosure2.edinet-fsa.go.jp',
        highlight_en: 'FY25 operating income near record on hybrid mix and yen tailwind; flags normalization of pricing into FY26.',
        highlight_th: 'กำไรดำเนินงาน FY25 ใกล้สถิติจากสัดส่วนไฮบริดและลมหนุนเงินเยน เตือนว่าราคาขายจะเข้าสู่ภาวะปกติในปี FY26' },
      insider: [],
    },
  },
];
