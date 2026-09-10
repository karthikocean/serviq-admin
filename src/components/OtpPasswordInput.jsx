import React, { useState, useRef, useEffect } from 'react';

const EyeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

export const OtpPasswordInput = ({
  value = '',
  onChange,
  disabled = false,
  hasError = false,
  idPrefix = 'otp-pass'
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Convert value string into array of 4 digits/characters
  const digits = Array(4).fill('').map((_, i) => (value && value[i]) ? value[i] : '');

  const handleChange = (index, e) => {
    const val = e.target.value;
    const lastChar = val.slice(-1); // Take only last typed char

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const combined = newDigits.join('');

    if (onChange) {
      onChange(combined);
    }

    // Auto focus next box if character typed
    if (lastChar && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // If current box is empty, focus previous and clear it
        inputRefs[index - 1].current?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        if (onChange) onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 4);
    if (pastedData) {
      const newDigits = Array(4).fill('');
      for (let i = 0; i < Math.min(pastedData.length, 4); i++) {
        newDigits[i] = pastedData[i];
      }
      if (onChange) onChange(newDigits.join(''));
      const focusIndex = Math.min(pastedData.length, 3);
      inputRefs[focusIndex].current?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* 4 Box Input Group */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {[0, 1, 2, 3].map((idx) => (
          <input
            key={idx}
            ref={inputRefs[idx]}
            id={`${idPrefix}-${idx}`}
            type={showPassword ? 'text' : 'password'}
            value={digits[idx]}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={disabled}
            maxLength={1}
            name={`${idPrefix}_digit_${idx}`}
            autoComplete="one-time-code"
            style={{
              width: '46px',
              height: '48px',
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: '800',
              borderRadius: '10px',
              border: hasError ? '2px solid #ef4444' : '1.5px solid #cbd5e1',
              backgroundColor: disabled ? '#f8fafc' : '#ffffff',
              color: '#0f172a',
              outline: 'none',
              transition: 'all 0.15s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              fontFamily: 'monospace'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 3px var(--primary-light)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = hasError ? '#ef4444' : '#cbd5e1';
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
            }}
          />
        ))}
      </div>

      {/* Hide / Show Password Eye Icon Toggle */}
      <button
        type="button"
        title={showPassword ? "Hide Password" : "Show Password"}
        onClick={() => setShowPassword(!showPassword)}
        style={{
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          borderRadius: '10px',
          width: '42px',
          height: '48px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: showPassword ? 'var(--primary)' : '#64748b',
          transition: 'all 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e2e8f0';
          e.currentTarget.style.color = '#0f172a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
          e.currentTarget.style.color = showPassword ? 'var(--primary)' : '#64748b';
        }}
      >
        {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
      </button>
    </div>
  );
};
