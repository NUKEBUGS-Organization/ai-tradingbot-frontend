const PAID_PLANS = ['starter', 'professional', 'enterprise', 'discovery', 'pro', 'elite'];
const DEMO_EMAILS = ['demo@gmail.com', 'demo@aurumx.com'];
const ADMIN_EMAILS = ['admin@vcl4xengine.com', 'admin@aurumx.com'];

function isAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return ADMIN_EMAILS.includes(String(user.email || '').toLowerCase());
}

export function hasActiveSubscription(user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (DEMO_EMAILS.includes(String(user.email || '').toLowerCase())) return true;

  const sub = user.subscription || {};
  const plan = sub.plan || 'free';
  const status = sub.status || 'inactive';

  if (!PAID_PLANS.includes(plan)) return false;
  if (!['active', 'trialing'].includes(status)) return false;

  if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) return false;

  return true;
}

export function hasFullSignalAccess(user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (DEMO_EMAILS.includes(String(user.email || '').toLowerCase())) return true;

  const sub = user.subscription || {};
  const plan = sub.plan || 'free';
  const status = sub.status || 'inactive';

  if (!PAID_PLANS.includes(plan)) return false;
  if (status !== 'active') return false;
  if (sub.expiresAt && new Date(sub.expiresAt) < new Date()) return false;
  return true;
}

export function hasSignalPreviewAccess(user) {
  if (hasFullSignalAccess(user)) return true;
  const sub = user?.subscription || {};
  return PAID_PLANS.includes(sub.plan || 'free') && ['trialing', 'expired', 'inactive'].includes(sub.status || 'inactive');
}

export { PAID_PLANS };
