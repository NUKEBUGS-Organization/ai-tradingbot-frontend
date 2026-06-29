import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { Check, X, Key, ShoppingCart, BarChart3, Settings2 } from 'lucide-react';

const plans = [
  {
    id: 'discovery',
    name: 'VCL4X DISCOVERY',
    monthlyPrice: 99,
    annualPrice: 79,
    annualTotal: 948,
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
    monthlyPrice: 149,
    annualPrice: 119,
    annualTotal: 1428,
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
    monthlyPrice: 199,
    annualPrice: 159,
    annualTotal: 1908,
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
    regularPrice: 2300,
    annualPrice: 1725,
    interval: '6 months',
    features: [
      'AI Auto Execution',
      'Signal Synchronization',
      'Advanced Automation',
      'Dynamic Risk Controls',
      'VPS Compatible',
      'Real-Time Trade Management',
    ],
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL LICENSE',
    regularPrice: 2999,
    annualPrice: 2249,
    interval: '6 months',
    highlighted: true,
    features: [
      'Everything in Personal',
      'Expanded Market Coverage',
      'Institutional Risk Management',
      'Portfolio Protection',
      'Advanced Analytics',
      'Priority Support',
    ],
  },
  {
    id: 'elite_license',
    name: 'ELITE LICENSE',
    regularPrice: 3699,
    annualPrice: 2774,
    interval: '6 months',
    badge: '🔥 Built for serious traders and teams',
    features: [
      'Everything in Professional',
      'AI Trade Quality Scoring',
      'Premium AI Features',
      'Advanced Risk Controls',
      'VIP Support',
      'Team Management',
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
  const navigate = useNavigate();
  const { addItem, itemCount } = useCart();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isAnnualLicense, setIsAnnualLicense] = useState(false);
  const [mySub, setMySub] = useState(null);
  const [addedToast, setAddedToast] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [, s] = await Promise.all([api.getPlans(), api.getMySubscription()]);
      setMySub(s);
    } catch (err) { console.error(err); }
  };

  const showAdded = (label) => {
    setAddedToast(`${label} added to cart`);
    setTimeout(() => setAddedToast(''), 2500);
  };

  const handleAddSubscription = (planId) => {
    if (planId === mySub?.plan) return;
    addItem({
      productId: planId,
      productType: 'subscription',
      billingInterval: isAnnual ? 'annual' : 'monthly',
    });
    showAdded(plans.find((p) => p.id === planId)?.name || 'Plan');
  };

  const handleAddLicense = (licenseId) => {
    addItem({
      productId: licenseId,
      productType: 'license',
      billingInterval: isAnnualLicense ? 'renewal' : 'standard',
    });
    showAdded(licenses.find((l) => l.id === licenseId)?.name || 'License');
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Subscription & Licensing" />
        <div className="page-content">
          {addedToast && (
            <div style={{
              position: 'fixed', top: 80, right: 24, zIndex: 1000,
              background: '#161b22', border: '1px solid rgba(63,185,80,0.4)',
              color: '#3fb950', padding: '12px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
            }} className="subscriptions-toast">
              <ShoppingCart size={16} /> {addedToast}
            </div>
          )}
          {itemCount > 0 && (
            <div className="card mb-24" style={{ borderColor: 'rgba(212,175,55,0.4)' }}>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShoppingCart size={18} color="#d4af37" />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{itemCount} item{itemCount !== 1 ? 's' : ''} in cart</span>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/checkout')}>
                  View Cart & Checkout
                </button>
              </div>
            </div>
          )}
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

          <div className="card mb-24">
            <div className="card-body subscription-vs-card">
              <h3 className="subscription-vs-title">
                Subscription vs License — What is the Difference?
              </h3>
              <p className="subscription-vs-subtitle">
                Many customers ask this. Here is the simple explanation.
              </p>
              <div className="subscription-vs-grid">
                <div className="subscription-vs-item">
                  <div className="subscription-vs-icon gold">
                    <BarChart3 size={22} />
                  </div>
                  <h4 className="subscription-vs-item-title gold">Subscription Plans</h4>
                  <p className="subscription-vs-item-text">
                    Monthly or annual access to the VCL4X analytics platform — AI signals,
                    market intelligence, risk tools, and the trading dashboard. You learn and
                    analyze; execution stays manual unless you add a license.
                  </p>
                </div>
                <div className="subscription-vs-item">
                  <div className="subscription-vs-icon blue">
                    <Settings2 size={22} />
                  </div>
                  <h4 className="subscription-vs-item-title blue">Auto-Trading Licenses</h4>
                  <p className="subscription-vs-item-text">
                    Connect your own MT5 account to receive automated signal execution through
                    the VCL4X EA. Requires an active subscription plus a separate license for
                    each automation tier.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#e6edf3' }}>Subscription Plans</h2>
          <p style={{ fontSize: 14, color: '#8b949e', marginBottom: 24 }}>Choose the plan that fits your trading journey.</p>

          <div className="billing-toggle-row">
            <span style={{ color: !isAnnual ? '#d4af37' : '#8b949e', fontWeight: !isAnnual ? 700 : 400, fontSize: 15 }}>Monthly</span>
            <div
              onClick={() => setIsAnnual(!isAnnual)}
              role="button"
              tabIndex={0}
              aria-label="Toggle annual pricing"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsAnnual(!isAnnual); }}
              style={{
                width: 52, height: 28, borderRadius: 14,
                background: isAnnual ? '#d4af37' : '#30363d',
                cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: isAnnual ? 27 : 3,
                transition: 'left 0.3s',
              }} />
            </div>
            <span style={{ color: isAnnual ? '#d4af37' : '#8b949e', fontWeight: isAnnual ? 700 : 400, fontSize: 15 }}>
              Annual{' '}
              <span style={{
                background: 'rgba(63,185,80,0.2)', color: '#3fb950',
                padding: '2px 8px', borderRadius: 20, fontSize: 12, marginLeft: 6,
              }}>
                Save 20%
              </span>
            </span>
          </div>

          <div className="subscriptions-plans-grid">
            {plans.map((p) => {
              const isActive = mySub?.plan === p.id;

              return (
                <div
                  key={p.id}
                  className={`card subscription-plan-card${p.highlighted ? ' highlighted' : ''}${isActive ? ' active' : ''}`}
                  style={{
                    position: 'relative',
                    borderColor: isActive ? 'var(--gold)' : p.highlighted ? 'rgba(212,175,55,0.6)' : 'var(--border-primary)',
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
                      <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#d4af37' }}>
                        ${isAnnual ? p.annualPrice : p.monthlyPrice}
                        <span style={{ fontSize: 14, color: '#8b949e', fontWeight: 400 }}>/mo</span>
                      </div>
                      {isAnnual ? (
                        <div style={{ fontSize: 12, color: '#3fb950', marginTop: 4 }}>
                          Billed ${p.annualTotal}/year
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
                          Billed monthly
                        </div>
                      )}
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
                      onClick={() => handleAddSubscription(p.id)}
                      disabled={isActive}
                    >
                      {isActive ? 'Current Plan' : p.id === 'discovery' ? 'Add to Cart — Free Trial' : p.id === 'elite' ? 'Add Elite to Cart' : 'Add to Cart'}
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

              <div className="responsive-auto-grid mb-28">
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

              <div className="responsive-auto-grid-sm">
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

          <div className="billing-toggle-row">
            <span style={{ color: !isAnnualLicense ? '#d4af37' : '#8b949e', fontWeight: !isAnnualLicense ? 700 : 400, fontSize: 15 }}>Standard</span>
            <div
              onClick={() => setIsAnnualLicense(!isAnnualLicense)}
              role="button"
              tabIndex={0}
              aria-label="Toggle annual license pricing"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsAnnualLicense(!isAnnualLicense); }}
              style={{
                width: 52, height: 28, borderRadius: 14,
                background: isAnnualLicense ? '#d4af37' : '#30363d',
                cursor: 'pointer', position: 'relative', transition: 'background 0.3s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: 'white',
                position: 'absolute', top: 3,
                left: isAnnualLicense ? 27 : 3,
                transition: 'left 0.3s',
              }} />
            </div>
            <span style={{ color: isAnnualLicense ? '#d4af37' : '#8b949e', fontWeight: isAnnualLicense ? 700 : 400, fontSize: 15 }}>
              Annual Renewal{' '}
              <span style={{
                background: 'rgba(63,185,80,0.2)', color: '#3fb950',
                padding: '2px 8px', borderRadius: 20, fontSize: 12, marginLeft: 6,
              }}>
                Save 25%
              </span>
            </span>
          </div>

          <div className="subscriptions-licenses-grid">
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
                      ${(isAnnualLicense ? license.annualPrice : license.regularPrice).toLocaleString()}
                    </span>
                    <span style={{ fontSize: 12, color: '#8b949e' }}> / {license.interval}</span>
                    {isAnnualLicense && (
                      <div style={{ fontSize: 12, color: '#3fb950', marginTop: 4 }}>
                        Save 25% on renewal
                      </div>
                    )}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1 }}>
                    {license.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: 13, color: '#8b949e' }}>
                        <Check size={16} style={{ color: '#3fb950', flexShrink: 0, marginTop: 1 }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleAddLicense(license.id)}>
                    Add License to Cart
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
