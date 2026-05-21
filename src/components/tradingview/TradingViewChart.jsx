import { useEffect, useRef, useState, useId } from 'react';
import { loadTradingViewScript } from '../../utils/loadTradingViewScript';

/**
 * TradingView Advanced Chart via official tv.js widget API.
 * @param {object} props
 * @param {string} props.symbol - TradingView symbol (e.g. OANDA:XAUUSD)
 * @param {string} [props.interval='15'] - Chart interval
 * @param {'dark'|'light'} [props.theme='dark']
 * @param {number} [props.height=600]
 * @param {boolean} [props.allowSymbolChange=false]
 */
export default function TradingViewChart({
  symbol,
  interval = '15',
  theme = 'dark',
  height = 600,
  allowSymbolChange = false,
}) {
  const wrapperRef = useRef(null);
  const widgetRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reactId = useId();
  const containerId = `tradingview_${reactId.replace(/:/g, '')}`;

  useEffect(() => {
    let cancelled = false;
    const wrapper = wrapperRef.current;
    if (!wrapper || !symbol) return undefined;

    setLoading(true);
    setError(null);
    wrapper.innerHTML = '';

    const mount = document.createElement('div');
    mount.id = containerId;
    mount.className = 'tradingview-widget-container';
    mount.style.width = '100%';
    mount.style.height = '100%';
    wrapper.appendChild(mount);

    loadTradingViewScript()
      .then(() => {
        if (cancelled) return;
        if (!window.TradingView?.widget) {
          throw new Error('TradingView widget API is not available');
        }

        const isDark = theme === 'dark';

        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol,
          interval,
          timezone: 'Etc/UTC',
          theme,
          style: '1',
          locale: 'en',
          toolbar_bg: isDark ? '#161b22' : '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: allowSymbolChange,
          container_id: containerId,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          studies: [],
          backgroundColor: isDark ? '#0d1117' : '#ffffff',
          gridColor: isDark ? '#1c2128' : '#e1e3eb',
          support_host: 'https://www.tradingview.com',
        });

        const done = () => {
          if (!cancelled) setLoading(false);
        };
        window.setTimeout(done, 800);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load TradingView chart');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      widgetRef.current = null;
      wrapper.innerHTML = '';
    };
  }, [symbol, interval, theme, containerId, allowSymbolChange]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg"
      style={{ height: `${height}px`, minHeight: `${height}px` }}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-tv-bg/90 backdrop-blur-sm">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-tv-gold border-t-transparent" />
          <p className="text-sm text-tv-muted">Loading chart…</p>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-tv-bg/95 p-6 text-center">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      <div ref={wrapperRef} className="h-full w-full" aria-label={`TradingView chart ${symbol}`} />
    </div>
  );
}
