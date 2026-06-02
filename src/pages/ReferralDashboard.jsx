import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users, DollarSign, Copy, Check, TrendingUp, Clock, Gift } from 'lucide-react';
import api from '../services/api';

export default function ReferralDashboard() {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const data = await api.getReferralInfo();
      setReferralData(data);
    } catch (err) {
      console.error('Failed to load referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralData?.referralLink || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColor = {
    pending: '#8b949e',
    registered: '#58a6ff',
    subscribed: '#d4af37',
    paid: '#3fb950'
  };

  const commissionColor = {
    pending: '#d4af37',
    approved: '#58a6ff',
    paid: '#3fb950',
    rejected: '#f85149'
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Referral Program" />
        <div className="page-content">

          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Referrals', value: referralData?.stats?.totalReferrals ?? 0, icon: <Users size={16} />, color: 'blue' },
              { label: 'Subscribed', value: referralData?.stats?.subscribed ?? 0, icon: <TrendingUp size={16} />, color: 'gold' },
              { label: 'Total Earned', value: `$${(referralData?.stats?.totalEarned ?? 0).toFixed(2)}`, icon: <DollarSign size={16} />, color: 'green' },
              { label: 'Pending Commission', value: `$${(referralData?.stats?.pendingCommission ?? 0).toFixed(2)}`, icon: <Clock size={16} />, color: 'purple' },
              { label: 'Commission Paid', value: `$${(referralData?.stats?.paidCommission ?? 0).toFixed(2)}`, icon: <Gift size={16} />, color: 'green' },
              { label: 'Commission Rate', value: `${referralData?.commissionRate ?? 25}%`, icon: <TrendingUp size={16} />, color: 'gold' },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">{stat.label}</span>
                  <div className={`stat-card-icon ${stat.color}`}>{stat.icon}</div>
                </div>
                <div className="stat-card-value">{loading ? '...' : stat.value}</div>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title"><Gift size={16} /> Your Referral Link</span>
              <span className="badge badge-gold">{referralData?.commissionRate ?? 25}% Commission</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 16 }}>
                Share your unique referral link. When someone subscribes using your link,
                you earn {referralData?.commissionRate ?? 25}% commission on their subscription.
              </p>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
                <div style={{
                  flex: 1, minWidth: 200, background: '#0d1117', border: '1px solid #30363d',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13,
                  color: '#d4af37', fontFamily: 'monospace', wordBreak: 'break-all'
                }}>
                  {loading ? 'Loading...' : referralData?.referralLink}
                </div>
                <button
                  type="button"
                  onClick={copyLink}
                  className="btn btn-primary"
                  style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Link</>}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: 12, color: '#545d68', flexWrap: 'wrap' }}>
                <span>Your code: <strong style={{ color: '#d4af37', fontFamily: 'monospace' }}>{referralData?.referralCode}</strong></span>
                <span>Commission: <strong style={{ color: '#3fb950' }}>{referralData?.commissionRate ?? 25}% per subscription</strong></span>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <span className="card-title">How It Works</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                {[
                  { step: '1', title: 'Share Your Link', desc: 'Copy your unique referral link and share it with friends, traders, or on social media' },
                  { step: '2', title: 'They Register', desc: 'When someone registers using your link they are linked to your account automatically' },
                  { step: '3', title: 'They Subscribe', desc: 'When your referral subscribes to any plan the commission is calculated automatically' },
                  { step: '4', title: 'You Earn', desc: `Earn ${referralData?.commissionRate ?? 25}% commission on every subscription payment from your referrals` },
                ].map((item, i) => (
                  <div key={i} style={{ background: '#0d1117', borderRadius: 8, padding: 16, border: '1px solid #30363d', textAlign: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(212,175,55,0.2)', color: '#d4af37', fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{item.step}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#545d68', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><Users size={16} /> My Referrals ({referralData?.referrals?.length ?? 0})</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {!loading && referralData?.referrals?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>
                  <Users size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <div>No referrals yet.</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>Share your referral link to start earning commissions.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      {['User', 'Joined', 'Status', 'Plan', 'Commission', 'Payout'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(referralData?.referrals || []).map((ref, i) => (
                      <tr key={ref.id || i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>
                          {ref.referredUser ? (
                            <div>
                              <div style={{ fontWeight: 600 }}>{ref.referredUser.name}</div>
                              <div style={{ fontSize: 11, color: '#8b949e' }}>{ref.referredUser.email}</div>
                            </div>
                          ) : <span style={{ color: '#545d68' }}>Pending</span>}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#8b949e' }}>
                          {ref.referredUser ? new Date(ref.referredUser.joinedAt).toLocaleDateString() : '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: (statusColor[ref.status] || '#8b949e') + '22', color: statusColor[ref.status] || '#8b949e', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>
                            {ref.status}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#8b949e' }}>
                          {ref.subscriptionPlan || '—'}
                        </td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: ref.commissionAmount > 0 ? '#3fb950' : '#545d68', fontWeight: 600 }}>
                          {ref.commissionAmount > 0 ? `$${ref.commissionAmount.toFixed(2)}` : '—'}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ background: (commissionColor[ref.commissionStatus] || '#8b949e') + '22', color: commissionColor[ref.commissionStatus] || '#8b949e', padding: '3px 8px', borderRadius: 12, fontSize: 11, textTransform: 'uppercase' }}>
                            {ref.commissionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
