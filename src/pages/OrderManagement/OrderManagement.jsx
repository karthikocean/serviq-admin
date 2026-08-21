import React, { useState, useEffect } from 'react';
import { useAppState } from '../../config/AppContext';
import OrdersPanel from '../../components/OrdersPanel';
import apiClient from '../../config/index.js';
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
  const [apiOrders, setApiOrders] = useState([]);
  const [apiStaff, setApiStaff] = useState([]);

  const fetchOrdersAndStaff = async () => {
    try {
      const queryStr = selectedBranchId ? `?branchId=${selectedBranchId}` : `?branchId=ALL`;
      const [ordersRes, staffRes] = await Promise.all([
        apiClient.get(`/orders${queryStr}`).catch(() => ({ data: { success: false } })),
        apiClient.get(`/staff${queryStr}`).catch(() => ({ data: { success: false } }))
      ]);

      if (ordersRes.data?.success) {
        setApiOrders(ordersRes.data.data);
      }
      if (staffRes.data?.success) {
        setApiStaff(staffRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchOrdersAndStaff();
  }, [selectedBranchId]);

  if (!activeRestaurant) return null;

  const orders = selectedBranchId ? apiOrders.filter(o => o.branchId === selectedBranchId) : apiOrders;
  const staff = selectedBranchId ? apiStaff.filter(s => s.branchId === selectedBranchId || s.branchId?._id === selectedBranchId || s.branch === selectedBranchId || s.branch?._id === selectedBranchId) : apiStaff;

  return (
    <div style={{ width: '100%' }}>
      <OrdersPanel
        orders={orders}
        staff={staff}
        orderFilter={orderFilter}
        setOrderFilter={setOrderFilter}
        selectedWaiterFilter={selectedWaiterFilter}
        setSelectedWaiterFilter={setSelectedWaiterFilter}
        activeRestaurant={activeRestaurant}
        selectedBranchId={selectedBranchId}
        updateOrderStatus={updateOrderStatus}
        refreshOrders={fetchOrdersAndStaff}
      />
    </div>
  );
}
