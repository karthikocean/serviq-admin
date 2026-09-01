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
  const [apiTables, setApiTables] = useState([]);

  // Pagination State
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchOrdersAndStaff = async () => {
    try {
      const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL';
      const branchParam = isBranchFiltered ? `?branchId=${selectedBranchId}` : '';
      const paginationParam = `page=${page}&limit=${limit}${isBranchFiltered ? `&branchId=${selectedBranchId}` : ''}`;

      let fetchedOrders = [];
      let paginationInfo = null;

      // 1. Fetch paginated orders, staff/users & tables in parallel
      const [orderRes, staffRes, tableRes] = await Promise.all([
        apiClient.get(`/orders?${paginationParam}`).catch(() => null),
        apiClient.get(`/users${branchParam}`).catch(() => null),
        apiClient.get(`/tables${branchParam}`).catch(() => null)
      ]);

      if (orderRes && (orderRes.status === 200 || orderRes.status === 201 || orderRes.data?.success || orderRes.data?.status)) {
        const d = orderRes.data;
        if (Array.isArray(d)) {
          fetchedOrders = d;
        } else if (Array.isArray(d?.data)) {
          fetchedOrders = d.data;
        } else if (Array.isArray(d?.data?.orders)) {
          fetchedOrders = d.data.orders;
          paginationInfo = d.data.pagination;
        } else if (Array.isArray(d?.orders)) {
          fetchedOrders = d.orders;
          paginationInfo = d.pagination;
        } else if (Array.isArray(d?.response?.data)) {
          fetchedOrders = d.response.data;
        } else if (Array.isArray(d?.response)) {
          fetchedOrders = d.response;
        }
        if (d?.pagination) paginationInfo = d.pagination;
      }

      // 2. If paginated endpoint returned empty, fallback to unpaginated /orders
      if (fetchedOrders.length === 0) {
        try {
          const fallbackRes = await apiClient.get(`/orders${branchParam}`).catch(() => null);
          if (fallbackRes && (fallbackRes.status === 200 || fallbackRes.data?.success || fallbackRes.data?.status)) {
            const fd = fallbackRes.data;
            if (Array.isArray(fd)) fetchedOrders = fd;
            else if (Array.isArray(fd?.data)) fetchedOrders = fd.data;
            else if (Array.isArray(fd?.data?.orders)) fetchedOrders = fd.data.orders;
            else if (Array.isArray(fd?.orders)) fetchedOrders = fd.orders;
            else if (Array.isArray(fd?.response?.data)) fetchedOrders = fd.response.data;
            else if (Array.isArray(fd?.response)) fetchedOrders = fd.response;
          }
        } catch (e) {
          console.warn("Fallback orders fetch note:", e);
        }
      }

      // 3. If still empty, fallback to activeRestaurant.orders if available
      if (fetchedOrders.length === 0 && Array.isArray(activeRestaurant?.orders) && activeRestaurant.orders.length > 0) {
        fetchedOrders = activeRestaurant.orders;
      }

      setApiOrders(fetchedOrders);

      if (paginationInfo) {
        setTotalPages(paginationInfo.totalPages || 1);
        setTotalCount(paginationInfo.totalOrders || fetchedOrders.length);
      } else {
        setTotalCount(fetchedOrders.length);
        setTotalPages(Math.max(1, Math.ceil(fetchedOrders.length / limit)));
      }

      if (staffRes && (staffRes.status === 200 || staffRes.data?.success || staffRes.data?.status)) {
        const sd = staffRes.data;
        let staffList = [];
        if (Array.isArray(sd)) staffList = sd;
        else if (Array.isArray(sd?.data)) staffList = sd.data;
        else if (Array.isArray(sd?.data?.staff)) staffList = sd.data.staff;
        else if (Array.isArray(sd?.staff)) staffList = sd.staff;
        else if (Array.isArray(sd?.response?.data)) staffList = sd.response.data;
        else if (Array.isArray(sd?.response)) staffList = sd.response;
        setApiStaff(staffList);
      }

      if (tableRes && (tableRes.status === 200 || tableRes.data?.success || tableRes.data?.status)) {
        const td = tableRes.data;
        let tableList = [];
        if (Array.isArray(td)) tableList = td;
        else if (Array.isArray(td?.data)) tableList = td.data;
        else if (Array.isArray(td?.data?.tables)) tableList = td.data.tables;
        else if (Array.isArray(td?.tables)) tableList = td.tables;
        else if (Array.isArray(td?.response?.data)) tableList = td.response.data;
        else if (Array.isArray(td?.response)) tableList = td.response;
        setApiTables(tableList);
      }
    } catch (e) {
      console.error("Failed to fetch fresh orders/staff/tables:", e);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [orderFilter, selectedWaiterFilter, selectedBranchId]);

  useEffect(() => {
    fetchOrdersAndStaff();
  }, [selectedBranchId, page, limit]);

  if (!activeRestaurant) return null;

  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL';
  const displayOrders = isBranchFiltered
    ? apiOrders.filter(o => {
        const bId = String(o.branchId?._id || o.branchId?.id || o.branchId || o.branch?._id || o.branch || '');
        return !bId || bId === String(selectedBranchId);
      })
    : apiOrders;

  const displayStaff = isBranchFiltered
    ? apiStaff.filter(s => {
        const bId = String(s.branchId?._id || s.branchId?.id || s.branchId || s.branch?._id || s.branch || '');
        return !bId || bId === String(selectedBranchId);
      })
    : apiStaff;

  const displayTables = isBranchFiltered
    ? apiTables.filter(t => {
        const bId = String(t.branchId?._id || t.branchId?.id || t.branchId || t.branch?._id || t.branch || '');
        return !bId || bId === String(selectedBranchId);
      })
    : apiTables;

  return (
    <div style={{ width: '100%' }}>
      <OrdersPanel
        orders={displayOrders}
        staff={displayStaff}
        tables={displayTables}
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