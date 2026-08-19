import React, { useState, useEffect } from 'react';
import RoleApi from '../api/Role';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';

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
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const defaultRolesList = [
  { id: 1, name: 'Super Admin', status: 'Active' },
  { id: 2, name: 'Branch Admin', status: 'Active' },
  { id: 3, name: 'Branch Manager', status: 'Active' },
  { id: 4, name: 'Cashier', status: 'Active' },
  { id: 5, name: 'Waiter', status: 'Active' },
  { id: 6, name: 'Kitchen Staff', status: 'Active' }
];

const isAdminRole = (roleName = '') => {
  const lower = (roleName || '').trim().toLowerCase();
  return lower === 'admin' || lower === 'super admin' || lower === 'restaurant_owner' || lower === 'owner';
};

const MODULES_LIST = [
  // Core
  { id: 'dashboard', name: 'Dashboard / Overview' },
  { id: 'branch_management', name: 'Branch Management', adminOnly: true },
  { id: 'plans_subscription', name: 'Plans & Subscription' },
  { id: 'billing_payments', name: 'Billing & Payments' },
  { id: 'staff_management', name: 'Staff Management (Waiters & Kitchen)' },
  { id: 'user_accounts', name: 'User Accounts' },
  { id: 'roles_permissions', name: 'Roles & Permissions' },
  { id: 'settings', name: 'Settings' },
  { id: 'reports_analytics', name: 'Reports & Analytics' },
  // Premium
  { id: 'inventory', name: 'Inventory Management (Premium)' },
  { id: 'menu', name: 'Menu Management' },
  { id: 'tables', name: 'Tables Management' },
  { id: 'orders', name: 'Orders Management' },
  { id: 'waiter-list', name: 'Waiter App Access (Premium)' },
  { id: 'kitchen-list', name: 'Kitchen Display System (Premium)' },
  { id: 'qr-code-config', name: 'QR Code Configuration' }
];

export default function RolesPermissionsPanel() {
  const [viewState, setViewState] = useState('list'); // 'list' | 'edit' | 'add'
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState('');
  const [roleNameError, setRoleNameError] = useState('');
  const [permissionsState, setPermissionsState] = useState({});
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [apiRoles, setApiRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    const res = await RoleApi.getRoles();
    if (res?.status) {
      setApiRoles(res.response.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDeleteRole = (role) => {
    if (role.isDefault) {
      ShowNotifications.showAlertNotification("System default roles cannot be deleted.", false);
      return;
    }
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
    const existingPerms = role.permissions || {};
    const basePermissions = {};
    const isTargetAdmin = isAdminRole(role.roleName);

    MODULES_LIST.forEach(m => {
      if (m.adminOnly && !isTargetAdmin) {
        basePermissions[m.id] = { view: false, add: false, edit: false, delete: false };
      } else {
        basePermissions[m.id] = existingPerms[m.id] || { view: false, add: false, edit: false, delete: false };
      }
    });
    setPermissionsState(basePermissions);
    setViewState('edit');
  };

  const handleAddRole = () => {
    setEditingRoleId(null);
    setEditingRoleName('');
    setRoleNameError('');
    const basePermissions = {};
    MODULES_LIST.forEach(m => {
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

    const isTargetAdmin = isAdminRole(trimmedRoleName);
    const finalPermissions = { ...permissionsState };
    if (!isTargetAdmin) {
      finalPermissions['branch_management'] = { view: false, add: false, edit: false, delete: false };
    }

    let res;
    if (viewState === 'add') {
      res = await RoleApi.createRole({ roleName: trimmedRoleName, permissions: finalPermissions });
    } else {
      res = await RoleApi.updateRole(editingRoleId, { roleName: trimmedRoleName, permissions: finalPermissions });
    }

    if (res.status) {
      setViewState('list');
      fetchRoles();
    }
  };

  const togglePermission = (moduleId, action) => {
    const isTargetAdmin = isAdminRole(editingRoleName);
    if (moduleId === 'branch_management' && !isTargetAdmin) {
      ShowNotifications.showAlertNotification("Branch Management is restricted to Admin role only.", false);
      return;
    }

    setPermissionsState(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: !prev[moduleId]?.[action]
      }
    }));
  };

  const toggleColumn = (action) => {
    const isTargetAdmin = isAdminRole(editingRoleName);
    const activeModules = isTargetAdmin ? MODULES_LIST : MODULES_LIST.filter(m => !m.adminOnly);
    const allSelected = activeModules.every(m => permissionsState[m.id]?.[action]);

    setPermissionsState(prev => {
      const next = { ...prev };
      activeModules.forEach(m => {
        if (!next[m.id]) next[m.id] = { view: false, add: false, edit: false, delete: false };
        next[m.id][action] = !allSelected;
      });
      return next;
    });
  };

  if (viewState === 'edit' || viewState === 'add') {
    const isCurrentRoleAdmin = isAdminRole(editingRoleName);

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
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 16px 0', fontFamily: "'Outfit', sans-serif" }}>
              {viewState === 'edit' ? `Edit Role Permissions: ${editingRoleName}` : 'Add New Role'}
            </h2>
            <div style={{ maxWidth: '400px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                Role Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={editingRoleName}
                onChange={(e) => {
                  setEditingRoleName(e.target.value);
                  if (roleNameError) setRoleNameError('');
                }}
                disabled={viewState === 'edit'}
                placeholder="e.g. Branch Manager"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: roleNameError ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              {roleNameError && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {roleNameError}
                </span>
              )}
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', color: '#ffffff', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 800, fontSize: '12px', width: '40%' }}>MODULES</th>
                  {['view', 'add', 'edit', 'delete'].map(action => (
                    <th key={action} style={{ padding: '16px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span>{action}</span>
                        <input
                          type="checkbox"
                          checked={MODULES_LIST.filter(m => isCurrentRoleAdmin || !m.adminOnly).every(m => permissionsState[m.id]?.[action])}
                          onChange={() => toggleColumn(action)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ff5a1f' }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES_LIST.map((module, idx) => {
                  const isLockedAdminOnly = module.adminOnly && !isCurrentRoleAdmin;

                  return (
                    <tr key={module.id} style={{ borderBottom: '1px solid #f1f5f9', background: isLockedAdminOnly ? '#fafafa' : '#ffffff' }}>
                      <td style={{ padding: '14px 24px', textAlign: 'left', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #f1f5f9', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{module.name}</span>
                          {module.adminOnly && (
                            <span style={{
                              fontSize: '11px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #fecaca'
                            }}>
                              🔒 Admin Only
                            </span>
                          )}
                        </div>
                      </td>
                      {['view', 'add', 'edit', 'delete'].map(action => (
                        <td key={action} style={{ padding: '14px', borderRight: '1px solid #f1f5f9' }}>
                          <input
                            type="checkbox"
                            disabled={isLockedAdminOnly}
                            checked={isLockedAdminOnly ? false : (permissionsState[module.id]?.[action] || false)}
                            onChange={() => togglePermission(module.id, action)}
                            title={isLockedAdminOnly ? "Restricted to Admin role only" : `${action} permission`}
                            style={{
                              width: '16px',
                              height: '16px',
                              cursor: isLockedAdminOnly ? 'not-allowed' : 'pointer',
                              accentColor: '#ff5a1f',
                              opacity: isLockedAdminOnly ? 0.35 : 1
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" onClick={() => setViewState('list')} style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, borderRadius: '8px', padding: '10px 22px', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="button" onClick={handleSaveRole} style={{ background: '#ff5a1f', border: 'none', color: '#ffffff', fontWeight: 700, borderRadius: '8px', padding: '10px 22px', fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(255,90,31,0.25)' }}>
              Save Role Permissions
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px', width: '100%' }}>
      {/* Main Card Container matching Screenshot 2 */}
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
            Roles & Permissions
          </h2>
          <button
            type="button"
            onClick={handleAddRole}
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
            + Add Role
          </button>
        </div>

        {/* Table matching Screenshot 2 */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '80px' }}>
                  S.NO
                </th>
                <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ROLE NAME
                </th>
                <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STATUS
                </th>
                <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {apiRoles.map((role, index) => (
                <tr
                  key={role._id}
                  style={{
                    borderBottom: index < apiRoles.length - 1 ? '1px solid #f1f5f9' : 'none',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  {/* S.NO */}
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                    {index + 1}
                  </td>

                  {/* ROLE NAME */}
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                    {role.roleName}
                  </td>

                  {/* STATUS */}
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: role.isActive ? '#e6f4ea' : '#fee2e2',
                      border: role.isActive ? '1.5px solid #86efac' : '1.5px solid #fca5a5',
                      color: role.isActive ? '#16a34a' : '#dc2626'
                    }}>
                      {role.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleEditRole(role)}
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
                        title="Edit Role"
                      >
                        <PencilIcon size={16} />
                      </button>
                      {!role.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                          onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
                          title="Delete Role"
                        >
                          <TrashIcon size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Deletion Modal */}
      <Modal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        title="Confirm Role Deletion"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
            Are you sure you want to delete role <strong>"{roleToDelete?.roleName}"</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setRoleToDelete(null)}
              style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', fontWeight: 700, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              style={{ background: '#dc2626', border: 'none', color: '#ffffff', fontWeight: 700, borderRadius: '8px', padding: '8px 18px', fontSize: '13px', cursor: 'pointer' }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
