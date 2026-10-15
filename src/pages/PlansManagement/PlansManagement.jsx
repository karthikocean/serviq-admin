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
  const isRestaurantOwner = userTypeStr.toUpperCase().trim() === 'RESTAURANT_OWNER';

  // Strict check: Only userType: "RESTAURANT_OWNER" can access plans management
  if (!isRestaurantOwner) {
    ShowNotifications.showAlertNotification("Access Denied: Plans Management is restricted to Restaurant Owners.", false);
    return <Navigate to="/dashboard" replace />;
  }

  return <PlansManagementPanel hasPermission={hasPermission} />;
}
