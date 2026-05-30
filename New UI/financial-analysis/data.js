/* Ledger Lens — mock research data (window.LL_DATA)
   Financial arrays are in each company's display unit, years 2021–2025.
   Segment arrays: rev / opinc / assets / capex per year (null = ไม่เปิดเผย). */
(function () {
  const YEARS = [2021, 2022, 2023, 2024, 2025];

  const SAMSUNG = {
    id: "005930.ks", ticker: "005930.KS", exchange: "KRX", country: "KR", countryName: "เกาหลีใต้",
    sector: "เซมิคอนดักเตอร์ & อิเล็กทรอนิกส์", sectorEn: "Technology",
    name: "Samsung Electronics", logoText: "S", logoColor: "#1428a0",
    currency: "KRW", sym: "₩", unit: "ล้านล้าน", unitEn: "trillion KRW", years: YEARS,
    rating: "neutral", ratingLabel: "ถือ / เป็นกลาง",
    analysisDate: "30 พ.ค. 2026",
    price: { now: "78,400", changePct: -0.9, marketCap: "468 ล้านล้าน ₩", pe: "14.0", peFwd: "11.2", asOf: "30 พ.ค. 2026 16:00 KST" },
    summary: "วัฏจักรหน่วยความจำฟื้นตัว หนุน DS กลับมาทำกำไร แต่ราคาสะท้อนการฟื้นตัวไปมากแล้ว",
    thesis: "Samsung กลับเข้าสู่ช่วงขาขึ้นของวัฏจักรเซมิคอนดักเตอร์ — ธุรกิจ DS (ชิป) พลิกจากขาดทุนปี 2023 กลับมาเป็นกำไรหลัก ขับเคลื่อนด้วยดีมานด์ HBM/AI ขณะที่ธุรกิจ DX (มือถือ/เครื่องใช้ไฟฟ้า) ยังเป็นฐานรายได้ที่มั่นคง อัตรากำไรรวมฟื้นชัดเจน แต่ valuation เริ่มตึงเมื่อเทียบค่าเฉลี่ย 5 ปี เราจึงให้มุมมอง 'เป็นกลาง'",
    verdict: {
      interesting: { label: "น่าสนใจระดับกลาง", tone: "neutral", detail: "ฟื้นตามวัฏจักร แต่ upside จำกัด" },
      margin: { label: "อัตรากำไรกำลังดีขึ้น", tone: "up", detail: "Operating margin 2.5% → 12% ใน 2 ปี" },
      mainBiz: { label: "DS (ชิป) + DX (มือถือ)", tone: "neutral", detail: "ชิปคือเครื่องยนต์กำไรหลัก" },
      valuation: { label: "ค่อนข้างแพงเทียบอดีต", tone: "down", detail: "P/E 14.0 สูงกว่าเฉลี่ย 5 ปี 11.8" },
    },
    financials: {
      revenue: [279.6, 302.2, 258.9, 300.9, 318.0],
      grossProfit: [103.2, 112.1, 90.1, 114.0, 124.0],
      operatingIncome: [51.6, 43.4, 6.6, 32.7, 38.2],
      netIncome: [39.9, 55.7, 15.5, 34.5, 39.1],
      eps: [5777, 8057, 2131, 4950, 5600],
      fcf: [17.4, 8.1, -4.2, 20.6, 28.0],
    },
    margins: { gross: [36.9, 37.1, 34.8, 37.9, 39.0], operating: [18.5, 14.4, 2.5, 10.9, 12.0], net: [14.3, 18.4, 6.0, 11.5, 12.3] },
    segmentViews: [
      {
        id: "reportable", label: "ส่วนงานหลัก", labelEn: "Reportable segments", disclosure: "A",
        segments: [
          { name: "DX — เครื่องใช้ไฟฟ้า/มือถือ", short: "DX", color: "var(--c1)", rev: [166.0, 182.0, 170.0, 174.0, 178.0], opinc: [15.6, 13.2, 12.0, 13.5, 14.0], assets: [120, 128, 130, 134, 138], capex: [4.1, 4.5, 4.0, 4.2, 4.4] },
          { name: "DS — เซมิคอนดักเตอร์", short: "DS", color: "var(--c2)", rev: [94.2, 98.5, 66.6, 92.0, 110.0], opinc: [29.6, 23.8, -14.9, 15.1, 21.0], assets: [180, 205, 220, 245, 270], capex: [43.6, 47.9, 53.1, 50.0, 52.0] },
          { name: "SDC — จอแสดงผล", short: "SDC", color: "var(--c4)", rev: [31.7, 34.4, 30.9, 30.0, 31.0], opinc: [4.4, 5.9, 5.6, 4.6, 4.8], assets: [42, 45, 46, 47, 48], capex: [6.0, 5.5, 5.0, 5.2, 5.4] },
          { name: "Harman — ชิ้นส่วนยานยนต์", short: "Harman", color: "var(--c3)", rev: [10.0, 13.2, 14.4, 14.8, 15.2], opinc: [0.6, 0.9, 1.2, 1.3, 1.4], assets: [12, 13, 13, 14, 14], capex: [0.3, 0.3, 0.3, 0.3, 0.3] },
        ],
      },
      {
        id: "geo", label: "ภูมิภาค", labelEn: "By geography", disclosure: "B",
        note: "บริษัทไม่เปิดเผยกำไรจากการดำเนินงานแยกตามภูมิภาค",
        segments: [
          { name: "ทวีปอเมริกา", short: "Americas", color: "var(--c1)", rev: [102, 110, 95, 108, 114], opinc: null, assets: null, capex: null },
          { name: "เกาหลี", short: "Korea", color: "var(--c2)", rev: [50, 53, 48, 54, 57], opinc: null, assets: null, capex: null },
          { name: "จีน", short: "China", color: "var(--c3)", rev: [48, 52, 42, 48, 50], opinc: null, assets: null, capex: null },
          { name: "ยุโรป", short: "Europe", color: "var(--c4)", rev: [44, 48, 40, 46, 48], opinc: null, assets: null, capex: null },
          { name: "เอเชีย/แอฟริกา", short: "Asia/Africa", color: "var(--c6)", rev: [35, 39, 33, 44, 49], opinc: null, assets: null, capex: null },
        ],
      },
    ],
    valuation: [
      { k: "P/E", en: "ราคา/กำไร", now: 14.0, avg5: 11.8, low: 7.5, high: 19.0, peer: 16.5 },
      { k: "Forward P/E", en: "P/E ล่วงหน้า", now: 11.2, avg5: 10.5, low: 6.8, high: 16.0, peer: 14.0 },
      { k: "P/S", en: "ราคา/ยอดขาย", now: 1.5, avg5: 1.3, low: 0.9, high: 2.0, peer: 2.8 },
      { k: "P/B", en: "ราคา/มูลค่าบัญชี", now: 1.4, avg5: 1.3, low: 0.9, high: 1.9, peer: 2.1 },
      { k: "EV/EBITDA", en: "", now: 5.8, avg5: 4.9, low: 2.8, high: 7.5, peer: 8.0 },
      { k: "PEG", en: "P/E ต่อการเติบโต", now: 0.9, avg5: 1.1, low: 0.5, high: 2.0, peer: 1.4 },
    ],
    balance: {
      score: 86, label: "แข็งแกร่ง",
      items: [
        { k: "เงินสด & เทียบเท่า", en: "Cash", v: "104 ล้านล้าน ₩", good: true },
        { k: "หนี้สินรวม", en: "Total debt", v: "12 ล้านล้าน ₩", good: true },
        { k: "หนี้สินสุทธิ", en: "Net debt", v: "เงินสดสุทธิ +92T", good: true },
        { k: "อัตราส่วนทุนหมุนเวียน", en: "Current ratio", v: "2.5×", good: true },
        { k: "หนี้สิน/ทุน", en: "D/E", v: "0.05×", good: true },
      ],
    },
    analysts: { strongBuy: 18, buy: 14, hold: 9, sell: 2, strongSell: 0, targetLow: "62,000", targetAvg: "92,000", targetHigh: "120,000", nowNum: 78400, lowNum: 62000, avgNum: 92000, highNum: 120000 },
    filing: { title: "งบไตรมาส 1/2026 (Q1 FY26)", date: "เม.ย. 2026", highlight: "รายได้แผนก DS โต 31% YoY จากดีมานด์ HBM3E สำหรับ AI — gross margin ชิปกลับมาเหนือ 40%" },
    catalysts: [
      "วัฏจักรราคาหน่วยความจำ (DRAM/NAND) ขาขึ้นต่อเนื่องถึงปี 2027",
      "ส่วนแบ่ง HBM สำหรับชิป AI เพิ่มขึ้นหลังผ่านการรับรองจากลูกค้ารายใหญ่",
      "โครงการซื้อหุ้นคืนและเพิ่มเงินปันผล",
    ],
    risks: [
      "วัฏจักรชิปผันผวนสูง — ดีมานด์ AI ชะลออาจกดราคาขาลงเร็ว",
      "การแข่งขันใน foundry กับ TSMC ยังตามหลังด้านเทคโนโลยี",
      "ความเสี่ยงภูมิรัฐศาสตร์และข้อจำกัดส่งออกชิปไปจีน",
    ],
  };

  const AMAZON = {
    id: "amzn", ticker: "AMZN", exchange: "NASDAQ", country: "US", countryName: "สหรัฐอเมริกา",
    sector: "อีคอมเมิร์ซ & คลาวด์", sectorEn: "Consumer / Cloud",
    name: "Amazon.com", logoText: "a", logoColor: "#ff9900", logoInk: "#131a22",
    currency: "USD", sym: "$", unit: "พันล้าน", unitEn: "billion USD", years: YEARS,
    rating: "bull", ratingLabel: "เชิงบวก / ซื้อ",
    analysisDate: "30 พ.ค. 2026",
    price: { now: "212.40", changePct: 1.6, marketCap: "$2.22T", pe: "38.6", peFwd: "30.1", asOf: "29 พ.ค. 2026 ปิดตลาด ET" },
    summary: "AWS + โฆษณาคือเครื่องยนต์กำไร อัตรากำไรขยายตัวต่อเนื่อง กระแสเงินสดอิสระพลิกเป็นบวกชัดเจน",
    thesis: "Amazon เปลี่ยนจากบริษัทที่เน้นการเติบโตของรายได้ มาสู่การขยายอัตรากำไรอย่างมีวินัย — AWS ยังเป็นแหล่งกำไรหลัก ส่วนธุรกิจโฆษณาเติบโตสองหลักด้วยมาร์จิ้นสูง ทำให้ operating margin รวมขยับจาก 2.4% เป็นกว่า 11% กระแสเงินสดอิสระพลิกจากติดลบกลับมาเป็นบวกแข็งแกร่ง เราให้มุมมอง 'เชิงบวก'",
    verdict: {
      interesting: { label: "น่าสนใจสูง", tone: "up", detail: "กำไร + กระแสเงินสดขยายตัวเร็ว" },
      margin: { label: "อัตรากำไรดีขึ้นชัดเจน", tone: "up", detail: "Operating margin 2.4% → 11.1%" },
      mainBiz: { label: "AWS คือเครื่องยนต์กำไร", tone: "up", detail: "AWS = ~62% ของกำไรดำเนินงาน" },
      valuation: { label: "แพงแต่สมเหตุผล", tone: "neutral", detail: "P/E 38.6 ใกล้เฉลี่ย 5 ปี" },
    },
    financials: {
      revenue: [469.8, 514.0, 574.8, 638.0, 700.0],
      grossProfit: [197.5, 225.2, 270.0, 310.0, 350.0],
      operatingIncome: [24.9, 12.2, 36.9, 68.6, 78.0],
      netIncome: [33.4, -2.7, 30.4, 59.2, 65.0],
      eps: [3.24, -0.27, 2.90, 5.53, 6.10],
      fcf: [-9.1, -16.9, 36.8, 38.2, 46.0],
    },
    margins: { gross: [42.0, 43.8, 47.0, 48.6, 50.0], operating: [5.3, 2.4, 6.4, 10.8, 11.1], net: [7.1, -0.5, 5.3, 9.3, 9.3] },
    segmentViews: [
      {
        id: "reportable", label: "ส่วนงานหลัก", labelEn: "Reportable segments", disclosure: "A",
        segments: [
          { name: "North America", short: "อเมริกาเหนือ", color: "var(--c1)", rev: [279.8, 315.9, 352.8, 388.0, 422.0], opinc: [7.3, -2.8, 14.9, 25.0, 30.0], assets: null, capex: null },
          { name: "International", short: "ต่างประเทศ", color: "var(--c3)", rev: [127.8, 118.0, 131.2, 142.0, 155.0], opinc: [-0.9, -7.7, -2.7, 3.8, 6.0], assets: null, capex: null },
          { name: "AWS — คลาวด์", short: "AWS", color: "var(--c2)", rev: [62.2, 80.1, 90.8, 108.0, 123.0], opinc: [18.5, 22.8, 24.6, 39.8, 48.0], assets: null, capex: null },
        ],
      },
      {
        id: "revtype", label: "ประเภทรายได้", labelEn: "Revenue by type", disclosure: "A",
        segments: [
          { name: "Online stores", short: "ร้านค้าออนไลน์", color: "var(--c1)", rev: [222.1, 220.0, 231.9, 247.0, 262.0], opinc: null, assets: null, capex: null },
          { name: "Third-party seller services", short: "บริการผู้ขาย 3rd-party", color: "var(--c2)", rev: [103.4, 117.7, 140.1, 162.0, 184.0], opinc: null, assets: null, capex: null },
          { name: "AWS", short: "AWS", color: "var(--c6)", rev: [62.2, 80.1, 90.8, 108.0, 123.0], opinc: null, assets: null, capex: null },
          { name: "Advertising", short: "โฆษณา", color: "var(--c5)", rev: [31.2, 37.7, 46.9, 56.0, 66.0], opinc: null, assets: null, capex: null },
          { name: "Subscription services", short: "สมาชิก", color: "var(--c4)", rev: [31.8, 35.2, 40.2, 44.0, 48.0], opinc: null, assets: null, capex: null },
          { name: "Physical stores & other", short: "หน้าร้าน & อื่นๆ", color: "var(--c7)", rev: [19.1, 23.3, 24.9, 21.0, 17.0], opinc: null, assets: null, capex: null },
        ],
      },
    ],
    valuation: [
      { k: "P/E", en: "ราคา/กำไร", now: 38.6, avg5: 40.5, low: 24.0, high: 78.0, peer: 32.0 },
      { k: "Forward P/E", en: "P/E ล่วงหน้า", now: 30.1, avg5: 35.0, low: 22.0, high: 60.0, peer: 28.0 },
      { k: "P/S", en: "ราคา/ยอดขาย", now: 3.2, avg5: 3.4, low: 1.9, high: 4.6, peer: 4.0 },
      { k: "P/B", en: "ราคา/มูลค่าบัญชี", now: 7.5, avg5: 8.8, low: 5.5, high: 14.0, peer: 6.0 },
      { k: "EV/EBITDA", en: "", now: 18.0, avg5: 20.0, low: 12.0, high: 30.0, peer: 16.0 },
      { k: "PEG", en: "P/E ต่อการเติบโต", now: 1.5, avg5: 1.8, low: 1.0, high: 2.6, peer: 1.6 },
    ],
    balance: {
      score: 78, label: "แข็งแกร่ง",
      items: [
        { k: "เงินสด & เทียบเท่า", en: "Cash", v: "$88.0B", good: true },
        { k: "หนี้สินรวม", en: "Total debt", v: "$58.3B", good: null },
        { k: "หนี้สินสุทธิ", en: "Net debt", v: "เงินสดสุทธิ +$30B", good: true },
        { k: "อัตราส่วนทุนหมุนเวียน", en: "Current ratio", v: "1.1×", good: null },
        { k: "หนี้สิน/ทุน", en: "D/E", v: "0.5×", good: true },
      ],
    },
    analysts: { strongBuy: 32, buy: 18, hold: 4, sell: 0, strongSell: 0, targetLow: "180", targetAvg: "245", targetHigh: "300", nowNum: 212.4, lowNum: 180, avgNum: 245, highNum: 300 },
    filing: { title: "แบบฟอร์ม 10-Q ไตรมาส 1/2026", date: "เม.ย. 2026", highlight: "AWS โต 19% YoY แตะ $30B/ไตรมาส; โฆษณาโต 22%; FCF 12 เดือนล่าสุดทำสถิติสูงสุด" },
    catalysts: [
      "ดีมานด์ AI/Generative หนุนการใช้จ่ายบน AWS เร่งตัว",
      "ธุรกิจโฆษณามาร์จิ้นสูงเติบโตสองหลักต่อเนื่อง",
      "การลดต้นทุนเครือข่ายโลจิสติกส์เพิ่มมาร์จิ้นค้าปลีก",
    ],
    risks: [
      "การลงทุน capex สำหรับ AI สูงมาก กดดันกระแสเงินสดระยะสั้น",
      "การแข่งขันด้านคลาวด์จาก Microsoft Azure และ Google Cloud",
      "ความเสี่ยงด้านกฎระเบียบ/antitrust ในสหรัฐและยุโรป",
    ],
  };

  const ALPHABET = {
    id: "googl", ticker: "GOOGL", exchange: "NASDAQ", country: "US", countryName: "สหรัฐอเมริกา",
    sector: "โฆษณาดิจิทัล & คลาวด์", sectorEn: "Communication / Cloud",
    name: "Alphabet (Google)", logoText: "G", logoColor: "#4285f4",
    currency: "USD", sym: "$", unit: "พันล้าน", unitEn: "billion USD", years: YEARS,
    rating: "bull", ratingLabel: "เชิงบวก / ซื้อ",
    analysisDate: "30 พ.ค. 2026",
    price: { now: "176.20", changePct: 0.4, marketCap: "$2.15T", pe: "21.8", peFwd: "18.9", asOf: "29 พ.ค. 2026 ปิดตลาด ET" },
    summary: "Search ยังครองตลาด Cloud พลิกทำกำไรและเร่งตัว มาร์จิ้นแข็งแกร่ง valuation ยังไม่แพง",
    thesis: "Alphabet มีฐานกำไรจาก Google Services (Search + YouTube) ที่แข็งแกร่งและมาร์จิ้นสูง ขณะที่ Google Cloud พลิกจากขาดทุนมาเป็นกำไรและเร่งตัวจากดีมานด์ AI ทำให้กำไรรวมขยายตัวเร็วกว่ารายได้ ด้วย P/E ที่ต่ำกว่ากลุ่ม Big Tech เราจึงมองว่ายังมี upside และให้มุมมอง 'เชิงบวก'",
    verdict: {
      interesting: { label: "น่าสนใจสูง", tone: "up", detail: "กำไรโตเร็ว + valuation ไม่แพง" },
      margin: { label: "อัตรากำไรทรงตัวระดับสูง", tone: "up", detail: "Operating margin ~33%, Cloud พลิกบวก" },
      mainBiz: { label: "Search/โฆษณาคือแกนหลัก", tone: "neutral", detail: "Services = ~88% ของรายได้" },
      valuation: { label: "ถูกเมื่อเทียบกลุ่ม", tone: "up", detail: "P/E 21.8 ต่ำกว่า peer 28" },
    },
    financials: {
      revenue: [257.6, 282.8, 307.4, 350.0, 392.0],
      grossProfit: [146.7, 156.6, 174.0, 200.0, 224.0],
      operatingIncome: [78.7, 74.8, 84.3, 112.4, 128.0],
      netIncome: [76.0, 60.0, 73.8, 100.1, 110.0],
      eps: [5.61, 4.56, 5.80, 8.04, 9.10],
      fcf: [67.0, 60.0, 69.5, 72.8, 84.0],
    },
    margins: { gross: [56.9, 55.4, 56.6, 57.1, 57.1], operating: [30.6, 26.5, 27.4, 32.1, 32.7], net: [29.5, 21.2, 24.0, 28.6, 28.1] },
    segmentViews: [
      {
        id: "reportable", label: "ส่วนงานหลัก", labelEn: "Reportable segments", disclosure: "A",
        segments: [
          { name: "Google Services", short: "Services", color: "var(--c1)", rev: [237.5, 253.5, 272.5, 305.0, 338.0], opinc: [91.9, 82.7, 95.9, 121.0, 138.0], assets: null, capex: null },
          { name: "Google Cloud", short: "Cloud", color: "var(--c2)", rev: [19.2, 26.3, 33.1, 43.0, 53.0], opinc: [-3.1, -2.6, 1.7, 6.1, 9.5], assets: null, capex: null },
          { name: "Other Bets", short: "Other Bets", color: "var(--c3)", rev: [0.75, 1.07, 1.53, 1.8, 2.0], opinc: [-4.5, -4.6, -4.1, -4.0, -3.5], assets: null, capex: null },
        ],
      },
      {
        id: "revline", label: "แหล่งรายได้", labelEn: "Revenue by line", disclosure: "A",
        segments: [
          { name: "Google Search & other", short: "Search", color: "var(--c1)", rev: [148.9, 162.4, 175.0, 198.0, 220.0], opinc: null, assets: null, capex: null },
          { name: "YouTube ads", short: "YouTube", color: "var(--c5)", rev: [28.8, 29.2, 31.5, 36.0, 41.0], opinc: null, assets: null, capex: null },
          { name: "Google Network", short: "Network", color: "var(--c7)", rev: [31.7, 32.8, 31.3, 30.5, 30.0], opinc: null, assets: null, capex: null },
          { name: "Google Cloud", short: "Cloud", color: "var(--c2)", rev: [19.2, 26.3, 33.1, 43.0, 53.0], opinc: null, assets: null, capex: null },
          { name: "Subscriptions & devices", short: "Subs/devices", color: "var(--c4)", rev: [28.0, 29.0, 34.7, 40.7, 46.0], opinc: null, assets: null, capex: null },
        ],
      },
    ],
    valuation: [
      { k: "P/E", en: "ราคา/กำไร", now: 21.8, avg5: 23.5, low: 17.0, high: 30.0, peer: 28.0 },
      { k: "Forward P/E", en: "P/E ล่วงหน้า", now: 18.9, avg5: 20.0, low: 15.0, high: 26.0, peer: 25.0 },
      { k: "P/S", en: "ราคา/ยอดขาย", now: 5.5, avg5: 5.8, low: 4.0, high: 7.5, peer: 6.5 },
      { k: "P/B", en: "ราคา/มูลค่าบัญชี", now: 6.2, avg5: 5.9, low: 4.0, high: 8.0, peer: 6.0 },
      { k: "EV/EBITDA", en: "", now: 14.5, avg5: 15.5, low: 11.0, high: 21.0, peer: 17.0 },
      { k: "PEG", en: "P/E ต่อการเติบโต", now: 1.2, avg5: 1.5, low: 0.9, high: 2.2, peer: 1.6 },
    ],
    balance: {
      score: 94, label: "แข็งแกร่งมาก",
      items: [
        { k: "เงินสด & เทียบเท่า", en: "Cash", v: "$110.0B", good: true },
        { k: "หนี้สินรวม", en: "Total debt", v: "$13.2B", good: true },
        { k: "หนี้สินสุทธิ", en: "Net debt", v: "เงินสดสุทธิ +$97B", good: true },
        { k: "อัตราส่วนทุนหมุนเวียน", en: "Current ratio", v: "2.1×", good: true },
        { k: "หนี้สิน/ทุน", en: "D/E", v: "0.06×", good: true },
      ],
    },
    analysts: { strongBuy: 28, buy: 16, hold: 6, sell: 1, strongSell: 0, targetLow: "150", targetAvg: "205", targetHigh: "240", nowNum: 176.2, lowNum: 150, avgNum: 205, highNum: 240 },
    filing: { title: "แบบฟอร์ม 10-Q ไตรมาส 1/2026", date: "เม.ย. 2026", highlight: "Google Cloud โต 28% YoY มาร์จิ้นแตะ 18%; backlog สัญญาคลาวด์ทำสถิติใหม่จากดีมานด์ Gemini" },
    catalysts: [
      "Google Cloud เร่งตัวและขยายมาร์จิ้นจากดีมานด์ AI",
      "การผนวก Gemini เข้ากับ Search/Workspace เพิ่มมูลค่าโฆษณา",
      "การควบคุมต้นทุนและซื้อหุ้นคืนขนาดใหญ่",
    ],
    risks: [
      "คดี antitrust ในสหรัฐอาจกระทบโครงสร้างธุรกิจ Search",
      "การ disrupt จาก AI search ต่อโมเดลโฆษณาเดิม",
      "การพึ่งพารายได้โฆษณาเป็นสัดส่วนสูง",
    ],
  };

  const TENCENT = {
    id: "0700.hk", ticker: "0700.HK", exchange: "HKEX", country: "HK", countryName: "ฮ่องกง / จีน",
    sector: "เกม · โซเชียล · ฟินเทค", sectorEn: "Internet / Conglomerate",
    name: "Tencent Holdings", logoText: "T", logoColor: "#1296db",
    currency: "CNY", sym: "¥", unit: "พันล้าน", unitEn: "billion CNY", years: YEARS,
    rating: "neutral", ratingLabel: "ถือ / เป็นกลาง",
    analysisDate: "30 พ.ค. 2026",
    priceCcy: "HKD",
    price: { now: "HK$402", changePct: -0.6, marketCap: "HK$3.7T", pe: "17.5", peFwd: "15.2", asOf: "29 พ.ค. 2026 ปิดตลาด HKT" },
    fxNote: "ราคาซื้อขายเป็น HKD · งบการเงินรายงานเป็น CNY (RMB)",
    summary: "เกม + FinTech ฟื้นตัว โฆษณาเร่งจาก video accounts กำไรหลักโตดี แต่กำไรสุทธิผันผวนจากพอร์ตลงทุน",
    thesis: "Tencent มีแกนกำไรจากเกมและบริการเพิ่มมูลค่า (VAS) ที่ฟื้นตัว พร้อมธุรกิจ FinTech & Business Services และโฆษณา (หนุนโดย Video Accounts) ที่เติบโตด้วยมาร์จิ้นดีขึ้น อย่างไรก็ตามกำไรสุทธิ 'รายงาน' ผันผวนสูงจากการตีมูลค่าพอร์ตการลงทุน ทำให้ควรดู 'กำไรหลัก' มากกว่า เราให้มุมมอง 'เป็นกลาง'",
    verdict: {
      interesting: { label: "น่าสนใจระดับกลาง", tone: "neutral", detail: "กำไรหลักฟื้น แต่ความเสี่ยงเชิงนโยบาย" },
      margin: { label: "อัตรากำไรกำลังดีขึ้น", tone: "up", detail: "Gross margin 43% → 51%" },
      mainBiz: { label: "VAS (เกม) + FinTech", tone: "neutral", detail: "เกมยังเป็นแหล่งกำไรหลัก" },
      valuation: { label: "ใกล้เคียงมูลค่าเหมาะสม", tone: "neutral", detail: "P/E 17.5 ใกล้เฉลี่ย 5 ปี" },
    },
    financials: {
      revenue: [560.1, 554.6, 609.0, 660.3, 712.0],
      grossProfit: [246.0, 240.2, 290.0, 330.0, 365.0],
      operatingIncome: [155.0, 140.0, 180.0, 220.0, 250.0],
      netIncome: [224.8, 188.2, 115.2, 194.1, 210.0],
      eps: [23.4, 19.6, 12.1, 20.9, 23.0],
      fcf: [100.0, 95.0, 150.0, 170.0, 185.0],
    },
    margins: { gross: [43.9, 43.3, 47.6, 50.0, 51.3], operating: [27.7, 25.2, 29.6, 33.3, 35.1], net: [40.1, 33.9, 18.9, 29.4, 29.5] },
    segmentViews: [
      {
        id: "reportable", label: "ส่วนงานหลัก", labelEn: "Reportable segments", disclosure: "A",
        note: "Tencent ไม่เปิดเผยกำไรดำเนินงานแยกตามส่วนงานอย่างละเอียด (เปิดเผยเฉพาะรายได้และ gross profit)",
        segments: [
          { name: "VAS — เกม & โซเชียล", short: "VAS", color: "var(--c1)", rev: [291.6, 287.6, 298.4, 312.0, 330.0], opinc: null, assets: null, capex: null },
          { name: "FinTech & Business Services", short: "FinTech/Biz", color: "var(--c2)", rev: [172.2, 177.1, 203.8, 218.0, 232.0], opinc: null, assets: null, capex: null },
          { name: "Online Advertising", short: "โฆษณา", color: "var(--c5)", rev: [88.6, 82.7, 101.5, 118.0, 130.0], opinc: null, assets: null, capex: null },
          { name: "Others", short: "อื่นๆ", color: "var(--c7)", rev: [7.7, 7.2, 5.3, 12.3, 20.0], opinc: null, assets: null, capex: null },
        ],
      },
    ],
    valuation: [
      { k: "P/E", en: "ราคา/กำไร", now: 17.5, avg5: 18.0, low: 9.0, high: 35.0, peer: 16.0 },
      { k: "Forward P/E", en: "P/E ล่วงหน้า", now: 15.2, avg5: 16.5, low: 8.5, high: 28.0, peer: 14.5 },
      { k: "P/S", en: "ราคา/ยอดขาย", now: 4.8, avg5: 5.5, low: 3.0, high: 9.0, peer: 4.5 },
      { k: "P/B", en: "ราคา/มูลค่าบัญชี", now: 3.4, avg5: 3.8, low: 2.2, high: 6.0, peer: 3.0 },
      { k: "EV/EBITDA", en: "", now: 11.0, avg5: 12.5, low: 7.0, high: 20.0, peer: 10.5 },
      { k: "PEG", en: "P/E ต่อการเติบโต", now: 1.1, avg5: 1.3, low: 0.6, high: 2.4, peer: 1.2 },
    ],
    balance: {
      score: 80, label: "แข็งแกร่ง",
      items: [
        { k: "เงินสด & เทียบเท่า", en: "Cash", v: "¥330B", good: true },
        { k: "หนี้สินรวม", en: "Total debt", v: "¥360B", good: null },
        { k: "หนี้สินสุทธิ", en: "Net debt", v: "¥30B", good: null },
        { k: "อัตราส่วนทุนหมุนเวียน", en: "Current ratio", v: "1.5×", good: true },
        { k: "หนี้สิน/ทุน", en: "D/E", v: "0.4×", good: true },
      ],
    },
    analysts: { strongBuy: 24, buy: 12, hold: 5, sell: 1, strongSell: 0, targetLow: "320", targetAvg: "460", targetHigh: "560", nowNum: 402, lowNum: 320, avgNum: 460, highNum: 560 },
    filing: { title: "งบไตรมาส 1/2026", date: "พ.ค. 2026", highlight: "รายได้โฆษณาโต 18% จาก Video Accounts; รายได้เกมต่างประเทศทำสถิติใหม่; กำไรหลักโตเร็วกว่ารายได้" },
    catalysts: [
      "เกมใหม่และเกมต่างประเทศหนุนการเติบโตของ VAS",
      "โฆษณาบน Video Accounts (วิดีโอสั้น) เร่งตัวด้วยมาร์จิ้นสูง",
      "การคืนทุนผู้ถือหุ้นผ่านการซื้อหุ้นคืนต่อเนื่อง",
    ],
    risks: [
      "ความเสี่ยงเชิงนโยบาย/กฎระเบียบจากทางการจีน",
      "กำไรสุทธิรายงานผันผวนตามมูลค่าพอร์ตการลงทุน",
      "การแข่งขันด้านวิดีโอสั้นจาก ByteDance/Douyin",
    ],
  };

  const AOT = {
    id: "aot.bk", ticker: "AOT.BK", exchange: "SET", country: "TH", countryName: "ไทย",
    sector: "ท่าอากาศยาน (ธุรกิจเดียว)", sectorEn: "Airport operations",
    name: "ท่าอากาศยานไทย", nameEn: "Airports of Thailand", logoText: "AOT", logoColor: "#102a6b",
    currency: "THB", sym: "฿", unit: "พันล้าน", unitEn: "billion THB", years: YEARS,
    rating: "bear", ratingLabel: "เชิงลบ / ระวัง",
    analysisDate: "30 พ.ค. 2026",
    summary: "ฟื้นตัวเต็มจากนักท่องเที่ยวกลับมา แต่ valuation แพงมากเทียบประวัติและความเสี่ยงสัมปทานร้านค้า",
    thesis: "AOT เป็นธุรกิจเดียว (ท่าอากาศยาน) ที่ฟื้นตัวเต็มที่จากการกลับมาของนักท่องเที่ยว กำไรพลิกจากขาดทุนช่วงโควิดกลับมาเป็นบวกแข็งแกร่ง อย่างไรก็ตามราคาหุ้นซื้อขายที่ P/E สูงมากเมื่อเทียบประวัติ บวกกับความไม่แน่นอนของสัญญาสัมปทานร้านค้าปลอดภาษี (duty-free) ทำให้ความเสี่ยงขาลงสูง เราให้มุมมอง 'เชิงลบ'",
    verdict: {
      interesting: { label: "ความเสี่ยงสูงกว่าผลตอบแทน", tone: "down", detail: "ฟื้นตัวสะท้อนในราคาแล้ว" },
      margin: { label: "อัตรากำไรพลิกเป็นบวก", tone: "up", detail: "Net margin ติดลบ → +32%" },
      mainBiz: { label: "ธุรกิจเดียว: ท่าอากาศยาน", tone: "neutral", detail: "Aero 55% · Non-aero 45%" },
      valuation: { label: "แพงมากเทียบอดีต", tone: "down", detail: "P/E 38 vs เฉลี่ยก่อนโควิด ~30" },
    },
    financials: {
      revenue: [9.4, 28.3, 49.7, 67.0, 72.0],
      grossProfit: [null, null, null, null, null],
      operatingIncome: [-16.0, -8.0, 12.0, 22.0, 26.0],
      netIncome: [-16.3, -11.1, 8.8, 19.2, 23.0],
      eps: [-1.14, -0.78, 0.62, 1.34, 1.61],
      fcf: [-5.0, 2.0, 14.0, 20.0, 24.0],
    },
    margins: { gross: [null, null, null, null, null], operating: [-170.2, -28.3, 24.1, 32.8, 36.1], net: [-173.4, -39.2, 17.7, 28.7, 31.9] },
    segmentViews: [
      {
        id: "revtype", label: "ประเภทรายได้", labelEn: "Revenue by type", disclosure: "B",
        note: "บริษัทไม่เปิดเผยกำไรดำเนินงานแยกตามประเภทรายได้",
        segments: [
          { name: "Aeronautical — ค่าธรรมเนียมการบิน", short: "Aero", color: "var(--c1)", rev: [4.0, 14.0, 26.0, 36.0, 39.0], opinc: null, assets: null, capex: null },
          { name: "Non-aeronautical — ร้านค้า/เช่าพื้นที่", short: "Non-aero", color: "var(--c3)", rev: [5.4, 14.3, 23.7, 31.0, 33.0], opinc: null, assets: null, capex: null },
        ],
      },
    ],
    valuation: [
      { k: "P/E", en: "ราคา/กำไร", now: 38.0, avg5: 30.0, low: 22.0, high: 55.0, peer: 24.0 },
      { k: "Forward P/E", en: "P/E ล่วงหน้า", now: 32.0, avg5: 28.0, low: 20.0, high: 45.0, peer: 22.0 },
      { k: "P/S", en: "ราคา/ยอดขาย", now: 11.0, avg5: 9.0, low: 5.0, high: 18.0, peer: 6.0 },
      { k: "P/B", en: "ราคา/มูลค่าบัญชี", now: 5.5, avg5: 4.5, low: 3.0, high: 8.0, peer: 3.5 },
      { k: "EV/EBITDA", en: "", now: 22.0, avg5: 18.0, low: 12.0, high: 30.0, peer: 14.0 },
      { k: "PEG", en: "P/E ต่อการเติบโต", now: 2.4, avg5: 1.8, low: 1.0, high: 3.5, peer: 1.5 },
    ],
    balance: {
      score: 62, label: "ปานกลาง",
      items: [
        { k: "เงินสด & เทียบเท่า", en: "Cash", v: "฿35B", good: true },
        { k: "หนี้สินรวม", en: "Total debt", v: "฿58B", good: null },
        { k: "หนี้สินสุทธิ", en: "Net debt", v: "฿23B", good: null },
        { k: "อัตราส่วนทุนหมุนเวียน", en: "Current ratio", v: "1.3×", good: true },
        { k: "หนี้สิน/ทุน", en: "D/E", v: "0.6×", good: null },
      ],
    },
    analysts: { strongBuy: 3, buy: 5, hold: 11, sell: 6, strongSell: 2, targetLow: "38", targetAvg: "52", targetHigh: "68", nowNum: 61, lowNum: 38, avgNum: 52, highNum: 68 },
    priceTop: { now: "฿61.00", changePct: 0.8, marketCap: "฿872B", pe: "38.0", peFwd: "32.0", asOf: "29 พ.ค. 2026 ปิดตลาด SET" },
    filing: { title: "งบไตรมาส 2/2569 (Q2 FY26)", date: "พ.ค. 2026", highlight: "ผู้โดยสารฟื้นตัวเกินระดับก่อนโควิด แต่รายได้ duty-free ต่อหัวลดลงจากการเจรจาสัมปทานใหม่" },
    catalysts: [
      "จำนวนนักท่องเที่ยวต่างชาติทำสถิติสูงสุดใหม่",
      "การเปิดอาคารผู้โดยสารส่วนต่อขยายเพิ่มความจุ",
      "การปรับขึ้นค่าธรรมเนียมผู้โดยสาร (PSC)",
    ],
    risks: [
      "Valuation แพงมากเทียบประวัติ — ความเสี่ยงขาลงสูง",
      "ความไม่แน่นอนของสัญญาสัมปทาน duty-free กระทบรายได้ non-aero",
      "พึ่งพาการท่องเที่ยวสูง อ่อนไหวต่อเศรษฐกิจโลก/เหตุการณ์ไม่คาดฝัน",
    ],
  };

  // AOT uses priceTop for the snapshot
  AOT.price = AOT.priceTop;

  window.LL_DATA = {
    years: YEARS,
    companies: [SAMSUNG, AMAZON, ALPHABET, TENCENT, AOT],
  };
})();
