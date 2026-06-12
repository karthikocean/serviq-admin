import React from 'react';
import { useAppState } from '../../config/AppContext';
import OverviewPanel from '../../components/OverviewPanel';
import './Dashboard.css';

export default function Dashboard() {
  const { activeRestaurant } = useAppState();

  if (!activeRestaurant) return null;

  const { orders = [], tables = [] } = activeRestaurant;

  // Compute today's revenue
  const todayRevenue = orders
    .filter(o => o.billingStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <OverviewPanel
      orders={orders}
      tables={tables}
      todayRevenue={todayRevenue}
    />
  );
}
