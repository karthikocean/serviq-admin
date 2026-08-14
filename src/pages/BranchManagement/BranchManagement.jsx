import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BranchManagementPanel from '../../components/BranchManagementPanel';

export default function BranchManagement() {
  const { currentUser, activeRestaurant } = useAppState();

  if (!activeRestaurant) return null;

  const userType = (currentUser?.userType || currentUser?.role || '').toUpperCase();
  const isRestaurantOwner = userType === 'RESTAURANT_OWNER' || userType === 'SUPER ADMIN' || userType === 'ADMIN' || userType === 'OWNER';

  // Strict check: Only restaurant owners can access branch management
  if (!isRestaurantOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  const role = currentUser?.role || 'Admin';
  const hasPermission = (moduleName, action = 'view') => {
    if (isRestaurantOwner) return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  return <BranchManagementPanel hasPermission={hasPermission} />;
}
