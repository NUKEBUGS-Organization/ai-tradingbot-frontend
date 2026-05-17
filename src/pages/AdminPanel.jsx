import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { Users, CreditCard, BarChart3, Activity, Server, Cpu, Database, Radio, UserCheck, UserX, Send, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminPanel() {
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');
  const [tab, setTab] = useState('overview');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [d, u] = await Promise.all([api.getAdminDashboard(), api.getAdminUsers()]);
      setData(d);
      setUsers(u);
    } catch (err) { console.error(err); }
  };

  const toggleUser = async (id) => {
    try { await api.toggleUser(id); loadData(); } catch (err) { console.error(err); }
  };

  const sendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      await api.broadcast(broadcastMsg, broadcastTarget);
      setBroadcastMsg('');
      alert('Broadcast sent successfully!');
    } catch (err) { console.error(err); }
  };

  const planData = data ? [
    { name: 'Free', value: data.subscriptions.distribution.free, color: '#545d68' },
    { name: 'Starter', value: data.subscriptions.distribution.starter, color: '#58a6ff' },
    { name: 'Pro', value: data.subscriptions.distribution.professional, color: '#d4af37' },
    { name: 'Enterprise', value: data.subscriptions.distribution.enterprise, color: '#a78bfa' },
  ] : [];

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
        <div className="page-content">
          <div className="tabs" style={{ maxWidth: 500 }}>
            <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
            <button className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>Users</button>
            <button className={`tab ${tab === 'broadcast' ? 'active' : ''}`} onClick={() => setTab('broadcast')}>Broadcast</button>
            <button className={`tab ${tab === 'health' ? 'active' : ''}`} onClick={() => setTab('health')}>System</button>
          </div>

          {tab === 'overview' && data && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header"><span className="stat-card-label">Total Users</span><div className="stat-card-icon blue"><Users size={16} /></div></div>
                  <div className="stat-card-value">{data.users.total}</div>
                  <div className="stat-card-change up">{data.users.active} active</div>
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
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
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
              <div className="card-header"><span className="card-title"><Users size={16} /> User Management</span><span className="badge badge-blue">{users.length} users</span></div>
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Plan</th><th>Status</th><th>Balance</th><th>Win Rate</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td style={{ color: '#e6edf3', fontWeight: 600 }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td><span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{u.role}</span></td>
                          <td><span className="badge badge-gold">{u.subscription?.plan}</span></td>
                          <td><span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                          <td style={{ fontFamily: 'var(--font-mono)' }}>${u.mt5Account?.balance?.toFixed(2)}</td>
                          <td style={{ fontFamily: 'var(--font-mono)', color: '#3fb950' }}>{u.stats?.winRate?.toFixed(1)}%</td>
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
              </div>
            </div>
          )}

          {tab === 'broadcast' && (
            <div className="card" style={{ maxWidth: 600 }}>
              <div className="card-header"><span className="card-title"><Send size={16} /> Broadcast Message</span></div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Target Audience</label>
                  <select className="form-input" value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)}>
                    <option value="all">All Users</option>
                    <option value="starter">Starter Plan</option>
                    <option value="professional">Professional Plan</option>
                    <option value="enterprise">Enterprise Plan</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows={5} placeholder="Type your broadcast message..."
                    value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} style={{ resize: 'vertical' }} />
                </div>
                <button className="btn btn-primary" onClick={sendBroadcast}><Send size={14} /> Send Broadcast</button>
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
