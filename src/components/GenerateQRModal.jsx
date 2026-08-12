import React, { useState } from 'react';
import ShowNotifications from '../helper/ShowNotifications';

export default function GenerateQRModal({ isOpen, onClose, defaultTableId = 'T-07', onGenerate }) {
  const [tableNumber, setTableNumber] = useState(defaultTableId);
  const [status, setStatus] = useState('Free');

  // Format date e.g. "Aug 12, 2026"
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const numStr = tableNumber ? tableNumber.replace(/\D/g, '') : '07';
  const displayTableId = tableNumber.startsWith('T-') ? tableNumber : `T-${numStr ? numStr.padStart(2, '0') : '07'}`;
  const qrUrl = `http://serviq-super-admin.vercel.app:3001/table/${displayTableId}`;

  const handleGenerateSubmit = (e) => {
    e?.preventDefault();
    if (onGenerate) {
      onGenerate({ tableId: displayTableId, status, url: qrUrl });
    }
    ShowNotifications.showAlertNotification(`QR Code generated for ${displayTableId}!`, true);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(3px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          position: 'relative',
          boxSizing: 'border-box'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header matching Image 1 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '12px',
          marginBottom: '14px'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Generate QR Code
            </h3>

          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Table Number */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Table Number
            </label>
            <input 
              type="text" 
              value={tableNumber} 
              onChange={e => setTableNumber(e.target.value)} 
              placeholder="T-07"
              required 
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* QR Code Container */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              QR Code
            </label>
            <div style={{
              border: '1.5px dashed #fed7aa',
              borderRadius: '12px',
              backgroundColor: '#fffcf9',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}`} 
                alt="QR Code" 
                style={{ width: '120px', height: '120px', display: 'block', borderRadius: '4px' }} 
              />
            </div>
          </div>

          {/* QR URL */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              QR URL
            </label>
            <input 
              type="text" 
              readOnly 
              value={qrUrl} 
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Created Date */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Created Date
            </label>
            <input 
              type="text" 
              readOnly 
              value={dateStr} 
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                color: '#64748b',
                backgroundColor: '#f1f5f9',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Status */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
              Status
            </label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                color: '#0f172a',
                backgroundColor: '#ffffff',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="Free">Free</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            borderTop: '1px solid #f1f5f9',
            paddingTop: '14px',
            marginTop: '4px'
          }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              style={{
                background: '#ff5a1f',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)'
              }}
            >
              Generate QR Code
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
