import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Presupuesto de llamadas/min: 15 tickers x 3 ciclos/min (cron cada 20s) = 45/60
// llamadas/min usadas en Finnhub, dejando ~15/min de margen para el cron diario
// de fundamentals (Tarea 4), que corre fuera de este ciclo.

export const fetchLiveQuotes = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      console.error("fetchLiveQuotes: FINNHUB_API_KEY no está configurada");
      return;
    }

    const tickers: { ticker: string }[] = await ctx.runQuery(internal.marketData.listTickerSymbols, {});

    for (const { ticker } of tickers) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`
        );

        if (res.status === 429) {
          console.error(`fetchLiveQuotes: rate limit (429) en ${ticker}, se salta este ciclo`);
          continue;
        }
        if (!res.ok) {
          console.error(`fetchLiveQuotes: HTTP ${res.status} para ${ticker}`);
          continue;
        }

        const data = await res.json();
        // Finnhub devuelve todo en 0 para símbolos inválidos/sin datos
        if (data.c === 0 && data.pc === 0) {
          console.error(`fetchLiveQuotes: sin datos para ${ticker}, se conserva el último valor`);
          continue;
        }

        await ctx.runMutation(internal.marketData.patchQuote, {
          ticker,
          price: data.c,
          change: data.d ?? 0,
          changePct: data.dp ?? 0,
        });
      } catch (err) {
        console.error(`fetchLiveQuotes: error en ${ticker}:`, err);
      }
    }
  },
});

export const listTickerSymbols = internalQuery({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query("tickers").collect();
    return rows.map((r) => ({ ticker: r.ticker }));
  },
});

export const listTickers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tickers").collect();
  },
});

// Convierte un número grande de market cap (Finnhub lo da en millones de USD)
// al formato de string que espera la UI, ej. 3_500_000 -> "3,50 B USD".
function formatMarketCap(millions: number): string {
  const billions = millions / 1000;
  return billions.toFixed(2).replace(".", ",") + " B USD";
}

function formatDecimal(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function formatPct(n: number): string {
  return n.toFixed(2).replace(".", ",") + "%";
}

export const fetchDailyFundamentals = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      console.error("fetchDailyFundamentals: FINNHUB_API_KEY no está configurada");
      return;
    }

    const tickers: { ticker: string }[] = await ctx.runQuery(internal.marketData.listTickerSymbols, {});

    for (const { ticker } of tickers) {
      try {
        const [profileRes, metricRes] = await Promise.all([
          fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`),
          fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${encodeURIComponent(ticker)}&metric=all&token=${apiKey}`),
        ]);

        if (profileRes.status === 429 || metricRes.status === 429) {
          console.error(`fetchDailyFundamentals: rate limit (429) en ${ticker}, se salta`);
          continue;
        }
        if (!profileRes.ok || !metricRes.ok) {
          console.error(`fetchDailyFundamentals: HTTP error para ${ticker}`);
          continue;
        }

        const profile = await profileRes.json();
        const metric = (await metricRes.json())?.metric ?? {};

        const patch: Record<string, string> = {};
        if (typeof profile.marketCapitalization === "number") {
          patch.marketCap = formatMarketCap(profile.marketCapitalization);
        }
        if (typeof metric.peBasicExclExtraTTM === "number") {
          patch.pe = formatDecimal(metric.peBasicExclExtraTTM);
        }
        if (typeof metric.dividendYieldIndicatedAnnual === "number") {
          patch.dividend = formatPct(metric.dividendYieldIndicatedAnnual);
        }
        if (typeof metric.beta === "number") {
          patch.beta = formatDecimal(metric.beta);
        }

        if (Object.keys(patch).length > 0) {
          await ctx.runMutation(internal.marketData.patchFundamentals, { ticker, ...patch });
        }
      } catch (err) {
        console.error(`fetchDailyFundamentals: error en ${ticker}:`, err);
      }
    }
  },
});

export const patchFundamentals = internalMutation({
  args: {
    ticker: v.string(),
    marketCap: v.optional(v.string()),
    pe: v.optional(v.string()),
    dividend: v.optional(v.string()),
    beta: v.optional(v.string()),
  },
  handler: async (ctx, { ticker, ...fields }) => {
    const row = await ctx.db
      .query("tickers")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
    if (!row) return;
    await ctx.db.patch(row._id, fields);
  },
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Job de una sola ejecución (ver Tarea 5 del plan): 15 tickers x 1 llamada
// time_series = 15 llamadas, dentro del cupo de 800/día de Twelve Data.
// Se espacian a ~8s (bajo el límite de 8/min del free tier) para no chocar con el rate limit.
export const backfillSeries = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.TWELVEDATA_API_KEY;
    if (!apiKey) {
      console.error("backfillSeries: TWELVEDATA_API_KEY no está configurada");
      return;
    }

    const tickers = await ctx.runQuery(internal.marketData.listTickers, {});

    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      try {
        const res = await fetch(
          `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(ticker.ticker)}&interval=1day&outputsize=30&apikey=${apiKey}`
        );
        if (!res.ok) {
          console.error(`backfillSeries: HTTP ${res.status} para ${ticker.ticker}`);
        } else {
          const data = await res.json();
          const values = data.values;
          if (!Array.isArray(values)) {
            console.error(`backfillSeries: sin datos diarios para ${ticker.ticker} (posible rate limit):`, data.message ?? data);
          } else {
            // Twelve Data devuelve los valores del más reciente al más antiguo.
            const closes = values.map((v: { close: string }) => parseFloat(v.close)).reverse();
            const lastClose = closes[closes.length - 1];

            const series: Record<string, number[]> = {
              "1D": closes.slice(-30),
              "1S": closes.slice(-7),
            };
            // "1H"/"4H" son placeholder plano solo si esa serie todavía no
            // recibió ningún tick real del cron en vivo — si ya arrancó a
            // acumular datos reales, no la pisamos con un flatline falso.
            if (!ticker.seriesUpdatedAt?.["1H"]) series["1H"] = Array.from({ length: 20 }, () => lastClose);
            if (!ticker.seriesUpdatedAt?.["4H"]) series["4H"] = Array.from({ length: 20 }, () => lastClose);

            await ctx.runMutation(internal.marketData.patchSeries, {
              ticker: ticker.ticker,
              series,
              realKeys: ["1D", "1S"],
            });
          }
        }
      } catch (err) {
        console.error(`backfillSeries: error en ${ticker.ticker}:`, err);
      }

      if (i < tickers.length - 1) await sleep(8_000);
    }
  },
});

export const patchSeries = internalMutation({
  args: {
    ticker: v.string(),
    series: v.record(v.string(), v.array(v.number())),
    realKeys: v.array(v.string()),
  },
  handler: async (ctx, { ticker, series, realKeys }) => {
    const row = await ctx.db
      .query("tickers")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
    if (!row) return;

    const now = Date.now();
    const seriesUpdatedAt = { ...row.seriesUpdatedAt };
    for (const key of realKeys) seriesUpdatedAt[key] = now;

    await ctx.db.patch(row._id, {
      series: { ...row.series, ...series },
      seriesUpdatedAt,
    });
  },
});

export const patchQuote = internalMutation({
  args: {
    ticker: v.string(),
    price: v.number(),
    change: v.number(),
    changePct: v.number(),
  },
  handler: async (ctx, { ticker, price, change, changePct }) => {
    const row = await ctx.db
      .query("tickers")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
    if (!row) return;

    // Cron cada 20s (convex/crons.ts): 180 puntos = 1h real, 720 puntos = 4h real.
    // Antes solo se acumulaba "1H"; "4H" se quedaba fijo en el placeholder inicial
    // para siempre — igual de "en vivo" en el nombre de la pestaña pero con datos
    // congelados, lo que resultaba engañoso.
    const now = Date.now();
    const series = { ...row.series };
    series["1H"] = [...(series["1H"] ?? []), price].slice(-180);
    series["4H"] = [...(series["4H"] ?? []), price].slice(-720);

    await ctx.db.patch(row._id, {
      price,
      change,
      changePct,
      series,
      seriesUpdatedAt: { ...row.seriesUpdatedAt, "1H": now, "4H": now },
      updatedAt: now,
      source: "finnhub",
    });
  },
});
