import React, { useState } from 'react';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';

const PencilIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const PlusIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowLeftIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const TrashIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const TrashCanIcon = TrashIcon;

const MODULES_LIST = [
  { id: 'overview', name: 'Dashboard / Overview' },
  { id: 'orders', name: 'Orders & POS' },
  { id: 'menu', name: 'Menu Management' },
  { id: 'tables', name: 'Tables Management' },
  { id: 'billing', name: 'Billing & Payments' },
  { id: 'waiter', name: 'Waiter List & Reports' },
  { id: 'kitchen', name: 'Kitchen Screen & Reports' },
  { id: 'reports', name: 'Overall Reports' },
  { id: 'users', name: 'User Accounts' },
  { id: 'roles-permissions', name: 'Roles & Permissions' },
  { id: 'settings', name: 'Settings' }
];

export default function RolesPermissionsPanel() {
  const { activeRestaurant, updateRolePermissions, addNewRole, deleteRole } = useAppState();
  const [viewState, setViewState] = useState('list'); // 'list' | 'edit' | 'add'
  const [editingRoleName, setEditingRoleName] = useState('');
  const [permissionsState, setPermissionsState] = useState({});

  const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;

  const handleDeleteRole = (roleName) => {
    if (roleName === 'Admin' || roleName === 'Waiter' || roleName === 'Kitchen') {
      alert("System default roles cannot be deleted.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      deleteRole(activeRestaurant.id, roleName);
    }
  };

  const handleEditRole = (roleName) => {
    setEditingRoleName(roleName);
    setPermissionsState(JSON.parse(JSON.stringify(rolesConfig[roleName].permissions)));
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
      alert("Role Name is required.");
      return;
    }
    
    if (viewState === 'add') {
      if (rolesConfig[editingRoleName]) {
        alert("A role with this name already exists.");
        return;
      }
      addNewRole(activeRestaurant.id, editingRoleName);
    }
    
    updateRolePermissions(activeRestaurant.id, editingRoleName, permissionsState);
    alert(`Role ${editingRoleName} saved successfully!`);
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
    // Check if all in column are selected
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
      <section className="panel-view active" style={{ paddingBottom: '60px' }}>
        <div style={{ marginBottom: '24px' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding: '6px 12px', border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--text-muted)' }}
            onClick={() => setViewState('list')}
          >
            <ArrowLeftIcon /> Back to Roles
          </button>
        </div>

        <div className="settings-card" style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', margin: '0 0 24px 0' }}>
              {viewState === 'add' ? 'Add New Role' : 'Edit Role Permissions'}
            </h2>
            <div style={{ maxWidth: '400px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                Role Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input 
                type="text" 
                value={editingRoleName}
                onChange={(e) => setEditingRoleName(e.target.value)}
                disabled={viewState === 'edit'}
                placeholder="E.g. Sales Manager"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}>
                  <th style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 700, width: '40%' }}>Modules</th>
                  {['view', 'add', 'edit', 'delete'].map(action => (
                    <th key={action} style={{ padding: '16px', fontWeight: 700, textTransform: 'capitalize' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span>{action}</span>
                        <input 
                          type="checkbox" 
                          checked={MODULES_LIST.every(m => permissionsState[m.id]?.[action])}
                          onChange={() => toggleColumn(action)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#ffffff' }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES_LIST.map((module, idx) => (
                  <tr key={module.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', textAlign: 'left', fontWeight: 600, color: 'var(--text-main)', borderRight: '1px solid var(--border)' }}>
                      {module.name}
                    </td>
                    {['view', 'add', 'edit', 'delete'].map(action => (
                      <td key={action} style={{ padding: '16px', borderRight: '1px solid var(--border)' }}>
                        <input 
                          type="checkbox" 
                          checked={permissionsState[module.id]?.[action] || false}
                          onChange={() => togglePermission(module.id, action)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-outline" onClick={() => setViewState('list')} style={{ padding: '10px 24px' }}>Cancel</button>
            <button className="btn btn-black" onClick={handleSaveRole} style={{ padding: '10px 24px', background: 'var(--primary)', border: 'none', color: '#ffffff' }}>
              Save Role Permissions
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px' }}>
      <div className="panel-header-flex" style={{ marginBottom: '24px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">Roles & Permissions</h2>
          <p className="panel-inner-desc">Manage system roles, configure authority, and control module access</p>
        </div>
      </div>

      <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--black)', margin: 0 }}>
            Roles Matrix
          </h3>
          <button 
            type="button" 
            className="btn btn-black" 
            style={{ padding: '8px 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={handleAddRole}
          >
            <PlusIcon size={14} /> Add New Role
          </button>
        </div>

        <div className="menu-table-wrapper" style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '14px', width: '50px' }}>S.NO</th>
                <th style={{ padding: '14px', textAlign: 'center', width: '50%' }}>ROLE NAME</th>
                <th style={{ padding: '14px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(rolesConfig).map((role, index) => {
                const perms = rolesConfig[role].permissions || {};
                const accessibleModules = Object.keys(perms).filter(k => perms[k].view).length;
                const totalModules = MODULES_LIST.length;
                
                return (
                  <tr key={role} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td style={{ padding: '14px', fontWeight: 700, color: role === 'Admin' ? 'var(--primary)' : 'var(--text-main)', textAlign: 'center' }}>
                      {role}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ padding: '6px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={() => handleEditRole(role)}
                            title="Edit Role"
                          >
                            <PencilIcon size={14} />
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline" 
                            style={{ padding: '6px', border: '1px solid var(--border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                            onClick={() => handleDeleteRole(role)}
                            title="Delete Role"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
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
