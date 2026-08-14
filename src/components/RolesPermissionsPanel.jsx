import React, { useState } from 'react';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
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

const MODULES_LIST = [
  { id: 'overview', name: 'Dashboard / Overview' },
  { id: 'branch-management', name: 'Branch Management' },
  { id: 'plans-management', name: 'Plans & Subscription' },
  { id: 'orders', name: 'Orders Management' },
  { id: 'menu', name: 'Menu Management' },
  { id: 'tables', name: 'Tables Management' },
  { id: 'billing', name: 'Billing & Payments' },
  { id: 'waiter', name: 'Waiter List & Reports' },
  { id: 'kitchen', name: 'Kitchen Screen & Reports' },
  { id: 'Reports', name: 'Overall Reports' },
  { id: 'users', name: 'User Accounts' },
  { id: 'roles-permissions', name: 'Roles & Permissions' },
  { id: 'Settings', name: 'Settings' }
];

export default function RolesPermissionsPanel() {
  const { activeRestaurant, updateRolePermissions, addNewRole, deleteRole } = useAppState();
  const [viewState, setViewState] = useState('list'); // 'list' | 'edit' | 'add'
  const [editingRoleName, setEditingRoleName] = useState('');
  const [permissionsState, setPermissionsState] = useState({});
  const [roleToDelete, setRoleToDelete] = useState(null);

  const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;

  const rolesList = Object.keys(rolesConfig).length > 0
    ? Object.keys(rolesConfig).map((role, idx) => ({
        id: idx + 1,
        name: role,
        status: 'Active'
      }))
    : defaultRolesList;

  const handleDeleteRole = (roleName) => {
    if (roleName === 'Admin' || roleName === 'Super Admin' || roleName === 'Waiter' || roleName === 'Kitchen') {
      ShowNotifications.showAlertNotification("System default roles cannot be deleted.", false);
      return;
    }
    setRoleToDelete(roleName);
  };

  const handleConfirmDelete = () => {
    if (roleToDelete && deleteRole && activeRestaurant?.id) {
      deleteRole(activeRestaurant.id, roleToDelete);
      ShowNotifications.showAlertNotification(`Role "${roleToDelete}" deleted!`, true);
      setRoleToDelete(null);
    }
  };

  const handleEditRole = (roleName) => {
    setEditingRoleName(roleName);
    const existingPerms = rolesConfig[roleName]?.permissions || {};
    const basePermissions = {};
    MODULES_LIST.forEach(m => {
      basePermissions[m.id] = existingPerms[m.id] || { view: false, add: false, edit: false, delete: false };
    });
    setPermissionsState(basePermissions);
    setViewState('edit');
  };

  const handleAddRole = () => {
    setEditingRoleName('');
    const basePermissions = {};
    MODULES_LIST.forEach(m => {
      basePermissions[m.id] = { view: false, add: false, edit: false, delete: false };
    });
    setPermissionsState(basePermissions);
    setViewState('add');
  };

  const handleSaveRole = () => {
    if (!editingRoleName.trim()) {
      ShowNotifications.showAlertNotification("Role Name is required.", false);
      return;
    }
    
    if (viewState === 'add' && addNewRole && activeRestaurant?.id) {
      if (rolesConfig[editingRoleName]) {
        ShowNotifications.showAlertNotification("A role with this name already exists.", false);
        return;
      }
      addNewRole(activeRestaurant.id, editingRoleName.trim());
    }
    
    if (updateRolePermissions && activeRestaurant?.id) {
      updateRolePermissions(activeRestaurant.id, editingRoleName.trim(), permissionsState);
    }
    ShowNotifications.showAlertNotification(`Role ${editingRoleName.trim()} saved successfully!`, true);
    setViewState('list');
  };

  const togglePermission = (moduleId, action) => {
    setPermissionsState(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [action]: !prev[moduleId]?.[action]
      }
    }));
  };

  const toggleColumn = (action) => {
    const allSelected = MODULES_LIST.every(m => permissionsState[m.id]?.[action]);
    setPermissionsState(prev => {
      const next = { ...prev };
      MODULES_LIST.forEach(m => {
        if (!next[m.id]) next[m.id] = { view: false, add: false, edit: false, delete: false };
        next[m.id][action] = !allSelected;
      });
      return next;
    });
  };

  if (viewState === 'edit' || viewState === 'add') {
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
              fontWeight: '700',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
            onClick={() => setViewState('list')}
          >
            <ArrowLeftIcon size={16} /> Back to Roles & Permissions
          </button>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px 0', fontFamily: "'Outfit', sans-serif" }}>
              {viewState === 'add' ? 'Add New Role' : 'Edit Role Permissions'}
            </h2>
            <div style={{ maxWidth: '400px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                Role Name *
              </label>
              <input 
                type="text" 
                value={editingRoleName}
                onChange={(e) => setEditingRoleName(e.target.value)}
                disabled={viewState === 'edit'}
                placeholder="e.g. Branch Manager"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
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
                          checked={MODULES_LIST.every(m => permissionsState[m.id]?.[action])}
                          onChange={() => toggleColumn(action)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ff5a1f' }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES_LIST.map((module, idx) => (
                  <tr key={module.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 24px', textAlign: 'left', fontWeight: 600, color: '#0f172a', borderRight: '1px solid #f1f5f9', fontSize: '13px' }}>
                      {module.name}
                    </td>
                    {['view', 'add', 'edit', 'delete'].map(action => (
                      <td key={action} style={{ padding: '14px', borderRight: '1px solid #f1f5f9' }}>
                        <input 
                          type="checkbox" 
                          checked={permissionsState[module.id]?.[action] || false}
                          onChange={() => togglePermission(module.id, action)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ff5a1f' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
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
              {rolesList.map((role, index) => (
                <tr 
                  key={role.name || index}
                  style={{
                    borderBottom: index < rolesList.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                    {role.name}
                  </td>

                  {/* STATUS */}
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      backgroundColor: '#e6f4ea',
                      border: '1.5px solid #86efac',
                      color: '#16a34a'
                    }}>
                      Active
                    </span>
                  </td>

                  {/* ACTIONS */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        type="button" 
                        onClick={() => handleEditRole(role.name)}
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
                      <button 
                        type="button" 
                        onClick={() => handleDeleteRole(role.name)}
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
            Are you sure you want to delete role <strong>"{roleToDelete}"</strong>?
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
