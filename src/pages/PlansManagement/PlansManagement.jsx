import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import PlansManagementPanel from '../../components/PlansManagementPanel';
import ShowNotifications from '../../helper/ShowNotifications.js';

export default function PlansManagement() {
  const { currentUser, activeRestaurant, hasPermission } = useAppState();

  if (!activeRestaurant) return null;

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userType = (userTypeStr || roleStr || '').toUpperCase();
  const userRoleUpper = (roleStr || '').toUpperCase().trim();
  const isRestaurantOwner = 
    userType === 'RESTAURANT_OWNER' || 
    userType === 'OWNER' || 
    userType === 'SUPER ADMIN' || 
    userType === 'SUPER_ADMIN' || 
    userRoleUpper === 'RESTAURANT_OWNER' || 
    userRoleUpper === 'OWNER' || 
    userRoleUpper === 'SUPER ADMIN';

  // Strict check: Only Restaurant Owner / Company can access plans management
  if (!isRestaurantOwner && !hasPermission('plans-management', 'view')) {
    ShowNotifications.showAlertNotification("Access Denied: Plans Management is restricted to Restaurant Owner / Company Admin.", false);
    return <Navigate to="/dashboard" replace />;
  }

  return <PlansManagementPanel hasPermission={hasPermission} />;
}
