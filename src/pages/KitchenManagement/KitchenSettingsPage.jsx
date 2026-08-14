import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ShowNotifications from '../../helper/ShowNotifications';

export default function KitchenSettingsPage() {
  const navigate = useNavigate();
  const { activeRestaurant, updateKitchenPassword } = useAppState();

  const [password, setPassword] = useState('');

  useEffect(() => {
    if (activeRestaurant?.kitchenLogin?.password) {
      setPassword(activeRestaurant.kitchenLogin.password);
    }
  }, [activeRestaurant]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;

    if (updateKitchenPassword) {
      updateKitchenPassword(activeRestaurant.id, password);
    }
    ShowNotifications.showAlertNotification('Kitchen login password updated successfully.', true);
    navigate('/kitchen/list');
  };

  const email = activeRestaurant?.kitchenLogin?.email || 'kitchen@saravana.com';

  return (
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/kitchen/list')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              color: '#0f172a'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Kitchen Station Settings
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Update credentials shared by kitchen display station screens
            </p>
          </div>
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '16px', padding: '36px 40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Kitchen Station Login Email
            </label>
            <input
              type="email"
              value={email}
              readOnly
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                color: '#64748b',
                cursor: 'not-allowed'
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
              Kitchen Station Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="e.g. kitchen123"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigate('/kitchen/list')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
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
                padding: '10px 24px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
