import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Activity, RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../services/api';

const ACTION_COLORS = {
  TRADE: '#3fb950',
  NO_TRADE: '#d4af37',
  BLOCKED: '#f0883e',
  SKIP: '#8b949e',
  NO_SIGNAL: '#8b949e',
  OFFLINE: '#f85149'
};

const ACTION_ICONS = {
  TRADE: <CheckCircle size={14} />,
  NO_TRADE: <Minus size={14} />,
  BLOCKED: <AlertTriangle size={14} />,
  SKIP: <Clock size={14} />,
  NO_SIGNAL: <Minus size={14} />,
  OFFLINE: <XCircle size={14} />
};

function FilterBadge({ label, passed, value }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 12, fontSize: 11,
      background: passed ? 'rgba(63,185,80,0.15)' : 'rgba(248,81,73,0.15)',
      color: passed ? '#3fb950' : '#f85149',
      border: `1px solid ${passed ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
      margin: '2px'
    }}>
      {passed ? '✅' : '❌'} {label}{value !== undefined ? `: ${value}` : ''}
    </div>
  );
}

function AnalysisRow({ analysis, index }) {
  const [expanded, setExpanded] = useState(false);
  const action = analysis.action || 'UNKNOWN';
  const color = ACTION_COLORS[action] || '#8b949e';
  const filters = analysis.filters || {};
  const analysisData = analysis.analysis || {};
  const signal = analysis.signal;

  const sessionPassed = filters.session?.tradeable !== false && !filters.session?.is_blocked;
  const newsPassed = !filters.news?.blocked;
  const volPassed = filters.volatility?.passed !== false;
  const riskPassed = filters.risk?.allowed !== false;

  const formatTime = (ts) => {
    if (!ts) return 'N/A';
    try {
      return new Date(ts).toLocaleTimeString();
    } catch { return ts; }
  };

  return (
    <>
      <tr
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: 'pointer',
          background: expanded ? 'rgba(212,175,55,0.05)' : 'transparent',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <td style={{ padding: '10px 12px', fontSize: 12, color: '#8b949e' }}>
          {formatTime(analysis.timestamp)}
        </td>
        <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
          {analysis.symbol || 'N/A'}
        </td>
        <td style={{ padding: '10px 12px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
            background: color + '22', color
          }}>
            {ACTION_ICONS[action]} {action}
          </span>
        </td>
        <td style={{ padding: '10px 12px', fontSize: 13, color: (analysis.confidence || 0) >= 65 ? '#3fb950' : '#f85149', fontWeight: 600 }}>
          {analysis.confidence ? `${analysis.confidence}%` : '0%'}
        </td>
        <td style={{ padding: '10px 12px', fontSize: 12, color: '#8b949e', maxWidth: 300 }}>
          {analysis.reason || (action === 'TRADE' ? 'Signal generated' : '—')}
        </td>
        <td style={{ padding: '10px 12px' }}>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <FilterBadge label="Session" passed={sessionPassed} value={filters.session?.session} />
            <FilterBadge label="News" passed={newsPassed} />
            <FilterBadge label="Volatility" passed={volPassed} />
            <FilterBadge label="Risk" passed={riskPassed} />
          </div>
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: 'rgba(13,17,23,0.8)' }}>
          <td colSpan={6} style={{ padding: '16px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }} className="analysis-detail-grid">
              
              {analysisData.h4_bias && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>H4 BIAS</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: analysisData.h4_bias.bias === 'bullish' ? '#3fb950' : analysisData.h4_bias.bias === 'bearish' ? '#f85149' : '#8b949e' }}>
                    {(analysisData.h4_bias.bias || 'neutral').toUpperCase()}
                  </div>
                  {analysisData.h4_bias.strength && (
                    <div style={{ fontSize: 11, color: '#545d68', marginTop: 4 }}>Strength: {analysisData.h4_bias.strength}</div>
                  )}
                </div>
              )}

              {analysisData.amd && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>AI Market Phase</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f0883e' }}>
                    {(analysisData.amd.current_phase || 'unknown').toUpperCase()}
                  </div>
                  {analysisData.amd.trade_direction && (
                    <div style={{ fontSize: 11, color: '#545d68', marginTop: 4 }}>Direction: {analysisData.amd.trade_direction}</div>
                  )}
                </div>
              )}

              {analysisData.score && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>CONFIDENCE SCORE</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: (analysisData.score.total_score || 0) >= 65 ? '#d4af37' : '#f85149' }}>
                    {analysisData.score.total_score || 0}%
                  </div>
                  <div style={{ fontSize: 11, color: '#545d68' }}>Grade: {analysisData.score.grade || 'F'}</div>
                </div>
              )}

              {filters.session && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>SESSION FILTER</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: filters.session?.tradeable !== false && !filters.session?.is_blocked ? '#3fb950' : '#f85149' }}>
                    {filters.session?.tradeable !== false && !filters.session?.is_blocked ? '✅ PASS' : '❌ BLOCKED'}
                  </div>
                  <div style={{ fontSize: 11, color: '#545d68', marginTop: 4 }}>
                    {filters.session.session?.toUpperCase() || 'UNKNOWN'}
                  </div>
                  <div style={{ fontSize: 11, color: '#545d68', marginTop: 4 }}>
                    tradeable: {String(filters.session?.tradeable)} | is_blocked: {String(filters.session?.is_blocked)}
                  </div>
                </div>
              )}

              {filters.volatility && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>VOLATILITY FILTER</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: filters.volatility.passed ? '#3fb950' : '#f85149' }}>
                    {filters.volatility.passed ? '✅ PASS' : '❌ BLOCKED'}
                  </div>
                  {filters.volatility.atr && (
                    <div style={{ fontSize: 11, color: '#545d68', marginTop: 4 }}>ATR: {filters.volatility.atr?.toFixed(2)}</div>
                  )}
                </div>
              )}

              {filters.risk && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>RISK CHECK</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: filters.risk.allowed ? '#3fb950' : '#f85149' }}>
                    {filters.risk.allowed ? '✅ PASS' : '❌ BLOCKED'}
                  </div>
                  {filters.risk.reason && (
                    <div style={{ fontSize: 11, color: '#545d68', marginTop: 4 }}>{filters.risk.reason}</div>
                  )}
                </div>
              )}

              {signal && (
                <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid rgba(63,185,80,0.3)', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>TRADE SIGNAL</div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13 }}>Type: <strong style={{ color: signal.type === 'BUY' ? '#3fb950' : '#f85149' }}>{signal.type}</strong></span>
                    <span style={{ fontSize: 13 }}>Entry: <strong style={{ color: '#d4af37' }}>{signal.entry}</strong></span>
                    <span style={{ fontSize: 13 }}>SL: <strong style={{ color: '#f85149' }}>{signal.sl}</strong></span>
                    <span style={{ fontSize: 13 }}>TP: <strong style={{ color: '#3fb950' }}>{signal.tp}</strong></span>
                    <span style={{ fontSize: 13 }}>Lot: <strong>{signal.lot_size}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AnalysisDebug() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadHistory = async () => {
    try {
      const data = await api.getAnalysisHistory();
      if (data?.history) {
        setHistory(data.history);
        setTotal(data.total || data.history.length);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Failed to load analysis history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadHistory, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const summary = history.reduce((acc, a) => {
    const action = a.action || 'UNKNOWN';
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {});

  const avgConfidence = history.length > 0
    ? (history.reduce((sum, a) => sum + (a.confidence || 0), 0) / history.length).toFixed(1)
    : 0;

  const blockedReasons = history
    .filter(a => a.action === 'BLOCKED' && a.reason)
    .reduce((acc, a) => {
      acc[a.reason] = (acc[a.reason] || 0) + 1;
      return acc;
    }, {});

  const topBlockedReason = Object.entries(blockedReasons).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Analysis Debug Log" />
        <div className="page-content">

          <div className="stats-grid analysis-stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Analyses', value: total, color: '#58a6ff' },
              { label: 'Trade Signals', value: summary.TRADE || 0, color: '#3fb950' },
              { label: 'No Signal', value: (summary.NO_TRADE || 0) + (summary.NO_SIGNAL || 0), color: '#d4af37' },
              { label: 'Blocked', value: summary.BLOCKED || 0, color: '#f0883e' },
              { label: 'Avg Confidence', value: `${avgConfidence}%`, color: '#a78bfa' },
              { label: 'Top Block Reason', value: topBlockedReason ? topBlockedReason[0].replace('Session blocked: ', '') : 'None', color: '#f85149', small: true }
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">{stat.label}</span>
                  <Activity size={14} style={{ color: stat.color }} />
                </div>
                <div className="stat-card-value" style={{ color: stat.color, fontSize: stat.small ? 14 : undefined }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><Activity size={16} /> Analysis History (last {history.length})</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {lastUpdated && (
                  <span style={{ fontSize: 11, color: '#545d68' }}>Updated: {lastUpdated}</span>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8b949e', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={e => setAutoRefresh(e.target.checked)}
                  />
                  Auto-refresh (15s)
                </label>
                <button onClick={loadHistory} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }}>
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            </div>
            <div className="overflow-table-wrapper analysis-table-wrap">
              {loading ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>Loading analysis history...</div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>
                  <Activity size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <div>No analysis data yet.</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>Analysis runs every 90 seconds when candle data is available. Signal generation runs independently of MT5 connection.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      {['Time', 'Symbol', 'Action', 'Confidence', 'Reason', 'Filters'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((analysis, i) => (
                      <AnalysisRow key={i} analysis={analysis} index={i} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
