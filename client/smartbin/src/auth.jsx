import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';

// ─── Inline Styles ────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&family=Playfair+Display:wght@700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Nunito', sans-serif;
    background-color: #0d2a1a;
    position: relative;
    overflow: hidden;
    padding: 20px;
  }

  /* ── Animated floating leaves background ── */
  @keyframes floatLeaf {
    0%   { transform: translateY(100vh) rotate(0deg);    opacity: 0; }
    10%  { opacity: 0.55; }
    90%  { opacity: 0.35; }
    100% { transform: translateY(-120px) rotate(360deg); opacity: 0; }
  }

  .leaf {
    position: fixed;
    bottom: -60px;
    animation: floatLeaf linear infinite;
    opacity: 0;
    pointer-events: none;
    z-index: 1;
  }

  /* ── Card ── */
  .auth-wrapper {
    position: relative;
    z-index: 10;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 30px 80px rgba(0,0,0,0.5);
    width: 860px;
    max-width: 100%;
    min-height: 560px;
    overflow: hidden;
  }

  /* ── Forms ── */
  .auth-form-box {
    position: absolute;
    top: 0;
    height: 100%;
    width: 50%;
    transition: all 0.65s cubic-bezier(0.77,0,0.18,1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-form-box {
    left: 0;
    z-index: 2;
    opacity: 1;
    pointer-events: auto;
  }
  .register-form-box {
    left: 0;
    z-index: 1;
    opacity: 0;
    pointer-events: none;   /* prevents overlap interaction */
  }

  .auth-wrapper.panel-active .login-form-box {
    transform: translateX(100%);
    opacity: 0;
    pointer-events: none;   /* hide completely */
  }

  .auth-wrapper.panel-active .register-form-box {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    pointer-events: auto;   /* enable only active form */
    animation: showForm 0.65s;
  }

  @keyframes showForm {
    0%, 49.99% { opacity: 0; z-index: 1; }
    50%, 100%  { opacity: 1; z-index: 5; }
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 44px;
    width: 100%;
    text-align: center;
  }

  form h1 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: #1a3a26;
    margin-bottom: 4px;
  }
  .form-subtitle {
    font-size: 13px;
    color: #888;
    margin-bottom: 18px;
    font-family: 'Nunito', sans-serif;
  }

  .social-links { display: flex; gap: 12px; margin-bottom: 14px; }
  .social-links a {
    width: 42px; height: 42px;
    border: 2px solid #d4edda;
    border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    color: #2e7d4f;
    font-size: 15px;
    text-decoration: none;
    transition: all 0.25s;
  }

  .social-links a:hover {
    background: #2e7d4f;
    border-color: #2e7d4f;
    color: #fff;
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(46,125,79,0.35);
  }

  .divider-row {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .divider-row span { font-size: 12px; color: #aaa; white-space: nowrap; }
  .divider-line { flex: 1; height: 1px; background: #e5e7eb; }
  .auth-input {
    width: 100%;
    background: #f3f9f5;
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 14px;
    font-family: 'Nunito', sans-serif;
    margin-bottom: 10px;
    transition: all 0.25s;
    color: #1a3a26;
  }
  .auth-input:focus {
    outline: none;
    border-color: #2e7d4f;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(46,125,79,0.12);
  }
  .auth-input:disabled { opacity: 0.6; cursor: not-allowed; }
  .forgot-link {
    align-self: flex-end;
    font-size: 12px;
    color: #2e7d4f;
    text-decoration: none;
    margin-bottom: 16px;
    transition: color 0.2s;
  }
  .forgot-link:hover { color: #1a5c36; text-decoration: underline; }

  .auth-btn {
    width: 100%;
    background: linear-gradient(135deg, #2e7d4f 0%, #1a5c36 100%);
    color: #fff;
    border: none;
    border-radius: 25px;
    padding: 14px 0;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s;
    box-shadow: 0 6px 20px rgba(46,125,79,0.35);
    margin-top: 2px;
  }
  .auth-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(46,125,79,0.45);
  }
  .auth-btn:active:not(:disabled) { transform: translateY(0); }
  .auth-btn:disabled { opacity: 0.65; cursor: not-allowed; }

  .wake-note {
    font-size: 11px;
    color: #bbb;
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* ── Slide Panel ── */
  .slide-panel-wrapper {
    position: absolute;
    top: 0; left: 50%;
    width: 50%; height: 100%;
    overflow: hidden;
    z-index: 100;
    transition: transform 0.65s cubic-bezier(0.77,0,0.18,1);
  }
  .auth-wrapper.panel-active .slide-panel-wrapper { transform: translateX(-100%); }

  .slide-panel {
    background: linear-gradient(145deg, #1b5e34 0%, #2e7d4f 45%, #4caf80 100%);
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transition: transform 0.65s cubic-bezier(0.77,0,0.18,1);
    overflow: hidden;
  }
  .auth-wrapper.panel-active .slide-panel { transform: translateX(50%); }

  .slide-panel::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 60%),
      radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 60%);
    pointer-events: none;
  }

  .panel-content {
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 40px;
    text-align: center;
    color: #fff;
    transition: transform 0.65s cubic-bezier(0.77,0,0.18,1);
  }
  .panel-content h1 {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    color: #fff;
    margin-bottom: 0;
  }
  .panel-content p {
    font-size: 14px;
    font-weight: 300;
    line-height: 1.7;
    margin: 14px 0 26px;
    opacity: 0.9;
    font-family: 'Nunito', sans-serif;
  }

  .panel-content-left  { left: 0;  transform: translateX(-15%); }
  .panel-content-right { right: 0; transform: translateX(0); }
  .auth-wrapper.panel-active .panel-content-left  { transform: translateX(0); }
  .auth-wrapper.panel-active .panel-content-right { transform: translateX(15%); }

  .panel-icon {
    width: 68px; height: 68px;
    background: rgba(255,255,255,0.15);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 18px;
    font-size: 30px;
    border: 1.5px solid rgba(255,255,255,0.3);
  }

  .transparent-btn {
    background: transparent;
    border: 2px solid #fff;
    color: #fff;
    border-radius: 25px;
    padding: 12px 44px;
    font-size: 13px;
    font-weight: 700;
    font-family: 'Nunito', sans-serif;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s;
  }
  .transparent-btn:hover { background: rgba(255,255,255,0.18); transform: translateY(-2px); }

  /* ── Mobile ── */
  .mobile-switch { display: none; margin-top: 20px; text-align: center; }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }

  @media (max-width: 768px) {
    .auth-wrapper { min-height: auto; border-radius: 16px; }
    .auth-form-box { position: static !important; width: 100% !important; transform: none !important; opacity: 1 !important; transition: none !important; }
    .register-form-box { display: none; }
    .auth-wrapper.panel-active .login-form-box    { display: none !important; }
    .auth-wrapper.panel-active .register-form-box { display: flex !important; animation: none !important; }
    .slide-panel-wrapper { display: none !important; }
    form { padding: 32px 24px; }
    .mobile-switch { display: block; }
    .mobile-switch p { font-size: 13px; color: #666; margin-bottom: 10px; }
    .mobile-switch-btn {
      background: transparent;
      border: 2px solid #2e7d4f;
      color: #2e7d4f;
      border-radius: 25px;
      padding: 10px 32px;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Nunito', sans-serif;
      letter-spacing: 1px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.25s;
    }
    .mobile-switch-btn:hover { background: #2e7d4f; color: #fff; }
  }
`;

// ─── Leaf SVG clipart ─────────────────────────────────────────────────────────
const LeafSVG = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 3 C10 3 4 12 4 20 C4 30 12 37 20 37 C28 37 36 30 36 20 C36 12 30 3 20 3 Z"
      fill={color}
    />
    <path d="M20 3 Q23 15 20 37" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
    <path d="M20 14 Q26 18 32 16" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />
    <path d="M20 20 Q27 22 34 20" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />
    <path d="M20 26 Q25 27 30 25" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" fill="none" />
  </svg>
);

const LEAVES = [
  { left: '4%', delay: '0s', dur: '13s', size: 22, color: '#4caf80cc' },
  { left: '13%', delay: '2.8s', dur: '16s', size: 15, color: '#66bb6acc' },
  { left: '25%', delay: '5.2s', dur: '11s', size: 30, color: '#388e3ccc' },
  { left: '38%', delay: '1.1s', dur: '14s', size: 17, color: '#81c784cc' },
  { left: '52%', delay: '7.3s', dur: '15s', size: 24, color: '#4caf80cc' },
  { left: '64%', delay: '3.7s', dur: '10s', size: 19, color: '#66bb6acc' },
  { left: '76%', delay: '6.4s', dur: '17s', size: 28, color: '#2e7d4fcc' },
  { left: '88%', delay: '0.6s', dur: '12s', size: 13, color: '#a5d6a7cc' },
  { left: '95%', delay: '4.5s', dur: '14s', size: 20, color: '#388e3ccc' },
];

// ─── Shared Auth Component ────────────────────────────────────────────────────
function Auth({ initialPanel = 'login' }) {
  const [panelActive, setPanelActive] = useState(initialPanel === 'register');
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const navigate = useNavigate();

  // ── Login handler (original logic preserved) ──
  async function handleLogin(e) {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post('https://smartbin-api-c7g4.onrender.com/api/login', {
        email: loginEmail,
        password: loginPassword,
      });
      if (res.data.status === 'ok') {
        localStorage.setItem('token', res.data.token);
        if (res.data.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      } else {
        alert('Invalid Credentials. Please try again.');
        setLoginLoading(false);
      }
    } catch {
      alert('Server connection error.');
      setLoginLoading(false);
    }
  }

  // ── Register handler (original logic preserved) ──
  async function handleRegister(e) {
    e.preventDefault();
    setRegLoading(true);
    try {
      const res = await axios.post('https://smartbin-api-c7g4.onrender.com/api/register', {
        name: regName,
        email: regEmail,
        password: regPassword,
      });
      if (res.data.status === 'ok') {
        alert('Registration Successful! Please Login.');
        setPanelActive(false);
        setRegLoading(false);
      } else {
        alert('Error: ' + (res.data.error || 'Email might already be in use.'));
        setRegLoading(false);
      }
    } catch {
      alert('Server connection failed.');
      setRegLoading(false);
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        {/* Floating leaves background */}
        {LEAVES.map((l, i) => (
          <div
            key={i}
            className="leaf"
            style={{ left: l.left, animationDelay: l.delay, animationDuration: l.dur }}
          >
            <LeafSVG color={l.color} size={l.size} />
          </div>
        ))}
        <div className={`auth-wrapper${panelActive ? ' panel-active' : ''}`}>
          {/* ══ Register Form ══ */}
          <div className="auth-form-box register-form-box">
            <form onSubmit={handleRegister}>
              <h1>Create Account</h1>
              <p className="form-subtitle">Join the SmartBin revolution today</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Google"><i className="fab fa-google"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              </div>
              <div className="divider-row">
                <div className="divider-line"></div>
                <span>or use your email</span>
                <div className="divider-line"></div>
              </div>
              <input
                required type="text"
                className="auth-input"
                placeholder="Full Name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                disabled={regLoading}
              />
              <input
                required type="email"
                className="auth-input"
                placeholder="Email Address"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={regLoading}
              />
              <input
                required type="password"
                className="auth-input"
                placeholder="Password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={regLoading}
              />
              <button type="submit" className="auth-btn" disabled={regLoading}>
                {regLoading
                  ? <><Loader2 size={16} className="spin" /> Signing Up...</>
                  : 'Sign Up'}
              </button>
              <p className="wake-note">
                <i className="fas fa-info-circle"></i>
                Server may take ~30s to wake up on first try.
              </p>
              {/* Mobile toggle */}
              <div className="mobile-switch">
                <p>Already have an account?</p>
                <button type="button" className="mobile-switch-btn" onClick={() => setPanelActive(false)}>
                  Sign In
                </button>
              </div>
            </form>
          </div>
          {/* ══ Login Form ══ */}
          <div className="auth-form-box login-form-box">
            <form onSubmit={handleLogin}>
              <h1>Welcome Back</h1>
              <p className="form-subtitle">Login with your SmartBin Credentials</p>
              <div className="social-links">
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="Google"><i className="fab fa-google"></i></a>
                <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              </div>
              <div className="divider-row">
                <div className="divider-line"></div>
                <span>or use your account</span>
                <div className="divider-line"></div>
              </div>
              <input
                required type="email"
                className="auth-input"
                placeholder="Email Address"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loginLoading}
              />
              <input
                required type="password"
                className="auth-input"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loginLoading}
              />
              <a href="#" className="forgot-link">Forgot your password?</a>
              <button type="submit" className="auth-btn" disabled={loginLoading}>
                {loginLoading
                  ? <><Loader2 size={16} className="spin" /> Logging In...</>
                  : 'Sign In'}
              </button>
              <p className="wake-note">
                <i className="fas fa-info-circle"></i>
                Server may take ~30s to wake up on first try.
              </p>
              {/* Mobile toggle */}
              <div className="mobile-switch">
                <p>Don't have an account?</p>
                <button type="button" className="mobile-switch-btn" onClick={() => setPanelActive(true)}>
                  Sign Up
                </button>
              </div>
            </form>
          </div>
          {/* ══ Sliding Overlay Panel ══ */}
          <div className="slide-panel-wrapper">
            <div className="slide-panel">
              {/* Left side — visible when Register is active */}
              <div className="panel-content panel-content-left">
                <div className="panel-icon">🌿</div>
                <h1>Already have an account?</h1>
                <p>Stay connected. Sign in with your credentials and continue your green journey with SmartBin.</p>
                <button className="transparent-btn" onClick={() => setPanelActive(false)}>Sign In</button>
              </div>
              {/* Right side — visible by default */}
              <div className="panel-content panel-content-right">
                <div className="panel-icon">♻️</div>
                <h1>Using for the first time?</h1>
                <p>Begin your amazing journey. Create an account and make a real impact on the environment today.</p>
                <button className="transparent-btn" onClick={() => setPanelActive(true)}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// ─── Named exports (matches your App.jsx imports) ─────────────────────────────
export function Login() { return <Auth initialPanel="login" />; }
export function Register() { return <Auth initialPanel="register" />; }