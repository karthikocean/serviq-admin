import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../config/AppContext';
import UserApi from '../api/User';
import BranchApi from '../api/Branch';
import RoleApi from '../api/Role';
import TableApi from '../api/Table';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import { sanitizeMobile, validateMobile } from '../helper/ValidationHelper.js';
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
  const roleStr = typeof user?.role === 'object' && user?.role !== null
    ? (user?.role?.roleName || user?.role?.name || '')
    : (typeof user?.role === 'string' ? user.role : '');
  const userTypeStr = typeof user?.userType === 'string' ? user.userType : '';

  const userRole = (roleStr || '').toLowerCase();
  const userType = (userTypeStr || '').toUpperCase();
  const isAdmin = userRole === 'admin' || userRole === 'super admin' || userRole === 'owner' || userRole === 'restaurant_owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'SUPER_ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';

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

    // Check latest server roles
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
      console.error("Error checking roles from server:", e);
    }

    // Auto-create role in database silently
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

  const [apiStations, setApiStations] = useState([]);
  const [apiBranches, setApiBranches] = useState([]);
  const [apiRoles, setApiRoles] = useState(DEFAULT_STAFF_ROLES);
  const [apiTables, setApiTables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [page, setPage] = useState(0);
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
        page: 0,
        limit: 500
      }),
      UserApi.getStations(),
      BranchApi.getBranches(),
      RoleApi.getRoles(),
      TableApi.getTables({ limit: 100 })
    ]);

    let list = [];
    if (usersRes?.status) {
      const raw = usersRes.response?.data || usersRes.response?.users || usersRes.response?.staff || (Array.isArray(usersRes.response) ? usersRes.response : []);
      if (Array.isArray(raw)) list = [...raw];
      else if (Array.isArray(raw?.data)) list = [...raw.data];
      else if (Array.isArray(raw?.users)) list = [...raw.users];
      else if (Array.isArray(raw?.staff)) list = [...raw.staff];
    }

    // Also merge any local staff from activeRestaurant
    if (Array.isArray(activeRestaurant?.staff)) {
      activeRestaurant.staff.forEach(st => {
        const exists = list.some(u => 
          String(u._id || u.id) === String(st._id || st.id) ||
          (u.email && st.email && u.email.toLowerCase() === st.email.toLowerCase()) ||
          (u.name && st.name && u.name.trim().toLowerCase() === st.name.trim().toLowerCase())
        );
        if (!exists) {
          list.push(st);
        }
      });
    }

    setApiUsers(list);
    if (stationsRes?.status) setApiStations(stationsRes.response.data || stationsRes.response || []);
    if (branchesRes?.status) setApiBranches(branchesRes.response.data || branchesRes.response || []);
    if (rolesRes?.status && Array.isArray(rolesRes.response.data || rolesRes.response)) {
      const mapped = mapToStandardRoles(rolesRes.response.data || rolesRes.response);
      setApiRoles(mapped);

      // Check if any standard roles are missing in the backend DB and auto-seed them
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
          if (freshRolesRes?.status && Array.isArray(freshRolesRes.response.data || freshRolesRes.response)) {
            setApiRoles(mapToStandardRoles(freshRolesRes.response.data || freshRolesRes.response));
          }
        }).catch(err => console.error("Auto-seeding roles error:", err));
      }
    } else {
      setApiRoles(DEFAULT_STAFF_ROLES);
    }
    if (tablesRes?.status) setApiTables(tablesRes.response.data || tablesRes.response?.tables || tablesRes.response || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  const filteredUsers = apiUsers.filter(u => {
    // 1. Branch filter
    if (activeFilteredBranchId) {
      const uBranchId = typeof u.branchId === 'object' ? u.branchId?._id : u.branchId;
      if (uBranchId && String(uBranchId) !== String(activeFilteredBranchId)) {
        return false;
      }
    }

    // 2. Role filter
    if (roleFilter && roleFilter !== 'All') {
      const uRoleId = typeof u.roleId === 'object' ? u.roleId?._id : u.roleId;
      const uRoleName = (u.roleId?.roleName || apiRoles.find(r => r._id === uRoleId)?.roleName || u.role || '').toLowerCase();
      const targetRoleObj = apiRoles.find(r => r._id === roleFilter);
      const targetRoleName = (targetRoleObj?.roleName || roleFilter).toLowerCase();
      const matchRole = String(uRoleId) === String(roleFilter) || uRoleName === targetRoleName || uRoleName.includes(targetRoleName);
      if (!matchRole) return false;
    }

    // 3. Status filter
    if (statusFilter && statusFilter !== 'All') {
      const isActive = u.isActive !== undefined ? Boolean(u.isActive) : (u.status !== 'Inactive' && u.status !== 'Off Duty');
      if (statusFilter === 'Active' && !isActive) return false;
      if (statusFilter === 'Inactive' && isActive) return false;
    }

    // 4. Search query
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (u.name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const phone = (u.phoneNumber || u.phone || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !phone.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const totalRecords = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const paginatedUsers = filteredUsers.slice(page * limit, (page + 1) * limit);

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    }
  }, [totalPages, page]);

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
    dutyStatus: 'ON_DUTY',
    phone: '',
    email: '',
    password: '',
    assignedTableIds: []
  });
  const [formErrors, setFormErrors] = useState({});

  const openAddUser = () => {
    setEditingUserId(null);
    const initialBranchId = (!isAdmin && currentBranchId)
      ? currentBranchId
      : ((selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : (apiBranches[0]?._id || ''));
    const waiterRole = apiRoles.find(r => r.roleName.toLowerCase().includes('waiter'));
    setUserForm({
      name: '',
      branchId: initialBranchId,
      roleId: waiterRole ? waiterRole._id : (apiRoles[0]?._id || ''),
      status: 'Active',
      dutyStatus: 'ON_DUTY',
      phone: '',
      email: '',
      password: 'user' + Math.floor(100 + Math.random() * 900),
      assignedTableIds: []
    });
    setFormErrors({});
    setViewState('form');
  };

  const openEditUser = (user) => {
    setEditingUserId(user._id);
    const userBranchId = (typeof user.branchId === 'object' ? user.branchId?._id : user.branchId) || (apiBranches.length > 0 ? apiBranches[0]._id : '');
    const userAssignedTableIds = apiTables
      .filter(t => {
        const wId = t.assignedWaiterId || (typeof t.assignedWaiter === 'object' ? t.assignedWaiter?._id : t.assignedWaiter);
        return String(wId) === String(user._id);
      })
      .map(t => t._id || t.id);

    setUserForm({
      name: user.name || '',
      branchId: userBranchId,
      roleId: (typeof user.roleId === 'object' ? user.roleId?._id : user.roleId) || (apiRoles.length > 0 ? apiRoles[0]._id : ''),
      status: user.isActive ? 'Active' : 'Inactive',
      dutyStatus: user.dutyStatus || 'ON_DUTY',
      phone: user.phoneNumber || '',
      email: user.email || '',
      password: '',
      assignedTableIds: userAssignedTableIds
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

    const emailTrimmed = (userForm.email || '').trim();
    if (emailTrimmed) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        errors.email = 'Please enter a valid email address (e.g. name@example.com).';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const resolvedRoleId = await ensureValidRoleId(userForm.roleId, apiRoles);
    const roleName = apiRoles.find(r => r._id === userForm.roleId || r._id === resolvedRoleId)?.roleName || (typeof userForm.roleId === 'string' ? userForm.roleId : '');
    const isBranchAdmin = roleName.toLowerCase().includes('admin') || roleName.toLowerCase().includes('manager');
    const isKitchenEmployee = roleName.toLowerCase().includes('kitchen');

    const payload = {
      name: userForm.name.trim(),
      roleId: resolvedRoleId,
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
      const savedUserId = editingUserId || res.response?.data?._id || res.response?.data?.id;
      const isWaiter = roleName.toLowerCase().includes('waiter');
      if (savedUserId && isWaiter) {
        try {
          await TableApi.assignWaiter({
            waiterId: savedUserId,
            tableIds: userForm.assignedTableIds || []
          });
          if (assignTablesToWaiter && activeRestaurant?.id) {
            assignTablesToWaiter(activeRestaurant.id, savedUserId, userForm.assignedTableIds || []);
          }
        } catch (tableErr) {
          console.error("Table assignment error:", tableErr);
        }
      }
      setViewState('list');
      fetchData();
    }
  };

  const handleKitchenStationSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!kitchenForm.branchId) errors.branchId = 'Branch is required.';
    if (!kitchenForm.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kitchenForm.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }
    if (!kitchenForm.password.trim()) errors.password = 'Password is required.';

    setKitchenFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const resolvedKitchenRoleId = await ensureValidRoleId('Kitchen', apiRoles);
    const branch = apiBranches.find(b => b._id === kitchenForm.branchId);

    const payload = {
      name: (branch ? branch.branchName : 'Branch') + ' Kitchen',
      roleId: resolvedKitchenRoleId,
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

  const resolveTableAssignedWaiter = (table, userList = apiUsers) => {
    if (!table) return null;
    if (table.assignedWaiter && typeof table.assignedWaiter === 'object') {
      const id = table.assignedWaiter._id || table.assignedWaiter.id;
      const name = table.assignedWaiter.name;
      if (id || name) {
        return {
          id: id || name,
          name: name || (id && userList?.find(u => String(u._id || u.id) === String(id))?.name) || 'Assigned Waiter'
        };
      }
    }
    if (table.assignedWaiterId && typeof table.assignedWaiterId === 'object') {
      const id = table.assignedWaiterId._id || table.assignedWaiterId.id;
      const name = table.assignedWaiterId.name;
      if (id || name) {
        return {
          id: id || name,
          name: name || (id && userList?.find(u => String(u._id || u.id) === String(id))?.name) || 'Assigned Waiter'
        };
      }
    }

    const rawId = table.assignedWaiterId || (typeof table.assignedWaiter === 'string' ? table.assignedWaiter : null) || table.waiterId;
    const rawName = table.assignedWaiterName || (typeof table.assignedWaiter === 'string' ? table.assignedWaiter : null);

    if (!rawId && !rawName) return null;

    if (userList && userList.length > 0) {
      const found = userList.find(u => {
        const uId = String(u._id || u.id || '');
        const uName = String(u.name || '').trim().toLowerCase();
        if (rawId && uId === String(rawId)) return true;
        if (rawName && uName === String(rawName).trim().toLowerCase()) return true;
        if (rawId && uName === String(rawId).trim().toLowerCase()) return true;
        return false;
      });
      if (found) {
        return {
          id: found._id || found.id,
          name: found.name
        };
      }
    }

    if (rawName && rawName !== 'Unassigned' && rawName !== 'null' && rawName !== 'undefined') {
      return { id: rawId || rawName, name: rawName };
    }
    if (rawId && isNaN(rawId) && typeof rawId === 'string' && !rawId.match(/^[0-9a-fA-F]{24}$/)) {
      return { id: rawId, name: rawId };
    }

    return null;
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
      const selectedWaiter = apiUsers.find(u => String(u._id || u.id) === String(waiterId));
      const assignedTables = apiTables.filter(t => {
        const assigned = resolveTableAssignedWaiter(t, apiUsers);
        if (!assigned) return false;
        return String(assigned.id) === String(waiterId) || 
          (selectedWaiter && String(assigned.name).trim().toLowerCase() === String(selectedWaiter.name).trim().toLowerCase());
      });
      setModalTableIds(assignedTables.map(t => t._id || t.id));
      const firstTableWithCover = assignedTables.find(t => t.tempWaiterId || t.coverWaiterId);
      setModalCoverWaiterId(firstTableWithCover ? (firstTableWithCover.tempWaiterId || firstTableWithCover.coverWaiterId) : '');
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
      if (assignTablesToWaiter && activeRestaurant?.id) {
        assignTablesToWaiter(activeRestaurant.id, modalWaiterId, modalTableIds, modalCoverWaiterId);
      }
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
      const branchObj = u.branchId?.branchName ? u.branchId : (apiBranches.find(b => b._id === uBranchId || b.id === uBranchId));
      const uBranch = branchObj ? (branchObj.branchName || branchObj.name) : (uBranchId ? 'Main Branch' : 'All Branches');
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
                {editingUserId ? 'Edit Staff Member' : 'Add Staff Member'}
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
                  Duty Status
                </label>
                <SearchableSelect
                  value={userForm.dutyStatus}
                  onChange={e => setUserForm({ ...userForm, dutyStatus: e.target.value })}
                  options={[
                    { value: 'ON_DUTY', label: 'On Duty' },
                    { value: 'OFF_DUTY', label: 'Off Duty' }
                  ]}
                  placeholder="Select Duty Status..."
                />
              </div>
            </div>

            {!(apiRoles.find(r => r._id === userForm.roleId)?.roleName?.toLowerCase().includes('kitchen')) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
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

  const totalAssignedTables = apiTables.filter(t => resolveTableAssignedWaiter(t, apiUsers)).length;

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
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 2fr) minmax(150px, 1fr) minmax(150px, 1fr) auto',
          gap: '12px',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by staff name, email, phone..."
              value={searchQuery}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchQuery(val);
                setPage(0);
              }}
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
            <SearchableSelect
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}
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

          <div>
            <SearchableSelect
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active Only' },
                { value: 'Inactive', label: 'Inactive Only' }
              ]}
              placeholder="Filter Status..."
            />
          </div>

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
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Staff Unified Table */}
      <div style={{ overflowX: 'auto', borderRadius: '14px 14px 0 0', border: '1px solid #e2e8f0', borderBottom: 'none', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', paddingBottom: '6px' }}>
        <table style={{ width: '100%', minWidth: '1150px', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
              <th style={{ width: '50px', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.NO</th>
              <th style={{ minWidth: '180px', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STAFF MEMBER</th>
              <th style={{ minWidth: '90px', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TYPE</th>
              <th style={{ minWidth: '100px', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ROLE</th>
              <th style={{ minWidth: '130px', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BRANCH</th>
              <th style={{ minWidth: '120px', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PHONE</th>
              <th style={{ minWidth: '140px', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATION/TABLES</th>
              <th style={{ minWidth: '120px', padding: '14px 10px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>DUTY STATUS</th>
              <th style={{ minWidth: '120px', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => {
              const uRoleId = typeof user.roleId === 'object' ? user.roleId?._id : user.roleId;
              const uBranchId = typeof user.branchId === 'object' ? user.branchId?._id : user.branchId;
              const uRoleName = user.roleId?.roleName || apiRoles.find(r => r._id === uRoleId)?.roleName || 'Unknown';
              const branchObj = user.branchId?.branchName ? user.branchId : (apiBranches.find(b => b._id === uBranchId || b.id === uBranchId));
              const uBranchName = branchObj ? (branchObj.branchName || branchObj.name) : (uBranchId ? 'Main Branch' : 'All Branches');

              const isWaiter = uRoleName.toLowerCase().includes('waiter');
              const isKitchen = uRoleName.toLowerCase().includes('kitchen');
              const isOnDuty = user.dutyStatus === 'ON_DUTY' || !user.dutyStatus; // default to on duty
              const assignedTables = isWaiter ? apiTables
                .filter(t => {
                  const assigned = resolveTableAssignedWaiter(t, apiUsers);
                  return assigned && (
                    String(assigned.id) === String(user._id || user.id) ||
                    String(assigned.name).trim().toLowerCase() === String(user.name).trim().toLowerCase()
                  );
                })
                .map(t => {
                  const tName = t.tableNo || t.tableNumber || t.id;
                  return tName.startsWith('Table') ? tName : `Table ${tName}`;
                }) : [];

              return (
                <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  {/* 1. S.No */}
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {page * limit + index + 1}
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
                  <td style={{ padding: '12px 10px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleDuty(user)}
                      title="Click to toggle duty status"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 800,
                        letterSpacing: '0.3px',
                        color: isOnDuty ? '#166534' : '#64748b',
                        background: isOnDuty ? '#dcfce7' : '#f1f5f9',
                        border: isOnDuty ? '1.5px solid #86efac' : '1.5px solid #cbd5e1',
                        cursor: 'pointer',
                        minWidth: '95px',
                        transition: 'all 0.15s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: isOnDuty ? '#16a34a' : '#94a3b8',
                        display: 'inline-block'
                      }}></span>
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

            {filteredUsers.length === 0 && !isLoading && (
              <tr>
                <td colSpan="9" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
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
                <td colSpan="9" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
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
                <input
                  type="text"
                  value={(() => {
                    const bObj = (apiBranches || []).find(b => b._id === kitchenForm.branchId || b.id === kitchenForm.branchId)
                      || (activeFilteredBranchId ? (apiBranches || []).find(b => b._id === activeFilteredBranchId || b.id === activeFilteredBranchId) : null)
                      || (apiBranches && apiBranches.length > 0 ? apiBranches[0] : null);
                    return bObj ? `${bObj.branchName || bObj.name || 'Branch'}${bObj.branchCode ? ` (${bObj.branchCode})` : ''}` : 'Main Branch';
                  })()}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0f172a',
                    backgroundColor: '#f8fafc',
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                />
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
            <SearchableSelect
              value={modalWaiterId}
              onChange={e => loadWaiterAssignments(e.target.value)}
              options={apiUsers.filter(s => {
                const rName = s.roleId?.roleName || apiRoles.find(r => r._id === s.roleId)?.roleName;
                return rName?.toLowerCase().includes('waiter');
              }).map(s => ({
                value: s._id,
                label: `${s.name} (${(!s.dutyStatus || s.dutyStatus === 'ON_DUTY') ? 'On Duty' : 'Off Duty'})`
              }))}
              placeholder="Select a Waiter..."
            />
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

                const selectedWaiter = apiUsers.find(u => String(u._id || u.id) === String(modalWaiterId));
                const wBranchId = typeof selectedWaiter?.branchId === 'object' ? selectedWaiter.branchId?._id : selectedWaiter?.branchId;

                const filteredTables = apiTables.filter(t => {
                  const tBranchId = typeof t.branchId === 'object' ? t.branchId?._id : t.branchId;
                  return !wBranchId || !tBranchId || String(tBranchId) === String(wBranchId);
                });

                if (filteredTables.length === 0) {
                  return <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>No tables found for this waiter's branch.</div>;
                }

                return filteredTables.map(table => {
                  const tId = table._id || table.id;
                  const currentlyAssigned = resolveTableAssignedWaiter(table, apiUsers);
                  const isAssignedToThisWaiter = currentlyAssigned && (
                    String(currentlyAssigned.id) === String(modalWaiterId) ||
                    (selectedWaiter && String(currentlyAssigned.name).trim().toLowerCase() === String(selectedWaiter.name).trim().toLowerCase())
                  );
                  const isAssignedToOther = currentlyAssigned && !isAssignedToThisWaiter;
                  const isChecked = modalTableIds.includes(tId);
                  const tableNameStr = `Table ${table.tableNo || table.tableNumber || tId}`;

                  return (
                    <div
                      key={tId}
                      onClick={(e) => {
                        if (isAssignedToOther) {
                          e.preventDefault();
                          e.stopPropagation();
                          ShowNotifications.showAlertNotification(`${tableNameStr} is already assigned to waiter "${currentlyAssigned.name}".`, false);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: isAssignedToOther ? '1.5px solid #fecaca' : (isChecked ? '1.5px solid #ff7a00' : '1px solid #e2e8f0'),
                        backgroundColor: isAssignedToOther ? '#fef2f2' : (isChecked ? '#fff7ed' : '#ffffff'),
                        cursor: isAssignedToOther ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                        opacity: isAssignedToOther ? 0.85 : 1
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={isAssignedToOther}
                        onChange={e => {
                          if (isAssignedToOther) {
                            ShowNotifications.showAlertNotification(`${tableNameStr} is already assigned to waiter "${currentlyAssigned.name}".`, false);
                            return;
                          }
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
                          cursor: isAssignedToOther ? 'not-allowed' : 'pointer',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '6px' }}>
                          <span style={{ color: isAssignedToOther ? '#991b1b' : '#0f172a', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {tableNameStr}
                          </span>
                          <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0 }}>
                            {table.seats || table.seatingCapacity || table.tableCapacity || 2} seats
                          </span>
                        </div>
                        {isAssignedToOther && (
                          <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: 700, marginTop: '2px', lineHeight: '1.2' }}>
                            🚫 Already assigned to {currentlyAssigned.name}
                          </span>
                        )}
                        {!isAssignedToOther && isChecked && (
                          <span style={{ fontSize: '10px', color: '#ea580c', fontWeight: 700, marginTop: '2px', lineHeight: '1.2' }}>
                            ✓ Assigned to this waiter
                          </span>
                        )}
                        {!isAssignedToOther && !isChecked && (
                          <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '2px', lineHeight: '1.2' }}>
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
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
