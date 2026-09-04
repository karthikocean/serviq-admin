import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAppState } from '../config/AppContext';
import AuthApi from '../api/Auth';
import ShowNotifications from '../helper/ShowNotifications';
import { Modal } from '../components/Modal';
import { validatePassword, isStrongPassword } from '../helper/ValidationHelper';

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


const PhoneIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const ShieldCheckIcon = ({ size = 22, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const KeyIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const ArrowLeftIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function Login() {
  const { login, currentUser } = useAppState();
  const navigate = useNavigate();
  const [role] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInPinDigits, setSignInPinDigits] = useState(['', '', '', '']);
  const signInPinRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
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
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSignInPinDigitChange = (index, value) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...signInPinDigits];
    newDigits[index] = clean;
    setSignInPinDigits(newDigits);
    const pinStr = newDigits.join('');
    setPassword(pinStr);
    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: false, passwordMsg: '' }));
    if (clean && index < signInPinDigits.length - 1) {
      signInPinRefs[index + 1]?.current?.focus();
    }
  };

  const handleSignInPinKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!signInPinDigits[index] && index > 0) {
        signInPinRefs[index - 1]?.current?.focus();
        const newDigits = [...signInPinDigits];
        newDigits[index - 1] = '';
        setSignInPinDigits(newDigits);
        setPassword(newDigits.join(''));
      } else {
        const newDigits = [...signInPinDigits];
        newDigits[index] = '';
        setSignInPinDigits(newDigits);
        setPassword(newDigits.join(''));
      }
      if (formErrors.password) setFormErrors(prev => ({ ...prev, password: false, passwordMsg: '' }));
    } else if (e.key === 'ArrowLeft' && index > 0) {
      signInPinRefs[index - 1]?.current?.focus();
    } else if (e.key === 'ArrowRight' && index < signInPinDigits.length - 1) {
      signInPinRefs[index + 1]?.current?.focus();
    }
  };

  const handleSignInPinPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim().slice(0, 4);
    if (pasted) {
      const newDigits = ['', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setSignInPinDigits(newDigits);
      setPassword(newDigits.join(''));
      if (formErrors.password) setFormErrors(prev => ({ ...prev, password: false, passwordMsg: '' }));
      const nextIdx = Math.min(pasted.length, 3);
      signInPinRefs[nextIdx]?.current?.focus();
    }
  };

  const validate = () => {
    const emailTrimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailEmpty = !emailTrimmed;
    const isPasswordEmpty = !password || !password.trim();
    const isEmailValid = Boolean(emailTrimmed && emailRegex.test(emailTrimmed));
    const isPasswordValid = Boolean(password && password.trim().length >= 4);

    if (isEmailEmpty && isPasswordEmpty) {
      setFormErrors({ email: true, password: true, passwordMsg: 'Please enter your password' });
      return false;
    }

    if (!isEmailValid && !isPasswordValid) {
      setFormErrors({ email: true, password: true, passwordMsg: 'Please enter your password' });
      return false;
    }

    if (!isEmailValid) {
      setFormErrors({ email: true, password: false, passwordMsg: '' });
      return false;
    }

    if (!isPasswordValid) {
      setFormErrors({ email: false, password: true, passwordMsg: 'Password must be at least 4 characters' });
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
        
        if (rawErr.includes('mail') || rawErr.includes('user not found') || rawErr.includes('user does not exist') || rawErr.includes('no user') || rawErr.includes('not registered')) {
          setFormErrors({ email: true, password: false, passwordMsg: '' });
        } else if (rawErr.includes('password') || rawErr.includes('incorrect') || rawErr.includes('wrong') || rawErr.includes('mismatch') || rawErr.includes('invalid credential') || rawErr.includes('invalid password')) {
          setFormErrors({ email: false, password: true, passwordMsg: 'Incorrect password. Please check and try again.' });
        } else {
          setFormErrors({ email: true, password: true, passwordMsg: 'Incorrect password. Please check and try again.' });
        }
      }
    } catch (err) {
      const rawErr = String(err.message || '').toLowerCase();
      if (rawErr.includes('mail') || rawErr.includes('user not found') || rawErr.includes('user does not exist')) {
        setFormErrors({ email: true, password: false, passwordMsg: '' });
      } else if (rawErr.includes('password') || rawErr.includes('incorrect') || rawErr.includes('wrong') || rawErr.includes('invalid')) {
        setFormErrors({ email: false, password: true, passwordMsg: 'Incorrect password. Please check and try again.' });
      } else {
        setFormErrors({ email: true, password: true, passwordMsg: 'Incorrect password. Please check and try again.' });
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
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
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
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      const errMsg = err?.message || 'Failed to verify OTP. Please try again.';
      setForgotErrors({ otp: errMsg });
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

  const isPasswordRulesMet = (pass) => {
    const p = String(pass || '');
    return /[A-Z]/.test(p) && /\d/.test(p) && p.length >= 8 && /[!@#$%^&*(),.?":{}|<>\-_+=\/\\~]/.test(p);
  };

  const handleResetPasswordSubmit = async (e) => {
    if (e) e.preventDefault();
    const cleanNewPass = String(newPassword || '').trim();
    const cleanConfirmPass = String(confirmPassword || '').trim();

    if (!cleanNewPass || !isPasswordRulesMet(cleanNewPass)) {
      setForgotErrors({ newPassword: 'Please fill following instruction' });
      return;
    }

    if (!cleanConfirmPass) {
      setForgotErrors({ confirmPassword: 'Confirm Password is required.' });
      return;
    }

    if (cleanNewPass !== cleanConfirmPass) {
      setForgotErrors({ confirmPassword: 'Passwords do not match. Please try again.' });
      return;
    }

    setForgotErrors({});
    setForgotLoading(true);

    try {
      const res = await AuthApi.resetPassword({
        email: forgotIdentifier.trim(),
        otp: otpDigits.join('').trim(),
        password: newPassword.trim()
      });

      if (res && (res.status === true || res.response?.success === true)) {
        triggerToast('Password reset successfully');
        ShowNotifications.showAlertNotification(res.message || 'Password reset successfully! You can now sign in.', true);
        if (String(forgotIdentifier).includes('@')) {
          setEmail(forgotIdentifier.trim());
        }
        setPassword(newPassword.trim());
        setIsForgotMode(false);
        setForgotStep(1);
      } else {
        const errMsg = res?.message || 'Failed to reset password. Please try again.';
        setForgotErrors({ newPassword: errMsg });
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      const errMsg = err?.message || 'An unexpected error occurred. Please try again.';
      setForgotErrors({ newPassword: errMsg });
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
          top: '28px',
          right: '28px',
          background: '#e2e8f0',
          border: '1px solid #cbd5e1',
          color: '#1e293b',
          padding: '12px 22px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          zIndex: 9999,
          fontSize: '13.5px',
          fontWeight: 600
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: '2px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
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
            {/* Email Address */}
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '16px' }}>
              <label htmlFor="login-email" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: formErrors.email ? '#dc2626' : '#db2777' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <input 
                  type="email" 
                  id="login-email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formErrors.email) setFormErrors(prev => ({ ...prev, email: false }));
                  }}
                  placeholder="Enter your email" 
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 40px',
                    borderRadius: '10px',
                    border: formErrors.email ? '1.5px solid #dc2626' : '1px solid #dbeafe',
                    background: '#eff6ff',
                    color: '#1e293b',
                    fontSize: '0.92rem',
                    fontWeight: '500',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary, #ff7a00)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.15)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    if (!formErrors.email) {
                      e.target.style.borderColor = '#dbeafe';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#eff6ff';
                    }
                  }}
                />
              </div>
              {formErrors.email && (
                <span style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  Enter a valid email address
                </span>
              )}
            </div>
            
            {/* Password Section */}
            <div className="form-group" style={{ textAlign: 'left', marginBottom: '10px' }}>
              <label htmlFor="login-password" style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: formErrors.password ? '#dc2626' : '#db2777' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="login-password" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors(prev => ({ ...prev, password: false, passwordMsg: '' }));
                  }}
                  placeholder="Enter your password" 
                  style={{
                    width: '100%',
                    padding: '11px 42px 11px 40px',
                    borderRadius: '10px',
                    border: formErrors.password ? '1.5px solid #dc2626' : '1px solid #dbeafe',
                    background: '#eff6ff',
                    color: '#1e293b',
                    fontSize: '0.92rem',
                    fontWeight: '500',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--primary, #ff7a00)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.15)';
                    e.target.style.background = '#ffffff';
                  }}
                  onBlur={(e) => {
                    if (!formErrors.password) {
                      e.target.style.borderColor = '#dbeafe';
                      e.target.style.boxShadow = 'none';
                      e.target.style.background = '#eff6ff';
                    }
                  }}
                />
                <button
                  type="button"
                  id="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    transition: 'color 0.15s ease'
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
              {formErrors.password && (
                <span style={{ color: '#dc2626', fontSize: '0.72rem', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.passwordMsg || 'Incorrect password. Please try again.'}
                </span>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-row-remember" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <label className="checkbox-container" style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: '#c2410c',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Forgot Password?
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 18px',
                borderRadius: '10px',
                border: 'none',
                background: '#c2410c',
                color: '#ffffff',
                fontSize: '0.95rem',
                fontWeight: '700',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.75 : 1,
                boxShadow: '0 3px 12px rgba(194, 65, 12, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#9a3412';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = '#c2410c';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
              Powered by Serviq
            </div>
          </form>
        </div>
      )}

      {/* 2. FORGOT PASSWORD FLOW CARD (Matches 3-Step UI) */}
      {isForgotMode && (
        <div
          className="login-card"
          style={{
            maxWidth: '420px',
            padding: '38px 30px',
            borderRadius: '24px',
            background: '#ffffff',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
            <img
              src="/serviqlogo.png"
              alt="Serviq Logo"
              style={{ height: '52px', maxWidth: '180px', objectFit: 'contain' }}
            />
          </div>

          {/* Stepper Header (1 ----- 2 ----- 3) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 22px auto',
              width: '210px'
            }}
          >
            {/* Step 1 Circle */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                background: forgotStep > 1 ? '#10b981' : 'var(--primary, #ff7a00)',
                color: '#ffffff',
                zIndex: 2,
                flexShrink: 0,
                transition: 'all 0.3s ease',
                boxShadow: forgotStep === 1 ? '0 2px 8px rgba(255, 122, 0, 0.4)' : (forgotStep > 1 ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none')
              }}
            >
              {forgotStep > 1 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : '1'}
            </div>

            {/* Line 1 -> 2 */}
            <div
              style={{
                flex: 1,
                height: '2px',
                background: forgotStep >= 2 ? '#10b981' : '#e2e8f0',
                transition: 'background 0.3s ease'
              }}
            />

            {/* Step 2 Circle */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                background: forgotStep > 2 ? '#10b981' : (forgotStep === 2 ? 'var(--primary, #ff7a00)' : '#e2e8f0'),
                color: forgotStep >= 2 ? '#ffffff' : '#94a3b8',
                zIndex: 2,
                flexShrink: 0,
                transition: 'all 0.3s ease',
                boxShadow: forgotStep === 2 ? '0 2px 8px rgba(255, 122, 0, 0.4)' : (forgotStep > 2 ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none')
              }}
            >
              {forgotStep > 2 ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : '2'}
            </div>

            {/* Line 2 -> 3 */}
            <div
              style={{
                flex: 1,
                height: '2px',
                background: forgotStep >= 3 ? '#10b981' : '#e2e8f0',
                transition: 'background 0.3s ease'
              }}
            />

            {/* Step 3 Circle */}
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                background: forgotStep === 3 ? 'var(--primary, #ff7a00)' : '#e2e8f0',
                color: forgotStep === 3 ? '#ffffff' : '#94a3b8',
                zIndex: 2,
                flexShrink: 0,
                transition: 'all 0.3s ease',
                boxShadow: forgotStep === 3 ? '0 2px 8px rgba(255, 122, 0, 0.4)' : 'none'
              }}
            >
              3
            </div>
          </div>

          {/* STEP 1: Enter Phone Number / Email (Image 2) */}
          {forgotStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', textAlign: 'center', letterSpacing: '-0.3px' }}>
                Forgot PIN?
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 22px 0', lineHeight: 1.45, textAlign: 'center' }}>
                Enter your registered phone number. We'll send an OTP to verify your identity.
              </p>

              <form onSubmit={handleSendForgotOtp} noValidate style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ textAlign: 'left', marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '13px', color: forgotErrors.identifier ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                      <PhoneIcon size={17} color={forgotErrors.identifier ? '#ef4444' : '#64748b'} />
                    </span>
                    <input
                      type="text"
                      value={forgotIdentifier}
                      onChange={(e) => {
                        setForgotIdentifier(e.target.value);
                        if (forgotErrors.identifier) setForgotErrors(prev => ({ ...prev, identifier: '' }));
                      }}
                      placeholder="Enter Phone Number or Email"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        borderRadius: '10px',
                        border: forgotErrors.identifier ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1e293b',
                        background: '#fbf9f6',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--primary, #ff7a00)';
                        e.target.style.boxShadow = '0 0 0 3px var(--primary-light, #fff0e6)';
                        e.target.style.background = '#ffffff';
                      }}
                      onBlur={(e) => {
                        if (!forgotErrors.identifier) {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#fbf9f6';
                        }
                      }}
                    />
                  </div>
                  {forgotErrors.identifier && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block', fontWeight: 600 }}>
                      {forgotErrors.identifier}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary, #ff7a00)',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.75 : 1,
                    marginBottom: '18px',
                    boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.background = 'var(--primary-hover, #f03514)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 122, 0, 0.45)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.background = 'var(--primary, #ff7a00)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 122, 0, 0.35)';
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  {forgotLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send OTP</span>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleBackToSignIn}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    <ArrowLeftIcon size={14} /> Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Verify OTP (Image 3) */}
          {forgotStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {/* Circular Shield with Checkmark Icon */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--primary-light, #fff0e6)',
                  color: 'var(--primary, #ff7a00)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.15)'
                }}
              >
                <ShieldCheckIcon size={22} color="var(--primary, #ff7a00)" />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: '0 0 6px 0', textAlign: 'center', letterSpacing: '-0.3px' }}>
                Verify OTP
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.45, textAlign: 'center' }}>
                Enter the 4-digit OTP sent to <strong style={{ color: '#1e293b' }}>{forgotIdentifier}</strong>
              </p>

              <form onSubmit={handleVerifyOtpSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                    One-Time Password
                  </label>

                  {/* 4-Box Inputs Horizontally Centered */}
                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', alignItems: 'center', margin: '6px 0 10px 0' }}>
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
                            width: '52px',
                            height: '52px',
                            textAlign: 'center',
                            fontSize: '22px',
                            fontWeight: 800,
                            borderRadius: '12px',
                            border: isHighlighted
                              ? '2px solid var(--primary, #ff7a00)'
                              : (forgotErrors.otp ? '1.5px solid #ef4444' : '1.5px solid #e2e8f0'),
                            boxShadow: isFocused ? '0 0 0 3.5px var(--primary-light, #fff0e6)' : 'none',
                            background: isFocused ? '#ffffff' : '#fbf9f6',
                            color: '#1e293b',
                            outline: 'none',
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      );
                    })}
                  </div>

                  {forgotErrors.otp && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600, textAlign: 'center' }}>
                      {forgotErrors.otp}
                    </span>
                  )}
                </div>

                {/* Resend Timer */}
                <div style={{ textAlign: 'center', margin: '4px 0 18px 0' }}>
                  {resendCountdown > 0 ? (
                    <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>
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
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 6px',
                        textDecoration: 'underline',
                        textUnderlineOffset: '3px'
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
                    padding: '13px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'var(--primary, #ff7a00)',
                    color: '#ffffff',
                    fontSize: '14.5px',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.75 : 1,
                    marginBottom: '16px',
                    boxShadow: '0 4px 14px rgba(255, 122, 0, 0.35)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.background = 'var(--primary-hover, #f03514)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(255, 122, 0, 0.45)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!forgotLoading) {
                      e.currentTarget.style.background = 'var(--primary, #ff7a00)';
                      e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 122, 0, 0.35)';
                      e.currentTarget.style.transform = 'none';
                    }
                  }}
                >
                  {forgotLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify OTP</span>
                  )}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'color 0.2s ease',
                      padding: '3px 6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                  </button>

                  <button
                    type="button"
                    onClick={handleBackToSignIn}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'color 0.2s ease',
                      padding: '3px 6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    <ArrowLeftIcon size={13} /> Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Set New Password */}
          {forgotStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
              {/* Circular Key Icon */}
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--primary-light, #fff0e6)',
                  color: 'var(--primary, #ff7a00)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 2px 8px rgba(255, 122, 0, 0.15)'
                }}
              >
                <KeyIcon size={22} color="var(--primary, #ff7a00)" />
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1e293b', margin: '0 0 18px 0', textAlign: 'center', letterSpacing: '-0.3px' }}>
                Set New Password
              </h2>

              <form onSubmit={handleResetPasswordSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {/* New Password */}
                <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Enter a password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: forgotErrors.newPassword ? '#dc2626' : '#db2777' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (forgotErrors.newPassword) setForgotErrors((prev) => ({ ...prev, newPassword: '' }));
                      }}
                      placeholder="••••••••••••"
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        borderRadius: '10px',
                        border: forgotErrors.newPassword ? '1.5px solid #ef4444' : (isPasswordRulesMet(newPassword) ? '1.5px solid #10b981' : '1px solid #dbeafe'),
                        background: '#eff6ff',
                        color: '#1e293b',
                        fontSize: '0.92rem',
                        fontWeight: '500',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = isPasswordRulesMet(newPassword) ? '#10b981' : 'var(--primary, #ff7a00)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.15)';
                        e.target.style.background = '#ffffff';
                      }}
                      onBlur={(e) => {
                        if (!forgotErrors.newPassword) {
                          e.target.style.borderColor = isPasswordRulesMet(newPassword) ? '#10b981' : '#dbeafe';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#eff6ff';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        transition: 'color 0.15s ease'
                      }}
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {forgotErrors.newPassword && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block', fontWeight: 600 }}>
                      {forgotErrors.newPassword}
                    </span>
                  )}

                  {/* Real-time Password Rules Checklist (matching user reference) */}
                  <div style={{
                    marginTop: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    textAlign: 'left'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: /[A-Z]/.test(newPassword) ? '#dcfce7' : 'transparent',
                        color: /[A-Z]/.test(newPassword) ? '#15803d' : '#64748b',
                        transition: 'all 0.15s ease'
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '13px' }}>{/[A-Z]/.test(newPassword) ? '✓' : '•'}</span>
                        Must have one capital letter
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: /\d/.test(newPassword) ? '#dcfce7' : 'transparent',
                        color: /\d/.test(newPassword) ? '#15803d' : '#64748b',
                        transition: 'all 0.15s ease'
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '13px' }}>{/\d/.test(newPassword) ? '✓' : '•'}</span>
                        Must have a number digit
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: newPassword.length >= 8 ? '#dcfce7' : 'transparent',
                        color: newPassword.length >= 8 ? '#15803d' : '#64748b',
                        transition: 'all 0.15s ease'
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '13px' }}>{newPassword.length >= 8 ? '✓' : '•'}</span>
                        Must be at least 8 characters long
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: /[!@#$%^&*(),.?":{}|<>\-_+=\/\\~]/.test(newPassword) ? '#dcfce7' : 'transparent',
                        color: /[!@#$%^&*(),.?":{}|<>\-_+=\/\\~]/.test(newPassword) ? '#15803d' : '#64748b',
                        transition: 'all 0.15s ease'
                      }}>
                        <span style={{ fontWeight: 800, fontSize: '13px' }}>{/[!@#$%^&*(),.?":{}|<>\-_+=\/\\~]/.test(newPassword) ? '✓' : '•'}</span>
                        Must have a special character (@, #, $, %)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Password */}
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', pointerEvents: 'none', color: forgotErrors.confirmPassword ? '#ef4444' : '#db2777' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="11" x="3" y="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (forgotErrors.confirmPassword) setForgotErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }}
                      placeholder="••••••••••••"
                      style={{
                        width: '100%',
                        padding: '11px 42px 11px 40px',
                        borderRadius: '10px',
                        border: forgotErrors.confirmPassword ? '1.5px solid #ef4444' : '1px solid #dbeafe',
                        background: '#eff6ff',
                        color: '#1e293b',
                        fontSize: '0.92rem',
                        fontWeight: '500',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--primary, #ff7a00)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(255, 122, 0, 0.15)';
                        e.target.style.background = '#ffffff';
                      }}
                      onBlur={(e) => {
                        if (!forgotErrors.confirmPassword) {
                          e.target.style.borderColor = '#dbeafe';
                          e.target.style.boxShadow = 'none';
                          e.target.style.background = '#eff6ff';
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        transition: 'color 0.15s ease'
                      }}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {forgotErrors.confirmPassword && (
                    <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px', display: 'block', fontWeight: 600 }}>
                      {forgotErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  style={{
                    width: '100%',
                    padding: '13px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isPasswordRulesMet(newPassword) ? '#2563eb' : '#c2410c',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: forgotLoading ? 'not-allowed' : 'pointer',
                    opacity: forgotLoading ? 0.75 : 1,
                    marginBottom: '16px',
                    boxShadow: isPasswordRulesMet(newPassword) ? '0 4px 14px rgba(37, 99, 235, 0.35)' : '0 3px 12px rgba(194, 65, 12, 0.25)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!forgotLoading) e.currentTarget.style.background = isPasswordRulesMet(newPassword) ? '#1e40af' : '#9a3412';
                  }}
                  onMouseLeave={(e) => {
                    if (!forgotLoading) e.currentTarget.style.background = isPasswordRulesMet(newPassword) ? '#2563eb' : '#c2410c';
                  }}
                >
                  {forgotLoading ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite'
                      }} />
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <span>{isPasswordRulesMet(newPassword) ? 'Password Validated' : 'Reset Password'}</span>
                  )}
                </button>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={handleBackToSignIn}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 8px',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary, #ff7a00)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  >
                    <ArrowLeftIcon size={14} /> Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
