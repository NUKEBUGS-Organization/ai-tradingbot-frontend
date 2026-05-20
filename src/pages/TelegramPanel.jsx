import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Send, ShieldCheck, Radio, Check, AlertTriangle, Zap, Shield, TrendingUp, Users, MessageSquare, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function TelegramPanel() {
  const [engineStatus, setEngineStatus] = useState(null);
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const status = await api.getEngineStatus();
      setEngineStatus(status);
      setTelegramStatus(status?.telegram || null);
    } catch (err) {
      console.error('Failed to load engine status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSendTest = async () => {
    if (!testMessage.trim()) return;
    setSending(true);
    setBroadcastResult(null);
    try {
      const result = await api.broadcastMessage(testMessage);
      setBroadcastResult({ success: true, message: `Sent to ${result?.recipients || result?.sent || 0} recipients` });
      setTestMessage('');
    } catch (err) {
      setBroadcastResult({ success: false, message: 'Failed to send message' });
    } finally {
      setSending(false);
    }
  };

  const isConnected = telegramStatus?.is_running && telegramStatus?.token_configured;

  const alerts = [
    { label: 'Trade Opened', desc: 'Notify when a new trade is opened', enabled: true, icon: <TrendingUp size={14} /> },
    { label: 'Trade Closed', desc: 'Notify when a trade is closed (TP/SL)', enabled: true, icon: <Check size={14} /> },
    { label: 'AI Signal Alert', desc: 'New AI signal with high confidence', enabled: true, icon: <Zap size={14} /> },
    { label: 'Risk Warning', desc: 'Drawdown or exposure threshold breach', enabled: true, icon: <AlertTriangle size={14} /> },
    { label: 'Daily Summary', desc: 'End of day performance report', enabled: false, icon: <Shield size={14} /> }
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Telegram System (Admin)" />
        <div className="page-content">

          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 24 }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Bot Status</span>
                <div className="stat-card-icon green"><Radio size={16} /></div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 18 }}>
                {loading ? 'Checking...' : isConnected ? 'Online' : 'Offline'}
              </div>
              <div className="stat-card-change" style={{ color: isConnected ? '#3fb950' : '#f85149' }}>
                {loading ? '...' : isConnected ? 'Token configured' : 'Not configured'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Subscribers</span>
                <div className="stat-card-icon blue"><Users size={16} /></div>
              </div>
              <div className="stat-card-value">{loading ? '...' : telegramStatus?.subscribers ?? 0}</div>
              <div className="stat-card-change" style={{ color: '#8b949e' }}>Active subscriptions</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Messages Sent</span>
                <div className="stat-card-icon gold"><MessageSquare size={16} /></div>
              </div>
              <div className="stat-card-value">{loading ? '...' : telegramStatus?.messages_sent ?? 0}</div>
              <div className="stat-card-change" style={{ color: '#8b949e' }}>This session</div>
            </div>

            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Telegram Library</span>
                <div className="stat-card-icon purple"><ShieldCheck size={16} /></div>
              </div>
              <div className="stat-card-value" style={{ fontSize: 18 }}>
                {loading ? '...' : telegramStatus?.telegram_available ? 'Available' : 'Missing'}
              </div>
              <div className="stat-card-change" style={{ color: telegramStatus?.telegram_available ? '#3fb950' : '#f85149' }}>
                python-telegram-bot
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <span className="card-title"><ShieldCheck size={16} /> Admin Bot Status</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={loadStatus} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e' }}>
                    <RefreshCw size={14} />
                  </button>
                  <span className={`badge ${isConnected ? 'badge-green' : 'badge-red'}`}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 20 }}>
                  {alerts.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < alerts.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ color: '#d4af37' }}>{a.icon}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                          <div style={{ fontSize: 11, color: '#545d68' }}>{a.desc}</div>
                        </div>
                      </div>
                      <label className="toggle">
                        <input type="checkbox" defaultChecked={a.enabled} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 8 }}>Broadcast Message</div>
                  <textarea
                    value={testMessage}
                    onChange={e => setTestMessage(e.target.value)}
                    placeholder="Type a message to broadcast to all subscribers..."
                    style={{ width: '100%', minHeight: 80, background: 'var(--bg-primary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', padding: 10, color: 'var(--text-primary)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                  />
                  {broadcastResult && (
                    <div style={{ marginTop: 8, fontSize: 12, color: broadcastResult.success ? '#3fb950' : '#f85149' }}>
                      {broadcastResult.message}
                    </div>
                  )}
                  <button
                    onClick={handleSendTest}
                    disabled={sending || !testMessage.trim() || !isConnected}
                    className="btn btn-primary"
                    style={{ marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Send size={14} />
                    {sending ? 'Sending...' : 'Send Broadcast'}
                  </button>
                  {!isConnected && (
                    <div style={{ fontSize: 11, color: '#f85149', marginTop: 6, textAlign: 'center' }}>
                      Bot must be connected to send messages
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title"><Radio size={16} /> Signal Configuration</span>
              </div>
              <div className="card-body">
                <div style={{ fontSize: 13, color: '#8b949e', marginBottom: 16 }}>
                  Signals are automatically broadcast to all subscribers when the AI engine generates a high-confidence trade signal (≥75% confidence, grades A+/A/B).
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: 16, border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Min Confidence</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#d4af37' }}>75%</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: 16, border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Allowed Grades</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#3fb950' }}>A+, A, B</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: 16, border: '1px solid var(--border-subtle)', marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Active Sessions</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>London, New York, Overlap</div>
                </div>
                <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: 16, border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 4 }}>Subscriber Count</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#58a6ff' }}>{telegramStatus?.subscribers ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
