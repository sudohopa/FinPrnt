'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('hr_token') || sessionStorage.getItem('hr_token');
    if (token) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid credentials');

      const store = remember ? localStorage : sessionStorage;
      store.setItem('hr_token', data.token);
      if (data.user) {
        store.setItem('hr_user', JSON.stringify(data.user));
      }

      try {
        const payloadBase64 = data.token.split('.')[1];
        const payloadJson = JSON.parse(atob(payloadBase64));
        store.setItem('hr_role', payloadJson.role || 'EMPLOYEE');
        store.setItem('hr_userId', payloadJson.id || '');
        store.setItem('hr_name', payloadJson.fullName || username);
      } catch (_) {}

      // Successful redirect to /dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        body { font-family: 'Inter', sans-serif; min-height: 100vh; display: flex; background: #fff; margin:0; }
        
        .login-container { display: flex; width: 100vw; min-height: 100vh; }

        /* LEFT: Form panel */
        .login-left {
          width: 480px; flex-shrink: 0;
          display: flex; flex-direction: column; justify-content: center;
          padding: 3rem 3.5rem; background: #fff; position: relative;
        }
        .left-logo { display: flex; align-items: center; gap: .55rem; margin-bottom: 3rem; text-decoration: none; }
        .left-logo .logo-icon { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; }
        .left-logo .logo-icon svg { width: 38px; height: 38px; }
        .left-logo span { font-size: 1.25rem; font-weight: 800; color: var(--dark); }
        
        .form-heading { font-size: 1.5rem; font-weight: 800; color: var(--dark); margin-bottom: .4rem; letter-spacing: -.3px; }
        .form-sub { font-size: .875rem; color: var(--gray); margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.1rem; }
        .form-group label { display: block; font-size: .82rem; font-weight: 600; color: var(--dark); margin-bottom: .45rem; }
        .form-group input {
          width: 100%; padding: .72rem 1rem;
          border: 1.5px solid var(--border); border-radius: 9px;
          font-size: .9rem; font-family: 'Inter', sans-serif;
          background: #fff; color: var(--dark); transition: all .2s;
        }
        .form-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79,110,245,.1); }
        .form-group input.err { border-color: var(--danger); }
        .form-group input::placeholder { color: #D1D5DB; }
        
        .form-options { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.4rem; }
        .remember { display: flex; align-items: center; gap: .45rem; font-size: .83rem; color: var(--gray); cursor: pointer; }
        .remember input[type="checkbox"] { accent-color: var(--primary); width: 15px; height: 15px; }
        .forgot { font-size: .83rem; color: var(--primary); text-decoration: none; font-weight: 500; }
        .forgot:hover { text-decoration: underline; }
        
        .btn-signin {
          width: 100%; padding: .8rem; background: var(--primary); color: #fff;
          border: none; border-radius: 9px; font-size: .95rem; font-weight: 700;
          font-family: 'Inter', sans-serif; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: .5rem;
          transition: all .2s; letter-spacing: .01em;
        }
        .btn-signin:hover { background: var(--primary-dark); box-shadow: 0 4px 14px rgba(79,110,245,.4); }
        .btn-signin:disabled { opacity: .6; cursor: not-allowed; box-shadow: none; }
        
        .spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .no-account { text-align: center; margin-top: 1.5rem; font-size: .83rem; color: var(--gray); }
        .no-account a { color: var(--primary); text-decoration: none; font-weight: 500; }
        
        .error-box {
          background: #FFF1F2; border: 1px solid #FFE4E6; color: #E11D48;
          border-radius: 8px; padding: .7rem 1rem; font-size: .83rem; margin-bottom: 1rem;
          display: flex; align-items: center; gap: .5rem;
        }
        .login-copy { position: absolute; bottom: 2rem; left: 3.5rem; font-size: .73rem; color: #D1D5DB; }

        /* RIGHT: Gradient preview panel */
        .login-right {
          flex: 1;
          background: linear-gradient(145deg, #4F6EF5 0%, #6B5CF5 45%, #7C3AED 100%);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 3rem; position: relative; overflow: hidden;
        }
        .login-right::before {
          content: ''; position: absolute; top: -120px; right: -120px;
          width: 400px; height: 400px; border-radius: 50%;
          background: rgba(255,255,255,.06);
        }
        .login-right::after {
          content: ''; position: absolute; bottom: -80px; left: -80px;
          width: 280px; height: 280px; border-radius: 50%;
          background: rgba(255,255,255,.04);
        }
        .rp-text { position: relative; z-index: 1; text-align: center; margin-bottom: 2.5rem; }
        .rp-text h2 { font-size: 1.9rem; font-weight: 800; color: #fff; letter-spacing: -.4px; margin-bottom: .7rem; line-height: 1.2; }
        .rp-text p { font-size: .9rem; color: rgba(255,255,255,.75); }
        
        .mock-browser {
          position: relative; z-index: 1;
          background: rgba(255,255,255,.95); border-radius: 12px;
          width: 100%; max-width: 420px; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,.25);
        }
        .mock-bar {
          background: #F9FAFB; border-bottom: 1px solid #E5E7EB;
          padding: .6rem 1rem; display: flex; align-items: center; gap: .5rem;
        }
        .mock-dots { display: flex; gap: .3rem; }
        .mock-dots span { width: 10px; height: 10px; border-radius: 50%; }
        .mock-dots span:nth-child(1) { background: #FF5F57; }
        .mock-dots span:nth-child(2) { background: #FEBC2E; }
        .mock-dots span:nth-child(3) { background: #28C840; }
        .mock-url { flex: 1; background: #fff; border: 1px solid #E5E7EB; border-radius: 5px; padding: .25rem .65rem; font-size: .7rem; color: #9CA3AF; margin: 0 .5rem; }
        .mock-body { padding: 1rem 1.1rem 1.2rem; }
        .mock-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; margin-bottom: .9rem; }
        
        .ms { border-radius: 8px; padding: .6rem .5rem; text-align: center; }
        .ms.blue { background: #4F6EF5; }
        .ms.green { background: #22C55E; }
        .ms.purple { background: #8B5CF6; }
        .ms.orange { background: #F59E0B; }
        .ms .mn { font-size: 1rem; font-weight: 800; color: #fff; }
        .ms .ml { font-size: .55rem; color: rgba(255,255,255,.85); margin-top: .1rem; }
        
        .mock-charts { display: grid; grid-template-columns: 3fr 2fr; gap: .6rem; }
        .mc { background: #F9FAFB; border-radius: 8px; padding: .7rem; }
        .mc-title { font-size: .62rem; color: #6B7280; font-weight: 600; margin-bottom: .5rem; }
        .mc-bars { display: flex; align-items: flex-end; gap: 3px; height: 44px; }
        .mc-bar { flex: 1; background: #4F6EF5; border-radius: 3px 3px 0 0; opacity: .85; }
        .mc-item { font-size: .6rem; color: #6B7280; padding: .2rem 0; border-bottom: 1px solid #F3F4F6; display: flex; justify-content: space-between; }
        .mc-item span:last-child { color: #4F6EF5; font-weight: 600; }
        
        .rp-stats { display: flex; gap: 2.5rem; margin-top: 2rem; position: relative; z-index: 1; }
        .rp-stat .n { font-size: 1.4rem; font-weight: 800; color: #fff; }
        .rp-stat .l { font-size: .73rem; color: rgba(255,255,255,.65); margin-top: .1rem; }

        @media(max-width:860px){
          .login-right { display: none; }
          .login-left { width: 100%; }
        }
      `}</style>

      <div className="login-container">
        {/* LEFT: Form */}
        <div className="login-left">
          <Link href="/" className="left-logo">
            <div className="logo-icon">
              <svg viewBox="0 0 100 100" fill="none" stroke="#4F6EF5" strokeWidth="7.5" strokeLinecap="round">
                <path d="M78 20 A41 41 0 1 0 78 80" />
                <path d="M67 31 A26 26 0 1 0 67 69" />
                <line x1="44" y1="38" x2="84" y2="38" />
                <line x1="44" y1="50" x2="78" y2="50" />
                <line x1="44" y1="62" x2="71" y2="62" />
                <circle cx="78" cy="20" r="5" fill="#4F6EF5" stroke="none" />
                <circle cx="78" cy="80" r="5" fill="#4F6EF5" stroke="none" />
              </svg>
            </div>
            <span>Finprint</span>
          </Link>

          <h1 className="form-heading">Sign in to your account</h1>
          <p className="form-sub">Welcome back! Enter your credentials to continue.</p>

          {error && (
            <div className="error-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username or Email</label>
              <input
                type="text"
                id="username"
                placeholder="heba.adel@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className={error ? 'err' : ''}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-options">
              <label className="remember">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />{' '}
                Remember me
              </label>
              <a href="#" className="forgot" onClick={(e) => e.preventDefault()}>Forgot password?</a>
            </div>
            <button type="submit" className="btn-signin" disabled={loading}>
              {loading && <div className="spinner"></div>}
              <span>{loading ? 'Signing in...' : 'Sign In →'}</span>
            </button>
          </form>

          <p className="no-account">Don't have an account? <a href="#" onClick={(e) => e.preventDefault()}>Contact your administrator</a></p>
          <p className="login-copy">© 2026 Finprint. All rights reserved.</p>
        </div>

        {/* RIGHT: Preview */}
        <div className="login-right">
          <div className="rp-text">
            <h2>Modern Workforce<br />Management</h2>
            <p>Track performance, attendance, and growth — all in one place.</p>
          </div>

          <div className="mock-browser">
            <div className="mock-bar">
              <div className="mock-dots"><span></span><span></span><span></span></div>
              <div className="mock-url">finprint.app/dashboard</div>
            </div>
            <div className="mock-body">
              <div className="mock-stats">
                <div className="ms blue"><div className="mn">235</div><div className="ml">Employees</div></div>
                <div className="ms green"><div className="mn">92%</div><div className="ml">Attendance</div></div>
                <div className="ms purple"><div className="mn">12</div><div className="ml">Positions</div></div>
                <div className="ms orange"><div className="mn">4.2</div><div className="ml">Score</div></div>
              </div>
              <div className="mock-charts">
                <div className="mc">
                  <div className="mc-title">Revenue Overview</div>
                  <div className="mc-bars">
                    <div className="mc-bar" style={{ height: '55%' }}></div>
                    <div className="mc-bar" style={{ height: '70%' }}></div>
                    <div className="mc-bar" style={{ height: '50%' }}></div>
                    <div className="mc-bar" style={{ height: '85%' }}></div>
                    <div className="mc-bar" style={{ height: '65%' }}></div>
                    <div className="mc-bar" style={{ height: '90%' }}></div>
                    <div className="mc-bar" style={{ height: '75%' }}></div>
                  </div>
                </div>
                <div className="mc">
                  <div className="mc-title">Top Performers</div>
                  <div className="mc-list">
                    <div className="mc-item"><span>Mahmoud Ali</span><span>4.9★</span></div>
                    <div className="mc-item"><span>Mona Fathy</span><span>4.8★</span></div>
                    <div className="mc-item"><span>Ahmed Hany</span><span>4.7★</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rp-stats">
            <div className="rp-stat"><div className="n">500+</div><div className="l">Companies</div></div>
            <div className="rp-stat"><div className="n">10k+</div><div className="l">Employees</div></div>
            <div className="rp-stat"><div className="n">99.9%</div><div className="l">Uptime</div></div>
          </div>
        </div>
      </div>
    </>
  );
}
