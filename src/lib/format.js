// Number formatting (Spanish locale)
export function fmtMoney(n, decimals = 2) {
  return n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
export function fmtSigned(n, decimals = 2) {
  const sign = n >= 0 ? "+" : "−";
  return sign + Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
export function fmtPct(n, decimals = 2) {
  const sign = n >= 0 ? "+" : "−";
  return sign + Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + "%";
}

// Sparkline path from values
export function sparkPath(values, w = 96, h = 30) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const pad = 2;
  const usableH = h - pad * 2;
  return values
    .map((v, i) => {
      const x = i * step;
      const y = pad + usableH - ((v - min) / range) * usableH;
      return (i === 0 ? "M" : "L") + x.toFixed(2) + " " + y.toFixed(2);
    })
    .join(" ");
}
