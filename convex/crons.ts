import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "live quotes",
  { seconds: 20 },
  internal.marketData.fetchLiveQuotes
);

// Fuera de horario de mercado US (mercado cierra 21:00 UTC / 22:00 UTC en horario
// de verano) para evitar competir por el presupuesto de llamadas de Finnhub.
crons.daily(
  "daily fundamentals",
  { hourUTC: 3, minuteUTC: 0 },
  internal.marketData.fetchDailyFundamentals
);

export default crons;
