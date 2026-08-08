import React, { useState } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';

const PlusIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ArrowLeftIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export default function UserListPanel({
  activeRestaurant = {},
  staff = [],
  addStaff,
  updateStaff,
  deleteStaff
}) {
  const [viewState, setViewState] = useState('list'); // 'list' | 'form'
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    role: 'Waiter',
    status: 'On Duty',
    phone: '',
    email: '',
    password: ''
  });

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      role: 'Waiter',
      status: 'On Duty',
      phone: '',
      email: '',
      password: 'staff' + Math.floor(100 + Math.random() * 900)
    });
    setViewState('form');
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      role: user.role || 'Waiter',
      status: user.status || 'On Duty',
      phone: user.phone || '',
      email: user.email || '',
      password: user.password || 'waiter123'
    });
    setViewState('form');
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    // 1. Name validation (letters and spaces only)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test((userForm.name || '').trim())) {
      ShowNotifications.showAlertNotification("Name should contain letters only (no numbers or special characters).", false);
      return;
    }

    // 2. Mobile validation (exactly 10 digits)
    const phoneDigits = (userForm.phone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      ShowNotifications.showAlertNotification("Mobile number must be exactly 10 digits.", false);
      return;
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test((userForm.email || '').trim())) {
      ShowNotifications.showAlertNotification("Please enter a valid email address.", false);
      return;
    }

    const sanitizedForm = {
      ...userForm,
      name: userForm.name.trim(),
      phone: phoneDigits,
      email: userForm.email.trim()
    };

    if (editingUser) {
      updateStaff(activeRestaurant.id, {
        ...editingUser,
        ...sanitizedForm
      });
      ShowNotifications.showAlertNotification("User updated successfully!", true);
    } else {
      addStaff(activeRestaurant.id, {
        id: 'S-' + Math.floor(100 + Math.random() * 900),
        userId: 'USR-' + String(staff.length + 1).padStart(2, '0'),
        ...sanitizedForm
      });
      ShowNotifications.showAlertNotification("New user registered successfully!", true);
    }
    setViewState('list');
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
  };

  // Render PAGE STYLE Form when adding or editing a user
  if (viewState === 'form') {
    return (
      <section className="panel-view active" style={{ paddingBottom: '60px', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => setViewState('list')}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
          >
            <ArrowLeftIcon size={16} /> Back to User Registry
          </button>
        </div>

        <div className="settings-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', width: '100%' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 24px 0', fontFamily: "'Outfit', sans-serif" }}>
            {editingUser ? "Edit User Account" : "Add New User Account"}
          </h2>

          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                Full Name * 
              </label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={e => {
                  const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                  setUserForm({ ...userForm, name: val });
                }}
                placeholder="e.g. Rahul Sharma"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Role *
                </label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff' }}
                >
                  <option value="Waiter">Waiter</option>
                  <option value="Kitchen">Kitchen Staff</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Status *
                </label>
                <select
                  value={userForm.status}
                  onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff' }}
                >
                  <option value="On Duty">On Duty</option>
                  <option value="Off Duty">Off Duty</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Phone Number * 
                </label>
                <input
                  type="text"
                  required
                  maxLength="10"
                  value={userForm.phone}
                  onChange={e => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setUserForm({ ...userForm, phone: digits });
                  }}
                  placeholder="e.g. 9876543210"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. rahul@serviq.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                Login Password *
              </label>
              <input
                type="password"
                required
                value={userForm.password}
                onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Min 6 characters"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={() => setViewState('list')}
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                style={{ background: '#ff5a1f', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}
              >
                {editingUser ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px' }}>
      <div className="settings-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            User Registry
          </h3>
          <button 
            type="button" 
            style={{ background: '#ff5a1f', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddUser}
          >
            <PlusIcon size={14} color="#ffffff" /> Add User
          </button>
        </div>

        {/* Optimized Table Layout */}
        <div className="menu-table-wrapper" style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '12%', padding: '14px 16px' }}>USER ID</th>
                <th style={{ width: '22%', padding: '14px 16px' }}>USER NAME</th>
                <th style={{ width: '18%', padding: '14px 16px' }}>NUMBER</th>
                <th style={{ width: '22%', padding: '14px 16px' }}>EMAIL</th>
                <th style={{ width: '14%', padding: '14px 16px', textAlign: 'center' }}>ROLE</th>
                <th style={{ width: '12%', padding: '14px 16px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No users registered.</td>
                </tr>
              ) : (
                staff.map((user, idx) => {
                  const autoUserId = user.userId || `USR-${String(idx + 1).padStart(2, '0')}`;
                  return (
                    <tr key={user.id || idx} style={{ borderBottom: '1px solid #e2e8f0', height: '52px' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: '#0f172a', fontFamily: 'monospace' }}>
                        {autoUserId}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                        {user.name}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                        {user.phone || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#334155' }}>
                        {user.email || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ 
                          display: 'inline-flex', 
                          padding: '4px 10px', 
                          borderRadius: '16px', 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          letterSpacing: '0.3px',
                          background: user.role === 'Admin' ? '#fff3ea' : '#f1f5f9',
                          color: user.role === 'Admin' ? '#ff5a1f' : '#475569'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          <button 
                            type="button" 
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            onClick={() => openEditUser(user)}
                            title="Edit User"
                            onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                          >
                            <PencilIcon size={16} />
                          </button>
                          <button 
                            type="button" 
                            style={{ background: 'transparent', border: 'none', color: '#ea4335', cursor: 'pointer', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
                            onClick={() => handleDeleteUser(user)}
                            title="Delete User"
                            onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                            onMouseLeave={e => e.currentTarget.style.color = '#ea4335'}
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Modal */}
      <Modal 
        isOpen={!!userToDelete} 
        onClose={() => setUserToDelete(null)} 
        title="Confirm Deletion"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
            Are you sure you want to delete user account <strong>{userToDelete?.name}</strong>? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              style={{ background: '#dc2626', border: 'none', color: '#ffffff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => {
                if (userToDelete && deleteStaff) {
                  deleteStaff(activeRestaurant.id, userToDelete.id);
                  setUserToDelete(null);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
