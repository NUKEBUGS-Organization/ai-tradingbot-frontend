import React from 'react';
import { CheckCircle, Lock, Zap, Shield, TrendingUp, Bell, BarChart3, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TIER_FEATURES = {
  free: {
    active: [
      { icon: <Shield size={16} />, label: 'Dashboard Access', desc: 'Basic platform access' },
      { icon: <Zap size={16} />, label: 'Referral Program', desc: 'Earn commissions by referring' },
    ],
    locked: [
      { icon: <Bell size={16} />, label: 'AI Signal Feed', requiredTier: 'discovery', desc: 'Real-time market pattern alerts' },
      { icon: <Bell size={16} />, label: 'Telegram Access', requiredTier: 'discovery', desc: 'Private research community' },
      { icon: <TrendingUp size={16} />, label: 'Risk Management', requiredTier: 'pro', desc: 'Advanced risk controls' },
      { icon: <BarChart3 size={16} />, label: 'Performance Analytics', requiredTier: 'pro', desc: 'Win rate, profit factor tracking' },
      { icon: <BarChart3 size={16} />, label: 'Backtesting', requiredTier: 'elite', desc: 'Historical strategy testing' },
    ]
  },
  discovery: {
    active: [
      { icon: <Shield size={16} />, label: 'Dashboard Access', desc: 'Full platform access' },
      { icon: <Bell size={16} />, label: 'AI Signal Feed', desc: 'Real-time market pattern alerts' },
      { icon: <Bell size={16} />, label: 'Telegram Access', desc: 'Research community access' },
      { icon: <Zap size={16} />, label: 'Signal History', desc: 'Full signal archive' },
      { icon: <Zap size={16} />, label: 'Referral Program', desc: 'Earn commissions' },
    ],
    locked: [
      { icon: <TrendingUp size={16} />, label: 'Risk Profile Selection', requiredTier: 'pro', desc: 'Conservative/Moderate/Aggressive' },
      { icon: <Settings size={16} />, label: 'Advanced AI Analysis', requiredTier: 'pro', desc: 'Deep market structure analysis' },
      { icon: <BarChart3 size={16} />, label: 'Performance Analytics', requiredTier: 'pro', desc: 'Win rate, profit factor tracking' },
      { icon: <BarChart3 size={16} />, label: 'Backtesting', requiredTier: 'elite', desc: 'Historical strategy testing' },
    ]
  },
  pro: {
    active: [
      { icon: <Shield size={16} />, label: 'Full Dashboard Access', desc: 'All PRO features unlocked' },
      { icon: <Bell size={16} />, label: 'AI Signal Feed', desc: 'Priority signal delivery' },
      { icon: <Bell size={16} />, label: 'Telegram Access', desc: 'Priority research community' },
      { icon: <TrendingUp size={16} />, label: 'Risk Management', desc: 'Full risk controls' },
      { icon: <Settings size={16} />, label: 'Advanced AI Analysis', desc: 'Deep market structure' },
      { icon: <BarChart3 size={16} />, label: 'Performance Analytics', desc: 'Win rate, profit factor' },
      { icon: <Zap size={16} />, label: 'Referral Program', desc: 'Earn commissions' },
    ],
    locked: [
      { icon: <BarChart3 size={16} />, label: 'Advanced Backtesting', requiredTier: 'elite', desc: 'Historical strategy testing' },
      { icon: <BarChart3 size={16} />, label: 'Drawdown Analytics', requiredTier: 'elite', desc: 'Advanced drawdown tracking' },
      { icon: <Zap size={16} />, label: 'VIP Support', requiredTier: 'elite', desc: 'Priority technical support' },
    ]
  },
  elite: {
    active: [
      { icon: <Shield size={16} />, label: 'Full Elite Access', desc: 'All features unlocked' },
      { icon: <Bell size={16} />, label: 'Priority Signal Delivery', desc: 'First to receive alerts' },
      { icon: <BarChart3 size={16} />, label: 'Advanced Backtesting', desc: 'Full historical testing' },
      { icon: <BarChart3 size={16} />, label: 'Drawdown Analytics', desc: 'Professional tracking' },
      { icon: <TrendingUp size={16} />, label: 'All Risk Controls', desc: 'Institutional grade' },
      { icon: <Zap size={16} />, label: 'VIP Support', desc: 'Dedicated assistance' },
    ],
    locked: []
  }
};

const UPGRADE_OPTIONS = {
  free: { next: 'discovery', label: 'VCL4X DISCOVERY', price: '$99/mo', highlight: true },
  discovery: { next: 'pro', label: 'VCL4X PRO', price: '$149/mo', highlight: true },
  pro: { next: 'elite', label: 'VCL4X ELITE', price: '$199/mo', highlight: false },
  elite: null
};

export default function TierDashboard({ currentTier = 'free', userName = '' }) {
  const navigate = useNavigate();
  const features = TIER_FEATURES[currentTier] || TIER_FEATURES.free;
  const upgrade = UPGRADE_OPTIONS[currentTier];

  const tierColors = {
    free: '#8b949e',
    discovery: '#3fb950',
    pro: '#d4af37',
    elite: '#f0883e'
  };

  const tierBadges = {
    free: 'FREE',
    discovery: 'DISCOVERY',
    pro: 'PRO',
    elite: 'ELITE'
  };

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Current Plan Banner */}
      <div style={{
        background: '#161b22', border: `1px solid ${tierColors[currentTier]}44`,
        borderRadius: 12, padding: '16px 20px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            background: `${tierColors[currentTier]}22`,
            color: tierColors[currentTier],
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700
          }}>
            {tierBadges[currentTier]}
          </span>
          <span style={{ fontSize: 14, color: '#e6edf3' }}>
            {userName ? `Welcome back, ${userName}` : 'Your Current Plan'}
          </span>
        </div>
        {upgrade && (
          <button
            onClick={() => navigate('/subscriptions')}
            style={{
              background: 'linear-gradient(135deg, #d4af37, #f0c040)',
              color: '#0a0a0f', border: 'none', borderRadius: 8,
              padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer'
            }}
          >
            Upgrade to {upgrade.label} — {upgrade.price}
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: upgrade ? '1fr 1fr 1fr' : '1fr 1fr', gap: 16 }}>

        {/* Active Access */}
        <div style={{ background: '#161b22', border: '1px solid rgba(63,185,80,0.3)', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#3fb950', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle size={14} /> ACTIVE ACCESS
          </div>
          {features.active.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
              <div style={{ color: '#3fb950', marginTop: 1, flexShrink: 0 }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e6edf3' }}>{f.label}</div>
                <div style={{ fontSize: 11, color: '#545d68' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Locked Features */}
        {features.locked.length > 0 && (
          <div style={{ background: '#161b22', border: '1px solid rgba(248,81,73,0.2)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#f85149', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Lock size={14} /> LOCKED FEATURES
            </div>
            {features.locked.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, opacity: 0.7 }}>
                <div style={{ color: '#f85149', marginTop: 1, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#8b949e' }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: '#d4af37' }}>Requires {f.requiredTier.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade Options */}
        {upgrade && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(212,175,55,0.05))',
            border: '1px solid rgba(212,175,55,0.4)', borderRadius: 12, padding: 20
          }}>
            <div style={{ fontSize: 12, color: '#d4af37', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} /> UPGRADE OPTIONS
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#d4af37', marginBottom: 4 }}>{upgrade.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#e6edf3', marginBottom: 12 }}>{upgrade.price}</div>
            <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16, lineHeight: 1.6 }}>
              Unlock more analytical tools, advanced AI insights, and priority signal delivery.
            </div>
            <button
              onClick={() => navigate('/subscriptions')}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #d4af37, #f0c040)',
                color: '#0a0a0f', border: 'none', borderRadius: 8,
                padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
              }}
            >
              View Plans →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
