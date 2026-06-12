import React from 'react';
import { useAppState } from '../../config/AppContext';
import ReportsPanel from '../../components/ReportsPanel';

export default function Reports() {
  const { activeRestaurant } = useAppState();

  if (!activeRestaurant) return null;

  const { orders = [], menu = [] } = activeRestaurant;

  return (
    <ReportsPanel
      orders={orders}
      menu={menu}
      activeRestaurant={activeRestaurant}
    />
  );
}
