import { useState, useEffect, useRef, useCallback } from 'react';
import { WS_ENDPOINT } from '../config/env';

export function useWebSocket() {
  const [prices, setPrices] = useState({
    XAUUSD: { bid: 2365.50, ask: 2365.80, spread: 30 },
    EURUSD: { bid: 1.08420, ask: 1.08432, spread: 12 },
    GBPUSD: { bid: 1.26540, ask: 1.26555, spread: 15 }
  });
  const [account, setAccount] = useState(null);
  const [signals, setSignals] = useState([]);
  const [connected, setConnected] = useState(true);
  const wsRef = useRef(null);
  const reconnectRef = useRef(null);
  const simulationRef = useRef(null);
  const pricesRef = useRef(prices);

  // Keep ref in sync
  useEffect(() => { pricesRef.current = prices; }, [prices]);

  // Client-side simulation when WebSocket can't connect
  const startSimulation = useCallback(() => {
    if (simulationRef.current) return;

    // Price simulation
    const priceInterval = setInterval(() => {
      setPrices(prev => {
        const gold = prev.XAUUSD.bid + (Math.random() - 0.48) * 2.5;
        const eur = prev.EURUSD.bid + (Math.random() - 0.49) * 0.0008;
        const gbp = prev.GBPUSD.bid + (Math.random() - 0.49) * 0.0010;
        return {
          XAUUSD: { bid: parseFloat(gold.toFixed(2)), ask: parseFloat((gold + 0.30).toFixed(2)), spread: 30 },
          EURUSD: { bid: parseFloat(eur.toFixed(5)), ask: parseFloat((eur + 0.00012).toFixed(5)), spread: 12 },
          GBPUSD: { bid: parseFloat(gbp.toFixed(5)), ask: parseFloat((gbp + 0.00015).toFixed(5)), spread: 15 }
        };
      });
    }, 1500);

    // Do not simulate account — real MT5 data comes from GET /api/engine/status and WS source=mt5

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

    simulationRef.current = { priceInterval, signalInterval };
    setConnected(true);
  }, []);

  const stopSimulation = useCallback(() => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current.priceInterval);
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
              setPrices(data.prices);
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

  return { prices, account, signals, connected };
}
