import React from 'react';

const CheckIcon = ({ size = 15, color = '#15803d' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CrossIcon = ({ size = 15, color = '#dc2626' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const validatePasswordRules = (password = '') => {
  const p = String(password || '');
  const hasLower = /[a-z]/.test(p);
  const hasUpper = /[A-Z]/.test(p);
  const hasNumber = /\d/.test(p);
  const hasMinLength = p.length >= 8;
  return {
    hasLower,
    hasUpper,
    hasNumber,
    hasMinLength,
    isValid: hasLower && hasUpper && hasNumber && hasMinLength
  };
};

export default function PasswordRequirements({
  password = '',
  confirmPassword = null,
  showConfirmMatch = false,
  style = {}
}) {
  const { hasLower, hasUpper, hasNumber, hasMinLength } = validatePasswordRules(password);

  const rules = [
    {
      id: 'lower',
      valid: hasLower,
      text: <span>At least <strong>one lowercase letter</strong></span>
    },
    {
      id: 'upper',
      valid: hasUpper,
      text: <span>At least <strong>one uppercase letter</strong></span>
    },
    {
      id: 'number',
      valid: hasNumber,
      text: <span>At least <strong>one number</strong></span>
    },
    {
      id: 'length',
      valid: hasMinLength,
      text: <span>Minimum <strong>8 characters</strong></span>
    }
  ];

  if (showConfirmMatch && confirmPassword !== null) {
    const isMatch = Boolean(password && confirmPassword && password === confirmPassword);
    rules.push({
      id: 'match',
      valid: isMatch,
      text: <span>Passwords <strong>match</strong></span>
    });
  }

  return (
    <div
      style={{
        marginTop: '10px',
        marginBottom: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        ...style
      }}
    >
      <div
        style={{
          fontSize: '0.8rem',
          fontWeight: '800',
          color: '#0f172a',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          marginBottom: '2px'
        }}
      >
        PASSWORD MUST CONTAIN:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {rules.map((rule) => {
          const color = rule.valid ? '#15803d' : '#dc2626';
          return (
            <div
              key={rule.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                color: color,
                lineHeight: 1.4,
                transition: 'color 0.15s ease'
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  flexShrink: 0
                }}
              >
                {rule.valid ? <CheckIcon size={15} color="#15803d" /> : <CrossIcon size={15} color="#dc2626" />}
              </span>
              <span>{rule.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
