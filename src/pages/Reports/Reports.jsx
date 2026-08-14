import React from 'react';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';

export default function Reports() {
  const { activeRestaurant, selectedBranchId } = useAppState();

  if (!activeRestaurant) return null;

  const rawOrders = activeRestaurant.orders || [];
  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const menu = activeRestaurant.menu || [];
  const branches = activeRestaurant.branches || [];

  return (
    <ReportsPanel
      orders={orders}
      allOrders={rawOrders}
      menu={menu}
      branches={branches}
      selectedBranchId={selectedBranchId}
      activeRestaurant={activeRestaurant}
    />
  );
}
