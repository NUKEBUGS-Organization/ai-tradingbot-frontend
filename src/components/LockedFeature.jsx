import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LockedFeature({
  requiredTier = 'discovery',
  featureName = 'This Feature',
  currentTier = 'free',
  children,
  blur = true
}) {
  const navigate = useNavigate();

  const tierOrder = { free: 0, discovery: 1, pro: 2, elite: 3 };
  const hasAccess = tierOrder[currentTier] >= tierOrder[requiredTier];

  const tierLabels = {
    discovery: 'VCL4X Discovery ($99/mo)',
    pro: 'VCL4X PRO ($149/mo)',
    elite: 'VCL4X Elite ($199/mo)'
  };

  if (hasAccess) return children;

  return (
    <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
      {blur && (
        <div style={{
          filter: 'blur(4px)', pointerEvents: 'none',
          opacity: 0.4, userSelect: 'none'
        }}>
          {children}
        </div>
      )}
      <div style={{
        position: blur ? 'absolute' : 'relative',
        inset: blur ? 0 : 'auto',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: blur ? 'rgba(13,17,23,0.85)' : 'rgba(13,17,23,0.95)',
        borderRadius: 8,
        padding: blur ? 0 : 32,
        border: blur ? 'none' : '1px solid #30363d',
        minHeight: blur ? 'auto' : 120,
        backdropFilter: blur ? 'blur(2px)' : 'none',
        zIndex: 10,
      }}>
        <div style={{
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '50%', width: 48, height: 48,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 12
        }}>
          <Lock size={20} color="#d4af37" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e6edf3', marginBottom: 4, textAlign: 'center' }}>
          {featureName}
        </div>
        <div style={{ fontSize: 12, color: '#8b949e', marginBottom: 16, textAlign: 'center' }}>
          Requires {tierLabels[requiredTier]}
        </div>
        <button
          onClick={() => navigate('/subscriptions')}
          style={{
            background: 'linear-gradient(135deg, #d4af37, #f0c040)',
            color: '#0a0a0f', border: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
