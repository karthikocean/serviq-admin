import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import PlansManagementPanel from '../../components/PlansManagementPanel';
import ShowNotifications from '../../helper/ShowNotifications.js';

export default function PlansManagement() {
  const { currentUser, activeRestaurant } = useAppState();

  if (!activeRestaurant) return null;

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userType = (userTypeStr || roleStr || '').toUpperCase();
  const userRoleLower = (roleStr || '').toLowerCase();
  const isRestaurantOwner = 
    userType === 'RESTAURANT_OWNER' || 
    userType === 'OWNER' || 
    userType === 'SUPER ADMIN' || 
    userType === 'SUPER_ADMIN' || 
    userRoleLower === 'restaurant_owner' || 
    userRoleLower === 'restaurant owner' || 
    userRoleLower === 'owner' || 
    userRoleLower === 'super admin' || 
    userRoleLower === 'super_admin';

  // Strict check: Only Restaurant Owner can access plans management
  if (!isRestaurantOwner) {
    ShowNotifications.showAlertNotification("Access Denied: Plans Management is restricted to Restaurant Owner only.", false);
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

  return <PlansManagementPanel hasPermission={hasPermission} />;
}
