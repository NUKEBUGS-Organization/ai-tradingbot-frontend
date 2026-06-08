import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { Check, X, Key } from 'lucide-react';

const plans = [
  {
    id: 'discovery',
    name: 'VCL4X DISCOVERY',
    price: 99,
    interval: 'month',
    badge: '5-Day Free Trial',
    badgeColor: '#3fb950',
    description: 'Learn How the AI Thinks Before You Risk More Capital',
    bestFor: 'New traders, learners, and traders seeking guidance',
    highlighted: false,
    features: [
      { text: '5-Day Free Trial', included: true },
      { text: 'AI Signal Feed', included: true },
      { text: 'Telegram Access', included: true },
      { text: 'Economic News Alerts', included: true },
      { text: 'Market Intelligence Dashboard', included: true },
      { text: 'Signal History', included: true },
      { text: 'Community Access', included: true },
      { text: 'Multi-Pair Coverage', included: true },
      { text: 'Risk Profile Selection', included: false },
      { text: 'Advanced AI Analysis', included: false },
      { text: 'Performance Analytics', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'VCL4X PRO',
    price: 149,
    interval: 'month',
    badge: '⭐ MOST POPULAR',
    badgeColor: '#d4af37',
    description: 'Everything You Need To Trade With Confidence',
    bestFor: 'Serious traders who want a complete trading ecosystem',
    highlighted: true,
    features: [
      { text: 'Everything in Discovery', included: true },
      { text: 'Advanced AI Analysis', included: true },
      { text: 'Trade Confidence Scoring', included: true },
      { text: 'Entry / SL / TP Visibility', included: true },
      { text: 'Risk Profile Selection', included: true },
      { text: 'Market Structure Analysis', included: true },
      { text: 'News Event Protection', included: true },
      { text: 'Performance Analytics', included: true },
      { text: 'Referral Program Access', included: true },
      { text: 'Priority Signal Delivery', included: true },
      { text: 'Advanced Market Intelligence', included: true },
    ],
  },
  {
    id: 'elite',
    name: 'VCL4X ELITE',
    price: 199,
    interval: 'month',
    badge: '🔥 PROFESSIONAL',
    badgeColor: '#f0883e',
    description: 'Built For Traders Who Want Every Possible Advantage',
    bestFor: 'Professional traders who want institutional-level tools',
    highlighted: false,
    features: [
      { text: 'Everything in PRO', included: true },
      { text: 'Advanced Backtesting', included: true },
      { text: 'Drawdown Analytics', included: true },
      { text: 'Win Rate Analytics', included: true },
      { text: 'Profit Factor Tracking', included: true },
      { text: 'Multi-Pair Performance Center', included: true },
      { text: 'VIP Feature Access', included: true },
      { text: 'Early Access Releases', included: true },
      { text: 'Priority Technical Support', included: true },
      { text: 'Dedicated Onboarding', included: true },
      { text: 'Future Mobile App Access', included: true },
    ],
  },
];

const licenses = [
  {
    id: 'personal',
    name: 'PERSONAL LICENSE',
    price: 2300,
    interval: '6 months',
    accounts: '1 MT5 Account',
    features: [
      'AI Auto Execution',
      'Signal Synchronization',
      'VPS Compatible',
      'Real-Time Trade Management',
    ],
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL LICENSE',
    price: 2999,
    interval: '6 months',
    accounts: 'Up to 3 MT5 Accounts',
    highlighted: true,
    features: [
      'Everything in Personal',
      'Multi-Account Access',
      'Advanced Automation',
      'Priority Support',
    ],
  },
  {
    id: 'elite_license',
    name: 'ELITE LICENSE',
    price: 3699,
    interval: '6 months',
    accounts: 'Up to 10 MT5 Accounts',
    badge: '🔥 Built for serious traders and teams',
    features: [
      'Everything in Professional',
      'Advanced License Controls',
      'Team Management',
      'Premium Support',
    ],
  },
];

const upgradeProblems = [
  'Emotional decisions',
  'Lack of discipline',
  'Missed opportunities',
  'Poor risk management',
];

const upgradeSteps = [
  'Start With A Subscription',
  'Scale With Automation',
  'Trade With Confidence',
];

export default function Subscriptions() {
  const [mySub, setMySub] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [, s] = await Promise.all([api.getPlans(), api.getMySubscription()]);
      setMySub(s);
    } catch (err) { console.error(err); }
  };

  const handleUpgrade = (planId) => {
    if (planId === mySub?.plan) return;
    alert(`This would open the payment gateway for the ${planId} plan.`);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Subscription & Licensing" />
        <div className="page-content">
          {mySub && (
            <div className="card mb-24">
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Current Plan</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#d4af37', textTransform: 'capitalize' }}>{mySub.plan}</span>
                    <span className={`badge ${mySub.status === 'active' ? 'badge-green' : 'badge-red'}`}>{mySub.status}</span>
                  </div>
                </div>

                {mySub.plan !== 'free' && (
                  <div>
                    <div style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>License Key</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-primary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <Key size={14} style={{ color: '#d4af37' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{mySub.licenseKey || 'AX-****-****-****'}</span>
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ fontSize: 12, color: '#8b949e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Next Billing</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>
                    {mySub.billing?.nextBillingDate ? new Date(mySub.billing.nextBillingDate).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#e6edf3' }}>Subscription Plans</h2>
          <p style={{ fontSize: 14, color: '#8b949e', marginBottom: 24 }}>Choose the plan that fits your trading journey.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 40 }}>
            {plans.map((p) => {
              const isActive = mySub?.plan === p.id;

              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    position: 'relative',
                    borderColor: isActive ? 'var(--gold)' : p.highlighted ? 'rgba(212,175,55,0.6)' : 'var(--border-primary)',
                    transform: p.highlighted ? 'scale(1.02)' : isActive ? 'scale(1.01)' : 'none',
                    boxShadow: p.highlighted
                      ? '0 0 32px rgba(212,175,55,0.25), 0 0 0 1px rgba(212,175,55,0.3)'
                      : isActive
                        ? '0 0 20px rgba(212,175,55,0.1)'
                        : 'none',
                    zIndex: p.highlighted || isActive ? 2 : 1,
                  }}
                >
                  {isActive && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#000', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Current Plan
                    </div>
                  )}
                  {!isActive && p.badge && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: p.badgeColor, color: p.badgeColor === '#d4af37' ? '#000' : '#fff', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {p.badge}
                    </div>
                  )}

                  <div className="card-body" style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, marginTop: 8, color: '#e6edf3' }}>{p.name}</h3>
                    <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.5, minHeight: 40 }}>{p.description}</p>

                    <div style={{ margin: '20px 0' }}>
                      <span style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#d4af37' }}>${p.price}</span>
                      <span style={{ fontSize: 12, color: '#8b949e' }}>/{p.interval}</span>
                    </div>

                    <ul style={{ textAlign: 'left', marginBottom: 20, fontSize: 13, flex: 1, listStyle: 'none', padding: 0 }}>
                      {p.features.map((f) => (
                        <li key={f.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                          {f.included ? (
                            <Check size={16} style={{ color: '#3fb950', flexShrink: 0, marginTop: 2 }} />
                          ) : (
                            <X size={16} style={{ color: '#545d68', flexShrink: 0, marginTop: 2 }} />
                          )}
                          <span style={{ color: f.included ? '#e6edf3' : '#545d68' }}>{f.text}</span>
                        </li>
                      ))}
                    </ul>

                    <p style={{ fontSize: 11, color: '#545d68', fontStyle: 'italic', marginBottom: 16 }}>
                      Best for: {p.bestFor}
                    </p>

                    <button
                      className={`btn ${isActive ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ width: '100%' }}
                      onClick={() => handleUpgrade(p.id)}
                      disabled={isActive}
                    >
                      {isActive ? 'Current Plan' : p.id === 'discovery' ? 'Start Free Trial' : p.id === 'elite' ? 'Go Elite' : 'Get Started'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="card mb-40"
            style={{
              background: '#0d1117',
              border: '1px solid var(--border-primary)',
              overflow: 'hidden',
            }}
          >
            <div className="card-body" style={{ padding: '32px 24px' }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 28, color: '#e6edf3' }}>
                Why Traders Upgrade
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 28 }}>
                <div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {upgradeProblems.map((problem) => (
                      <li key={problem} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 14, color: '#8b949e' }}>
                        <span style={{ color: '#f85149' }}>❌</span>
                        {problem}
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p style={{ fontSize: 14, color: '#8b949e', lineHeight: 1.7, margin: 0 }}>
                    VCL4X was designed to solve those problems through AI-powered market analysis,
                    structured risk management, and automation tools.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 8 }}>
                {upgradeSteps.map((step, i) => (
                  <div
                    key={step}
                    style={{
                      background: '#161b22',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: 10,
                      padding: '16px 12px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#d4af37', marginBottom: 6 }}>{i + 1}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{step}</div>
                    {i < upgradeSteps.length - 1 && (
                      <span style={{ display: 'none' }}>→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#e6edf3' }}>Auto-Trading Licenses</h2>
          <p style={{ fontSize: 14, color: '#8b949e', marginBottom: 24 }}>
            Your subscription gives you access to the ecosystem. Your license unlocks automation.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 20 }}>
            {licenses.map((license) => (
              <div
                key={license.id}
                className="card"
                style={{
                  position: 'relative',
                  borderColor: license.highlighted ? 'rgba(212,175,55,0.5)' : 'var(--border-primary)',
                  boxShadow: license.highlighted ? '0 0 24px rgba(212,175,55,0.15)' : 'none',
                }}
              >
                <div className="card-body" style={{ padding: '28px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  {license.badge && (
                    <span style={{ display: 'inline-block', width: 'fit-content', marginBottom: 12, padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, color: '#d4af37', border: '1px solid rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.08)' }}>
                      {license.badge}
                    </span>
                  )}
                  <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.04em', marginBottom: 12, color: '#e6edf3' }}>{license.name}</h3>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#d4af37' }}>
                      ${license.price.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: '#8b949e' }}> / {license.interval}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13, color: '#e6edf3' }}>
                    <Check size={16} style={{ color: '#3fb950', flexShrink: 0 }} />
                    {license.accounts}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1 }}>
                    {license.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 13, color: '#8b949e' }}>
                        <Check size={16} style={{ color: '#3fb950', flexShrink: 0, marginTop: 1 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-secondary" style={{ width: '100%' }}>
                    Get License
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: 11, color: '#545d68', lineHeight: 1.7, textAlign: 'center', maxWidth: 720, margin: '0 auto 24px' }}>
            Auto-trading licenses enable AI-assisted signal execution on your own MT5 account. All trading
            decisions remain within your control. Past performance does not guarantee future results.
          </p>
        </div>
      </main>
    </div>
  );
}
