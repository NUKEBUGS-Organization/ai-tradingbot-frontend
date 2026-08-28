/** Normalize signal close status for UI (active | win | loss). */

export function normalizeSignalStatus(status) {
  const s = String(status || '').toLowerCase().trim();
  if (s === 'win' || s === 'hit_tp' || s === 'tp') return 'win';
  if (s === 'loss' || s === 'hit_sl' || s === 'sl') return 'loss';
  if (s === 'active' || s === 'pending' || s === 'open' || !s) return 'active';
  return s;
}

export function isSignalWin(s) {
  const st = normalizeSignalStatus(s?.status ?? s?.result);
  return st === 'win';
}

export function isSignalLoss(s) {
  const st = normalizeSignalStatus(s?.status ?? s?.result);
  return st === 'loss';
}

export function isSignalClosed(s) {
  return isSignalWin(s) || isSignalLoss(s);
}

export function outcomeLabel(status) {
  const st = normalizeSignalStatus(status);
  if (st === 'win') return 'WIN';
  if (st === 'loss') return 'LOSS';
  if (st === 'active') return 'OPEN';
  return String(status || 'OPEN').toUpperCase();
}

export function outcomeBadgeClass(status) {
  const st = normalizeSignalStatus(status);
  if (st === 'win') return 'badge-green';
  if (st === 'loss') return 'badge-red';
  return 'badge-gold';
}

/** Feed flash: only show alerts younger than maxAgeMs (default 2 min). */
export function isFreshAlert(signal, maxAgeMs = 2 * 60 * 1000) {
  const t = new Date(signal?.timestamp || signal?.createdAt || 0).getTime();
  if (!t) return true;
  return Date.now() - t < maxAgeMs;
}
