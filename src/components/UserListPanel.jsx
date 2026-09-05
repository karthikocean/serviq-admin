import React, { useState, useEffect } from 'react';
import { useAppState } from '../config/AppContext';
import UserApi from '../api/User';
import BranchApi from '../api/Branch';
import RoleApi from '../api/Role';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import { sanitizeMobile, validateMobile, validatePassword } from '../helper/ValidationHelper.js';
import SearchableSelect from './SearchableSelect.jsx';

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

const KeyIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function UserListPanel() {
  const { currentUser, selectedBranchId } = useAppState();
  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase();
  const userType = (userTypeStr || '').toUpperCase();
  const isAdmin = userRole === 'admin' || userRole === 'super admin' || userRole === 'owner' || userRole === 'restaurant_owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'SUPER_ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';
  const currentBranchId = typeof currentUser?.branchId === 'object' ? (currentUser?.branchId?._id || currentUser?.branchId?.id) : currentUser?.branchId;
  const isAllBranches = !selectedBranchId || selectedBranchId === 'ALL';
  const activeFilteredBranchId = !isAllBranches
    ? selectedBranchId
    : (!isAdmin && currentBranchId ? currentBranchId : null);

  const [viewState, setViewState] = useState('list'); // 'list' | 'form'
  const [editingUserId, setEditingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [changePasswordUserId, setChangePasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const DEFAULT_STAFF_ROLES = [
    { _id: 'Branch manager', roleName: 'Branch manager' },
    { _id: 'Kitchen', roleName: 'Kitchen' },
    { _id: 'Waiter', roleName: 'Waiter' }
  ];

  const mapToStandardRoles = (rolesFromApi = []) => {
    const targetRoles = [
      { key: 'Branch manager', displayName: 'Branch manager', aliases: ['branch manager', 'manager', 'branch admin', 'branch_admin', 'admin'] },
      { key: 'Kitchen', displayName: 'Kitchen', aliases: ['kitchen', 'kitchen staff', 'chef', 'cook'] },
      { key: 'Waiter', displayName: 'Waiter', aliases: ['waiter', 'server', 'captain', 'steward'] }
    ];

    return targetRoles.map(target => {
      const found = (rolesFromApi || []).find(r => {
        const name = (r.roleName || r.name || '').toLowerCase().trim();
        return target.aliases.some(a => name === a || name.includes(a));
      });

      if (found) {
        return {
          _id: found._id || found.id || target.displayName,
          roleName: target.displayName,
          originalRoleName: found.roleName || found.name
        };
      }

      return {
        _id: target.displayName,
        roleName: target.displayName
      };
    });
  };

  const isObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(String(id || '').trim());

  const ensureValidRoleId = async (targetRoleIdOrName, currentRoles = []) => {
    if (isObjectId(targetRoleIdOrName)) return targetRoleIdOrName;

    const clean = String(targetRoleIdOrName || '').toLowerCase().trim();
    const matched = (currentRoles || []).find(r => {
      if (!isObjectId(r._id)) return false;
      const name = String(r.roleName || r.name || '').toLowerCase().trim();
      if (clean.includes('branch') || clean.includes('manager')) return name.includes('branch') || name.includes('manager') || name.includes('admin');
      if (clean.includes('kitchen')) return name.includes('kitchen') || name.includes('chef');
      if (clean.includes('waiter')) return name.includes('waiter') || name.includes('server');
      return name === clean;
    });

    if (matched && isObjectId(matched._id)) return matched._id;

    try {
      const serverRoles = await RoleApi.getRoles();
      if (serverRoles?.status && Array.isArray(serverRoles.response.data)) {
        const sMatch = serverRoles.response.data.find(r => {
          if (!isObjectId(r._id)) return false;
          const name = String(r.roleName || r.name || '').toLowerCase().trim();
          if (clean.includes('branch') || clean.includes('manager')) return name.includes('branch') || name.includes('manager') || name.includes('admin');
          if (clean.includes('kitchen')) return name.includes('kitchen') || name.includes('chef');
          if (clean.includes('waiter')) return name.includes('waiter') || name.includes('server');
          return name === clean;
        });
        if (sMatch && isObjectId(sMatch._id)) return sMatch._id;
      }
    } catch (e) {
      console.error("Error checking roles:", e);
    }

    let roleTitle = 'Branch manager';
    if (clean.includes('kitchen')) roleTitle = 'Kitchen';
    else if (clean.includes('waiter')) roleTitle = 'Waiter';

    try {
      const createRes = await RoleApi.createRole({
        roleName: roleTitle,
        permissions: {
          dashboard: { view: true, add: true, edit: true, delete: false },
          orders: { view: true, add: true, edit: true, delete: false },
          menu: { view: true, add: false, edit: false, delete: false },
          tables: { view: true, add: true, edit: true, delete: false }
        }
      }, true);
      const createdId = createRes?.response?.data?._id || createRes?.response?.data?.id;
      if (createdId && isObjectId(createdId)) {
        return createdId;
      }
    } catch (createErr) {
      console.error("Error creating role:", createErr);
    }

    return targetRoleIdOrName;
  };

  const [apiUsers, setApiUsers] = useState([]);
  const [apiBranches, setApiBranches] = useState([]);
  const [apiRoles, setApiRoles] = useState(DEFAULT_STAFF_ROLES);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  const fetchData = async () => {
    setIsLoading(true);
    const [usersRes, branchesRes, rolesRes] = await Promise.all([
      UserApi.getUsers({ 
        page, 
        limit, 
        search: searchQuery, 
        roleFilter: roleFilter === 'All' ? '' : roleFilter,
        statusFilter: statusFilter === 'All' ? '' : statusFilter
      }),
      BranchApi.getBranches(),
      RoleApi.getRoles()
    ]);
    if (usersRes?.status) {
      setApiUsers(usersRes.response.data || []);
      setTotalPages(usersRes.response.totalPages || 1);
      setTotalRecords(usersRes.response.total || 0);
    }
    if (branchesRes?.status) setApiBranches(branchesRes.response.data || []);
    if (rolesRes?.status && Array.isArray(rolesRes.response.data)) {
      const mapped = mapToStandardRoles(rolesRes.response.data);
      setApiRoles(mapped);

      const missing = mapped.filter(r => !isObjectId(r._id));
      if (missing.length > 0) {
        Promise.all(missing.map(mr => RoleApi.createRole({
          roleName: mr.roleName,
          permissions: {
            dashboard: { view: true, add: true, edit: true, delete: false },
            orders: { view: true, add: true, edit: true, delete: false },
            menu: { view: true, add: false, edit: false, delete: false },
            tables: { view: true, add: true, edit: true, delete: false }
          }
        }, true))).then(async () => {
          const freshRolesRes = await RoleApi.getRoles();
          if (freshRolesRes?.status && Array.isArray(freshRolesRes.response.data)) {
            setApiRoles(mapToStandardRoles(freshRolesRes.response.data));
          }
        }).catch(err => console.error("Auto-seeding roles error:", err));
      }
    } else {
      setApiRoles(DEFAULT_STAFF_ROLES);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchQuery, roleFilter, statusFilter]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = page + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const [userForm, setUserForm] = useState({
    name: '',
    branchId: '',
    roleId: '',
    status: 'Active',
    phone: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const openAddUser = () => {
    setEditingUserId(null);
    const defaultBranch = (!isAdmin && currentBranchId)
      ? currentBranchId
      : (activeFilteredBranchId || (apiBranches.length > 0 ? apiBranches[0]._id : ''));
    setUserForm({
      name: '',
      branchId: defaultBranch || '',
      roleId: '',
      status: 'Active',
      phone: '',
      email: '',
      password: 'user' + Math.floor(100 + Math.random() * 900)
    });
    setFormErrors({});
    setViewState('form');
  };

  const openEditUser = (user) => {
    setEditingUserId(user._id);
    const userBranch = typeof user.branchId === 'object' ? user.branchId?._id : user.branchId;
    setUserForm({
      name: user.name || '',
      branchId: (!isAdmin && currentBranchId) ? currentBranchId : (userBranch || (apiBranches.length > 0 ? apiBranches[0]._id : '')),
      roleId: (typeof user.roleId === 'object' ? user.roleId?._id : user.roleId) || (apiRoles.length > 0 ? apiRoles[0]._id : ''),
      status: user.isActive ? 'Active' : 'Inactive',
      phone: user.phoneNumber || '',
      email: user.email || '',
      password: ''
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

    if (!userForm.branchId) {
      errors.branchId = 'Branch selection is required.';
    }

    if (!userForm.roleId) {
      errors.roleId = 'Role selection is required.';
    }

    const mobileErr = validateMobile(userForm.phone);
    if (mobileErr) {
      errors.phone = mobileErr;
    }

    const emailTrimmed = (userForm.email || '').trim();
    if (!emailTrimmed) {
      errors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!editingUserId) {
      const passwordErr = validatePassword(userForm.password);
      if (passwordErr) {
        errors.password = passwordErr;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const resolvedRoleId = await ensureValidRoleId(userForm.roleId, apiRoles);
    const roleName = apiRoles.find(r => r._id === userForm.roleId || r._id === resolvedRoleId)?.roleName || (typeof userForm.roleId === 'string' ? userForm.roleId : '');
    const isBranchAdmin = roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('manager');

    const payload = {
      name: userForm.name.trim(),
      roleId: resolvedRoleId,
      branchId: userForm.branchId,
      userType: isBranchAdmin ? 'BRANCH_ADMIN' : 'STAFF',
      status: userForm.status,
      phoneNumber: userForm.phone.trim(),
    };

    if (userForm.email.trim()) {
      payload.email = userForm.email.trim();
    }

    let res;
    if (editingUserId) {
      res = await UserApi.updateUser(editingUserId, payload);
    } else {
      payload.password = userForm.password;
      res = await UserApi.createUser(payload);
    }

    if (res.status) {
      setViewState('list');
      fetchData();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    const res = await UserApi.deleteUser(userToDelete._id);
    if (res.status) {
      setUserToDelete(null);
      fetchData();
    }
  };

  const handleChangePasswordSubmit = async () => {
    if (!newPassword || newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      return;
    }
    const res = await UserApi.changePassword(changePasswordUserId._id, newPassword);
    if (res.status) {
      setChangePasswordUserId(null);
      setNewPassword('');
      setPasswordError('');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (apiUsers.length === 0) {
      ShowNotifications.showAlertNotification('No user records to export.', false);
      return;
    }
    const headers = ['Full Name', 'Branch', 'Role', 'Email', 'Phone', 'Status', 'Last Login'];
    const rows = apiUsers.map(u => {
      const uRoleId = typeof u.roleId === 'object' ? u.roleId?._id : u.roleId;
      const uBranchId = typeof u.branchId === 'object' ? u.branchId?._id : u.branchId;
      const uRole = u.roleId?.roleName || apiRoles.find(r => r._id === uRoleId)?.roleName || 'Unknown';
      const branchObj = u.branchId?.branchName ? u.branchId : (apiBranches.find(b => b._id === uBranchId || b.id === uBranchId));
      const uBranch = branchObj ? (branchObj.branchName || branchObj.name) : (uBranchId ? 'Main Branch' : 'All Branches');
      return [
        `"${u.name}"`,
        `"${uBranch}"`,
        `"${uRole}"`,
        `"${u.email || ''}"`,
        `"${u.phoneNumber}"`,
        `"${u.isActive ? 'Active' : 'Inactive'}"`,
        `"N/A"`
      ];
    });

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
      <section className="panel-view active" style={{ padding: '0 24px 24px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 28px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setViewState('list')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                {editingUserId ? 'Edit User Account' : 'Create User Account'}
              </h2>
            </div>
          </div>
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
                {(() => {
                  const allBranchesList = (apiBranches && apiBranches.length > 0) ? apiBranches : (activeRestaurant?.branches || []);
                  const isLocked = !isAdmin || (selectedBranchId && selectedBranchId !== 'ALL');
                  const headerBranchObj = (selectedBranchId && selectedBranchId !== 'ALL')
                    ? allBranchesList.find(b => String(b._id || b.id) === String(selectedBranchId) || String(b.branchCode) === String(selectedBranchId))
                    : null;
                  const currentBranchObj = headerBranchObj 
                    || allBranchesList.find(b => String(b._id || b.id) === String(userForm.branchId))
                    || allBranchesList.find(b => String(b.branchCode) === String(userForm.branchId))
                    || (allBranchesList.length > 0 ? allBranchesList[0] : null);
                  const effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (userForm.branchId || '');

                  return (
                    <>
                      <SearchableSelect
                        value={effectiveVal}
                        onChange={e => {
                          setUserForm({ ...userForm, branchId: e.target.value });
                          if (formErrors.branchId) setFormErrors({ ...formErrors, branchId: '' });
                        }}
                        isDisabled={isLocked}
                        options={allBranchesList.length === 0 ? [
                          { value: '', label: 'Main Branch' }
                        ] : allBranchesList.map(b => ({
                          value: b._id || b.id,
                          label: `${b.branchName || b.name || 'Branch'}${b.branchCode ? ` (${b.branchCode})` : ''}`
                        }))}
                        placeholder="Select Branch..."
                      />
                      {isLocked && (
                        <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                          Branch is locked to currently selected branch.
                        </span>
                      )}
                    </>
                  );
                })()}
                {formErrors.branchId && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {formErrors.branchId}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Access Role <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={userForm.roleId}
                  onChange={e => {
                    setUserForm({ ...userForm, roleId: e.target.value });
                    if (formErrors.roleId) setFormErrors({ ...formErrors, roleId: '' });
                  }}
                  options={apiRoles.map(r => ({
                    value: r._id,
                    label: r.roleName
                  }))}
                  placeholder="Select a role..."
                />
                {formErrors.roleId && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                    {formErrors.roleId}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Account Status <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={userForm.status}
                  onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' }
                  ]}
                  placeholder="Select Status..."
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  maxLength={10}
                  inputMode="numeric"
                  value={userForm.phone}
                  onChange={e => {
                    const val = sanitizeMobile(e.target.value);
                    setUserForm({ ...userForm, phone: val });
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                  }}
                  placeholder="10 digit mobile number"
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

            {!editingUserId && (
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
                  placeholder="••••••••••••"
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
            )}

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
                {editingUserId ? 'Save Changes' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px', width: '100%' }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
      }}>
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

        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, phone or role..."
              value={searchQuery}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={e => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchQuery(val);
                setPage(0);
              }}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 14px 0 38px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ minWidth: '180px' }}>
            <SearchableSelect
              value={roleFilter}
              onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
              options={[
                { value: 'All', label: 'All Roles' },
                ...apiRoles.map(r => ({
                  value: r._id,
                  label: r.roleName
                }))
              ]}
              placeholder="Filter Role..."
            />
          </div>
          <div style={{ minWidth: '160px' }}>
            <SearchableSelect
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active Users' },
                { value: 'Inactive', label: 'Inactive Users' }
              ]}
              placeholder="Filter Status..."
            />
          </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>
                  S.NO.
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
              {apiUsers.map((user, index) => {
                const uRoleId = typeof user.roleId === 'object' ? user.roleId?._id : user.roleId;
                const uBranchId = typeof user.branchId === 'object' ? user.branchId?._id : user.branchId;
                const uRoleName = user.roleId?.roleName || apiRoles.find(r => r._id === uRoleId)?.roleName || 'Unknown';
                const branchObj = user.branchId?.branchName ? user.branchId : (apiBranches.find(b => b._id === uBranchId || b.id === uBranchId));
                const uBranchName = branchObj ? (branchObj.branchName || branchObj.name) : (uBranchId ? 'Main Branch' : 'All Branches');
                
                let roleBadgeStyle = {
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: '1.5px solid transparent'
                };

                const roleLower = uRoleName.toLowerCase();
                if (roleLower.includes('super admin')) {
                  roleBadgeStyle.backgroundColor = '#f3e8ff';
                  roleBadgeStyle.color = '#7e22ce';
                  roleBadgeStyle.borderColor = '#d8b4fe';
                } else if (roleLower.includes('branch admin')) {
                  roleBadgeStyle.backgroundColor = '#e0e7ff';
                  roleBadgeStyle.color = '#4338ca';
                  roleBadgeStyle.borderColor = '#c7d2fe';
                } else if (roleLower.includes('manager')) {
                  roleBadgeStyle.backgroundColor = '#fff7ed';
                  roleBadgeStyle.color = '#c2410c';
                  roleBadgeStyle.borderColor = '#fed7aa';
                } else {
                  roleBadgeStyle.backgroundColor = '#f1f5f9';
                  roleBadgeStyle.color = '#475569';
                  roleBadgeStyle.borderColor = '#cbd5e1';
                }

                let statusBadgeStyle = {
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700'
                };

                if (user.status === 'Active' || (!user.status && user.isActive)) {
                  statusBadgeStyle.backgroundColor = '#e6f4ea';
                  statusBadgeStyle.color = '#16a34a';
                  statusBadgeStyle.border = '1.5px solid #86efac';
                } else {
                  statusBadgeStyle.backgroundColor = '#fee2e2';
                  statusBadgeStyle.color = '#dc2626';
                  statusBadgeStyle.border = '1.5px solid #fca5a5';
                }

                return (
                  <tr
                    key={user._id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                      {page * limit + index + 1}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                      {user.name}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                      {uBranchName}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                      {user.email || 'N/A'}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '13px', color: '#475569', fontWeight: '500' }}>
                      {user.phoneNumber}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={roleBadgeStyle}>
                        {uRoleName}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={statusBadgeStyle}>
                        {user.status || (user.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => openEditUser(user)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                          onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                          title="Edit User"
                        >
                          <PencilIcon size={16} />
                        </button>
                        <button
                        title="Change Password"
                        onClick={() => {
                          setChangePasswordUserId(user);
                          setNewPassword('');
                          setPasswordError('');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '6px',
                          color: '#eab308',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fef9c3'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                      >
                        <KeyIcon />
                      </button>
                      <button
                          type="button"
                          onClick={() => setUserToDelete(user)}
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
              {apiUsers.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '50%', color: '#94a3b8' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#334155' }}>No users found</p>
                      <p style={{ margin: 0, fontSize: '14px' }}>Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          borderRadius: '0 0 16px 16px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Left Info Text */}
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
            Showing {totalRecords === 0 ? 0 : (page * limit) + 1} to {Math.min((page + 1) * limit, totalRecords)} of {totalRecords} entries
          </div>

          {/* Right Pagination Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: page === 0 ? '#f8fafc' : '#ffffff',
                color: page === 0 ? '#cbd5e1' : '#334155',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum - 1)}
                style={{
                  minWidth: '34px',
                  height: '34px',
                  padding: '0 8px',
                  borderRadius: '8px',
                  border: pageNum === page + 1 ? 'none' : '1px solid #e2e8f0',
                  background: pageNum === page + 1 ? '#000000' : '#ffffff',
                  color: pageNum === page + 1 ? '#ffffff' : '#334155',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: pageNum === page + 1 ? '0 3px 10px rgba(0,0,0,0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages - 1 || totalPages === 0}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (page >= totalPages - 1 || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page >= totalPages - 1 || totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '0.82rem',
                fontWeight: '600',
                cursor: (page >= totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete User Account"
        maxWidth="440px"
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            Are you sure you want to delete user <strong>{userToDelete?.name}</strong>? This action cannot be undone and will immediately revoke their access.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
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

      <Modal
        isOpen={!!changePasswordUserId}
        onClose={() => setChangePasswordUserId(null)}
        title="Change Password"
        maxWidth="440px"
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#475569' }}>
            Set a new password for <strong>{changePasswordUserId?.name}</strong>.
          </p>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
              New Password <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              value={newPassword}
              onChange={e => {
                setNewPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              placeholder="Enter new password"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: passwordError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            {passwordError && (
              <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                {passwordError}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setChangePasswordUserId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              style={{
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer'
              }}
              onClick={handleChangePasswordSubmit}
            >
              Save Password
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
