import React from 'react';

export function isSignalMasked(signal) {
  return Boolean(signal?.masked || signal?.accessLevel === 'preview');
}

export default function MaskedSignalValue({ signal, value, color, label = 'Locked' }) {
  if (!isSignalMasked(signal)) {
    return <span style={{ color }}>{value ?? '—'}</span>;
  }

  return (
    <span className="masked-signal-value" title="Upgrade to unlock full signal details">
      {label}
    </span>
  );
}
