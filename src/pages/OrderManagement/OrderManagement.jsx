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
      let queryStr = selectedBranchId ? `?branchId=${selectedBranchId}` : `?branchId=ALL`;
      queryStr += `&page=${page}&limit=${limit}`;
      
      if (selectedWaiterFilter.id !== 'All Waiters') {
        queryStr += `&waiterId=${selectedWaiterFilter.id}`;
      }
      if (orderFilter && orderFilter !== 'All') {
        queryStr += `&status=${orderFilter.toLowerCase()}`;
      }
      const [ordersRes, staffRes] = await Promise.all([
        apiClient.get(`/orders${queryStr}`).catch(() => ({ data: { success: false } })),
        apiClient.get(`/staff${queryStr}`).catch(() => ({ data: { success: false } }))
      ]);

      if (ordersRes.data?.success) {
        setApiOrders(ordersRes.data.data);
        if (ordersRes.data.totalPages !== undefined) {
          setTotalPages(ordersRes.data.totalPages);
          setTotalCount(ordersRes.data.total);
        }
      }
      if (staffRes.data?.success) {
        setApiStaff(staffRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    setPage(0); // Reset page on filter change
    fetchOrdersAndStaff();
  }, [selectedBranchId, selectedWaiterFilter, orderFilter, limit]);
  
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