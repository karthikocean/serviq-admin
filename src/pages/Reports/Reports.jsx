import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';

export default function Reports() {
  const { activeRestaurant, selectedBranchId } = useAppState();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'kitchen' ? 'kitchen' : 'waiter';

  if (!activeRestaurant) return null;

  const rawOrders = activeRestaurant.orders || [];
  const rawStaff = activeRestaurant.staff || [];
  const rawTables = activeRestaurant.tables || [];
  const menu = activeRestaurant.menu || [];
  const branches = activeRestaurant.branches || [];

  return (
    <ReportsPanel
      orders={rawOrders}
      allOrders={rawOrders}
      staff={rawStaff}
      tables={rawTables}
      menu={menu}
      branches={branches}
      selectedBranchId={selectedBranchId}
      activeRestaurant={activeRestaurant}
      initialTab={initialTab}
    />
  );
}
