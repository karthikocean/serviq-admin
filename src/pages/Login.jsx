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

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const otpInputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const newPasswordRef = useRef(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotErrors, setForgotErrors] = useState({});
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [forgotOtpHint, setForgotOtpHint] = useState('');

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
  const handleOpenForgotModal = () => {
    setForgotEmail(email.trim());
    setForgotOtp('');
    setOtpDigits(['', '', '', '']);
    setIsOtpVerifying(false);
    setIsOtpVerified(false);
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    setShowForgotNewPassword(false);
    setShowForgotConfirmPassword(false);
    setForgotErrors({});
    setForgotStep(1);
    setResendCountdown(0);
    setForgotOtpHint('');
    setShowForgotModal(true);
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    setForgotErrors({});
  };

  const verifyEnteredOtp = async (code, targetEmail) => {
    const em = (targetEmail || forgotEmail || '').trim();
    if (!code || code.length !== 4 || !em) return;
    setIsOtpVerifying(true);

    try {
      const res = await AuthApi.verifyOtp({ email: em, otp: code.trim() });
      if (res && res.status) {
        setIsOtpVerified(true);
        setForgotErrors((prev) => ({ ...prev, otp: '' }));
        ShowNotifications.showAlertNotification(res.message || 'OTP verified successfully!', true);
        setTimeout(() => {
          newPasswordRef.current?.focus();
        }, 150);
      } else {
        setIsOtpVerified(false);
        const errMsg = res?.message || 'Invalid verification code.';
        setForgotErrors((prev) => ({ ...prev, otp: errMsg }));
        ShowNotifications.showAlertNotification(errMsg, false);
      }
    } catch (err) {
      console.error('Error auto-verifying OTP:', err);
      setIsOtpVerified(false);
    } finally {
      setIsOtpVerifying(false);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    const cleanChar = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);
    const combined = newDigits.join('');
    setForgotOtp(combined);
    setIsOtpVerified(false);
    if (forgotErrors.otp) {
      setForgotErrors((prev) => ({ ...prev, otp: '' }));
    }

    if (cleanChar && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }

    // Automatically trigger verify API when all 4 boxes are entered
    if (combined.length === 4 && !newDigits.some((d) => d === '')) {
      verifyEnteredOtp(combined, forgotEmail);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        otpInputRefs[index - 1].current?.focus();
        const newDigits = [...otpDigits];
        newDigits[index - 1] = '';
        setOtpDigits(newDigits);
        setForgotOtp(newDigits.join(''));
        setIsOtpVerified(false);
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
      const combined = newDigits.join('');
      setForgotOtp(combined);
      setIsOtpVerified(false);
      if (forgotErrors.otp) {
        setForgotErrors((prev) => ({ ...prev, otp: '' }));
      }
      const nextIdx = Math.min(pasted.length, 3);
      otpInputRefs[nextIdx].current?.focus();

      if (combined.length === 4 && !newDigits.some((d) => d === '')) {
        verifyEnteredOtp(combined, forgotEmail);
      }
    }
  };

  const handleSendForgotOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = (forgotEmail || '').trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setForgotErrors({ email: 'Email address is required.' });
      return;
    }
    if (!emailRegex.test(cleanEmail)) {
      setForgotErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setForgotErrors({});
    setForgotLoading(true);

    try {
      const res = await AuthApi.forgotPassword(cleanEmail);
      if (res && res.status) {
        const otpVal = res.otp || res.data?.otp || res.response?.data?.otp;
        const otpMsg = res.data?.message || res.response?.data?.message || res.message;
        if (otpVal || otpMsg) {
          setForgotOtpHint(otpMsg || (otpVal ? `Your OTP for password reset is ${otpVal}` : ''));
          if (otpVal) {
            const sOtp = String(otpVal).slice(0, 4);
            setForgotOtp(sOtp);
            const dArray = sOtp.split('').concat(['', '', '', '']).slice(0, 4);
            setOtpDigits(dArray);
            if (sOtp.length === 4) {
              verifyEnteredOtp(sOtp, cleanEmail);
            }
          } else {
            setForgotOtp('');
            setOtpDigits(['', '', '', '']);
            setIsOtpVerified(false);
          }
        }
        ShowNotifications.showAlertNotification(otpMsg || res.message || 'Verification code sent to your email.', true);
        setForgotStep(2);
        setResendCountdown(60);
      } else {
        // If backend returned error
        const errMsg = res?.message || 'Failed to send verification code. Please check your email and try again.';
        setForgotErrors({ email: errMsg });
        ShowNotifications.showAlertNotification(errMsg, false);
      }
    } catch (err) {
      console.error('Error sending reset OTP:', err);
      setForgotErrors({ email: 'An error occurred. Please try again.' });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0 || forgotLoading) return;
    const cleanEmail = (forgotEmail || '').trim();
    if (!cleanEmail) return;

    setForgotLoading(true);
    try {
      const res = await AuthApi.forgotPassword(cleanEmail);
      if (res && res.status) {
        const otpVal = res.otp || res.data?.otp || res.response?.data?.otp;
        const otpMsg = res.data?.message || res.response?.data?.message || res.message;
        if (otpVal || otpMsg) {
          setForgotOtpHint(otpMsg || (otpVal ? `Your OTP for password reset is ${otpVal}` : ''));
          if (otpVal) {
            const sOtp = String(otpVal).slice(0, 4);
            setForgotOtp(sOtp);
            const dArray = sOtp.split('').concat(['', '', '', '']).slice(0, 4);
            setOtpDigits(dArray);
            if (sOtp.length === 4) {
              verifyEnteredOtp(sOtp, cleanEmail);
            }
          } else {
            setForgotOtp('');
            setOtpDigits(['', '', '', '']);
            setIsOtpVerified(false);
          }
        }
        ShowNotifications.showAlertNotification(otpMsg || 'A new verification code has been sent.', true);
        setResendCountdown(60);
      } else {
        ShowNotifications.showAlertNotification(res?.message || 'Failed to resend code.', false);
      }
    } catch (err) {
      ShowNotifications.showAlertNotification('Failed to resend verification code.', false);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    const errors = {};

    const cleanOtp = (forgotOtp || '').trim();
    if (!cleanOtp) {
      errors.otp = 'Verification code is required.';
    } else if (cleanOtp.length < 4) {
      errors.otp = 'Please enter a valid verification code.';
    }

    if (!forgotNewPassword || !forgotNewPassword.trim()) {
      errors.newPassword = 'New password is required.';
    } else if (forgotNewPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters.';
    }

    if (!forgotConfirmPassword || !forgotConfirmPassword.trim()) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (forgotNewPassword !== forgotConfirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setForgotErrors(errors);
      return;
    }

    setForgotErrors({});
    setForgotLoading(true);

    try {
      const res = await AuthApi.resetPassword({
        email: forgotEmail.trim(),
        otp: cleanOtp,
        password: forgotNewPassword.trim()
      });

      if (res && res.status) {
        ShowNotifications.showAlertNotification(res.message || 'Password reset successfully!', true);
        setForgotStep(3);
      } else {
        const errMsg = res?.message || 'Failed to reset password. Please verify the code and try again.';
        ShowNotifications.showAlertNotification(errMsg, false);
        setForgotErrors({ general: errMsg });
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      const errMsg = err?.message || 'An unexpected error occurred. Please try again.';
      ShowNotifications.showAlertNotification(errMsg, false);
      setForgotErrors({ general: errMsg });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleFinishSuccess = () => {
    setEmail(forgotEmail.trim());
    setPassword('');
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotErrors({});
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
              onClick={handleOpenForgotModal}
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

      {/* Forgot Password Modal Flow */}
      <Modal
        isOpen={showForgotModal}
        onClose={handleCloseForgotModal}
        title={forgotStep === 3 ? "Password Reset Complete" : "Reset Your Password"}
        maxWidth="460px"
      >
        <div style={{ padding: '8px 0' }}>
          {/* Step 1: Enter Email to Receive OTP */}
          {forgotStep === 1 && (
            <form onSubmit={handleSendForgotOtp} noValidate>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(255, 90, 31, 0.1)', color: 'var(--primary, #ff5a1f)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Forgot Your Password?</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  Enter your registered account email address. We will send you a verification code to reset your password.
                </p>
              </div>

              <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Registered Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="input-icon-wrapper" style={{ position: 'relative' }}>
                  <span className="input-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </span>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      if (forgotErrors.email) setForgotErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="e.g. admin@restaurant.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 38px',
                      borderRadius: '8px',
                      border: forgotErrors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                {forgotErrors.email && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block', fontWeight: 600 }}>
                    {forgotErrors.email}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={handleCloseForgotModal}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary, #ff5a1f)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {forgotLoading ? 'Sending Code...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Enter Verification Code & New Password */}
          {forgotStep === 2 && (
            <form onSubmit={handleResetPasswordSubmit} noValidate>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Enter Verification Details</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  A verification code was sent to <strong style={{ color: '#0f172a' }}>{forgotEmail}</strong>.
                </p>
              </div>

              {forgotOtpHint && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔑</span>
                  <span>{forgotOtpHint}</span>
                </div>
              )}

              {forgotErrors.general && (
                <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', fontWeight: 600 }}>
                  {forgotErrors.general}
                </div>
              )}

              {/* 4-Box OTP Code Field */}
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    Verification Code (OTP) <span style={{ color: '#ef4444' }}>*</span>
                    {isOtpVerified && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ✓ Verified
                      </span>
                    )}
                    {isOtpVerifying && (
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>
                        Verifying...
                      </span>
                    )}
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || forgotLoading || isOtpVerifying}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: (resendCountdown > 0 || isOtpVerifying) ? 'default' : 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: (resendCountdown > 0 || isOtpVerifying) ? '#94a3b8' : 'var(--primary, #ff5a1f)',
                      textDecoration: resendCountdown > 0 ? 'none' : 'underline'
                    }}
                  >
                    {resendCountdown > 0 ? `Resend code in ${resendCountdown}s` : 'Resend Code'}
                  </button>
                </div>

                {/* 4-Box Inputs */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '8px 0 6px 0' }}>
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      id={`forgot-otp-box-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={otpDigits[idx]}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      disabled={forgotLoading || isOtpVerifying}
                      autoComplete="off"
                      style={{
                        width: '52px',
                        height: '54px',
                        textAlign: 'center',
                        fontSize: '22px',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        borderRadius: '10px',
                        border: isOtpVerified
                          ? '2px solid #16a34a'
                          : (forgotErrors.otp ? '2px solid #ef4444' : (otpDigits[idx] ? '1.5px solid #ff5a1f' : '1.5px solid #cbd5e1')),
                        background: isOtpVerified ? '#f0fdf4' : (forgotErrors.otp ? '#fef2f2' : '#ffffff'),
                        color: '#0f172a',
                        outline: 'none',
                        boxShadow: isOtpVerified
                          ? '0 0 0 3px rgba(22, 163, 74, 0.12)'
                          : '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'all 0.15s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        if (!isOtpVerified && !forgotErrors.otp) {
                          e.target.style.borderColor = '#ff5a1f';
                          e.target.style.boxShadow = '0 0 0 3px rgba(255, 90, 31, 0.15)';
                        }
                      }}
                      onBlur={(e) => {
                        if (!isOtpVerified && !forgotErrors.otp) {
                          e.target.style.borderColor = otpDigits[idx] ? '#ff5a1f' : '#cbd5e1';
                          e.target.style.boxShadow = 'none';
                        }
                      }}
                    />
                  ))}
                </div>

                {forgotErrors.otp && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', textAlign: 'center', fontWeight: 600 }}>
                    {forgotErrors.otp}
                  </span>
                )}
              </div>

              {/* New Password Field */}
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={newPasswordRef}
                    type={showForgotNewPassword ? 'text' : 'password'}
                    value={forgotNewPassword}
                    onChange={(e) => {
                      setForgotNewPassword(e.target.value);
                      if (forgotErrors.newPassword) setForgotErrors((prev) => ({ ...prev, newPassword: '' }));
                    }}
                    placeholder="Enter new password (min 6 characters)"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 16px',
                      borderRadius: '8px',
                      border: forgotErrors.newPassword ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b'
                    }}
                    title={showForgotNewPassword ? "Hide password" : "Show password"}
                  >
                    {showForgotNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {forgotErrors.newPassword && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {forgotErrors.newPassword}
                  </span>
                )}
              </div>

              {/* Confirm New Password Field */}
              <div className="form-group" style={{ textAlign: 'left', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    value={forgotConfirmPassword}
                    onChange={(e) => {
                      setForgotConfirmPassword(e.target.value);
                      if (forgotErrors.confirmPassword) setForgotErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }}
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 16px',
                      borderRadius: '8px',
                      border: forgotErrors.confirmPassword ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#64748b'
                    }}
                    title={showForgotConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showForgotConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {forgotErrors.confirmPassword && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {forgotErrors.confirmPassword}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--primary, #ff5a1f)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success Confirmation */}
          {forgotStep === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 8px 8px 8px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px auto' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                Password Reset Successfully!
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                Your account password has been updated. You can now sign in to your dashboard with your new password.
              </p>
              <button
                type="button"
                onClick={handleFinishSuccess}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary, #ff5a1f)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign In Now
              </button>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
