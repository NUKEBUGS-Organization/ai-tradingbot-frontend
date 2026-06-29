import React, { useRef } from 'react';
import { useWebSocket } from '../services/websocket';
import { useMt5Prices, hasLiveMt5Tickers } from '../hooks/useMt5Prices';
import { useSidebar } from '../context/SidebarContext';
import { useAuth, isAdminUser } from '../context/AuthContext';
import CartButton from './CartButton';
import { Bell, Settings, Menu } from 'lucide-react';

const TICKERS = [
  { key: 'XAUUSD', label: 'XAU', decimals: 2 },
  { key: 'EURUSD', label: 'EUR', decimals: 5 },
  { key: 'GBPUSD', label: 'GBP', decimals: 5 },
  { key: 'USDJPY', label: 'JPY', decimals: 3 },
  { key: 'GBPJPY', label: 'GJ', decimals: 3 },
  { key: 'XTIUSD', label: 'OIL', decimals: 2 },
];

const PLATFORM_NAME = 'VCL4X AI ECOSYSTEM';

export default function Header({ title }) {
  const { user } = useAuth();
  const { prices: wsPrices, connected, priceSource } = useWebSocket();
  const prices = useMt5Prices(wsPrices, priceSource);
  const prevBids = useRef({});
  const isMt5 = priceSource === 'mt5' && hasLiveMt5Tickers(prices);
  const { toggle } = useSidebar();

  return (
    <header className="top-bar header">
      <div className="top-bar-left header-left">
        <button
          type="button"
          className="top-bar-btn mobile-menu-btn header-menu-btn"
          onClick={toggle}
          aria-label="Open navigation menu"
        >
          <Menu size={16} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span
            className="hide-mobile"
            style={{
              fontSize: 10,
              color: '#8b949e',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              lineHeight: 1.2,
            }}
          >
            {PLATFORM_NAME}
          </span>
          <h1 className="page-title header-title">{title}</h1>
        </div>
        <div className="live-indicator hide-mobile-flex">
          <span
            className="live-dot"
            style={{
              background: connected ? (isMt5 ? '#3fb950' : '#8b949e') : '#f85149',
              boxShadow: connected && isMt5 ? '0 0 8px #3fb950' : 'none',
            }}
            title={connected ? (isMt5 ? 'MT5 live prices' : 'Waiting for MT5 quotes') : 'Disconnected'}
          />
          <span className="live-indicator-text">
            {connected ? (isMt5 ? 'MT5 LIVE' : 'WAITING') : 'OFFLINE'}
          </span>
        </div>
      </div>
      <div className="top-bar-right">
        <div className="price-ticker header-prices">
          {TICKERS.map(({ key, label, decimals }) => {
            const q = prices[key] || prices[`${key}m`] || prices[key.replace('USD', '')];
            const bid = q?.bid;
            const prev = prevBids.current[key];
            const dir = bid != null && prev != null ? (bid >= prev ? 'up' : 'down') : '';
            if (bid != null) prevBids.current[key] = bid;
            const hasLive = bid != null && isMt5;
            return (
              <div className="ticker-item" key={key}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: hasLive ? '#3fb950' : connected ? '#8b949e' : '#545d68',
                    flexShrink: 0,
                    marginRight: 4,
                  }}
                  title={hasLive ? 'MT5' : connected ? 'No quote yet' : 'Offline'}
                />
                <span className="ticker-symbol">{label}</span>
                <span className={`ticker-price ${dir}`}>
                  {bid != null ? bid.toFixed(decimals) : '—'}
                </span>
              </div>
            );
          })}
        </div>
        {user && !isAdminUser(user) && <CartButton />}
        <button type="button" className="top-bar-btn hide-mobile-flex" aria-label="Notifications">
          <Bell size={15} />
        </button>
        <button type="button" className="top-bar-btn hide-mobile-flex" aria-label="Settings">
          <Settings size={15} />
        </button>
      </div>
    </header>
  );
}
