import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppState } from '../config/AppContext';
import ShowNotifications from '../helper/ShowNotifications';

export default function Login() {
  const { login, currentUser } = useAppState();
  const navigate = useNavigate();
  const [role] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('rememberedEmail');
      const isRemembered = localStorage.getItem('rememberMe') === 'true';
      if (savedEmail && isRemembered) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) {
      console.error('Error loading saved credentials:', e);
    }
  }, []);

  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailEmpty = !emailTrimmed;
    const isPasswordEmpty = !password;
    const isEmailValid = Boolean(emailTrimmed && emailRegex.test(emailTrimmed));
    const isPasswordValid = Boolean(password && password.length > 0);

    if (isEmailEmpty && isPasswordEmpty) {
      setFormErrors({ email: true, password: true });
      ShowNotifications.showAlertNotification('Please enter your email and password', false);
      return false;
    }

    if (!isEmailValid && !isPasswordValid) {
      setFormErrors({ email: true, password: true });
      ShowNotifications.showAlertNotification('Invalid credentials', false);
      return false;
    }

    if (!isEmailValid) {
      setFormErrors({ email: true, password: false });
      ShowNotifications.showAlertNotification('Email is invalid', false);
      return false;
    }

    if (!isPasswordValid) {
      setFormErrors({ email: false, password: true });
      ShowNotifications.showAlertNotification('Invalid password', false);
      return false;
    }

    setFormErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email.trim());
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberMe');
      }

      const res = await login(email.trim(), password, role);
      if (res && res.success) {
        navigate('/dashboard', { replace: true });
      } else {
        const rawErr = String(res?.error || '').toLowerCase();
        
        if (rawErr.includes('mail') || rawErr.includes('email') || rawErr.includes('user not found') || rawErr.includes('user does not exist') || rawErr.includes('no user') || rawErr.includes('not registered')) {
          setFormErrors({ email: true, password: false });
        } else if (rawErr.includes('password') || rawErr.includes('incorrect') || rawErr.includes('wrong') || rawErr.includes('mismatch')) {
          setFormErrors({ email: false, password: true });
        } else {
          setFormErrors({ email: true, password: true });
        }
      }
    } catch (err) {
      const rawErr = String(err.message || '').toLowerCase();
      if (rawErr.includes('mail') || rawErr.includes('email') || rawErr.includes('user not found') || rawErr.includes('user does not exist')) {
        setFormErrors({ email: true, password: false });
      } else if (rawErr.includes('password') || rawErr.includes('incorrect') || rawErr.includes('wrong')) {
        setFormErrors({ email: false, password: true });
      } else {
        setFormErrors({ email: true, password: true });
      }
    } finally {
      setIsLoading(false);
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
        <p className="login-subtitle">Sign in to your restaurant management dashboard</p>
        
        <form id="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
            <label htmlFor="login-email" style={{ textAlign: 'left', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div className="input-icon-wrapper">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              <input 
                type="text" 
                id="login-email" 
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) setFormErrors(prev => ({ ...prev, email: false }));
                }}
                placeholder="Enter your email" 
                style={{
                  borderColor: formErrors.email ? '#dc2626' : undefined
                }}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ textAlign: 'left', position: 'relative', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="login-password" style={{ marginBottom: 0 }}>
                Password
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) setFormErrors(prev => ({ ...prev, password: false }));
                }}
                placeholder="Enter your password" 
                style={{ 
                  paddingRight: '40px',
                  borderColor: formErrors.password ? '#dc2626' : undefined
                }} 
              />
              <button
                type="button"
                id="toggle-password-btn" 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ 
                  position: 'absolute', 
                  right: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  cursor: 'pointer', 
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: showPassword ? 'var(--primary, #ff5a1f)' : '#64748b',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff5a1f)'}
                onMouseLeave={(e) => e.currentTarget.style.color = showPassword ? 'var(--primary, #ff5a1f)' : '#64748b'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
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
          
          <button 
            type="submit" 
            className="btn btn-black" 
            disabled={isLoading}
            style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
