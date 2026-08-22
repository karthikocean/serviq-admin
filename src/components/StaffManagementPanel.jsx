import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../config/AppContext';
import UserApi from '../api/User';
import BranchApi from '../api/Branch';
import RoleApi from '../api/Role';
import TableApi from '../api/Table';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import { sanitizeMobile, validateMobile } from '../helper/ValidationHelper.js';

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
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const KeyIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const TableAssignIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M4 6h16" />
    <path d="M5 6v12" />
    <path d="M19 6v12" />
    <path d="M10 6v6" />
    <path d="M14 6v6" />
  </svg>
);

export default function StaffManagementPanel({
  tables = [],
  orders = [],
  handleOpenAssignTablesModal,
  openKitchenSettingsModal
}) {
  const { currentUser: user, selectedBranchId } = useContext(AppContext);
  const currentBranchId = typeof user?.branchId === 'object' ? user?.branchId?._id : user?.branchId;
  const activeFilteredBranchId = (selectedBranchId && selectedBranchId !== 'ALL')
    ? selectedBranchId
    : currentBranchId;
  const isAdmin = user?.userType === 'RESTAURANT_OWNER' || user?.userType === 'SUPER_ADMIN';

  const [viewState, setViewState] = useState('list'); // 'list' | 'form'
  const [editingUserId, setEditingUserId] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [changePasswordUserId, setChangePasswordUserId] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [apiUsers, setApiUsers] = useState([]);

  // Waiter assignment modal states
  const [showAssignTablesModal, setShowAssignTablesModal] = useState(false);
  const [modalWaiterId, setModalWaiterId] = useState('');
  const [modalTableIds, setModalTableIds] = useState([]);
  const [modalCoverWaiterId, setModalCoverWaiterId] = useState('');
  const [apiStations, setApiStations] = useState([]);
  const [apiBranches, setApiBranches] = useState([]);
  const [apiRoles, setApiRoles] = useState([]);
  const [apiTables, setApiTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  const [showKitchenModal, setShowKitchenModal] = useState(false);
  const [kitchenViewState, setKitchenViewState] = useState('list'); // 'list' or 'add'
  const [selectedStationBranchId, setSelectedStationBranchId] = useState(activeFilteredBranchId || '');
  const [kitchenForm, setKitchenForm] = useState({ branchId: '', email: '', password: '' });
  const [kitchenFormErrors, setKitchenFormErrors] = useState({});

  useEffect(() => {
    if (apiBranches.length > 0 && !selectedStationBranchId) {
      setSelectedStationBranchId(activeFilteredBranchId || apiBranches[0]._id);
    }
  }, [apiBranches, selectedStationBranchId, activeFilteredBranchId]);

  const availableBranchesForStation = (activeFilteredBranchId
    ? apiBranches.filter(b => b._id === activeFilteredBranchId)
    : apiBranches
  ).filter(b =>
    !apiStations.some(s => (typeof s.branchId === 'object' ? s.branchId?._id === b._id : s.branchId === b._id))
  );

  const fetchData = async () => {
    setIsLoading(true);
    const [usersRes, stationsRes, branchesRes, rolesRes, tablesRes] = await Promise.all([
      UserApi.getUsers({
        page,
        limit,
        search: searchQuery,
        roleFilter: roleFilter === 'All' ? '' : roleFilter,
        statusFilter: statusFilter === 'All' ? '' : statusFilter,
        branchId: selectedBranchId || ''
      }),
      UserApi.getStations({ branchId: selectedBranchId || '' }),
      BranchApi.getBranches(),
      RoleApi.getRoles(),
      TableApi.getTables({ branchId: selectedBranchId || '' })
    ]);
    if (usersRes?.status) {
      setApiUsers(usersRes.response.data || []);
      setTotalPages(usersRes.response.totalPages || 1);
      setTotalRecords(usersRes.response.total || 0);
    }
    if (stationsRes?.status) setApiStations(stationsRes.response.data || []);
    if (branchesRes?.status) setApiBranches(branchesRes.response.data || []);
    if (rolesRes?.status) setApiRoles(rolesRes.response.data || []);
    if (tablesRes?.status) setApiTables(tablesRes.response.data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, searchQuery, roleFilter, statusFilter, selectedBranchId]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
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
    dutyStatus: 'On Duty',
    phone: '',
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const openAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      name: '',
      branchId: (!isAdmin && currentBranchId) ? currentBranchId : '',
      roleId: '',
      status: 'Active',
      dutyStatus: 'ON_DUTY',
      phone: '',
      email: '',
      password: 'user' + Math.floor(100 + Math.random() * 900)
    });
    setFormErrors({});
    setViewState('form');
  };

  const openEditUser = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name || '',
      branchId: (typeof user.branchId === 'object' ? user.branchId?._id : user.branchId) || (apiBranches.length > 0 ? apiBranches[0]._id : ''),
      roleId: (typeof user.roleId === 'object' ? user.roleId?._id : user.roleId) || (apiRoles.length > 0 ? apiRoles[0]._id : ''),
      status: user.isActive ? 'Active' : 'Inactive',
      dutyStatus: user.dutyStatus || 'ON_DUTY',
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

    const roleName = apiRoles.find(r => r._id === userForm.roleId)?.roleName || '';
    const isKitchenEmployee = roleName.toLowerCase().includes('kitchen');

    if (!editingUserId && !isKitchenEmployee) {
      if (!userForm.password || !userForm.password.trim()) {
        errors.password = 'Password is required.';
      } else if (userForm.password.length < 4) {
        errors.password = 'Password must be at least 4 characters.';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const roleName = apiRoles.find(r => r._id === userForm.roleId)?.roleName || '';
    const isBranchAdmin = roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('manager');
    const isKitchenEmployee = roleName.toLowerCase().includes('kitchen');

    const payload = {
      name: userForm.name.trim(),
      roleId: userForm.roleId,
      branchId: userForm.branchId,
      userType: isBranchAdmin ? 'BRANCH_ADMIN' : 'STAFF',
      status: userForm.status,
      dutyStatus: userForm.dutyStatus,
      phoneNumber: userForm.phone.trim(),
    };

    if (!isKitchenEmployee && userForm.email.trim()) {
      payload.email = userForm.email.trim();
    }

    let res;
    if (editingUserId) {
      res = await UserApi.updateUser(editingUserId, payload);
    } else {
      if (!isKitchenEmployee) {
        payload.password = userForm.password;
      }
      res = await UserApi.createUser(payload);
    }

    if (res.status) {
      setViewState('list');
      fetchData();
    }
  };

  const handleKitchenStationSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!kitchenForm.branchId) errors.branchId = 'Branch is required.';
    if (!kitchenForm.email.trim()) errors.email = 'Email is required.';
    if (!kitchenForm.password.trim()) errors.password = 'Password is required.';

    setKitchenFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const kitchenRole = apiRoles.find(r => r.roleName.toLowerCase().includes('kitchen'));
    const branch = apiBranches.find(b => b._id === kitchenForm.branchId);

    if (!kitchenRole) {
      ShowNotifications.showAlertNotification("Kitchen role not found in the system.", false);
      return;
    }

    const payload = {
      name: (branch ? branch.branchName : 'Branch') + ' Kitchen',
      roleId: kitchenRole._id,
      branchId: kitchenForm.branchId,
      userType: 'STATION',
      email: kitchenForm.email.trim(),
      password: kitchenForm.password,
      status: 'Active'
    };

    const res = await UserApi.createUser(payload);
    if (res.status) {
      setKitchenViewState('list');
      setKitchenForm({ branchId: kitchenForm.branchId, email: '', password: '' });
      fetchData();
      ShowNotifications.showAlertNotification("Kitchen Station account created successfully!", true);
    }
  };

  const handleToggleDuty = async (user) => {
    const nextDutyStatus = (user.dutyStatus === 'ON_DUTY' || !user.dutyStatus) ? 'OFF_DUTY' : 'ON_DUTY';
    const payload = { dutyStatus: nextDutyStatus };
    const res = await UserApi.updateUser(user._id, payload);
    if (res.status) {
      fetchData();
      ShowNotifications.showAlertNotification("Duty status updated.", true);
    }
  };

  const loadWaiterAssignments = (waiterId) => {
    setModalWaiterId(waiterId);
    if (waiterId) {
      const assignedTables = apiTables.filter(t => t.assignedWaiterId === waiterId);
      setModalTableIds(assignedTables.map(t => t._id || t.id));
      const firstTableWithCover = assignedTables.find(t => t.tempWaiterId);
      setModalCoverWaiterId(firstTableWithCover ? firstTableWithCover.tempWaiterId : '');
    } else {
      setModalTableIds([]);
      setModalCoverWaiterId('');
    }
  };

  const openAssignTablesModal = (waiterId) => {
    const waiters = apiUsers.filter(s => {
      const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
      return rName?.toLowerCase().includes('waiter');
    });
    if (waiters.length === 0) {
      ShowNotifications.showAlertNotification("No waiters available to assign tables.", false);
      return;
    }
    loadWaiterAssignments(waiterId || waiters[0]._id);
    setShowAssignTablesModal(true);
  };

  const { assignTablesToWaiter, activeRestaurant } = useContext(AppContext);
  const handleSaveAssignments = async () => {
    if (!modalWaiterId) {
      ShowNotifications.showAlertNotification("Please select a waiter.", false);
      return;
    }
    const res = await TableApi.assignWaiter({
      waiterId: modalWaiterId,
      tableIds: modalTableIds,
      coverWaiterId: modalCoverWaiterId || null
    });
    if (res.status) {
      setShowAssignTablesModal(false);
      fetchData(); // Refresh tables and users
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

  const handleExportCSV = () => {
    if (apiUsers.length === 0) {
      ShowNotifications.showAlertNotification('No user records to export.', false);
      return;
    }
    const headers = ['Full Name', 'Branch', 'Role', 'Email', 'Phone', 'Account Status', 'Duty Status'];
    const rows = apiUsers.map(u => {
      const uRoleId = typeof u.roleId === 'object' ? u.roleId?._id : u.roleId;
      const uBranchId = typeof u.branchId === 'object' ? u.branchId?._id : u.branchId;
      const uRole = u.roleId?.roleName || apiRoles.find(r => r._id === uRoleId)?.roleName || 'Unknown';
      const uBranch = u.branchId?.branchName || (uBranchId ? (apiBranches.find(b => b._id === uBranchId)?.branchName || uBranchId) : 'All Branches');
      return [
        `"${u.name}"`,
        `"${uBranch}"`,
        `"${uRole}"`,
        `"${u.email || ''}"`,
        `"${u.phoneNumber}"`,
        `"${u.isActive ? 'Active' : 'Inactive'}"`,
        `"${u.dutyStatus || 'On Duty'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `serviq_staff_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    ShowNotifications.showAlertNotification('Staff list exported successfully!', true);
  };

  // Compute helpers for table assignments

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
            <ArrowLeftIcon size={14} /> Back to Staff List
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
            {editingUserId ? 'Edit Staff Member' : 'Add Staff Member'}
          </h2>
        <br></br>

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
                  onChange={e => {
                    setUserForm({ ...userForm, branchId: e.target.value });
                    if (formErrors.branchId) setFormErrors({ ...formErrors, branchId: '' });
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: formErrors.branchId ? '1.5px solid #ef4444' : '1px solid #cbd5e1', fontSize: '14px', background: !isAdmin ? '#f8fafc' : '#ffffff', cursor: !isAdmin ? 'not-allowed' : 'pointer', boxSizing: 'border-box' }}
                  disabled={!isAdmin}
                >
                  <option value="" disabled>Select a branch...</option>
                  {apiBranches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.branchName} ({b.branchCode})
                    </option>
                  ))}
                </select>
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
                <select
                  value={userForm.roleId}
                  onChange={e => {
                    setUserForm({ ...userForm, roleId: e.target.value });
                    if (formErrors.roleId) setFormErrors({ ...formErrors, roleId: '' });
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: formErrors.roleId ? '1.5px solid #ef4444' : '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="" disabled>Select a role...</option>
                  {apiRoles.map(r => (
                    <option key={r._id} value={r._id}>{r.roleName}</option>
                  ))}
                </select>
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
                  Duty Status
                </label>
                <select
                  value={userForm.dutyStatus}
                  onChange={e => setUserForm({ ...userForm, dutyStatus: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="ON_DUTY">On Duty</option>
                  <option value="OFF_DUTY">Off Duty</option>
                </select>
              </div>
            </div>

            {!(apiRoles.find(r => r._id === userForm.roleId)?.roleName?.toLowerCase().includes('kitchen')) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                    Email Address
                  </label>
                  <input
                    type="text"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="e.g. rajesh@serviq.com"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
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
                      placeholder="Set a secure password"
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
                {editingUserId ? 'Save Changes' : 'Create Staff Member'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  // Calculate KPIs based on apiUsers
  const waitersCount = apiUsers.filter(s => {
    const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
    return rName?.toLowerCase().includes('waiter');
  }).length;

  const waitersOnDuty = apiUsers.filter(s => {
    const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
    return rName?.toLowerCase().includes('waiter') && (!s.dutyStatus || s.dutyStatus === 'ON_DUTY');
  }).length;

  const kitchenStaffCount = apiUsers.filter(s => {
    const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
    return rName?.toLowerCase().includes('kitchen');
  }).length;

  const kitchenOnDuty = apiUsers.filter(s => {
    const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
    return rName?.toLowerCase().includes('kitchen') && (!s.dutyStatus || s.dutyStatus === 'ON_DUTY');
  }).length;

  const totalAssignedTables = apiTables.filter(t => t.assignedWaiterId || t.assignedWaiter).length;

  return (
    <section className="panel-view active" style={{ width: '100%', paddingBottom: '24px' }}>
      {/* Top Header & Quick Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        marginBottom: '20px',
        borderBottom: '1.5px solid #fdba74',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            Staff Management
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setKitchenForm({ branchId: apiBranches[0]?._id || '', email: '', password: '' });
              setKitchenFormErrors({});
              setShowKitchenModal(true);
            }}
            style={{
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              background: '#fff'
            }}
          >
            <KeyIcon size={15} color="#ea580c" />
            Kitchen Station Settings
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => openAssignTablesModal()}
            style={{
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px',
              background: '#fff'
            }}
          >
           
            Assign Tables
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '9px 16px', fontWeight: 600, borderRadius: '8px' }}
          >
            <DownloadIcon size={14} /> Export CSV
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddUser}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
          >
            + Add Staff Member
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Staff Records</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{totalRecords}</div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '2px' }}>Includes all branches and roles</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid #16a34a' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Waiters On Duty</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{waitersOnDuty} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {waitersCount}</span></div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Ready for table service</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid #ea580c' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kitchen Staff On Duty</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#ea580c', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{kitchenOnDuty} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {kitchenStaffCount}</span></div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Active food preparation</div>
        </div>

        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Dining Tables</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{totalAssignedTables} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {apiTables.length}</span></div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>Covered by on-duty waiters</div>
        </div>
      </div>

      {/* Search & Filtering Bar */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Search & Filter Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by staff name, email, phone..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f8fafc'
              }}
            />
            <svg
              style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#fff'
              }}
            >
              <option value="All">All Roles</option>
              {apiRoles.map(r => (
                <option key={r._id} value={r._id}>{r.roleName}</option>
              ))}
            </select>
          </div>

          {/* <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: '#fff'
              }}
            >
              <option value="All">All Account Statuses</option>
              <option value="Active">Active Staff</option>
              <option value="Inactive">Inactive Staff</option>
            </select>
          </div> */}

          {(searchQuery || roleFilter !== 'All' || statusFilter !== 'All') && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setRoleFilter('All'); setStatusFilter('All'); }}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Staff Unified Table */}
      <div style={{ overflowX: 'auto', borderRadius: '14px 14px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
              <th style={{ width: '4%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.NO</th>
              <th style={{ width: '18%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STAFF MEMBER</th>
              <th style={{ width: '10%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TYPE</th>
              <th style={{ width: '10%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROLE</th>
              <th style={{ width: '10%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BRANCH</th>
              <th style={{ width: '10%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PHONE</th>
              <th style={{ width: '10%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATION/TABLES</th>
              <th style={{ width: '8%', padding: '14px 10px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>DUTY STATUS</th>
              <th style={{ width: '10%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {apiUsers.map((user, index) => {
              const uRoleId = typeof user.roleId === 'object' ? user.roleId?._id : user.roleId;
              const uBranchId = typeof user.branchId === 'object' ? user.branchId?._id : user.branchId;
              const uRoleName = user.roleId?.roleName || apiRoles.find(r => r._id === uRoleId)?.roleName || 'Unknown';
              const uBranchName = user.branchId?.branchName || (uBranchId ? (apiBranches.find(b => b._id === uBranchId)?.branchName || uBranchId) : 'All Branches');

              const isWaiter = uRoleName.toLowerCase().includes('waiter');
              const isKitchen = uRoleName.toLowerCase().includes('kitchen');
              const isOnDuty = user.dutyStatus === 'ON_DUTY' || !user.dutyStatus; // default to on duty
              const assignedTables = isWaiter ? (user.assignedTableBadges || []) : [];

              return (
                <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  {/* 1. S.No */}
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {(page - 1) * limit + index + 1}
                  </td>

                  {/* 2. Staff Member (Avatar, Name, Email) */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: isWaiter ? '#ecfdf5' : (isKitchen ? '#ffedd5' : '#eff6ff'),
                        border: isWaiter ? '1px solid #a7f3d0' : (isKitchen ? '1px solid #fed7aa' : '1px solid #bfdbfe'),
                        color: isWaiter ? '#166534' : (isKitchen ? '#ea580c' : '#1d4ed8'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: '11px', color: user.isActive ? '#64748b' : '#ef4444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {user.isActive ? user.email || 'No email' : 'Account Inactive'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 3. Type */}
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    {user.userType === 'STATION' ? 'Station Account' : 'Employee'}
                  </td>

                  {/* 4. Role */}
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      background: isWaiter ? '#dcfce7' : (isKitchen ? '#ffedd5' : '#f1f5f9'),
                      color: isWaiter ? '#166534' : (isKitchen ? '#c2410c' : '#334155')
                    }}>
                      {isWaiter ? '🤵 Waiter' : (isKitchen ? '👨‍🍳 Kitchen' : `💼 ${uRoleName}`)}
                    </span>
                  </td>

                  {/* 5. Branch */}
                  <td style={{ padding: '12px 12px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                    {uBranchName}
                  </td>

                  {/* 5. Phone */}
                  <td style={{ padding: '12px 12px', fontSize: '12px', fontWeight: 600, color: '#475569', fontFamily: 'monospace' }}>
                    {user.phoneNumber}
                  </td>

                  {/* 6. Assignments / Station */}
                  <td style={{ padding: '12px 12px' }}>
                    {isWaiter ? (
                      assignedTables.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {assignedTables.map(tb => (
                            <span key={tb} style={{
                              background: '#fff7ed',
                              border: '1px solid #fed7aa',
                              color: '#c2410c',
                              fontSize: '10px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {tb}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                          Unassigned
                        </span>
                      )
                    ) : isKitchen ? (
                      <span style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        KDS Screen
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>General Duty</span>
                    )}
                  </td>

                  {/* 7. Duty Status with Toggle */}
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleDuty(user)}
                      title="Click to toggle duty status"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: (user.dutyStatus === 'ON_DUTY' || !user.dutyStatus) ? '#fff' : '#475569',
                        background: (user.dutyStatus === 'ON_DUTY' || !user.dutyStatus) ? '#10b981' : '#e2e8f0',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                    >
                      {isOnDuty ? 'ON DUTY' : 'OFF DUTY'}
                    </button>
                  </td>

                  {/* 8. Actions */}
                  <td style={{ padding: '12px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <button
                        type="button"
                        title="Edit Staff Member"
                        onClick={() => openEditUser(user)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                        title="Delete Staff Member"
                        onClick={() => setUserToDelete(user)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ea4335',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#b91c1c'; e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#ea4335'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {apiUsers.length === 0 && !isLoading && (
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
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#334155' }}>No staff members found</p>
                    <p style={{ margin: 0, fontSize: '14px' }}>Try adjusting your search or filters.</p>
                  </div>
                </td>
              </tr>
            )}

            {isLoading && (
              <tr>
                <td colSpan="8" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                  Loading staff data...
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
        border: '1px solid #e2e8f0',
        borderTop: 'none',
        borderRadius: '0 0 16px 16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Left Info Text */}
        <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
          Showing {totalRecords === 0 ? 0 : ((page - 1) * limit) + 1} to {Math.min(page * limit, totalRecords)} of {totalRecords} entries
        </div>

        {/* Right Pagination Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: page === 1 ? '#f8fafc' : '#ffffff',
              color: page === 1 ? '#cbd5e1' : '#334155',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Prev
          </button>

          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              type="button"
              onClick={() => setPage(pageNum)}
              style={{
                minWidth: '34px',
                height: '34px',
                padding: '0 8px',
                borderRadius: '8px',
                border: pageNum === page ? 'none' : '1px solid #e2e8f0',
                background: pageNum === page ? '#000000' : '#ffffff',
                color: pageNum === page ? '#ffffff' : '#334155',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: pageNum === page ? '0 3px 10px rgba(0,0,0,0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: page >= totalPages ? '#f8fafc' : '#ffffff',
              color: page >= totalPages ? '#cbd5e1' : '#334155',
              fontSize: '0.82rem',
              fontWeight: '600',
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Delete Staff Member"
        maxWidth="420px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>
            Are you sure you want to remove <strong>{userToDelete?.name}</strong> from the restaurant staff list? This action will immediately revoke their access.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setUserToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-black"
              style={{ background: '#dc2626', borderColor: '#dc2626' }}
              onClick={handleDeleteConfirm}
            >
              Delete Staff
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
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

      {/* Kitchen Station Credentials Modal */}
      <Modal
        isOpen={showKitchenModal}
        onClose={() => {
          setShowKitchenModal(false);
          setKitchenViewState('list');
        }}
        title="Kitchen Station Credentials"
        maxWidth="500px"
      >
        <div style={{ padding: '10px 0' }}>
          {kitchenViewState === 'list' ? (
            <>
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '20px', maxHeight: '300px', overflowY: 'auto' }}>
                {apiStations.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                    No kitchen station accounts found.
                  </div>
                ) : (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {apiStations.map((station, idx, arr) => (
                      <li key={station._id} style={{
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: idx !== arr.length - 1 ? '1px solid #e2e8f0' : 'none'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>{station.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {station.email || 'No email'} • {station.branchId?.branchName || 'Branch'}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setChangePasswordUserId(station);
                              setShowKitchenModal(false);
                            }}
                            title="Reset Password"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', fontSize: '16px' }}
                          >
                            🔑
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setUserToDelete(station);
                              setShowKitchenModal(false);
                            }}
                            title="Delete Station"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', fontSize: '16px' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  disabled={availableBranchesForStation.length === 0}
                  style={{
                    background: availableBranchesForStation.length === 0 ? '#94a3b8' : '#111827',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: availableBranchesForStation.length === 0 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => {
                    const defaultBranchId = availableBranchesForStation.length > 0 ? availableBranchesForStation[0]._id : (apiBranches[0]?._id || '');
                    setKitchenForm({ branchId: defaultBranchId, email: '', password: '' });
                    setKitchenViewState('add');
                  }}
                >
                  + Add New Station
                </button>
                {availableBranchesForStation.length === 0 && (
                  <span style={{ fontSize: '11px', color: '#ef4444', marginTop: '6px', fontWeight: 600 }}>All branches already have a Kitchen Station.</span>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleKitchenStationSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Branch <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={kitchenForm.branchId}
                  onChange={e => setKitchenForm({ ...kitchenForm, branchId: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: kitchenFormErrors.branchId ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px', background: '#ffffff', boxSizing: 'border-box'
                  }}
                >
                  <option value="" disabled>Select Branch</option>
                  {(activeFilteredBranchId
                    ? apiBranches.filter(b => b._id === activeFilteredBranchId)
                    : apiBranches
                  ).map(b => (
                    <option key={b._id} value={b._id}>{b.branchName}</option>
                  ))}
                </select>
                {kitchenFormErrors.branchId && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>{kitchenFormErrors.branchId}</span>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Kitchen Station Email
                </label>
                <input
                  type="text"
                  value={kitchenForm.email}
                  onChange={e => setKitchenForm({ ...kitchenForm, email: e.target.value })}
                  placeholder="kitchen@saravana.com"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: kitchenFormErrors.email ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
                {kitchenFormErrors.email && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>{kitchenFormErrors.email}</span>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                  Kitchen Station Password
                </label>
                <input
                  type="text"
                  value={kitchenForm.password}
                  onChange={e => setKitchenForm({ ...kitchenForm, password: e.target.value })}
                  placeholder="e.g. kitchen123"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: '8px',
                    border: kitchenFormErrors.password ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px', boxSizing: 'border-box'
                  }}
                />
                {kitchenFormErrors.password && (
                  <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>{kitchenFormErrors.password}</span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  style={{
                    background: '#fff', border: '1px solid #ff7a00', color: '#ff7a00',
                    borderRadius: '8px', padding: '10px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer'
                  }}
                  onClick={() => setKitchenViewState('list')}
                >
                  Back to List
                </button>
                <button
                  type="submit"
                  style={{
                    background: '#111827', color: '#ffffff', border: 'none',
                    borderRadius: '8px', padding: '10px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  Create Station Account
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* ASSIGN TABLES MODAL */}
      <Modal
        isOpen={showAssignTablesModal}
        onClose={() => setShowAssignTablesModal(false)}
        title="Assign Dining Tables to Waiter"
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', color: '#334155', marginTop: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Select Waiter</label>
            <select
              value={modalWaiterId}
              onChange={e => loadWaiterAssignments(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
                width: '100%'
              }}
            >
              <option value="" disabled>Select a Waiter</option>
              {apiUsers.filter(s => {
                const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
                return rName?.toLowerCase().includes('waiter');
              }).map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({(!s.dutyStatus || s.dutyStatus === 'ON_DUTY') ? 'On Duty' : 'Off Duty'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>Select Tables to Assign</label>
            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              padding: '12px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              backgroundColor: '#f8fafc'
            }}>
              {(() => {
                if (!modalWaiterId) {
                  return <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>Select a waiter to view tables</div>;
                }

                const filteredTables = apiTables.filter(t => {
                  const selectedWaiter = apiUsers.find(u => u._id === modalWaiterId);
                  const wBranchId = typeof selectedWaiter?.branchId === 'object' ? selectedWaiter.branchId?._id : selectedWaiter?.branchId;
                  const tBranchId = typeof t.branchId === 'object' ? t.branchId?._id : t.branchId;
                  return !wBranchId || !tBranchId || tBranchId === wBranchId;
                });

                if (filteredTables.length === 0) {
                  return <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>No tables found for this waiter's branch.</div>;
                }

                return filteredTables.map(table => {
                  const tId = table._id || table.id;
                  const isChecked = modalTableIds.includes(tId);
                  const currentlyAssigned = table.assignedWaiterId ? apiUsers.find(s => s._id === table.assignedWaiterId) : null;
                  const isAssignedToOther = currentlyAssigned && currentlyAssigned._id !== modalWaiterId;

                  return (
                    <label
                      key={tId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: '4px 0',
                        color: '#334155'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setModalTableIds([...modalTableIds, tId]);
                          } else {
                            setModalTableIds(modalTableIds.filter(id => id !== tId));
                          }
                        }}
                        style={{
                          accentColor: 'var(--primary)',
                          width: '16px',
                          height: '16px',
                          cursor: 'pointer'
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>Table {table.tableNo || table.tableNumber || tId} <span style={{ fontSize: '11px', color: '#94a3b8' }}>({table.seats || table.seatingCapacity || table.tableCapacity || 2} seats)</span></span>
                        {isAssignedToOther && (
                          <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: '500' }}>
                            Assigned: {currentlyAssigned.name}
                          </span>
                        )}
                      </div>
                    </label>
                  );
                });
              })()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
              Cover Waiter <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <select
              value={modalCoverWaiterId}
              onChange={e => setModalCoverWaiterId(e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                color: '#334155',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
                width: '100%'
              }}
            >
              <option value="">No Cover Waiter</option>
              {apiUsers.filter(s => {
                const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
                return rName?.toLowerCase().includes('waiter') && s._id !== modalWaiterId;
              }).map(s => (
                <option key={s._id} value={s._id}>
                  {s.name} ({(!s.dutyStatus || s.dutyStatus === 'ON_DUTY') ? 'On Duty' : 'Off Duty'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowAssignTablesModal(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveAssignments}
            >
              Save Assignments
            </button>
          </div>
        </div>
      </Modal>

    </section>
  );
}
