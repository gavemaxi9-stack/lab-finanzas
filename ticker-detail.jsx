// AVANT MARKETS — Ticker Detail screen

const { useState: useStateD, useMemo, useRef, useEffect } = React;

// ─── price chart ───────────────────────────────────────
function PriceChart({ data, animate }) {
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
  const firstY = padT + usableH;
  const fillPath = `${linePath} L ${lastX.toFixed(2)} ${(padT + usableH).toFixed(2)} L ${padL} ${(padT + usableH).toFixed(2)} Z`;

  // Y axis labels — 5 evenly spaced
  const yTicks = [];
  for (let i = 0; i <= 4; i++) {
    const v = yMin + (yRange * i) / 4;
    const y = padT + usableH - (i / 4) * usableH;
    yTicks.push({ v, y });
  }

  // X axis times (mocked but plausible session times)
  const xLabels = ["09:30", "11:00", "12:30", "14:00", "15:30", "16:00"];

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
function TickerDetail({ tickerKey, inPortfolio, onToggleAdd }) {
  const t = TICKERS[tickerKey];
  const [timeframe, setTimeframe] = useStateD("1D");
  const series = t.series[timeframe];
  const positive = t.change >= 0;

  // Build news for this ticker; fall back to NVRA news for others (just example data)
  const news = NEWS_BY_TICKER[tickerKey] || NEWS_BY_TICKER.NVRA;

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
          <PriceChart key={chartKey} data={series} animate />
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
        <a className="section-link" href="#">Ver todas</a>
      </div>
      <div className="news-grid">
        {news.map((n, i) => (
          <article className="news-card" key={i}>
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
          <div>Fuente: <span>Nasdaq</span></div>
          <div>· <span>Datos en tiempo real</span></div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { TickerDetail });
