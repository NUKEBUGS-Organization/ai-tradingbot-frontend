import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LockedFeature from '../components/LockedFeature';
import { useAuth, getUserTier } from '../context/AuthContext';
import { useWebSocket } from '../services/websocket';
import api from '../services/api';
import { Brain, TrendingUp, TrendingDown, Minus, Activity, Gauge, Clock, BarChart3, Zap, Eye } from 'lucide-react';
import SignalDetailModal from '../components/SignalDetailModal';
import { GradeBadge, SessionBadge, AmdPhaseBadge, H4BiasIndicator, RiskBadge } from '../components/signalBadges';
import { displayProductName } from '../utils/product';
import MaskedSignalValue, { isSignalMasked } from '../components/MaskedSignalValue';
import { formatMarketBias, formatMarketPhase, formatSession } from '../utils/signalDisplay';
import {
  outcomeLabel,
  outcomeBadgeClass,
  isFreshAlert,
  normalizeSignalStatus,
} from '../utils/signalOutcome';

export default function AISignals() {
  const { user } = useAuth();
  const userTier = getUserTier(user);
  const { signals: liveSignals } = useWebSocket();
  const [signals, setSignals] = useState([]);
  const [signalStats, setSignalStats] = useState({ wins: 0, losses: 0, pending: 0, total: 0, win_rate: 0 });
  const [analysis, setAnalysis] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [s, engineRes, a] = await Promise.all([
        api.getSignals(),
        api.getEngineActiveSignals().catch(() => ({ signals: [], stats: {} })),
        api.getMarketAnalysis(),
      ]);
      const engineS = Array.isArray(engineRes) ? engineRes : (engineRes?.signals || []);
      const stats = (!Array.isArray(engineRes) && engineRes?.stats) || {};
      const byKey = new Map();
      const add = (row) => {
        if (!row?.symbol) return;
        const sym = String(row.symbol).toUpperCase();
        const st = normalizeSignalStatus(row.status);
        const key = st === 'active' ? `active:${sym}` : `${st}:${row.id || row._id || sym}:${row.timestamp || row.createdAt || ''}`;
        const t = new Date(row.createdAt || row.timestamp || 0).getTime();
        const prev = byKey.get(key);
        const prevT = prev ? new Date(prev.createdAt || prev.timestamp || 0).getTime() : 0;
        if (!prev || t >= prevT) byKey.set(key, { ...row, status: st });
      };
      engineS.forEach(add);
      (Array.isArray(s) ? s : []).forEach(add);
      setSignals([...byKey.values()].sort(
        (x, y) => new Date(y.createdAt || y.timestamp || 0) - new Date(x.createdAt || x.timestamp || 0)
      ));
      if (stats && (stats.wins != null || stats.total != null)) {
        setSignalStats({
          wins: Number(stats.wins) || 0,
          losses: Number(stats.losses) || 0,
          pending: Number(stats.pending) || 0,
          total: Number(stats.total) || 0,
          win_rate: Number(stats.win_rate) || 0,
        });
      } else {
        const rows = [...byKey.values()];
        const wins = rows.filter((r) => normalizeSignalStatus(r.status) === 'win').length;
        const losses = rows.filter((r) => normalizeSignalStatus(r.status) === 'loss').length;
        const pending = rows.filter((r) => normalizeSignalStatus(r.status) === 'active').length;
        const closed = wins + losses;
        setSignalStats({
          wins,
          losses,
          pending,
          total: rows.length,
          win_rate: closed ? Math.round((wins / closed) * 1000) / 10 : 0,
        });
      }
      setAnalysis(a);
    } catch (err) { console.error(err); }
  };

  const biasColor = { bullish: '#3fb950', bearish: '#f85149', neutral: '#8b949e', ranging: '#d4af37' };
  const volColor = { low: '#3fb950', medium: '#d4af37', high: '#f0883e', extreme: '#f85149' };
  const dirIcon = { BUY: <TrendingUp size={14} />, SELL: <TrendingDown size={14} />, NEUTRAL: <Minus size={14} /> };

  const flashAlerts = useMemo(
    () => (liveSignals || []).filter((s) => isFreshAlert(s, 2 * 60 * 1000)).slice(0, 10),
    [liveSignals]
  );

  const validSignals = signals.filter((s) => s.symbol && s.direction);
  const closed = signalStats.wins + signalStats.losses;
  const successRate = closed > 0
    ? signalStats.win_rate
    : (typeof analysis?.successRate === 'number' ? analysis.successRate : null);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="AI Signal Monitor" />
        <div className="page-content">
          {analysis && (
            <div className="stats-grid signals-market-grid">
              <div className="stat-card">
                <div className="stat-card-header"><span className="stat-card-label">Market Bias</span><div className="stat-card-icon green"><TrendingUp size={16} /></div></div>
                <div className="stat-card-value" style={{ color: biasColor[analysis.marketBias], textTransform: 'uppercase', fontSize: 20 }}>{analysis.marketBias}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header"><span className="stat-card-label">Confidence</span><div className="stat-card-icon gold"><Gauge size={16} /></div></div>
                <div className="stat-card-value">{analysis.overallConfidence}%</div>
                <div className="signal-bar" style={{ marginTop: 8 }}>
                  <div className="signal-bar-fill" style={{ width: `${analysis.overallConfidence}%`, background: analysis.overallConfidence > 70 ? '#3fb950' : analysis.overallConfidence > 40 ? '#d4af37' : '#f85149' }}></div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header"><span className="stat-card-label">Volatility</span><div className={`stat-card-icon ${analysis.volatility === 'high' || analysis.volatility === 'extreme' ? 'red' : 'green'}`}><Activity size={16} /></div></div>
                <div className="stat-card-value" style={{ color: volColor[analysis.volatility], textTransform: 'uppercase', fontSize: 20 }}>{analysis.volatility}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header"><span className="stat-card-label">Quality Score</span><div className="stat-card-icon purple"><Zap size={16} /></div></div>
                <div className="stat-card-value">{analysis.qualityScore}<span style={{ fontSize: 14, color: '#545d68' }}>/10</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header"><span className="stat-card-label">Session</span><div className="stat-card-icon cyan"><Clock size={16} /></div></div>
                <div className="stat-card-value" style={{ textTransform: 'uppercase', fontSize: 20 }}>{analysis.session}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header"><span className="stat-card-label">Success Rate</span><div className="stat-card-icon green"><Eye size={16} /></div></div>
                <div className="stat-card-value positive">
                  {successRate != null ? `${successRate}%` : 'N/A'}
                </div>
              </div>
            </div>
          )}

          <div className="grid-2 signals-indicators-grid">
            {analysis && (
              <div className="card">
                <div className="card-header"><span className="card-title"><BarChart3 size={16} /> Technical Indicators</span></div>
                <div className="card-body">
                  {[
                    { label: 'RSI (14)', value: analysis.indicators.rsi, display: analysis.indicators.rsi?.toFixed(1), color: analysis.indicators.rsi > 70 ? '#f85149' : analysis.indicators.rsi < 30 ? '#3fb950' : '#d4af37' },
                    { label: 'MACD', value: analysis.indicators.macd, display: analysis.indicators.macd, color: analysis.indicators.macd === 'bullish' ? '#3fb950' : analysis.indicators.macd === 'bearish' ? '#f85149' : '#8b949e' },
                    { label: 'EMA Trend', value: analysis.indicators.ema, display: analysis.indicators.ema, color: analysis.indicators.ema === 'bullish' ? '#3fb950' : analysis.indicators.ema === 'bearish' ? '#f85149' : '#8b949e' },
                    { label: 'ATR', value: analysis.indicators.atr, display: analysis.indicators.atr?.toFixed(1), color: '#58a6ff' },
                    { label: 'Volume', value: analysis.indicators.volume, display: analysis.indicators.volume, color: analysis.indicators.volume === 'high' ? '#d4af37' : '#8b949e' },
                  ].map((ind, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < 4 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#8b949e' }}>{ind.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: ind.color, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>{ind.display}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <span className="card-title"><Zap size={16} /> Live Signal Feed</span>
                <span className="badge badge-gold">{flashAlerts.length} new</span>
              </div>
              <div style={{ padding: '0 16px 8px', fontSize: 11, color: '#545d68' }}>
                New alerts only (last 2 min). Full book + outcomes below.
              </div>
              <div className="card-body" style={{ maxHeight: 340, overflowY: 'auto' }}>
                {flashAlerts.length > 0 ? flashAlerts.map((s, i) => (
                  <div key={i} className="animate-in" style={{ padding: 12, marginBottom: 8, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: s.direction === 'BUY' ? '#3fb950' : '#f85149' }}>{dirIcon[s.direction]}</span>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{s.symbol}</span>
                        <span className={`badge ${s.direction === 'BUY' ? 'badge-green' : 'badge-red'}`}>{s.direction}</span>
                      </div>
                      <span style={{ fontSize: 10, color: '#545d68' }}>{displayProductName(s.strategy)}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 11, color: '#8b949e' }}>
                      <span>Session: <strong style={{ color: '#e6edf3' }}>{formatSession(s.session)}</strong></span>
                      <span>AI Market Phase: <strong style={{ color: '#e6edf3' }}>{formatMarketPhase(s.amdPhase || s.amd_phase)}</strong></span>
                      <span>Bias: <strong style={{ color: '#e6edf3' }}>{formatMarketBias(s.marketBias || s.h4Bias || s.h4_bias)}</strong></span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 6, fontSize: 11, color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                      <span>Entry: <MaskedSignalValue signal={s} value={s.entryPrice ?? s.entry} /></span>
                      <span>SL: <MaskedSignalValue signal={s} value={s.stopLoss ?? s.sl} color="#f85149" /></span>
                      <span>TP: <MaskedSignalValue signal={s} value={s.takeProfit ?? s.tp} color="#3fb950" /></span>
                      {!isSignalMasked(s) && <span>Conf: {s.confidence}%</span>}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>
                    <Brain size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <div>No fresh alerts</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>New TRADEs flash here via WebSocket</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <LockedFeature
            requiredTier="discovery"
            featureName="AI Signal Feed"
            currentTier={userTier}
            blur={true}
          >
          <div className="stats-grid" style={{ marginTop: 20, marginBottom: 12, gridTemplateColumns: 'repeat(5, 1fr)' }}>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label" style={{ fontSize: 10 }}>Wins</div>
              <div className="stat-card-value" style={{ color: '#3fb950', fontSize: 20 }}>{signalStats.wins}</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label" style={{ fontSize: 10 }}>Losses</div>
              <div className="stat-card-value" style={{ color: '#f85149', fontSize: 20 }}>{signalStats.losses}</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label" style={{ fontSize: 10 }}>Pending</div>
              <div className="stat-card-value" style={{ color: '#d4af37', fontSize: 20 }}>{signalStats.pending}</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label" style={{ fontSize: 10 }}>Win Rate</div>
              <div className="stat-card-value" style={{ fontSize: 20 }}>{signalStats.win_rate}%</div>
            </div>
            <div className="stat-card" style={{ padding: 12 }}>
              <div className="stat-card-label" style={{ fontSize: 10 }}>Total</div>
              <div className="stat-card-value" style={{ fontSize: 20 }}>{signalStats.total}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><Brain size={16} /> Live Engine Signals</span>
              <span className="badge badge-blue">{signals.length}</span>
            </div>
            <div style={{ padding: '0 16px 8px', fontSize: 11, color: '#545d68' }}>
              Active book — live-aligned prices + paper outcome (TP/SL hit).
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container overflow-table-wrapper signals-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Symbol</th><th>Dir</th><th>Entry</th><th>SL</th><th>TP</th>
                      <th>Outcome</th>
                      <th>Conf</th><th>Grade</th><th>AI Market Phase</th><th>H4 Bias</th><th>Session</th><th>Risk</th><th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validSignals.length === 0 && (
                      <tr>
                        <td colSpan={14} style={{ textAlign: 'center', padding: 48, color: '#545d68' }}>
                          No live engine signals yet. Signals appear when the engine generates a TRADE
                          for any enabled symbol (XAUUSD, EURUSD, GBPUSD, USDJPY, GBPJPY, XTIUSD, SPXUSD).
                        </td>
                      </tr>
                    )}
                    {validSignals.map((s, i) => (
                      <tr
                        key={s._id || s.id || i}
                        onClick={() => setSelectedSignal(s)}
                        style={{ cursor: 'pointer' }}
                        title="Click for details"
                      >
                        <td style={{ color: '#8b949e', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {(s._id && s._id !== 'undefined' ? s._id.slice(-6) : null) || (s.id ? String(s.id).slice(-6) : '—')}
                        </td>
                        <td style={{ color: '#e6edf3', fontWeight: 600 }}>{s.symbol}</td>
                        <td><span className={`badge ${s.direction === 'BUY' ? 'badge-green' : s.direction === 'SELL' ? 'badge-red' : 'badge-blue'}`}>{s.direction}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          <MaskedSignalValue signal={s} value={s.entryPrice ?? s.entry} />
                          {!isSignalMasked(s) && (s.priceSource === 'mt5_live' || s.price_source === 'mt5_live') && (
                            <span className="badge badge-gold" style={{ marginLeft: 4, fontSize: 9 }}>LIVE</span>
                          )}
                        </td>
                        <td style={{ color: '#f85149', fontFamily: 'var(--font-mono)', fontSize: 11 }}><MaskedSignalValue signal={s} value={s.stopLoss ?? s.sl} color="#f85149" /></td>
                        <td style={{ color: '#3fb950', fontFamily: 'var(--font-mono)', fontSize: 11 }}><MaskedSignalValue signal={s} value={s.takeProfit ?? s.tp} color="#3fb950" /></td>
                        <td>
                          <span className={`badge ${outcomeBadgeClass(s.status)}`}>
                            {outcomeLabel(s.status)}
                          </span>
                        </td>
                        <td>
                          {isSignalMasked(s) ? (
                            <MaskedSignalValue signal={s} value={s.confidence} />
                          ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="signal-bar" style={{ flex: 1, height: 4, minWidth: 40 }}>
                              <div className="signal-bar-fill" style={{ width: `${s.confidence}%`, background: s.confidence >= 85 ? '#d4af37' : s.confidence > 70 ? '#3fb950' : s.confidence > 50 ? '#d4af37' : '#f85149' }} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.confidence}%</span>
                          </div>
                          )}
                        </td>
                        <td>{isSignalMasked(s) ? <MaskedSignalValue signal={s} value={s.grade} /> : <GradeBadge grade={s.grade || (s.confidence >= 85 ? 'A+' : s.confidence >= 75 ? 'A' : 'B')} />}</td>
                        <td><AmdPhaseBadge phase={s.amdPhase || s.amd_phase} /></td>
                        <td><H4BiasIndicator bias={s.marketBias || s.h4Bias} /></td>
                        <td><SessionBadge session={s.session} /></td>
                        <td>{isSignalMasked(s) ? <MaskedSignalValue signal={s} value={s.riskLevel || s.risk_level} /> : <RiskBadge level={s.riskLevel || s.risk_level} />}</td>
                        <td style={{ fontSize: 11, color: '#8b949e', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.reason || displayProductName(s.strategy) || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </LockedFeature>
        </div>
        <SignalDetailModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      </main>
    </div>
  );
}
