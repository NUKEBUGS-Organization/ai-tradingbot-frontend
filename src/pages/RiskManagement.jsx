import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../services/websocket';
import api from '../services/api';
import { Shield, AlertTriangle, TrendingDown, Layers, Zap, Newspaper, BarChart3, Target } from 'lucide-react';

export default function RiskManagement() {
  const { user } = useAuth();
  const { account } = useWebSocket();
  const [activePreset, setActivePreset] = useState(null);
  const [presetLoading, setPresetLoading] = useState(false);
  const risk = user?.riskSettings || {};

  useEffect(() => {
    if (user?.riskSettings?.maxRiskPerTrade) {
      const r = user.riskSettings.maxRiskPerTrade;
      setActivePreset(r <= 1 ? 'conservative' : r <= 3 ? 'moderate' : 'aggressive');
    }
  }, [user]);

  const handlePresetChange = async (presetLabel) => {
    const preset = presetLabel.toLowerCase();
    setPresetLoading(true);
    try {
      await api.setRiskPreset(preset);
      setActivePreset(preset);
    } catch (err) {
      console.error('Failed to change preset:', err);
    } finally {
      setPresetLoading(false);
    }
  };
  const bal = account?.balance || user?.mt5Account?.balance || 10000;
  const eq = account?.equity || user?.mt5Account?.equity || 10000;
  const ddPct = ((bal - eq) / bal * 100).toFixed(2);

  const riskMetrics = [
    { label: 'Current Exposure', value: `$${(account?.margin || user?.mt5Account?.margin || 0).toFixed(2)}`, sub: `${((account?.margin || 0) / bal * 100).toFixed(1)}% of balance`, icon: <Layers size={16} />, color: 'blue' },
    { label: 'Daily Drawdown', value: `${Math.abs(ddPct)}%`, sub: `Max allowed: ${risk.maxDailyDrawdown || 5}%`, icon: <TrendingDown size={16} />, color: parseFloat(ddPct) > 3 ? 'red' : 'green' },
    { label: 'Max Risk/Trade', value: `${risk.maxRiskPerTrade || 2}%`, sub: `$${(bal * (risk.maxRiskPerTrade || 2) / 100).toFixed(2)} per trade`, icon: <Target size={16} />, color: 'gold' },
    { label: 'Open Positions', value: `${account ? '4' : '0'} / ${risk.maxOpenPositions || 5}`, sub: 'Position limit', icon: <BarChart3 size={16} />, color: 'purple' },
  ];

  const controls = [
    { label: 'Dynamic Lot Sizing', desc: 'Auto-calculate lot size based on risk %', enabled: risk.dynamicLotSizing !== false, icon: <Zap size={16} /> },
    { label: 'Spread Protection', desc: 'Skip trades when spread exceeds threshold', enabled: risk.spreadProtection !== false, icon: <Shield size={16} /> },
    { label: 'News Filter', desc: 'Pause trading during high-impact news events', enabled: risk.newsFilter !== false, icon: <Newspaper size={16} /> },
  ];

  const riskLevels = [
    { label: 'Conservative', key: 'conservative', maxRisk: 1, maxDD: 3, maxPos: 3, color: '#3fb950' },
    { label: 'Moderate', key: 'moderate', maxRisk: 2, maxDD: 5, maxPos: 5, color: '#d4af37' },
    { label: 'Aggressive', key: 'aggressive', maxRisk: 5, maxDD: 10, maxPos: 10, color: '#f85149' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Risk Management" />
        <div className="page-content">
          <div className="stats-grid">
            {riskMetrics.map((m, i) => (
              <div className="stat-card" key={i}>
                <div className="stat-card-header">
                  <span className="stat-card-label">{m.label}</span>
                  <div className={`stat-card-icon ${m.color}`}>{m.icon}</div>
                </div>
                <div className="stat-card-value">{m.value}</div>
                <div className="stat-card-change" style={{ color: '#8b949e' }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <span className="card-title"><Shield size={16} /> Risk Controls</span>
                <span className="badge badge-green">Protected</span>
              </div>
              <div className="card-body">
                {controls.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: i < controls.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ color: '#d4af37' }}>{c.icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.label}</div>
                        <div style={{ fontSize: 11, color: '#545d68' }}>{c.desc}</div>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked={c.enabled} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title"><AlertTriangle size={16} /> Risk Profile</span>
              </div>
              <div className="card-body">
                {riskLevels.map((level, i) => (
                  <div
                    key={i}
                    role="button"
                    tabIndex={0}
                    onClick={() => !presetLoading && handlePresetChange(level.label)}
                    onKeyDown={(e) => e.key === 'Enter' && !presetLoading && handlePresetChange(level.label)}
                    style={{
                    padding: 16, marginBottom: 12, borderRadius: 'var(--radius-sm)',
                    background: level.key === activePreset ? 'rgba(212,175,55,0.06)' : 'var(--bg-primary)',
                    border: `1px solid ${level.key === activePreset ? 'rgba(212,175,55,0.2)' : 'var(--border-subtle)'}`,
                    cursor: presetLoading ? 'wait' : 'pointer',
                    opacity: presetLoading ? 0.6 : 1,
                    transition: 'var(--transition)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: level.color }}>{level.label}</span>
                      {level.key === activePreset && <span className="badge badge-gold">Active</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 20, fontSize: 11, color: '#8b949e' }}>
                      <span>Risk: {level.maxRisk}%</span>
                      <span>Max DD: {level.maxDD}%</span>
                      <span>Positions: {level.maxPos}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title"><BarChart3 size={16} /> Drawdown Monitor</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {[
                  { label: 'Daily DD', value: ddPct, max: risk.maxDailyDrawdown || 5, color: parseFloat(ddPct) > 3 ? '#f85149' : '#3fb950' },
                  { label: 'Weekly DD', value: '2.3', max: 10, color: '#d4af37' },
                  { label: 'Monthly DD', value: '4.1', max: 15, color: '#58a6ff' },
                ].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center', padding: 20, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: 28, fontWeight: 800, color: item.color, fontFamily: 'var(--font-mono)' }}>{item.value}%</div>
                    <div style={{ fontSize: 10, color: '#545d68', margin: '8px 0' }}>{item.label}</div>
                    <div className="signal-bar" style={{ height: 4 }}>
                      <div className="signal-bar-fill" style={{ width: `${(parseFloat(item.value) / item.max) * 100}%`, background: item.color }}></div>
                    </div>
                    <div style={{ fontSize: 10, color: '#545d68', marginTop: 4 }}>Max: {item.max}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
