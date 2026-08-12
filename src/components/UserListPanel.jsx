import React, { useState } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';

const ArrowLeftIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
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

const defaultUsersData = [
  { id: 'ADM-01', name: 'Rajesh Kumar', email: 'rajesh@serviq.com', phone: '+91 98765 43210', role: 'BRANCH ADMIN', status: 'Active', lastLogin: '2026-06-02 12:45 PM' },
  { id: 'ADM-02', name: 'Amit Patel', email: 'amit@serviq.com', phone: '+91 98765 11111', role: 'BRANCH MANAGER', status: 'Active', lastLogin: '2026-06-02 11:30 AM' },
  { id: 'ADM-03', name: 'Vikram Singh', email: 'vikram@serviq.com', phone: '+91 98765 22222', role: 'BRANCH ADMIN', status: 'Disabled', lastLogin: '2026-05-30 09:15 PM' }
];

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
    role: 'BRANCH ADMIN',
    status: 'Active',
    phone: '',
    email: '',
    password: ''
  });

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      role: 'BRANCH ADMIN',
      status: 'Active',
      phone: '',
      email: '',
      password: 'user' + Math.floor(100 + Math.random() * 900)
    });
    setViewState('form');
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      role: user.role || 'BRANCH ADMIN',
      status: user.status === 'Off Duty' || user.status === 'Disabled' ? 'Disabled' : 'Active',
      phone: user.phone || '',
      email: user.email || '',
      password: user.password || 'user123'
    });
    setViewState('form');
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test((userForm.name || '').trim())) {
      ShowNotifications.showAlertNotification("Name should contain letters only.", false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test((userForm.email || '').trim())) {
      ShowNotifications.showAlertNotification("Please enter a valid email address.", false);
      return;
    }

    const sanitizedForm = {
      name: userForm.name.trim(),
      role: userForm.role,
      status: userForm.status === 'Active' ? 'On Duty' : 'Off Duty',
      phone: userForm.phone.trim(),
      email: userForm.email.trim(),
      password: userForm.password
    };

    if (editingUser && updateStaff && activeRestaurant?.id) {
      updateStaff(activeRestaurant.id, {
        ...editingUser.raw,
        ...sanitizedForm
      });
      ShowNotifications.showAlertNotification("User account updated successfully!", true);
    } else if (addStaff && activeRestaurant?.id) {
      addStaff(activeRestaurant.id, sanitizedForm);
      ShowNotifications.showAlertNotification("New user created successfully!", true);
    }
    setViewState('list');
  };

  // Map real staff or fallback to reference image data
  const displayUsers = staff.length > 0
    ? staff.map((u, idx) => ({
        raw: u,
        sno: idx + 1,
        id: u.userId || `ADM-${String(idx + 1).padStart(2, '0')}`,
        name: u.name,
        email: u.email || `${u.name.toLowerCase().replace(/\s+/g, '')}@serviq.com`,
        phone: u.phone ? (u.phone.startsWith('+91') ? u.phone : `+91 ${u.phone}`) : '+91 98765 43210',
        role: u.role ? u.role.toUpperCase() : 'BRANCH ADMIN',
        status: u.status === 'Off Duty' || u.status === 'Disabled' ? 'Disabled' : 'Active',
        lastLogin: '2026-06-02 12:45 PM'
      }))
    : defaultUsersData.map((d, idx) => ({ ...d, sno: idx + 1 }));

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
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          >
            <ArrowLeftIcon size={16} /> Back to Users List
          </button>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', width: '100%' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 24px 0', fontFamily: "'Outfit', sans-serif" }}>
            {editingUser ? "Edit User Account" : "Create New User"}
          </h2>

          <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                Full Name * 
              </label>
              <input
                type="text"
                required
                value={userForm.name}
                onChange={e => setUserForm({ ...userForm, name: e.target.value.replace(/[^a-zA-Z\s]/g, '') })}
                placeholder="e.g. Rajesh Kumar"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Access Role *
                </label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="BRANCH ADMIN">BRANCH ADMIN</option>
                  <option value="BRANCH MANAGER">BRANCH MANAGER</option>
                  <option value="SUPER ADMIN">SUPER ADMIN</option>
                  <option value="CASHIER">CASHIER</option>
                  <option value="WAITER">WAITER</option>
                  <option value="KITCHEN STAFF">KITCHEN STAFF</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Account Status *
                </label>
                <select
                  value={userForm.status}
                  onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Phone Number * 
                </label>
                <input
                  type="text"
                  required
                  value={userForm.phone}
                  onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="e.g. rajesh@serviq.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button 
                type="button" 
                onClick={() => setViewState('list')} 
                style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}
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
    <section className="panel-view active" style={{ paddingBottom: '60px', width: '100%' }}>
      {/* Main Card Container matching Screenshot 1 */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
      }}>
        {/* Card Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Users List
          </h2>
          <button 
            type="button" 
            onClick={openAddUser}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: 'none',
              padding: '10px 22px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
            onMouseLeave={e => e.currentTarget.style.background = '#000000'}
          >
            + Create User
          </button>
        </div>

        {/* Table matching Screenshot 1 */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>
                  S.NO.
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  USER ID
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  FULL NAME
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  EMAIL ADDRESS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  PHONE NUMBER
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACCESS ROLE
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ACCOUNT STATUS
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  LAST LOGIN
                </th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((u, index) => {
                const isActive = u.status === 'Active';

                return (
                  <tr 
                    key={u.id || index} 
                    style={{ 
                      borderBottom: index < displayUsers.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s' 
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* S.NO. */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                      {u.sno || index + 1}
                    </td>

                    {/* USER ID */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                      {u.id}
                    </td>

                    {/* FULL NAME */}
                    <td style={{ padding: '16px 18px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {u.name}
                    </td>

                    {/* EMAIL ADDRESS */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
                      {u.email}
                    </td>

                    {/* PHONE NUMBER */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                      {u.phone}
                    </td>

                    {/* ACCESS ROLE */}
                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        letterSpacing: '0.3px',
                        textTransform: 'uppercase'
                      }}>
                        {u.role}
                      </span>
                    </td>

                    {/* ACCOUNT STATUS */}
                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: isActive ? '#e6f4ea' : '#fef2f2',
                        border: isActive ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                        color: isActive ? '#16a34a' : '#dc2626'
                      }}>
                        {isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>

                    {/* LAST LOGIN */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b', fontWeight: '400' }}>
                      {u.lastLogin}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
