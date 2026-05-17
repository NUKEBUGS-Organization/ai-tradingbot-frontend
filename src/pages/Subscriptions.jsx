import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CreditCard, Check, X, Shield, Zap, Key } from 'lucide-react';

export default function Subscriptions() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [mySub, setMySub] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [p, s] = await Promise.all([api.getPlans(), api.getMySubscription()]);
      setPlans(p);
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
          {/* Current Plan Overview */}
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

          {/* Pricing Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {plans.map((p) => {
              const isActive = mySub?.plan === p.id;
              const isEnterprise = p.id === 'enterprise';
              
              return (
                <div key={p.id} className="card" style={{ 
                  position: 'relative', 
                  borderColor: isActive ? 'var(--gold)' : isEnterprise ? 'var(--purple)' : 'var(--border-primary)',
                  transform: isActive ? 'scale(1.02)' : 'none',
                  boxShadow: isActive ? '0 0 20px rgba(212,175,55,0.1)' : 'none',
                  zIndex: isActive ? 2 : 1
                }}>
                  {isActive && <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--gold)', color: '#000', padding: '4px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Current Plan</div>}
                  
                  <div className="card-body" style={{ textAlign: 'center', padding: '30px 20px' }}>
                    <div style={{ width: 48, height: 48, margin: '0 auto 16px', background: isEnterprise ? 'rgba(167,139,250,0.12)' : isActive ? 'rgba(212,175,55,0.12)' : 'var(--bg-primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isEnterprise ? 'var(--purple)' : isActive ? 'var(--gold)' : '#8b949e' }}>
                      {isEnterprise ? <Shield size={24} /> : <Zap size={24} />}
                    </div>
                    
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{p.name}</h3>
                    <p style={{ fontSize: 12, color: '#545d68', minHeight: 36 }}>{p.description}</p>
                    
                    <div style={{ margin: '24px 0' }}>
                      <span style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>${p.price}</span>
                      <span style={{ fontSize: 12, color: '#8b949e' }}>/mo</span>
                    </div>
                    
                    <div style={{ textAlign: 'left', marginBottom: 24, fontSize: 13 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <Check size={16} style={{ color: '#3fb950' }} />
                        <span>Up to {p.features.maxAccounts} MT5 Accounts</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {p.features.aiSignals ? <Check size={16} style={{ color: '#3fb950' }} /> : <X size={16} style={{ color: '#545d68' }} />}
                        <span style={{ color: p.features.aiSignals ? '#e6edf3' : '#545d68' }}>AI Trading Signals</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {p.features.telegramAlerts ? <Check size={16} style={{ color: '#3fb950' }} /> : <X size={16} style={{ color: '#545d68' }} />}
                        <span style={{ color: p.features.telegramAlerts ? '#e6edf3' : '#545d68' }}>Telegram Alerts</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {p.features.riskManagement ? <Check size={16} style={{ color: '#3fb950' }} /> : <X size={16} style={{ color: '#545d68' }} />}
                        <span style={{ color: p.features.riskManagement ? '#e6edf3' : '#545d68' }}>Risk Management</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        {p.features.customStrategies ? <Check size={16} style={{ color: '#3fb950' }} /> : <X size={16} style={{ color: '#545d68' }} />}
                        <span style={{ color: p.features.customStrategies ? '#e6edf3' : '#545d68' }}>Custom Strategies</span>
                      </div>
                    </div>
                    
                    <button 
                      className={`btn ${isActive ? 'btn-secondary' : isEnterprise ? 'btn-primary' : 'btn-primary'}`} 
                      style={{ width: '100%' }}
                      onClick={() => handleUpgrade(p.id)}
                      disabled={isActive}
                    >
                      {isActive ? 'Current Plan' : 'Upgrade Plan'}
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
