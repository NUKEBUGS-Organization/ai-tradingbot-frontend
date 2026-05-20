import React, { useRef } from 'react';
import { useWebSocket } from '../services/websocket';
import { useMt5Prices } from '../hooks/useMt5Prices';
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
  const isMt5 = priceSource === 'mt5' || (prices?.XAUUSD?.bid && Math.abs(prices.XAUUSD.bid - 2365.5) > 1);

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h1 className="page-title">{title}</h1>
        <div className="live-indicator">
          <span className="live-dot"></span>
          {connected ? (isMt5 ? 'MT5 LIVE' : 'SIM') : 'OFFLINE'}
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
            return (
              <div className="ticker-item" key={key}>
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
