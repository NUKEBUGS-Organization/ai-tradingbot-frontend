import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LockedFeature from '../components/LockedFeature';
import { useAuth, getUserTier } from '../context/AuthContext';
import api from '../services/api';
import { normalizeSignalsList, pickMt5LiveAccount, hasLiveMt5Connection, mapRiskSettingsForUi } from '../utils/tradeMetrics';
import { useWebSocket } from '../services/websocket';
import { Cpu, Activity, Wifi, WifiOff, Zap, Shield, RefreshCw, AlertTriangle, Play, BarChart3 } from 'lucide-react';
import MaskedSignalValue, { isSignalMasked } from '../components/MaskedSignalValue';
import { formatMarketPhase, formatSession } from '../utils/signalDisplay';

const ANALYZE_SYMBOLS = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'XTIUSD'];

export default function EnginePanel() {
  const { user } = useAuth();
  const userTier = getUserTier(user);
  const { account: wsAccount } = useWebSocket();
  const [engineStatus, setEngineStatus] = useState(null);
  const [riskStatus, setRiskStatus] = useState(null);
  const [signals, setSignals] = useState({ active: [], stats: {}, history: [] });
  const [engineTrades, setEngineTrades] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [backtesting, setBacktesting] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');
  const [autoTrade, setAutoTrade] = useState({ enabled: false, mt5_connected: false });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [user?._id]);

  useEffect(() => {
    if (!engineStatus) return;
    const live = pickMt5LiveAccount(engineStatus, wsAccount);
    if (!live) return;
    setRiskStatus((prev) =>
      mapRiskSettingsForUi(prev?.settings || user?.riskSettings, user, live)
    );
  }, [engineStatus?.mt5_account?.balance, engineStatus?.mt5_account?.equity, wsAccount?.source]);

  const loadData = async () => {
    try {
      const profile = user || (await api.getProfile());
      const userId = profile?._id;
      const eng = await api.getEngineStatus();
      const live = pickMt5LiveAccount(eng, wsAccount);
      const [risk, sigList, aiTrades, atStatus] = await Promise.all([
        api.getEngineRisk(userId, profile, eng),
        api.getSignals(),
        api.getEngineTrades(),
        api.getAutoTradeStatus(),
      ]);
      setAutoTrade(atStatus || eng?.auto_trade || { enabled: false, mt5_connected: false });
      setEngineStatus(eng);
      setRiskStatus((prev) => {
        if (live) {
          return mapRiskSettingsForUi(risk?.settings || profile?.riskSettings, profile, live);
        }
        if (prev?.fromMt5) return { ...prev, ...risk, balance: prev.balance, equity: prev.equity, daily_pnl: prev.daily_pnl, open_positions: prev.open_positions, fromMt5: true };
        return risk;
      });
      setSignals(normalizeSignalsList(sigList));
      setEngineTrades(aiTrades);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    const result = await api.analyzeSymbol(selectedSymbol);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleBacktest = async () => {
    setBacktesting(true);
    setBacktest(null);
    const result = await api.runBacktest({ symbol: selectedSymbol });
    setBacktest(result);
    setBacktesting(false);
  };

  const isConnected = engineStatus?.connected || engineStatus?.engine?.is_running;
  const mt5Connected = hasLiveMt5Connection(engineStatus, wsAccount);
  const mt5ConnectText = 'Connect MT5 to load your balance and trades';

  const toggleAutoTrade = async () => {
    const next = !autoTrade.enabled;
    const updated = await api.setAutoTradeEnabled(next);
    setAutoTrade(updated || { ...autoTrade, enabled: next });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="AI Engine Control" />
        <div className="page-content">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header">
              <span className="card-title">MT5 Auto-Execute</span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={toggleAutoTrade}
                  className={`btn ${autoTrade.enabled ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: 12, padding: '4px 12px' }}
                  title="When ON, AI-approved signals are sent to MT5 automatically"
                >
                  Auto-Execute {autoTrade.enabled ? 'ON' : 'OFF'}
                </button>
              </span>
            </div>
            <div className="card-body" style={{ fontSize: 12, color: '#8b949e' }}>
              <strong style={{ color: '#e6edf3' }}>Auto-Execute</strong> (OFF by default): when enabled, high-confidence
              AI signals are sent to the EA for live execution. Enable{' '}
              <strong style={{ color: '#d4af37' }}>Auto Execute Signals</strong> on the MT5 EA and{' '}
              <strong style={{ color: '#d4af37' }}>Algo Trading</strong> in the MT5 toolbar. Bridge{' '}
              {mt5Connected ? (
                <span style={{ color: '#3fb950' }}>connected</span>
              ) : (
                <span style={{ color: '#f85149' }}>disconnected</span>
              )}.
            </div>
          </div>

          <div className="stats-grid engine-stats-4">
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">AI Engine</span>
                <div className={`stat-card-icon ${isConnected ? 'green' : 'red'}`}><Cpu size={16} /></div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 16 }}>{isConnected ? '🟢 Online' : '🔴 Offline'}</div>
              <div className="stat-card-change">{isConnected ? 'Processing signals' : 'Start python-engine'}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">MT5 Bridge</span>
                <div className={`stat-card-icon ${mt5Connected ? 'green' : 'red'}`}>
                  {mt5Connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                </div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 16 }}>{mt5Connected ? 'Connected' : 'Disconnected'}</div>
              <div className="stat-card-change">{mt5Connected ? `Port ${engineStatus?.mt5_bridge?.port || 15555}` : mt5ConnectText}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Telegram Bot</span>
                <div className="stat-card-icon green"><Zap size={16} /></div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 16 }}>🟢 Active</div>
              <div className="stat-card-change">{engineStatus?.telegram?.subscribers || 0} subscribers</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Signal Quality</span>
                <div className="stat-card-icon gold"><Activity size={16} /></div>
              </div>
              <div className="stat-card-value">{signals.stats?.win_rate || 0}%</div>
              <div className="stat-card-change">{signals.stats?.total || 0} total signals</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title"><Shield size={16} /> Risk Management</span>
              <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {riskStatus?.fromMt5 && <span className="badge badge-gold">MT5 LIVE</span>}
                <span className={`badge ${riskStatus?.locked ? 'badge-red' : 'badge-green'}`}>{riskStatus?.locked ? 'LOCKED' : 'Active'}</span>
              </span>
            </div>
            <div className="card-body">
              <div className="stats-grid engine-risk-stats">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#d4af37', fontFamily: 'var(--font-mono)' }}>{riskStatus?.preset || 'N/A'}</div>
                  <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>PRESET</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', fontFamily: 'var(--font-mono)' }}>${(riskStatus?.balance || 0).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>BALANCE</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: (riskStatus?.daily_pnl || 0) >= 0 ? '#3fb950' : '#f85149', fontFamily: 'var(--font-mono)' }}>
                    {(riskStatus?.daily_pnl || 0) >= 0 ? '+' : ''}${(riskStatus?.daily_pnl || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>DAILY P&L</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#e6edf3', fontFamily: 'var(--font-mono)' }}>{riskStatus?.open_positions || 0}/{riskStatus?.max_positions || 5}</div>
                  <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>POSITIONS</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#d4af37', fontFamily: 'var(--font-mono)' }}>{riskStatus?.risk_percent || 1}%</div>
                  <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>RISK/TRADE</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: (riskStatus?.daily_drawdown_pct || 0) > 3 ? '#f85149' : '#3fb950', fontFamily: 'var(--font-mono)' }}>
                    {(riskStatus?.daily_drawdown_pct || 0).toFixed(1)}%
                  </div>
                  <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>DRAWDOWN</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid-2-1" style={{ marginTop: 20 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Zap size={16} /> Analyze Market</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    style={{ background: '#161b22', border: '1px solid #21262d', color: '#e6edf3', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}
                  >
                    {ANALYZE_SYMBOLS.map((sym) => (
                      <option key={sym} value={sym}>
                        {sym === 'XAUUSD' ? 'XAUUSD (Gold)' : sym === 'XTIUSD' ? 'XTIUSD (Oil)' : sym}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    style={{
                      background: 'linear-gradient(135deg, #d4af37, #b8941f)',
                      border: 'none',
                      color: '#0d1117',
                      padding: '4px 16px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: analyzing ? 'wait' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {analyzing ? <RefreshCw size={12} className="spin" /> : <Play size={12} />}
                    {analyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ minHeight: 200 }}>
                {analysis ? (
                  <div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                      <span className={`badge ${analysis.action === 'TRADE' ? 'badge-green' : analysis.action === 'BLOCKED' || analysis.action === 'OFFLINE' ? 'badge-red' : 'badge-gold'}`}>
                        {analysis.action}
                      </span>
                      {analysis.confidence > 0 && <span className="badge badge-gold">Confidence: {analysis.confidence}%</span>}
                      {analysis.signal?.grade && <span className="badge badge-green">Grade: {analysis.signal.grade}</span>}
                    </div>
                    {analysis.signal && (
                      <div style={{ background: '#161b22', borderRadius: 8, padding: 16, border: '1px solid #21262d' }}>
                        <div className="responsive-grid-2" style={{ gap: 8 }}>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Direction:</span> <strong style={{ color: analysis.signal.type === 'BUY' ? '#3fb950' : '#f85149' }}>{analysis.signal.type}</strong></div>
                          <div>
                            <span style={{ color: '#545d68', fontSize: 11 }}>Entry:</span>{' '}
                            <strong><MaskedSignalValue signal={analysis.signal} value={analysis.signal.entry} /></strong>
                            {!isSignalMasked(analysis.signal) && analysis.signal.price_source === 'mt5_live' && (
                              <span className="badge badge-gold" style={{ marginLeft: 6, fontSize: 9 }}>MT5 LIVE</span>
                            )}
                          </div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>SL:</span> <strong><MaskedSignalValue signal={analysis.signal} value={analysis.signal.sl} color="#f85149" /></strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>TP:</span> <strong><MaskedSignalValue signal={analysis.signal} value={analysis.signal.tp} color="#3fb950" /></strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Lot Size:</span> <strong><MaskedSignalValue signal={analysis.signal} value={analysis.signal.lot_size} /></strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Risk:</span> <strong><MaskedSignalValue signal={analysis.signal} value={analysis.signal.risk_percent != null ? `${analysis.signal.risk_percent}%` : null} /></strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Session:</span> <strong>{formatSession(analysis.signal.session)}</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>AI Market Phase:</span> <strong>{formatMarketPhase(analysis.signal.amd_phase)}</strong></div>
                        </div>
                      </div>
                    )}
                    {analysis.mt5_execution && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 10,
                          background: '#0d1117',
                          borderRadius: 8,
                          fontSize: 12,
                          color: analysis.mt5_execution.sent ? '#3fb950' : '#8b949e',
                        }}
                      >
                        MT5 execution:{' '}
                        {analysis.mt5_execution.sent
                          ? 'Signal sent to EA — check MT5 Experts tab'
                          : analysis.mt5_execution.reason || 'Not sent'}
                      </div>
                    )}
                    {analysis.reason && (
                      <div style={{ marginTop: 12, color: analysis.action === 'OFFLINE' ? '#f85149' : '#f0883e', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={14} /> {analysis.reason}
                      </div>
                    )}
                    {analysis.confidence !== undefined && (
                      <div className="card" style={{ marginTop: 16, border: '1px solid #21262d' }}>
                        <div className="card-header">
                          <span className="card-title">Confidence Breakdown</span>
                          <span
                            style={{
                              color: analysis.confidence >= 85 ? '#d4af37' : analysis.confidence >= 75 ? '#3fb950' : '#8b949e',
                              fontWeight: 700,
                              fontSize: 18,
                            }}
                          >
                            {analysis.confidence}% — {analysis.analysis?.score?.grade || analysis.signal?.grade || 'N/A'}
                          </span>
                        </div>
                        <div className="card-body">
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
                            {analysis.analysis?.score?.factors &&
                              Object.entries(analysis.analysis.score.factors).map(([key, val]) => (
                                <div key={key} style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
                                  <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                  </div>
                                  <div style={{ fontSize: 14, fontWeight: 600, color: '#d4af37' }}>
                                    {typeof val === 'number' ? `${val}%` : String(val)}
                                  </div>
                                </div>
                              ))}
                          </div>
                          {analysis.analysis?.amd && (
                            <div style={{ marginTop: 12, padding: 12, background: '#0d1117', borderRadius: 8 }}>
                              <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>AI Market Phase Analysis</div>
                              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 13 }}>
                                  AI Market Phase:{' '}
                                  <strong style={{ color: '#f0883e' }}>
                                    {analysis.analysis.amd.current_phase || 'N/A'}
                                  </strong>
                                </span>
                                <span style={{ fontSize: 13 }}>
                                  H4 Bias:{' '}
                                  <strong style={{ color: '#58a6ff' }}>
                                    {analysis.analysis.h4_bias?.bias || 'N/A'}
                                  </strong>
                                </span>
                                <span style={{ fontSize: 13 }}>
                                  Direction:{' '}
                                  <strong
                                    style={{
                                      color: analysis.signal?.type === 'BUY' ? '#3fb950' : '#f85149',
                                    }}
                                  >
                                    {analysis.signal?.type || 'No Signal'}
                                  </strong>
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#545d68', padding: 40 }}>
                    Select a symbol and click Analyze to run AI market analysis
                  </div>
                )}
              </div>
            </div>

            <LockedFeature
              requiredTier="elite"
              featureName="Advanced Backtesting"
              currentTier={userTier}
              blur={true}
            >
            <div className="card">
              <div className="card-header">
                <span className="card-title"><BarChart3 size={16} /> Backtest</span>
                <button
                  type="button"
                  onClick={handleBacktest}
                  disabled={backtesting}
                  style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', padding: '4px 16px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: backtesting ? 'wait' : 'pointer' }}
                >
                  {backtesting ? 'Running...' : 'Run Backtest'}
                </button>
              </div>
              <div className="card-body" style={{ minHeight: 200 }}>
                {backtest?.metrics ? (
                  <div className="responsive-grid-2" style={{ gap: 12 }}>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Total Trades:</span><br /><strong>{backtest.metrics.total_trades}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Win Rate:</span><br /><strong style={{ color: '#3fb950' }}>{backtest.metrics.win_rate}%</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Profit:</span><br /><strong style={{ color: (backtest.metrics.total_profit ?? 0) >= 0 ? '#3fb950' : '#f85149' }}>${backtest.metrics.total_profit}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Profit Factor:</span><br /><strong>{backtest.metrics.profit_factor}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Max Drawdown:</span><br /><strong style={{ color: '#f85149' }}>{backtest.metrics.max_drawdown}%</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Sharpe Ratio:</span><br /><strong>{backtest.metrics.sharpe_ratio}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Return:</span><br /><strong style={{ color: '#d4af37' }}>{backtest.metrics.return_pct}%</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Final Balance:</span><br /><strong>${backtest.metrics.final_balance?.toLocaleString()}</strong></div>
                  </div>
                ) : backtest?.error ? (
                  <div style={{ textAlign: 'center', color: '#f85149', padding: 40, fontSize: 13 }}>
                    <AlertTriangle size={16} style={{ marginBottom: 8 }} /><br />{backtest.error}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#545d68', padding: 40 }}>
                    Run backtest on loaded MT5 candle data for {selectedSymbol}
                  </div>
                )}
              </div>
            </div>
            </LockedFeature>
          </div>

          {engineTrades.length > 0 && (
            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-header">
                <span className="card-title"><Activity size={16} /> AI Engine Trades</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr><th>Symbol</th><th>Type</th><th>Lot</th><th>Profit</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {engineTrades.slice(0, 10).map((t, i) => (
                        <tr key={t._id || i}>
                          <td>{t.symbol}</td>
                          <td>{t.type}</td>
                          <td>{t.lotSize}</td>
                          <td style={{ color: (t.profit ?? 0) >= 0 ? '#3fb950' : '#f85149' }}>{t.profit ?? '-'}</td>
                          <td>{t.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title"><Activity size={16} /> Live Engine Signals</span>
              <button onClick={loadData} style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>Symbol</th><th>Direction</th><th>Entry</th><th>SL</th><th>TP</th><th>Confidence</th><th>Strategy</th><th>Session</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {(signals.history || []).slice(0, 15).map((sig, i) => (
                      <tr key={sig._id || i}>
                        <td style={{ color: '#e6edf3', fontWeight: 600 }}>{sig.symbol}</td>
                        <td><span className={`badge ${sig.direction === 'BUY' ? 'badge-green' : 'badge-red'}`}>{sig.direction}</span></td>
                        <td>
                          <MaskedSignalValue signal={sig} value={sig.entryPrice ?? sig.entry} />
                          {!isSignalMasked(sig) && (sig.priceSource === 'mt5_live' || sig.price_source === 'mt5_live') && (
                            <span className="badge badge-gold" style={{ marginLeft: 6, fontSize: 9 }}>LIVE</span>
                          )}
                        </td>
                        <td style={{ color: '#f85149' }}><MaskedSignalValue signal={sig} value={sig.stopLoss ?? sig.sl} color="#f85149" /></td>
                        <td style={{ color: '#3fb950' }}><MaskedSignalValue signal={sig} value={sig.takeProfit ?? sig.tp} color="#3fb950" /></td>
                        <td>{isSignalMasked(sig) ? <MaskedSignalValue signal={sig} value={sig.confidence} /> : <span className={`badge ${sig.confidence >= 80 ? 'badge-green' : sig.confidence >= 60 ? 'badge-gold' : 'badge-red'}`}>{sig.confidence}%</span>}</td>
                        <td>{sig.strategy || '-'}</td>
                        <td>{sig.session || '-'}</td>
                        <td><span className={`badge ${sig.status === 'active' ? 'badge-green' : 'badge-gold'}`}>{sig.status || 'pending'}</span></td>
                      </tr>
                    ))}
                    {(!signals.history || signals.history.length === 0) && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>
                        {loading
                          ? 'Loading signals...'
                          : 'No live engine signals yet. Signals appear here when the engine publishes TRADE signals for enabled pairs.'}
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
