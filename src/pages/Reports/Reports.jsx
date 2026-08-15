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
  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const rawStaff = activeRestaurant.staff || [];
  const staff = selectedBranchId ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;
  const rawTables = activeRestaurant.tables || [];
  const tables = selectedBranchId ? rawTables.filter(t => t.branchId === selectedBranchId) : rawTables;
  const menu = activeRestaurant.menu || [];
  const branches = activeRestaurant.branches || [];

  return (
    <ReportsPanel
      orders={orders}
      allOrders={rawOrders}
      staff={staff}
      tables={tables}
      menu={menu}
      branches={branches}
      selectedBranchId={selectedBranchId}
      activeRestaurant={activeRestaurant}
      initialTab={initialTab}
    />
  );
}
