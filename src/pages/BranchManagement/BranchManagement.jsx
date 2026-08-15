import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BranchManagementPanel from '../../components/BranchManagementPanel';
import ShowNotifications from '../../helper/ShowNotifications.js';

export default function BranchManagement() {
  const { currentUser, activeRestaurant } = useAppState();

  if (!activeRestaurant) return null;

  const userType = (currentUser?.userType || currentUser?.role || '').toUpperCase();
  const userRoleLower = (currentUser?.role || '').toLowerCase();
  const isAdmin = userRoleLower === 'admin' || userRoleLower === 'super admin' || userRoleLower === 'owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';

  // Strict check: Only Admin role can access branch management
  if (!isAdmin) {
    ShowNotifications.showAlertNotification("Access Denied: Branch Management is restricted to Admin role only.", false);
    return <Navigate to="/dashboard" replace />;
  }

  const role = currentUser?.role || 'Admin';
  const hasPermission = (moduleName, action = 'view') => {
    if (isAdmin) return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  return <BranchManagementPanel hasPermission={hasPermission} />;
}
