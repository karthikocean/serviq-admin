import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BillingPanel from '../../components/BillingPanel';
import './Billing.css';

export default function Billing() {
  const {
    currentUser,
    activeRestaurant,
    updateOrder,
    markBillAsPaid
  } = useAppState();

  const [selectedBillingTable, setSelectedBillingTable] = useState('');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('UPI');

  useEffect(() => {
    if (activeRestaurant?.billingData?.length > 0 && !selectedBillingTable) {
      setSelectedBillingTable(activeRestaurant.billingData[0].table);
    }
  }, [activeRestaurant]);

  if (!activeRestaurant) return null;

  const { billingData = [], orders = [], tables = [] } = activeRestaurant;

  // Permission checks
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  return (
    <BillingPanel
      billingData={billingData}
      orders={orders}
      tables={tables}
      activeRestaurant={activeRestaurant}
      updateOrder={updateOrder}
      selectedBillingTable={selectedBillingTable}
      setSelectedBillingTable={setSelectedBillingTable}
      billingPaymentMethod={billingPaymentMethod}
      setBillingPaymentMethod={setBillingPaymentMethod}
      markBillAsPaid={markBillAsPaid}
      hasPermission={hasPermission}
    />
  );
}
