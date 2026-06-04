import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState(token ? 'verifying' : 'pending');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    (async () => {
      try {
        const data = await api.verifyEmail(token);
        if (cancelled) return;
        if (data?.token) {
          localStorage.setItem('aurumx_token', data.token);
          localStorage.setItem('aurumx_user', JSON.stringify(data));
          localStorage.setItem('aurumx_remember', '1');
        }
        setStatus('success');
        setMessage(data.message || 'Email verified successfully.');
        setTimeout(() => {
          window.location.href = data.role === 'admin' ? '/admin' : '/dashboard';
        }, 1500);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(err.message || 'Verification failed');
      }
    })();

    return () => { cancelled = true; };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setResendLoading(true);
    try {
      const data = await api.resendVerification(email);
      setMessage(data.message || 'Verification email sent.');
    } catch (err) {
      setError(err.message || 'Could not send verification email');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card animate-in">
        <div className="login-header">
          <BrandLogo size={56} className="login-logo-img" />
          <h1 className="login-title">Verify Email</h1>
          <p className="login-subtitle">Confirm your VCL4X account</p>
        </div>

        {status === 'verifying' && (
          <p style={{ color: '#8b949e', textAlign: 'center' }}>Verifying your email...</p>
        )}

        {status === 'success' && (
          <div style={{ color: '#3fb950', textAlign: 'center', marginBottom: 16 }}>{message}</div>
        )}

        {(status === 'pending' || status === 'error') && (
          <>
            {status === 'error' && <div className="login-error">{error}</div>}
            {message && (
              <div style={{ color: '#3fb950', marginBottom: 16, fontSize: 14 }}>{message}</div>
            )}
            <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              {status === 'pending'
                ? 'We sent a verification link to your email. Click the link in the message to activate your account.'
                : 'Your verification link may have expired. Enter your email to receive a new one.'}
            </p>
            <form className="login-form" onSubmit={handleResend}>
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
              <button type="submit" className="login-btn" disabled={resendLoading}>
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </form>
          </>
        )}

        <div className="login-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
