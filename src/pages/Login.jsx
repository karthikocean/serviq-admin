import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppState } from '../config/AppContext';
import AuthApi from '../api/Auth';
import ShowNotifications from '../helper/ShowNotifications';
import { Modal } from '../components/Modal';

const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

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

  // Forgot Password flow states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Identifier, 2: Verify OTP, 3: Set New PIN
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [newPinDigits, setNewPinDigits] = useState(['', '', '', '']);
  const newPinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [confirmPinDigits, setConfirmPinDigits] = useState(['', '', '', '']);
  const confirmPinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const [activeBoxFocus, setActiveBoxFocus] = useState({ field: '', index: -1 });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

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

  // Resend OTP countdown timer effect
  useEffect(() => {
    let timer = null;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCountdown]);

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

  // Forgot Password Handlers
  const handleOpenForgot = () => {
    setForgotIdentifier(email.trim() || '');
    setOtpDigits(['', '', '', '']);
    setNewPinDigits(['', '', '', '']);
    setConfirmPinDigits(['', '', '', '']);
    setShowNewPin(false);
    setShowConfirmPin(false);
    setForgotErrors({});
    setForgotStep(1);
    setResendCountdown(0);
    setIsForgotMode(true);
  };

  const handleBackToSignIn = () => {
    setIsForgotMode(false);
    setForgotStep(1);
    setForgotErrors({});
  };

  const handleSendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanId = (forgotIdentifier || '').trim();
    if (!cleanId) {
      setForgotErrors({ identifier: 'Phone number or email is required.' });
      return;
    }

    setForgotErrors({});
    setForgotLoading(true);

    try {
      const res = await AuthApi.forgotPassword(cleanId);
      if (res && (res.status === true || res.response?.success === true)) {
        triggerToast('OTP sent successfully');
        const otpMsg = res.data?.message || res.response?.data?.message || res.message;
        if (otpMsg) {
          ShowNotifications.showAlertNotification(otpMsg, true);
        }
        const otpVal = res.otp || res.data?.otp || res.response?.data?.otp;
        if (otpVal) {
          const sOtp = String(otpVal).slice(0, 4);
          setOtpDigits(sOtp.split('').concat(['', '', '', '']).slice(0, 4));
        } else {
          setOtpDigits(['', '', '', '']);
        }
        setForgotStep(2);
        setResendCountdown(60);
        setTimeout(() => {
          otpInputRefs[0].current?.focus();
        }, 150);
      } else {
        const errMsg = res?.message || 'Failed to send OTP. Please check your credentials.';
        setForgotErrors({ identifier: errMsg });
        ShowNotifications.showAlertNotification(errMsg, false);
      }
    } catch (err) {
      console.error('Error sending reset OTP:', err);
      setForgotErrors({ identifier: 'An error occurred. Please try again.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || forgotLoading) return;
    const cleanId = (forgotIdentifier || '').trim();
    if (!cleanId) return;

    setForgotLoading(true);
    try {
      const res = await AuthApi.forgotPassword(cleanId);
      if (res && (res.status === true || res.response?.success === true)) {
        triggerToast('OTP sent successfully');
        const otpMsg = res.data?.message || res.response?.data?.message || res.message;
        ShowNotifications.showAlertNotification(otpMsg || 'A new OTP has been sent.', true);
        const otpVal = res.otp || res.data?.otp || res.response?.data?.otp;
        if (otpVal) {
          const sOtp = String(otpVal).slice(0, 4);
          setOtpDigits(sOtp.split('').concat(['', '', '', '']).slice(0, 4));
        }
        setResendCountdown(60);
      } else {
        ShowNotifications.showAlertNotification(res?.message || 'Failed to resend OTP.', false);
      }
    } catch (err) {
      ShowNotifications.showAlertNotification('Failed to resend OTP.', false);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);
    if (forgotErrors.otp) setForgotErrors((prev) => ({ ...prev, otp: '' }));

    if (cleanChar && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs[index - 1].current?.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim().slice(0, 4);
    if (pasted) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setOtpDigits(newDigits);
      if (forgotErrors.otp) setForgotErrors((prev) => ({ ...prev, otp: '' }));
      const nextIdx = Math.min(pasted.length, 3);
      otpInputRefs[nextIdx].current?.focus();
    }
  };

  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = otpDigits.join('').trim();
    if (cleanOtp.length !== 4) {
      setForgotErrors({ otp: 'Please enter all 4 digits of the OTP.' });
      return;
    }

    setForgotErrors({});
    setForgotLoading(true);

    try {
      const res = await AuthApi.verifyOtp({ email: forgotIdentifier.trim(), otp: cleanOtp });
      if (res && (res.status === true || res.response?.success === true)) {
        triggerToast('OTP verified successfully');
        setForgotStep(3);
        setTimeout(() => {
          newPinRefs[0].current?.focus();
        }, 150);
      } else {
        const errMsg = res?.message || 'Invalid OTP. Please check and try again.';
        setForgotErrors({ otp: errMsg });
        ShowNotifications.showAlertNotification(errMsg, false);
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      const errMsg = err?.message || 'Failed to verify OTP. Please try again.';
      setForgotErrors({ otp: errMsg });
      ShowNotifications.showAlertNotification(errMsg, false);
    } finally {
      setForgotLoading(false);
    }
  };

  const handlePinDigitChange = (type, index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1);
    const isNew = type === 'new';
    const digits = isNew ? [...newPinDigits] : [...confirmPinDigits];
    const setDigits = isNew ? setNewPinDigits : setConfirmPinDigits;
    const refs = isNew ? newPinRefs : confirmPinRefs;

    digits[index] = cleanChar;
    setDigits(digits);
    if (forgotErrors.pin) setForgotErrors((prev) => ({ ...prev, pin: '' }));

    if (cleanChar && index < 3) {
      refs[index + 1].current?.focus();
    } else if (cleanChar && index === 3 && isNew) {
      confirmPinRefs[0].current?.focus();
    }
  };

  const handlePinKeyDown = (type, index, e) => {
    const isNew = type === 'new';
    const digits = isNew ? [...newPinDigits] : [...confirmPinDigits];
    const setDigits = isNew ? setNewPinDigits : setConfirmPinDigits;
    const refs = isNew ? newPinRefs : confirmPinRefs;

    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        refs[index - 1].current?.focus();
        digits[index - 1] = '';
        setDigits(digits);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      refs[index + 1].current?.focus();
    }
  };

  const handlePinPaste = (type, e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim().slice(0, 4);
    if (pasted) {
      const isNew = type === 'new';
      const setDigits = isNew ? setNewPinDigits : setConfirmPinDigits;
      const refs = isNew ? newPinRefs : confirmPinRefs;
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      if (forgotErrors.pin) setForgotErrors((prev) => ({ ...prev, pin: '' }));
      const nextIdx = Math.min(pasted.length, 3);
      refs[nextIdx].current?.focus();
    }
  };

  const handleResetPinSubmit = async (e) => {
    if (e) e.preventDefault();
    const newPin = newPinDigits.join('').trim();
    const confirmPin = confirmPinDigits.join('').trim();

    if (newPin.length !== 4) {
      setForgotErrors({ pin: 'Please enter a 4-digit PIN.' });
      return;
    }
    if (confirmPin.length !== 4) {
      setForgotErrors({ pin: 'Please confirm your 4-digit PIN.' });
      return;
    }
    if (newPin !== confirmPin) {
      setForgotErrors({ pin: 'PINs do not match. Please try again.' });
      return;
    }

    setForgotErrors({});
    setForgotLoading(true);

    try {
      const res = await AuthApi.resetPassword({
        email: forgotIdentifier.trim(),
        otp: otpDigits.join('').trim(),
        password: newPin
      });

      if (res && (res.status === true || res.response?.success === true)) {
        triggerToast('PIN reset successfully');
        ShowNotifications.showAlertNotification(res.message || 'PIN reset successfully! You can now sign in.', true);
        if (String(forgotIdentifier).includes('@')) {
          setEmail(forgotIdentifier.trim());
        }
        setPassword(newPin);
        setIsForgotMode(false);
        setForgotStep(1);
      } else {
        const errMsg = res?.message || 'Failed to reset PIN. Please try again.';
        setForgotErrors({ pin: errMsg });
        ShowNotifications.showAlertNotification(errMsg, false);
      }
    } catch (err) {
      console.error('Error resetting PIN:', err);
      const errMsg = err?.message || 'An unexpected error occurred. Please try again.';
      setForgotErrors({ pin: errMsg });
      ShowNotifications.showAlertNotification(errMsg, false);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div id="login-view" className="login-container">
      {/* Toast Notification for OTP & PIN actions */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          color: '#15803d',
          padding: '12px 20px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 9999,
          fontSize: '13px',
          fontWeight: 700
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SIGN IN CARD */}
      {!isForgotMode && (
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
            
            <div className="form-row-remember" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
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

              <button
                type="button"
                id="forgot-password-link"
                className="forgot-pwd-link"
                onClick={handleOpenForgot}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary, #ff5a1f)',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              >
                Forgot Password?
              </button>
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
      )}

      {/* 2. FORGOT PASSWORD FLOW CARD (Matches 3-Step UI) */}
      {isForgotMode && (
        <div className="login-card" style={{ maxWidth: '360px', padding: '24px 22px', borderRadius: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.12)' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' }}>
            <img src="/serviqlogo.png" alt="Serviq Logo" style={{ width: '42px', height: '42px', objectFit: 'contain' }} />
          </div>

          {/* Stepper Header (1 ----- 2 ----- 3) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', width: '170px' }}>
            {/* Step 1 Circle */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              background: forgotStep > 1 ? '#10b981' : 'var(--primary, #ff7a00)',
              color: '#ffffff',
              zIndex: 2,
              transition: 'all 0.3s ease',
              boxShadow: forgotStep === 1 ? '0 2px 6px rgba(255, 122, 0, 0.35)' : 'none'
            }}>
              {forgotStep > 1 ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : '1'}
            </div>

            {/* Line 1 -> 2 */}
            <div style={{
              flex: 1,
              height: '2px',
              background: forgotStep >= 2 ? '#10b981' : '#e2e8f0',
              transition: 'background 0.3s ease'
            }} />

            {/* Step 2 Circle */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              background: forgotStep > 2 ? '#10b981' : (forgotStep === 2 ? 'var(--primary, #ff7a00)' : '#f1f5f9'),
              color: forgotStep >= 2 ? '#ffffff' : '#94a3b8',
              zIndex: 2,
              transition: 'all 0.3s ease',
              boxShadow: forgotStep === 2 ? '0 2px 6px rgba(255, 122, 0, 0.35)' : 'none'
            }}>
              {forgotStep > 2 ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              ) : '2'}
            </div>

            {/* Line 2 -> 3 */}
            <div style={{
              flex: 1,
              height: '2px',
              background: forgotStep >= 3 ? '#10b981' : '#e2e8f0',
              transition: 'background 0.3s ease'
            }} />

            {/* Step 3 Circle */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              background: forgotStep === 3 ? 'var(--primary, #ff7a00)' : '#f1f5f9',
              color: forgotStep === 3 ? '#ffffff' : '#94a3b8',
              zIndex: 2,
              transition: 'all 0.3s ease',
              boxShadow: forgotStep === 3 ? '0 2px 6px rgba(255, 122, 0, 0.35)' : 'none'
            }}>
              3
            </div>
          </div>

          {/* STEP 1: Enter Phone Number / Email */}
          {forgotStep === 1 && (
            <div>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light, #fff0e6)', color: 'var(--primary, #ff7a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Forgot Password?
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Enter your registered phone number or email to receive a 4-digit verification code.
              </p>

              <form onSubmit={handleSendForgotOtp} noValidate>
                <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Phone Number or Email
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => {
                      setForgotIdentifier(e.target.value);
                      if (forgotErrors.identifier) setForgotErrors(prev => ({ ...prev, identifier: '' }));
                    }}
                    placeholder="e.g. +91 9744110421 or user@example.com"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: forgotErrors.identifier ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {forgotErrors.identifier && (
                    <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {forgotErrors.identifier}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--orange-gradient, linear-gradient(135deg, #ff7a00 0%, #f03514 100%))',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.7 : 1,
                    marginBottom: '10px',
                    boxShadow: '0 3px 10px rgba(255, 122, 0, 0.28)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 5px 14px rgba(255, 122, 0, 0.38)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(255, 122, 0, 0.28)';
                    }
                  }}
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>

                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    margin: '0 auto',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <span>←</span> Back to Sign In
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Verify OTP (Image 1 & 2) */}
          {forgotStep === 2 && (
            <div>
              {/* Circular Shield with Checkmark Icon */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light, #fff0e6)', color: 'var(--primary, #ff7a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Verify OTP
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Enter the 4-digit OTP sent to <strong style={{ color: '#0f172a' }}>{forgotIdentifier}</strong>
              </p>

              <form onSubmit={handleVerifyOtpSubmit} noValidate>
                <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    One-Time Password
                  </label>

                  {/* 4-Box Inputs */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-start', margin: '4px 0 8px 0' }}>
                    {[0, 1, 2, 3].map((idx) => {
                      const isFocused = activeBoxFocus.field === 'otp' && activeBoxFocus.index === idx;
                      const isNextEmpty = !otpDigits[idx] && idx === otpDigits.findIndex(d => !d);
                      const isHighlighted = isFocused || isNextEmpty;
                      return (
                        <input
                          key={idx}
                          ref={otpInputRefs[idx]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={otpDigits[idx]}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={handleOtpPaste}
                          onFocus={() => setActiveBoxFocus({ field: 'otp', index: idx })}
                          onBlur={() => setActiveBoxFocus({ field: '', index: -1 })}
                          style={{
                            width: '42px',
                            height: '42px',
                            textAlign: 'center',
                            fontSize: '18px',
                            fontWeight: 800,
                            borderRadius: '8px',
                            border: isHighlighted
                              ? '2px solid var(--primary, #ff7a00)'
                              : (forgotErrors.otp ? '1.5px solid #ef4444' : '1px solid #e2e8f0'),
                            boxShadow: isFocused ? '0 0 0 3px var(--primary-light, #fff0e6)' : 'none',
                            background: isFocused ? '#ffffff' : '#faf7f5',
                            color: '#0f172a',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      );
                    })}
                  </div>

                  {forgotErrors.otp && (
                    <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px', display: 'block', fontWeight: 600 }}>
                      {forgotErrors.otp}
                    </span>
                  )}
                </div>

                {/* Resend Timer */}
                <div style={{ textAlign: 'center', margin: '6px 0 14px 0' }}>
                  {resendCountdown > 0 ? (
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                      Resend OTP in {resendCountdown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={forgotLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary, #ff7a00)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--orange-gradient, linear-gradient(135deg, #ff7a00 0%, #f03514 100%))',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.7 : 1,
                    marginBottom: '10px',
                    boxShadow: '0 3px 10px rgba(255, 122, 0, 0.28)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 5px 14px rgba(255, 122, 0, 0.38)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(255, 122, 0, 0.28)';
                    }
                  }}
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    <span>←</span> {String(forgotIdentifier).includes('@') ? 'Change email' : 'Change phone number'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToSignIn}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    <span>←</span> Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Set New PIN (Image 3) */}
          {forgotStep === 3 && (
            <div>
              {/* Circular Key Icon */}
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light, #fff0e6)', color: 'var(--primary, #ff7a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7.5" cy="15.5" r="5.5" />
                  <path d="m21 2-9.6 9.6" />
                  <path d="m15.5 7.5 3 3L22 7l-3-3" />
                </svg>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                Set New PIN
              </h3>
              <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                Choose a strong 4-digit PIN for your account.
              </p>

              <form onSubmit={handleResetPinSubmit} noValidate>
                {/* New PIN */}
                <div style={{ textAlign: 'left', marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    New PIN
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[0, 1, 2, 3].map((idx) => {
                        const isFocused = activeBoxFocus.field === 'new' && activeBoxFocus.index === idx;
                        const isNextEmpty = !newPinDigits[idx] && idx === newPinDigits.findIndex(d => !d);
                        const isHighlighted = isFocused || isNextEmpty;
                        return (
                          <input
                            key={idx}
                            ref={newPinRefs[idx]}
                            type={showNewPin ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={1}
                            value={newPinDigits[idx]}
                            onChange={(e) => handlePinDigitChange('new', idx, e.target.value)}
                            onKeyDown={(e) => handlePinKeyDown('new', idx, e)}
                            onPaste={(e) => handlePinPaste('new', e)}
                            onFocus={() => setActiveBoxFocus({ field: 'new', index: idx })}
                            onBlur={() => setActiveBoxFocus({ field: '', index: -1 })}
                            style={{
                              width: '42px',
                              height: '42px',
                              textAlign: 'center',
                              fontSize: showNewPin ? '18px' : '22px',
                              fontWeight: 800,
                              borderRadius: '8px',
                              border: isHighlighted
                                ? '2px solid var(--primary, #ff7a00)'
                                : (forgotErrors.pin ? '1.5px solid #ef4444' : '1px solid #e2e8f0'),
                              boxShadow: isFocused ? '0 0 0 3px var(--primary-light, #fff0e6)' : 'none',
                              background: isFocused ? '#ffffff' : '#faf7f5',
                              color: '#0f172a',
                              outline: 'none',
                              boxSizing: 'border-box',
                              transition: 'all 0.15s ease'
                            }}
                          />
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowNewPin(!showNewPin)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s ease'
                      }}
                      title={showNewPin ? "Hide PIN" : "Show PIN"}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      {showNewPin ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm PIN */}
                <div style={{ textAlign: 'left', marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '5px' }}>
                    Confirm PIN
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[0, 1, 2, 3].map((idx) => {
                        const isFocused = activeBoxFocus.field === 'confirm' && activeBoxFocus.index === idx;
                        return (
                          <input
                            key={idx}
                            ref={confirmPinRefs[idx]}
                            type={showConfirmPin ? 'text' : 'password'}
                            inputMode="numeric"
                            maxLength={1}
                            value={confirmPinDigits[idx]}
                            onChange={(e) => handlePinDigitChange('confirm', idx, e.target.value)}
                            onKeyDown={(e) => handlePinKeyDown('confirm', idx, e)}
                            onPaste={(e) => handlePinPaste('confirm', e)}
                            onFocus={() => setActiveBoxFocus({ field: 'confirm', index: idx })}
                            onBlur={() => setActiveBoxFocus({ field: '', index: -1 })}
                            style={{
                              width: '42px',
                              height: '42px',
                              textAlign: 'center',
                              fontSize: showConfirmPin ? '18px' : '22px',
                              fontWeight: 800,
                              borderRadius: '8px',
                              border: isFocused
                                ? '2px solid var(--primary, #ff7a00)'
                                : (forgotErrors.pin ? '1.5px solid #ef4444' : '1px solid #e2e8f0'),
                              boxShadow: isFocused ? '0 0 0 3px var(--primary-light, #fff0e6)' : 'none',
                              background: isFocused ? '#ffffff' : '#faf7f5',
                              color: '#0f172a',
                              outline: 'none',
                              boxSizing: 'border-box',
                              transition: 'all 0.15s ease'
                            }}
                          />
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.15s ease'
                      }}
                      title={showConfirmPin ? "Hide PIN" : "Show PIN"}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                    >
                      {showConfirmPin ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {forgotErrors.pin && (
                    <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                      {forgotErrors.pin}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--orange-gradient, linear-gradient(135deg, #ff7a00 0%, #f03514 100%))',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.7 : 1,
                    marginBottom: '10px',
                    boxShadow: '0 3px 10px rgba(255, 122, 0, 0.28)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 5px 14px rgba(255, 122, 0, 0.38)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 3px 10px rgba(255, 122, 0, 0.28)';
                    }
                  }}
                >
                  {forgotLoading ? 'Resetting PIN...' : 'Reset PIN'}
                </button>

                <button
                  type="button"
                  onClick={handleBackToSignIn}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    margin: '0 auto',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  <span>←</span> Back to Sign In
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
