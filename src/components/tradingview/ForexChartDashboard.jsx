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

const CHART_HEIGHT = 600;

export default function ForexChartDashboard() {
  const [activePairId, setActivePairId] = useState('XAUUSD');
  const [interval, setInterval] = useState('15');
  const [theme, setTheme] = useState('dark');
  const [search, setSearch] = useState('');
  const [customSymbol, setCustomSymbol] = useState(null);
  const [chartKey, setChartKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );
  const shellRef = useRef(null);

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
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const shellClass = [
    'w-full rounded-xl border border-tv-border bg-tv-card/80 shadow-glass backdrop-blur-glass transition-all duration-300',
    isFullscreen ? 'fixed inset-0 z-[200] m-0 flex flex-col rounded-none border-0 p-4' : '',
  ].join(' ');

  const chartHeight = isFullscreen
    ? Math.max(400, viewportHeight - 160)
    : CHART_HEIGHT;

  return (
    <div ref={shellRef} className={shellClass}>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-tv-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">Live Forex Charts</h2>
          <p className="mt-0.5 text-xs text-tv-muted sm:text-sm">
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

        <form onSubmit={handleSearchSubmit} className="flex w-full max-w-xs gap-2 sm:w-auto">
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
      <div className="flex flex-col gap-3 border-b border-tv-border px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Pair tabs */}
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Forex pairs">
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
                  'rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200',
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

        <div className="flex flex-wrap items-center gap-2">
          {/* Interval */}
          <div className="flex flex-wrap gap-1 rounded-lg border border-tv-border bg-tv-bg p-1">
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                type="button"
                onClick={() => setInterval(iv.value)}
                className={[
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200',
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
      <div className={`p-2 sm:p-4 ${isFullscreen ? 'flex-1 min-h-0' : ''}`}>
        <TradingViewChart
          key={`${tvSymbol}-${interval}-${theme}-${chartKey}`}
          symbol={tvSymbol}
          interval={interval}
          theme={theme}
          height={chartHeight}
          allowSymbolChange={!!customSymbol}
        />
      </div>
    </div>
  );
}
