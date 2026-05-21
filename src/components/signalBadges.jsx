import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const gradeColor = { 'A+': '#d4af37', A: '#3fb950', B: '#58a6ff', C: '#8b949e', F: '#f85149' };
const sessionColor = { london: '#58a6ff', newyork: '#3fb950', overlap: '#d4af37', asian: '#8b949e' };
const phaseColor = { accumulation: '#58a6ff', manipulation: '#f0883e', distribution: '#f85149' };

export function GradeBadge({ grade }) {
  if (!grade) return <span style={{ color: '#545d68' }}>—</span>;
  const c = gradeColor[grade] || '#8b949e';
  return (
    <span style={{ background: `${c}22`, color: c, padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
      {grade}
    </span>
  );
}

export function SessionBadge({ session }) {
  if (!session) return <span>—</span>;
  const key = String(session).toLowerCase();
  const c = sessionColor[key] || '#8b949e';
  return (
    <span style={{ background: `${c}22`, color: c, padding: '2px 8px', borderRadius: 12, fontSize: 10, textTransform: 'uppercase' }}>
      {key}
    </span>
  );
}

export function AmdPhaseBadge({ phase }) {
  const p = phase || null;
  if (!p) return <span>—</span>;
  const c = phaseColor[p] || '#8b949e';
  return (
    <span style={{ background: `${c}22`, color: c, padding: '2px 8px', borderRadius: 12, fontSize: 10, textTransform: 'capitalize' }}>
      {p}
    </span>
  );
}

export function H4BiasIndicator({ bias }) {
  const b = (bias || 'neutral').toLowerCase();
  if (b === 'bullish') return <TrendingUp size={14} style={{ color: '#3fb950' }} title="bullish" />;
  if (b === 'bearish') return <TrendingDown size={14} style={{ color: '#f85149' }} title="bearish" />;
  return <Minus size={14} style={{ color: '#8b949e' }} title="neutral" />;
}

export function RiskBadge({ level }) {
  if (!level) return <span>—</span>;
  const colors =
    level === 'High' || level === 'high'
      ? { bg: '#f8514922', c: '#f85149' }
      : level === 'Medium' || level === 'medium'
        ? { bg: '#d4af3722', c: '#d4af37' }
        : { bg: '#3fb95022', c: '#3fb950' };
  return (
    <span style={{ background: colors.bg, color: colors.c, padding: '2px 8px', borderRadius: 12, fontSize: 10 }}>
      {level}
    </span>
  );
}
