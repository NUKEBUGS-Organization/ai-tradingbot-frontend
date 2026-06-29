import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isAdminUser } from '../context/AuthContext';
import { hasActiveSubscription, hasSignalPreviewAccess } from '../utils/subscription';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../services/api';
import { Lock, Check, X, Zap, Shield, CreditCard } from 'lucide-react';

export default function SubscriptionGate({ children, title = 'Dashboard' }) {
  const { user } = useAuth();
  if (isAdminUser(user)) return children;
  const signalPreviewPage = ['AI Signals', 'Signal History'].includes(title);
  if (signalPreviewPage && hasSignalPreviewAccess(user)) return children;
  if (hasActiveSubscription(user)) return children;
  return <SubscriptionRequired title={title} user={user} />;
}

function SubscriptionRequired({ title, user }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const plan = user?.subscription?.plan || 'free';
  const isExpired = user?.subscription?.expiresAt && new Date(user.subscription.expiresAt) < new Date();

  useEffect(() => {
    api.getPlans().then(setPlans).catch(() => {});
  }, []);

  const statusMessage = isExpired
    ? `Your ${plan} subscription has expired. Renew to restore access to trades, signals, and the AI engine.`
    : plan !== 'free'
      ? `Your ${plan} plan is inactive. Upgrade or contact support to restore access.`
      : 'Your account is on the Free plan. Upgrade to unlock live trades, AI signals, the trading engine, and risk management tools.';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title={title} />
        <div className="page-content">
          <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(212,175,55,0.35)' }}>
            <div className="card-body" style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{
                width: 64, height: 64, margin: '0 auto 20px', borderRadius: 16,
                background: 'rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#d4af37'
              }}>
                <Lock size={32} />
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, color: '#e6edf3' }}>
                Activate Your Subscription
              </h2>
              <p style={{ fontSize: 14, color: '#8b949e', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.6 }}>
                {statusMessage}
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/subscriptions')}>
                <CreditCard size={16} /> View Subscription Plans
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 12, fontSize: 13, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Available Plans
          </div>

          <div className="subscriptions-plans-grid">
            {plans.map((p) => {
              const isEnterprise = p.id === 'enterprise';
              return (
                <div key={p.id} className="card" style={{ borderColor: isEnterprise ? 'rgba(167,139,250,0.4)' : undefined }}>
                  <div className="card-body" style={{ textAlign: 'center', padding: '24px 16px' }}>
                    <div style={{
                      width: 40, height: 40, margin: '0 auto 12px', borderRadius: 10,
                      background: isEnterprise ? 'rgba(167,139,250,0.12)' : 'rgba(212,175,55,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isEnterprise ? '#a78bfa' : '#d4af37'
                    }}>
                      {isEnterprise ? <Shield size={20} /> : <Zap size={20} />}
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                    <p style={{ fontSize: 11, color: '#545d68', minHeight: 32, marginBottom: 12 }}>{p.description}</p>
                    <div style={{ marginBottom: 16 }}>
                      <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>${p.price}</span>
                      <span style={{ fontSize: 11, color: '#8b949e' }}>/mo</span>
                    </div>
                    <div style={{ textAlign: 'left', fontSize: 12, marginBottom: 16 }}>
                      {[
                        { ok: true, label: `Up to ${p.features.maxAccounts} MT5 Accounts` },
                        { ok: p.features.aiSignals, label: 'AI Trading Signals' },
                        { ok: p.features.telegramAlerts, label: 'Telegram Alerts' },
                        { ok: p.features.riskManagement, label: 'Risk Management' },
                        { ok: p.features.customStrategies, label: 'Custom Strategies' },
                      ].map((f) => (
                        <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          {f.ok ? <Check size={14} style={{ color: '#3fb950' }} /> : <X size={14} style={{ color: '#545d68' }} />}
                          <span style={{ color: f.ok ? '#e6edf3' : '#545d68' }}>{f.label}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => navigate('/subscriptions')}
                    >
                      {p.price === 0 ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
