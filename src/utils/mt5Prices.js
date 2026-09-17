/** Map broker symbol keys (XAUUSDm) to dashboard tickers and accept MT5 + TwelveData quotes. */

const TICKER_SYMBOLS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'XTIUSD'];

export function isPlausibleLiveBid(configSym, bid) {
  if (bid == null || bid <= 0) return false;
  if (configSym === 'EURUSD' || configSym === 'GBPUSD') return bid > 0.5 && bid < 3.5;
  if (configSym === 'USDJPY' || configSym === 'GBPJPY') return bid > 80 && bid < 400;
  if (configSym === 'XAUUSD') return bid > 500 && bid < 20000;
  if (configSym === 'XTIUSD') return bid > 10 && bid < 500;
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
    out[key] = {
      bid,
      ask,
      spread: Number(q.spread) || 0,
      live: true,
      source: q.source || undefined,
    };
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
        (configSym === 'GBPUSD' && ku.includes('GBP') && ku.includes('USD') && !ku.includes('JPY')) ||
        (configSym === 'EURUSD' && ku.includes('EUR') && ku.includes('USD')) ||
        (configSym === 'USDJPY' && ku.includes('USD') && ku.includes('JPY') && !ku.includes('GBP')) ||
        (configSym === 'GBPJPY' && ku.includes('GBP') && ku.includes('JPY')) ||
        (configSym === 'XTIUSD' && (ku.includes('XTI') || ku.includes('WTI') || ku.includes('OIL')));
      if (!match) continue;
      const bid = Number(q.bid);
      const ask = Number(q.ask ?? q.bid);
      if (!isPlausibleLiveBid(configSym, bid)) continue;
      out[configSym] = {
        bid,
        ask,
        spread: Number(q.spread) || 0,
        live: true,
        source: q.source || undefined,
      };
      break;
    }
  }

  return out;
}

export function hasLiveMt5Tickers(prices) {
  return TICKER_SYMBOLS.some((sym) => isPlausibleLiveBid(sym, prices?.[sym]?.bid));
}

export function hasLiveMarketTickers(prices) {
  return hasLiveMt5Tickers(prices);
}
