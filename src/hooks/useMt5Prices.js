import { useState, useEffect } from 'react';
import api from '../services/api';

/** Poll engine status for mt5_prices when WebSocket has not received MT5 quotes yet. */
export function useMt5Prices(wsPrices, priceSource) {
  const [enginePrices, setEnginePrices] = useState(null);

  useEffect(() => {
    if (priceSource === 'mt5') return undefined;

    const poll = async () => {
      try {
        const eng = await api.getEngineStatus();
        const p = eng?.mt5_prices || eng?.mt5_bridge?.prices;
        if (p && Object.keys(p).length > 0) {
          const mapped = { ...p };
          for (const [sym, q] of Object.entries(p)) {
            if (sym.endsWith('m') || sym.endsWith('.')) {
              const base = sym.replace(/m$|\.$/, '');
              if (!mapped[base]) mapped[base] = q;
            }
          }
          setEnginePrices(mapped);
        }
      } catch (_) {
        /* ignore */
      }
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [priceSource]);

  if (priceSource === 'mt5') return wsPrices;
  if (enginePrices) return { ...wsPrices, ...enginePrices };
  return wsPrices;
}
