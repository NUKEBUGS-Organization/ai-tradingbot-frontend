import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LANDING_URL } from '../config/env';
import { API_BASE } from '../config/env';
import BrandLogo from '../components/BrandLogo';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState('');
  const [referrerName, setReferrerName] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref);
      fetch(`${API_BASE}/referral/validate/${encodeURIComponent(ref)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.valid) setReferrerName(data.referrerName);
        })
        .catch(() => {});
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!acceptTerms) {
      setError('You must accept the Terms and Privacy Policy');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password, acceptTerms, referralCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 10 + Math.random() * 20,
    size: 1 + Math.random() * 2,
  }));

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="login-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>
      <div className="login-card animate-in">
        <div className="login-header">
          <BrandLogo size={56} className="login-logo-img" />
          <h1 className="login-title">Create Account</h1>
          <p className="login-subtitle">Join VCL4X Trading Platform</p>
        </div>
        {referrerName && (
          <div style={{
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13,
            color: '#d4af37', textAlign: 'center'
          }}>
            🎉 You were referred by <strong>{referrerName}</strong>! Sign up to get started.
          </div>
        )}
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <label className="login-remember" style={{ alignItems: 'flex-start', lineHeight: 1.4 }}>
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span>
              I agree to the{' '}
              <a
                href={`${LANDING_URL}/terms`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#d4af37' }}
              >
                Terms & Conditions
              </a>
              ,{' '}
              <a
                href={`${LANDING_URL}/privacy`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#d4af37' }}
              >
                Privacy Policy
              </a>
              , and{' '}
              <a
                href={`${LANDING_URL}/refund`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#d4af37' }}
              >
                Refund Policy
              </a>
            </span>
          </label>
          <button type="submit" className="login-btn" disabled={loading || !acceptTerms}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="login-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
