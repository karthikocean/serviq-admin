import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from './Badge';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../config/AppContext';
import DashboardApi from '../api/Dashboard.js';
import TableApi from '../api/Table.js';
import { resolveBranchManagerName, resolveBranchContactNumber, isBranchMatch } from '../helper/BranchHelper.js';

const StoreIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const TrendingUpIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const UsersIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// Robust Table Occupancy Evaluator

export const isTableOccupied = (table, orderList = []) => {
  if (!table) return false;

  // 1. Direct status flags on table
  const statusStr = String(table.status || table.occupancyStatus || '').toLowerCase().trim();
  if (['occupied', 'busy', 'reserved', 'dining', 'seated', 'active', 'in_use', 'dining_occupied'].includes(statusStr)) {
    return true;
  }
  if (table.isOccupied === true || table.occupied === true) {
    return true;
  }
  if (table.currentOrder || table.activeOrderId) {
    return true;
  }

  // 2. Extract table identifiers
  const tableNumStr = String(table.tableNumber || table.tableNo || table.id || table.name || '').toLowerCase().trim();
  const tableIdStr = String(table._id || table.id || '').toLowerCase().trim();
  const tableCleanDigits = tableNumStr.replace(/\D/g, '');
  const tableCleanName = tableNumStr.replace(/[^a-z0-9]/g, '');

  // 3. Match against active orders
  const hasActiveOrder = (orderList || []).some(order => {
    if (!order) return false;

    // Check order active status
    const ordStatus = String(order.status || '').toLowerCase().trim();
    const ordBilling = String(order.billingStatus || order.paymentStatus || '').toLowerCase().trim();
    
    // Ignore completed, delivered, cancelled, rejected, or paid & served orders
    const isCompleted = ['completed', 'delivered', 'cancelled', 'rejected', 'closed'].includes(ordStatus);
    const isPaidAndDone = ordBilling === 'paid' && ['completed', 'ready', 'delivered', 'served'].includes(ordStatus);
    if (isCompleted || isPaidAndDone) return false;

    // Extract order table identifiers
    const ordTableObj = typeof order.tableId === 'object' && order.tableId !== null 
      ? order.tableId 
      : (typeof order.table === 'object' && order.table !== null ? order.table : null);

    const ordTableNumStr = String(
      ordTableObj?.tableNumber || 
      ordTableObj?.tableNo || 
      ordTableObj?.name || 
      order.tableNumber || 
      order.tableNo || 
      (typeof order.table === 'string' ? order.table : '') || 
      order.tableName || 
      ''
    ).toLowerCase().trim();

    const ordTableIdStr = String(
      ordTableObj?._id || 
      ordTableObj?.id || 
      (typeof order.tableId === 'string' ? order.tableId : '') || 
      (typeof order.table === 'string' ? order.table : '') || 
      ''
    ).toLowerCase().trim();

    const ordCleanDigits = ordTableNumStr.replace(/\D/g, '');
    const ordCleanName = ordTableNumStr.replace(/[^a-z0-9]/g, '');

    // Match by ID
    if (tableIdStr && ordTableIdStr && (tableIdStr === ordTableIdStr)) return true;
    if (table._id && ordTableIdStr && String(table._id).toLowerCase() === ordTableIdStr) return true;

    // Match by Table Name/Number
    if (tableNumStr && ordTableNumStr) {
      if (tableNumStr === ordTableNumStr) return true;
      if (tableCleanName && ordCleanName && tableCleanName === ordCleanName) return true;
      if (tableCleanDigits && ordCleanDigits && tableCleanDigits === ordCleanDigits) return true;
    }

    return false;
  });

  return hasActiveOrder;
};

export default function OverviewPanel({
  orders = [],
  tables = [],
  staff = [],
  users = [],
  allOrders = [],
  allTables = [],
  allStaff = [],
  allUsers = [],
  branches = [],
  selectedBranchId = null,
  onSelectBranch = () => {},
  todayRevenue = 0,
  activeRestaurant = {}
}) {
  const navigate = useNavigate();
  const { currentUser } = useAppState();

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase();
  const userType = (userTypeStr || '').toUpperCase();
  const isRestaurantOwner = 
    userType === 'RESTAURANT_OWNER' || 
    userType === 'OWNER' || 
    userType === 'SUPER ADMIN' || 
    userType === 'SUPER_ADMIN' || 
    userRole === 'restaurant_owner' || 
    userRole === 'restaurant owner' || 
    userRole === 'owner' || 
    userRole === 'super admin' || 
    userRole === 'super_admin';
  const isAdmin = isRestaurantOwner || userRole === 'admin' || userType === 'ADMIN';

  const isSpecificBranch = Boolean(selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All');
  const isAllBranches = !isSpecificBranch;

  const selectedBranch = isSpecificBranch
    ? branches.find(b => 
        String(b.id || b._id || '').toLowerCase() === String(selectedBranchId).toLowerCase() || 
        String(b.branchCode || b.code || '').toLowerCase() === String(selectedBranchId).toLowerCase() ||
        String(b.branchName || b.name || '').toLowerCase() === String(selectedBranchId).toLowerCase()
      )
    : null;

  // Live Dashboard API Stats State
  const [statsData, setStatsData] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Live Dashboard Revenue Growth State
  const [revenueGrowthData, setRevenueGrowthData] = useState(null);
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(false);

  // Live Dashboard Order Breakdown State
  const [orderBreakdownData, setOrderBreakdownData] = useState(null);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);

  // Live Dashboard Live Orders State
  const [liveOrdersData, setLiveOrdersData] = useState([]);
  const [isLoadingLiveOrders, setIsLoadingLiveOrders] = useState(false);

  // Live Dashboard Live Tables State
  const [liveTablesData, setLiveTablesData] = useState(null);
  const [isLoadingLiveTables, setIsLoadingLiveTables] = useState(false);
  const [fetchedAllTables, setFetchedAllTables] = useState([]);

  const fetchDashboardStats = async () => {
    setIsLoadingStats(true);
    const branchParam = isSpecificBranch ? { branchId: selectedBranchId } : {};
    const res = await DashboardApi.getDashboardStats(branchParam);
    if (res && res.status && res.response?.data) {
      setStatsData(res.response.data);
    }
    setIsLoadingStats(false);
  };

  const fetchRevenueGrowth = async () => {
    setIsLoadingGrowth(true);
    const branchParam = isSpecificBranch ? { branchId: selectedBranchId } : {};
    const res = await DashboardApi.getRevenueGrowth(branchParam);
    if (res && res.status && res.response?.data) {
      setRevenueGrowthData(res.response.data);
    }
    setIsLoadingGrowth(false);
  };

  const fetchOrderBreakdown = async () => {
    setIsLoadingBreakdown(true);
    const branchParam = isSpecificBranch ? { branchId: selectedBranchId } : {};
    const res = await DashboardApi.getOrderBreakdown(branchParam);
    if (res && res.status && res.response?.data) {
      setOrderBreakdownData(res.response.data);
    }
    setIsLoadingBreakdown(false);
  };

  const fetchLiveOrders = async () => {
    setIsLoadingLiveOrders(true);
    const branchParam = isSpecificBranch ? { branchId: selectedBranchId, limit: 10 } : { limit: 10 };
    const res = await DashboardApi.getLiveOrders(branchParam);
    if (res && res.status && res.response?.data) {
      setLiveOrdersData(Array.isArray(res.response.data) ? res.response.data : (res.response.data?.orders || []));
    }
    setIsLoadingLiveOrders(false);
  };

  const fetchLiveTables = async () => {
    setIsLoadingLiveTables(true);
    const branchParam = isSpecificBranch ? { branchId: selectedBranchId } : {};
    const res = await DashboardApi.getLiveTables(branchParam);
    if (res && res.status && res.response?.data) {
      setLiveTablesData(res.response.data);
    }
    setIsLoadingLiveTables(false);
  };

  const fetchAllBranchTables = async () => {
    try {
      const res = await TableApi.getTables({ limit: 10 });
      if (res && res.status && res.response) {
        const tList = Array.isArray(res.response.data) ? res.response.data : (Array.isArray(res.response) ? res.response : []);
        if (tList.length > 0) {
          setFetchedAllTables(tList);
        }
      }
    } catch (e) {
      console.warn("Could not fetch tables for branch overview:", e);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRevenueGrowth();
    fetchOrderBreakdown();
    fetchLiveOrders();
    fetchLiveTables();
    fetchAllBranchTables();

    const interval = setInterval(() => {
      fetchDashboardStats();
      fetchLiveOrders();
      fetchLiveTables();
      fetchAllBranchTables();
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedBranchId, isSpecificBranch]);

  // Current view tables and orders
  const displayTables = isSpecificBranch
    ? (tables && tables.length > 0 ? tables : allTables).filter(t => isBranchMatch(t, selectedBranchId, branches))
    : (allTables && allTables.length > 0 ? allTables : tables);
  const displayOrders = isSpecificBranch
    ? (orders && orders.length > 0 ? orders : allOrders).filter(o => isBranchMatch(o, selectedBranchId, branches))
    : (allOrders && allOrders.length > 0 ? allOrders : orders);
  const displayStaff = isSpecificBranch
    ? (staff && staff.length > 0 ? staff : allStaff).filter(s => isBranchMatch(s, selectedBranchId, branches))
    : (allStaff && allStaff.length > 0 ? allStaff : staff);


  // Dynamic order breakdown calculation with safe empty state
  const activeBreakdown = useMemo(() => {
    // 1. If backend API provided breakdown data with valid categories and items
    if (orderBreakdownData && Array.isArray(orderBreakdownData.categories)) {
      // Strictly require count > 0; categories without items must never be included
      const validCategories = orderBreakdownData.categories.filter(c => Number(c.count) > 0);
      const totalItems = orderBreakdownData.totalItemsSold !== undefined
        ? Number(orderBreakdownData.totalItemsSold)
        : validCategories.reduce((acc, c) => acc + (Number(c.count) || 0), 0);

      if (totalItems > 0 && validCategories.length > 0) {
        const defaultColors = ['#ff7a00', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
        return {
          totalItemsSold: totalItems,
          categories: validCategories.map((c, idx) => {
            const calculatedPct = totalItems > 0 ? Math.round((Number(c.count) / totalItems) * 100) : 0;
            return {
              ...c,
              count: Number(c.count),
              percentage: c.percentage !== undefined && Number(c.percentage) > 0 ? Number(c.percentage) : calculatedPct,
              color: c.color || defaultColors[idx % defaultColors.length]
            };
          })
        };
      }
      return { totalItemsSold: 0, categories: [] };
    }

    // 2. Dynamic fallback: compute from displayOrders if available
    const ordersList = (displayOrders && displayOrders.length > 0) ? displayOrders : [];
    if (ordersList.length > 0) {
      const catMap = new Map();
      let totalItems = 0;

      ordersList.forEach(ord => {
        const items = Array.isArray(ord.items) ? ord.items : [];
        items.forEach(it => {
          const qty = it.quantity !== undefined ? Number(it.quantity) : (it.qty !== undefined ? Number(it.qty) : 0);
          if (qty <= 0) return;
          const cat = it.category || it.categoryName || it.menuItem?.category || 'Main Course';
          const rev = Number(it.price || 0) * qty;

          totalItems += qty;
          if (!catMap.has(cat)) {
            catMap.set(cat, { name: cat, count: 0, revenue: 0 });
          }
          const entry = catMap.get(cat);
          entry.count += qty;
          entry.revenue += rev;
        });
      });

      if (totalItems > 0) {
        const defaultColors = ['#ff7a00', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
        const cats = Array.from(catMap.values())
          .filter(c => c.count > 0)
          .map((c, idx) => ({
            name: c.name,
            count: c.count,
            revenue: c.revenue,
            percentage: Math.round((c.count / totalItems) * 100),
            color: defaultColors[idx % defaultColors.length]
          }));

        if (cats.length > 0) {
          return {
            totalItemsSold: totalItems,
            categories: cats
          };
        }
      }
    }

    // 3. No items available
    return {
      totalItemsSold: 0,
      categories: []
    };
  }, [orderBreakdownData, displayOrders]);

  // Accurately computed counts
  const localOccupiedCount = displayTables.filter(t => isTableOccupied(t, displayOrders)).length;
  const occupiedTablesCount = localOccupiedCount;
  const totalTablesDisplayCount = displayTables.length || statsData?.activeTables?.total || statsData?.occupiedTables?.total || liveTablesData?.total || 0;
  const pendingOrdersCount = displayOrders.filter(o => o.status === 'new').length;
  const completedOrdersCount = displayOrders.filter(o => o.status === 'completed').length;
  const onDutyStaffCount = displayStaff.filter(s => {
    const statusStr = String(s.dutyStatus || s.status || '').toLowerCase().trim();
    return statusStr === 'on duty' || statusStr === 'on_duty' || statusStr === 'active';
  }).length;
  const activeBranchesCount = branches.filter(b => b.status === 'Active' || b.isActive !== false).length;

  // Calculate dynamic monthly sales
  const monthlySales = todayRevenue;

  // Top ordered menu item fallback
  const getTopOrderedItem = () => {
    const itemCounts = {};
    displayOrders.forEach(order => {
      (order.items || []).forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.qty || 0);
      });
    });
    let topItemName = '-';
    let maxCount = 0;
    Object.keys(itemCounts).forEach(name => {
      if (itemCounts[name] > maxCount) {
        maxCount = itemCounts[name];
        topItemName = name;
      }
    });
    return topItemName;
  };

  const topItemFallback = getTopOrderedItem();

  // Dynamic 6-month revenue calculation from real orders
  const dynamicPast6Months = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = monthNames[d.getMonth()];
      const yr = d.getFullYear();
      const mIdx = d.getMonth();

      const ordersInMonth = (displayOrders || []).filter(o => {
        if (!o.createdAt) return false;
        const oDate = new Date(o.createdAt);
        return oDate.getFullYear() === yr && oDate.getMonth() === mIdx;
      });

      const rev = ordersInMonth.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      months.push({
        label: mName,
        month: mName,
        year: yr,
        revenue: rev,
        formattedRevenue: rev >= 1000 ? `₹${(rev / 1000).toFixed(1)}k` : `₹${rev}`,
        ordersCount: ordersInMonth.length
      });
    }
    const maxRev = Math.max(...months.map(m => m.revenue), 1);
    return months.map(m => ({
      ...m,
      percentage: m.revenue > 0 ? Math.max(15, Math.round((m.revenue / maxRev) * 100)) : 12
    }));
  }, [displayOrders]);

  // Branch statistics computation for All Branches view
  const combinedTables = (fetchedAllTables && fetchedAllTables.length > 0) ? fetchedAllTables : allTables;

  const branchAnalytics = branches.map(branch => {
    const branchTarget = branch._id || branch.id || branch.branchCode;
    const branchOrders = (allOrders && allOrders.length > 0 ? allOrders : orders).filter(o => isBranchMatch(o, branchTarget, branches));
    const branchTables = (combinedTables && combinedTables.length > 0 ? combinedTables : tables).filter(t => isBranchMatch(t, branchTarget, branches));
    const branchStaff = (allStaff && allStaff.length > 0 ? allStaff : staff).filter(s => isBranchMatch(s, branchTarget, branches));
    const branchRevenue = branchOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);


    // Collect all occupied table identifiers accurately
    const occupiedTableIds = new Set();

    // 1. Direct table status and matches from branchTables
    branchTables.forEach(t => {
      if (isTableOccupied(t, branchOrders)) {
        const idStr = String(t._id || t.id || t.tableNumber || t.tableNo || t.name || '').toLowerCase().trim();
        if (idStr) occupiedTableIds.add(idStr);
      }
    });

    // 2. Active dining orders in this branch also reflect occupied tables
    const activeBranchOrders = branchOrders.filter(o => {
      if (!o) return false;
      const status = String(o.status || '').toLowerCase().trim();
      const billing = String(o.billingStatus || o.paymentStatus || '').toLowerCase().trim();
      const isClosed = ['completed', 'delivered', 'cancelled', 'rejected', 'closed'].includes(status);
      const isPaidAndDone = billing === 'paid' && ['completed', 'ready', 'delivered', 'served'].includes(status);
      return !isClosed && !isPaidAndDone;
    });

    activeBranchOrders.forEach(o => {
      const ordTableObj = typeof o.tableId === 'object' && o.tableId !== null 
        ? o.tableId 
        : (typeof o.table === 'object' && o.table !== null ? o.table : null);
      
      const tId = String(
        ordTableObj?._id || 
        ordTableObj?.id || 
        ordTableObj?.tableNumber || 
        ordTableObj?.tableNo || 
        o.tableNumber || 
        o.tableNo || 
        (typeof o.table === 'string' ? o.table : '') || 
        o.tableName || 
        (typeof o.tableId === 'string' ? o.tableId : '') || 
        ''
      ).toLowerCase().trim();

      if (tId) {
        occupiedTableIds.add(tId);
      }
    });

    const occupied = occupiedTableIds.size;
    const totalBranchTables = Math.max(branchTables.length || branch.totalTables || 0, occupied);

    const activeStaff = branchStaff.filter(s => {
      const statusStr = String(s.dutyStatus || s.status || '').toLowerCase().trim();
      return statusStr === 'on duty' || statusStr === 'on_duty' || statusStr === 'active';
    }).length;

    const mgr = resolveBranchManagerName(branch, allUsers || users || [], branchStaff || allStaff || staff || []);
    const contactNum = resolveBranchContactNumber(branch, allUsers || users || [], branchStaff || allStaff || staff || []);

    return {
      ...branch,
      id: branch._id || branch.id,
      branchName: branch.branchName || branch.name || 'Branch',
      branchCode: branch.branchCode || 'BR-001',
      branchManager: mgr,
      managerName: mgr,
      mobileNumber: contactNum !== 'N/A' ? contactNum : (branch.mobileNumber || branch.contactNumber || branch.phone || ''),
      ordersCount: branchOrders.length,
      revenue: branchRevenue,
      tablesCount: totalBranchTables,
      occupiedTables: occupied,
      staffCount: branchStaff.length,
      activeStaff: activeStaff
    };
  });

  return (
    <section className="panel-view active" style={{ width: '100%' }}>
      {/* ACTIVE BRANCH SCOPE BANNER */}
      {selectedBranch && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1.5px solid #fed7aa',
          borderRadius: '16px',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 122, 0, 0.3)'
            }}>
              <StoreIcon size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {selectedBranch.branchName || selectedBranch.name}
                </h3>
                <span style={{ fontSize: '11px', background: '#059669', color: '#ffffff', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  {selectedBranch.status || 'Active'}
                </span>
                <span style={{ fontSize: '11px', background: '#e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                  {selectedBranch.branchCode}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                📍 {typeof selectedBranch.address === 'object' && selectedBranch.address !== null ? (selectedBranch.city || selectedBranch.address?.city || selectedBranch.address?.street || selectedBranch.address?.state || 'Tamil Nadu') : (selectedBranch.city || selectedBranch.address || 'Tamil Nadu')} • Manager: <strong>{resolveBranchManagerName(selectedBranch, allUsers || users || [], allStaff || staff || [])}</strong> • Contact: {resolveBranchContactNumber(selectedBranch, allUsers || users || [], allStaff || staff || [])}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ fontSize: '12px', fontWeight: 700, padding: '8px 16px', background: '#ffffff' }}
              onClick={() => onSelectBranch(null)}
            >
              ← View All Branches
            </button>
          )}
        </div>
      )}

      {/* 8 STATS CARDS GRID (2 Rows of 4 Cards) */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '20px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Card 1: Today's Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAllBranches ? "TODAY'S ORDERS (ALL)" : "TODAY'S ORDERS"}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {statsData?.todayOrders?.count !== undefined 
                  ? statsData.todayOrders.count 
                  : displayOrders.length}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Active Tables */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAllBranches ? 'OCCUPIED TABLES (LIVE)' : 'ACTIVE TABLES (LIVE)'}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {`${occupiedTablesCount} / ${totalTablesDisplayCount} Total`}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 3: Revenue Today */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAllBranches ? 'ORG REVENUE (TODAY)' : 'BRANCH REVENUE (TODAY)'}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {statsData?.todayRevenue?.formatted || `₹${(statsData?.todayRevenue?.amount ?? todayRevenue).toLocaleString('en-IN')}`}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 4: Revenue This Month */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isAllBranches ? 'ORG REVENUE (THIS MONTH)' : 'BRANCH REVENUE (THIS MONTH)'}
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {statsData?.monthRevenue?.formatted || `₹${(statsData?.monthRevenue?.amount ?? monthlySales).toLocaleString('en-IN')}`}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 5: Staff On Duty */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                STAFF ON DUTY (TODAY)
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {statsData?.staffOnDuty?.display
                  ? statsData.staffOnDuty.display
                  : (statsData?.staffOnDuty?.onDuty !== undefined
                      ? `${statsData.staffOnDuty.onDuty} / ${statsData.staffOnDuty.total ?? staff.length} Total`
                      : `${onDutyStaffCount} / ${staff.length} Total`)}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 6: Pending Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                PENDING ORDERS (TODAY)
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {statsData?.pendingOrders?.count !== undefined ? statsData.pendingOrders.count : pendingOrdersCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 7: Completed Orders */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info">
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                COMPLETED ORDERS (TODAY)
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: 'var(--black)' }}>
                {statsData?.completedOrders?.count !== undefined ? statsData.completedOrders.count : completedOrdersCount}
              </h3>
            </div>
          </div>
        </div>

        {/* Card 8: Top Items */}
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info" style={{ width: '100%' }}>
              <div className="stat-label" style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                TOP ITEM (THIS MONTH)
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '4px 0', color: 'var(--black)', lineHeight: 1.25, wordBreak: 'break-word' }} title={statsData?.topItem?.name || topItemFallback}>
                {statsData?.topItem?.name || topItemFallback}
              </h3>
            </div>
          </div>
        </div>

      </div>

      {/* MULTI-BRANCH PERFORMANCE TABLE (WHEN ALL BRANCHES IS VIEWED) */}
      {isAllBranches && (
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--black)' }}>
                Branch-wise Performance Overview
              </h3>
            
            </div>
            {isRestaurantOwner && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '12px', fontWeight: 700, padding: '8px 16px' }}
                onClick={() => navigate('/branch-management')}
              >
                Manage Branches →
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)', paddingBottom: '6px' }}>
            <table className="menu-items-table" style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f', textAlign: 'left' }}>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BRANCH NAME</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CODE & LOCATION</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MANAGER</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TABLES OCCUPIED</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STAFF ON DUTY</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TODAY ORDERS</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>REVENUE</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {branchAnalytics.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StoreIcon size={16} color="var(--primary)" />
                        <span>{b.branchName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, color: '#334155', marginRight: '6px' }}>
                        {b.branchCode}
                      </span>
                      {b.city || 'Tamil Nadu'}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600 }}>
                      {b.branchManager || b.managerName || resolveBranchManagerName(b, allUsers || users || [], allStaff || staff || []) || 'Unassigned'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        backgroundColor: b.status === 'Active' ? '#ecfdf5' : '#fef2f2',
                        color: b.status === 'Active' ? '#059669' : '#dc2626'
                      }}>
                        {b.status || 'Active'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <span style={{ color: b.occupiedTables > 0 ? '#ea580c' : '#10b981' }}>{b.occupiedTables} Occupied</span> / {b.tablesCount}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#334155' }}>
                      {b.activeStaff} / {b.staffCount}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                      {b.ordersCount}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--primary)' }}>
                      ₹{b.revenue.toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      {isAdmin ? (
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 700 }}
                          onClick={() => onSelectBranch(b.id)}
                        >
                          Drill Down
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHARTS CONTAINER (Revenue Growth & Order Breakdown) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Revenue Growth Card */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div>
              <h3 className="feed-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--black)' }}>
                {revenueGrowthData?.title || (isAllBranches ? 'Branch Revenue Comparison (₹)' : 'Revenue Growth')}
              </h3>
              
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '11px', background: 'rgba(255, 122, 0, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                {revenueGrowthData?.subtitle || 'Last 6 Months'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', height: '180px', padding: '0 10px', marginTop: '20px' }}>
            {isAllBranches && revenueGrowthData?.branchComparison && revenueGrowthData.branchComparison.length > 0 ? (
              revenueGrowthData.branchComparison.map((b, idx) => {
                const maxRev = Math.max(...revenueGrowthData.branchComparison.map(x => x.revenue || 0), 1000);
                const pct = Math.max(15, Math.min(100, b.percentage !== undefined ? b.percentage : Math.round(((b.revenue || 0) / maxRev) * 100)));
                const hasRevenue = (b.revenue || 0) > 0;
                return (
                  <div key={b.branchId || b.id || b.branchCode || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: hasRevenue ? 'var(--primary)' : 'var(--text-main)', marginBottom: '8px' }}>
                      {b.formattedRevenue || `₹${b.revenue || 0}`}
                    </span>
                    <div style={{ height: '110px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                      <div
                        title={`${b.branchName || b.branchCode}: ${b.formattedRevenue || `₹${b.revenue || 0}`} (${b.ordersCount || 0} orders)`}
                        style={{ 
                          width: '36px', 
                          height: `${pct}%`, 
                          background: hasRevenue
                            ? 'linear-gradient(180deg, #ff7a00 0%, rgba(255, 122, 0, 0.2) 100%)'
                            : 'linear-gradient(180deg, #cbd5e1 0%, rgba(203, 213, 225, 0.25) 100%)', 
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: hasRevenue ? '0 2px 8px rgba(255, 122, 0, 0.25)' : 'none',
                          cursor: 'pointer'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', maxWidth: '80px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.branchName || b.branchCode}>
                      {b.branchCode || b.branchName}
                    </span>
                  </div>
                );
              })
            ) : (
              (revenueGrowthData?.data && revenueGrowthData.data.length > 0
                ? revenueGrowthData.data
                : (isAllBranches
                    ? branchAnalytics.map(b => ({ label: b.branchCode, formattedRevenue: `₹${(b.revenue / 1000).toFixed(1)}k`, percentage: Math.max(15, Math.round((b.revenue / Math.max(...branchAnalytics.map(x => x.revenue), 1000)) * 100)), revenue: b.revenue }))
                    : dynamicPast6Months
                  )
              ).map((item, idx) => {
                const pct = Math.max(12, Math.min(100, item.percentage !== undefined ? item.percentage : 15));
                const hasRevenue = (item.revenue || 0) > 0;
                return (
                  <div key={item.label || item.month || idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: hasRevenue ? 'var(--primary)' : 'var(--text-main)', marginBottom: '8px' }}>
                      {item.formattedRevenue || (item.revenue !== undefined ? `₹${item.revenue}` : item.val)}
                    </span>
                    <div style={{ height: '110px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px' }}>
                      <div
                        title={`${item.label || item.month} ${item.year || ''}: ${item.formattedRevenue || `₹${item.revenue || 0}`} • ${item.ordersCount || 0} Orders`}
                        style={{ 
                          width: '32px', 
                          height: `${pct}%`, 
                          background: hasRevenue
                            ? 'linear-gradient(180deg, #ff7a00 0%, rgba(255, 122, 0, 0.2) 100%)'
                            : 'linear-gradient(180deg, #e2e8f0 0%, rgba(226, 232, 240, 0.3) 100%)', 
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          cursor: 'pointer',
                          boxShadow: hasRevenue ? '0 2px 8px rgba(255, 122, 0, 0.25)' : 'none'
                        }}
                      ></div>
                    </div>
                    <span style={{ fontSize: '12px', color: hasRevenue ? 'var(--black)' : 'var(--text-muted)', fontWeight: hasRevenue ? 700 : 600 }}>
                      {item.label || item.month}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Order Breakdown Card */}
        <div className="settings-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 className="feed-title" style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--black)' }}>Order Breakdown</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {activeBreakdown.totalItemsSold > 0 ? ` ` : ''}
              </span>
              <button
                type="button"
                onClick={() => navigate('/reports')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#fff0e6',
                  color: '#ff5a1f',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(255, 90, 31, 0.08)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#ff5a1f';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#ff5a1f';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff0e6';
                  e.currentTarget.style.color = '#ff5a1f';
                  e.currentTarget.style.borderColor = '#fed7aa';
                }}
                title="View Detailed Order & Sales Reports"
              >
                <span>View All</span>
                <span style={{ fontSize: '12px', lineHeight: 1 }}>→</span>
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {activeBreakdown.totalItemsSold > 0 && activeBreakdown.categories && activeBreakdown.categories.length > 0 ? (
              activeBreakdown.categories.filter(c => Number(c.count) > 0).slice(0, 5).map((cat, idx) => {
                const defaultColors = ['#ff7a00', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
                const itemColor = cat.color || defaultColors[idx % defaultColors.length];
                const pct = cat.percentage ?? (activeBreakdown.totalItemsSold > 0 ? Math.round((cat.count / activeBreakdown.totalItemsSold) * 100) : 0);
                return (
                  <div key={cat.categoryId || cat.name || idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: itemColor, display: 'inline-block' }}></span>
                        {cat.name}
                        {cat.count !== undefined && (
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                            ({cat.count} {cat.count === 1 ? 'item' : 'items'} • ₹{cat.revenue || 0})
                          </span>
                        )}
                      </span>
                      <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.max(3, pct)}%`, height: '100%', background: itemColor, borderRadius: '4px', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '28px 16px', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--bg-tertiary, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  📊
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>No items available</span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>No order breakdown data recorded for this selection.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LOWER ROW: Live Order Feed on Top (Full Width) & Dining Tables Panel Underneath */}
      <div className="dashboard-inner-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Live Order Feed Table (Full Width) */}
        <div className="feed-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '22px 24px', border: '1px solid var(--border)', width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
          <div className="feed-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 className="feed-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--black)', margin: 0 }}>
                Live Order Feed {selectedBranch ? `(${selectedBranch.branchCode})` : '(All Branches)'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="live-dot-indicator"><span className="pulse-dot"></span>Live</span>
              <button
                type="button"
                onClick={() => navigate('/orders')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff0e6',
                  color: '#ff5a1f',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(255, 90, 31, 0.08)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#ff5a1f';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#ff5a1f';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff0e6';
                  e.currentTarget.style.color = '#ff5a1f';
                  e.currentTarget.style.borderColor = '#fed7aa';
                }}
              >
                <span>View All</span>
                <span style={{ fontSize: '13px', lineHeight: 1 }}>→</span>
              </button>
            </div>
          </div>
          <div className="feed-table-wrapper" style={{ borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', paddingBottom: '0px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
            <table className="feed-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '150px' }}>ORDER ID</th>
                  <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '90px' }}>BRANCH</th>
                  <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '130px' }}>TABLE</th>
                  <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>ITEMS</th>
                  <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', minWidth: '100px' }}>TOTAL</th>
                  <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '110px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const rawList = (liveOrdersData && liveOrdersData.length > 0 ? liveOrdersData : displayOrders);
                  const list = isSpecificBranch
                    ? rawList.filter(o => isBranchMatch(o, selectedBranchId, branches))
                    : rawList;

                  if (list.length === 0) {
                    return (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: 'var(--text-muted)' }}>
                          No live orders found for this branch selection.
                        </td>
                      </tr>
                    );
                  }

                  return list.slice(0, 10).map((ord, idx) => {
                    const itemSummary = ord.itemsSummary || (ord.items || []).map(i => `${i.name || i.title} x ${i.quantity || i.qty || 1}`).join(', ') || 'Items';
                    const branchInfo = branches.find(b => isBranchMatch(b, ord.branchId || ord.branch || ord.restaurantBranchId, branches));
                    const branchCode = ord.branch?.code || ord.branchCode || (branchInfo ? branchInfo.branchCode : (ord.branchId ? String(ord.branchId).slice(-6).toUpperCase() : 'BR-001'));
                    const tableDisplay = ord.tableNumber || ord.tableName || (ord.table ? `Table ${ord.table}` : 'Takeaway');
                    const orderIdDisplay = ord.orderId || (ord.id ? `#${ord.id}` : `#ORD-${idx + 1}`);

                    return (
                      <tr key={ord.id || ord._id || ord.orderId || idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                          <div>{orderIdDisplay}</div>
                          {ord.time && <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>{ord.time}</div>}
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-block', whiteSpace: 'nowrap' }}>
                            {branchCode}
                          </span>
                        </td>
                        <td style={{ padding: '14px 14px', fontWeight: 600, color: 'var(--text-main)', fontSize: '13px' }}>
                          <div>{tableDisplay}</div>
                          {ord.section && <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 400 }}>{ord.section}</span>}
                        </td>
                        <td className="items-cell" style={{ padding: '14px 14px', color: 'var(--text-muted)', fontSize: '13px' }} title={itemSummary}>
                          {itemSummary}
                        </td>
                        <td style={{ padding: '14px 14px', fontWeight: 700, color: 'var(--primary)', textAlign: 'right', fontSize: '13.5px' }}>
                          <div>₹{ord.total}</div>
                          {ord.billingStatus && (
                            <span style={{ fontSize: '10.5px', textTransform: 'uppercase', color: ord.billingStatus === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                              {ord.billingStatus}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <Badge status={ord.status || 'new'} style={{ fontSize: '10.5px', padding: '4px 10px', textTransform: 'uppercase' }} />
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dining Tables Grid (Full Width, Underneath Live Order Feed) */}
        <div className="tables-widget-card" style={{ background: 'var(--bg-secondary)', borderRadius: '16px', padding: '22px 24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 className="feed-title" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--black)', margin: 0, whiteSpace: 'nowrap' }}>
                Live Tables Status
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', background: occupiedTablesCount > 0 ? '#fef2f2' : '#f0fdf4', color: occupiedTablesCount > 0 ? '#ef4444' : '#166534', padding: '3px 8px', borderRadius: '8px', fontWeight: 700, border: occupiedTablesCount > 0 ? '1px solid #fecaca' : '1px solid #bbf7d0', whiteSpace: 'nowrap' }}>
                {occupiedTablesCount} Occupied
              </span>
              <span style={{ fontSize: '11px', background: '#f8fafc', color: '#64748b', padding: '3px 8px', borderRadius: '8px', fontWeight: 700, border: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                {displayTables.length} Total Tables
              </span>
              <button
                type="button"
                onClick={() => navigate('/tables')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fff0e6',
                  color: '#ff5a1f',
                  border: '1px solid #fed7aa',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(255, 90, 31, 0.08)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#ff5a1f';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#ff5a1f';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff0e6';
                  e.currentTarget.style.color = '#ff5a1f';
                  e.currentTarget.style.borderColor = '#fed7aa';
                }}
              >
                <span>View All</span>
                <span style={{ fontSize: '13px', lineHeight: 1 }}>→</span>
              </button>
            </div>
          </div>

          <div
            className="tables-status-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '12px',
              paddingBottom: '4px'
            }}
          >
            {displayTables.slice(0, 5).map((table, idx) => {
              const isOccupied = isTableOccupied(table, displayOrders);
              const isReserved = String(table.status || '').toLowerCase() === 'reserved';
              const tableNum = table.tableNumber || table.tableNo || table.id || `T-${idx + 1}`;
              const seats = table.seatingCapacity ?? table.seats ?? 4;
              const section = table.section || 'Main Dining';
              const waiterName = table.assignedWaiter?.name || (typeof table.assignedWaiter === 'string' ? table.assignedWaiter : null);

              return (
                <div 
                  key={table._id || table.id || table.tableNumber || idx} 
                  style={{ 
                    background: '#ffffff', 
                    border: '1.5px solid var(--border)', 
                    borderTop: isOccupied ? '4px solid #ef4444' : (isReserved ? '4px solid #f59e0b' : '4px solid #10b981'),
                    borderRadius: '10px', 
                    padding: '12px 10px', 
                    textAlign: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)' }}>
                        {tableNum}
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        {seats} Seats
                      </span>
                    </div>

                    <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500, textAlign: 'left', marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={section}>
                      {section}
                    </div>

                    {waiterName && (
                      <div style={{ fontSize: '10.5px', color: '#475569', fontWeight: 600, textAlign: 'left', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }} title={`Waiter: ${waiterName}`}>
                        <UserIcon size={11} color="#64748b" />
                        <span>{waiterName}</span>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #f1f5f9' }}>
                    <span style={{ 
                      fontSize: '9.5px', 
                      fontWeight: 800, 
                      letterSpacing: '0.4px', 
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isOccupied ? '#fef2f2' : (isReserved ? '#fffbeb' : '#f0fdf4'),
                      color: isOccupied ? '#ef4444' : (isReserved ? '#f59e0b' : '#10b981')
                    }}>
                      {isOccupied ? 'OCCUPIED' : (isReserved ? 'RESERVED' : 'FREE')}
                    </span>
                  </div>
                </div>
              );
            })}

            {displayTables.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '24px', fontSize: '13px' }}>
                No tables configured for this branch.
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
