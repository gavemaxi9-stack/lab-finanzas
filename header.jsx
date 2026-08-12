// AVANT MARKETS — Header with brand, search, and nav

const { useState } = React;

function BrandMark() {
  // Original geometric "A" mark — chevron/triangle on a hex base
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-mark">
      <path
        d="M20 4 L36 32 L28 32 L24 25 L16 25 L12 32 L4 32 Z"
        stroke="#2bd8e6"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M19 16 L21 16 L23 20 L17 20 Z"
        fill="#2bd8e6"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="search-icon">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function PortfolioIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

function MarketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M3 17 L9 11 L13 15 L21 7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 7 L21 7 L21 13" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Header({ screen, onNavigate, searchValue, onSearch }) {
  return (
    <header className="header">
      <div className="brand">
        <BrandMark />
        <div className="brand-word">
          <span>AVANT</span>
          <span>MARKETS</span>
        </div>
      </div>

      <div className="search">
        <input
          className="search-input"
          placeholder="Buscar ticker o empresa (ej. NVRA)"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />
        <SearchIcon />
      </div>

      <nav className="nav">
        <button
          className={"nav-btn" + (screen === "detail" ? " active" : "")}
          onClick={() => onNavigate("detail")}
        >
          <MarketIcon />
          Mercado
        </button>
        <button
          className={"nav-btn" + (screen === "portfolio" ? " active" : "")}
          onClick={() => onNavigate("portfolio")}
        >
          <PortfolioIcon />
          Mi portafolio
        </button>
      </nav>
    </header>
  );
}

Object.assign(window, { Header });
