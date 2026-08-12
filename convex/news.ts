import { query } from "./_generated/server";
import { v } from "convex/values";

export const byTicker = query({
  args: { ticker: v.string() },
  handler: async (ctx, { ticker }) => {
    const results = await ctx.db
      .query("news")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .collect();
    if (results.length > 0) return results;

    // Fallback to AAPL news for tickers without dedicated coverage,
    // mirroring the original prototype's mock behavior.
    return await ctx.db
      .query("news")
      .withIndex("by_ticker", (q) => q.eq("ticker", "AAPL"))
      .collect();
  },
});
