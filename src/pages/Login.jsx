import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';

export default function Login() {
  const { login } = useAppState();
  const [role] = useState('admin'); // Only 'admin' role is exposed now
  const [email, setEmail] = useState('admin@saravana.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const res = login(email, password, role);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials');
    }
  };

  return (
    <div id="login-view" className="login-container">
      <div className="login-card">
        {/* Logo container */}
        <div className="login-logo-crossed-box" style={{ border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', margin: '0 auto 18px auto', overflow: 'hidden' }}>
          <img src="/serviqlogo.png" alt="Serviq Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        </div>
        
        <h1 className="login-title">Serviq Admin Panel</h1>
        <p className="login-subtitle">Sign in to your restaurant dashboard</p>
        
        <form id="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email" style={{textAlign:'left'}}>
              Admin Email
            </label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              <input 
                type="email" 
                id="login-email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                placeholder="admin@restaurant.com" 
              />
            </div>
          </div>
          
          <div className="form-group" style={{ position: 'relative' }}>
            <div style={{ display: 'flex',  alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="login-password" style={{ marginBottom: 0 }}>
                Admin Password
              </label>
            </div>
            <div className="input-icon-wrapper" style={{ position: 'relative' }}>
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="login-password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="Enter admin password" 
                style={{ paddingRight: '40px' }} 
              />
              <span 
                id="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', userSelect: 'none', fontSize: '14px' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>
          
          <div className="form-row-remember">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                id="remember-me" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark-box"></span>
              Remember me
            </label>
          </div>
          
          {errorMsg && (
            <div id="login-error" style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '15px', display: 'block', textAlign: 'left' }}>
              {errorMsg}
            </div>
          )}
          
          <button type="submit" className="btn btn-black" style={{ width: '100%', marginTop: '10px' }}>
            Login as Admin
          </button>
        </form>

      </div>
    </div>
  );
}
