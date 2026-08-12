import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tickers").collect();
  },
});

export const get = query({
  args: { ticker: v.string() },
  handler: async (ctx, { ticker }) => {
    return await ctx.db
      .query("tickers")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
  },
});
