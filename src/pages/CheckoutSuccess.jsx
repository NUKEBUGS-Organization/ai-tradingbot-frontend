import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const orderNumber = searchParams.get('order') || '';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    clearCart();
    if (!orderNumber) return;

    const load = () => api.getCheckoutOrder(orderNumber).then(setOrder).catch(() => {});

    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [orderNumber, clearCart]);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Payment Successful" />
        <div className="page-content" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div className="card">
            <div className="card-body" style={{ padding: 40 }}>
              <CheckCircle size={48} color="#3fb950" style={{ marginBottom: 16 }} />
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Thank You!</h2>
              <p style={{ color: '#8b949e', marginBottom: 20, lineHeight: 1.6 }}>
                {order?.status === 'paid'
                  ? 'Your payment has been received. Your subscription and/or license is now active.'
                  : 'Your payment is being confirmed. Crypto payments may take a few minutes — your subscription will activate automatically once confirmed.'}
              </p>
              {orderNumber && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#d4af37', marginBottom: 24 }}>
                  Order: {orderNumber}
                </div>
              )}
              {order?.lines?.length > 0 && (
                <div style={{ textAlign: 'left', background: '#0d1117', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                  {order.lines.map((line) => (
                    <div key={`${line.productId}-${line.billingInterval}`} style={{ fontSize: 13, color: '#8b949e', marginBottom: 6 }}>
                      ✓ {line.name}
                    </div>
                  ))}
                </div>
              )}
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/subscriptions')}>
                View Subscription
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
