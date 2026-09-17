import React, { useRef } from 'react';
import { useWebSocket } from '../services/websocket';
import { useMt5Prices, hasLiveMarketTickers } from '../hooks/useMt5Prices';
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
  const { prices: wsPrices, connected, priceSource: wsSource } = useWebSocket();
  const { prices, source: priceSource } = useMt5Prices(wsPrices, wsSource);
  const prevBids = useRef({});
  const hasPrices = hasLiveMarketTickers(prices);
  const isMt5 = priceSource === 'mt5' && hasPrices;
  const isLive = hasPrices && (priceSource === 'mt5' || priceSource === 'twelvedata');
  const { toggle } = useSidebar();

  const liveLabel = !connected ? 'OFFLINE' : isMt5 ? 'MT5 LIVE' : isLive ? 'LIVE' : 'WAITING';
  const liveTitle = !connected
    ? 'Disconnected'
    : isMt5
      ? 'MT5 live prices'
      : isLive
        ? 'TwelveData market prices'
        : 'Waiting for market quotes';

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
              background: connected ? (isLive ? '#3fb950' : '#8b949e') : '#f85149',
              boxShadow: connected && isLive ? '0 0 8px #3fb950' : 'none',
            }}
            title={liveTitle}
          />
          <span className="live-indicator-text">{liveLabel}</span>
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
            const hasLive = bid != null && isLive;
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
                  title={hasLive ? (isMt5 ? 'MT5' : 'TwelveData') : connected ? 'No quote yet' : 'Offline'}
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
