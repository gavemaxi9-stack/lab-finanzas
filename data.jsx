// AVANT MARKETS — mock data with fictional tickers

// Deterministic pseudo-random walk for chart data
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSeries(seed, points, start, volatility, drift) {
  const rand = seededRandom(seed);
  const data = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    const noise = (rand() - 0.5) * volatility;
    v = v + noise + drift;
    data.push(v);
  }
  return data;
}

// Generate longer series for sparklines / different timeframes
function generateChartSeries(seed) {
  return {
    "1H": generateSeries(seed + 1, 60, 100, 0.3, 0.005),
    "4H": generateSeries(seed + 2, 80, 100, 0.6, 0.01),
    "1D": generateSeries(seed + 3, 80, 100, 1.2, 0.015),
    "1S": generateSeries(seed + 4, 80, 100, 2.5, -0.005),
  };
}

const TICKERS = {
  NVRA: {
    ticker: "NVRA",
    name: "Novara Technologies",
    exchange: "NASDAQ",
    sector: "Tecnología",
    price: 198.42,
    change: 1.62,
    changePct: 0.82,
    marketCap: "3,02 B USD",
    volume: "54,21 M",
    pe: "28,74",
    dividend: "0,96%",
    beta: "1,21",
    accent: "#c8ff1f",
    series: generateChartSeries(42),
  },
  HLIX: {
    ticker: "HLIX",
    name: "Helix Robotics",
    exchange: "NYSE",
    sector: "Industrial",
    price: 87.55,
    change: -1.24,
    changePct: -1.40,
    marketCap: "142,8 B USD",
    volume: "22,4 M",
    pe: "41,02",
    dividend: "0,00%",
    beta: "1,68",
    accent: "#c8ff1f",
    series: generateChartSeries(11),
  },
  ATLS: {
    ticker: "ATLS",
    name: "Atlas Energy Corp.",
    exchange: "NYSE",
    sector: "Energía",
    price: 64.18,
    change: 0.72,
    changePct: 1.13,
    marketCap: "98,4 B USD",
    volume: "18,9 M",
    pe: "12,40",
    dividend: "3,84%",
    beta: "0,94",
    accent: "#c8ff1f",
    series: generateChartSeries(73),
  },
  KORE: {
    ticker: "KORE",
    name: "Korevolt Materials",
    exchange: "NASDAQ",
    sector: "Materiales",
    price: 312.05,
    change: 4.18,
    changePct: 1.36,
    marketCap: "78,9 B USD",
    volume: "12,2 M",
    pe: "33,18",
    dividend: "0,40%",
    beta: "1,42",
    accent: "#c8ff1f",
    series: generateChartSeries(95),
  },
  PXSE: {
    ticker: "PXSE",
    name: "Pulsar Systems",
    exchange: "NASDAQ",
    sector: "Tecnología",
    price: 142.89,
    change: -2.31,
    changePct: -1.59,
    marketCap: "210,6 B USD",
    volume: "34,5 M",
    pe: "52,11",
    dividend: "0,00%",
    beta: "1,55",
    accent: "#c8ff1f",
    series: generateChartSeries(120),
  },
  VRDA: {
    ticker: "VRDA",
    name: "Verda Biosciences",
    exchange: "NASDAQ",
    sector: "Salud",
    price: 56.40,
    change: 0.85,
    changePct: 1.53,
    marketCap: "44,1 B USD",
    volume: "8,8 M",
    pe: "—",
    dividend: "0,00%",
    beta: "1,22",
    accent: "#c8ff1f",
    series: generateChartSeries(8),
  },
  ZNTH: {
    ticker: "ZNTH",
    name: "Zenith Capital Group",
    exchange: "NYSE",
    sector: "Financiero",
    price: 178.22,
    change: 1.10,
    changePct: 0.62,
    marketCap: "126,3 B USD",
    volume: "9,1 M",
    pe: "14,82",
    dividend: "2,10%",
    beta: "0,88",
    accent: "#c8ff1f",
    series: generateChartSeries(54),
  },
  ORBT: {
    ticker: "ORBT",
    name: "Orbital Dynamics",
    exchange: "NASDAQ",
    sector: "Aeroespacial",
    price: 248.30,
    change: 6.12,
    changePct: 2.53,
    marketCap: "62,5 B USD",
    volume: "5,4 M",
    pe: "61,90",
    dividend: "0,00%",
    beta: "1,72",
    accent: "#c8ff1f",
    series: generateChartSeries(33),
  },
};

const PORTFOLIO = {
  totalValue: 248_392.18,
  todayChange: 1_842.55,
  todayChangePct: 0.75,
  allTimeReturn: 38_124.40,
  allTimeReturnPct: 18.13,
  cashAvailable: 12_480.32,
  holdings: [
    { ticker: "NVRA", qty: 142, avgCost: 152.40 },
    { ticker: "HLIX", qty: 320, avgCost: 92.15 },
    { ticker: "KORE", qty: 58, avgCost: 268.10 },
    { ticker: "ATLS", qty: 410, avgCost: 58.22 },
    { ticker: "PXSE", qty: 88, avgCost: 156.80 },
    { ticker: "VRDA", qty: 220, avgCost: 48.90 },
    { ticker: "ORBT", qty: 32, avgCost: 195.00 },
    { ticker: "ZNTH", qty: 75, avgCost: 168.40 },
  ],
};

const ACTIVITY = [
  { type: "buy",  ticker: "ORBT", qty: 12, price: 246.10, time: "Hoy · 10:42" },
  { type: "div",  ticker: "ATLS", qty: 410, amount: 156.20, time: "Hoy · 09:00" },
  { type: "sell", ticker: "PXSE", qty: 20, price: 148.30, time: "Ayer · 15:18" },
  { type: "buy",  ticker: "VRDA", qty: 50, price: 54.80, time: "Ayer · 11:05" },
  { type: "buy",  ticker: "KORE", qty: 8, price: 308.90, time: "16 may · 14:22" },
  { type: "div",  ticker: "ZNTH", qty: 75, amount: 84.40, time: "15 may · 09:00" },
];

const NEWS_BY_TICKER = {
  NVRA: [
    { tag: "Empresa",        title: "Novara presenta su nuevo modelo de IA generativa en la conferencia anual", time: "Hace 2 horas", hue: 280 },
    { tag: "Productos",      title: "La demanda del Aurora X7 supera las expectativas en el segundo trimestre",   time: "Hace 5 horas", hue: 220 },
    { tag: "Sostenibilidad", title: "Novara alcanza la neutralidad de carbono en toda su cadena de suministro",   time: "Hace 1 día",   hue: 140 },
  ],
};

// Calculate computed portfolio values
function buildPortfolio() {
  const enriched = PORTFOLIO.holdings.map(h => {
    const t = TICKERS[h.ticker];
    const value = t.price * h.qty;
    const cost = h.avgCost * h.qty;
    const pl = value - cost;
    const plPct = (pl / cost) * 100;
    return { ...h, info: t, value, cost, pl, plPct };
  });
  const sumValue = enriched.reduce((s, h) => s + h.value, 0);
  enriched.forEach(h => h.weight = (h.value / sumValue) * 100);
  enriched.sort((a, b) => b.value - a.value);
  return { ...PORTFOLIO, holdings: enriched, computedTotal: sumValue };
}

// Number formatting (Spanish locale)
function fmtMoney(n, decimals = 2) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtSigned(n, decimals = 2) {
  const sign = n >= 0 ? "+" : "−";
  return sign + Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtPct(n, decimals = 2) {
  const sign = n >= 0 ? "+" : "−";
  return sign + Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + "%";
}

// Sparkline path from values
function sparkPath(values, w = 96, h = 30) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pad = 2;
  const usableH = h - pad * 2;
  return values
    .map((v, i) => {
      const x = i * step;
      const y = pad + usableH - ((v - min) / range) * usableH;
      return (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    })
    .join(" ");
}

Object.assign(window, {
  TICKERS, PORTFOLIO, ACTIVITY, NEWS_BY_TICKER,
  buildPortfolio, fmtMoney, fmtSigned, fmtPct, sparkPath,
});
