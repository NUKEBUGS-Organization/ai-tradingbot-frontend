import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Users, DollarSign, Check, X } from 'lucide-react';
import api from '../services/api';

export default function AdminReferrals() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await api.adminGetAllReferrals();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCommission = async (id, status) => {
    try {
      await api.adminUpdateCommission(id, { commissionStatus: status });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Referral Management (Admin)" />
        <div className="page-content">

          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Total Referrals', value: data?.stats?.total ?? 0, color: 'blue' },
              { label: 'Subscribed', value: data?.stats?.subscribed ?? 0, color: 'gold' },
              { label: 'Pending Commission', value: `$${(data?.stats?.totalCommissionPending ?? 0).toFixed(2)}`, color: 'orange' },
              { label: 'Commission Paid', value: `$${(data?.stats?.totalCommissionPaid ?? 0).toFixed(2)}`, color: 'green' },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">{stat.label}</span>
                  <div className={`stat-card-icon ${stat.color}`}><DollarSign size={16} /></div>
                </div>
                <div className="stat-card-value">{loading ? '...' : stat.value}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title"><Users size={16} /> All Referrals</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    {['Referrer', 'Referred User', 'Status', 'Plan', 'Sub Amount', 'Commission', 'Payout Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, color: '#8b949e', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data?.referrals || []).map((ref, i) => (
                    <tr key={ref._id || i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>
                        <div style={{ fontWeight: 600 }}>{ref.referrerId?.name}</div>
                        <div style={{ color: '#8b949e', fontSize: 11 }}>{ref.referrerId?.email}</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>
                        <div>{ref.referredUserId?.name || '—'}</div>
                        <div style={{ color: '#8b949e', fontSize: 11 }}>{ref.referredUserId?.email}</div>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 11 }}>
                        <span style={{ background: '#58a6ff22', color: '#58a6ff', padding: '2px 8px', borderRadius: 10 }}>{ref.status}</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: 12, color: '#8b949e' }}>{ref.subscriptionPlan || '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 12 }}>{ref.subscriptionAmount > 0 ? `$${ref.subscriptionAmount}` : '—'}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#3fb950', fontWeight: 600 }}>
                        {ref.commissionAmount > 0 ? `$${ref.commissionAmount.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: ref.commissionStatus === 'paid' ? '#3fb95022' : ref.commissionStatus === 'pending' ? '#d4af3722' : '#f8514922',
                          color: ref.commissionStatus === 'paid' ? '#3fb950' : ref.commissionStatus === 'pending' ? '#d4af37' : '#f85149',
                          padding: '2px 8px', borderRadius: 10, fontSize: 11
                        }}>{ref.commissionStatus}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {ref.commissionStatus === 'pending' && ref.commissionAmount > 0 && (
                            <button type="button" onClick={() => updateCommission(ref._id, 'paid')}
                              style={{ background: '#3fb95022', color: '#3fb950', border: '1px solid #3fb95044', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Check size={10} /> Mark Paid
                            </button>
                          )}
                          {ref.commissionStatus === 'pending' && (
                            <button type="button" onClick={() => updateCommission(ref._id, 'rejected')}
                              style={{ background: '#f8514922', color: '#f85149', border: '1px solid #f8514944', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <X size={10} /> Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && (!data?.referrals || data.referrals.length === 0) && (
                <div style={{ textAlign: 'center', padding: 48, color: '#8b949e' }}>No referrals yet.</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
