import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Maximize2, Minimize2, Moon, Sun, RefreshCw } from 'lucide-react';
import TradingViewChart from './TradingViewChart';

export const FOREX_PAIRS = [
  { id: 'XAUUSD', label: 'XAUUSD', title: 'Gold', symbol: 'OANDA:XAUUSD' },
  { id: 'EURUSD', label: 'EURUSD', title: 'Euro / US Dollar', symbol: 'FX:EURUSD' },
  { id: 'GBPUSD', label: 'GBPUSD', title: 'British Pound / US Dollar', symbol: 'FX:GBPUSD' },
  { id: 'USDJPY', label: 'USDJPY', title: 'US Dollar / Japanese Yen', symbol: 'FX:USDJPY' },
  { id: 'XTIUSD', label: 'XTIUSD', title: 'Crude Oil (WTI)', symbol: 'TVC:USOIL' },
];

const INTERVALS = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '30', label: '30m' },
  { value: '60', label: '1H' },
  { value: 'D', label: 'D' },
  { value: 'W', label: 'W' },
];

function getResponsiveChartHeight(viewportWidth, viewportHeight, isFullscreen) {
  if (isFullscreen) {
    return Math.max(360, viewportHeight - 160);
  }
  if (viewportWidth < 480) return 320;
  if (viewportWidth < 768) return 380;
  if (viewportWidth < 1024) return 460;
  return 560;
}

export default function ForexChartDashboard() {
  const [activePairId, setActivePairId] = useState('XAUUSD');
  const [interval, setInterval] = useState('15');
  const [theme, setTheme] = useState('dark');
  const [search, setSearch] = useState('');
  const [customSymbol, setCustomSymbol] = useState(null);
  const [chartKey, setChartKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));
  const shellRef = useRef(null);

  const isMobile = viewport.width < 768;

  const activePair = useMemo(
    () => FOREX_PAIRS.find((p) => p.id === activePairId) || FOREX_PAIRS[0],
    [activePairId]
  );

  const tvSymbol = customSymbol || activePair.symbol;

  const handlePairClick = (pairId) => {
    setCustomSymbol(null);
    setSearch('');
    setActivePairId(pairId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = search.trim().toUpperCase();
    if (!q) {
      setCustomSymbol(null);
      return;
    }
    const preset = FOREX_PAIRS.find((p) => p.id === q || p.label === q);
    if (preset) {
      setActivePairId(preset.id);
      setCustomSymbol(null);
      setSearch('');
      return;
    }
    const symbol = q.includes(':') ? q : `FX:${q}`;
    setCustomSymbol(symbol);
  };

  const handleRefresh = () => {
    setChartKey((k) => k + 1);
  };

  const toggleFullscreen = useCallback(async () => {
    const el = shellRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      /* ignore unsupported fullscreen */
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  const shellClass = [
    'forex-chart-dashboard w-full max-w-full min-w-0 rounded-xl border border-tv-border bg-tv-card/80 shadow-glass backdrop-blur-glass transition-all duration-300',
    isFullscreen ? 'fixed inset-0 z-[200] m-0 flex flex-col rounded-none border-0 p-2 sm:p-4' : '',
  ].join(' ');

  const chartHeight = getResponsiveChartHeight(viewport.width, viewport.height, isFullscreen);

  return (
    <div ref={shellRef} className={shellClass}>
      {/* Header */}
      <div className="forex-chart-header flex flex-col gap-3 border-b border-tv-border p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4">
        <div className="min-w-0">
          <h2 className="text-base font-bold tracking-tight text-white sm:text-xl">Live Forex Charts</h2>
          <p className="mt-0.5 truncate text-xs text-tv-muted sm:text-sm">
            {activePair.label}
            <span className="mx-1.5 text-tv-border">·</span>
            {activePair.title}
            {customSymbol && (
              <>
                <span className="mx-1.5 text-tv-border">·</span>
                <span className="font-mono text-tv-gold">{customSymbol}</span>
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex w-full min-w-0 gap-2 sm:max-w-xs sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Symbol (e.g. FX:EURUSD)"
            className="flex-1 rounded-lg border border-tv-border bg-tv-bg px-3 py-2 text-xs text-white placeholder:text-tv-muted focus:border-tv-gold focus:outline-none focus:ring-1 focus:ring-tv-gold sm:text-sm"
            aria-label="Symbol search"
          />
          <button
            type="submit"
            className="rounded-lg border border-tv-border bg-tv-bg px-3 py-2 text-xs font-medium text-tv-gold transition hover:border-tv-gold sm:text-sm"
          >
            Go
          </button>
        </form>
      </div>

      {/* Toolbar */}
      <div className="forex-chart-toolbar flex flex-col gap-2 border-b border-tv-border px-3 py-2 sm:gap-3 sm:px-4 sm:py-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Pair tabs */}
        <div className="forex-pair-tabs flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Forex pairs">
          {FOREX_PAIRS.map((pair) => {
            const isActive = !customSymbol && activePairId === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handlePairClick(pair.id)}
                className={[
                  'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm',
                  isActive
                    ? 'bg-tv-gold text-black shadow-md shadow-tv-gold/25'
                    : 'border border-tv-border bg-tv-bg text-tv-muted hover:border-tv-gold/50 hover:text-white',
                ].join(' ')}
              >
                {pair.label}
              </button>
            );
          })}
        </div>

        <div className="forex-chart-controls flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Interval */}
          <div className="forex-interval-tabs flex max-w-full gap-1 overflow-x-auto rounded-lg border border-tv-border bg-tv-bg p-1">
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                type="button"
                onClick={() => setInterval(iv.value)}
                className={[
                  'shrink-0 rounded-md px-2 py-1 text-[11px] font-medium transition-colors duration-200 sm:px-2.5 sm:text-xs',
                  interval === iv.value
                    ? 'bg-tv-gold/20 text-tv-gold'
                    : 'text-tv-muted hover:text-white',
                ].join(' ')}
              >
                {iv.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            className="flex items-center gap-1.5 rounded-lg border border-tv-border bg-tv-bg px-3 py-2 text-xs text-tv-muted transition hover:border-tv-gold/50 hover:text-white"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 rounded-lg border border-tv-border bg-tv-bg px-3 py-2 text-xs text-tv-muted transition hover:border-tv-gold/50 hover:text-white"
            title="Reload chart"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-lg border border-tv-border bg-tv-bg px-3 py-2 text-xs text-tv-muted transition hover:border-tv-gold/50 hover:text-white"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className={`forex-chart-stage p-1 sm:p-4 ${isFullscreen ? 'flex min-h-0 flex-1 flex-col' : ''}`}>
        <TradingViewChart
          key={`${tvSymbol}-${interval}-${theme}-${chartKey}-${isMobile ? 'm' : 'd'}`}
          symbol={tvSymbol}
          interval={interval}
          theme={theme}
          height={chartHeight}
          allowSymbolChange={!!customSymbol}
          mobile={isMobile}
        />
      </div>
    </div>
  );
}
