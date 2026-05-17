import React from 'react';
import { useWebSocket } from '../services/websocket';
import { Bell, Settings } from 'lucide-react';

export default function Header({ title }) {
  const { prices, connected } = useWebSocket();

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1 className="page-title">{title}</h1>
        <div className="live-indicator">
          <span className="live-dot"></span>
          {connected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>
      <div className="top-bar-right">
        <div className="price-ticker">
          <div className="ticker-item">
            <span className="ticker-symbol">XAU</span>
            <span className={`ticker-price ${prices.XAUUSD.bid > 2365 ? 'up' : 'down'}`}>
              {prices.XAUUSD.bid.toFixed(2)}
            </span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">EUR</span>
            <span className={`ticker-price ${prices.EURUSD.bid > 1.084 ? 'up' : 'down'}`}>
              {prices.EURUSD.bid.toFixed(5)}
            </span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">GBP</span>
            <span className={`ticker-price ${prices.GBPUSD.bid > 1.265 ? 'up' : 'down'}`}>
              {prices.GBPUSD.bid.toFixed(5)}
            </span>
          </div>
        </div>
        <button className="top-bar-btn"><Bell size={15} /></button>
        <button className="top-bar-btn"><Settings size={15} /></button>
      </div>
    </header>
  );
}
