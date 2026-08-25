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
    selectedBranchId,
    currentUser
  } = useAppState();

  const [orderFilter, setOrderFilter] = useState('All');
  const [selectedWaiterFilter, setSelectedWaiterFilter] = useState({ id: 'All Waiters', name: 'All Waiters' });
  const [apiOrders, setApiOrders] = useState([]);
  const [apiStaff, setApiStaff] = useState([]);

  // Pagination State
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrdersAndStaff = async () => {
    try {
      const branchParam = selectedBranchId && selectedBranchId !== 'ALL' ? `?branchId=${selectedBranchId}` : '';
      const [orderRes, staffRes] = await Promise.all([
        apiClient.get(`/orders?page=${page + 1}&limit=${limit}${selectedBranchId && selectedBranchId !== 'ALL' ? `&branchId=${selectedBranchId}` : ''}`).catch(() => null),
        apiClient.get(`/staff${branchParam}`).catch(() => null)
      ]);

      if (orderRes && orderRes.data?.success) {
        setApiOrders(orderRes.data.data?.orders || orderRes.data.data || []);
        if (orderRes.data.data?.pagination) {
          setTotalPages(orderRes.data.data.pagination.totalPages || 1);
          setTotalCount(orderRes.data.data.pagination.totalOrders || 0);
        }
      }
      if (staffRes && staffRes.data?.success) {
        setApiStaff(staffRes.data.data || []);
      }
    } catch (e) {
      console.error("Failed to fetch fresh orders/staff:", e);
    }
  };

  useEffect(() => {
    fetchOrdersAndStaff();
  }, [selectedBranchId, page, limit]);

  useEffect(() => {
    fetchOrdersAndStaff();
  }, [page]);

  if (!activeRestaurant) return null;

  const orders = selectedBranchId ? apiOrders.filter(o => o.branchId === selectedBranchId) : apiOrders;
  const staff = selectedBranchId ? apiStaff.filter(s => s.branchId === selectedBranchId || s.branchId?._id === selectedBranchId || s.branch === selectedBranchId || s.branch?._id === selectedBranchId) : apiStaff;

  return (
    <div style={{ width: '100%' }}>
      <OrdersPanel
        orders={apiOrders} // Since backend handles filtering now
        staff={staff}
        orderFilter={orderFilter}
        setOrderFilter={setOrderFilter}
        selectedWaiterFilter={selectedWaiterFilter}
        setSelectedWaiterFilter={setSelectedWaiterFilter}
        activeRestaurant={activeRestaurant}
        selectedBranchId={selectedBranchId}
        updateOrderStatus={updateOrderStatus}
        refreshOrders={fetchOrdersAndStaff}
        currentUser={currentUser}

        // Pass pagination state
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        totalPages={totalPages}
        totalCount={totalCount}
      />
    </div>
  );
}