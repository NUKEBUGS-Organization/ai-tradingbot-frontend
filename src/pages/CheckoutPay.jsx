import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../services/api';
import { CreditCard, Lock, Shield, CheckCircle } from 'lucide-react';

function formatMoney(amount) {
  return `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CheckoutPay() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderNumber = searchParams.get('order') || '';
  const [order, setOrder] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderNumber) return;
    api.getCheckoutOrder(orderNumber).then(setOrder).catch(() => {
      try {
        const raw = sessionStorage.getItem('vcl4x_checkout_session');
        if (raw) {
          const stored = JSON.parse(raw);
          if (stored.orderNumber === orderNumber) {
            setOrder(stored);
            return;
          }
        }
      } catch { /* ignore */ }
      setError('Order not found');
    });
  }, [orderNumber]);

  const handlePay = async () => {
    setProcessing(true);
    setError('');
    try {
      await api.completeCheckout(orderNumber);
      navigate(`/checkout/success?order=${orderNumber}`);
    } catch (err) {
      setError(err.message || 'Payment could not be completed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Secure Payment" />
        <div className="page-content" style={{ maxWidth: 520, margin: '0 auto' }}>
          <div className="card">
            <div className="card-body" style={{ padding: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <CreditCard size={24} color="#d4af37" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>NOWPayments Checkout</h2>
                <p style={{ fontSize: 13, color: '#8b949e', lineHeight: 1.6 }}>
                  Secure crypto payment page for VCL4X subscriptions and licenses.
                  You will be redirected to NOWPayments to complete your payment.
                </p>
              </div>

              {order && (
                <>
                  <div style={{ background: '#0d1117', borderRadius: 8, padding: 16, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: '#545d68', marginBottom: 8 }}>ORDER</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#e6edf3', marginBottom: 12 }}>{order.orderNumber}</div>
                    {(order.lines || []).map((line) => (
                      <div key={`${line.productId}-${line.billingInterval}`} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: '#8b949e' }}>{line.name}</span>
                        <span style={{ fontWeight: 600 }}>{formatMoney(line.lineTotal)}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #21262d', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
                      <span>Total</span>
                      <span style={{ color: '#d4af37' }}>{formatMoney(order.total)}</span>
                    </div>
                  </div>

                  <div style={{
                    border: '1px dashed #30363d', borderRadius: 8, padding: 16, marginBottom: 20,
                    fontSize: 12, color: '#8b949e', lineHeight: 1.6,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#d4af37', fontWeight: 700 }}>
                      <Shield size={14} /> Secure Crypto Checkout
                    </div>
                    Payment is processed on NOWPayments&apos;s secure page — crypto wallet details are not stored on VCL4X servers.
                  </div>

                  {error && <div style={{ color: '#f85149', fontSize: 12, marginBottom: 12 }}>{error}</div>}

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', marginBottom: 12 }}
                    disabled={processing || order.status === 'paid'}
                    onClick={handlePay}
                  >
                    <Lock size={14} style={{ marginRight: 6 }} />
                    {order.status === 'paid' ? 'Already Paid' : processing ? 'Processing...' : `Pay ${formatMoney(order.total)}`}
                  </button>

                  <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/checkout/cancel?order=' + orderNumber)}>
                    Cancel
                  </button>
                </>
              )}

              {!order && !error && (
                <div style={{ textAlign: 'center', color: '#8b949e', padding: 24 }}>Loading order...</div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
