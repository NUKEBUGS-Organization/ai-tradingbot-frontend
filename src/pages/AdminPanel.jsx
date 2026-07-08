import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { Users, CreditCard, BarChart3, Activity, Server, Cpu, Database, Radio, UserCheck, UserX, Send, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ dbConnected: true, message: '' });
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState('all');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [tradingConfidence, setTradingConfidence] = useState(45);
  const [signalConfidence, setSignalConfidence] = useState(40);
  const [updatingConfidence, setUpdatingConfidence] = useState(false);
  const [confidenceMsg, setConfidenceMsg] = useState('');
  const [engineStatus, setEngineStatus] = useState(null);
  const [broadcastSymbol, setBroadcastSymbol] = useState('XAUUSD');
  const [broadcastMinConfidence, setBroadcastMinConfidence] = useState(75);
  const [broadcastingSignal, setBroadcastingSignal] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [tab, setTab] = useState('overview');

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const loadEngineStatus = async () => {
      try {
        const status = await api.getEngineStatus();
        setEngineStatus(status);
        if (status?.auto_trade?.trading_min_confidence) {
          setTradingConfidence(status.auto_trade.trading_min_confidence);
        }
        if (status?.auto_trade?.signal_min_confidence) {
          setSignalConfidence(status.auto_trade.signal_min_confidence);
        }
      } catch (err) {
        console.error('Failed to load engine status:', err);
      }
    };
    loadEngineStatus();
  }, []);

  const loadData = async () => {
    try {
      const [d, u] = await Promise.all([api.getAdminDashboard(), api.getAdminUsers()]);
      setData(d);
      setUsers(u.users || []);
      setUsersMeta({
        dbConnected: u.dbConnected !== false,
        total: u.total,
        active: u.active,
        message: u.message || '',
      });
    } catch (err) { console.error(err); }
  };

  const toggleUser = async (id) => {
    try { await api.toggleUser(id); loadData(); } catch (err) { console.error(err); }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setSendingBroadcast(true);
    setBroadcastMsg('');
    try {
      await api.sendTelegramBroadcast({
        message: broadcastMessage,
        audience: broadcastAudience,
      });
      setBroadcastMsg('✅ Message sent to Telegram successfully');
      setBroadcastMessage('');
    } catch (err) {
      setBroadcastMsg(`❌ Failed to send: ${err.message}`);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const handleUpdateConfidence = async () => {
    setUpdatingConfidence(true);
    setConfidenceMsg('');
    try {
      await api.updateEngineConfidence({
        trading_min_confidence: tradingConfidence,
        signal_min_confidence: signalConfidence,
      });
      setConfidenceMsg('✅ Confidence thresholds updated successfully');
      const status = await api.getEngineStatus();
      setEngineStatus(status);
    } catch (err) {
      setConfidenceMsg(`❌ Failed to update: ${err.message}`);
    } finally {
      setUpdatingConfidence(false);
    }
  };

  const handleResetConfidence = async () => {
    setTradingConfidence(45);
    setSignalConfidence(40);
    setConfidenceMsg('Reset to defaults. Click Apply to save.');
  };

  const handleBroadcast = async (isTest = false) => {
    setBroadcastingSignal(true);
    setBroadcastResult(null);
    try {
      const result = await api.adminBroadcastSignal(broadcastSymbol, broadcastMinConfidence, isTest);
      setBroadcastResult(result);
    } catch (err) {
      setBroadcastResult({ success: false, reason: err.message });
    } finally {
      setBroadcastingSignal(false);
    }
  };

  const planData = data ? [
    { name: 'Free', value: data.subscriptions.distribution.free || 0, color: '#545d68' },
    { name: 'Discovery', value: data.subscriptions.distribution.discovery || 0, color: '#3fb950' },
    { name: 'Pro', value: (data.subscriptions.distribution.pro || 0) + (data.subscriptions.distribution.professional || 0) + (data.subscriptions.distribution.starter || 0), color: '#d4af37' },
    { name: 'Elite', value: (data.subscriptions.distribution.elite || 0) + (data.subscriptions.distribution.enterprise || 0), color: '#f0883e' },
  ].filter((p) => p.value > 0) : [];

  const healthItems = data ? [
    { label: 'API Server', status: data.systemHealth.apiStatus, icon: <Server size={14} /> },
    { label: 'Database', status: data.systemHealth.dbStatus, icon: <Database size={14} /> },
    { label: 'WebSocket', status: data.systemHealth.wsStatus, icon: <Radio size={14} /> },
    { label: 'MT5 Bridge', status: data.systemHealth.mt5Bridge, icon: <Activity size={14} /> },
    { label: 'AI Engine', status: data.systemHealth.aiEngine, icon: <Cpu size={14} /> },
    { label: 'Telegram Bot', status: data.systemHealth.telegramBot, icon: <Shield size={14} /> },
  ] : [];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Admin Panel" />
        <div className="page-content admin-page">
          <div className="tabs tabs-scroll">
            <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
            <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
            <button className={`tab ${tab === 'broadcast' ? 'active' : ''}`} onClick={() => setTab('broadcast')}>Broadcast</button>
            <button className={`tab ${tab === 'health' ? 'active' : ''}`} onClick={() => setTab('health')}>System</button>
          </div>

          {tab === 'overview' && data && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header"><span className="stat-card-label">Registered Users</span><div className="stat-card-icon blue"><Users size={16} /></div></div>
                  <div className="stat-card-value">{data.users.registered ?? data.users.total}</div>
                  <div className="stat-card-change up">{data.users.active} active accounts</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header"><span className="stat-card-label">Subscriptions</span><div className="stat-card-icon gold"><CreditCard size={16} /></div></div>
                  <div className="stat-card-value">{data.subscriptions.active}</div>
                  <div className="stat-card-change up">Active plans</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header"><span className="stat-card-label">Total Trades</span><div className="stat-card-icon green"><BarChart3 size={16} /></div></div>
                  <div className="stat-card-value">{data.trading.totalTrades}</div>
                  <div className="stat-card-change up">{data.trading.openTrades} open</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header"><span className="stat-card-label">Platform P&L</span><div className={`stat-card-icon ${parseFloat(data.trading.totalPnL) >= 0 ? 'green' : 'red'}`}><Activity size={16} /></div></div>
                  <div className={`stat-card-value ${parseFloat(data.trading.totalPnL) >= 0 ? 'positive' : 'negative'}`}>${data.trading.totalPnL}</div>
                  <div className="stat-card-change up">All users combined</div>
                </div>
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="card-header"><span className="card-title"><CreditCard size={16} /> Plan Distribution</span></div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={planData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                        <XAxis dataKey="name" stroke="#545d68" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#545d68" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #21262d', borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {planData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header"><span className="card-title"><Activity size={16} /> Active Signals</span></div>
                  <div className="card-body">
                    <div className="admin-mini-grid">
                      <div style={{ padding: 20, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#d4af37', fontFamily: 'var(--font-mono)' }}>{data.signals.active}</div>
                        <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>ACTIVE SIGNALS</div>
                      </div>
                      <div style={{ padding: 20, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#58a6ff', fontFamily: 'var(--font-mono)' }}>{data.signals.total}</div>
                        <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>TOTAL SIGNALS</div>
                      </div>
                      <div style={{ padding: 20, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#3fb950', fontFamily: 'var(--font-mono)' }}>{data.users.active}</div>
                        <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>ONLINE USERS</div>
                      </div>
                      <div style={{ padding: 20, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>{data.users.admins}</div>
                        <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>ADMINS</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'users' && (
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Users size={16} /> Registered Platform Users</span>
                <span className="badge badge-blue">{users.length} accounts</span>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {!usersMeta.dbConnected && (
                  <div style={{ padding: 24, textAlign: 'center', color: '#f85149', fontSize: 13 }}>
                    {usersMeta.message || 'Database is offline. Registered users cannot be loaded until MongoDB is connected.'}
                  </div>
                )}
                {usersMeta.dbConnected && users.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center', color: '#8b949e' }}>
                    No registered users yet. Accounts appear here when clients sign up on the platform.
                  </div>
                )}
                {users.length > 0 && (
                <div className="table-responsive overflow-table-wrapper">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Plan</th><th>Status</th><th>Verified</th><th>Registered</th><th>Balance</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td style={{ color: '#e6edf3', fontWeight: 600 }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className="badge badge-gold">{u.subscription?.plan || 'free'}</span></td>
                          <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                          <td><span className={`badge ${u.emailVerified ? 'badge-green' : 'badge-red'}`}>{u.emailVerified ? 'Yes' : 'No'}</span></td>
                          <td style={{ fontSize: 12, color: '#8b949e' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${(u.mt5Account?.balance ?? 0).toFixed(2)}</td>
                          <td>
                            <button className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`} onClick={() => toggleUser(u._id)}>
                              {u.isActive ? <><UserX size={12} /> Disable</> : <><UserCheck size={12} /> Enable</>}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </div>
          )}

          {tab === 'broadcast' && (
            <div className="admin-broadcast-stack">
            <div className="card">
              <div className="card-header">
                <span className="card-title">⚙️ Engine Configuration</span>
                <span className="badge badge-gold">ADMIN ONLY</span>
              </div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 24 }}>
                  Override engine confidence thresholds. These values take effect immediately
                  without redeploying. Restart engine to revert to environment defaults.
                </p>

                <div className="admin-confidence-grid">
                  <div className="admin-confidence-panel">
                    <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>
                      TRADING MIN CONFIDENCE
                    </div>
                    <div style={{ fontSize: 11, color: '#545d68', marginBottom: 16, lineHeight: 1.6 }}>
                      Minimum confidence % required to generate a TRADE signal.
                      Lower = more trades, higher = more selective.
                    </div>
                    <div className="admin-confidence-slider-row">
                      <input
                        type="range"
                        min="30" max="90" step="5"
                        value={tradingConfidence}
                        onChange={(e) => setTradingConfidence(Number(e.target.value))}
                        style={{ accentColor: '#d4af37' }}
                      />
                      <span className="admin-confidence-value" style={{ color: '#d4af37' }}>
                        {tradingConfidence}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#545d68' }}>
                      <span>30% (More trades)</span>
                      <span>90% (Most selective)</span>
                    </div>
                  </div>

                  <div className="admin-confidence-panel">
                    <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>
                      SIGNAL MIN CONFIDENCE
                    </div>
                    <div style={{ fontSize: 11, color: '#545d68', marginBottom: 16, lineHeight: 1.6 }}>
                      Minimum confidence % required to send signal to Telegram and dashboard.
                      Must be lower than or equal to Trading Min Confidence.
                    </div>
                    <div className="admin-confidence-slider-row">
                      <input
                        type="range"
                        min="30" max="90" step="5"
                        value={signalConfidence}
                        onChange={(e) => setSignalConfidence(Number(e.target.value))}
                        style={{ accentColor: '#58a6ff' }}
                      />
                      <span className="admin-confidence-value" style={{ color: '#58a6ff' }}>
                        {signalConfidence}%
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#545d68' }}>
                      <span>30% (Send more)</span>
                      <span>90% (Send fewer)</span>
                    </div>
                  </div>
                </div>

                <div className="admin-engine-status-row">
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: '#545d68' }}>Current engine trading threshold: </span>
                    <span style={{ color: '#d4af37', fontWeight: 700 }}>{engineStatus?.auto_trade?.trading_min_confidence ?? '—'}%</span>
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: '#545d68' }}>Current engine signal threshold: </span>
                    <span style={{ color: '#58a6ff', fontWeight: 700 }}>{engineStatus?.auto_trade?.signal_min_confidence ?? '—'}%</span>
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: '#545d68' }}>Env default trading: </span>
                    <span style={{ color: '#8b949e' }}>45%</span>
                  </div>
                  <div style={{ fontSize: 12 }}>
                    <span style={{ color: '#545d68' }}>Env default signal: </span>
                    <span style={{ color: '#8b949e' }}>40%</span>
                  </div>
                </div>

                <div className="admin-action-row">
                  <button
                    type="button"
                    onClick={handleUpdateConfidence}
                    disabled={updatingConfidence}
                    className="btn-apply-confidence"
                  >
                    {updatingConfidence ? 'Updating...' : '⚡ Apply to Engine'}
                  </button>
                  <button
                    type="button"
                    onClick={handleResetConfidence}
                    className="btn-reset-confidence"
                  >
                    Reset to Defaults
                  </button>
                </div>

                {confidenceMsg && (
                  <div style={{
                    marginTop: 12, fontSize: 12,
                    color: confidenceMsg.includes('✅') ? '#3fb950' : '#f85149',
                  }}>
                    {confidenceMsg}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-broadcast-grid">
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Radio size={16} /> Signal Broadcasting</span>
                <span className="badge badge-gold">Admin Only</span>
              </div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 16 }}>
                  Manually trigger AI analysis and broadcast high-confidence signals to Telegram.
                  Only signals meeting the minimum confidence threshold will be sent.
                </p>

                <div className="responsive-grid-2" style={{ marginBottom: 16 }}>
                  <div>
                    <label className="form-label">Symbol</label>
                    <select
                      className="form-input"
                      value={broadcastSymbol}
                      onChange={(e) => setBroadcastSymbol(e.target.value)}
                    >
                      <option value="XAUUSD">XAUUSD (Gold)</option>
                      <option value="EURUSD">EURUSD</option>
                      <option value="GBPUSD">GBPUSD</option>
                      <option value="USDJPY">USDJPY</option>
                      <option value="GBPJPY">GBPJPY</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">
                      Min Confidence: {broadcastMinConfidence}%
                    </label>
                    <input
                      type="range"
                      min="65"
                      max="95"
                      value={broadcastMinConfidence}
                      onChange={(e) => setBroadcastMinConfidence(Number(e.target.value))}
                      style={{ width: '100%', accentColor: '#d4af37' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#545d68' }}>
                      <span>65% (Min)</span>
                      <span>95% (Max)</span>
                    </div>
                  </div>
                </div>

                <div className="admin-broadcast-actions">
                  <button
                    type="button"
                    onClick={() => handleBroadcast(false)}
                    disabled={broadcastingSignal}
                    className="btn btn-primary"
                  >
                    {broadcastingSignal ? 'Analyzing...' : '📡 Analyze & Broadcast'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBroadcast(true)}
                    disabled={broadcastingSignal}
                    className="btn btn-secondary"
                  >
                    {broadcastingSignal ? 'Sending...' : '🧪 Send Test Signal'}
                  </button>
                </div>

                {broadcastResult && (
                  <div style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 8,
                    background: broadcastResult.success ? 'rgba(63,185,80,0.1)' : 'rgba(248,81,73,0.1)',
                    border: `1px solid ${broadcastResult.success ? '#3fb950' : '#f85149'}`,
                    fontSize: 13,
                  }}>
                    {broadcastResult.success ? (
                      <div>
                        <div style={{ color: '#3fb950', fontWeight: 700, marginBottom: 4 }}>
                          ✅ {broadcastResult.test ? 'Test signal sent!' : 'Signal broadcast successfully!'}
                        </div>
                        {broadcastResult.signal && (
                          <div style={{ color: '#8b949e' }}>
                            {broadcastResult.signal.direction} {broadcastResult.signal.symbol} —
                            Confidence: {broadcastResult.signal.confidence}% ({broadcastResult.signal.grade}) —
                            Sent to: {broadcastResult.sent_to} recipients
                          </div>
                        )}
                        {broadcastResult.test && !broadcastResult.signal && (
                          <div style={{ color: '#8b949e' }}>Sent to {broadcastResult.sent_to} recipients</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#f85149' }}>
                        ❌ {broadcastResult.reason || 'Broadcast failed'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title"><Send size={16} /> Broadcast Message</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select className="form-input" value={broadcastAudience} onChange={e => setBroadcastAudience(e.target.value)}>
                    <option value="all">All Subscribers</option>
                    <option value="premium">Premium Users Only</option>
                    <option value="free">Free Users Only</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows={5} placeholder="Type your broadcast message..."
                    value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <button type="button" className="btn btn-primary" onClick={handleSendBroadcast} disabled={sendingBroadcast}>
                  <Send size={14} /> {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                </button>
                {broadcastMsg && (
                  <div style={{
                    marginTop: 12, fontSize: 12,
                    color: broadcastMsg.includes('✅') ? '#3fb950' : '#f85149',
                  }}>
                    {broadcastMsg}
                  </div>
                )}
              </div>
            </div>
            </div>
            </div>
          )}

          {tab === 'health' && (
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><span className="card-title"><Server size={16} /> System Health</span><span className="badge badge-green">All Operational</span></div>
                <div className="card-body">
                  {healthItems.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < healthItems.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: '#8b949e' }}>{item.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                      </div>
                      <span className="badge badge-green">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><span className="card-title"><Cpu size={16} /> Server Metrics</span></div>
                <div className="card-body">
                  {data && (
                    <div style={{ display: 'grid', gap: 16 }}>
                      <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: 10, color: '#545d68', marginBottom: 4 }}>UPTIME</div>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#3fb950' }}>
                          {Math.floor(data.systemHealth.uptime / 3600)}h {Math.floor((data.systemHealth.uptime % 3600) / 60)}m
                        </div>
                      </div>
                      <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: 10, color: '#545d68', marginBottom: 4 }}>MEMORY USAGE</div>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#d4af37' }}>
                          {(data.systemHealth.memory.heapUsed / 1024 / 1024).toFixed(1)} MB
                        </div>
                      </div>
                      <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: 10, color: '#545d68', marginBottom: 4 }}>TRADING VOLUME</div>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#58a6ff' }}>
                          ${parseFloat(data.trading.totalVolume).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
