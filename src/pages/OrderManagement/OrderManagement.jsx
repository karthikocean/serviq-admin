import React, { useState } from 'react';
import { useAppState } from '../../config/AppContext';
import OrdersPanel from '../../components/OrdersPanel';
import './OrderManagement.css';

export default function OrderManagement() {
  const {
    activeRestaurant,
    addOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderStatus,
    selectedBranchId
  } = useAppState();

  const [orderFilter, setOrderFilter] = useState('All');
  const [selectedWaiterFilter, setSelectedWaiterFilter] = useState('All Waiters');

  if (!activeRestaurant) return null;

  const rawOrders = activeRestaurant.orders || [];
  const rawStaff = activeRestaurant.staff || [];

  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const staff = selectedBranchId ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;

  return (
    <div style={{ width: '100%' }}>
      <OrdersPanel
        orders={orders}
        staff={staff}
        orderFilter={orderFilter}
        setOrderFilter={setOrderFilter}
        selectedWaiterFilter={selectedWaiterFilter}
        setSelectedWaiterFilter={setSelectedWaiterFilter}
        addOrder={addOrder || createOrder}
        deleteOrder={deleteOrder}
        activeRestaurant={activeRestaurant}
        updateOrderStatus={updateOrderStatus}
        updateOrder={updateOrder}
      />
    </div>
  );
}
