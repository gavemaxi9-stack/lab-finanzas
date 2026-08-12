import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";

// Recomputes portfolio aggregates from live ticker prices on every read, so
// "Hoy" / "Rendimiento total" never drift out of sync with the live-priced
// holdings table (they used to come from a static seeded row).
async function computeHoldings(ctx: QueryCtx) {
  const holdings = await ctx.db.query("holdings").collect();
  const tickers = await ctx.db.query("tickers").collect();
  const byTicker = Object.fromEntries(tickers.map((t) => [t.ticker, t]));

  const enriched = holdings
    .filter((h) => byTicker[h.ticker])
    .map((h) => {
      const info = byTicker[h.ticker];
      const value = info.price * h.qty;
      const cost = h.avgCost * h.qty;
      const pl = value - cost;
      const plPct = cost ? (pl / cost) * 100 : 0;
      const todayChange = info.change * h.qty;
      return { ...h, info, value, cost, pl, plPct, todayChange, weight: 0 };
    });

  const computedTotal = enriched.reduce((s, h) => s + h.value, 0);
  const totalCost = enriched.reduce((s, h) => s + h.cost, 0);
  const todayChange = enriched.reduce((s, h) => s + h.todayChange, 0);
  const previousTotal = computedTotal - todayChange;
  const allTimeReturn = computedTotal - totalCost;

  enriched.forEach((h) => {
    h.weight = computedTotal ? (h.value / computedTotal) * 100 : 0;
  });
  enriched.sort((a, b) => b.value - a.value);

  return {
    holdings: enriched,
    computedTotal,
    todayChange,
    todayChangePct: previousTotal ? (todayChange / previousTotal) * 100 : 0,
    allTimeReturn,
    allTimeReturnPct: totalCost ? (allTimeReturn / totalCost) * 100 : 0,
  };
}

export const getSummary = query({
  args: {},
  handler: async (ctx) => {
    const account = await ctx.db.query("accountSummary").first();
    const { computedTotal, todayChange, todayChangePct, allTimeReturn, allTimeReturnPct } =
      await computeHoldings(ctx);

    return {
      totalValue: computedTotal,
      todayChange,
      todayChangePct,
      allTimeReturn,
      allTimeReturnPct,
      cashAvailable: account?.cashAvailable ?? 0,
    };
  },
});

export const getHoldings = query({
  args: {},
  handler: async (ctx) => {
    const { holdings, computedTotal } = await computeHoldings(ctx);
    return { holdings, computedTotal };
  },
});
