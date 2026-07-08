import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LockedFeature from '../components/LockedFeature';
import { useAuth, getUserTier } from '../context/AuthContext';
import api from '../services/api';
import { Brain, TrendingUp, Activity, Gauge, Clock, BarChart3, Zap, Eye } from 'lucide-react';
import SignalDetailModal from '../components/SignalDetailModal';
import { GradeBadge, SessionBadge, AmdPhaseBadge, H4BiasIndicator, RiskBadge } from '../components/signalBadges';
import { displayProductName } from '../utils/product';
import MaskedSignalValue, { isSignalMasked } from '../components/MaskedSignalValue';

export default function AISignals() {
  const { user } = useAuth();
  const userTier = getUserTier(user);
  const [signals, setSignals] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);

  const fetchRecentSignals = useCallback(async () => {
    try {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const response = await api.getSignals({
        since: thirtyMinsAgo,
        limit: 20,
      });
      setRecentSignals(response.signals || response || []);
    } catch (err) {
      console.error('Failed to fetch recent signals:', err);
      setRecentSignals([]);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    fetchRecentSignals();
    const interval = setInterval(fetchRecentSignals, 30000);
    return () => clearInterval(interval);
  }, [fetchRecentSignals]);

  const loadData = async () => {
    try {
      const [engineData, engineS, a] = await Promise.all([
        api.getEngineSignals().catch(() => ({ history: [] })),
        api.getEngineActiveSignals().catch(() => []),
        api.getMarketAnalysis(),
      ]);
      const dbSignals = engineData?.history || engineData?.active || [];
      const bySymbol = new Map();
      const add = (row) => {
        if (!row?.symbol) return;
        const sym = String(row.symbol).toUpperCase();
        const t = new Date(row.createdAt || row.timestamp || 0).getTime();
        const prev = bySymbol.get(sym);
        const prevT = prev ? new Date(prev.createdAt || prev.timestamp || 0).getTime() : 0;
        if (!prev || t >= prevT) bySymbol.set(sym, row);
      };
      (Array.isArray(engineS) ? engineS : []).forEach(add);
      (Array.isArray(dbSignals) ? dbSignals : []).forEach(add);
      setSignals([...bySymbol.values()].sort(
        (x, y) => new Date(y.createdAt || y.timestamp || 0) - new Date(x.createdAt || x.timestamp || 0)
      ));
      setAnalysis(a);
    } catch (err) { console.error(err); }
  };

  const biasColor = { bullish: '#3fb950', bearish: '#f85149', neutral: '#8b949e', ranging: '#d4af37' };
  const volColor = { low: '#3fb950', medium: '#d4af37', high: '#f0883e', extreme: '#f85149' };

  const validSignals = signals.filter((s) => s.symbol && s.direction);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="AI Signal Monitor" />
        <div className="page-content">
          {/* Market Overview */}
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
                  {analysis?.successRate ?? 'N/A'}
                  {typeof analysis?.successRate === 'number' ? '%' : ''}
                </div>
              </div>
            </div>
          )}

          <div className="grid-2 signals-indicators-grid">
            {/* Indicators */}
            {analysis && (
              <div className="card">
                <div className="card-header"><span className="card-title"><BarChart3 size={16} /> Technical Indicators</span></div>
                <div className="card-body">
                  {[
                    { label: 'RSI (14)', value: analysis.indicators.rsi, display: analysis.indicators.rsi?.toFixed(1), barPct: analysis.indicators.rsi, color: analysis.indicators.rsi > 70 ? '#f85149' : analysis.indicators.rsi < 30 ? '#3fb950' : '#d4af37' },
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

            {/* Live Alerts */}
            <div className="card" style={{ height: '100%' }}>
              <div className="card-header">
                <span className="card-title">
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#3fb950', display: 'inline-block',
                    marginRight: 8, animation: 'pulse 2s infinite',
                  }} />
                  Live Signal Feed
                </span>
                <span style={{ fontSize: 11, color: '#8b949e' }}>Last 30 minutes</span>
              </div>
              <div style={{ padding: '12px', overflowY: 'auto', maxHeight: 400 }}>
                {recentSignals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 32, color: '#8b949e' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📡</div>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>No signals in the last 30 minutes</div>
                    <div style={{ fontSize: 11, color: '#545d68' }}>
                      Engine analyzes every 90 seconds during London and NY sessions
                    </div>
                  </div>
                ) : (
                  recentSignals.map((signal, i) => (
                    <div key={i} style={{
                      background: '#0d1117',
                      border: `1px solid ${signal.direction === 'BUY' ? 'rgba(63,185,80,0.3)' : 'rgba(248,81,73,0.3)'}`,
                      borderRadius: 8, padding: '12px 14px', marginBottom: 8,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            background: signal.direction === 'BUY' ? 'rgba(63,185,80,0.2)' : 'rgba(248,81,73,0.2)',
                            color: signal.direction === 'BUY' ? '#3fb950' : '#f85149',
                            padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                          }}>
                            {signal.direction === 'BUY' ? '🟢' : '🔴'} {signal.direction}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>
                            {signal.symbol}
                          </span>
                          <span style={{ fontSize: 11, color: '#8b949e' }}>
                            {signal.session?.toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: '#545d68' }}>
                          {signal.createdAt ? new Date(signal.createdAt).toLocaleTimeString() : '—'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                        <div style={{ fontSize: 11 }}>
                          <div style={{ color: '#545d68', marginBottom: 2 }}>Entry</div>
                          <div style={{ color: '#e6edf3', fontWeight: 600 }}>
                            {signal.entryPrice ? signal.entryPrice.toFixed(signal.symbol?.includes('JPY') ? 3 : 5) : '—'}
                          </div>
                        </div>
                        <div style={{ fontSize: 11 }}>
                          <div style={{ color: '#545d68', marginBottom: 2 }}>SL</div>
                          <div style={{ color: '#f85149', fontWeight: 600 }}>
                            {signal.stopLoss ? signal.stopLoss.toFixed(signal.symbol?.includes('JPY') ? 3 : 5) : '—'}
                          </div>
                        </div>
                        <div style={{ fontSize: 11 }}>
                          <div style={{ color: '#545d68', marginBottom: 2 }}>TP</div>
                          <div style={{ color: '#3fb950', fontWeight: 600 }}>
                            {signal.takeProfit ? signal.takeProfit.toFixed(signal.symbol?.includes('JPY') ? 3 : 5) : '—'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                        <span style={{ fontSize: 10, color: '#d4af37' }}>
                          Confidence: {signal.confidence ? `${signal.confidence}%` : '—'}
                        </span>
                        <span style={{ fontSize: 10, color: '#8b949e' }}>
                          Grade: {signal.grade || '—'}
                        </span>
                        <span style={{ fontSize: 10, color: '#8b949e' }}>
                          Phase: {signal.amdPhase || '—'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Signal History */}
          <LockedFeature
            requiredTier="discovery"
            featureName="AI Signal Feed"
            currentTier={userTier}
            blur={true}
          >
          <div className="card">
            <div className="card-header"><span className="card-title"><Brain size={16} /> Live Engine Signals</span><span className="badge badge-blue">{signals.length}</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container overflow-table-wrapper signals-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Symbol</th><th>Dir</th><th>Entry</th><th>SL</th><th>TP</th>
                      <th>Conf</th><th>Grade</th><th>AI Market Phase</th><th>H4 Bias</th><th>Session</th><th>Risk</th><th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validSignals.length === 0 && (
                      <tr>
                        <td colSpan={12} style={{ textAlign: 'center', padding: 48, color: '#545d68' }}>
                          No live engine signals yet. Signals appear when the engine generates a TRADE
                          for any enabled symbol (XAUUSD, EURUSD, GBPUSD, USDJPY, GBPJPY, XTIUSD).
                        </td>
                      </tr>
                    )}
                    {validSignals.map(s => (
                      <tr
                        key={s._id}
                        onClick={() => setSelectedSignal(s)}
                        style={{ cursor: 'pointer' }}
                        title="Click for details"
                      >
                        <td style={{ color: '#8b949e', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {s._id && s._id !== 'undefined' ? s._id.slice(-6) : '—'}
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
