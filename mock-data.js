// Phase 1 demo data. Documents the exact shape of `data_snapshot` and the
// analysis record. Once Supabase + api/ are live, set window.USE_MOCK = false
// in config.js and this file is ignored (the build skips it if deleted).

window.MOCK_ANALYSES = [
  {
    ticker: 'NVDA', slug: 'nvda-2026-05-30', name: 'NVIDIA Corporation', name_th: 'เอ็นวิเดีย',
    exchange: 'NASDAQ', country: 'US', sector: 'Semiconductors', logo_url: '',
    analysis_date: '2026-05-30', rating: 'bull',
    logo_text: 'NVDA', logo_color: '#76b900', logo_ink: '#fff',
    country_name_th: 'สหรัฐอเมริกา',
    sector_th: 'เซมิคอนดักเตอร์ & ฮาร์ดแวร์',
    sector_en: 'Semiconductors & Hardware',
    summary_en: 'The data-center AI accelerator monopoly keeps printing record margins — but the valuation already prices in flawless execution.',
    summary_th: 'เจ้าตลาดชิป AI ดาต้าเซ็นเตอร์ที่ทำกำไรสถิติต่อเนื่อง — แต่ราคาหุ้นสะท้อนความสมบูรณ์แบบไปแล้ว',
    body_en: `## What they do\nNVIDIA designs the GPUs and networking that train and run nearly every large AI model. **Data Center** is now ~88% of revenue, eclipsing the legacy gaming business.\n\n## Why it matters\nThe **CUDA** software moat locks developers in — switching to a rival chip means rewriting years of code. That moat is why gross margin sits above **70%**, unheard of for a hardware company.\n\n## The catch\nAt **45x earnings** the stock needs growth to stay near-vertical. Any hyperscaler capex pause, or AMD/custom-silicon traction, compresses both earnings *and* the multiple at once.`,
    body_th: `## ทำธุรกิจอะไร\nNVIDIA ออกแบบ GPU และระบบเครือข่ายที่ใช้เทรนและรันโมเดล AI ขนาดใหญ่แทบทุกตัว ปัจจุบันกลุ่ม **Data Center** คิดเป็น ~88% ของรายได้ แซงธุรกิจเกมเดิมไปแล้ว\n\n## ทำไมถึงสำคัญ\nกำแพงซอฟต์แวร์ **CUDA** ผูกนักพัฒนาไว้ — จะย้ายไปใช้ชิปคู่แข่งต้องเขียนโค้ดใหม่หลายปี กำแพงนี้คือเหตุผลที่กำไรขั้นต้นสูงเกิน **70%** ซึ่งหาไม่ได้ในบริษัทฮาร์ดแวร์ทั่วไป\n\n## จุดที่ต้องระวัง\nที่ระดับ **45 เท่าของกำไร** หุ้นต้องโตแบบเกือบตั้งฉากต่อไป หาก capex ของกลุ่มคลาวด์ชะลอ หรือ AMD/ชิปออกแบบเองเริ่มแย่งตลาด จะกดทั้งกำไร *และ* ตัวคูณพร้อมกัน`,
    verdict: {
      interesting: { label_th: "น่าสนใจสูงมาก", label_en: "Highly Interesting", tone: "up", detail_th: "ผู้นำตลาดชิป AI ผูกขาดอย่างแท้จริง", detail_en: "Monopolistic leader in AI accelerators" },
      margin: { label_th: "อัตรากำไรสูงประวัติการณ์", label_en: "Record-high Margins", tone: "up", detail_th: "Gross margin ทะลุ 70% จาก CUDA software moat", detail_en: "Gross margin exceeds 70% driven by CUDA moat" },
      mainBiz: { label_th: "Data Center เติบโตสุดขีด", label_en: "Extreme Data Center Growth", tone: "up", detail_th: "คิดเป็น ~88% ของรายได้หลักของบริษัท", detail_en: "Accounts for ~88% of consolidated revenue" },
      valuation: { label_th: "ราคาค่อนข้างตึงตัว", label_en: "Relatively Priced In", tone: "down", detail_th: "P/E 45x ไม่มีที่ว่างให้ผิดพลาดแม้แต่ไตรมาสเดียว", detail_en: "P/E 45x leaves no room for any quarterly miss" }
    },
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
      valuation: { 
        pe: 45.2, forward_pe: 32.1, ps: 22.4, pb: 48.1, ev_ebitda: 38.6, peg: 1.2, pe_avg5: 38.0, ps_avg5: 16.2,
        pe_low: 30.0, pe_high: 65.0, pe_peer: 41.0,
        forward_pe_low: 22.0, forward_pe_high: 48.0, forward_pe_peer: 32.0,
        ps_low: 12.0, ps_high: 30.0, ps_peer: 15.0,
        pb_low: 25.0, pb_high: 60.0, pb_peer: 33.0,
        ev_ebitda_low: 25.0, ev_ebitda_high: 50.0, ev_ebitda_peer: 32.0,
        peg_low: 0.8, peg_high: 2.2, peg_peer: 1.2
      },
      annual: [
        { year: 2021, revenue: 16675e6, gross_profit: 10396e6, operating_income: 4532e6,  net_income: 4332e6,  eps: 1.73,  fcf: 4694e6 },
        { year: 2022, revenue: 26914e6, gross_profit: 17475e6, operating_income: 10041e6, net_income: 9752e6,  eps: 3.85,  fcf: 8132e6 },
        { year: 2023, revenue: 26974e6, gross_profit: 15356e6, operating_income: 4224e6,  net_income: 4368e6,  eps: 1.74,  fcf: 3808e6 },
        { year: 2024, revenue: 60922e6, gross_profit: 44301e6, operating_income: 32972e6, net_income: 29760e6, eps: 11.93, fcf: 27021e6 },
        { year: 2025, revenue: 96307e6, gross_profit: 73172e6, operating_income: 58818e6, net_income: 52680e6, eps: 21.10, fcf: 46210e6 },
      ],
      balance: { cash: 26000e6, total_debt: 8460e6, de_ratio: 0.37, current_ratio: 4.2, interest_coverage: 120, health_score: 92 },
      analyst: { strong_buy: 28, buy: 12, hold: 5, sell: 1, strong_sell: 0, target_avg: 1050, target_low: 750, target_high: 1400 },
      peers: [ { ticker: 'AMD', pe: 98 }, { ticker: 'AVGO', pe: 41 }, { ticker: 'INTC', pe: 33 } ],
      filing: { type: '10-K', date: '2026-02-26', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=NVDA&type=10-K',
        highlight_en: 'FY25 revenue +58% YoY; data center +93%. Guidance points to continued supply-constrained demand for Blackwell.',
        highlight_th: 'รายได้ปี FY25 +58% YoY กลุ่มดาต้าเซ็นเตอร์ +93% แนวโน้มชี้ว่าดีมานด์ Blackwell ยังถูกจำกัดด้วยกำลังผลิต' },
      insider: [
        { name: 'J. Huang (CEO)', action: 'sell', shares: 120000, date: '2026-03-15' },
        { name: 'C. Kress (CFO)', action: 'sell', shares: 30000,  date: '2026-03-10' },
      ],
      segments: {
        source_standard: 'Company KPI',
        source_url: 'https://investor.nvidia.com/financial-info/financial-reports/default.aspx',
        currency: '$',
        fiscal_years: [2021, 2022, 2023, 2024, 2025],
        primary_lens: 'market_platforms',
        archetype: 'product_service',
        disclosure_quality: 'B',
        notes: ['NVIDIA discloses revenue by market platform, but not operating income by platform.'],
        sets: [
          {
            id: 'market_platforms',
            label_en: 'Market Platforms',
            label_th: 'แพลตฟอร์มตลาด',
            kind: 'product',
            metrics: ['revenue'],
            items: [
              { id: 'data-center', name_en: 'Data Center', name_th: 'Data Center', annual: [
                { year: 2021, revenue: 6700e6 },
                { year: 2022, revenue: 10610e6 },
                { year: 2023, revenue: 15005e6 },
                { year: 2024, revenue: 47525e6 },
                { year: 2025, revenue: 85700e6 },
              ] },
              { id: 'gaming', name_en: 'Gaming', name_th: 'Gaming', annual: [
                { year: 2021, revenue: 7760e6 },
                { year: 2022, revenue: 12462e6 },
                { year: 2023, revenue: 9067e6 },
                { year: 2024, revenue: 10447e6 },
                { year: 2025, revenue: 7100e6 },
              ] },
              { id: 'professional-visualization', name_en: 'Professional Visualization', name_th: 'Professional Visualization', annual: [
                { year: 2021, revenue: 1053e6 },
                { year: 2022, revenue: 2111e6 },
                { year: 2023, revenue: 1544e6 },
                { year: 2024, revenue: 1553e6 },
                { year: 2025, revenue: 1900e6 },
              ] },
              { id: 'automotive', name_en: 'Automotive', name_th: 'Automotive', annual: [
                { year: 2021, revenue: 536e6 },
                { year: 2022, revenue: 566e6 },
                { year: 2023, revenue: 903e6 },
                { year: 2024, revenue: 1091e6 },
                { year: 2025, revenue: 1607e6 },
              ] },
            ],
            reconciliation: [
              { year: 2025, consolidated_revenue: 96307e6, segment_revenue_total: 96307e6, eliminations: 0, unallocated: 0 }
            ]
          }
        ]
      },
    },
  },
  {
    ticker: '005930.KS', slug: 'samsung-2026-05-28', name: 'Samsung Electronics', name_th: 'ซัมซุง อิเล็กทรอนิกส์',
    exchange: 'KOSPI', country: 'KR', sector: 'Semiconductors / Consumer Tech', logo_url: '',
    analysis_date: '2026-05-28', rating: 'neutral',
    logo_text: 'S', logo_color: '#1428a0', logo_ink: '#fff',
    country_name_th: 'เกาหลีใต้',
    sector_th: 'เซมิคอนดักเตอร์ & อิเล็กทรอนิกส์',
    sector_en: 'Semiconductors & Electronics',
    summary_en: 'A memory-cycle recovery is lifting earnings, but the HBM gap versus SK Hynix keeps it a step behind the AI trade.',
    summary_th: 'วัฏจักรหน่วยความจำฟื้นช่วยดันกำไร แต่ช่องว่าง HBM เทียบ SK Hynix ทำให้ตามหลังธีม AI อยู่ก้าวหนึ่ง',
    body_en: `## What they do\nSamsung is the world's largest memory maker and a top smartphone and display vendor. The swing factor for the stock is the **DRAM/NAND price cycle**.\n\n## Where it stands\nThe memory downturn has bottomed and prices are recovering, lifting margins off depressed lows. But in **high-bandwidth memory (HBM)** — the kind AI accelerators need — Samsung trails SK Hynix on qualification at the key customer.\n\n## Our read\nCheap on book value with a cyclical tailwind, but it lacks the clean AI narrative. A *value* holding, not a momentum one.`,
    body_th: `## ทำธุรกิจอะไร\nซัมซุงเป็นผู้ผลิตหน่วยความจำรายใหญ่ที่สุดในโลก และเป็นเจ้าตลาดสมาร์ทโฟนและจอแสดงผล ตัวแปรสำคัญของหุ้นคือ **วัฏจักรราคา DRAM/NAND**\n\n## สถานะปัจจุบัน\nขาลงของหน่วยความจำผ่านจุดต่ำสุดแล้ว ราคากำลังฟื้น ดันมาร์จิ้นขึ้นจากฐานต่ำ แต่ในกลุ่ม **HBM** ที่ชิป AI ต้องใช้ ซัมซุงยังตามหลัง SK Hynix เรื่องการผ่านการรับรองกับลูกค้ารายสำคัญ\n\n## มุมมองเรา\nถูกเมื่อเทียบมูลค่าทางบัญชี และมีลมหนุนเชิงวัฏจักร แต่ขาดเรื่องเล่า AI ที่ชัด เหมาะเป็นหุ้น *value* มากกว่าหุ้นโมเมนตัม`,
    verdict: {
      interesting: { label_th: "น่าสนใจระดับกลาง", label_en: "Moderately Interesting", tone: "neutral", detail_th: "ฟื้นตามวัฏจักร แต่ยังตามหลัง SK Hynix ในตลาด HBM", detail_en: "Cyclical recovery but trails SK Hynix in HBM" },
      margin: { label_th: "มาร์จิ้นกำลังฟื้นตัวชัดเจน", label_en: "Margin recovering cleanly", tone: "up", detail_th: "ราคาชิปดีดขึ้นช่วยผลักดันกำไรดำเนินงานขาขึ้น", detail_en: "Rebounding chip prices drive up operating profits" },
      mainBiz: { label_th: "DRAM/NAND ผสมมือถือ", label_en: "DRAM/NAND & Mobile mix", tone: "neutral", detail_th: "หน่วยความจำเป็นแกนหลัก มือถือประคองรายได้", detail_en: "Memory is cyclical core, mobile stabilizes" },
      valuation: { label_th: "ค่อนข้างถูกเมื่อเทียบกับอดีต", label_en: "Attractive valuation", tone: "up", detail_th: "เทรดที่ P/B 1.3 เท่า ใกล้จุดต่ำสุดในอดีต", detail_en: "Trades at P/B 1.3x near historical bottom" }
    },
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
      valuation: { 
        pe: 14.8, forward_pe: 11.2, ps: 1.6, pb: 1.3, ev_ebitda: 5.1, peg: 0.7, pe_avg5: 13.0, ps_avg5: 1.5,
        pe_low: 7.5, pe_high: 19.0, pe_peer: 16.5,
        forward_pe_low: 6.0, forward_pe_high: 15.0, forward_pe_peer: 14.0,
        ps_low: 0.8, ps_high: 2.5, ps_peer: 2.1,
        pb_low: 0.9, pb_high: 2.0, pb_peer: 1.8,
        ev_ebitda_low: 3.0, ev_ebitda_high: 12.0, ev_ebitda_peer: 10.0,
        peg_low: 0.5, peg_high: 2.5, peg_peer: 1.2
      },
      annual: [
        { year: 2021, revenue: 279600e9, gross_profit: 110000e9, operating_income: 51630e9, net_income: 39900e9, eps: 5777, fcf: 20000e9 },
        { year: 2022, revenue: 302230e9, gross_profit: 112000e9, operating_income: 43380e9, net_income: 55650e9, eps: 8057, fcf: 16000e9 },
        { year: 2023, revenue: 258940e9, gross_profit: 80000e9,  operating_income: 6570e9,  net_income: 15490e9, eps: 2131, fcf: -4000e9 },
        { year: 2024, revenue: 300870e9, gross_profit: 102000e9, operating_income: 32730e9, net_income: 34450e9, eps: 4950, fcf: 12000e9 },
        { year: 2025, revenue: 315000e9, gross_profit: 116000e9, operating_income: 41000e9, net_income: 40200e9, eps: 5810, fcf: 18000e9 },
      ],
      balance: { cash: 95000e9, total_debt: 12000e9, de_ratio: 0.05, current_ratio: 2.4, interest_coverage: 60, health_score: 86 },
      analyst: { strong_buy: 18, buy: 14, hold: 6, sell: 0, strong_sell: 0, target_avg: 95000, target_low: 70000, target_high: 120000 },
      segments: {
        source_standard: 'Company KPI',
        source_url: 'https://www.samsung.com/global/ir/financial-information/financial-statements/',
        currency: '₩',
        fiscal_years: [2021, 2022, 2023, 2024, 2025],
        primary_lens: 'reportable',
        archetype: 'product_service',
        disclosure_quality: 'A',
        notes: ['ซัมซุงเปิดเผยรายได้และกำไรจากการดำเนินงานแยกตามส่วนงานหลัก แต่ภูมิภาคไม่เปิดเผยกำไรแยกต่างหาก'],
        sets: [
          {
            id: 'reportable',
            label_en: 'Reportable segments',
            label_th: 'ส่วนงานหลัก',
            kind: 'product',
            metrics: ['revenue', 'operating_income', 'assets', 'capex'],
            items: [
              {
                id: 'dx',
                name_en: 'DX Division',
                name_th: 'DX Division',
                annual: [
                  { year: 2021, revenue: 166.0e12, operating_income: 15.6e12, assets: 120e12, capex: 4.1e12 },
                  { year: 2022, revenue: 182.0e12, operating_income: 13.2e12, assets: 128e12, capex: 4.5e12 },
                  { year: 2023, revenue: 170.0e12, operating_income: 12.0e12, assets: 130e12, capex: 4.0e12 },
                  { year: 2024, revenue: 174.0e12, operating_income: 13.5e12, assets: 134e12, capex: 4.2e12 },
                  { year: 2025, revenue: 178.0e12, operating_income: 14.0e12, assets: 138e12, capex: 4.4e12 }
                ]
              },
              {
                id: 'ds',
                name_en: 'DS Division',
                name_th: 'DS Division',
                annual: [
                  { year: 2021, revenue: 94.2e12, operating_income: 29.6e12, assets: 180e12, capex: 43.6e12 },
                  { year: 2022, revenue: 98.5e12, operating_income: 23.8e12, assets: 205e12, capex: 47.9e12 },
                  { year: 2023, revenue: 66.6e12, operating_income: -14.9e12, assets: 220e12, capex: 53.1e12 },
                  { year: 2024, revenue: 92.0e12, operating_income: 15.1e12, assets: 245e12, capex: 50.0e12 },
                  { year: 2025, revenue: 110.0e12, operating_income: 21.0e12, assets: 270e12, capex: 52.0e12 }
                ]
              },
              {
                id: 'sdc',
                name_en: 'Samsung Display',
                name_th: 'Samsung Display',
                annual: [
                  { year: 2021, revenue: 31.7e12, operating_income: 4.4e12, assets: 42e12, capex: 6.0e12 },
                  { year: 2022, revenue: 34.4e12, operating_income: 5.9e12, assets: 45e12, capex: 5.5e12 },
                  { year: 2023, revenue: 30.9e12, operating_income: 5.6e12, assets: 46e12, capex: 5.0e12 },
                  { year: 2024, revenue: 30.0e12, operating_income: 4.6e12, assets: 47e12, capex: 5.2e12 },
                  { year: 2025, revenue: 31.0e12, operating_income: 4.8e12, assets: 48e12, capex: 5.2e12 }
                ]
              },
              {
                id: 'harman',
                name_en: 'Harman',
                name_th: 'Harman',
                annual: [
                  { year: 2021, revenue: 10.0e12, operating_income: 0.6e12, assets: 12e12, capex: 0.3e12 },
                  { year: 2022, revenue: 13.2e12, operating_income: 0.9e12, assets: 13e12, capex: 0.3e12 },
                  { year: 2023, revenue: 14.4e12, operating_income: 1.2e12, assets: 13e12, capex: 0.3e12 },
                  { year: 2024, revenue: 14.8e12, operating_income: 1.3e12, assets: 14e12, capex: 0.3e12 },
                  { year: 2025, revenue: 15.2e12, operating_income: 1.4e12, assets: 14e12, capex: 0.3e12 }
                ]
              }
            ]
          },
          {
            id: 'geo',
            label_en: 'By geography',
            label_th: 'ภูมิภาค',
            kind: 'geography',
            metrics: ['revenue'],
            items: [
              {
                id: 'americas',
                name_en: 'Americas',
                name_th: 'ทวีปอเมริกา',
                annual: [
                  { year: 2021, revenue: 102e12 },
                  { year: 2022, revenue: 110e12 },
                  { year: 2023, revenue: 95e12 },
                  { year: 2024, revenue: 108e12 },
                  { year: 2025, revenue: 114e12 }
                ]
              },
              {
                id: 'korea',
                name_en: 'Korea',
                name_th: 'เกาหลี',
                annual: [
                  { year: 2021, revenue: 50e12 },
                  { year: 2022, revenue: 53e12 },
                  { year: 2023, revenue: 48e12 },
                  { year: 2024, revenue: 54e12 },
                  { year: 2025, revenue: 57e12 }
                ]
              },
              {
                id: 'china',
                name_en: 'China',
                name_th: 'จีน',
                annual: [
                  { year: 2021, revenue: 48e12 },
                  { year: 2022, revenue: 52e12 },
                  { year: 2023, revenue: 42e12 },
                  { year: 2024, revenue: 48e12 },
                  { year: 2025, revenue: 50e12 }
                ]
              },
              {
                id: 'europe',
                name_en: 'Europe',
                name_th: 'ยุโรป',
                annual: [
                  { year: 2021, revenue: 44e12 },
                  { year: 2022, revenue: 48e12 },
                  { year: 2023, revenue: 40e12 },
                  { year: 2024, revenue: 46e12 },
                  { year: 2025, revenue: 48e12 }
                ]
              },
              {
                id: 'asia',
                name_en: 'Asia/Africa',
                name_th: 'เอเชีย/แอฟริกา',
                annual: [
                  { year: 2021, revenue: 35e12 },
                  { year: 2022, revenue: 39e12 },
                  { year: 2023, revenue: 33e12 },
                  { year: 2024, revenue: 44e12 },
                  { year: 2025, revenue: 49e12 }
                ]
              }
            ]
          }
        ]
      },
      peers: [ { ticker: 'SK Hynix', pe: 9 }, { ticker: 'Micron', pe: 16 }, { ticker: 'TSMC', pe: 24 } ],
      filing: { type: '사업보고서', date: '2026-03-12', url: 'https://dart.fss.or.kr',
        highlight_en: 'FY25 operating profit recovered to ₩41T as memory prices rebounded; HBM revenue still a minority of DRAM mix.',
        highlight_th: 'กำไรดำเนินงาน FY25 ฟื้นเป็น 41 ล้านล้านวอนจากราคาหน่วยความจำที่กลับมา รายได้ HBM ยังเป็นส่วนน้อยของพอร์ต DRAM' },
      insider: [],
    },
  },
];
