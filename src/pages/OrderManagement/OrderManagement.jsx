import React, { useState, useEffect } from 'react';
import { useAppState } from '../../config/AppContext';
import OrdersPanel from '../../components/OrdersPanel';
import apiClient from '../../config/index.js';
import { isBranchMatch } from '../../helper/BranchHelper';
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

  const fetchStaffAndTables = async () => {
    try {
      const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY';

      // Fetch staff/users & tables in parallel
      const [staffRes, tableRes] = await Promise.all([
        apiClient.get(`/users${isBranchFiltered ? `?branchId=${selectedBranchId}` : ''}`).catch(() => null),
        apiClient.get(`/tables${isBranchFiltered ? `?branchId=${selectedBranchId}` : ''}`).catch(() => null)
      ]);

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
      console.error("Failed to fetch fresh staff/tables:", e);
    }
  };

  useEffect(() => {
    setPage(0);
  }, [orderFilter, selectedWaiterFilter, selectedBranchId]);

  useEffect(() => {
    fetchStaffAndTables();
  }, [selectedBranchId]);

  if (!activeRestaurant) return null;

  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY';

  const displayStaff = isBranchFiltered
    ? apiStaff.filter(s => isBranchMatch(s, selectedBranchId, activeRestaurant?.branches || []))
    : apiStaff;

  const displayTables = isBranchFiltered
    ? apiTables.filter(t => isBranchMatch(t, selectedBranchId, activeRestaurant?.branches || []))
    : apiTables;

  return (
    <div style={{ width: '100%' }}>
      <OrdersPanel
        staff={displayStaff}
        tables={displayTables}
        orderFilter={orderFilter}
        setOrderFilter={setOrderFilter}
        selectedWaiterFilter={selectedWaiterFilter}
        setSelectedWaiterFilter={setSelectedWaiterFilter}
        activeRestaurant={activeRestaurant}
        selectedBranchId={selectedBranchId}
        updateOrderStatus={updateOrderStatus}
        refreshOrders={fetchStaffAndTables}
        currentUser={currentUser}

        // Pass pagination state
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
      />
    </div>
  );
}