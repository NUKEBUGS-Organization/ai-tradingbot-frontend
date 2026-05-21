import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { useWebSocket } from '../services/websocket';

const POLL_MS = 15000;

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts).slice(5, 16);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatPrice(sym, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const digits = sym === 'XAUUSD' ? 2 : 5;
  return n.toFixed(digits);
}

function candlesToSeries(candles, liveBid) {
  if (!candles?.length) return [];
  const rows = candles.map((c, i) => ({
    i,
    time: c.timestamp || c.time || i,
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close),
  }));
  if (liveBid > 0 && rows.length) {
    const last = { ...rows[rows.length - 1] };
    last.close = liveBid;
    last.high = Math.max(last.high, liveBid);
    last.low = Math.min(last.low, liveBid);
    rows[rows.length - 1] = last;
  }
  return rows;
}

function LiveChart({ symbol = 'XAUUSD' }) {
  const { prices } = useWebSocket();
  const [candles, setCandles] = useState([]);
  const [meta, setMeta] = useState({ timeframe: 'M15', loading: true, error: null });

  const liveBid = useMemo(() => {
    const q = prices?.[symbol] || prices?.[`${symbol}m`];
    return Number(q?.bid) || 0;
  }, [prices, symbol]);

  const series = useMemo(() => candlesToSeries(candles, liveBid), [candles, liveBid]);

  const load = useCallback(async () => {
    setMeta((m) => ({ ...m, loading: true, error: null }));
    const data = await api.getEngineCandles(symbol, { timeframe: 'M15', limit: 150 });
    if (!data?.candles?.length) {
      setCandles([]);
      setMeta({
        timeframe: data?.timeframe || 'M15',
        loading: false,
        error: data?.message || data?.detail || 'No candle data — start Python engine and connect MT5 EA',
      });
      return;
    }
    setCandles(data.candles);
    setMeta({
      timeframe: data.timeframe || 'M15',
      brokerSymbol: data.symbol,
      loading: false,
      error: null,
    });
  }, [symbol]);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const yDomain = useMemo(() => {
    if (!series.length) return ['auto', 'auto'];
    const lows = series.map((r) => r.low);
    const highs = series.map((r) => r.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.08 || 0.001;
    return [min - pad, max + pad];
  }, [series]);

  return (
    <div className="live-chart-widget" style={{ height: '620px', minHeight: '620px', width: '100%' }}>
      <div className="live-chart-toolbar">
        <span className="live-chart-meta">
          {symbol}
          {meta.brokerSymbol && meta.brokerSymbol !== symbol ? ` (${meta.brokerSymbol})` : ''}
          {' · '}
          {meta.timeframe}
          {liveBid > 0 ? ` · ${formatPrice(symbol, liveBid)}` : ''}
        </span>
        <span className="live-chart-badge">MT5 data</span>
      </div>
      <div className="live-chart-canvas">
        {meta.loading && !series.length ? (
          <div className="live-chart-placeholder">Loading chart…</div>
        ) : meta.error && !series.length ? (
          <div className="live-chart-placeholder">{meta.error}</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="liveChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d4af37" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1c2128" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tickFormatter={formatTime}
                stroke="#545d68"
                tick={{ fontSize: 10 }}
                minTickGap={40}
              />
              <YAxis
                domain={yDomain}
                stroke="#545d68"
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => formatPrice(symbol, v)}
                width={72}
              />
              <Tooltip
                contentStyle={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={formatTime}
                formatter={(value, name) => [formatPrice(symbol, value), name]}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#d4af37"
                strokeWidth={2}
                fill="url(#liveChartFill)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default memo(LiveChart);
