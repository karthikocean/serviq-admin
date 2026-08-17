import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';
import ShowNotifications from '../helper/ShowNotifications.js';

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const RupeeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M6 3h12" />
    <path d="M6 8h12" />
    <path d="m6 13 8.5 8" />
    <path d="M6 13h3a4 4 0 0 0 0-8" />
  </svg>
);

export default function SettingsPanel() {
  const { activeRestaurant, saveRestaurantSettings, staff = [], darkMode } = useAppState();

  const [formData, setFormData] = useState({
    name: activeRestaurant.name || '',
    businessName: activeRestaurant.settings?.businessName || activeRestaurant.name || '',
    phone: activeRestaurant.settings?.phone || '',
    email: activeRestaurant.settings?.email || '',
    address: activeRestaurant.settings?.address || '',
    gstPercentage: activeRestaurant.settings?.gstPercentage !== undefined ? activeRestaurant.settings.gstPercentage : 5,
    serviceCharge: activeRestaurant.settings?.serviceCharge !== undefined ? activeRestaurant.settings.serviceCharge : 0,
    printerName: activeRestaurant.settings?.printerName || 'POS-80C Thermal Printer',
    printerType: activeRestaurant.settings?.printerType || 'Network / Ethernet (LAN)',
    logo: activeRestaurant.settings?.logo || ''
  });

  const [formErrors, setFormErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Restaurant Name is required.';
    }

    if (!formData.businessName.trim()) {
      errors.businessName = 'Business Name is required.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Contact Number is required.';
    } else if (!/^[0-9+\s\-()]{7,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid contact number.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.address.trim()) {
      errors.address = 'Address is required.';
    }

    if (formData.gstPercentage === '' || isNaN(formData.gstPercentage) || formData.gstPercentage < 0 || formData.gstPercentage > 50) {
      errors.gstPercentage = 'GST Percentage must be between 0 and 50%.';
    }

    if (formData.serviceCharge === '' || isNaN(formData.serviceCharge) || formData.serviceCharge < 0 || formData.serviceCharge > 30) {
      errors.serviceCharge = 'Service Charge must be between 0 and 30%.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    saveRestaurantSettings(activeRestaurant.id, {
      name: formData.name.trim(),
      settings: {
        ...activeRestaurant.settings,
        businessName: formData.businessName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        gstPercentage: formData.gstPercentage,
        taxRate: parseFloat((formData.gstPercentage / 100 / 2).toFixed(4)),
        serviceCharge: formData.serviceCharge,
        serviceChargeRate: parseFloat((formData.serviceCharge / 100).toFixed(4)),
        printerName: formData.printerName,
        printerType: formData.printerType,
        logo: formData.logo,
        darkMode
      }
    });
    ShowNotifications.showAlertNotification('Settings saved successfully!', true);
  };

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

  return (
    <section className="panel-view active" style={{ paddingBottom: '40px', paddingTop: '10px' }}>
      <form onSubmit={handleSettingsSubmit} noValidate style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* CARD 1: RESTAURANT INFORMATION */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><HomeIcon /></span> Restaurant Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Restaurant Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  borderColor: formErrors.name ? '#ef4444' : '#e2e8f0'
                }}
                value={formData.name}
                onChange={e => {
                  setFormData({ ...formData, name: e.target.value });
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                }}
              />
              {formErrors.name && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.name}
                </span>
              )}
            </div>
            <div>
              <label style={labelStyle}>
                Business Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  borderColor: formErrors.businessName ? '#ef4444' : '#e2e8f0'
                }}
                value={formData.businessName}
                onChange={e => {
                  setFormData({ ...formData, businessName: e.target.value });
                  if (formErrors.businessName) setFormErrors({ ...formErrors, businessName: '' });
                }}
              />
              {formErrors.businessName && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.businessName}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>
                Contact Number <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  borderColor: formErrors.phone ? '#ef4444' : '#e2e8f0'
                }}
                value={formData.phone}
                onChange={e => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                }}
              />
              {formErrors.phone && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.phone}
                </span>
              )}
            </div>
            <div>
              <label style={labelStyle}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                style={{
                  ...inputStyle,
                  borderColor: formErrors.email ? '#ef4444' : '#e2e8f0'
                }}
                value={formData.email}
                onChange={e => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                }}
              />
              {formErrors.email && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.email}
                </span>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Address <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              style={{
                ...inputStyle,
                borderColor: formErrors.address ? '#ef4444' : '#e2e8f0'
              }}
              value={formData.address}
              onChange={e => {
                setFormData({ ...formData, address: e.target.value });
                if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
              }}
            />
            {formErrors.address && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                {formErrors.address}
              </span>
            )}
          </div>
        </div>

        {/* CARD 2: TAX CONFIGURATION */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><RupeeIcon /></span> Tax Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>
                GST Percentage (%) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                style={{
                  ...inputStyle,
                  borderColor: formErrors.gstPercentage ? '#ef4444' : '#e2e8f0'
                }}
                value={formData.gstPercentage}
                onChange={e => {
                  setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 });
                  if (formErrors.gstPercentage) setFormErrors({ ...formErrors, gstPercentage: '' });
                }}
              />
              {formErrors.gstPercentage && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.gstPercentage}
                </span>
              )}
            </div>
            <div>
              <label style={labelStyle}>
                Service Charge (%) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.1"
                style={{
                  ...inputStyle,
                  borderColor: formErrors.serviceCharge ? '#ef4444' : '#e2e8f0'
                }}
                value={formData.serviceCharge}
                onChange={e => {
                  setFormData({ ...formData, serviceCharge: parseFloat(e.target.value) || 0 });
                  if (formErrors.serviceCharge) setFormErrors({ ...formErrors, serviceCharge: '' });
                }}
              />
              {formErrors.serviceCharge && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.serviceCharge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM FORM BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
          <button 
            type="submit" 
            className="btn btn-black" 
            style={{ padding: '12px 32px', fontSize: '14px', fontWeight: 700, background: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Save Settings
          </button>
        </div>
      </form>
    </section>
  );
}
