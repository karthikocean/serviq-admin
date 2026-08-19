import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BillingPanel from '../../components/BillingPanel';
import './Billing.css';

export default function Billing() {
  const {
    currentUser,
    activeRestaurant,
    updateOrder,
    markBillAsPaid,
    selectedBranchId
  } = useAppState();

  const [selectedBillingTable, setSelectedBillingTable] = useState('');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('UPI');

  if (!activeRestaurant) return null;

  const rawBillingData = activeRestaurant.billingData || [];
  const rawOrders = activeRestaurant.orders || [];
  const rawTables = activeRestaurant.tables || [];

  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const tables = selectedBranchId ? rawTables.filter(t => t.branchId === selectedBranchId) : rawTables;
  const billingData = rawBillingData;

  useEffect(() => {
    if (billingData.length > 0 && !selectedBillingTable) {
      const firstActive = billingData.find(b => b.status === 'Unpaid') || billingData[0];
      setSelectedBillingTable(firstActive.table);
    }
  }, [billingData, selectedBillingTable]);

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
