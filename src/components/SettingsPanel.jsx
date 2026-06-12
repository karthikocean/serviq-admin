import React, { useState } from 'react';
import { Modal } from './Modal';

const PlusIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PencilIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default function SettingsPanel({
  activeRestaurant = {},
  saveRestaurantSettings,
  darkMode,
  setDarkMode,
  staff = [],
  addStaff,
  updateStaff,
  deleteStaff
}) {
  const [formData, setFormData] = useState({
    name: activeRestaurant.name || '',
    businessName: activeRestaurant.settings?.businessName || activeRestaurant.ownerName || activeRestaurant.name || '',
    phone: activeRestaurant.settings?.phone || activeRestaurant.phone || '',
    email: activeRestaurant.settings?.email || activeRestaurant.email || '',
    address: activeRestaurant.settings?.address || activeRestaurant.address || '',
    gstPercentage: activeRestaurant.settings?.gstPercentage !== undefined ? activeRestaurant.settings.gstPercentage : parseFloat(((activeRestaurant.settings?.taxRate || 0.025) * 100 * 2).toFixed(1)),
    serviceCharge: activeRestaurant.settings?.serviceCharge !== undefined ? activeRestaurant.settings.serviceCharge : parseFloat(((activeRestaurant.settings?.serviceChargeRate || 0) * 100).toFixed(1)),
    printerName: activeRestaurant.settings?.printerName || 'Billing Printer Main',
    printerType: activeRestaurant.settings?.printerType || 'Thermal USB',
    logo: activeRestaurant.settings?.logo || activeRestaurant.logo || ''
  });

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    saveRestaurantSettings(activeRestaurant.id, {
      name: formData.name,
      settings: {
        businessName: formData.businessName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        gstPercentage: formData.gstPercentage,
        taxRate: parseFloat((formData.gstPercentage / 100 / 2).toFixed(4)), // CGST + SGST representation
        serviceCharge: formData.serviceCharge,
        serviceChargeRate: parseFloat((formData.serviceCharge / 100).toFixed(4)),
        printerName: formData.printerName,
        printerType: formData.printerType,
        logo: formData.logo,
        darkMode
      }
    });
    alert('Restaurant configuration saved successfully!');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset changes to current database settings?')) {
      setFormData({
        name: activeRestaurant.name || '',
        businessName: activeRestaurant.settings?.businessName || activeRestaurant.ownerName || activeRestaurant.name || '',
        phone: activeRestaurant.settings?.phone || activeRestaurant.phone || '',
        email: activeRestaurant.settings?.email || activeRestaurant.email || '',
        address: activeRestaurant.settings?.address || activeRestaurant.address || '',
        gstPercentage: activeRestaurant.settings?.gstPercentage !== undefined ? activeRestaurant.settings.gstPercentage : parseFloat(((activeRestaurant.settings?.taxRate || 0.025) * 100 * 2).toFixed(1)),
        serviceCharge: activeRestaurant.settings?.serviceCharge !== undefined ? activeRestaurant.settings.serviceCharge : parseFloat(((activeRestaurant.settings?.serviceChargeRate || 0) * 100).toFixed(1)),
        printerName: activeRestaurant.settings?.printerName || 'Billing Printer Main',
        printerType: activeRestaurant.settings?.printerType || 'Thermal USB',
        logo: activeRestaurant.settings?.logo || activeRestaurant.logo || ''
      });
    }
  };

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px' }}>
      <div className="panel-header-flex" style={{ marginBottom: '24px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">Profile Settings</h2>
          <p className="panel-inner-desc">Manage your personal profile, security credentials, and preferences</p>
        </div>
      </div>

      <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* CARD 1: RESTAURANT / PROFILE INFORMATION */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--black)', marginTop: 0 }}>
            <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span> Profile Information
          </h3>

          <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Left Image selection Column */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' }}>
              <div style={{ 
                width: '120px', 
                height: '120px', 
                borderRadius: '12px', 
                background: 'var(--bg-tertiary)', 
                border: '1px solid var(--border)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden', 
                marginBottom: '12px',
                position: 'relative'
              }}>
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  </span>
                )}
              </div>
              <button 
                type="button" 
                className="btn btn-outline" 
                style={{ width: '120px', padding: '8px 12px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', border: '1.5px solid var(--border)' }} 
                onClick={() => {
                  const url = prompt('Enter Logo URL:', formData.logo);
                  if (url !== null) setFormData({ ...formData, logo: url });
                }}
              >
                Choose
              </button>
            </div>

            {/* Right form fields Column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '18px', minWidth: '300px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Restaurant Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Contact Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street Address, City, State"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Designation</label>
                <input
                  type="text"
                  readOnly
                  value="Super Admin"
                  style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed', color: 'var(--text-muted)' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: TAX CONFIGURATION */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--black)', marginTop: 0 }}>
            <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </span> Tax Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>GST Percentage (%) *</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.1"
                required
                value={formData.gstPercentage}
                onChange={e => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Service Charge (%) *</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                required
                value={formData.serviceCharge}
                onChange={e => setFormData({ ...formData, serviceCharge: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* CARD 3: PRINTER CONFIGURATION */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--black)', marginTop: 0 }}>
            <span style={{ color: 'var(--primary)', display: 'inline-flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px'}}><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            </span> Printer Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Printer Name *</label>
              <input
                type="text"
                required
                value={formData.printerName}
                onChange={e => setFormData({ ...formData, printerName: e.target.value })}
                placeholder="e.g. POS-80-Billing"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Printer Type *</label>
              <select
                value={formData.printerType}
                onChange={e => setFormData({ ...formData, printerType: e.target.value })}
              >
                <option value="Thermal USB">Thermal USB (80mm)</option>
                <option value="Wi-Fi Network">Wi-Fi Network (Ethernet)</option>
                <option value="Bluetooth POS">Bluetooth POS (58mm)</option>
                <option value="System Default PDF">System Default PDF Printer</option>
              </select>
            </div>
          </div>
        </div>

        {/* BOTTOM FORM BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '10px' }}>
          <button 
            type="button" 
            className="btn btn-outline" 
            style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 600, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)' }} 
            onClick={handleResetDefaults}
          >
            Reset Defaults
          </button>
          <button 
            type="submit" 
            className="btn btn-black" 
            style={{ padding: '10px 32px', fontSize: '13px', fontWeight: 700, background: 'var(--black)', color: '#ffffff', border: 'none' }}
          >
            Save Settings
          </button>
        </div>
      </form>
    </section>
  );
}
