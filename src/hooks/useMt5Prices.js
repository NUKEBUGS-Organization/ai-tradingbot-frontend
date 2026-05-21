import { useState, useEffect } from 'react';
import api from '../services/api';
import { normalizeMt5Prices, hasLiveMt5Tickers } from '../utils/mt5Prices';

/** Live MT5 quotes for header tickers — polls engine when WebSocket has no valid live feed. */
export function useMt5Prices(wsPrices, priceSource) {
  const [enginePrices, setEnginePrices] = useState(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const eng = await api.getEngineStatus();
        const raw = eng?.mt5_prices;
        const mapped = normalizeMt5Prices(raw);
        if (hasLiveMt5Tickers(mapped)) {
          setEnginePrices(mapped);
        }
      } catch (_) {
        /* ignore */
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, []);

  const wsNormalized = normalizeMt5Prices(wsPrices);
  if (priceSource === 'mt5' && hasLiveMt5Tickers(wsNormalized)) {
    return { ...wsNormalized };
  }
  if (enginePrices && hasLiveMt5Tickers(enginePrices)) {
    return { ...wsNormalized, ...enginePrices };
  }
  return wsNormalized;
}

export { hasLiveMt5Tickers };
