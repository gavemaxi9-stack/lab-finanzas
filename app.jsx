// AVANT MARKETS — main app

const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [screen, setScreen] = useStateApp("detail");
  const [ticker, setTicker] = useStateApp("NVRA");
  const [search, setSearch] = useStateApp("");
  const [portfolio, setPortfolio] = useStateApp(
    () => new Set(Object.keys(PORTFOLIO.holdings.reduce((acc, h) => (acc[h.ticker] = 1, acc), {})))
  );

  const inPortfolio = portfolio.has(ticker);
  const onToggleAdd = () => {
    setPortfolio(prev => {
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
    if (TICKERS[up]) {
      setTicker(up);
      setScreen("detail");
      setSearch("");
    }
  };

  return (
    <div
      className="app"
      data-screen-label={screen === "detail" ? `01 Detalle · ${ticker}` : "02 Mi portafolio"}
    >
      <Header
        screen={screen}
        onNavigate={(s) => { setScreen(s); window.scrollTo({ top: 0 }); }}
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
        <Portfolio onOpenTicker={onOpenTicker} />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
