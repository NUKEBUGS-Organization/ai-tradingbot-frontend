import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { Cpu, Activity, Wifi, WifiOff, Zap, Shield, TrendingUp, TrendingDown, BarChart3, RefreshCw, Play, AlertTriangle } from 'lucide-react';

export default function EnginePanel() {
  const [engineStatus, setEngineStatus] = useState(null);
  const [riskStatus, setRiskStatus] = useState(null);
  const [signals, setSignals] = useState({ active: [], stats: {}, history: [] });
  const [analysis, setAnalysis] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [backtesting, setBacktesting] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('XAUUSD');

  useEffect(() => { loadData(); const interval = setInterval(loadData, 10000); return () => clearInterval(interval); }, []);

  const loadData = async () => {
    try {
      const [eng, risk, sig] = await Promise.all([api.getEngineStatus(), api.getRiskStatus(), api.getEngineSignals()]);
      setEngineStatus(eng);
      setRiskStatus(risk);
      setSignals(sig);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    const result = await api.analyzeSymbol(selectedSymbol);
    setAnalysis(result);
    setAnalyzing(false);
  };

  const handleBacktest = async () => {
    setBacktesting(true);
    const result = await api.runBacktest({ symbol: selectedSymbol });
    setBacktest(result);
    setBacktesting(false);
  };

  const isConnected = engineStatus?.connected || engineStatus?.engine?.is_running;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="AI Engine Control" />
        <div className="page-content">
          {/* Engine Status Cards */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
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
                <div className={`stat-card-icon ${engineStatus?.mt5_bridge?.connected ? 'green' : 'red'}`}>
                  {engineStatus?.mt5_bridge?.connected ? <Wifi size={16} /> : <WifiOff size={16} />}
                </div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 16 }}>{engineStatus?.mt5_bridge?.connected ? '🟢 Connected' : '🔴 Disconnected'}</div>
              <div className="stat-card-change">Port {engineStatus?.mt5_bridge?.port || 5555}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Telegram Bot</span>
                <div className={`stat-card-icon ${engineStatus?.telegram?.is_running ? 'green' : 'red'}`}><Zap size={16} /></div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 16 }}>{engineStatus?.telegram?.is_running ? '🟢 Active' : '⚪ Inactive'}</div>
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

          {/* Risk Management Status */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title"><Shield size={16} /> Risk Management</span>
              <span className={`badge ${riskStatus?.locked ? 'badge-red' : 'badge-green'}`}>{riskStatus?.locked ? 'LOCKED' : 'Active'}</span>
            </div>
            <div className="card-body">
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
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

          {/* Analysis & Backtest Controls */}
          <div className="grid-2-1" style={{ marginTop: 20 }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Zap size={16} /> Analyze Market</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} style={{ background: '#161b22', border: '1px solid #21262d', color: '#e6edf3', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>
                    <option value="XAUUSD">XAUUSD</option>
                    <option value="EURUSD">EURUSD</option>
                    <option value="GBPUSD">GBPUSD</option>
                  </select>
                  <button onClick={handleAnalyze} disabled={analyzing} style={{ background: 'linear-gradient(135deg, #d4af37, #b8941f)', border: 'none', color: '#0d1117', padding: '4px 16px', borderRadius: 6, fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {analyzing ? <RefreshCw size={12} className="spin" /> : <Play size={12} />} {analyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </div>
              <div className="card-body" style={{ minHeight: 200 }}>
                {analysis ? (
                  <div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                      <span className={`badge ${analysis.action === 'TRADE' ? 'badge-green' : analysis.action === 'BLOCKED' ? 'badge-red' : 'badge-gold'}`}>
                        {analysis.action}
                      </span>
                      {analysis.confidence > 0 && <span className="badge badge-gold">Confidence: {analysis.confidence}%</span>}
                      {analysis.signal?.grade && <span className="badge badge-green">Grade: {analysis.signal.grade}</span>}
                    </div>
                    {analysis.signal && (
                      <div style={{ background: '#161b22', borderRadius: 8, padding: 16, border: '1px solid #21262d' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Direction:</span> <strong style={{ color: analysis.signal.type === 'BUY' ? '#3fb950' : '#f85149' }}>{analysis.signal.type}</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Entry:</span> <strong>{analysis.signal.entry}</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>SL:</span> <strong style={{ color: '#f85149' }}>{analysis.signal.sl}</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>TP:</span> <strong style={{ color: '#3fb950' }}>{analysis.signal.tp}</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Lot Size:</span> <strong>{analysis.signal.lot_size}</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Risk:</span> <strong>{analysis.signal.risk_percent}%</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>Session:</span> <strong>{analysis.signal.session}</strong></div>
                          <div><span style={{ color: '#545d68', fontSize: 11 }}>AMD Phase:</span> <strong>{analysis.signal.amd_phase}</strong></div>
                        </div>
                      </div>
                    )}
                    {analysis.reason && <div style={{ marginTop: 12, color: '#f0883e', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={14} /> {analysis.reason}</div>}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#545d68', padding: 40 }}>Click "Analyze" to run AI market analysis</div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title"><BarChart3 size={16} /> Backtest</span>
                <button onClick={handleBacktest} disabled={backtesting} style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', padding: '4px 16px', borderRadius: 6, fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
                  {backtesting ? 'Running...' : 'Run Backtest'}
                </button>
              </div>
              <div className="card-body" style={{ minHeight: 200 }}>
                {backtest?.metrics ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Total Trades:</span><br /><strong>{backtest.metrics.total_trades}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Win Rate:</span><br /><strong style={{ color: '#3fb950' }}>{backtest.metrics.win_rate}%</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Profit:</span><br /><strong style={{ color: backtest.metrics.total_profit >= 0 ? '#3fb950' : '#f85149' }}>${backtest.metrics.total_profit}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Profit Factor:</span><br /><strong>{backtest.metrics.profit_factor}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Max Drawdown:</span><br /><strong style={{ color: '#f85149' }}>{backtest.metrics.max_drawdown}%</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Sharpe Ratio:</span><br /><strong>{backtest.metrics.sharpe_ratio}</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Return:</span><br /><strong style={{ color: '#d4af37' }}>{backtest.metrics.return_pct}%</strong></div>
                    <div><span style={{ color: '#545d68', fontSize: 11 }}>Final Balance:</span><br /><strong>${backtest.metrics.final_balance?.toLocaleString()}</strong></div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: '#545d68', padding: 40 }}>Run backtest to see results</div>
                )}
              </div>
            </div>
          </div>

          {/* Active Signals */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title"><Activity size={16} /> AI Engine Signals</span>
              <button onClick={loadData} style={{ background: '#21262d', border: '1px solid #30363d', color: '#e6edf3', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr><th>ID</th><th>Symbol</th><th>Direction</th><th>Entry</th><th>SL</th><th>TP</th><th>Confidence</th><th>Grade</th><th>Session</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {(signals.history || []).slice(0, 15).map((sig, i) => (
                      <tr key={i}>
                        <td style={{ color: '#8b949e', fontFamily: 'var(--font-mono)' }}>{sig.id || '-'}</td>
                        <td style={{ color: '#e6edf3', fontWeight: 600 }}>{sig.symbol}</td>
                        <td><span className={`badge ${sig.direction === 'BUY' ? 'badge-green' : 'badge-red'}`}>{sig.direction}</span></td>
                        <td>{sig.entry}</td>
                        <td style={{ color: '#f85149' }}>{sig.sl}</td>
                        <td style={{ color: '#3fb950' }}>{sig.tp}</td>
                        <td><span className={`badge ${sig.confidence >= 80 ? 'badge-green' : sig.confidence >= 60 ? 'badge-gold' : 'badge-red'}`}>{sig.confidence}%</span></td>
                        <td style={{ fontWeight: 700, color: '#d4af37' }}>{sig.grade || '-'}</td>
                        <td>{sig.session || '-'}</td>
                        <td><span className={`badge ${sig.status === 'active' ? 'badge-green' : 'badge-gold'}`}>{sig.status || 'pending'}</span></td>
                      </tr>
                    ))}
                    {(!signals.history || signals.history.length === 0) && (
                      <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>No engine signals yet. Run analysis to generate signals.</td></tr>
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
