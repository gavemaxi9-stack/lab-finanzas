// AVANT MARKETS — main app

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import Header from "./components/Header.jsx";
import TickerDetail from "./components/TickerDetail.jsx";
import Portfolio from "./components/Portfolio.jsx";

export default function App() {
  const [screen, setScreen] = useState("detail");
  const [ticker, setTicker] = useState("AAPL");
  const [search, setSearch] = useState("");
  const [portfolioSet, setPortfolioSet] = useState(null);

  const tickers = useQuery(api.tickers.list);
  const holdingsData = useQuery(api.portfolio.getHoldings);

  // Seed the local "added to portfolio" set once from the server holdings.
  // Toggling afterwards is a local-only UI affordance, mirroring the original prototype.
  useEffect(() => {
    if (portfolioSet === null && holdingsData) {
      setPortfolioSet(new Set(holdingsData.holdings.map((h) => h.ticker)));
    }
  }, [holdingsData, portfolioSet]);

  const inPortfolio = portfolioSet?.has(ticker) ?? false;
  const onToggleAdd = () => {
    setPortfolioSet((prev) => {
      const next = new Set(prev);
      next.has(ticker) ? next.delete(ticker) : next.add(ticker);
      return next;
    });
  };

  const onOpenTicker = (tk) => {
    setTicker(tk);
    setScreen("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // simple search → if matches a ticker, jump to it on Enter
  const handleSearch = (val) => {
    setSearch(val);
    const up = val.trim().toUpperCase();
    if (tickers?.some((t) => t.ticker === up)) {
      setTicker(up);
      setScreen("detail");
      setSearch("");
    }
  };

  const onNavigate = (s) => { setScreen(s); window.scrollTo({ top: 0 }); };

  if (!tickers || !portfolioSet) {
    return <div className="app"><div className="screen"><div className="card">Cargando…</div></div></div>;
  }

  return (
    <div
      className="app"
      data-screen-label={screen === "detail" ? `01 Detalle · ${ticker}` : "02 Mi portafolio"}
    >
      <Header
        screen={screen}
        onNavigate={onNavigate}
        searchValue={search}
        onSearch={handleSearch}
      />

      {screen === "detail" && (
        <TickerDetail
          tickerKey={ticker}
          inPortfolio={inPortfolio}
          onToggleAdd={onToggleAdd}
        />
      )}

      {screen === "portfolio" && (
        <Portfolio onOpenTicker={onOpenTicker} onViewMarket={() => onNavigate("detail")} />
      )}
    </div>
  );
}
