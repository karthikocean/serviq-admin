import React, { useState, useEffect, useMemo } from 'react';
import RoleApi from '../api/Role';
import { Modal } from './Modal';
import DeleteConfirmationModal, { ToggleRightIcon, ToggleLeftIcon, UnlockIcon, LockIcon } from './DeleteConfirmationModal';
import ShowNotifications from '../helper/ShowNotifications.js';
import { useAppState } from '../config/AppContext';

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

const PowerIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M12 2v10" />
    <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
  </svg>
);

const ArrowLeftIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const isOwnerRole = (roleName = '') => {
  const lower = (roleName || '').trim().toLowerCase();
  return lower === 'restaurant_owner' || lower === 'restaurant owner' || lower === 'owner' || lower === 'super admin' || lower === 'super_admin';
};

const BILLING_SUBMODULES = [
  { id: 'billing_current', name: 'Current Billing', parentId: 'billing' },
  { id: 'billing_history', name: 'Billing History', parentId: 'billing' }
];

const REPORTS_SUBMODULES = [
  { id: 'reports_sales', name: 'Sales & Revenue Report', parentId: 'reports_analytics', aliases: ['reports_sales', 'report_sales', 'sales_report'] },
  { id: 'reports_items', name: 'Dish Performance Report', parentId: 'reports_analytics', aliases: ['reports_items', 'report_items', 'dish_performance', 'item_performance'] },
  { id: 'reports_orders', name: 'Order Analytics Report', parentId: 'reports_analytics', aliases: ['reports_orders', 'report_orders', 'order_analytics'] },
  { id: 'reports_inventory', name: 'Inventory & Stock Report', parentId: 'reports_analytics', aliases: ['reports_inventory', 'report_inventory', 'inventory_report'] },
  { id: 'reports_staff', name: 'Staff Performance Report', parentId: 'reports_analytics', aliases: ['reports_staff', 'report_staff', 'staff_report', 'waiter_reports', 'kitchen_reports'] },
  { id: 'reports_tax', name: 'Tax & Settlement Report', parentId: 'reports_analytics', aliases: ['reports_tax', 'report_tax', 'tax_report', 'payment_settlement'] }
];

const COMPANY_INVENTORY_MODULES = [
  { id: 'inventory_items', name: 'Inventory Items', parentId: 'inventory' },
  { id: 'inventory_central_stock', name: 'Central Stock', parentId: 'inventory' },
  { id: 'inventory_purchases', name: 'Purchases', parentId: 'inventory' },
  { id: 'inventory_branch_requests', name: 'Branch Requests', parentId: 'inventory' },
  { id: 'inventory_distribution', name: 'Stock Distribution', parentId: 'inventory', aliases: ['inventory_stock_distribution'] },
  { id: 'inventory_transactions', name: 'Transactions', parentId: 'inventory' }
];

const BRANCH_INVENTORY_MODULES = [
  { id: 'inventory_my_stock', name: 'My Stock', parentId: 'inventory' },
  { id: 'inventory_stock_request', name: 'Stock Request', parentId: 'inventory' },
  { id: 'inventory_branch_transfer', name: 'Branch Transfer', parentId: 'inventory' },
  { id: 'inventory_direct_purchase', name: 'Direct Purchase', parentId: 'inventory' },
  { id: 'inventory_stock_receipt', name: 'Stock Receipt', parentId: 'inventory' },
  { id: 'inventory_transactions', name: 'Transactions', parentId: 'inventory' }
];

// Ordered strictly following the application's Slide Bar (Sidebar) navigation hierarchy, listing sub-modules directly
const getSlidebarModules = (isCompany) => [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'roles_permissions', name: 'Roles & Permission', aliases: ['roles-permissions'] },
  { id: 'branch_management', name: 'Branch Management', aliases: ['branches', 'branch-management'] },
  { id: 'plans_subscription', name: 'Subscription', aliases: ['plans-management', 'plans', 'subscription'] },
  { id: 'tables', name: 'Table Management' },
  { id: 'menu', name: 'Menu Management' },
  ...(isCompany ? COMPANY_INVENTORY_MODULES : BRANCH_INVENTORY_MODULES),
  { id: 'orders', name: 'Order management' },
  { id: 'staff_management', name: 'Staff Management', aliases: ['user_accounts'] },
  ...BILLING_SUBMODULES,
  ...REPORTS_SUBMODULES,
  { id: 'help_support', name: 'Help & Support', aliases: ['help-support', 'help'] },
  { id: 'settings', name: 'Settings' }
];

// Master set of all modules for role permission persistence
const ALL_MODULES = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'roles_permissions', name: 'Roles & Permission', aliases: ['roles-permissions'] },
  { id: 'branch_management', name: 'Branch Management', aliases: ['branches', 'branch-management'] },
  { id: 'plans_subscription', name: 'Subscription', aliases: ['plans-management', 'plans', 'subscription'] },
  { id: 'tables', name: 'Table Management' },
  { id: 'menu', name: 'Menu Management' },
  { id: 'inventory', name: 'Inventory Management', isParent: true },
  ...COMPANY_INVENTORY_MODULES,
  ...BRANCH_INVENTORY_MODULES.filter(b => !COMPANY_INVENTORY_MODULES.some(c => c.id === b.id)),
  { id: 'orders', name: 'Order management' },
  { id: 'staff_management', name: 'Staff Management', aliases: ['user_accounts'] },
  { id: 'user_accounts', name: 'User Accounts' },
  { id: 'billing', name: 'Billing', isParent: true, aliases: ['billing_payments'] },
  ...BILLING_SUBMODULES,
  { id: 'reports_analytics', name: 'Reports', isParent: true, aliases: ['reports'] },
  ...REPORTS_SUBMODULES,
  { id: 'help_support', name: 'Help & Support', aliases: ['help-support', 'help'] },
  { id: 'settings', name: 'Settings' }
];

export default function RolesPermissionsPanel() {
  const { selectedBranchId, hasPermission, currentUser, setCurrentUser, fetchProfile } = useAppState();

  const isCompany = String(selectedBranchId || '').toUpperCase() === 'COMPANY';
  const visibleModules = useMemo(() => getSlidebarModules(isCompany), [isCompany]);

  const [viewState, setViewState] = useState('list'); // 'list' | 'edit' | 'add'
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [adminAccess, setAdminAccess] = useState(true);
  const [roleNameError, setRoleNameError] = useState('');
  const [permissionsState, setPermissionsState] = useState({});
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [roleToDeactivate, setRoleToDeactivate] = useState(null);
  const [apiRoles, setApiRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const limit = 10;

  const fetchRoles = async () => {
    setIsLoading(true);
    const res = await RoleApi.getRoles();
    if (res?.status) {
      const data = res.response.data || [];
      setApiRoles(data);
      try {
        sessionStorage.setItem('serviq_roles_cache', JSON.stringify(data));
      } catch (e) {}
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRoles = useMemo(() => {
    if (!searchTerm.trim()) return apiRoles;
    const term = searchTerm.toLowerCase().trim();
    return apiRoles.filter(role => 
      (role.roleName || '').toLowerCase().includes(term)
    );
  }, [apiRoles, searchTerm]);

  const totalPages = Math.ceil(filteredRoles.length / limit) || 1;
  const paginatedRoles = useMemo(() => {
    const start = page * limit;
    return filteredRoles.slice(start, start + limit);
  }, [filteredRoles, page, limit]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page + 1 - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleToggleRoleStatus = (role) => {
    if (isOwnerRole(role.roleName)) {
      ShowNotifications.showAlertNotification("Owner and Super Admin roles cannot be deactivated.", false);
      return;
    }
    const isCurrentlyActive = role.isActive !== false && String(role.status || '').toLowerCase() !== 'inactive';
    // If role is currently active, show confirmation prompt before deactivating
    if (isCurrentlyActive) {
      setRoleToDeactivate(role);
      return;
    }
    // If role is currently inactive, directly activate it
    executeToggleRoleStatus(role, true);
  };

  const executeToggleRoleStatus = async (role, targetActiveState) => {
    const isCurrentlyActive = role.isActive !== false && String(role.status || '').toLowerCase() !== 'inactive';
    const newActiveState = targetActiveState !== undefined ? targetActiveState : !isCurrentlyActive;
    const newStatusText = newActiveState ? 'Active' : 'Inactive';

    setApiRoles(prev => prev.map(r => r._id === role._id ? { ...r, isActive: newActiveState, status: newStatusText } : r));

    try {
      const res = await RoleApi.updateRole(role._id, {
        roleName: role.roleName,
        permissions: role.permissions,
        adminAccess: role.adminAccess !== undefined ? role.adminAccess : role.isAdminAccess,
        isActive: newActiveState,
        status: newStatusText
      });
      ShowNotifications.showAlertNotification(`Role "${role.roleName}" status updated to ${newStatusText}.`, true);
      if (res?.status) {
        fetchRoles();
      }
      if (typeof fetchProfile === 'function') {
        fetchProfile();
      }
    } catch (e) {
      console.warn("Role status toggle error:", e);
      ShowNotifications.showAlertNotification(`Role "${role.roleName}" status updated to ${newStatusText}.`, true);
    } finally {
      setRoleToDeactivate(null);
    }
  };

  const handleDeleteRole = (role) => {
    setRoleToDelete(role);
  };

  const handleConfirmDelete = async () => {
    if (roleToDelete) {
      const res = await RoleApi.deleteRole(roleToDelete._id);
      if (res.status) {
        setRoleToDelete(null);
        fetchRoles();
      }
    }
  };

  const handleEditRole = (role) => {
    setEditingRoleId(role._id);
    setEditingRoleName(role.roleName);
    setRoleNameError('');
    const resolvedAdminAccess = role.adminAccess !== undefined 
      ? Boolean(role.adminAccess) 
      : (role.isAdminAccess !== undefined 
          ? Boolean(role.isAdminAccess) 
          : !['waiter', 'kitchen staff', 'kitchen', 'chef', 'cook', 'server', 'steward'].includes((role.roleName || '').trim().toLowerCase()));
    setAdminAccess(resolvedAdminAccess);

    const existingPerms = role.permissions || {};
    const basePermissions = {};

    ALL_MODULES.forEach(m => {
      if (existingPerms[m.id]) {
        basePermissions[m.id] = { ...existingPerms[m.id] };
      } else if (m.aliases && m.aliases.some(a => existingPerms[a])) {
        const found = m.aliases.find(a => existingPerms[a]);
        basePermissions[m.id] = { ...existingPerms[found] };
      } else if (m.parentId && (existingPerms[m.parentId] || (m.parentId === 'billing' && existingPerms['billing_payments']) || (m.parentId === 'reports_analytics' && existingPerms['reports']))) {
        const parentObj = existingPerms[m.parentId] || existingPerms['billing_payments'] || existingPerms['reports'];
        basePermissions[m.id] = { ...parentObj };
      } else {
        basePermissions[m.id] = { view: false, add: false, edit: false, delete: false };
      }
    });

    // Sync parent checkboxes with children
    const invChildren = [...COMPANY_INVENTORY_MODULES, ...BRANCH_INVENTORY_MODULES];
    ['view', 'add', 'edit', 'delete'].forEach(act => {
      const anyInv = invChildren.some(c => basePermissions[c.id]?.[act]) || !!basePermissions['inventory']?.[act];
      if (!basePermissions['inventory']) basePermissions['inventory'] = { view: false, add: false, edit: false, delete: false };
      basePermissions['inventory'][act] = anyInv;

      const anyBill = BILLING_SUBMODULES.some(c => basePermissions[c.id]?.[act]) || !!basePermissions['billing']?.[act];
      if (!basePermissions['billing']) basePermissions['billing'] = { view: false, add: false, edit: false, delete: false };
      basePermissions['billing'][act] = anyBill;

      const anyReport = REPORTS_SUBMODULES.some(c => basePermissions[c.id]?.[act]) || !!basePermissions['reports_analytics']?.[act] || !!basePermissions['reports']?.[act];
      if (!basePermissions['reports_analytics']) basePermissions['reports_analytics'] = { view: false, add: false, edit: false, delete: false };
      basePermissions['reports_analytics'][act] = anyReport;
      if (!basePermissions['reports']) basePermissions['reports'] = { view: false, add: false, edit: false, delete: false };
      basePermissions['reports'][act] = anyReport;
    });

    if (basePermissions['staff_management']) {
      basePermissions['user_accounts'] = { ...basePermissions['staff_management'] };
      basePermissions['staff'] = { ...basePermissions['staff_management'] };
      basePermissions['users'] = { ...basePermissions['staff_management'] };
    }

    setPermissionsState(basePermissions);
    setViewState('edit');
  };

  const handleAddRole = () => {
    setEditingRoleId(null);
    setEditingRoleName('');
    setRoleNameError('');
    setAdminAccess(true);
    const basePermissions = {};
    ALL_MODULES.forEach(m => {
      basePermissions[m.id] = { view: false, add: false, edit: false, delete: false };
    });
    setPermissionsState(basePermissions);
    setViewState('add');
  };

  const handleSaveRole = async () => {
    const trimmedRoleName = editingRoleName.trim();
    if (!trimmedRoleName) {
      setRoleNameError("Role Name is required.");
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(trimmedRoleName)) {
      setRoleNameError("Role Name must contain only characters (letters and spaces).");
      return;
    }

    const hasPermissionSelected = Object.values(permissionsState).some(
      m => m && (m.view || m.add || m.edit || m.delete)
    );
    if (!hasPermissionSelected) {
      ShowNotifications.showAlertNotification("Please select at least one permission for the role.", false);
      return;
    }

    const isTargetOwner = isOwnerRole(trimmedRoleName);
    const finalPermissions = { ...permissionsState };

    // Keep parent 'inventory', 'billing', and 'reports' permission in sync with submodules
    const invKeys = [...COMPANY_INVENTORY_MODULES, ...BRANCH_INVENTORY_MODULES].map(m => m.id);
    ['view', 'add', 'edit', 'delete'].forEach(act => {
      const anyInv = invKeys.some(k => Boolean(finalPermissions[k]?.[act]));
      if (!finalPermissions['inventory']) finalPermissions['inventory'] = {};
      finalPermissions['inventory'][act] = anyInv;

      const anyBill = BILLING_SUBMODULES.some(m => Boolean(finalPermissions[m.id]?.[act]));
      if (!finalPermissions['billing']) finalPermissions['billing'] = {};
      finalPermissions['billing'][act] = anyBill;

      const anyReport = REPORTS_SUBMODULES.some(m => Boolean(finalPermissions[m.id]?.[act]));
      if (!finalPermissions['reports_analytics']) finalPermissions['reports_analytics'] = {};
      finalPermissions['reports_analytics'][act] = anyReport;
      if (!finalPermissions['reports']) finalPermissions['reports'] = {};
      finalPermissions['reports'][act] = anyReport;
    });
    finalPermissions['billing_payments'] = { ...finalPermissions['billing'] };
    finalPermissions['help-support'] = { ...finalPermissions['help_support'] };
    finalPermissions['help'] = { ...finalPermissions['help_support'] };
    if (finalPermissions['staff_management']) {
      finalPermissions['user_accounts'] = { ...finalPermissions['staff_management'] };
      finalPermissions['staff'] = { ...finalPermissions['staff_management'] };
      finalPermissions['users'] = { ...finalPermissions['staff_management'] };
    }

    const rolePayload = {
      roleName: trimmedRoleName,
      permissions: finalPermissions,
      adminAccess: isTargetOwner ? true : adminAccess,
      isAdminAccess: isTargetOwner ? true : adminAccess
    };

    let res;
    if (viewState === 'add') {
      res = await RoleApi.createRole(rolePayload);
    } else {
      res = await RoleApi.updateRole(editingRoleId, rolePayload);
    }

    if (res.status) {
      // Update cache immediately
      try {
        const cachedRoles = JSON.parse(sessionStorage.getItem('serviq_roles_cache') || '[]');
        const updatedCache = cachedRoles.map(r => String(r._id) === String(editingRoleId) ? { ...r, ...rolePayload } : r);
        if (viewState === 'add' && res.response?.data) {
          updatedCache.push(res.response.data);
        }
        sessionStorage.setItem('serviq_roles_cache', JSON.stringify(updatedCache));
      } catch (e) {}

      // If current user is currently assigned this role, immediately apply updated permissions!
      const userRoleStr = (typeof currentUser?.role === 'object' ? currentUser?.role?.roleName : currentUser?.role) || '';
      const userRoleId = (typeof currentUser?.roleId === 'object' ? (currentUser?.roleId?._id || currentUser?.roleId?.id) : currentUser?.roleId) || 
                         (typeof currentUser?.role === 'object' ? (currentUser?.role?._id || currentUser?.role?.id) : null);
      
      const isRoleOfCurrentUser = 
        (userRoleId && String(userRoleId) === String(editingRoleId)) ||
        (userRoleStr && userRoleStr.trim().toLowerCase() === trimmedRoleName.toLowerCase());

      if (isRoleOfCurrentUser) {
        setCurrentUser(prevUser => {
          if (!prevUser) return prevUser;
          const updatedRole = typeof prevUser.role === 'object' ? { ...prevUser.role, permissions: finalPermissions, roleName: trimmedRoleName } : trimmedRoleName;
          const updated = {
            ...prevUser,
            role: updatedRole,
            roleId: updatedRole,
            permissions: finalPermissions
          };
          try {
            sessionStorage.setItem('currentUser', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }

      setViewState('list');
      fetchRoles();
      if (typeof fetchProfile === 'function') {
        fetchProfile();
      }
    }
  };

  const togglePermission = (moduleId, action) => {
    setPermissionsState(prev => {
      const next = { ...prev };
      const currentVal = !prev[moduleId]?.[action];

      next[moduleId] = {
        ...(next[moduleId] || {}),
        [action]: currentVal
      };

      // If staff_management or user_accounts is toggled, sync all user/staff modules
      if (moduleId === 'staff_management' || moduleId === 'user_accounts' || moduleId === 'staff' || moduleId === 'users') {
        const staffObj = { ...(next['staff_management'] || {}), [action]: currentVal };
        next['staff_management'] = staffObj;
        next['user_accounts'] = staffObj;
        next['staff'] = staffObj;
        next['users'] = staffObj;
      }

      // If an inventory submodule is toggled, keep inventory parent permission updated
      const allInvChildren = [...COMPANY_INVENTORY_MODULES, ...BRANCH_INVENTORY_MODULES];
      if (allInvChildren.some(c => c.id === moduleId)) {
        const anyInvActive = allInvChildren.some(c => (c.id === moduleId ? currentVal : !!next[c.id]?.[action]));
        next['inventory'] = {
          ...(next['inventory'] || {}),
          [action]: anyInvActive
        };
      }

      // If a billing submodule is toggled, keep billing parent permission updated
      if (BILLING_SUBMODULES.some(c => c.id === moduleId)) {
        const anyBillActive = BILLING_SUBMODULES.some(c => (c.id === moduleId ? currentVal : !!next[c.id]?.[action]));
        next['billing'] = {
          ...(next['billing'] || {}),
          [action]: anyBillActive
        };
        next['billing_payments'] = {
          ...(next['billing_payments'] || {}),
          [action]: anyBillActive
        };
      }

      // If a reports submodule is toggled, keep reports parent permission updated
      if (REPORTS_SUBMODULES.some(c => c.id === moduleId)) {
        const anyReportActive = REPORTS_SUBMODULES.some(c => (c.id === moduleId ? currentVal : !!next[c.id]?.[action]));
        next['reports_analytics'] = {
          ...(next['reports_analytics'] || {}),
          [action]: anyReportActive
        };
        next['reports'] = {
          ...(next['reports'] || {}),
          [action]: anyReportActive
        };
      }

      return next;
    });
  };

  const toggleColumn = (action) => {
    const allSelected = visibleModules.every(m => permissionsState[m.id]?.[action]);
    const newVal = !allSelected;

    setPermissionsState(prev => {
      const next = { ...prev };
      ALL_MODULES.forEach(m => {
        if (!next[m.id]) next[m.id] = { view: false, add: false, edit: false, delete: false };
        next[m.id][action] = newVal;
      });
      return next;
    });
  };

  if (viewState === 'edit' || viewState === 'add') {
    const isCurrentRoleOwner = isOwnerRole(editingRoleName);

    return (
      <section className="panel-view active" style={{ paddingBottom: '60px', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setViewState('list')}
          >
            ← Back to Roles
          </button>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0', fontFamily: "'Outfit', sans-serif" }}>
              {viewState === 'edit' ? `Edit Role Permissions: ${editingRoleName}` : 'Add New Role'}
            </h2>

            {/* Role Name input and Admin Access Checkbox side-by-side */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '260px', maxWidth: '420px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px', color: '#0f172a' }}>
                  Role Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={editingRoleName}
                  onKeyDown={(e) => {
                    // Prevent leading space
                    if (e.key === ' ' && !e.currentTarget.value) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // Filter input to allow only letters and spaces
                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '').replace(/^\s+/, '');
                    setEditingRoleName(val);
                    if (roleNameError) setRoleNameError('');
                  }}
                  disabled={viewState === 'edit' && isOwnerRole(editingRoleName)}
                  placeholder="e.g. Branch Manager, Cashier, Kitchen Supervisor"
                  style={{
                    width: '100%',
                    height: '36px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: roleNameError ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                    fontSize: '13.5px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#0f172a',
                    backgroundColor: (viewState === 'edit' && isOwnerRole(editingRoleName)) ? '#f8fafc' : '#ffffff',
                    cursor: (viewState === 'edit' && isOwnerRole(editingRoleName)) ? 'not-allowed' : 'text',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                />
                {roleNameError && (
                  <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '3px', display: 'block', fontWeight: 600 }}>
                    {roleNameError}
                  </span>
                )}
              </div>

              {/* Admin Access Checkbox beside Role Name - Normal Black and White */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '6px 14px',
                background: '#ffffff',
              
                marginTop: '19px'
              }}>
                <label style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: (viewState === 'edit' && isOwnerRole(editingRoleName)) ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0f172a',
                  userSelect: 'none'
                }}>
                  <input
                    type="checkbox"
                    checked={isOwnerRole(editingRoleName) ? true : adminAccess}
                    disabled={viewState === 'edit' && isOwnerRole(editingRoleName)}
                    onChange={(e) => setAdminAccess(e.target.checked)}
                    style={{
                      width: '16px',
                      height: '16px',
                      accentColor: '#000000',
                      cursor: (viewState === 'edit' && isOwnerRole(editingRoleName)) ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <span>Admin Access</span>
                </label>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                 
                </span>
              </div>
            </div>
          </div>

          {/* Compact Permissions Matrix Table */}
          <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
            <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                  <th style={{ padding: '9px 16px', textAlign: 'left', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', width: '42%', color: '#ffffff' }}>MODULES</th>
                  {['view', 'add', 'edit', 'delete'].map(action => {
                    const allColChecked = visibleModules.length > 0 && visibleModules.every(m => permissionsState[m.id]?.[action]);

                    return (
                      <th key={action} style={{ padding: '9px 12px', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#ffffff' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <span>{action}</span>
                          <input
                            type="checkbox"
                            checked={allColChecked}
                            onChange={() => toggleColumn(action)}
                            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#ff5a1f' }}
                          />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {visibleModules.map((module) => (
                  <tr
                    key={module.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: '#ffffff'
                    }}
                  >
                    <td
                      style={{
                        padding: '8px 16px',
                        textAlign: 'left',
                        color: '#0f172a',
                        borderRight: '1px solid #f1f5f9',
                        fontSize: '13px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>
                          {module.name}
                        </span>
                      </div>
                    </td>

                    {['view', 'add', 'edit', 'delete'].map(action => (
                      <td key={action} style={{ padding: '6px 10px', borderRight: '1px solid #f1f5f9' }}>
                        <input
                          type="checkbox"
                          checked={!!permissionsState[module.id]?.[action]}
                          onChange={() => togglePermission(module.id, action)}
                          title={`${action} permission for ${module.name}`}
                          style={{
                            width: '15px',
                            height: '15px',
                            cursor: 'pointer',
                            accentColor: '#ff5a1f'
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setViewState('list')} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, borderRadius: '8px', padding: '8px 18px', fontSize: '12.5px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSaveRole} style={{ background: '#ff5a1f', border: 'none', color: '#ffffff', fontWeight: 700, borderRadius: '8px', padding: '8px 20px', fontSize: '12.5px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(255,90,31,0.25)' }}>
              Save 
            </button>
          </div>
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
        padding: '16px 20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
      }}>
        {/* Card Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Roles & Permissions
          </h2>

          {hasPermission('roles-permissions', 'add') && (
            <button
              type="button"
              onClick={handleAddRole}
              style={{
                background: '#000000',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
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
              + Add Role
            </button>
          )}
        </div>

        {/* Search Row */}
        <div style={{ marginBottom: '14px', width: '100%', maxWidth: '360px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by role name..."
              value={searchTerm}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchTerm(val);
                setPage(0);
              }}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 14px 0 36px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#f8fafc',
                boxSizing: 'border-box'
              }}
            />
            <svg
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}
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
        </div>

        {/* Roles List Table - Compact Layout */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '4px' }}>
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                <th style={{ padding: '9px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '60px' }}>
                  S.NO
                </th>
                <th style={{ padding: '9px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ROLE NAME
                </th>
                <th style={{ padding: '9px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ADMIN ACCESS
                </th>
                <th style={{ padding: '9px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STATUS
                </th>
                <th style={{ padding: '9px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                    Loading roles...
                  </td>
                </tr>
              ) : paginatedRoles.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                    {searchTerm ? `No roles matching "${searchTerm}".` : "No roles created yet. Click '+ Add Role' to create one."}
                  </td>
                </tr>
              ) : (
                paginatedRoles.map((role, idx) => {
                  const globalIndex = page * limit + idx;
                  const hasAdminAccess = isOwnerRole(role.roleName)
                    ? true
                    : (role.adminAccess !== undefined
                        ? Boolean(role.adminAccess)
                        : (role.isAdminAccess !== undefined
                            ? Boolean(role.isAdminAccess)
                            : !['waiter', 'kitchen staff', 'kitchen', 'chef', 'cook', 'server', 'steward'].includes((role.roleName || '').trim().toLowerCase())));

                  const isRoleActive = role.isActive !== false && String(role.status || '').toLowerCase() !== 'inactive';

                  return (
                    <tr
                      key={role._id}
                      style={{
                        borderBottom: idx < paginatedRoles.length - 1 ? '1px solid #f1f5f9' : 'none',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      {/* S.NO */}
                      <td style={{ padding: '8px 14px', fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                        {globalIndex + 1}
                      </td>

                      {/* ROLE NAME */}
                      <td style={{ padding: '8px 14px', fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                        {role.roleName}
                      </td>

                      {/* ADMIN ACCESS */}
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '14px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          backgroundColor: hasAdminAccess ? '#dcfce7' : '#fee2e2',
                          border: `1px solid ${hasAdminAccess ? '#86efac' : '#fca5a5'}`,
                          color: hasAdminAccess ? '#15803d' : '#dc2626'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: hasAdminAccess ? '#16a34a' : '#dc2626'
                          }} />
                          {hasAdminAccess ? 'Allowed' : 'Restricted'}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 10px',
                          borderRadius: '14px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          backgroundColor: isRoleActive ? '#e6f4ea' : '#fee2e2',
                          border: isRoleActive ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                          color: isRoleActive ? '#16a34a' : '#dc2626'
                        }}>
                          {isRoleActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td style={{ padding: '8px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Status Toggle Icon */}
                          {hasPermission('roles-permissions', 'edit') && (
                          <button
                            type="button"
                            onClick={() => handleToggleRoleStatus(role)}
                            style={{
                              background: isRoleActive ? '#ecfdf5' : '#fef2f2',
                              border: `1px solid ${isRoleActive ? '#a7f3d0' : '#fecaca'}`,
                              color: isRoleActive ? '#059669' : '#dc2626',
                              cursor: 'pointer',
                              padding: '5px',
                              borderRadius: '5px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = isRoleActive ? '#d1fae5' : '#fee2e2';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = isRoleActive ? '#ecfdf5' : '#fef2f2';
                            }}
                            title={isRoleActive ? "Deactivate / Lock Role (Click to set Inactive)" : "Activate / Unlock Role (Click to set Active)"}
                          >
                            {isRoleActive ? <UnlockIcon size={15} color="#16a34a" /> : <LockIcon size={15} color="#dc2626" />}
                          </button>
                          )}
                          {hasPermission('roles-permissions', 'edit') && (
                            <button
                              type="button"
                              onClick={() => handleEditRole(role)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                              onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                              title="Edit Role"
                            >
                              <PencilIcon size={15} />
                            </button>
                          )}
                          {hasPermission('roles-permissions', 'delete') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRole(role)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                              onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
                              title="Delete Role"
                            >
                              <TrashIcon size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredRoles.length > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 4px 4px 4px',
            borderTop: '1px solid #f1f5f9',
            marginTop: '10px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Left Info Text */}
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
              Showing {filteredRoles.length === 0 ? 0 : (page * limit) + 1} to {Math.min((page + 1) * limit, filteredRoles.length)} of {filteredRoles.length} entries
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
        )}
      </div>

      {/* Confirm Deletion Modal */}
      <DeleteConfirmationModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirm Role Deletion"
        itemType="role"
        itemName={roleToDelete?.roleName}
        confirmText="Delete Role"
      />

      {/* Confirm Role Deactivation Modal */}
      <Modal
        isOpen={!!roleToDeactivate}
        onClose={() => setRoleToDeactivate(null)}
        title="Confirm Role Deactivation"
        maxWidth="480px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.55 }}>
            This role is currently assigned to users. Deactivating this role will prevent those users from accessing the system. Do you want to continue?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setRoleToDeactivate(null)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => executeToggleRoleStatus(roleToDeactivate, false)}
              style={{
                background: '#dc2626',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
