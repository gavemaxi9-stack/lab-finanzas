# Avant Markets

Portafolio de acciones del S&P 500 con datos de mercado en tiempo (casi) real. Dark theme con acentos neón verde lima y cian.

## Stack

- React 18 + Vite
- [Convex](https://www.convex.dev/) como backend reactivo (base de datos + funciones serverless + crons)
- CSS puro con custom properties para tokens
- Tipografías: Space Grotesk (display) · Manrope (texto) · IBM Plex Mono (números)

## Estructura

```
src/
├── main.jsx               # Entry point, ConvexReactClient
├── App.jsx                # Root + routing entre pantallas
├── components/
│   ├── Header.jsx          # Header con logo, buscador y nav
│   ├── TickerDetail.jsx    # Pantalla de detalle de ticker
│   └── Portfolio.jsx       # Pantalla Mi Portafolio
└── lib/format.js          # Formateo de números (locale es-ES)

convex/
├── schema.ts               # Tablas: tickers, holdings, accountSummary, activity, news
├── seed.ts                 # Datos iniciales (mutation seed)
├── marketData.ts           # Fetch de cotizaciones/fundamentals/histórico
├── crons.ts                # Cotizaciones en vivo (20s) y fundamentals (diario)
├── tickers.ts / portfolio.ts / activity.ts / news.ts   # Queries
```

## Cómo correr

Requiere una cuenta gratuita de Convex y las siguientes API keys de datos de mercado:

- **Finnhub** (finnhub.io) — cotizaciones en vivo y fundamentals.
- **Twelve Data** (twelvedata.com) — backfill histórico de las series de gráfico.

```bash
npm install

# levanta el backend de Convex (crea el deployment si no existe)
npx convex dev

# en otra terminal: configura las API keys en el deployment de Convex
npx convex env set FINNHUB_API_KEY <tu_key>
npx convex env set TWELVEDATA_API_KEY <tu_key>

# puebla la base con los 15 tickers reales — SOLO para el setup inicial:
# borra y resiembra TODAS las tablas (tickers, holdings, activity, news),
# incluyendo cualquier histórico ya acumulado por los crons. Es una
# internalMutation (no invocable desde el navegador), pero sigue siendo
# destructiva si la corres de nuevo con datos reales ya cargados.
npx convex run seed:seed

# backfill histórico de gráficos (una sola vez, tarda ~2 min por rate limit)
npx convex run marketData:backfillSeries

# levanta el frontend
npm run dev
```

Una vez configuradas las keys, el cron de Convex actualiza los precios cada 20s y los fundamentals una vez al día automáticamente — no requiere ninguna acción manual adicional.

## Pantallas

1. **Detalle de ticker** — precio en vivo (Finnhub, refresco cada 20s), indicador "En vivo · hace Ns", gráfica con tabs 1H/4H/1D/1S, métricas clave, noticias
2. **Mi portafolio** — valor total y P/L recalculados en vivo a partir de los precios actuales, distribución por sector (donut), tabla de posiciones con sparklines, actividad reciente, mayores movimientos

## Interacciones

- Buscador: escribe un ticker real (ej. `AAPL`, `MSFT`, `NVDA`, `TSLA`) y Enter
- Click en filas de la tabla o de mayores movimientos → abre el detalle
- Botón "Añadir al portafolio" con toggle de estado (solo local, no persiste al recargar)
- Tabs de timeframe con re-animación de la gráfica

## Tickers reales (S&P 500)

| Ticker | Empresa                          | Sector                     |
|--------|-----------------------------------|-----------------------------|
| AAPL   | Apple Inc.                        | Tecnología                  |
| MSFT   | Microsoft Corporation             | Tecnología                  |
| NVDA   | NVIDIA Corporation                | Tecnología                  |
| AMZN   | Amazon.com, Inc.                  | Consumo discrecional        |
| GOOGL  | Alphabet Inc.                     | Servicios de comunicación   |
| META   | Meta Platforms, Inc.              | Servicios de comunicación   |
| TSLA   | Tesla, Inc.                       | Consumo discrecional        |
| JPM    | JPMorgan Chase & Co.               | Financiero                  |
| V      | Visa Inc.                         | Financiero                  |
| XOM    | Exxon Mobil Corporation           | Energía                     |
| JNJ    | Johnson & Johnson                 | Salud                       |
| UNH    | UnitedHealth Group Incorporated   | Salud                       |
| PG     | The Procter & Gamble Company      | Consumo básico              |
| HD     | The Home Depot, Inc.              | Consumo discrecional        |
| CAT    | Caterpillar Inc.                  | Industrial                  |

## Limitaciones conocidas (tier gratis de las APIs)

- `volume` no se refresca automáticamente (ningún proveedor gratis lo da sin comprometer el presupuesto de requests) — queda fijo en el valor del seed inicial.
- Las series de gráfico `1H`/`4H` arrancan planas (sin histórico intradía real) y se van llenando con datos reales conforme pasa el tiempo, gracias al cron de cotizaciones en vivo.

## Tokens de color principales

```css
--lime: #c8ff1f;     /* acento primario, precios positivos */
--cyan: #2bd8e6;     /* acento secundario, UI activa */
--rose: #ff4d7a;     /* precios negativos */
--bg-deep: #000000;  /* fondo */
--bg-card: #0a0d12;  /* tarjetas */
```
