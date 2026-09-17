import { useState, useEffect } from 'react';
import api from '../services/api';
import { normalizeMt5Prices, hasLiveMarketTickers } from '../utils/mt5Prices';

/** Market quotes for header tickers — polls engine when WebSocket has no valid feed. */
export function useMt5Prices(wsPrices, priceSource) {
  const [enginePrices, setEnginePrices] = useState(null);
  const [engineSource, setEngineSource] = useState(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const eng = await api.getEngineStatus();
        const raw = eng?.mt5_prices;
        const mapped = normalizeMt5Prices(raw);
        if (hasLiveMarketTickers(mapped)) {
          setEnginePrices(mapped);
          setEngineSource(eng?.price_source || 'twelvedata');
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
  if (
    (priceSource === 'mt5' || priceSource === 'twelvedata') &&
    hasLiveMarketTickers(wsNormalized)
  ) {
    return { prices: { ...wsNormalized }, source: priceSource };
  }
  if (enginePrices && hasLiveMarketTickers(enginePrices)) {
    return {
      prices: { ...wsNormalized, ...enginePrices },
      source: engineSource || 'twelvedata',
    };
  }
  return { prices: wsNormalized, source: priceSource };
}

export { hasLiveMarketTickers, hasLiveMarketTickers as hasLiveMt5Tickers };
