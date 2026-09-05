// Helper functions for custom form validation and input sanitization across all modules

// Sanitize name fields (Letters & spaces only)
export const sanitizeName = (value = '') => {
  return value.replace(/[^a-zA-Z\s]/g, '');
};

// Sanitize mobile numbers (Digits only, max 10 chars)
export const sanitizeMobile = (value = '') => {
  const digitsOnly = value.replace(/[^0-9]/g, '');
  return digitsOnly.slice(0, 10);
};

// Validate name (Letters and spaces only, min 2 chars)
export const validateName = (name = '') => {
  if (!name.trim()) return 'Name is required';
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return 'Name must contain letters only (no numbers or special characters)';
  }
  return '';
};

// Validate mobile number (Exactly 10 digits)
export const validateMobile = (mobile = '') => {
  if (!mobile) return 'Mobile number is required';
  const mobileRegex = /^[0-9]{10}$/;
  if (!mobileRegex.test(mobile)) {
    return 'Mobile number must be exactly 10 digits (numbers only)';
  }
  return '';
};

// Validate email format
export const validateEmail = (email = '') => {
  if (!email.trim()) return 'Email address is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. name@domain.com)';
  }
  return '';
};

// Validate generic required field
export const validateRequired = (val = '', fieldName = 'Field') => {
  if (val === null || val === undefined || String(val).trim() === '') {
    return `${fieldName} is required`;
  }
  return '';
};

// Validate 6-digit Indian pincode
export const validatePincode = (pincode = '') => {
  const pin = String(pincode || '').trim();
  if (!pin) return 'Pincode is required';
  if (!/^[0-9]{6}$/.test(pin)) {
    return 'Pincode must be exactly 6 digits';
  }
  return '';
};

// Validate branch name (alphanumeric, spaces, and standard business symbols)
export const validateBranchName = (name = '') => {
  const val = String(name || '').trim();
  if (!val) return 'Branch Name is required';
  if (val.length < 2) return 'Branch Name must be at least 2 characters';
  if (!/^[a-zA-Z0-9\s.,&'/#()-]+$/.test(val)) {
    return 'Branch Name contains invalid special characters';
  }
  return '';
};

// Validate branch code (alphanumeric with hyphens/underscores)
export const validateBranchCode = (code = '') => {
  const val = String(code || '').trim();
  if (!val) return 'Branch Code is required';
  if (val.length < 2) return 'Branch Code must be at least 2 characters';
  if (!/^[A-Za-z0-9_-]+$/.test(val)) {
    return 'Branch Code can only contain letters, numbers, hyphens (-), and underscores (_)';
  }
  return '';
};

// Validate password format (e.g. Nivetha@123)
// Requires: at least 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character
export const validatePassword = (password = '', fieldName = 'Password') => {
  const val = String(password || '').trim();
  if (!val) return `${fieldName} is required`;
  if (val.length < 8) {
    return `${fieldName} must be at least 8 characters long`;
  }
  if (!/[A-Z]/.test(val)) {
    return `${fieldName} must contain at least one uppercase letter (A-Z)`;
  }
  if (!/[a-z]/.test(val)) {
    return `${fieldName} must contain at least one lowercase letter (a-z)`;
  }
  if (!/\d/.test(val)) {
    return `${fieldName} must contain at least one number (0-9)`;
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_+=\/\\~]/.test(val)) {
    return `${fieldName} must contain at least one special character (@, #, $, %)`;
  }
  return '';
};

export const isStrongPassword = (password = '') => {
  return !validatePassword(password);
};
