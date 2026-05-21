import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_ENDPOINT } from '../config/env';
import { normalizeMt5Prices, hasLiveMt5Tickers } from '../utils/mt5Prices';

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
  const simulationRef = useRef(null);
  const pricesRef = useRef(prices);

  // Keep ref in sync
  useEffect(() => { pricesRef.current = prices; }, [prices]);

  // Client-side simulation when WebSocket can't connect
  const startSimulation = useCallback(() => {
    if (simulationRef.current) return;

    // Do not simulate prices on the client — server/MT5 only

    // Signal simulation
    const signalInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const directions = ['BUY', 'SELL'];
        const strategies = ['AI Momentum', 'AI Scalper', 'Trend Follower', 'AMD Sniper'];
        const direction = directions[Math.floor(Math.random() * 2)];
        const p = pricesRef.current;
        const newSignal = {
          symbol: 'XAUUSD',
          direction,
          confidence: Math.floor(60 + Math.random() * 35),
          entryPrice: parseFloat(p.XAUUSD.bid.toFixed(2)),
          strategy: strategies[Math.floor(Math.random() * strategies.length)],
          qualityScore: parseFloat((5 + Math.random() * 4.5).toFixed(1))
        };
        setSignals(prev => [newSignal, ...prev].slice(0, 10));
      }
    }, 10000);

    simulationRef.current = { signalInterval };
    setConnected(true);
  }, []);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      if (simulationRef.current.signalInterval) {
        clearInterval(simulationRef.current.signalInterval);
      }
      simulationRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_ENDPOINT);

      ws.onopen = () => {
        setConnected(true);
        stopSimulation();
        console.log('🔌 WebSocket connected to server');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'price_update':
              if (data.source === 'simulation') break;
              if (!data.source || data.source !== 'mt5') break;
              if (data.prices) {
                const mapped = normalizeMt5Prices(data.prices);
                if (hasLiveMt5Tickers(mapped)) {
                  setPrices((prev) => ({ ...prev, ...mapped }));
                  setPriceSource('mt5');
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
              setSignals(prev => [data.signal, ...prev].slice(0, 10));
              break;
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected, switching to simulation mode');
        startSimulation();
        reconnectRef.current = setTimeout(connect, 10000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      console.log('🔌 WebSocket unavailable, running in simulation mode');
      startSimulation();
      reconnectRef.current = setTimeout(connect, 15000);
    }
  }, [startSimulation, stopSimulation]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      stopSimulation();
    };
  }, [connect, stopSimulation]);

  return { prices, account, signals, connected, priceSource };
}
