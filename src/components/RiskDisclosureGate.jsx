import React, { useState } from 'react';
import { useAuth, isAdminUser } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import {
  RISK_DISCLOSURE_TITLE,
  RISK_DISCLOSURE_INTRO,
  RISK_DISCLOSURE_SECTIONS,
} from '../content/riskDisclosure';

const RISK_STORAGE_PREFIX = 'aurumx_risk_disclosure_';

export function hasAcceptedRiskDisclosure(user) {
  if (!user?._id) return false;
  if (user.acceptedRiskDisclosureAt) return true;
  try {
    return localStorage.getItem(`${RISK_STORAGE_PREFIX}${user._id}`) === '1';
  } catch {
    return false;
  }
}

function markRiskDisclosureLocal(userId) {
  try {
    localStorage.setItem(`${RISK_STORAGE_PREFIX}${userId}`, '1');
  } catch {
    /* ignore */
  }
}

export default function RiskDisclosureGate({ children }) {
  const { user, loading, acceptRiskDisclosure, logout } = useAuth();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (loading || !user) return children;
  if (isAdminUser(user)) return children;
  if (hasAcceptedRiskDisclosure(user)) return children;

  const handleAccept = async () => {
    if (!agreed || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await acceptRiskDisclosure();
      markRiskDisclosureLocal(user._id);
    } catch (err) {
      setError(err.message || 'Could not save your agreement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {children}
      <div
        className="risk-disclosure-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="risk-disclosure-title"
      >
        <div className="risk-disclosure-panel">
          <div className="risk-disclosure-header">
            <BrandLogo size={48} className="login-logo-img" />
            <h1 id="risk-disclosure-title" className="risk-disclosure-title">
              {RISK_DISCLOSURE_TITLE}
            </h1>
            <p className="risk-disclosure-intro">{RISK_DISCLOSURE_INTRO}</p>
          </div>

          <div className="risk-disclosure-body">
            {RISK_DISCLOSURE_SECTIONS.map((section) => (
              <section key={section.title} className="risk-disclosure-section">
                <hr className="risk-disclosure-divider" />
                <h2 className="risk-disclosure-section-title">{section.title}</h2>
                <p className="risk-disclosure-section-body">{section.body}</p>
                {section.bullets?.length > 0 && (
                  <ul className="risk-disclosure-list">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          {error && <div className="login-error" style={{ margin: '0 24px 12px' }}>{error}</div>}

          <div className="risk-disclosure-footer">
            <label className="login-remember risk-disclosure-checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>I Agree &amp; Continue</span>
            </label>
            <button
              type="button"
              className="login-btn"
              disabled={!agreed || submitting}
              onClick={handleAccept}
            >
              {submitting ? 'Saving...' : 'I Agree & Continue'}
            </button>
            <button type="button" className="risk-disclosure-logout" onClick={logout}>
              Sign out instead
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
