import React from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import PlansManagementPanel from '../../components/PlansManagementPanel';

export default function PlansManagement() {
  const { currentUser, activeRestaurant } = useAppState();

  if (!activeRestaurant) return null;

  const role = currentUser?.role || 'Admin';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin' || role === 'Super Admin') return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  return <PlansManagementPanel hasPermission={hasPermission} />;
}
