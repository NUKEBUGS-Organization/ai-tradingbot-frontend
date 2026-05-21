import { memo, useMemo } from 'react';

/** TradingView symbols that load reliably in the free embed widget */
const TV_SYMBOLS = {
  XAUUSD: 'TICKMILL:XAUUSD',
  EURUSD: 'FX:EURUSD',
  GBPUSD: 'FX:GBPUSD',
};

function buildEmbedUrl(symbol) {
  const tvSymbol = TV_SYMBOLS[symbol] || TV_SYMBOLS.XAUUSD;
  const params = new URLSearchParams({
    symbol: tvSymbol,
    interval: '15',
    theme: 'dark',
    style: '1',
    timezone: 'Etc/UTC',
    withdateranges: '1',
    hide_side_toolbar: '0',
    allow_symbol_change: '0',
    save_image: '0',
    backgroundColor: '#0d1117',
    gridColor: '#1c2128',
    locale: 'en',
  });
  return `https://s.tradingview.com/widgetembed/?${params.toString()}`;
}

function TradingViewWidget({ symbol = 'XAUUSD' }) {
  const embedUrl = useMemo(() => buildEmbedUrl(symbol), [symbol]);

  return (
    <div className="live-chart-widget" style={{ height: '620px', minHeight: '620px', width: '100%' }}>
      <iframe
        key={symbol}
        title={`${symbol} live chart`}
        src={embedUrl}
        className="live-chart-iframe"
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

export default memo(TradingViewWidget);
