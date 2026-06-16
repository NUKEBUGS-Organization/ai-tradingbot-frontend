import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { XCircle } from 'lucide-react';

export default function CheckoutCancel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order') || '';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Header title="Checkout Cancelled" />
        <div className="page-content" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
          <div className="card">
            <div className="card-body" style={{ padding: 40 }}>
              <XCircle size={48} color="#f85149" style={{ marginBottom: 16 }} />
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Payment Cancelled</h2>
              <p style={{ color: '#8b949e', marginBottom: 20, lineHeight: 1.6 }}>
                Your payment was not completed. Your cart items are still saved — you can try again anytime.
              </p>
              {orderNumber && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#545d68', marginBottom: 24 }}>
                  Order: {orderNumber}
                </div>
              )}
              <button type="button" className="btn btn-primary" style={{ width: '100%', marginBottom: 12 }} onClick={() => navigate('/checkout')}>
                Return to Cart
              </button>
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/subscriptions')}>
                Browse Plans
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
