import React, { useState, useEffect, useCallback } from 'react';
import { useAppState } from '../../config/AppContext';
import OverviewPanel from '../../components/OverviewPanel';
import TableApi from '../../api/Table';
import OrderApi from '../../api/Order';
import BranchApi from '../../api/Branch';
import UserApi from '../../api/User';
import { resolveBranchManagerName, resolveBranchContactNumber, isBranchMatch } from '../../helper/BranchHelper';
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
  const [liveUsers, setLiveUsers] = useState([]);

  const isSpecificBranch = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All';

  const fetchDashboardData = useCallback(async () => {
    try {
      const branchParam = isSpecificBranch ? { branchId: selectedBranchId, limit: 10, page: 0 } : { limit: 10, page: 0 };
      const [tablesRes, ordersRes, branchesRes, usersRes] = await Promise.allSettled([
        TableApi.getTables(branchParam),
        OrderApi.getOrders(branchParam),
        BranchApi.getBranches({ limit: 10 }),
        UserApi.getUsers(branchParam)
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
      if (usersRes.status === 'fulfilled' && usersRes.value?.status && usersRes.value.response?.data) {
        setLiveUsers(usersRes.value.response.data);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    }
  }, [isSpecificBranch, selectedBranchId]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 10000);

    const onFocus = () => {
      fetchDashboardData();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchDashboardData]);

  if (!activeRestaurant) return null;

  const rawOrders = (liveOrders && liveOrders.length > 0) ? liveOrders : (activeRestaurant.orders || []);
  const rawTables = (liveTables && liveTables.length > 0) ? liveTables : (activeRestaurant.tables || []);
  const rawUsers = (liveUsers && liveUsers.length > 0) ? liveUsers : (activeRestaurant.users || []);
  const rawStaff = rawUsers.length > 0 ? rawUsers : (activeRestaurant.staff || []);
  const rawBranches = (liveBranches && liveBranches.length > 0) ? liveBranches : (activeRestaurant.branches || []);

  const branches = rawBranches.map(b => {
    const mgrName = resolveBranchManagerName(b, rawUsers, rawStaff);
    const contactNum = resolveBranchContactNumber(b, rawUsers, rawStaff);
    return {
      ...b,
      branchManager: mgrName,
      managerName: mgrName,
      mobileNumber: contactNum !== 'N/A' ? contactNum : (b.mobileNumber || b.contactNumber || b.phone || '')
    };
  });

  const orders = isSpecificBranch
    ? rawOrders.filter(o => isBranchMatch(o, selectedBranchId, branches))
    : rawOrders;

  const tables = isSpecificBranch
    ? rawTables.filter(t => isBranchMatch(t, selectedBranchId, branches))
    : rawTables;

  const staff = isSpecificBranch
    ? rawStaff.filter(s => isBranchMatch(s, selectedBranchId, branches))
    : rawStaff;

  // Compute today's revenue (from paid orders of the active scope)
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

