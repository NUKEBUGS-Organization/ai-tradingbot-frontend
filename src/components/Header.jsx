import React, { useRef } from 'react';
import { useWebSocket } from '../services/websocket';
import { useMt5Prices, hasLiveMt5Tickers } from '../hooks/useMt5Prices';
import { Bell, Settings } from 'lucide-react';

const TICKERS = [
  { key: 'XAUUSD', label: 'XAU', decimals: 2 },
  { key: 'EURUSD', label: 'EUR', decimals: 5 },
  { key: 'GBPUSD', label: 'GBP', decimals: 5 },
];

export default function Header({ title }) {
  const { prices: wsPrices, connected, priceSource } = useWebSocket();
  const prices = useMt5Prices(wsPrices, priceSource);
  const prevBids = useRef({});
  const isMt5 = priceSource === 'mt5' && hasLiveMt5Tickers(prices);

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1 className="page-title">{title}</h1>
        <div className="live-indicator">
          <span
            className="live-dot"
            style={{
              background: connected ? (isMt5 ? '#3fb950' : '#8b949e') : '#f85149',
              boxShadow: connected && isMt5 ? '0 0 8px #3fb950' : 'none',
            }}
            title={connected ? (isMt5 ? 'MT5 live prices' : 'Waiting for MT5 quotes') : 'Disconnected'}
          />
          {connected ? (isMt5 ? 'MT5 LIVE' : 'WAITING') : 'OFFLINE'}
        </div>
      </div>
      <div className="top-bar-right">
        <div className="price-ticker">
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
        <button className="top-bar-btn"><Bell size={15} /></button>
        <button className="top-bar-btn"><Settings size={15} /></button>
      </div>
    </header>
  );
}
