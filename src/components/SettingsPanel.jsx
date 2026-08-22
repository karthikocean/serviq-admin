import React, { useState, useEffect } from 'react';
import { useAppState } from '../config/AppContext';
import ShowNotifications from '../helper/ShowNotifications.js';
import { apiClient } from '../config/index';
import { sanitizeMobile, validateMobile } from '../helper/ValidationHelper.js';

// Shared Styles
const cardStyle = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '28px',
  border: '1px solid #e2e8f0',
  marginBottom: '20px'
};

const titleStyle = {
  fontSize: '15px',
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: '24px',
  display: 'flex',
  alignItems: 'center',
  marginTop: 0
};

const labelStyle = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#0f172a',
  marginBottom: '8px',
  display: 'block'
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: '8px',
  border: '1.5px solid #e2e8f0',
  fontSize: '13px',
  color: '#334155',
  outline: 'none',
  transition: 'border-color 0.2s ease',
  backgroundColor: '#ffffff',
  boxSizing: 'border-box'
};

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Reusable Input Component (Moved outside to prevent re-rendering issues causing focus loss)
const InputField = ({ label, field, required = false, onChangeOverride, onBlurOverride, formData, formErrors, setFormData, setFormErrors }) => (
  <div>
    <label style={labelStyle}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <input
      type="text"
      maxLength={field === 'phone' ? 10 : undefined}
      inputMode={field === 'phone' ? 'numeric' : undefined}
      placeholder={field === 'phone' ? '10 digit mobile number' : undefined}
      style={{
        ...inputStyle,
        borderColor: formErrors[field] ? '#ef4444' : '#e2e8f0'
      }}
      value={formData[field] || ''}
      onChange={(e) => {
          if (onChangeOverride) {
              onChangeOverride(e);
          } else {
              const val = field === 'phone' ? sanitizeMobile(e.target.value) : e.target.value;
              setFormData({ ...formData, [field]: val });
              if (formErrors[field]) setFormErrors({ ...formErrors, [field]: '' });
          }
      }}
      onBlur={onBlurOverride}
    />
    {formErrors[field] && (
      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
        {formErrors[field]}
      </span>
    )}
  </div>
);

export default function SettingsPanel() {
  const { activeRestaurant, saveRestaurantSettings, darkMode } = useAppState();

  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    email: '',
    phone: '',
    websiteDomain: '',
    address: '',
    city: '',
    state: '',
    country: '',
    fssaiLicense: '',
    gstinNumber: '',
    panNumber: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from API to get all prefilled data
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/settings');
        const data = response.data;
        if (data) {
          setFormData({
            name: data.restaurantName || '',
            ownerName: data.ownerName || '',
            email: data.email || '',
            phone: data.phoneNumber || '',
            websiteDomain: data.websiteDomain || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            fssaiLicense: data.fssaiLicense || '',
            gstinNumber: data.gstinNumber || '',
            panNumber: data.panNumber || ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
        // Fallback to activeRestaurant from context
        if (activeRestaurant) {
          setFormData({
            name: activeRestaurant.name || '',
            ownerName: activeRestaurant.ownerName || '',
            email: activeRestaurant.settings?.email || activeRestaurant.email || '',
            phone: activeRestaurant.settings?.phone || activeRestaurant.phone || '',
            websiteDomain: activeRestaurant.websiteDomain || '',
            address: activeRestaurant.settings?.address || activeRestaurant.address || '',
            city: activeRestaurant.city || '',
            state: activeRestaurant.state || '',
            country: activeRestaurant.country || '',
            fssaiLicense: activeRestaurant.fssaiLicense || '',
            gstinNumber: activeRestaurant.gstinNumber || activeRestaurant.gstNumber || '',
            panNumber: activeRestaurant.panNumber || ''
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, [activeRestaurant]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Restaurant Name is required.';
    if (!formData.ownerName?.trim()) errors.ownerName = 'Owner Name is required.';
    const mobileErr = validateMobile(formData.phone);
    if (mobileErr) errors.phone = mobileErr;
    if (!formData.email?.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.address?.trim()) errors.address = 'Address is required.';
    if (!formData.city?.trim()) errors.city = 'City is required.';
    if (!formData.state?.trim()) errors.state = 'State is required.';
    if (!formData.country?.trim()) errors.country = 'Country is required.';

    if (formData.fssaiLicense && !/^1\d{13}$/.test(formData.fssaiLicense)) {
        errors.fssaiLicense = 'FSSAI License Number must contain exactly 14 digits and start with 1.';
    }

    if (formData.gstinNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(formData.gstinNumber)) {
        errors.gstinNumber = 'Invalid GSTIN. Please enter a valid 15-character GSTIN.';
    }

    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(formData.panNumber)) {
        errors.panNumber = 'Invalid PAN number. Please enter a valid 10-character PAN.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);

    try {
      // Update backend via API
      await apiClient.put('/settings', {
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        websiteDomain: formData.websiteDomain?.trim() || '',
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        gstinNumber: formData.gstinNumber?.trim() || '',
        panNumber: formData.panNumber?.trim() || '',
        fssaiLicense: formData.fssaiLicense?.trim() || ''
      });

      // Also update local context
      saveRestaurantSettings(activeRestaurant.id, {
        name: formData.name.trim(),
        ownerName: formData.ownerName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        websiteDomain: formData.websiteDomain?.trim() || '',
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        gstNumber: formData.gstinNumber?.trim() || '',
        gstinNumber: formData.gstinNumber?.trim() || '',
        panNumber: formData.panNumber?.trim() || '',
        fssaiLicense: formData.fssaiLicense?.trim() || '',
        settings: {
          ...activeRestaurant.settings,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim()
        }
      });
      ShowNotifications.showAlertNotification('Settings saved successfully!', true);
    } catch (error) {
      console.error('Failed to save settings:', error);
      ShowNotifications.showAlertNotification(error.response?.data?.message || 'Failed to save settings', false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
      return <div style={{ padding: '20px' }}>Loading settings...</div>;
  }

  // Common props passed to each InputField
  const commonProps = { formData, formErrors, setFormData, setFormErrors };

  return (
    <section className="panel-view active" style={{ paddingBottom: '40px', paddingTop: '10px' }}>
      <form onSubmit={handleSettingsSubmit} noValidate style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* CARD 1: RESTAURANT INFORMATION */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><HomeIcon /></span> Restaurant Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <InputField {...commonProps} label="Restaurant Name" field="name" required />
            <InputField {...commonProps} label="Owner Name" field="ownerName" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <InputField {...commonProps} label="Contact Number" field="phone" required />
            <InputField {...commonProps} label="Email Address" field="email" required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <InputField {...commonProps} label="Website Domain" field="websiteDomain" />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <InputField {...commonProps} label="Address" field="address" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <InputField {...commonProps} label="City" field="city" required 
                onChangeOverride={(e) => {
                    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFormData({ ...formData, city: lettersOnly });
                    if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                }}
            />
            <InputField {...commonProps} label="State" field="state" required 
                onChangeOverride={(e) => {
                    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFormData({ ...formData, state: lettersOnly });
                    if (formErrors.state) setFormErrors({ ...formErrors, state: '' });
                }}
            />
            <InputField {...commonProps} label="Country" field="country" required 
                onChangeOverride={(e) => {
                    const lettersOnly = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                    setFormData({ ...formData, country: lettersOnly });
                    if (formErrors.country) setFormErrors({ ...formErrors, country: '' });
                }}
            />
          </div>
        </div>

        {/* CARD 2: LEGAL & COMPLIANCE */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><FileIcon /></span> Legal & Compliance
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <InputField {...commonProps} label="FSSAI License Number" field="fssaiLicense" 
                onChangeOverride={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                    setFormData({ ...formData, fssaiLicense: val });
                    if (formErrors.fssaiLicense) setFormErrors({ ...formErrors, fssaiLicense: '' });
                }}
                onBlurOverride={(e) => {
                    const val = e.target.value;
                    if (val && !/^1\d{13}$/.test(val)) {
                        setFormErrors({ ...formErrors, fssaiLicense: 'FSSAI License Number must contain exactly 14 digits and start with 1.' });
                    }
                }}
            />
            <InputField {...commonProps} label="GSTIN Number" field="gstinNumber" 
                onChangeOverride={(e) => {
                    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15);
                    setFormData({ ...formData, gstinNumber: val });
                    if (formErrors.gstinNumber) setFormErrors({ ...formErrors, gstinNumber: '' });
                }}
                onBlurOverride={(e) => {
                    const val = e.target.value;
                    if (val && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(val)) {
                        setFormErrors({ ...formErrors, gstinNumber: 'Invalid GSTIN. Please enter a valid 15-character GSTIN.' });
                    }
                }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            <InputField {...commonProps} label="PAN Number" field="panNumber" 
                onChangeOverride={(e) => {
                    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);
                    setFormData({ ...formData, panNumber: val });
                    if (formErrors.panNumber) setFormErrors({ ...formErrors, panNumber: '' });
                }}
                onBlurOverride={(e) => {
                    const val = e.target.value;
                    if (val && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(val)) {
                        setFormErrors({ ...formErrors, panNumber: 'Invalid PAN number. Please enter a valid 10-character PAN.' });
                    }
                }}
            />
          </div>
        </div>

        {/* BOTTOM FORM BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
          <button 
            type="submit" 
            className="btn btn-black" 
            disabled={isSaving}
            style={{ 
              padding: '12px 32px', 
              fontSize: '14px', 
              fontWeight: 700, 
              background: isSaving ? '#fb923c' : '#ea580c', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </section>
  );
}
