import React from 'react';
import { X } from 'lucide-react';

const gradeColor = { 'A+': '#d4af37', A: '#3fb950', B: '#58a6ff', C: '#8b949e', F: '#f85149' };
const sessionColor = { london: '#58a6ff', newyork: '#3fb950', overlap: '#d4af37', asian: '#8b949e' };
const phaseColor = { accumulation: '#58a6ff', manipulation: '#f0883e', distribution: '#f85149' };

export default function SignalDetailModal({ signal, onClose }) {
  if (!signal) return null;

  const amdPhase = signal.amdPhase || signal.amd_phase;
  const h4Bias = signal.marketBias || signal.h4Bias || signal.h4_bias;
  const reason = signal.reason || signal.explanation || signal.strategy;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 12,
          padding: 24,
          maxWidth: 500,
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: '#d4af37' }}>
            Signal Details — {signal.signalId || signal._id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Symbol', value: signal.symbol },
            {
              label: 'Direction',
              value: signal.direction,
              color: signal.direction === 'BUY' ? '#3fb950' : '#f85149',
            },
            { label: 'Entry', value: signal.entryPrice ?? signal.entry },
            { label: 'Stop Loss', value: signal.stopLoss ?? signal.sl, color: '#f85149' },
            { label: 'Take Profit', value: signal.takeProfit ?? signal.tp, color: '#3fb950' },
            {
              label: 'Confidence',
              value: `${signal.confidence}%`,
              color: signal.confidence >= 85 ? '#d4af37' : '#3fb950',
            },
          ].map((item, i) => (
            <div key={i} style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color || '#e6edf3' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {reason && (
          <div style={{ marginTop: 16, padding: 12, background: '#0d1117', borderRadius: 8, fontSize: 13, color: '#8b949e' }}>
            {reason}
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {signal.grade && (
            <span
              style={{
                background: `${gradeColor[signal.grade] || '#8b949e'}22`,
                color: gradeColor[signal.grade] || '#8b949e',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Grade: {signal.grade}
            </span>
          )}
          {signal.session && (
            <span
              style={{
                background: `${sessionColor[signal.session] || '#8b949e'}22`,
                color: sessionColor[signal.session] || '#8b949e',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
              }}
            >
              {String(signal.session).toUpperCase()}
            </span>
          )}
          {h4Bias && (
            <span style={{ background: '#58a6ff22', color: '#58a6ff', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
              H4: {h4Bias}
            </span>
          )}
          {amdPhase && (
            <span
              style={{
                background: `${phaseColor[amdPhase] || '#8b949e'}22`,
                color: phaseColor[amdPhase] || '#8b949e',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
              }}
            >
              AMD: {amdPhase}
            </span>
          )}
          {signal.riskLevel && (
            <span
              style={{
                background:
                  signal.riskLevel === 'High'
                    ? '#f8514922'
                    : signal.riskLevel === 'Medium'
                      ? '#d4af3722'
                      : '#3fb95022',
                color:
                  signal.riskLevel === 'High'
                    ? '#f85149'
                    : signal.riskLevel === 'Medium'
                      ? '#d4af37'
                      : '#3fb950',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
              }}
            >
              Risk: {signal.riskLevel}
            </span>
          )}
        </div>

        {signal.createdAt && (
          <div style={{ marginTop: 12, fontSize: 11, color: '#545d68' }}>
            {new Date(signal.createdAt).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
}
