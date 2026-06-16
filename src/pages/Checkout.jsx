import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShoppingCart, Trash2, CreditCard, Lock, Shield } from 'lucide-react';

function formatMoney(amount) {
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, itemCount, summary, updateSummary, removeItem, clearCart, setLoading, loading } = useCart();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!itemCount) {
      updateSummary(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.validateCart(items);
        if (!cancelled) updateSummary(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to validate cart');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [items, itemCount, updateSummary, setLoading]);

  const handleCheckout = async () => {
    if (!items.length || !summary) return;
    setProcessing(true);
    setError('');
    try {
      const session = await api.createCheckoutSession(items);
      if (session?.session?.checkoutUrl) {
        try {
          sessionStorage.setItem('vcl4x_checkout_session', JSON.stringify(session));
        } catch { /* ignore */ }
        window.location.href = session.session.checkoutUrl;
      } else {
        setError('Unable to start checkout. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Checkout" />
        <div className="page-content" style={{ maxWidth: 960, margin: '0 auto' }}>
          {itemCount === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <ShoppingCart size={40} style={{ color: '#545d68', marginBottom: 16 }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your cart is empty</h2>
              <p style={{ color: '#8b949e', marginBottom: 24 }}>Add a subscription or auto-trading license to continue.</p>
              <button type="button" className="btn btn-primary" onClick={() => navigate('/subscriptions')}>
                Browse Plans
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title"><ShoppingCart size={16} /> Cart ({itemCount})</span>
                </div>
                <div className="card-body">
                  {loading && !summary && (
                    <div style={{ color: '#8b949e', padding: 24, textAlign: 'center' }}>Calculating totals...</div>
                  )}
                  {(summary?.lines || []).map((line) => (
                    <div
                      key={`${line.productId}-${line.billingInterval}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 16,
                        padding: '16px 0',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#e6edf3' }}>{line.name}</div>
                        <div style={{ fontSize: 12, color: '#8b949e', marginTop: 4 }}>
                          {line.productType === 'subscription' ? 'Subscription' : 'Auto-Trading License'}
                          {' · '}
                          {line.billingInterval === 'yearly' ? 'Annual billing' : line.billingInterval === 'renewal' ? 'Annual renewal (25% off)' : line.billingInterval === 'standard' ? 'Standard pricing' : 'Monthly billing'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#d4af37' }}>
                          {formatMoney(line.lineTotal)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const cartItem = items.find((i) => i.productId === line.productId);
                            if (cartItem) removeItem(cartItem.productId, cartItem.billingInterval);
                          }}
                          style={{ background: 'none', border: 'none', color: '#f85149', cursor: 'pointer' }}
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ position: 'sticky', top: 24 }}>
                <div className="card-header">
                  <span className="card-title"><CreditCard size={16} /> Order Summary</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: '#8b949e' }}>
                    <span>Subtotal</span>
                    <span>{summary ? formatMoney(summary.subtotal) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13, color: '#8b949e' }}>
                    <span>Tax</span>
                    <span>{summary ? formatMoney(summary.tax || 0) : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 18, fontWeight: 800, color: '#e6edf3' }}>
                    <span>Total</span>
                    <span style={{ color: '#d4af37', fontFamily: 'var(--font-mono)' }}>
                      {summary ? formatMoney(summary.total) : '—'}
                    </span>
                  </div>

                  {user && (
                    <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16, padding: 12, background: 'var(--bg-primary)', borderRadius: 8 }}>
                      <div><strong style={{ color: '#e6edf3' }}>{user.name}</strong></div>
                      <div>{user.email}</div>
                    </div>
                  )}

                  {error && (
                    <div style={{ color: '#f85149', fontSize: 12, marginBottom: 12 }}>{error}</div>
                  )}

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: 12 }}
                    disabled={processing || loading || !summary}
                    onClick={handleCheckout}
                  >
                    <Lock size={14} style={{ marginRight: 6 }} />
                    {processing ? 'Redirecting...' : 'Proceed to Secure Checkout'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => navigate('/subscriptions')}
                  >
                    Continue Shopping
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, fontSize: 11, color: '#545d68' }}>
                    <Shield size={12} />
                    Payments processed securely via PaymentCloud
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
