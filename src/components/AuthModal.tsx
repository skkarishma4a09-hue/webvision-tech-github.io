import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Eye, EyeOff, Lock, Mail, Shield, Sparkles, X, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

type AuthMode = 'login' | 'register';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1.5px solid rgba(255,255,255,0.09)',
  borderRadius: 10,
  color: '#f1f5f9',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'rgba(241,245,249,0.7)',
  marginBottom: 7,
};

export default function AuthModal() {
  const { authView, setAuthView, loginUser, registerUser } = useApp();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authView) return;
    setMode('login');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setError('');
  }, [authView]);

  const close = useCallback(() => setAuthView(null), [setAuthView]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (mode === 'register' && name.trim().length < 2) {
      setError('Enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }
    if (mode === 'register') {
      if (password.length < 10 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        setError('Use at least 10 characters, including a letter and a number.');
        return;
      }
      if (password !== confirmPassword) {
        setError('The passwords do not match.');
        return;
      }
    } else if (!password) {
      setError('Enter your password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await registerUser(name.trim(), normalizedEmail, password);
      } else {
        await loginUser(normalizedEmail, password);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authView) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-title"
      className="modal-backdrop"
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="auth-modal-grid"
        onClick={(event) => event.stopPropagation()}
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          width: '100%',
          maxWidth: 900,
          maxHeight: '95vh',
          overflow: 'auto',
          borderRadius: 20,
          background: '#0d0d1a',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.15)',
        }}
      >
        <section
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflow: 'hidden',
            padding: '48px 40px',
            background: 'linear-gradient(145deg, #1a0533 0%, #0d1a3a 50%, #0a1628 100%)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'grid', placeItems: 'center' }}>
                <Sparkles size={18} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>SynapseAI</div>
                <div style={{ fontSize: 11, color: '#a78bfa', fontWeight: 600, letterSpacing: 1 }}>CREATOR HUB</div>
              </div>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.2, marginBottom: 14 }}>
              Create, connect, and grow with AI-powered content.
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.6)', lineHeight: 1.6 }}>
              Sign in to access your creator marketplace account.
            </p>
            <div style={{ display: 'grid', gap: 14, marginTop: 32 }}>
              {[
                [<Shield size={15} />, 'Secure account access'],
                [<Lock size={15} />, 'Password-protected login'],
                [<Zap size={15} />, 'Quick account setup'],
              ].map(([icon, text]) => (
                <div key={String(text)} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'rgba(241,245,249,0.75)', fontSize: 13 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(139,92,246,0.15)', display: 'grid', placeItems: 'center', color: '#a78bfa' }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 24, marginTop: 40 }}>
            {[['24K+', 'Creators'], ['180K+', 'Products'], ['99.9%', 'Uptime']].map(([value, label]) => (
              <div key={label}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{value}</div>
                <div style={{ fontSize: 11, color: 'rgba(241,245,249,0.4)' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '48px 40px', background: '#0f0f1e' }}>
          <button
            type="button"
            aria-label="Close sign in dialog"
            onClick={close}
            style={{ position: 'absolute', top: 20, right: 20, width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'rgba(241,245,249,0.6)' }}
          >
            <X size={14} />
          </button>

          <h2 id="auth-title" style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.5)', marginBottom: 24 }}>
            {mode === 'login' ? 'Sign in with your email and password.' : 'Join the SynapseAI creator marketplace.'}
          </p>

          {error && (
            <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 14 }}>
                <label htmlFor="auth-name" style={labelStyle}>Full name</label>
                <input id="auth-name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} disabled={loading} style={inputStyle} required minLength={2} />
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="auth-email" style={labelStyle}>Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} aria-hidden="true" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#a78bfa' }} />
                <input id="auth-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} disabled={loading} style={{ ...inputStyle, paddingLeft: 42 }} required />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label htmlFor="auth-password" style={labelStyle}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="auth-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} disabled={loading} style={{ ...inputStyle, paddingRight: 44 }} required minLength={mode === 'register' ? 10 : 1} />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)} style={{ position: 'absolute', top: 6, right: 8, width: 32, height: 32, border: 0, color: 'rgba(241,245,249,0.55)', background: 'transparent', cursor: 'pointer' }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === 'register' && <p style={{ margin: '6px 0 0', color: 'rgba(241,245,249,0.4)', fontSize: 11 }}>At least 10 characters, including a letter and a number.</p>}
            </div>

            {mode === 'register' && (
              <div style={{ marginBottom: 18 }}>
                <label htmlFor="auth-confirm-password" style={labelStyle}>Confirm password</label>
                <input id="auth-confirm-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} disabled={loading} style={inputStyle} required />
              </div>
            )}

            <button type="submit" disabled={loading || !email || !password} style={{ width: '100%', padding: '13px 20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', border: 0, borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1, marginBottom: 16 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {mode === 'login' && <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(241,245,249,0.4)', margin: '0 0 14px' }}>Forgot your password? Contact support to recover access.</p>}
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(241,245,249,0.45)', margin: 0 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setPassword(''); setConfirmPassword(''); }} style={{ background: 'none', border: 0, color: '#a78bfa', fontWeight: 600, cursor: 'pointer' }}>
              {mode === 'login' ? 'Create account' : 'Sign in'}
            </button>
          </p>
        </section>
      </div>

      <style>{`
        @media (max-width: 680px) {
          .auth-modal-grid { grid-template-columns: 1fr !important; max-width: 440px !important; }
          .auth-modal-grid > section:first-child { display: none !important; }
          .auth-modal-grid > section:last-child { padding: 42px 24px 28px !important; }
        }
      `}</style>
    </div>
  );
}
