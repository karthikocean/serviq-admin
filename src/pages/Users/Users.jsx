import React from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import RolesPermissionsPanel from '../../components/RolesPermissionsPanel';
import UserListPanel from '../../components/UserListPanel';

export default function Users({ activeSubTab }) {
  const {
    currentUser,
    activeRestaurant,
    addStaff,
    updateStaff,
    deleteStaff
  } = useAppState();

  if (!activeRestaurant) return null;

  const { staff = [] } = activeRestaurant;

  // Permission checks
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  return activeSubTab === 'roles-permissions' ? (
    <RolesPermissionsPanel />
  ) : (
    <UserListPanel
      activeRestaurant={activeRestaurant}
      staff={staff}
      addStaff={addStaff}
      updateStaff={updateStaff}
      deleteStaff={deleteStaff}
      hasPermission={hasPermission}
    />
  );
}
