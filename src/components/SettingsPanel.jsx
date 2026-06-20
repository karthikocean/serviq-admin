import React, { useState } from 'react';
import { Modal } from './Modal';

const PlusIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
  </svg>
);

const HomeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}>
    <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
  </svg>
);

const RupeeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}>
    <path d="M4 3.06h2.726c1.22 0 2.12.575 2.325 1.724H4v1.051h5.051C8.855 7.001 8 7.558 6.788 7.558H4v1.317L8.437 14h2.11L6.095 8.884h.855c2.316-.018 3.465-1.476 3.688-3.049H12V4.784h-1.345c-.08-.778-.357-1.335-.793-1.732H12V2H4z"/>
  </svg>
);

const PrinterIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}>
    <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
    <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1"/>
  </svg>
);

const UserIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}>
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
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
  deleteStaff,
  openAddStaffModal,
  openEditStaffModal
}) {
  const [formData, setFormData] = useState({
    name: activeRestaurant.name || '',
    businessName: activeRestaurant.settings?.businessName || activeRestaurant.ownerName || activeRestaurant.name || '',
    phone: activeRestaurant.settings?.phone || activeRestaurant.phone || '',
    email: activeRestaurant.settings?.email || activeRestaurant.email || '',
    address: activeRestaurant.settings?.address || activeRestaurant.address || '',
    gstPercentage: activeRestaurant.settings?.gstPercentage !== undefined ? activeRestaurant.settings.gstPercentage : parseFloat(((activeRestaurant.settings?.taxRate || 0.025) * 100 * 2).toFixed(1)),
    serviceCharge: activeRestaurant.settings?.serviceCharge !== undefined ? activeRestaurant.settings.serviceCharge : parseFloat(((activeRestaurant.settings?.serviceChargeRate || 0) * 100).toFixed(1)),
    printerName: activeRestaurant.settings?.printerName || 'Epson TM T82',
    printerType: activeRestaurant.settings?.printerType || 'Thermal Receipt Printer',
    logo: activeRestaurant.settings?.logo || activeRestaurant.logo || ''
  });

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    saveRestaurantSettings(activeRestaurant.id, {
      name: formData.name,
      settings: {
        ...activeRestaurant.settings,
        businessName: formData.businessName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
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
    alert('Settings saved successfully!');
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
    backgroundColor: '#ffffff'
  };

  // Only show Admin and Manager roles in the settings user management list
  const settingsStaff = staff.filter(s => s.role === 'Admin' || s.role === 'Manager');

  return (
    <section className="panel-view active" style={{ paddingBottom: '40px', paddingTop: '10px' }}>
      <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* CARD 1: RESTAURANT INFORMATION */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><HomeIcon /></span> Restaurant Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Restaurant Name</label>
              <input
                type="text"
                required
                style={inputStyle}
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Business Name</label>
              <input
                type="text"
                required
                style={inputStyle}
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Contact Number</label>
              <input
                type="text"
                required
                style={inputStyle}
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                required
                style={inputStyle}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Address</label>
            <input
              type="text"
              required
              style={inputStyle}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        {/* CARD 2: TAX CONFIGURATION */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><RupeeIcon /></span> Tax Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>GST Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="30"
                step="0.1"
                required
                style={inputStyle}
                value={formData.gstPercentage}
                onChange={e => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label style={labelStyle}>Service Charge (%)</label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                required
                style={inputStyle}
                value={formData.serviceCharge}
                onChange={e => setFormData({ ...formData, serviceCharge: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* CARD 3: PRINTER CONFIGURATION */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><PrinterIcon /></span> Printer Configuration
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={labelStyle}>Printer Name</label>
              <input
                type="text"
                required
                style={inputStyle}
                value={formData.printerName}
                onChange={e => setFormData({ ...formData, printerName: e.target.value })}
              />
            </div>
            <div>
              <label style={labelStyle}>Printer Type</label>
              <select
                style={{ ...inputStyle, appearance: 'auto' }}
                value={formData.printerType}
                onChange={e => setFormData({ ...formData, printerType: e.target.value })}
              >
                <option value="Thermal Receipt Printer">Thermal Receipt Printer</option>
                <option value="Thermal USB">Thermal USB (80mm)</option>
                <option value="Wi-Fi Network">Wi-Fi Network (Ethernet)</option>
                <option value="Bluetooth POS">Bluetooth POS (58mm)</option>
                <option value="System Default PDF">System Default PDF Printer</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 4: USER MANAGEMENT */}
        <div style={cardStyle}>
          <h3 style={titleStyle}>
            <span style={{ color: '#64748b' }}><UserIcon /></span> User Management
          </h3>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000' }}>
                  <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 800, color: '#ffffff' }}>USER NAME</th>
                  <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>ROLE</th>
                  <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'center' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', fontSize: '10px', fontWeight: 800, color: '#ffffff', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {settingsStaff.map((s, index) => (
                  <tr key={s.id} style={{ borderBottom: index < settingsStaff.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{s.name}</td>
                    <td style={{ padding: '16px', fontSize: '13px', fontWeight: 500, color: '#64748b', textAlign: 'center' }}>{s.role}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{ color: '#10b981', fontSize: '11px', fontWeight: 800 }}>Active</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button 
                        type="button"
                        onClick={() => openEditStaffModal ? openEditStaffModal(s) : null}
                        style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', padding: '6px 16px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, color: '#64748b', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {settingsStaff.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button 
              type="button"
              onClick={() => openAddStaffModal ? openAddStaffModal('Admin') : null}
              style={{ background: '#000000', color: '#ffffff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <PlusIcon /> Add User
            </button>
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
