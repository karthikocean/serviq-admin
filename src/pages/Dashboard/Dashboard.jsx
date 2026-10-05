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
  const [hasFetchedLive, setHasFetchedLive] = useState(false);

  const isSpecificBranch = Boolean(
    selectedBranchId && 
    selectedBranchId !== 'ALL' && 
    selectedBranchId !== 'All' && 
    String(selectedBranchId).toLowerCase() !== 'all branches' && 
    String(selectedBranchId).toUpperCase() !== 'COMPANY'
  );

  const fetchDashboardData = useCallback(async () => {
    try {
      const branchParam = isSpecificBranch ? { branchId: selectedBranchId, limit: 1000, page: 0 } : { limit: 1000, page: 0 };
      const [tablesRes, ordersRes, branchesRes, usersRes] = await Promise.allSettled([
        TableApi.getTables(branchParam),
        OrderApi.getOrders(branchParam),
        BranchApi.getBranches({ limit: 100 }),
        UserApi.getUsers(branchParam)
      ]);

      if (tablesRes.status === 'fulfilled' && tablesRes.value?.status) {
        const resp = tablesRes.value.response;
        const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.tables) ? resp.tables : (Array.isArray(resp?.data?.tables) ? resp.data.tables : [])));
        setLiveTables(list);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.status) {
        const resp = ordersRes.value.response;
        const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.orders) ? resp.orders : (Array.isArray(resp?.data?.orders) ? resp.data.orders : [])));
        setLiveOrders(list);
      }
      if (branchesRes.status === 'fulfilled' && branchesRes.value?.status) {
        const resp = branchesRes.value.response;
        const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.branches) ? resp.branches : (Array.isArray(resp?.data?.branches) ? resp.data.branches : [])));
        setLiveBranches(list);
      }
      if (usersRes.status === 'fulfilled' && usersRes.value?.status) {
        const resp = usersRes.value.response;
        const list = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp?.users) ? resp.users : (Array.isArray(resp?.staff) ? resp.staff : (Array.isArray(resp?.data?.users) ? resp.data.users : []))));
        setLiveUsers(list);
      }
      setHasFetchedLive(true);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      setHasFetchedLive(true);
    }
  }, [isSpecificBranch, selectedBranchId, activeRestaurant?.id, activeRestaurant?._id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (!activeRestaurant) return null;

  const rawOrders = hasFetchedLive ? liveOrders : (activeRestaurant.orders || []);
  const rawTables = hasFetchedLive ? liveTables : (activeRestaurant.tables || []);
  const rawUsers = hasFetchedLive ? liveUsers : (activeRestaurant.users || []);
  const rawStaff = rawUsers.length > 0 ? rawUsers : (hasFetchedLive ? [] : (activeRestaurant.staff || []));
  const rawBranches = hasFetchedLive ? liveBranches : (activeRestaurant.branches || []);

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

