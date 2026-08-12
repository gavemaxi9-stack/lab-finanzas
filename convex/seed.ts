import { internalMutation } from "./_generated/server";

// Deterministic pseudo-random walk for chart data
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSeries(seed: number, points: number, start: number, volatility: number, drift: number) {
  const rand = seededRandom(seed);
  const data: number[] = [];
  let v = start;
  for (let i = 0; i < points; i++) {
    const noise = (rand() - 0.5) * volatility;
    v = v + noise + drift;
    data.push(v);
  }
  return data;
}

function generateChartSeries(seed: number) {
  return {
    "1H": generateSeries(seed + 1, 60, 100, 0.3, 0.005),
    "4H": generateSeries(seed + 2, 80, 100, 0.6, 0.01),
    "1D": generateSeries(seed + 3, 80, 100, 1.2, 0.015),
    "1S": generateSeries(seed + 4, 80, 100, 2.5, -0.005),
  };
}

// Tickers reales del S&P 500. price/change/changePct/marketCap/volume/pe/dividend/beta
// son placeholders iniciales — los sobrescriben los crons de convex/marketData.ts
// (cotizaciones en vivo y fundamentals) una vez configuradas las API keys.
const TICKERS_SEED = [
  { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Tecnología", price: 230.00, change: 1.62, changePct: 0.71, marketCap: "3,50 B USD", volume: "54,21 M", pe: "34,10", dividend: "0,44%", beta: "1,20", accent: "#c8ff1f", seed: 42 },
  { ticker: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Tecnología", price: 430.00, change: -1.24, changePct: -0.29, marketCap: "3,20 B USD", volume: "22,4 M", pe: "36,80", dividend: "0,68%", beta: "0,90", accent: "#c8ff1f", seed: 11 },
  { ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", sector: "Tecnología", price: 140.00, change: 2.72, changePct: 1.98, marketCap: "3,40 B USD", volume: "180,9 M", pe: "55,40", dividend: "0,03%", beta: "1,70", accent: "#c8ff1f", seed: 73 },
  { ticker: "AMZN", name: "Amazon.com, Inc.", exchange: "NASDAQ", sector: "Consumo discrecional", price: 200.00, change: 4.18, changePct: 2.13, marketCap: "2,10 B USD", volume: "42,2 M", pe: "40,10", dividend: "0,00%", beta: "1,30", accent: "#c8ff1f", seed: 95 },
  { ticker: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", sector: "Servicios de comunicación", price: 180.00, change: -2.31, changePct: -1.27, marketCap: "2,20 B USD", volume: "34,5 M", pe: "24,60", dividend: "0,44%", beta: "1,05", accent: "#c8ff1f", seed: 120 },
  { ticker: "META", name: "Meta Platforms, Inc.", exchange: "NASDAQ", sector: "Servicios de comunicación", price: 600.00, change: 0.85, changePct: 0.14, marketCap: "1,50 B USD", volume: "8,8 M", pe: "27,90", dividend: "0,35%", beta: "1,25", accent: "#c8ff1f", seed: 8 },
  { ticker: "TSLA", name: "Tesla, Inc.", exchange: "NASDAQ", sector: "Consumo discrecional", price: 350.00, change: 6.12, changePct: 1.78, marketCap: "1,10 B USD", volume: "95,1 M", pe: "110,20", dividend: "0,00%", beta: "2,10", accent: "#c8ff1f", seed: 33 },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", sector: "Financiero", price: 230.00, change: 1.10, changePct: 0.48, marketCap: "660,3 B USD", volume: "9,1 M", pe: "13,80", dividend: "2,10%", beta: "1,00", accent: "#c8ff1f", seed: 54 },
  { ticker: "V", name: "Visa Inc.", exchange: "NYSE", sector: "Financiero", price: 310.00, change: -0.90, changePct: -0.29, marketCap: "620,0 B USD", volume: "6,3 M", pe: "30,50", dividend: "0,70%", beta: "0,95", accent: "#c8ff1f", seed: 61 },
  { ticker: "XOM", name: "Exxon Mobil Corporation", exchange: "NYSE", sector: "Energía", price: 115.00, change: 0.72, changePct: 0.63, marketCap: "480,4 B USD", volume: "18,9 M", pe: "12,40", dividend: "3,60%", beta: "0,90", accent: "#c8ff1f", seed: 17 },
  { ticker: "JNJ", name: "Johnson & Johnson", exchange: "NYSE", sector: "Salud", price: 155.00, change: 0.55, changePct: 0.36, marketCap: "370,2 B USD", volume: "6,5 M", pe: "22,90", dividend: "3,10%", beta: "0,55", accent: "#c8ff1f", seed: 88 },
  { ticker: "UNH", name: "UnitedHealth Group Incorporated", exchange: "NYSE", sector: "Salud", price: 500.00, change: -3.20, changePct: -0.64, marketCap: "460,8 B USD", volume: "3,4 M", pe: "18,60", dividend: "1,80%", beta: "0,70", accent: "#c8ff1f", seed: 5 },
  { ticker: "PG", name: "The Procter & Gamble Company", exchange: "NYSE", sector: "Consumo básico", price: 165.00, change: 0.30, changePct: 0.18, marketCap: "390,0 B USD", volume: "5,8 M", pe: "25,30", dividend: "2,40%", beta: "0,40", accent: "#c8ff1f", seed: 29 },
  { ticker: "HD", name: "The Home Depot, Inc.", exchange: "NYSE", sector: "Consumo discrecional", price: 380.00, change: 2.05, changePct: 0.54, marketCap: "375,6 B USD", volume: "3,1 M", pe: "26,70", dividend: "2,20%", beta: "1,00", accent: "#c8ff1f", seed: 103 },
  { ticker: "CAT", name: "Caterpillar Inc.", exchange: "NYSE", sector: "Industrial", price: 380.00, change: -1.80, changePct: -0.47, marketCap: "190,3 B USD", volume: "2,4 M", pe: "17,90", dividend: "1,50%", beta: "1,15", accent: "#c8ff1f", seed: 66 },
];

const HOLDINGS_SEED = [
  { ticker: "AAPL", qty: 142, avgCost: 195.40 },
  { ticker: "NVDA", qty: 320, avgCost: 118.15 },
  { ticker: "META", qty: 58, avgCost: 520.10 },
  { ticker: "TSLA", qty: 90, avgCost: 210.22 },
  { ticker: "AMZN", qty: 88, avgCost: 168.80 },
  { ticker: "UNH", qty: 20, avgCost: 480.90 },
  { ticker: "CAT", qty: 32, avgCost: 350.00 },
  { ticker: "JPM", qty: 75, avgCost: 198.40 },
];

const ACTIVITY_SEED = [
  { type: "buy" as const, ticker: "TSLA", qty: 12, price: 346.10, time: "Hoy · 10:42" },
  { type: "div" as const, ticker: "JPM", qty: 75, amount: 156.20, time: "Hoy · 09:00" },
  { type: "sell" as const, ticker: "AMZN", qty: 20, price: 198.30, time: "Ayer · 15:18" },
  { type: "buy" as const, ticker: "UNH", qty: 5, price: 494.80, time: "Ayer · 11:05" },
  { type: "buy" as const, ticker: "META", qty: 8, price: 588.90, time: "16 may · 14:22" },
  { type: "div" as const, ticker: "CAT", qty: 32, amount: 84.40, time: "15 may · 09:00" },
];

const NEWS_SEED = [
  { ticker: "AAPL", tag: "Empresa", title: "Apple presenta mejoras de IA generativa en su próxima actualización de software", time: "Hace 2 horas", hue: 280 },
  { ticker: "AAPL", tag: "Productos", title: "La demanda del último iPhone supera las expectativas en el trimestre", time: "Hace 5 horas", hue: 220 },
  { ticker: "AAPL", tag: "Sostenibilidad", title: "Apple avanza en su meta de neutralidad de carbono en toda su cadena de suministro", time: "Hace 1 día", hue: 140 },
];

// internalMutation: solo invocable desde `npx convex run` (CLI autenticado) o
// desde otras funciones de Convex — nunca desde el cliente público del navegador.
// Antes era una `mutation` pública, lo que permitía a cualquiera con la URL de
// Convex (expuesta en el bundle vía VITE_CONVEX_URL) borrar y resembrar toda la base.
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const tables = ["tickers", "holdings", "accountSummary", "activity", "news"] as const;
    for (const table of tables) {
      const rows = await ctx.db.query(table).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    for (const t of TICKERS_SEED) {
      const { seed: tickerSeed, ...rest } = t;
      await ctx.db.insert("tickers", { ...rest, series: generateChartSeries(tickerSeed) });
    }

    for (const h of HOLDINGS_SEED) {
      await ctx.db.insert("holdings", h);
    }

    await ctx.db.insert("accountSummary", {
      totalValue: 248_392.18,
      todayChange: 1_842.55,
      todayChangePct: 0.75,
      allTimeReturn: 38_124.40,
      allTimeReturnPct: 18.13,
      cashAvailable: 12_480.32,
    });

    for (const a of ACTIVITY_SEED) {
      await ctx.db.insert("activity", a);
    }

    for (const n of NEWS_SEED) {
      await ctx.db.insert("news", n);
    }

    return { ok: true };
  },
});
