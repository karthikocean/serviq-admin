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
