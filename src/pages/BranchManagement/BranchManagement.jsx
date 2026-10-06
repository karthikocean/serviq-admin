import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BranchManagementPanel from '../../components/BranchManagementPanel';
import ShowNotifications from '../../helper/ShowNotifications.js';

export default function BranchManagement() {
  const { currentUser, activeRestaurant, hasPermission } = useAppState();

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
    userType === 'ADMIN' ||
    userType === 'COMPANY' ||
    userType === 'COMPANY_ADMIN' ||
    userRoleLower === 'restaurant_owner' || 
    userRoleLower === 'restaurant owner' || 
    userRoleLower === 'owner' || 
    userRoleLower === 'super admin' || 
    userRoleLower === 'super_admin' ||
    userRoleLower === 'admin' ||
    userRoleLower === 'company' ||
    userRoleLower === 'company_admin' ||
    (!currentUser?.branchId && !currentUser?.activeBranchId);

  // Strict check: Only Restaurant Owner / Company can access branch management
  if (!isRestaurantOwner && !hasPermission('branch-management', 'view')) {
    ShowNotifications.showAlertNotification("Access Denied: Branch Management is restricted to Restaurant Owner / Company Admin.", false);
    return <Navigate to="/dashboard" replace />;
  }

  return <BranchManagementPanel hasPermission={hasPermission} />;
}
