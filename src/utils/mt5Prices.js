/** Map broker symbol keys (XAUUSDm) to dashboard tickers and reject simulated candle quotes. */

const TICKER_SYMBOLS = ['XAUUSD', 'EURUSD', 'GBPUSD'];

export function isPlausibleLiveBid(configSym, bid) {
  if (bid == null || bid <= 0) return false;
  if (configSym === 'EURUSD' || configSym === 'GBPUSD') return bid > 0.5 && bid < 3.5;
  if (configSym === 'XAUUSD') return bid > 500 && bid < 20000;
  return true;
}

export function normalizeMt5Prices(raw) {
  if (!raw || typeof raw !== 'object') return {};

  const out = {};
  for (const [symbol, q] of Object.entries(raw)) {
    if (!q || q.live === false) continue;
    const bid = Number(q.bid);
    const ask = Number(q.ask ?? q.bid);
    if (!Number.isFinite(bid) || bid <= 0) continue;
    const key = String(symbol).toUpperCase();
    if (!isPlausibleLiveBid(key, bid) && TICKER_SYMBOLS.includes(key)) continue;
    out[key] = { bid, ask, spread: Number(q.spread) || 0, live: true };
  }

  for (const configSym of TICKER_SYMBOLS) {
    if (out[configSym]?.bid && isPlausibleLiveBid(configSym, out[configSym].bid)) continue;
    for (const [brokerKey, q] of Object.entries(raw)) {
      if (!q || q.live === false) continue;
      const ku = String(brokerKey).toUpperCase();
      const match =
        ku === configSym ||
        ku.startsWith(configSym) ||
        (configSym === 'XAUUSD' && (ku.includes('XAU') || ku === 'GOLD')) ||
        (configSym === 'GBPUSD' && ku.includes('GBP') && ku.includes('USD')) ||
        (configSym === 'EURUSD' && ku.includes('EUR') && ku.includes('USD'));
      if (!match) continue;
      const bid = Number(q.bid);
      const ask = Number(q.ask ?? q.bid);
      if (!isPlausibleLiveBid(configSym, bid)) continue;
      out[configSym] = { bid, ask, spread: Number(q.spread) || 0, live: true };
      break;
    }
  }

  return out;
}

export function hasLiveMt5Tickers(prices) {
  return TICKER_SYMBOLS.some((sym) => isPlausibleLiveBid(sym, prices?.[sym]?.bid));
}
