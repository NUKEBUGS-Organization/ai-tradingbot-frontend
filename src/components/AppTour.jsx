import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, Brain, Shield, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { hasAcceptedRiskDisclosure } from './RiskDisclosureGate';

const TOUR_PENDING_KEY = 'aurumx_tour_pending';

const TOUR_ROUTES = [
  '/dashboard',
  '/admin',
  '/risk',
  '/signals',
  '/telegram',
  '/subscriptions',
  '/engine',
  '/analysis',
  '/referrals',
];

const STEPS = [
  {
    icon: BarChart3,
    title: 'Start With The Dashboard',
    body: 'Track live MT5 balance, equity, market prices, open trades, and performance from the main dashboard.',
    route: '/dashboard',
  },
  {
    icon: Activity,
    title: 'Check Engine Health',
    body: 'Use the AI Engine page to confirm MT5, candles, Telegram, and auto-trade status before relying on signals.',
    route: '/engine',
  },
  {
    icon: Brain,
    title: 'Review AI Signals',
    body: 'Signals show direction, confidence, entry, stop loss, take profit, grade, and current result history.',
    route: '/signals',
  },
  {
    icon: Shield,
    title: 'Control Risk First',
    body: 'Risk Management and Subscriptions control access, presets, drawdown limits, and trading safeguards.',
    route: '/risk',
  },
];

function readPendingTour(user) {
  if (!user) return null;
  try {
    const raw = sessionStorage.getItem(TOUR_PENDING_KEY);
    if (!raw) return null;
    const pending = JSON.parse(raw);
    const userKey = user._id || user.email || 'guest';
    return pending?.userKey === userKey ? pending : null;
  } catch {
    return null;
  }
}

function clearPendingTour() {
  try {
    sessionStorage.removeItem(TOUR_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export default function AppTour() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  const currentStep = STEPS[step];
  const isAllowedRoute = useMemo(
    () => TOUR_ROUTES.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`)),
    [location.pathname]
  );

  useEffect(() => {
    if (loading || !user || !isAllowedRoute || !hasAcceptedRiskDisclosure(user)) {
      setVisible(false);
      return;
    }
    const pending = readPendingTour(user);
    setVisible(Boolean(pending));
  }, [loading, user, isAllowedRoute, location.pathname]);

  if (!visible || !currentStep) return null;

  const closeTour = () => {
    clearPendingTour();
    setVisible(false);
  };

  const goToStepRoute = () => {
    if (location.pathname !== currentStep.route) {
      navigate(currentStep.route);
    }
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      closeTour();
      return;
    }
    setStep((value) => value + 1);
  };

  const Icon = currentStep.icon;
  const progress = `${step + 1} / ${STEPS.length}`;

  return (
    <div className="app-tour-shell" role="dialog" aria-modal="false" aria-labelledby="app-tour-title">
      <button type="button" className="app-tour-close" onClick={closeTour} aria-label="Close tour">
        <X size={14} />
      </button>
      <div className="app-tour-kicker">Login {readPendingTour(user)?.loginCount || 1} of 3</div>
      <div className="app-tour-header">
        <div className="app-tour-icon">
          <Icon size={20} />
        </div>
        <div>
          <h2 id="app-tour-title" className="app-tour-title">{currentStep.title}</h2>
          <div className="app-tour-progress">{progress}</div>
        </div>
      </div>
      <p className="app-tour-body">{currentStep.body}</p>
      <div className="app-tour-dots" aria-hidden="true">
        {STEPS.map((item, index) => (
          <span key={item.title} className={`app-tour-dot${index === step ? ' active' : ''}`} />
        ))}
      </div>
      <div className="app-tour-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={closeTour}>
          Skip
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
          Back
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={goToStepRoute}>
          Open
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={next}>
          {step >= STEPS.length - 1 ? 'Done' : 'Next'}
        </button>
      </div>
    </div>
  );
}
