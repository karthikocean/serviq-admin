import React, { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../../config/AppContext';
import OverviewPanel from '../../components/OverviewPanel';
import TableApi from '../../api/Table';
import OrderApi from '../../api/Order';
import BranchApi from '../../api/Branch';
import StaffApi from '../../api/Staff';
import UserApi from '../../api/User';
import { resolveBranchManagerName } from '../../helper/BranchHelper';
import './Dashboard.css';

export default function Dashboard() {
  const {
    activeRestaurant,
    selectedBranchId,
    setSelectedBranchId
  } = useAppState();

  const [liveTables, setLiveTables] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [liveBranches, setLiveBranches] = useState([]);
  const [liveStaff, setLiveStaff] = useState([]);
  const [liveUsers, setLiveUsers] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [tablesRes, ordersRes, branchesRes, staffRes, usersRes] = await Promise.allSettled([
        TableApi.getTables(),
        OrderApi.getOrders(),
        BranchApi.getBranches(),
        StaffApi.getStaff(),
        UserApi.getUsers({ limit: 100 })
      ]);

      if (tablesRes.status === 'fulfilled' && tablesRes.value?.status && tablesRes.value.response?.data) {
        setLiveTables(tablesRes.value.response.data);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.status && ordersRes.value.response?.data) {
        setLiveOrders(ordersRes.value.response.data);
      }
      if (branchesRes.status === 'fulfilled' && branchesRes.value?.status && branchesRes.value.response?.data) {
        setLiveBranches(branchesRes.value.response.data);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value?.status && staffRes.value.response?.data) {
        setLiveStaff(staffRes.value.response.data);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.status && usersRes.value.response?.data) {
        setLiveUsers(usersRes.value.response.data);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (!activeRestaurant) return null;

  const rawOrders = (liveOrders && liveOrders.length > 0) ? liveOrders : (activeRestaurant.orders || []);
  const rawTables = (liveTables && liveTables.length > 0) ? liveTables : (activeRestaurant.tables || []);
  const rawStaff = (liveStaff && liveStaff.length > 0) ? liveStaff : (activeRestaurant.staff || []);
  const rawBranches = (liveBranches && liveBranches.length > 0) ? liveBranches : (activeRestaurant.branches || []);
  const rawUsers = (liveUsers && liveUsers.length > 0) ? liveUsers : (activeRestaurant.users || []);

  const branches = rawBranches.map(b => {
    const mgrName = resolveBranchManagerName(b, rawUsers, rawStaff);
    return {
      ...b,
      branchManager: mgrName,
      managerName: mgrName
    };
  });

  const branchMatches = (itemBranchId, targetBranchId) => {
    if (!targetBranchId || targetBranchId === 'ALL') return true;
    if (!itemBranchId) return false;
    const rawTarget = String(targetBranchId).toLowerCase();
    const rawItem = typeof itemBranchId === 'object' && itemBranchId !== null
      ? String(itemBranchId._id || itemBranchId.id || itemBranchId.branchCode || '').toLowerCase()
      : String(itemBranchId).toLowerCase();
    return rawItem === rawTarget;
  };

  const orders = selectedBranchId && selectedBranchId !== 'ALL' ? rawOrders.filter(o => branchMatches(o.branchId || o.branch, selectedBranchId)) : rawOrders;
  const tables = selectedBranchId && selectedBranchId !== 'ALL' ? rawTables.filter(t => branchMatches(t.branchId || t.branch, selectedBranchId)) : rawTables;
  const staff = selectedBranchId && selectedBranchId !== 'ALL' ? rawStaff.filter(s => branchMatches(s.branchId || s.branch, selectedBranchId)) : rawStaff;

  // Compute today's revenue (from paid orders)
  const todayRevenue = orders
    .filter(o => String(o.billingStatus || o.paymentStatus || '').toLowerCase() === 'paid')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <OverviewPanel
      orders={orders}
      tables={tables}
      staff={staff}
      users={rawUsers}
      allOrders={rawOrders}
      allTables={rawTables}
      allStaff={rawStaff}
      allUsers={rawUsers}
      branches={branches}
      selectedBranchId={selectedBranchId}
      onSelectBranch={setSelectedBranchId}
      todayRevenue={todayRevenue}
      activeRestaurant={activeRestaurant}
    />
  );
}
