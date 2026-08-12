// AVANT MARKETS — Mi Portafolio screen

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { fmtMoney, fmtSigned, fmtPct, sparkPath } from "../lib/format.js";

// Donut chart for sector distribution
function Donut({ slices }) {
  // slices: [{ pct, color }]
  const r = 60;
  const cx = 80, cy = 80;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg viewBox="0 0 160 160" className="donut">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="22" />
      {slices.map((s, i) => {
        const len = (s.pct / 100) * circ;
        const dasharray = `${len} ${circ - len}`;
        const dashoffset = -offset;
        offset += len;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="22"
            strokeDasharray={dasharray}
            strokeDashoffset={dashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ filter: `drop-shadow(0 0 6px ${s.color}66)` }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle"
        fontFamily="Space Grotesk, sans-serif"
        fontWeight="500"
        fontSize="22"
        fill="#fff">
        {slices.length}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontSize="9"
        letterSpacing="0.16em"
        fill="rgba(255,255,255,0.5)">
        ACTIVOS
      </text>
    </svg>
  );
}

function Sparkline({ values, positive }) {
  const d = sparkPath(values);
  return (
    <svg viewBox="0 0 96 30" className={"spark " + (positive ? "pos" : "neg")}>
      <path d={d} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function csvField(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportHoldingsCsv(holdings) {
  const header = ["Ticker", "Empresa", "Cantidad", "Precio prom.", "Precio actual", "Valor", "G/P total", "G/P %", "Peso %"];
  const rows = holdings.map((h) => [
    h.ticker,
    h.info.name,
    h.qty,
    h.avgCost.toFixed(2),
    h.info.price.toFixed(2),
    h.value.toFixed(2),
    h.pl.toFixed(2),
    h.plPct.toFixed(2),
    h.weight.toFixed(2),
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvField).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `portafolio-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Portfolio({ onOpenTicker, onViewMarket }) {
  const summary = useQuery(api.portfolio.getSummary);
  const holdingsData = useQuery(api.portfolio.getHoldings);
  const activity = useQuery(api.activity.listRecent);
  const tickers = useQuery(api.tickers.list);

  if (!summary || !holdingsData || !activity || !tickers) {
    return <div className="screen"><div className="card">Cargando portafolio…</div></div>;
  }

  const { holdings, computedTotal } = holdingsData;

  // Sector distribution
  const sectorMap = {};
  holdings.forEach(h => {
    const s = h.info.sector;
    sectorMap[s] = (sectorMap[s] || 0) + h.value;
  });
  const sectorTotal = Object.values(sectorMap).reduce((a, b) => a + b, 0);
  const sectorColors = ["#c8ff1f", "#2bd8e6", "#9b5cff", "#ff8a3d", "#ff4d7a", "#5cffaa", "#ffd84d"];
  const sectors = Object.entries(sectorMap)
    .map(([name, v], i) => ({ name, pct: (v / sectorTotal) * 100, color: sectorColors[i % sectorColors.length] }))
    .sort((a, b) => b.pct - a.pct);

  // Top movers across the market (all tickers)
  const movers = tickers
    .slice()
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
    .slice(0, 6);

  return (
    <div className="screen">
      {/* Top summary + distribution */}
      <div className="portfolio-head">
        <div className="card summary-card">
          <div className="summary-label">Valor total del portafolio</div>
          <div className="summary-value">
            {fmtMoney(computedTotal)}
            <span className="currency">USD</span>
          </div>
          <div className="summary-deltas">
            <div className="delta">
              <span className="delta-label">Hoy</span>
              <span className={"delta-value" + (summary.todayChange >= 0 ? "" : " neg")}>
                <span>{summary.todayChange >= 0 ? "▲" : "▼"}</span>
                {fmtSigned(summary.todayChange)} USD ({fmtPct(summary.todayChangePct)})
              </span>
            </div>
            <div className="delta">
              <span className="delta-label">Rendimiento total</span>
              <span className={"delta-value" + (summary.allTimeReturn >= 0 ? "" : " neg")}>
                <span>{summary.allTimeReturn >= 0 ? "▲" : "▼"}</span>
                {fmtSigned(summary.allTimeReturn)} USD ({fmtPct(summary.allTimeReturnPct)})
              </span>
            </div>
            <div className="delta">
              <span className="delta-label">Efectivo disponible</span>
              <span className="delta-value" style={{ color: "#fff", textShadow: "none" }}>
                {fmtMoney(summary.cashAvailable)} USD
              </span>
            </div>
          </div>
        </div>

        <div className="card distribution-card">
          <h3 className="distribution-title">Distribución por sector</h3>
          <div className="distribution-body">
            <Donut slices={sectors} />
            <div className="dist-legend">
              {sectors.map(s => (
                <div className="dist-row" key={s.name}>
                  <span className="dist-swatch" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}80` }} />
                  <span className="dist-name">{s.name}</span>
                  <span className="dist-pct">{s.pct.toFixed(1).replace(".", ",")}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings table */}
      <div className="card holdings-card">
        <div className="holdings-head">
          <h2 className="section-title">Mis posiciones</h2>
          <button className="section-link" onClick={() => exportHoldingsCsv(holdings)}>Exportar CSV</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Activo</th>
              <th className="num">Cantidad</th>
              <th className="num">Precio prom.</th>
              <th className="num">Precio actual</th>
              <th className="num">Valor</th>
              <th className="num">G/P total</th>
              <th className="num">Hoy</th>
              <th className="num">Peso</th>
              <th className="num">7D</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map(h => {
              const pos = h.pl >= 0;
              const todayPos = h.info.change >= 0;
              return (
                <tr key={h.ticker} onClick={() => onOpenTicker(h.ticker)}>
                  <td>
                    <div className="holding-name">
                      <div className="holding-logo" style={{ color: h.info.accent, textShadow: `0 0 8px ${h.info.accent}80` }}>
                        {h.ticker.slice(0, 2)}
                      </div>
                      <div className="holding-meta">
                        <span className="holding-ticker">{h.ticker}</span>
                        <span className="holding-sub">{h.info.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="num num-mono">{h.qty}</td>
                  <td className="num num-mono">{fmtMoney(h.avgCost)}</td>
                  <td className="num num-mono">{fmtMoney(h.info.price)}</td>
                  <td className="num num-mono">{fmtMoney(h.value)}</td>
                  <td className="num">
                    <span className={"pl " + (pos ? "pos" : "neg")}>
                      {fmtSigned(h.pl, 0)} ({fmtPct(h.plPct, 1)})
                    </span>
                  </td>
                  <td className="num">
                    <span className={"pl " + (todayPos ? "pos" : "neg")}>
                      {fmtPct(h.info.changePct)}
                    </span>
                  </td>
                  <td className="num num-mono">{h.weight.toFixed(1).replace(".", ",")}%</td>
                  <td className="num">
                    <Sparkline values={h.info.series["1S"]} positive={pos} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Activity + movers */}
      <div className="bottom-row">
        <div className="card">
          <div className="section-head" style={{ margin: "0 0 8px" }}>
            <h2 className="section-title">Actividad reciente</h2>
            <a className="section-link" href="#">Historial</a>
          </div>
          <div>
            {activity.map((a) => {
              let title, amount, sub;
              if (a.type === "buy") {
                title = `Compra · ${a.ticker}`;
                sub = `${a.qty} acciones a ${fmtMoney(a.price)} USD`;
                amount = `−${fmtMoney(a.qty * a.price)} USD`;
              } else if (a.type === "sell") {
                title = `Venta · ${a.ticker}`;
                sub = `${a.qty} acciones a ${fmtMoney(a.price)} USD`;
                amount = `+${fmtMoney(a.qty * a.price)} USD`;
              } else {
                title = `Dividendo · ${a.ticker}`;
                sub = `${a.qty} acciones`;
                amount = `+${fmtMoney(a.amount)} USD`;
              }
              return (
                <div className="activity-row" key={a._id}>
                  <div className="activity-left">
                    <div className={"activity-badge " + a.type}>
                      {a.type === "buy" ? "BUY" : a.type === "sell" ? "SELL" : "DIV"}
                    </div>
                    <div className="activity-info">
                      <span className="activity-title">{title}</span>
                      <span className="activity-sub">{sub}</span>
                    </div>
                  </div>
                  <div>
                    <div className="activity-amount">{amount}</div>
                    <div className="activity-time">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="section-head" style={{ margin: "0 0 8px" }}>
            <h2 className="section-title">Mayores movimientos</h2>
            <button className="section-link" onClick={onViewMarket}>Ver mercado</button>
          </div>
          <div className="movers-list">
            {movers.map(m => {
              const pos = m.change >= 0;
              return (
                <div className="mover-row" key={m.ticker} onClick={() => onOpenTicker(m.ticker)}>
                  <div className="mover-logo" style={{ color: m.accent, textShadow: `0 0 8px ${m.accent}80` }}>
                    {m.ticker.slice(0, 2)}
                  </div>
                  <div className="mover-info">
                    <span className="mover-ticker">{m.ticker}</span>
                    <span className="mover-name">{m.name}</span>
                  </div>
                  <div className="mover-price">{fmtMoney(m.price)}</div>
                  <div className={"mover-change " + (pos ? "pos" : "neg")}>
                    {fmtPct(m.changePct)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
