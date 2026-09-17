import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_ENDPOINT } from '../config/env';
import { normalizeMt5Prices, hasLiveMarketTickers } from '../utils/mt5Prices';

const LIVE_SOURCES = new Set(['mt5', 'twelvedata']);

export function useWebSocket() {
  const [prices, setPrices] = useState({
    XAUUSD: { bid: null, ask: null, spread: 0 },
    EURUSD: { bid: null, ask: null, spread: 0 },
    GBPUSD: { bid: null, ask: null, spread: 0 },
  });
  const [account, setAccount] = useState(null);
  const [signals, setSignals] = useState([]);
  const [connected, setConnected] = useState(true);
  const [priceSource, setPriceSource] = useState(null);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const pricesRef = useRef(prices);

  useEffect(() => {
    pricesRef.current = prices;
  }, [prices]);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_ENDPOINT);

      ws.onopen = () => {
        setConnected(true);
        console.log('🔌 WebSocket connected to server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'price_update':
              if (data.source === 'simulation') break;
              if (!LIVE_SOURCES.has(data.source)) break;
              if (data.prices) {
                const mapped = normalizeMt5Prices(data.prices);
                if (hasLiveMarketTickers(mapped)) {
                  setPrices((prev) => ({ ...prev, ...mapped }));
                  setPriceSource(data.source);
                }
              }
              break;
            case 'account_update':
              if (data.source === 'simulation') break;
              if (data.account) {
                setAccount({ ...data.account, source: data.source || 'mt5' });
              }
              break;
            case 'signal_alert':
              setSignals((prev) => [data.signal, ...prev].slice(0, 10));
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 10000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      console.log('🔌 WebSocket unavailable');
      setConnected(false);
      reconnectRef.current = setTimeout(connect, 15000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  return { prices, account, signals, connected, priceSource };
}
