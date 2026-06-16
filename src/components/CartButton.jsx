import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartButton() {
  const navigate = useNavigate();
  const { itemCount } = useCart();

  return (
    <button
      type="button"
      onClick={() => navigate('/checkout')}
      aria-label={`Open cart (${itemCount} items)`}
      style={{
        position: 'relative',
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        padding: '6px 10px',
        cursor: 'pointer',
        color: '#e6edf3',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <ShoppingCart size={16} />
      <span style={{ fontSize: 12, fontWeight: 600 }}>Cart</span>
      {itemCount > 0 && (
        <span style={{
          position: 'absolute',
          top: -6,
          right: -6,
          background: '#d4af37',
          color: '#0a0a0f',
          borderRadius: '50%',
          width: 18,
          height: 18,
          fontSize: 10,
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {itemCount}
        </span>
      )}
    </button>
  );
}
