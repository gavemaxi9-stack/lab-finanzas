import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tickers: defineTable({
    ticker: v.string(),
    name: v.string(),
    exchange: v.string(),
    sector: v.string(),
    price: v.number(),
    change: v.number(),
    changePct: v.number(),
    marketCap: v.string(),
    volume: v.string(),
    pe: v.string(),
    dividend: v.string(),
    beta: v.string(),
    accent: v.string(),
    series: v.record(v.string(), v.array(v.number())),
    updatedAt: v.optional(v.number()),
    source: v.optional(v.string()),
    // Timestamp de la última escritura con datos REALES por timeframe (no el
    // placeholder de seed.ts). Ausente = esa serie nunca recibió datos reales
    // todavía; la UI lo usa para mostrar "datos de muestra" en vez de fingir
    // que el gráfico es en vivo.
    seriesUpdatedAt: v.optional(v.record(v.string(), v.number())),
  }).index("by_ticker", ["ticker"]),

  holdings: defineTable({
    ticker: v.string(),
    qty: v.number(),
    avgCost: v.number(),
  }).index("by_ticker", ["ticker"]),

  accountSummary: defineTable({
    totalValue: v.number(),
    todayChange: v.number(),
    todayChangePct: v.number(),
    allTimeReturn: v.number(),
    allTimeReturnPct: v.number(),
    cashAvailable: v.number(),
  }),

  activity: defineTable({
    type: v.union(v.literal("buy"), v.literal("sell"), v.literal("div")),
    ticker: v.string(),
    qty: v.number(),
    price: v.optional(v.number()),
    amount: v.optional(v.number()),
    time: v.string(),
  }),

  news: defineTable({
    ticker: v.string(),
    tag: v.string(),
    title: v.string(),
    time: v.string(),
    hue: v.number(),
  }).index("by_ticker", ["ticker"]),
});
