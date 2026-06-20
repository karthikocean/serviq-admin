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

export default function UserListPanel({
  activeRestaurant = {},
  staff = [],
  addStaff,
  updateStaff,
  deleteStaff
}) {
  // User Management Modal states
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
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
    setIsUserModalOpen(true);
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
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateStaff(activeRestaurant.id, {
        ...editingUser,
        ...userForm
      });
    } else {
      addStaff(activeRestaurant.id, {
        id: 'S-' + Math.floor(100 + Math.random() * 900),
        ...userForm
      });
    }
    setIsUserModalOpen(false);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
  };

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px' }}>
      <div className="panel-header-flex" style={{ marginBottom: '24px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">User Management</h2>
          <p className="panel-inner-desc">Manage system users, access credentials, and active roles</p>
        </div>
      </div>

      <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--black)', margin: 0 }}>
            User Registry
          </h3>
          <button 
            type="button" 
            className="btn btn-black" 
            style={{ padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={openAddUser}
          >
            <PlusIcon size={14} /> Add User
          </button>
        </div>

        <div className="menu-table-wrapper" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '14px', textAlign: 'center', width: '50px' }}>S.NO</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>USER NAME</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>NUMBER</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>EMAIL</th>
                <th style={{ padding: '14px', textAlign: 'left' }}>ROLE</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No users registered.</td>
                </tr>
              ) : (
                staff.map((user, idx) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px', textAlign: 'center', fontWeight: 600, fontSize: '13px' }}>{idx + 1}</td>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>{user.name}</td>
                    <td style={{ padding: '14px', fontSize: '13px' }}>{user.phone}</td>
                    <td style={{ padding: '14px', fontSize: '13px' }}>{user.email}</td>
                    <td style={{ padding: '14px', fontWeight: 500 }}>
                      <span style={{ 
                        display: 'inline-flex', 
                        padding: '3px 8px', 
                        borderRadius: '4px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        background: user.role === 'Admin' ? 'var(--primary-light)' : 'var(--bg-tertiary)',
                        color: user.role === 'Admin' ? 'var(--primary)' : 'var(--text-main)'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          style={{ padding: '6px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => openEditUser(user)}
                          title="Edit User"
                        >
                          <PencilIcon size={12} />
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          style={{ padding: '6px', color: 'var(--danger)', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          onClick={() => handleDeleteUser(user)}
                          title="Delete User"
                        >
                          <TrashIcon size={12} color="var(--danger)" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER MANAGEMENT MODAL */}
      <Modal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        title={editingUser ? "Edit User Account" : "Add New User Account"}
      >
        <form onSubmit={handleUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 0 0 0' }}>
          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Full Name *</label>
            <input
              type="text"
              required
              value={userForm.name}
              onChange={e => setUserForm({ ...userForm, name: e.target.value })}
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Role *</label>
              <select
                value={userForm.role}
                onChange={e => setUserForm({ ...userForm, role: e.target.value })}
              >
                <option value="Waiter">Waiter</option>
                <option value="Kitchen">Kitchen Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Administrator</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Status *</label>
              <select
                value={userForm.status}
                onChange={e => setUserForm({ ...userForm, status: e.target.value })}
              >
                <option value="On Duty">On Duty</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Phone Number *</label>
              <input
                type="text"
                required
                value={userForm.phone}
                onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                placeholder="e.g. 9876543210"
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Email Address *</label>
              <input
                type="email"
                required
                value={userForm.email}
                onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="e.g. rahul@serviq.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-main)' }}>Login Password *</label>
            <input
              type="password"
              required
              value={userForm.password}
              onChange={e => setUserForm({ ...userForm, password: e.target.value })}
              placeholder="Min 6 characters"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setIsUserModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-black" style={{ border: 'none', background: 'var(--primary)', color: 'white' }}>Save User</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirm Deletion"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--black)', fontSize: '15px' }}>Delete User Account</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete user "{userToDelete?.name}"? This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-black" 
              style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
              onClick={() => {
                if (userToDelete) {
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
