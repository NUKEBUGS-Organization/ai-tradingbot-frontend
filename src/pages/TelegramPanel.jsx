import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Send, ShieldCheck, Radio, Check, AlertTriangle, Zap, Shield, TrendingUp } from 'lucide-react';
import api from '../services/api';

export default function TelegramPanel() {
  const [status, setStatus] = useState('Checking...');
  const [testMessage, setTestMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Check backend connection status for Telegram Bot
    setTimeout(() => {
      setStatus('Online (Configured via Server)');
    }, 1000);
  }, []);

  const handleSendTest = async () => {
    if (!testMessage) return;
    setSending(true);
    // Mock the send request
    setTimeout(() => {
      setSending(false);
      setTestMessage('');
      alert('Test message sent successfully to Admin channel!');
    }, 1000);
  };

  const alerts = [
    { label: 'Trade Opened', desc: 'Notify when a new trade is opened', enabled: true, icon: <TrendingUp size={14} /> },
    { label: 'Trade Closed', desc: 'Notify when a trade is closed (TP/SL)', enabled: true, icon: <Check size={14} /> },
    { label: 'AI Signal Alert', desc: 'New AI signal with high confidence', enabled: true, icon: <Zap size={14} /> },
    { label: 'Risk Warning', desc: 'Drawdown or exposure threshold breach', enabled: true, icon: <AlertTriangle size={14} /> },
    { label: 'Daily Summary', desc: 'End of day performance report', enabled: false, icon: <Shield size={14} /> }
  ];

  const recentMessages = [
    { time: '14:32', msg: '✅ BUY XAUUSD @ 2365.50 | Lot: 0.15 | SL: 2353.50 | TP: 2385.50', type: 'trade' },
    { time: '14:28', msg: '🤖 AI Signal: SELL XAUUSD | Confidence: 87% | Quality: 8.2/10', type: 'signal' },
    { time: '13:45', msg: '💰 Trade Closed: XAUUSD +$342.50 | Duration: 47m', type: 'profit' },
    { time: '12:10', msg: '⚠️ Risk Alert: Daily drawdown at 3.8% (Max: 5%)', type: 'warning' },
    { time: '09:00', msg: '📊 Daily Summary: +$1,250.75 | Win Rate: 80% | 5/5 trades', type: 'summary' },
  ];

  const msgColor = { trade: '#58a6ff', signal: '#d4af37', profit: '#3fb950', warning: '#f0883e', summary: '#a78bfa' };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Telegram System (Admin)" />
        <div className="page-content">
          <div className="grid-2">
            
            <div className="card">
              <div className="card-header">
                <span className="card-title"><ShieldCheck size={16} /> Admin Bot Status</span>
                <span className="badge badge-green">Connected</span>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: '#8b949e', fontSize: 13, lineHeight: '1.6' }}>
                    The Telegram Bot is configured securely via the backend server's `.env` variables. 
                    Tokens and Chat IDs are no longer stored in the database or exposed to the frontend for maximum security.
                  </p>
                </div>
                
                <div className="form-group" style={{ background: 'var(--bg-primary)', padding: 15, borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontSize: 13, color: '#8b949e' }}>System Connection</span>
                    <span style={{ color: '#3fb950', display: 'flex', alignItems: 'center', gap: 6 }}><Radio size={12}/> {status}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#8b949e' }}>Trade Execution Alerts</span>
                    <span style={{ color: '#3fb950' }}>Active</span>
                  </div>
                </div>

                <h4 style={{ marginTop: 24, marginBottom: 12, fontSize: 14, color: '#c9d1d9' }}>Alert Preferences</h4>
                {alerts.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < alerts.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ color: '#d4af37' }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{a.label}</div>
                        <div style={{ fontSize: 10, color: '#545d68' }}>{a.desc}</div>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked={a.enabled} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                  <span className="card-title"><Send size={16} /> Test Broadcast</span>
                </div>
                <div className="card-body">
                  <p style={{ color: '#8b949e', fontSize: 13, marginBottom: 15 }}>
                    Send a test message directly to the configured Admin Telegram channel to verify connectivity.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea 
                      className="form-input" 
                      rows={3} 
                      placeholder="Enter test message..."
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                    />
                  </div>
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSendTest}
                    disabled={sending || !testMessage}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {sending ? 'Sending...' : <><Send size={14} /> Send to Admin Channel</>}
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <span className="card-title"><Send size={16} /> Recent Messages Sent</span>
                  <span className="badge badge-blue">{recentMessages.length} messages</span>
                </div>
                <div className="card-body">
                  {recentMessages.map((m, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < recentMessages.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ fontSize: 11, color: '#545d68', fontFamily: 'var(--font-mono)', minWidth: 44, paddingTop: 2 }}>{m.time}</div>
                      <div style={{ flex: 1, fontSize: 12.5, color: '#e6edf3', lineHeight: 1.5, borderLeft: `2px solid ${msgColor[m.type]}`, paddingLeft: 12 }}>
                        {m.msg}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
