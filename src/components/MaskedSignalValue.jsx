import React from 'react';

export function isSignalMasked(signal) {
  return Boolean(signal?.masked || signal?.accessLevel === 'preview');
}

export default function MaskedSignalValue({ signal, value, color, label = 'Premium Only' }) {
  if (!isSignalMasked(signal)) {
    return <span style={{ color }}>{value ?? '—'}</span>;
  }

  return (
    <span
      className="masked-signal-value"
      title="Premium members unlock entry, stop loss, take profit, and trade management notes"
      style={{ color: '#d4af37', fontSize: 11, fontWeight: 600 }}
    >
      {label}
    </span>
  );
}
