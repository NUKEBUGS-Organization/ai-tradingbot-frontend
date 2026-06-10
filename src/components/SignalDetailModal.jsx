import React from 'react';
import { X } from 'lucide-react';
import MaskedSignalValue, { isSignalMasked } from './MaskedSignalValue';
import { formatMarketBias, formatMarketPhase, formatSession } from '../utils/signalDisplay';

const gradeColor = { 'A+': '#d4af37', A: '#3fb950', B: '#58a6ff', C: '#8b949e', F: '#f85149' };
const sessionColor = { london: '#58a6ff', newyork: '#3fb950', overlap: '#d4af37', asian: '#8b949e' };
const phaseColor = { accumulation: '#58a6ff', manipulation: '#f0883e', distribution: '#f85149' };

export default function SignalDetailModal({ signal, onClose }) {
  if (!signal) return null;

  const masked = isSignalMasked(signal);
  const marketPhase = signal.amdPhase || signal.amd_phase;
  const h4Bias = signal.marketBias || signal.h4Bias || signal.h4_bias;
  const timestamp = signal.createdAt || signal.timestamp;
  const tradeNotes = masked
    ? signal.reason
    : signal.reason || signal.explanation || signal.strategy;

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'Pair', value: signal.symbol },
            {
              label: 'Direction',
              value: signal.direction,
              color: signal.direction === 'BUY' ? '#3fb950' : '#f85149',
            },
            { label: 'Session', value: formatSession(signal.session) },
            { label: 'AI Market Phase', value: formatMarketPhase(marketPhase) },
            { label: 'H4 Bias', value: formatMarketBias(h4Bias) },
            {
              label: 'Timestamp',
              value: timestamp ? new Date(timestamp).toLocaleString() : '—',
            },
          ].map((item, i) => (
            <div key={i} style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color || '#e6edf3' }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Entry', value: signal.entryPrice ?? signal.entry, sensitive: true },
            { label: 'Stop Loss', value: signal.stopLoss ?? signal.sl, color: '#f85149', sensitive: true },
            { label: 'Take Profit', value: signal.takeProfit ?? signal.tp, color: '#3fb950', sensitive: true },
            {
              label: 'Confidence',
              value: signal.confidence != null ? `${signal.confidence}%` : null,
              color: signal.confidence >= 85 ? '#d4af37' : '#3fb950',
              sensitive: true,
            },
            { label: 'Risk Level', value: signal.riskLevel || signal.risk_level, sensitive: true },
            { label: 'Grade', value: signal.grade, sensitive: true },
          ].map((item, i) => (
            <div key={i} style={{ background: '#0d1117', borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: item.color || '#e6edf3' }}>
                {item.sensitive && masked ? (
                  <MaskedSignalValue signal={signal} value={item.value} color={item.color} />
                ) : (
                  item.value || '—'
                )}
              </div>
            </div>
          ))}
        </div>

        {tradeNotes && (
          <div style={{ marginTop: 16, padding: 12, background: '#0d1117', borderRadius: 8, fontSize: 13, color: '#8b949e' }}>
            {masked ? '🔒 ' : ''}{tradeNotes}
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {signal.grade && !masked && (
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
                background: `${sessionColor[String(signal.session).toLowerCase()] || '#8b949e'}22`,
                color: sessionColor[String(signal.session).toLowerCase()] || '#8b949e',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
              }}
            >
              {formatSession(signal.session)}
            </span>
          )}
          {h4Bias && (
            <span style={{ background: '#58a6ff22', color: '#58a6ff', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
              H4: {formatMarketBias(h4Bias)}
            </span>
          )}
          {marketPhase && (
            <span
              style={{
                background: `${phaseColor[String(marketPhase).toLowerCase()] || '#8b949e'}22`,
                color: phaseColor[String(marketPhase).toLowerCase()] || '#8b949e',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 12,
              }}
            >
              AI Market Phase: {formatMarketPhase(marketPhase)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
