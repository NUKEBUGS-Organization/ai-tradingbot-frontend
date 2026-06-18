import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import BrandLogo from '../components/BrandLogo';

const OTP_LENGTH = 5;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const emailParam = searchParams.get('email') || '';
  const deliveryFailed = searchParams.get('delivery') === 'failed';
  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
  }, [emailParam]);

  const otpValue = digits.join('');

  const handleDigitChange = (index, value) => {
    const char = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (otpValue.length !== OTP_LENGTH) {
      setError('Enter the full 5-digit code');
      return;
    }
    setVerifyLoading(true);
    try {
      const data = await api.verifyEmail(email.trim(), otpValue);
      if (data?.token) {
        localStorage.setItem('aurumx_token', data.token);
        localStorage.setItem('aurumx_user', JSON.stringify(data));
        localStorage.setItem('aurumx_remember', '1');
      }
      setMessage(data.message || 'Email verified successfully.');
      setTimeout(() => {
        navigate(data.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    setResendLoading(true);
    try {
      const data = await api.resendVerification(email.trim());
      setMessage(data.message || 'A new verification code has been sent.');
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err) {
      const detail = err.emailError ? ` (${err.emailError})` : '';
      setError((err.message || 'Could not send verification code') + detail);
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
          <p className="login-subtitle">Enter the 5-digit code we sent you</p>
        </div>

        {deliveryFailed && (
          <div className="login-error" style={{ marginBottom: 16 }}>
            We could not deliver the verification email. The sending domain must be verified in Resend
            (vcl4xengine.com). Click &quot;Resend Code&quot; after domain setup, or check spam.
          </div>
        )}

        {error && <div className="login-error">{error}</div>}
        {message && (
          <div style={{ color: '#3fb950', marginBottom: 16, fontSize: 14 }}>{message}</div>
        )}

        <p style={{ color: '#8b949e', fontSize: 14, marginBottom: 20, lineHeight: 1.6, textAlign: 'center' }}>
          {emailParam
            ? `We sent a verification code to ${emailParam}. It expires in 10 minutes.`
            : 'Enter your email and the 5-digit code from your inbox.'}
        </p>

        <form className="login-form" onSubmit={handleVerify}>
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
            <label className="form-label">Verification Code</label>
            <div
              style={{ display: 'flex', gap: 10, justifyContent: 'center' }}
              onPaste={handlePaste}
            >
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  className="form-input"
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(index, e)}
                  style={{
                    width: 48,
                    height: 52,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: 2,
                    padding: 0,
                  }}
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={verifyLoading}>
            {verifyLoading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <form onSubmit={handleResend} style={{ marginTop: 12 }}>
          <button
            type="submit"
            className="login-btn"
            disabled={resendLoading}
            style={{ background: 'transparent', border: '1px solid #30363d', color: '#8b949e' }}
          >
            {resendLoading ? 'Sending...' : 'Resend Code'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
}
