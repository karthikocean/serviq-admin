import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';
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

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function UserListPanel({
  activeRestaurant = {},
  staff = [],
  addUser,
  updateUser,
  deleteUser
}) {
  const { selectedBranchId, branches: contextBranches } = useAppState();
  const branches = activeRestaurant?.branches || contextBranches || [];

  const [viewState, setViewState] = useState('list'); // 'list' | 'form'
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [userForm, setUserForm] = useState({
    name: '',
    branchId: 'ALL',
    role: 'Branch Admin',
    status: 'Active',
    phone: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const openAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: '',
      branchId: selectedBranchId || 'ALL',
      role: 'Branch Admin',
      status: 'Active',
      phone: '',
      email: '',
      password: 'user' + Math.floor(100 + Math.random() * 900)
    });
    setFormErrors({});
    setViewState('form');
  };

  const openEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      branchId: user.branchId || 'ALL',
      role: user.role || 'Branch Admin',
      status: user.status === 'Off Duty' || user.status === 'Inactive' || user.status === 'Disabled' ? 'Inactive' : 'Active',
      phone: user.phone || '',
      email: user.email || '',
      password: user.password || 'user123'
    });
    setFormErrors({});
    setViewState('form');
  };

  const validate = () => {
    const errors = {};
    const nameTrimmed = (userForm.name || '').trim();
    if (!nameTrimmed) {
      errors.name = 'Full Name is required.';
    } else if (!/^[a-zA-Z\s.]+$/.test(nameTrimmed)) {
      errors.name = 'Full Name should contain letters only.';
    }

    const phoneTrimmed = (userForm.phone || '').trim();
    if (!phoneTrimmed) {
      errors.phone = 'Phone Number is required.';
    } else if (!/^[0-9+\s\-()]{7,15}$/.test(phoneTrimmed)) {
      errors.phone = 'Please enter a valid phone number.';
    }

    const emailTrimmed = (userForm.email || '').trim();
    if (!emailTrimmed) {
      errors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!userForm.password || !userForm.password.trim()) {
      errors.password = 'Password is required.';
    } else if (userForm.password.length < 4) {
      errors.password = 'Password must be at least 4 characters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const sanitizedForm = {
      name: userForm.name.trim(),
      branchId: userForm.branchId || 'ALL',
      role: userForm.role,
      status: userForm.status === 'Active' ? 'Active' : 'Inactive',
      phone: userForm.phone.trim(),
      email: userForm.email.trim(),
      password: userForm.password
    };

    if (editingUser && updateUser && activeRestaurant?.id) {
      updateUser(activeRestaurant.id, editingUser.id, sanitizedForm);
      ShowNotifications.showAlertNotification("User account updated successfully!", true);
    } else if (addUser && activeRestaurant?.id) {
      addUser(activeRestaurant.id, sanitizedForm);
      ShowNotifications.showAlertNotification("New user created successfully!", true);
    }
    setViewState('list');
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) return;
    if (deleteUser && activeRestaurant?.id) {
      deleteUser(activeRestaurant.id, userToDelete.id);
      ShowNotifications.showAlertNotification("User account deleted successfully.", true);
    }
    setUserToDelete(null);
  };

  // Get users from activeRestaurant
  const rawUsers = activeRestaurant?.users || [];
  
  // Filter by selected branch & search query & role
  const filteredUsers = rawUsers.filter(u => {
    if (selectedBranchId && u.branchId !== 'ALL' && u.branchId !== selectedBranchId) {
      return false;
    }
    if (roleFilter !== 'All' && u.role !== roleFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').toLowerCase().includes(q);
      const matchRole = (u.role || '').toLowerCase().includes(q);
      const matchBranch = (u.branchId || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchRole || matchBranch;
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      ShowNotifications.showAlertNotification('No user records to export.', false);
      return;
    }
    const headers = ['User ID', 'Full Name', 'Branch', 'Role', 'Email', 'Phone', 'Status', 'Last Login'];
    const rows = filteredUsers.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.branchId === 'ALL' ? 'All Branches' : u.branchId}"`,
      `"${u.role}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.status}"`,
      `"${u.lastLogin || 'N/A'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `serviq_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ShowNotifications.showAlertNotification('Users list exported successfully!', true);
  };

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
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#0f172a'
            }}
          >
            <ArrowLeftIcon size={14} /> Back to Users List
          </button>
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', fontFamily: "'Outfit', sans-serif" }}>
            {editingUser ? 'Edit User Account' : 'Create User Account'}
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 24px 0' }}>
            {editingUser ? 'Update user credentials, role, and branch assignment' : 'Add new administrator or branch staff to the system'}
          </p>

          <form onSubmit={handleUserSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => {
                    setUserForm({ ...userForm, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                  }}
                  placeholder="e.g. Rajesh Kumar"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.name ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.name && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {formErrors.name}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Branch Assignment <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={userForm.branchId}
                  onChange={e => setUserForm({ ...userForm, branchId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="ALL">All Branches (Global Admin)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Access Role <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Branch Admin">Branch Admin</option>
                  <option value="Manager">Branch Manager</option>
                  <option value="Waiter">Waiter</option>
                  <option value="Kitchen">Kitchen Staff</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Account Status <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={userForm.status}
                  onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={userForm.phone}
                  onChange={e => {
                    setUserForm({ ...userForm, phone: e.target.value });
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                  }}
                  placeholder="e.g. +91 98765 43210"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.phone ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
                {formErrors.phone && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {formErrors.phone}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={userForm.email}
                  onChange={e => {
                    setUserForm({ ...userForm, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  placeholder="e.g. rajesh@serviq.com"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: formErrors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box'
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={userForm.password}
                onChange={e => {
                  setUserForm({ ...userForm, password: e.target.value });
                  if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                }}
                placeholder="e.g. securepass123"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: formErrors.password ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {formErrors.password && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {formErrors.password}
                </span>
              )}
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
      {/* Main Card Container */}
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
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              User Accounts
            </h2>
            
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleExportCSV}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px', fontWeight: 600 }}
            >
              <DownloadIcon size={14} /> Export CSV
            </button>
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
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name, email, phone or role..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              minWidth: '260px',
              outline: 'none'
            }}
          />
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              background: '#ffffff',
              outline: 'none'
            }}
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Branch Admin">Branch Admin</option>
            <option value="Manager">Manager</option>
            <option value="Waiter">Waiter</option>
            <option value="Kitchen">Kitchen Staff</option>
          </select>
        </div>

        {/* Users Table */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                  S.NO.
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  USER ID
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  FULL NAME
                </th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  BRANCH ASSIGNMENT
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
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, index) => {
                const isActive = u.status === 'Active' || u.status === 'On Duty';
                const branchObj = branches.find(b => b.id === u.branchId);

                return (
                  <tr 
                    key={u.id || index} 
                    style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background 0.15s' 
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* S.NO. */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                      {index + 1}
                    </td>

                    {/* USER ID */}
                    <td style={{ padding: '16px 18px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                      {u.id}
                    </td>

                    {/* FULL NAME */}
                    <td style={{ padding: '16px 18px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {u.name}
                    </td>

                    {/* BRANCH ASSIGNMENT */}
                    <td style={{ padding: '16px 18px' }}>
                      {u.branchId === 'ALL' ? (
                        <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          All Branches (HQ)
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', background: '#f8fafc', color: '#334155', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {branchObj ? `${branchObj.branchCode}` : u.branchId}
                        </span>
                      )}
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
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openEditUser(u)}
                          title="Edit User"
                          style={{
                            background: 'transparent',
                            border: '1px solid #cbd5e1',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#475569'
                          }}
                        >
                          <PencilIcon size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          title="Delete User"
                          style={{
                            background: 'transparent',
                            border: '1px solid #fee2e2',
                            borderRadius: '6px',
                            padding: '6px',
                            cursor: 'pointer',
                            color: '#dc2626'
                          }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '13px' }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete User Account"
        maxWidth="440px"
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 20px 0' }}>
            Are you sure you want to delete user <strong>"{userToDelete?.name}"</strong> ({userToDelete?.email})? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={handleDeleteConfirm}
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
