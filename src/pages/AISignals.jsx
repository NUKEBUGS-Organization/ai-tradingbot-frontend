import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useWebSocket } from '../services/websocket';
import api from '../services/api';
import { Brain, TrendingUp, TrendingDown, Minus, Activity, Gauge, Clock, BarChart3, Zap, Eye } from 'lucide-react';
import SignalDetailModal from '../components/SignalDetailModal';
import { GradeBadge, SessionBadge, AmdPhaseBadge, H4BiasIndicator, RiskBadge } from '../components/signalBadges';

export default function AISignals() {
  const { signals: liveSignals } = useWebSocket();
  const [signals, setSignals] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [s, a] = await Promise.all([api.getSignals(), api.getMarketAnalysis()]);
      setSignals(s);
      setAnalysis(a);
    } catch (err) { console.error(err); }
  };

  const biasColor = { bullish: '#3fb950', bearish: '#f85149', neutral: '#8b949e', ranging: '#d4af37' };
  const volColor = { low: '#3fb950', medium: '#d4af37', high: '#f0883e', extreme: '#f85149' };
  const dirIcon = { BUY: <TrendingUp size={14} />, SELL: <TrendingDown size={14} />, NEUTRAL: <Minus size={14} /> };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="AI Signal Monitor" />
        <div className="page-content">
          {/* Market Overview */}
          {analysis && (
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
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

          <div className="grid-2">
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
            <div className="card">
              <div className="card-header"><span className="card-title"><Zap size={16} /> Live Signal Feed</span><span className="badge badge-gold">{liveSignals.length} new</span></div>
              <div className="card-body" style={{ maxHeight: 340, overflowY: 'auto' }}>
                {liveSignals.length > 0 ? liveSignals.map((s, i) => (
                  <div key={i} className="animate-in" style={{ padding: 12, marginBottom: 8, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: s.direction === 'BUY' ? '#3fb950' : '#f85149' }}>{dirIcon[s.direction]}</span>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{s.symbol}</span>
                        <span className={`badge ${s.direction === 'BUY' ? 'badge-green' : 'badge-red'}`}>{s.direction}</span>
                      </div>
                      <span style={{ fontSize: 10, color: '#545d68' }}>{s.strategy}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 11, color: '#8b949e', fontFamily: 'var(--font-mono)' }}>
                      <span>Entry: {s.entryPrice}</span>
                      <span>Conf: {s.confidence}%</span>
                      <span>Quality: {s.qualityScore}</span>
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>
                    <Brain size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                    <div>Waiting for live signals...</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>Signals appear in real-time via WebSocket</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signal History */}
          <div className="card">
            <div className="card-header"><span className="card-title"><Brain size={16} /> Active Signals</span><span className="badge badge-blue">{signals.length}</span></div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Symbol</th><th>Dir</th><th>Entry</th><th>SL</th><th>TP</th>
                      <th>Conf</th><th>Grade</th><th>AMD</th><th>H4</th><th>Session</th><th>Risk</th><th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map(s => (
                      <tr
                        key={s._id}
                        onClick={() => setSelectedSignal(s)}
                        style={{ cursor: 'pointer' }}
                        title="Click for details"
                      >
                        <td style={{ color: '#e6edf3', fontWeight: 600 }}>{s.symbol}</td>
                        <td><span className={`badge ${s.direction === 'BUY' ? 'badge-green' : s.direction === 'SELL' ? 'badge-red' : 'badge-blue'}`}>{s.direction}</span></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                          {s.entryPrice ?? s.entry ?? '—'}
                          {(s.priceSource === 'mt5_live' || s.price_source === 'mt5_live') && (
                            <span className="badge badge-gold" style={{ marginLeft: 4, fontSize: 9 }}>LIVE</span>
                          )}
                        </td>
                        <td style={{ color: '#f85149', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.stopLoss ?? s.sl ?? '—'}</td>
                        <td style={{ color: '#3fb950', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.takeProfit ?? s.tp ?? '—'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div className="signal-bar" style={{ flex: 1, height: 4, minWidth: 40 }}>
                              <div className="signal-bar-fill" style={{ width: `${s.confidence}%`, background: s.confidence >= 85 ? '#d4af37' : s.confidence > 70 ? '#3fb950' : s.confidence > 50 ? '#d4af37' : '#f85149' }} />
                            </div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.confidence}%</span>
                          </div>
                        </td>
                        <td><GradeBadge grade={s.grade || (s.confidence >= 85 ? 'A+' : s.confidence >= 75 ? 'A' : 'B')} /></td>
                        <td><AmdPhaseBadge phase={s.amdPhase || s.amd_phase} /></td>
                        <td><H4BiasIndicator bias={s.marketBias || s.h4Bias} /></td>
                        <td><SessionBadge session={s.session} /></td>
                        <td><RiskBadge level={s.riskLevel || s.risk_level} /></td>
                        <td style={{ fontSize: 11, color: '#8b949e', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.reason || s.strategy || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <SignalDetailModal signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      </main>
    </div>
  );
}
