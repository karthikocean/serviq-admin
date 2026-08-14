import React from 'react';
import { useAppState } from '../../config/AppContext';
import OverviewPanel from '../../components/OverviewPanel';
import './Dashboard.css';

export default function Dashboard() {
  const {
    activeRestaurant,
    selectedBranchId,
    setSelectedBranchId
  } = useAppState();

  if (!activeRestaurant) return null;

  const rawOrders = activeRestaurant.orders || [];
  const rawTables = activeRestaurant.tables || [];
  const rawStaff = activeRestaurant.staff || [];
  const branches = activeRestaurant.branches || [];

  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const tables = selectedBranchId ? rawTables.filter(t => t.branchId === selectedBranchId) : rawTables;
  const staff = selectedBranchId ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;

  // Compute today's revenue (from paid orders)
  const todayRevenue = orders
    .filter(o => o.billingStatus === 'paid')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <OverviewPanel
      orders={orders}
      tables={tables}
      staff={staff}
      allOrders={rawOrders}
      allTables={rawTables}
      allStaff={rawStaff}
      branches={branches}
      selectedBranchId={selectedBranchId}
      onSelectBranch={setSelectedBranchId}
      todayRevenue={todayRevenue}
      activeRestaurant={activeRestaurant}
    />
  );
}
