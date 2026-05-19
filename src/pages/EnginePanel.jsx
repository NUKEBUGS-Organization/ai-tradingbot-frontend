import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Cpu, Activity, Wifi, WifiOff, Zap, Shield, RefreshCw, AlertTriangle } from 'lucide-react';

export default function EnginePanel() {
  const { user } = useAuth();
  const [engineStatus, setEngineStatus] = useState(null);
  const [riskStatus, setRiskStatus] = useState(null);
  const [signals, setSignals] = useState({ active: [], stats: {}, history: [] });
  const [engineTrades, setEngineTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [user?._id]);

  const loadData = async () => {
    try {
      const userId = user?._id;
      const [eng, risk, sig, aiTrades] = await Promise.all([
        api.getEngineStatus(),
        api.getRiskStatus(userId),
        api.getEngineSignals(),
        api.getEngineTrades(),
      ]);
      setEngineStatus(eng);
      setRiskStatus(risk);
      setSignals(sig);
      setEngineTrades(aiTrades);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const isConnected = engineStatus?.connected || engineStatus?.engine?.is_running;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="AI Engine Control" />
        <div className="page-content">
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

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="card-title"><Zap size={16} /> API scope</span>
            </div>
            <div className="card-body" style={{ color: '#8b949e', fontSize: 13, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2, color: '#d4af37' }} />
              <span>
                Analyze and backtest are not on the Node API. This panel uses engine status, risk settings (with your user ID), signals, and engine trades only.
              </span>
            </div>
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
              <span className="card-title"><Activity size={16} /> Active Signals</span>
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
                        <td>{sig.entryPrice ?? sig.entry ?? '-'}</td>
                        <td style={{ color: '#f85149' }}>{sig.stopLoss ?? sig.sl ?? '-'}</td>
                        <td style={{ color: '#3fb950' }}>{sig.takeProfit ?? sig.tp ?? '-'}</td>
                        <td><span className={`badge ${sig.confidence >= 80 ? 'badge-green' : sig.confidence >= 60 ? 'badge-gold' : 'badge-red'}`}>{sig.confidence}%</span></td>
                        <td>{sig.strategy || '-'}</td>
                        <td>{sig.session || '-'}</td>
                        <td><span className={`badge ${sig.status === 'active' ? 'badge-green' : 'badge-gold'}`}>{sig.status || 'pending'}</span></td>
                      </tr>
                    ))}
                    {(!signals.history || signals.history.length === 0) && (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#545d68' }}>{loading ? 'Loading signals...' : 'No signals yet.'}</td></tr>
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
