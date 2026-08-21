import React, { useState, useEffect } from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import BillingPanel from '../../components/BillingPanel';
import BillingApi from '../../api/Billing';
import './Billing.css';

export default function Billing() {
  const {
    currentUser,
    activeRestaurant,
    selectedBranchId
  } = useAppState();

  const [selectedBillingTable, setSelectedBillingTable] = useState('');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState('UPI');
  const [billingData, setBillingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeRestaurant) {
      fetchBillingData();
    }
  }, [activeRestaurant, selectedBranchId]);

  const fetchBillingData = async () => {
    setIsLoading(true);

    const tablesRes = await BillingApi.getActiveTables({ branchId: selectedBranchId });

    let fetchedTables = [];
    if (tablesRes.status && tablesRes.response.data) {
      fetchedTables = tablesRes.response.data;
    }

    setBillingData(fetchedTables);

    if (fetchedTables.length > 0 && !selectedBillingTable) {
      setSelectedBillingTable(fetchedTables[0].tableId);
    } else if (fetchedTables.length === 0) {
      setSelectedBillingTable('');
    }

    setIsLoading(false);
  };

  // Permission checks
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  if (!activeRestaurant) return null;

  return (
    <BillingPanel
      billingData={billingData}
      selectedBranchId={selectedBranchId}
      activeRestaurant={activeRestaurant}
      selectedBillingTable={selectedBillingTable}
      setSelectedBillingTable={setSelectedBillingTable}
      billingPaymentMethod={billingPaymentMethod}
      setBillingPaymentMethod={setBillingPaymentMethod}
      hasPermission={hasPermission}
      fetchBillingData={fetchBillingData}
      isLoading={isLoading}
    />
  );
}