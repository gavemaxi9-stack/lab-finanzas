import { query } from "./_generated/server";

export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("activity").collect();
  },
});
