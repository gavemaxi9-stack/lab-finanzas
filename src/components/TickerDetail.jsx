// AVANT MARKETS — Ticker Detail screen

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { fmtMoney, fmtSigned, fmtPct } from "../lib/format.js";

const STALE_AFTER_MS = 2 * 60 * 1000;

// ─── "en vivo" / última actualización indicator ─────────
function LiveIndicator({ updatedAt }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!updatedAt) return null;

  const secondsAgo = Math.max(0, Math.round((now - updatedAt) / 1000));
  const stale = now - updatedAt > STALE_AFTER_MS;

  return (
    <div className={"live-indicator" + (stale ? " stale" : "")}>
      <span className="live-dot" />
      {stale ? "Desactualizado" : "En vivo"} · hace {secondsAgo}s
    </div>
  );
}

// Cadencia del cron de precios en vivo (convex/crons.ts) — usada para ubicar
// en el tiempo los puntos intradía de 1H/4H sin tener que guardar un
// timestamp por punto.
const LIVE_QUOTE_INTERVAL_MS = 20_000;

// Genera etiquetas del eje X acordes al dato real de cada pestaña, en vez de
// un horario de sesión fijo: 1H/4H son ticks intradía reales espaciados
// LIVE_QUOTE_INTERVAL_MS entre sí; 1D/1S son cierres diarios reales (un punto
// por día de mercado), así que se etiquetan en días, no en horas.
function buildXLabels(timeframe, length) {
  if (length < 2) return [];
  const count = Math.min(6, length);
  const isIntraday = timeframe === "1H" || timeframe === "4H";
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const pointIndex = Math.round(((length - 1) * i) / (count - 1));
    const pointsAgo = length - 1 - pointIndex;

    if (isIntraday) {
      const t = new Date(now - pointsAgo * LIVE_QUOTE_INTERVAL_MS);
      return t.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
    }
    return pointsAgo === 0 ? "Hoy" : `-${pointsAgo}d`;
  });
}

// ─── price chart ───────────────────────────────────────
function PriceChart({ data, animate, timeframe }) {
  const W = 700;
  const H = 380;
  const padL = 28;
  const padR = 64;   // room for price labels on right
  const padT = 16;
  const padB = 36;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;

  // pad axis a bit
  const yMin = min - range * 0.08;
  const yMax = max + range * 0.08;
  const yRange = yMax - yMin;

  const usableW = W - padL - padR;
  const usableH = H - padT - padB;
  const step = usableW / (data.length - 1);

  const xy = (i, v) => [padL + i * step, padT + usableH - ((v - yMin) / yRange) * usableH];

  const linePath = data
    .map((v, i) => {
      const [x, y] = xy(i, v);
      return (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    })
    .join(" ");

  const lastX = padL + (data.length - 1) * step;
  const [, lastY] = xy(data.length - 1, data[data.length - 1]);
  const fillPath = `${linePath} L ${lastX.toFixed(2)} ${(padT + usableH).toFixed(2)} L ${padL} ${(padT + usableH).toFixed(2)} Z`;

  // Y axis labels — 5 evenly spaced
  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (yRange * i) / 4;
    const y = padT + usableH - (i / 4) * usableH;
    yTicks.push({ v, y });
  }

  const xLabels = buildXLabels(timeframe, data.length);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lime-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#c8ff1f" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#c8ff1f" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* grid lines + Y labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line className="grid-line" x1={padL} x2={W - padR} y1={t.y} y2={t.y} />
          <text className="axis-label" x={W - padR + 10} y={t.y + 4}>
            {t.v.toFixed(2).replace(".", ",")}
          </text>
        </g>
      ))}

      {/* fill */}
      <path className="price-fill" d={fillPath} />

      {/* line */}
      <path className={"price-line" + (animate ? " animate" : "")} d={linePath} />

      {/* end dot */}
      <circle className="price-dot" cx={lastX} cy={lastY} r="5" />
      <circle className="price-dot" cx={lastX} cy={lastY} r="9" opacity="0.25" />

      {/* X labels */}
      {xLabels.map((l, i) => {
        const x = padL + (i / (xLabels.length - 1)) * usableW;
        return (
          <text key={l} className="axis-label" x={x} y={H - 10} textAnchor="middle">{l}</text>
        );
      })}
    </svg>
  );
}

// ─── news image placeholder (subtly-striped gradient) ───
function NewsImagePlaceholder({ hue, label }) {
  return (
    <svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={`nbg-${hue}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%"  stopColor={`oklch(0.32 0.08 ${hue})`} />
          <stop offset="100%" stopColor={`oklch(0.14 0.05 ${hue})`} />
        </linearGradient>
        <pattern id={`stripes-${hue}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="320" height="180" fill={`url(#nbg-${hue})`} />
      <rect width="320" height="180" fill={`url(#stripes-${hue})`} />
      <text x="160" y="92" textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="11"
            letterSpacing="0.15em"
            fill="rgba(255,255,255,0.35)">
        {label}
      </text>
    </svg>
  );
}

// ─── ticker detail screen ───────────────────────────────
export default function TickerDetail({ tickerKey, inPortfolio, onToggleAdd }) {
  const [timeframe, setTimeframe] = useState("1D");

  const t = useQuery(api.tickers.get, { ticker: tickerKey });
  const news = useQuery(api.news.byTicker, { ticker: tickerKey });

  if (!t || !news) {
    return <div className="screen"><div className="card">Cargando ticker…</div></div>;
  }

  const series = t.series[timeframe];
  const positive = t.change >= 0;

  // Force chart re-mount on timeframe change for redraw animation
  const chartKey = `${tickerKey}-${timeframe}`;

  return (
    <div className="screen">
      {/* Detail header */}
      <div className="detail-head">
        <div className="detail-head-left">
          <div className="ticker-logo" style={{ color: t.accent, textShadow: "0 0 14px " + t.accent + "80" }}>
            {t.ticker.slice(0, 2)}
          </div>
          <div>
            <h1 className="ticker-name">{t.name}</h1>
            <div className="ticker-meta">
              <span>{t.ticker}</span>
              <span className="dot" />
              <span>{t.exchange}</span>
              <span className="dot" />
              <span>{t.sector}</span>
            </div>
          </div>
        </div>

        <div className="detail-head-right">
          <div className="price">
            {fmtMoney(t.price)}
            <span className="price-currency">USD</span>
          </div>
          <div className={"price-change" + (positive ? "" : " neg")}>
            <span>{positive ? "▲" : "▼"}</span>
            <span>{fmtSigned(t.change)} ({fmtPct(t.changePct)})</span>
            <span className="price-change-period">Hoy</span>
          </div>
          <LiveIndicator updatedAt={t.updatedAt} />
          <div>
            <button
              className={"btn-add" + (inPortfolio ? " added" : "")}
              onClick={onToggleAdd}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {inPortfolio
                  ? <path d="M5 12l5 5L20 7" />
                  : <><path d="M12 5v14" /><path d="M5 12h14" /></>}
              </svg>
              {inPortfolio ? "En tu portafolio" : "Añadir al portafolio"}
            </button>
          </div>
        </div>
      </div>

      {/* Chart + metrics */}
      <div className="chart-row">
        <div className="card chart-card">
          <div className="chart-tabs">
            {["1H", "4H", "1D", "1S"].map((tf) => (
              <button
                key={tf}
                className={"chart-tab" + (timeframe === tf ? " active" : "")}
                onClick={() => setTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
          {!t.seriesUpdatedAt?.[timeframe] && (
            <div className="sample-data-banner">
              ⚠ Datos de muestra — histórico real no disponible todavía para {timeframe}
            </div>
          )}
          <PriceChart key={chartKey} data={series} animate timeframe={timeframe} />
        </div>

        <div className="card">
          <div className="metrics-title">Métricas clave</div>
          <div className="metrics-list">
            <div className="metric-row"><span className="metric-label">Capitalización</span><span className="metric-value">{t.marketCap}</span></div>
            <div className="metric-row"><span className="metric-label">Volumen</span><span className="metric-value">{t.volume}</span></div>
            <div className="metric-row"><span className="metric-label">P/E</span><span className="metric-value">{t.pe}</span></div>
            <div className="metric-row"><span className="metric-label">Dividendos</span><span className="metric-value">{t.dividend}</span></div>
            <div className="metric-row"><span className="metric-label">Beta (5A)</span><span className="metric-value">{t.beta}</span></div>
          </div>
        </div>
      </div>

      {/* News */}
      <div className="section-head">
        <h2 className="section-title">Noticias recientes</h2>
        <a
          className="section-link"
          href={`https://www.google.com/finance/quote/${t.ticker}:${t.exchange}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ver todas
        </a>
      </div>
      <div className="news-grid">
        {news.map((n) => (
          <article className="news-card" key={n._id}>
            <div className="news-img">
              <NewsImagePlaceholder hue={n.hue} label={`[ imagen · ${n.tag.toLowerCase()} ]`} />
            </div>
            <div className="news-body">
              <div className="news-tag">{n.tag}</div>
              <h3 className="news-title">{n.title}</h3>
              <div className="news-time">{n.time}</div>
            </div>
          </article>
        ))}
      </div>

      {/* footer */}
      <div className="footer">
        <div>Los datos se muestran con fines informativos y no constituyen asesoramiento de inversión.</div>
        <div className="footer-right">
          <div>Fuente: <span>Finnhub</span></div>
          <div>· <span>Precio actualizado cada 20s</span></div>
        </div>
      </div>
    </div>
  );
}
