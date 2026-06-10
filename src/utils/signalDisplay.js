export function formatMarketPhase(phase) {
  if (!phase) return '—';
  return String(phase)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatSession(session) {
  const key = String(session || '').toLowerCase();
  const map = {
    london: 'London',
    newyork: 'New York',
    overlap: 'London/New York',
    asian: 'Asian',
  };
  return map[key] || formatMarketPhase(session);
}

export function formatMarketBias(bias) {
  if (!bias) return '—';
  const value = String(bias).toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}
