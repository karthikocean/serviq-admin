import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from './Modal';
import * as XLSX from 'xlsx';
import ReportsApi from '../api/Reports.js';
import '../pages/Reports/Reports.css';

// SVG Icons
const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const FileSpreadsheetIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
    <path d="M10 9h4" />
  </svg>
);

const PrinterIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const FilterIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const RefreshCwIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const PackageIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.27 6.96 8.73 5.05 8.73-5.05" />
    <path d="M12 22.08V12" />
  </svg>
);

const DollarSignIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const UtensilsIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
    <path d="M15 11v11" />
    <path d="M5 2v14a3 3 0 0 0 3 3h1v3" />
    <path d="M9 2v6" />
  </svg>
);

const ShoppingBagIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const PercentIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const UserIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ReceiptIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M4 2v20l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2V2z" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="12" y2="14" />
  </svg>
);

const AlertTriangleIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

import { formatDateDMY, formatDateTimeDMY, extractOrderISODate } from '../helper/DateHelper.js';
import { isBranchMatch, isUserCompanyUser, getUserAssignedBranchId, isBranchFilterActive } from '../helper/BranchHelper.js';
import { useAppState } from '../config/AppContext.jsx';

// Safe text extractor
const toDisplayText = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.categoryName || val.title || val.tableNumber || val.tableNo || val.label || fallback;
  }
  return String(val);
};

// Formatted Staff / Employee ID helper
const getFormattedStaffId = (u, fallbackIndex) => {
  if (!u) return '-';
  const rawCode = u.employeeCode || u.staffCode || u.userCode || u.idCode || u.staffId || u.empId;
  const isRawHex = rawCode && /^[0-9a-fA-F]{24}$/.test(String(rawCode).trim());
  if (rawCode && !isRawHex) {
    return String(rawCode).trim();
  }
  if (u._id && String(u._id).length >= 4) {
    return `EMP-${String(u._id).slice(-4).toUpperCase()}`;
  }
  if (u.id && String(u.id).length >= 4) {
    return `EMP-${String(u.id).slice(-4).toUpperCase()}`;
  }
  return '-';
};

// Formatted Order Number helper
const getFormattedOrderNo = (ord, fallbackIndex) => {
  if (!ord) return '-';
  if (typeof ord === 'string' || typeof ord === 'number') {
    const s = String(ord).trim();
    if (!s || s === '-') return '-';
    if (/^[0-9a-fA-F]{24}$/.test(s)) {
      return `#ORD-${s.slice(-6).toUpperCase()}`;
    }
    if (s.startsWith('#ORD-')) return s;
    if (s.startsWith('ORD-')) return `#${s}`;
    if (s.startsWith('#')) return s;
    return `#ORD-${s}`;
  }

  // Priority 1: Check human-readable non-hex custom order identifiers
  const candidates = [
    ord.orderNumber,
    ord.customOrderId,
    ord.orderCode,
    ord.orderNo,
    ord.orderRefId,
    ord.tokenNo,
    ord.orderId,
    ord.id,
    ord._id
  ];

  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== '') {
      const str = String(c).trim();
      // If it's NOT a 24-character hex MongoDB ObjectId, format and return it!
      if (!/^[0-9a-fA-F]{24}$/.test(str)) {
        if (str.startsWith('#ORD-')) return str;
        if (str.startsWith('ORD-')) return `#${str}`;
        if (str.startsWith('#')) return str;
        return `#ORD-${str}`;
      }
    }
  }

  // Priority 2: If only a 24-character hex ID exists, format cleanly as #ORD-{LAST6}
  const hexCandidate = ord.orderId || ord._id || ord.id;
  if (hexCandidate) {
    const strHex = String(hexCandidate).trim();
    if (strHex.length >= 6) {
      return `#ORD-${strHex.slice(-6).toUpperCase()}`;
    }
    return `#ORD-${strHex.toUpperCase()}`;
  }

  return '-';
};

// Helper to determine if an item is Veg, Non-Veg, or Egg
const resolveFoodType = (item) => {
  if (!item) return 'Veg';
  if (item.foodType) {
    const ft = String(item.foodType).trim().toLowerCase();
    if (ft === 'veg' || ft === 'vegetarian') return 'Veg';
    if (ft === 'egg') return 'Egg';
    if (ft === 'non-veg' || ft === 'nonveg' || ft === 'non vegetarian') return 'Non-Veg';
    return item.foodType;
  }
  if (item.egg) return 'Egg';
  if (item.veg === true || item.isVeg === true) return 'Veg';
  if (item.veg === false || item.isVeg === false) return 'Non-Veg';

  const n = String(item.name || item.dishName || item.title || item.itemName || '').toLowerCase();
  const c = String(item.category || item.categoryName || '').toLowerCase();
  if (n.includes('egg') || c.includes('egg')) return 'Egg';
  if (
    n.includes('chicken') ||
    n.includes('mutton') ||
    n.includes('fish') ||
    n.includes('prawn') ||
    n.includes('meat') ||
    n.includes('beef') ||
    n.includes('pork') ||
    n.includes('seafood') ||
    c.includes('non-veg') ||
    c.includes('non veg') ||
    c.includes('chicken') ||
    c.includes('meat')
  ) {
    return 'Non-Veg';
  }
  return 'Veg';
};

export default function ReportsPanel({
  branches = [],
  selectedBranchId: propSelectedBranchId,
  activeRestaurant: propActiveRestaurant,
  initialTab = 'sales',
  activeTabProp,
  onTabChange,
  orders: propOrders,
  menu: propMenu,
  inventory: propInventory,
  staff: propStaff
}) {
  const { currentUser, selectedBranchId: contextBranchId, activeRestaurant: contextActiveRestaurant } = useAppState();
  const activeRestaurant = propActiveRestaurant || contextActiveRestaurant;
  const selectedBranchId = propSelectedBranchId !== undefined ? propSelectedBranchId : contextBranchId;

  const allBranchesList = useMemo(() => {
    return Array.isArray(branches) && branches.length > 0
      ? branches
      : (activeRestaurant?.branches || []);
  }, [branches, activeRestaurant?.branches]);

  // Determine if login is Company vs Branch login
  const isCompanyUser = useMemo(() => isUserCompanyUser(currentUser), [currentUser]);
  const userBranchId = useMemo(() => getUserAssignedBranchId(currentUser), [currentUser]);
  const isBranchLogin = useMemo(() => {
    return !isCompanyUser && Boolean(userBranchId);
  }, [isCompanyUser, userBranchId]);

  const [activeTab, setActiveTab] = useState(activeTabProp || initialTab);

  useEffect(() => {
    if (activeTabProp && activeTabProp !== activeTab) {
      setActiveTab(activeTabProp);
    }
  }, [activeTabProp]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (typeof onTabChange === 'function') {
      onTabChange(tabId);
    }
  };

  // Filters State
  // If branch login, always locked to their branch. If company login, defaults to topbar branch or 'ALL'
  const [branchFilter, setBranchFilter] = useState(() => {
    if (isBranchLogin) {
      return userBranchId;
    }
    if (!isBranchFilterActive(selectedBranchId)) {
      return 'ALL';
    }
    return selectedBranchId;
  });

  useEffect(() => {
    if (isBranchLogin) {
      setBranchFilter(userBranchId);
    } else if (selectedBranchId !== undefined) {
      if (!isBranchFilterActive(selectedBranchId)) {
        setBranchFilter('ALL');
      } else {
        setBranchFilter(selectedBranchId);
      }
    }
  }, [selectedBranchId, isBranchLogin, userBranchId]);
  const [datePreset, setDatePreset] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dishFilter, setDishFilter] = useState('ALL');
  const [foodTypeFilter, setFoodTypeFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [inventoryItemFilter, setInventoryItemFilter] = useState('ALL');
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('ALL');
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [staffRoleFilter, setStaffRoleFilter] = useState('ALL');
  const [taxTypeFilter, setTaxTypeFilter] = useState('ALL');
  const [taxSubTab, setTaxSubTab] = useState('tax-summary'); // 'tax-summary' | 'payment-settlement'
  const [inventorySubTab, setInventorySubTab] = useState('position'); // 'position' | 'movement' | 'low-stock'

  // Pagination State (0-based page, default limit 10)
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // View Order Modal State
  const [viewOrder, setViewOrder] = useState(null);

  // API States
  const [salesApiData, setSalesApiData] = useState(null);
  const [loadingSalesReport, setLoadingSalesReport] = useState(false);

  const [dishApiData, setDishApiData] = useState(null);
  const [loadingDishReport, setLoadingDishReport] = useState(false);

  const [orderAnalyticsApiData, setOrderAnalyticsApiData] = useState(null);
  const [loadingOrderAnalyticsReport, setLoadingOrderAnalyticsReport] = useState(false);

  const [inventoryApiData, setInventoryApiData] = useState(null);
  const [loadingInventoryReport, setLoadingInventoryReport] = useState(false);

  const [staffApiData, setStaffApiData] = useState(null);
  const [loadingStaffReport, setLoadingStaffReport] = useState(false);

  const [taxApiData, setTaxApiData] = useState(null);
  const [loadingTaxReport, setLoadingTaxReport] = useState(false);

  // Fetch Report Data from APIs when Tab or Filters change
  useEffect(() => {
    let isSubscribed = true;
    const isFilteredBranch = isBranchFilterActive(branchFilter);
    const commonFilters = {
      branchId: isFilteredBranch ? branchFilter : undefined,
      startDate: dateStart,
      endDate: dateEnd,
      search: searchQuery,
      page: currentPage,
      limit: pageSize
    };

    if (activeTab === 'sales') {
      setLoadingSalesReport(true);
      ReportsApi.getSalesReport({ ...commonFilters, paymentMethod: paymentFilter, orderType: orderTypeFilter })
        .then(res => {
          if (isSubscribed) setSalesApiData(res?.status ? res.response : null);
        })
        .catch(() => { if (isSubscribed) setSalesApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingSalesReport(false); });
    } else if (activeTab === 'items') {
      setLoadingDishReport(true);
      ReportsApi.getDishPerformanceReport({
        ...commonFilters,
        category: categoryFilter,
        dish: dishFilter,
        foodType: foodTypeFilter,
        orderType: orderTypeFilter
      })
        .then(res => {
          if (isSubscribed) {
            if (res?.status && res?.response?.success !== false) {
              setDishApiData(res.response);
            } else {
              setDishApiData(null);
            }
          }
        })
        .catch(() => { if (isSubscribed) setDishApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingDishReport(false); });
    } else if (activeTab === 'orders') {
      setLoadingOrderAnalyticsReport(true);
      ReportsApi.getOrderAnalyticsReport({ ...commonFilters, orderType: orderTypeFilter, orderStatus: orderStatusFilter })
        .then(res => {
          if (isSubscribed) {
            if (res?.status && res?.response?.success !== false) {
              setOrderAnalyticsApiData(res.response);
            } else {
              setOrderAnalyticsApiData(null);
            }
          }
        })
        .catch(() => { if (isSubscribed) setOrderAnalyticsApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingOrderAnalyticsReport(false); });
    } else if (activeTab === 'inventory') {
      setLoadingInventoryReport(true);
      ReportsApi.getInventoryStockReport({
        ...commonFilters,
        category: categoryFilter,
        item: inventoryItemFilter,
        stockStatus: stockStatusFilter
      })
        .then(res => {
          if (isSubscribed) {
            if (res?.status && res?.response?.success !== false) {
              setInventoryApiData(res.response);
            } else {
              setInventoryApiData(null);
            }
          }
        })
        .catch(() => { if (isSubscribed) setInventoryApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingInventoryReport(false); });
    } else if (activeTab === 'staff') {
      setLoadingStaffReport(true);
      ReportsApi.getStaffPerformanceReport({
        ...commonFilters,
        staff: staffFilter,
        role: staffRoleFilter
      })
        .then(res => {
          if (isSubscribed) {
            if (res?.status && res?.response?.success !== false) {
              setStaffApiData(res.response);
            } else {
              setStaffApiData(null);
            }
          }
        })
        .catch(() => { if (isSubscribed) setStaffApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingStaffReport(false); });
    } else if (activeTab === 'tax') {
      setLoadingTaxReport(true);
      ReportsApi.getTaxSettlementReport({
        ...commonFilters,
        paymentMethod: paymentFilter,
        taxType: taxTypeFilter
      })
        .then(res => {
          if (isSubscribed) {
            if (res?.status && res?.response?.success !== false) {
              setTaxApiData(res.response);
            } else {
              setTaxApiData(null);
            }
          }
        })
        .catch(() => { if (isSubscribed) setTaxApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingTaxReport(false); });
    }

    return () => {
      isSubscribed = false;
    };
  }, [
    activeTab,
    inventorySubTab,
    taxSubTab,
    branchFilter,
    dateStart,
    dateEnd,
    paymentFilter,
    orderTypeFilter,
    orderStatusFilter,
    categoryFilter,
    dishFilter,
    foodTypeFilter,
    stockStatusFilter,
    inventoryItemFilter,
    transactionTypeFilter,
    staffFilter,
    staffRoleFilter,
    taxTypeFilter,
    searchQuery,
    currentPage,
    pageSize
  ]);



  // Reset pagination when active tab or filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [
    activeTab,
    inventorySubTab,
    taxSubTab,
    branchFilter,
    datePreset,
    dateStart,
    dateEnd,
    searchQuery,
    paymentFilter,
    orderTypeFilter,
    orderStatusFilter,
    categoryFilter,
    dishFilter,
    foodTypeFilter,
    stockStatusFilter,
    inventoryItemFilter,
    transactionTypeFilter,
    staffFilter,
    staffRoleFilter,
    taxTypeFilter
  ]);

  // Date Preset handler
  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setDateStart(todayStr);
      setDateEnd(todayStr);
    } else if (preset === 'yesterday') {
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const yestStr = yest.toISOString().split('T')[0];
      setDateStart(yestStr);
      setDateEnd(yestStr);
    } else if (preset === '7days') {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      setDateStart(start.toISOString().split('T')[0]);
      setDateEnd(todayStr);
    } else if (preset === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateStart(start.toISOString().split('T')[0]);
      setDateEnd(todayStr);
    } else if (preset === 'all') {
      setDateStart('');
      setDateEnd('');
    }
  };

  const handleClearFilters = () => {
    setBranchFilter(isBranchLogin ? userBranchId : 'ALL');
    setDatePreset('all');
    setDateStart('');
    setDateEnd('');
    setSearchQuery('');
    setPaymentFilter('ALL');
    setOrderTypeFilter('ALL');
    setOrderStatusFilter('ALL');
    setCategoryFilter('ALL');
    setDishFilter('ALL');
    setStockStatusFilter('ALL');
    setInventoryItemFilter('ALL');
    setTransactionTypeFilter('ALL');
    setStaffFilter('ALL');
    setStaffRoleFilter('ALL');
    setTaxTypeFilter('ALL');
  };

  // Raw data sources from props or activeRestaurant
  const rawOrders = useMemo(() => propOrders || activeRestaurant?.orders || [], [propOrders, activeRestaurant?.orders]);
  const rawMenu = useMemo(() => propMenu || activeRestaurant?.menu || [], [propMenu, activeRestaurant?.menu]);
  const rawInventory = useMemo(() => propInventory || activeRestaurant?.inventory || [], [propInventory, activeRestaurant?.inventory]);
  const rawStaff = useMemo(() => propStaff || activeRestaurant?.staff || activeRestaurant?.users || [], [propStaff, activeRestaurant?.staff, activeRestaurant?.users]);

  // Base Branch Filtered Orders
  const branchOrders = useMemo(() => {
    if (!branchFilter || branchFilter === 'ALL' || branchFilter === 'All' || String(branchFilter).toUpperCase() === 'COMPANY') {
      return rawOrders; // Company view: everyone's history!
    }
    return rawOrders.filter(ord => isBranchMatch(ord, branchFilter, allBranchesList));
  }, [rawOrders, branchFilter, allBranchesList]);

  // Base Branch Filtered Staff
  const branchStaff = useMemo(() => {
    if (!branchFilter || branchFilter === 'ALL' || branchFilter === 'All' || String(branchFilter).toUpperCase() === 'COMPANY') {
      return rawStaff; // Company view: all staff
    }
    return rawStaff.filter(s => isBranchMatch(s, branchFilter, allBranchesList));
  }, [rawStaff, branchFilter, allBranchesList]);

  // Base Filtered Orders by Date & Search
  const filteredOrders = useMemo(() => {
    return branchOrders.filter(ord => {
      const isoDate = extractOrderISODate(ord) || ord.date || '';
      if (dateStart && isoDate && isoDate < dateStart) return false;
      if (dateEnd && isoDate && isoDate > dateEnd) return false;

      // Payment Filter
      if (paymentFilter !== 'ALL') {
        const mode = (ord.paymentMode || ord.paymentMethod || (ord.billingStatus === 'paid' ? 'UPI' : 'Pending')).toLowerCase();
        if (!mode.includes(paymentFilter.toLowerCase())) return false;
      }

      // Order Type Filter
      if (orderTypeFilter !== 'ALL') {
        const type = (ord.orderType || ord.type || ord.source || 'Dine-In').toLowerCase();
        if (!type.includes(orderTypeFilter.toLowerCase())) return false;
      }

      // Order Status Filter
      if (orderStatusFilter !== 'ALL') {
        const st = (ord.status || 'new').toLowerCase();
        if (st !== orderStatusFilter.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const formattedNo = getFormattedOrderNo(ord).toLowerCase();
        const orderNo = String(ord.id || ord.orderNo || ord.orderId || ord._id || '').toLowerCase();
        const billNo = String(ord.billNo || ord.billNumber || ord.bill_no || '').toLowerCase();
        const invoiceNo = String(ord.invoiceNo || ord.invoiceNumber || ord.invoiceId || ord.invoice_no || '').toLowerCase();
        const customer = String(ord.customerName || ord.customer || '').toLowerCase();
        const table = String(ord.table || ord.tableNo || '').toLowerCase();
        const waiter = String(ord.waiter || ord.staff || '').toLowerCase();
        if (!formattedNo.includes(q) && !orderNo.includes(q) && !billNo.includes(q) && !invoiceNo.includes(q) && !customer.includes(q) && !table.includes(q) && !waiter.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [branchOrders, dateStart, dateEnd, paymentFilter, orderTypeFilter, orderStatusFilter, searchQuery]);

  // Valid non-cancelled orders for Sales calculations
  const validCompletedOrders = useMemo(() => {
    return filteredOrders.filter(o => String(o.status || '').toLowerCase() !== 'cancelled');
  }, [filteredOrders]);

  // --------------------------------------------------------------------------
  // TAB 1: SALES & REVENUE REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const salesMetrics = useMemo(() => {
    let grossRevenue = 0;
    let totalDiscount = 0;
    let taxCollected = 0;

    validCompletedOrders.forEach(ord => {
      const gross = Number(ord.totalAmount || ord.grossAmount || 0) || (ord.items || []).reduce((s, i) => s + (Number(i.price || 0) * Number(i.quantity || i.qty || 1)), 0);
      const disc = Number(ord.discount || ord.discountAmount || 0);
      const tax = Number(ord.tax || ord.taxAmount || ord.gst || 0);

      grossRevenue += gross;
      totalDiscount += disc;
      taxCollected += tax;
    });

    const netSales = grossRevenue - totalDiscount;
    const count = validCompletedOrders.length;
    const aov = count > 0 ? Math.round(netSales / count) : 0;

    return { grossRevenue, netSales, totalDiscount, taxCollected, aov, count };
  }, [validCompletedOrders]);

  // --------------------------------------------------------------------------
  // TAB 2: ITEM / DISH PERFORMANCE REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const availableDishes = useMemo(() => {
    const set = new Set();
    validCompletedOrders.forEach(ord => {
      (ord.items || []).forEach(item => {
        const name = toDisplayText(item.name || item.dishName || item.title || item.itemName, '').trim();
        if (name) set.add(name);
      });
    });
    rawMenu.forEach(m => {
      const name = toDisplayText(m.name || m.dishName || m.itemName, '').trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [validCompletedOrders, rawMenu]);

  const dishReportData = useMemo(() => {
    const map = {};

    // Menu lookup for accurate category and foodType
    const menuLookup = new Map();
    rawMenu.forEach(m => {
      const mName = (m.name || m.dishName || m.itemName || '').toLowerCase().trim();
      if (mName) menuLookup.set(mName, m);
    });

    validCompletedOrders.forEach(ord => {
      const items = ord.items || [];
      const ordGross = Number(ord.subtotal ?? ord.totalAmount ?? ord.grossAmount ?? 0) || items.reduce((s, it) => s + (Number(it.price || it.rate || 0) * Number(it.quantity || it.qty || 1)), 0);
      const ordDiscount = Number(ord.discount || ord.discountAmount || 0);

      items.forEach(item => {
        const name = toDisplayText(item.name || item.dishName || item.title || item.itemName, 'Unknown Item');
        const menuItem = menuLookup.get(name.toLowerCase().trim());

        const cat = toDisplayText(item.category || item.categoryName || menuItem?.category || menuItem?.categoryName, 'General');
        const fType = item.foodType || menuItem?.foodType || resolveFoodType(item) || resolveFoodType(menuItem) || 'Veg';
        const qty = Number(item.quantitySold ?? item.quantity ?? item.qty ?? 1);
        const price = Number(item.price || item.rate || menuItem?.price || 0);
        const gross = Number(item.grossSales ?? (price * qty));
        let disc = Number(item.discount || item.discountAmount || 0);
        if (!disc && ordDiscount > 0 && ordGross > 0) {
          disc = Math.round((gross / ordGross) * ordDiscount * 100) / 100;
        }
        const net = Number(item.netSales ?? (gross - disc));

        if (!map[name]) {
          map[name] = {
            name,
            dishName: name,
            category: cat,
            foodType: fType,
            quantitySold: 0,
            qtySold: 0,
            grossSales: 0,
            discount: 0,
            netSales: 0
          };
        } else {
          if (map[name].foodType === 'Veg' && fType !== 'Veg') {
            map[name].foodType = fType;
          }
          if (map[name].category === 'General' && cat !== 'General') {
            map[name].category = cat;
          }
        }
        map[name].quantitySold += qty;
        map[name].qtySold += qty;
        map[name].grossSales += gross;
        map[name].discount += disc;
        map[name].netSales += net;
      });
    });

    let list = Object.values(map);

    if (categoryFilter !== 'ALL') {
      list = list.filter(d => d.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (dishFilter !== 'ALL') {
      list = list.filter(d =>
        d.name.toLowerCase() === dishFilter.toLowerCase() ||
        d.name.toLowerCase().includes(dishFilter.toLowerCase())
      );
    }

    if (foodTypeFilter !== 'ALL') {
      list = list.filter(d => (d.foodType || '').toLowerCase() === foodTypeFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
      );
    }

    const totalDishGross = list.reduce((sum, d) => sum + d.grossSales, 0);
    const totalDishDiscount = list.reduce((sum, d) => sum + d.discount, 0);
    const totalDishSales = list.reduce((sum, d) => sum + d.netSales, 0);
    const totalItemsSold = list.reduce((sum, d) => sum + d.quantitySold, 0);
    
    // Sort by quantity sold descending for Top Selling Dish (highest quantity sold)
    const listSortedByQty = [...list].sort((a, b) => b.quantitySold - a.quantitySold);
    const topSellingDish = listSortedByQty.length > 0 && listSortedByQty[0].quantitySold > 0
      ? listSortedByQty[0].name
      : (list.length > 0 ? list[0].name : 'N/A');

    // Count of distinct dishes sold
    const distinctDishesCount = list.filter(d => d.quantitySold > 0).length;

    // Sort by net sales descending
    list.sort((a, b) => b.netSales - a.netSales);

    return {
      list: list.map(d => ({
        ...d,
        salesPercent: totalDishSales > 0 ? ((d.netSales / totalDishSales) * 100).toFixed(1) : '0.0'
      })),
      totalItemsSold,
      totalDishGross,
      totalDishDiscount,
      totalDishSales,
      topSelling: topSellingDish,
      topSellingDish,
      distinctDishesCount,
      dishesCount: distinctDishesCount
    };
  }, [validCompletedOrders, rawMenu, categoryFilter, dishFilter, foodTypeFilter, searchQuery]);

  // --------------------------------------------------------------------------
  // TAB 3: ORDER ANALYTICS REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const orderAnalyticsMetrics = useMemo(() => {
    const total = filteredOrders.length;
    const completed = filteredOrders.filter(o => (o.status || '').toLowerCase() === 'completed' || (o.billingStatus || '').toLowerCase() === 'paid').length;
    const pending = filteredOrders.filter(o => ['new', 'preparing', 'ready'].includes((o.status || '').toLowerCase())).length;
    const cancelled = filteredOrders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length;
    const dineIn = filteredOrders.filter(o => (o.orderType || o.type || 'Dine-In').toLowerCase().includes('dine')).length;
    const takeaway = filteredOrders.filter(o => {
      const t = (o.orderType || o.type || '').toLowerCase();
      return t.includes('takeaway') || t.includes('take');
    }).length;
    const delivery = filteredOrders.filter(o => {
      const t = (o.orderType || o.type || '').toLowerCase();
      return t.includes('delivery') || t.includes('deliv');
    }).length;
    const takeawayDelivery = takeaway + delivery;

    return { total, completed, pending, cancelled, dineIn, takeaway, delivery, takeawayDelivery };
  }, [filteredOrders]);

  const orderAnalyticsCounts = useMemo(() => {
    let takeaway = orderAnalyticsApiData?.summary?.takeawayOrders ?? orderAnalyticsApiData?.summary?.takeaway;
    let delivery = orderAnalyticsApiData?.summary?.deliveryOrders ?? orderAnalyticsApiData?.summary?.delivery;

    if (Array.isArray(orderAnalyticsApiData?.data) && orderAnalyticsApiData.data.length > 0) {
      if (takeaway === undefined) {
        takeaway = orderAnalyticsApiData.data.filter(o => {
          const t = String(o.orderType || o.type || o.source || '').toLowerCase();
          return t.includes('take');
        }).length;
      }
      if (delivery === undefined) {
        delivery = orderAnalyticsApiData.data.filter(o => {
          const t = String(o.orderType || o.type || o.source || '').toLowerCase();
          return t.includes('deliv');
        }).length;
      }
    }

    if (takeaway === undefined) takeaway = orderAnalyticsMetrics.takeaway ?? 0;
    if (delivery === undefined) delivery = orderAnalyticsMetrics.delivery ?? 0;

    return { takeaway, delivery };
  }, [orderAnalyticsApiData, orderAnalyticsMetrics]);

  // --------------------------------------------------------------------------
  // TAB 4: INVENTORY & STOCK REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const effectiveInventory = useMemo(() => {
    if (rawInventory && rawInventory.length > 0) return rawInventory;
    return [];
  }, [rawInventory]);

  const availableInventoryItems = useMemo(() => {
    const set = new Set();
    effectiveInventory.forEach(item => {
      const name = toDisplayText(item.name || item.itemName, '').trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [effectiveInventory]);

  const availableInventoryCategories = useMemo(() => {
    const set = new Set();
    effectiveInventory.forEach(item => {
      const cat = toDisplayText(item.category || item.categoryName, '').trim();
      if (cat) set.add(cat);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [effectiveInventory]);

  const inventoryReportData = useMemo(() => {
    let list = effectiveInventory.map(item => {
      const name = item.name || item.itemName || 'Inventory Item';
      const unit = item.unit || 'pcs';
      const current = Number(item.quantity ?? item.stock ?? item.closingStock ?? 0);
      const min = Number(item.minStock ?? item.minimumStock ?? 10);
      const opening = Number(item.openingStock ?? (current + 5));
      const purchased = Number(item.purchased ?? item.added ?? 10);
      const used = Number(item.used ?? item.consumed ?? 5);
      const wastage = Number(item.wastage ?? 0);
      const unitCost = Number(item.cost || item.price || item.unitCost || 50);

      let status = 'In Stock';
      if (current <= 0) status = 'Out of Stock';
      else if (current <= min) status = 'Low Stock';

      return {
        id: item.id || item._id,
        name,
        category: item.category || 'General',
        unit,
        openingStock: opening,
        purchased,
        used,
        wastage,
        closingStock: current,
        minStock: min,
        unitCost,
        stockValue: current * unitCost,
        status
      };
    });

    if (categoryFilter !== 'ALL') {
      list = list.filter(i => i.category.toLowerCase() === categoryFilter.toLowerCase());
    }

    if (inventoryItemFilter !== 'ALL') {
      list = list.filter(i =>
        i.name.toLowerCase() === inventoryItemFilter.toLowerCase() ||
        i.name.toLowerCase().includes(inventoryItemFilter.toLowerCase())
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    }

    if (stockStatusFilter !== 'ALL') {
      if (stockStatusFilter.toLowerCase() === 'in stock') {
        list = list.filter(i => i.status !== 'Out of Stock');
      } else {
        list = list.filter(i => i.status.toLowerCase() === stockStatusFilter.toLowerCase());
      }
    }

    if (transactionTypeFilter !== 'ALL') {
      const tt = transactionTypeFilter.toLowerCase();
      if (tt === 'purchase' || tt === 'direct purchase') {
        list = list.filter(i => i.purchased > 0);
      } else if (tt === 'distribution' || tt === 'consumption') {
        list = list.filter(i => i.used > 0);
      } else if (tt === 'wastage') {
        list = list.filter(i => i.wastage > 0);
      } else if (tt === 'adjustment' || tt === 'branch transfer') {
        list = list.filter(i => i.purchased > 0 || i.used > 0 || i.wastage > 0);
      }
    }

    const totalItems = list.length;
    const lowStockCount = list.filter(i => i.status === 'Low Stock').length;
    const outOfStockCount = list.filter(i => i.status === 'Out of Stock').length;
    const totalStockValue = list.reduce((sum, i) => sum + i.stockValue, 0);

    const lowStockList = list.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');

    return { list, totalItems, lowStockCount, outOfStockCount, totalStockValue, lowStockList };
  }, [effectiveInventory, categoryFilter, inventoryItemFilter, transactionTypeFilter, searchQuery, stockStatusFilter]);

  // --------------------------------------------------------------------------
  // STOCK MOVEMENT REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const stockMovementData = useMemo(() => {
    let movements = [];

    const existingTxns = activeRestaurant?.inventoryTransactions || 
                         activeRestaurant?.stockMovements || 
                         activeRestaurant?.transactions || 
                         [];

    if (Array.isArray(existingTxns) && existingTxns.length > 0) {
      movements = existingTxns.map((t, idx) => ({
        id: t.id || t._id || `mov-${idx}`,
        date: t.date || t.createdAt || new Date().toISOString(),
        txnNo: t.txnNo || t.transactionNo || `TRX-${2024000 + idx + 1}`,
        type: t.type || t.transactionType || 'Purchase',
        item: t.item || t.itemName || 'Inventory Item',
        quantity: Number(t.quantity || t.qty || 1),
        unit: t.unit || 'pcs',
        source: t.source || 'Supplier',
        destination: t.destination || 'Central Stock',
        refNo: t.refNo || t.referenceNo || `REF-${1000 + idx}`,
        status: t.status || 'Completed'
      }));
    } else {
      movements = [];
    }

    let list = [...movements];

    // Branch filter: if a specific branch is selected, only show stock movements for this branch
    if (branchFilter && branchFilter !== 'ALL' && branchFilter !== 'All' && String(branchFilter).toUpperCase() !== 'COMPANY') {
      list = list.filter(m => isBranchMatch(m, branchFilter, allBranchesList));
    }

    if (inventoryItemFilter !== 'ALL') {
      list = list.filter(m =>
        m.item.toLowerCase() === inventoryItemFilter.toLowerCase() ||
        m.item.toLowerCase().includes(inventoryItemFilter.toLowerCase())
      );
    }

    if (transactionTypeFilter !== 'ALL') {
      list = list.filter(m => m.type.toLowerCase() === transactionTypeFilter.toLowerCase());
    }

    if (dateStart) {
      list = list.filter(m => {
        const d = m.date ? m.date.split(' ')[0] : '';
        return !d || d >= dateStart;
      });
    }

    if (dateEnd) {
      list = list.filter(m => {
        const d = m.date ? m.date.split(' ')[0] : '';
        return !d || d <= dateEnd;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(m =>
        (m.item && m.item.toLowerCase().includes(q)) ||
        (m.txnNo && m.txnNo.toLowerCase().includes(q)) ||
        (m.type && m.type.toLowerCase().includes(q)) ||
        (m.refNo && m.refNo.toLowerCase().includes(q)) ||
        (m.source && m.source.toLowerCase().includes(q)) ||
        (m.destination && m.destination.toLowerCase().includes(q)) ||
        (m.status && m.status.toLowerCase().includes(q))
      );
    }

    const totalInward = list.filter(m => m.type === 'Purchase' || m.type === 'Direct Purchase' || (m.type === 'Adjustment' && m.quantity > 0)).reduce((s, m) => s + Number(m.quantity || 0), 0);
    const totalOutward = list.filter(m => m.type === 'Consumption' || m.type === 'Distribution' || m.type === 'Branch Transfer').reduce((s, m) => s + Number(m.quantity || 0), 0);
    const totalWastage = list.filter(m => m.type === 'Wastage').reduce((s, m) => s + Number(m.quantity || 0), 0);

    return {
      list,
      totalInward,
      totalOutward,
      totalWastage
    };
  }, [effectiveInventory, activeRestaurant, inventoryItemFilter, transactionTypeFilter, dateStart, dateEnd, searchQuery]);

  // --------------------------------------------------------------------------
  // TAB 5: STAFF PERFORMANCE REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const availableStaffMembers = useMemo(() => {
    const list = [];
    const seen = new Set();
    branchStaff.forEach((s, idx) => {
      const name = toDisplayText(s.name || s.staffName || s.waiterName || '', '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        list.push({
          id: s._id || s.id || `staff-${idx}`,
          staffId: getFormattedStaffId(s, idx),
          name: name,
          role: s.role || s.userType || 'Staff'
        });
      }
    });
    branchOrders.forEach(ord => {
      const staffName = toDisplayText(ord.waiter || ord.staff || ord.server || '', '').trim();
      if (staffName && staffName !== 'Unassigned' && !seen.has(staffName.toLowerCase())) {
        seen.add(staffName.toLowerCase());
        list.push({
          id: `order-staff-${list.length}`,
          staffId: `EMP-${String(list.length + 1).padStart(3, '0')}`,
          name: staffName,
          role: 'Staff'
        });
      }
    });
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [branchStaff, branchOrders]);

  const availableOtherStaffRoles = useMemo(() => {
    const standardRoles = ['waiter', 'kitchen staff', 'kitchen', 'cashier', 'manager'];
    const set = new Set();
    branchStaff.forEach(s => {
      const r = toDisplayText(s.role || s.userType, '').trim();
      if (r && !standardRoles.includes(r.toLowerCase())) {
        set.add(r);
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [branchStaff]);

  const staffReportData = useMemo(() => {
    const map = {};

    branchStaff.forEach((s, idx) => {
      const name = toDisplayText(s.name || s.staffName || 'Staff Member', 'Staff Member').trim();
      const role = s.role || s.userType || 'Waiter';
      const staffId = getFormattedStaffId(s, idx);
      map[name.toLowerCase()] = {
        id: s._id || s.id || `staff-${idx}`,
        staffId,
        name,
        role,
        ordersHandled: 0,
        kotsHandled: 0,
        billsGenerated: 0,
        paymentsCollected: 0,
        salesAmount: 0,
        cancelledOrders: 0
      };
    });

    filteredOrders.forEach(ord => {
      const staffName = toDisplayText(ord.waiter || ord.staff || ord.server || 'Unassigned', 'Unassigned').trim();
      const key = staffName.toLowerCase();
      if (!map[key]) {
        const fallbackIdx = Object.keys(map).length;
        map[key] = {
          id: `staff-${fallbackIdx}`,
          staffId: staffName === 'Unassigned' ? 'EMP-000' : `EMP-${String(fallbackIdx + 1).padStart(3, '0')}`,
          name: staffName,
          role: staffName === 'Unassigned' ? 'Unassigned' : 'Staff',
          ordersHandled: 0,
          kotsHandled: 0,
          billsGenerated: 0,
          paymentsCollected: 0,
          salesAmount: 0,
          cancelledOrders: 0
        };
      }

      map[key].ordersHandled += 1;

      // KOTs Handled: count of KOTs attributed to staff
      const kotCount = Number(ord.kotCount || ord.kotsCount || (Array.isArray(ord.kots) ? ord.kots.length : 1));
      map[key].kotsHandled += Math.max(1, kotCount);

      const isCancelled = (ord.status || '').toLowerCase() === 'cancelled';
      if (isCancelled) {
        map[key].cancelledOrders += 1;
      } else {
        // Bills Generated: bills attributed to staff where captured
        const isBilled = Boolean(ord.billNo || ord.billNumber || ord.billId || ord.invoiceNo || (ord.billingStatus || '').toLowerCase() === 'paid' || (ord.status || '').toLowerCase() === 'completed');
        if (isBilled || ord.status !== 'cancelled') {
          map[key].billsGenerated += 1;
        }

        // Payments Collected: payments collected where captured
        const isPaid = (ord.billingStatus || '').toLowerCase() === 'paid' || (ord.paymentStatus || '').toLowerCase() === 'paid' || ord.paid === true;
        if (isPaid) {
          map[key].paymentsCollected += 1;
        }

        // Sales Amount: net sales attributable according to system rule
        const gross = Number(ord.totalAmount || ord.grossAmount || ord.subtotal || 0);
        const disc = Number(ord.discount || 0);
        map[key].salesAmount += Math.max(0, gross - disc);
      }
    });

    let list = Object.values(map);

    if (staffFilter !== 'ALL') {
      list = list.filter(s => s.name.toLowerCase() === staffFilter.toLowerCase());
    }

    if (staffRoleFilter !== 'ALL') {
      const rf = staffRoleFilter.toLowerCase().replace(/\s+/g, '');
      list = list.filter(s => {
        const r = (s.role || '').toLowerCase().replace(/\s+/g, '');
        return r.includes(rf) || rf.includes(r);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.staffId.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q)
      );
    }

    // Sort by sales amount descending, then orders handled
    list.sort((a, b) => b.salesAmount - a.salesAmount || b.ordersHandled - a.ordersHandled);

    const activeStaffCount = list.length;
    const totalOrdersHandled = list.reduce((sum, s) => sum + s.ordersHandled, 0);
    const totalKotsHandled = list.reduce((sum, s) => sum + s.kotsHandled, 0);
    const totalBillsGenerated = list.reduce((sum, s) => sum + s.billsGenerated, 0);
    const totalPaymentsCollected = list.reduce((sum, s) => sum + s.paymentsCollected, 0);
    const totalStaffSales = list.reduce((sum, s) => sum + s.salesAmount, 0);
    const totalCancelledOrders = list.reduce((sum, s) => sum + s.cancelledOrders, 0);

    return {
      list,
      activeStaffCount,
      totalOrdersHandled,
      totalKotsHandled,
      totalBillsGenerated,
      totalPaymentsCollected,
      totalStaffSales,
      totalCancelledOrders
    };
  }, [rawStaff, filteredOrders, staffFilter, staffRoleFilter, searchQuery]);

  // --------------------------------------------------------------------------
  // TAB 6: TAX & PAYMENT SETTLEMENT REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const taxReportData = useMemo(() => {
    let taxableAmount = 0;
    let taxCollected = 0;
    let totalPaymentsCollected = 0;
    let refundAmount = 0;

    const settlementMap = {
      'Cash': { method: 'Cash', count: 0, collected: 0, refund: 0, netCollected: 0 },
      'UPI': { method: 'UPI', count: 0, collected: 0, refund: 0, netCollected: 0 },
      'Card': { method: 'Card', count: 0, collected: 0, refund: 0, netCollected: 0 },
      'Online': { method: 'Online', count: 0, collected: 0, refund: 0, netCollected: 0 },
      'Other': { method: 'Other', count: 0, collected: 0, refund: 0, netCollected: 0 }
    };

    filteredOrders.forEach(ord => {
      const isCancelled = (ord.status || '').toLowerCase() === 'cancelled';
      const gross = Number(ord.totalAmount || ord.grossAmount || ord.subtotal || 0);
      const disc = Number(ord.discount || 0);
      const amt = Math.max(0, gross - disc);
      const tax = Number(ord.tax || ord.taxAmount || ord.gst || 0);
      const totalOrderAmt = amt + tax;

      const rawMode = String(ord.paymentMode || ord.paymentMethod || 'UPI').trim();
      const modeLower = rawMode.toLowerCase();

      let key = 'Other';
      if (modeLower.includes('cash')) key = 'Cash';
      else if (modeLower.includes('upi') || modeLower.includes('gpay') || modeLower.includes('phonepe') || modeLower.includes('paytm')) key = 'UPI';
      else if (modeLower.includes('card') || modeLower.includes('debit') || modeLower.includes('credit')) key = 'Card';
      else if (modeLower.includes('online') || modeLower.includes('net') || modeLower.includes('bank') || modeLower.includes('razor') || modeLower.includes('stripe')) key = 'Online';

      if (!settlementMap[key]) {
        settlementMap[key] = { method: key, count: 0, collected: 0, refund: 0, netCollected: 0 };
      }

      if (isCancelled) {
        refundAmount += totalOrderAmt;
        settlementMap[key].count += 1;
        settlementMap[key].refund += totalOrderAmt;
      } else {
        taxableAmount += amt;
        taxCollected += tax;
        totalPaymentsCollected += totalOrderAmt;

        settlementMap[key].count += 1;
        settlementMap[key].collected += totalOrderAmt;
      }
    });

    let taxRows = [
      {
        taxType: 'CGST',
        taxRate: '2.5%',
        taxableAmount: taxableAmount,
        taxAmount: taxCollected > 0 ? (taxCollected / 2) : (taxableAmount * 0.025)
      },
      {
        taxType: 'SGST',
        taxRate: '2.5%',
        taxableAmount: taxableAmount,
        taxAmount: taxCollected > 0 ? (taxCollected / 2) : (taxableAmount * 0.025)
      }
    ];

    if (taxTypeFilter !== 'ALL') {
      taxRows = taxRows.filter(r => r.taxType.toLowerCase() === taxTypeFilter.toLowerCase());
    }

    let settlementList = Object.values(settlementMap).map(s => ({
      ...s,
      netCollected: Math.max(0, s.collected - s.refund)
    }));

    if (paymentFilter !== 'ALL') {
      const pf = paymentFilter.toLowerCase();
      settlementList = settlementList.filter(s => s.method.toLowerCase().includes(pf) || pf.includes(s.method.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      settlementList = settlementList.filter(s => s.method.toLowerCase().includes(q));
      taxRows = taxRows.filter(r => r.taxType.toLowerCase().includes(q) || r.taxRate.toLowerCase().includes(q));
    }

    return {
      taxableAmount,
      taxCollected,
      totalPaymentsCollected,
      refundAmount,
      taxRows,
      settlementList
    };
  }, [filteredOrders, paymentFilter, taxTypeFilter, searchQuery]);

  // Derived Tax and Payment Settlement rows (API data with local calculations fallback)
  const taxSummaryRows = useMemo(() => {
    if (taxApiData) {
      if (Array.isArray(taxApiData.taxSummaryTable) && taxApiData.taxSummaryTable.length > 0) {
        return taxApiData.taxSummaryTable;
      }
      if (Array.isArray(taxApiData.data) && taxApiData.data.length > 0) {
        return taxApiData.data;
      }
    }
    return taxReportData.taxRows;
  }, [taxApiData, taxReportData.taxRows]);

  const paymentSettlementRows = useMemo(() => {
    if (taxApiData && Array.isArray(taxApiData.paymentSettlementTable) && taxApiData.paymentSettlementTable.length > 0) {
      return taxApiData.paymentSettlementTable;
    }
    return taxReportData.settlementList;
  }, [taxApiData, taxReportData.settlementList]);

  // --------------------------------------------------------------------------
  // PAGINATION HELPER FOR CURRENT ACTIVE TAB
  // --------------------------------------------------------------------------
  const currentTabRecords = useMemo(() => {
    if (activeTab === 'sales') {
      if (salesApiData && Array.isArray(salesApiData.data)) return salesApiData.data;
      return filteredOrders;
    }
    if (activeTab === 'items') return (dishApiData && Array.isArray(dishApiData.data)) ? dishApiData.data : dishReportData.list;
    if (activeTab === 'orders') return (orderAnalyticsApiData && Array.isArray(orderAnalyticsApiData.data)) ? orderAnalyticsApiData.data : filteredOrders;
    if (activeTab === 'inventory') {
      if (inventorySubTab === 'movement') return stockMovementData.list;
      if (inventorySubTab === 'low-stock') {
        if (inventoryApiData && Array.isArray(inventoryApiData.data)) {
          return inventoryApiData.data.filter(item => {
            const current = Number(item.closingStock ?? item.quantity ?? item.stock ?? 0);
            const min = Number(item.minStock ?? item.minimumStock ?? 10);
            return current <= min;
          });
        }
        return inventoryReportData.lowStockList;
      }
      if (inventoryApiData && Array.isArray(inventoryApiData.data)) return inventoryApiData.data;
      return inventoryReportData.list;
    }
    if (activeTab === 'staff') return (staffApiData && Array.isArray(staffApiData.data)) ? staffApiData.data : staffReportData.list;
    if (activeTab === 'tax') return taxSubTab === 'tax-summary' ? taxSummaryRows : paymentSettlementRows;
    return [];
  }, [
    activeTab,
    inventorySubTab,
    taxSubTab,
    filteredOrders,
    salesApiData,
    dishApiData,
    orderAnalyticsApiData,
    inventoryApiData,
    staffApiData,
    dishReportData.list,
    inventoryReportData.list,
    inventoryReportData.lowStockList,
    stockMovementData.list,
    staffReportData.list,
    taxSummaryRows,
    paymentSettlementRows
  ]);

  const currentApiData = useMemo(() => {
    if (activeTab === 'sales') return salesApiData;
    if (activeTab === 'items') return dishApiData;
    if (activeTab === 'orders') return orderAnalyticsApiData;
    if (activeTab === 'inventory' && inventorySubTab === 'position') return inventoryApiData;
    if (activeTab === 'staff') return staffApiData;
    if (activeTab === 'tax') return taxApiData;
    return null;
  }, [activeTab, inventorySubTab, salesApiData, dishApiData, orderAnalyticsApiData, inventoryApiData, staffApiData, taxApiData]);

  const totalRecordsCount = useMemo(() => {
    if (activeTab === 'tax') {
      return taxSubTab === 'tax-summary' ? taxSummaryRows.length : paymentSettlementRows.length;
    }
    if (currentApiData) {
      if (typeof currentApiData.totalItems === 'number') return currentApiData.totalItems;
      if (typeof currentApiData.totalRecords === 'number') return currentApiData.totalRecords;
      if (typeof currentApiData.total === 'number') return currentApiData.total;
      if (typeof currentApiData.count === 'number') return currentApiData.count;
      if (typeof currentApiData.pagination?.total === 'number') return currentApiData.pagination.total;
    }
    return currentTabRecords.length;
  }, [activeTab, taxSubTab, taxSummaryRows.length, paymentSettlementRows.length, currentApiData, currentTabRecords.length]);

  const totalPages = useMemo(() => {
    if (activeTab === 'tax') {
      return Math.max(1, Math.ceil(totalRecordsCount / pageSize));
    }
    if (currentApiData && typeof currentApiData.totalPages === 'number') {
      return Math.max(1, currentApiData.totalPages);
    }
    if (currentApiData && typeof currentApiData.pagination?.totalPages === 'number') {
      return Math.max(1, currentApiData.pagination.totalPages);
    }
    return Math.max(1, Math.ceil(totalRecordsCount / pageSize));
  }, [activeTab, currentApiData, totalRecordsCount, pageSize]);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const paginatedRecords = useMemo(() => {
    if (activeTab === 'tax') {
      const records = taxSubTab === 'tax-summary' ? taxSummaryRows : paymentSettlementRows;
      if (records.length > pageSize) {
        const start = currentPage * pageSize;
        return records.slice(start, start + pageSize);
      }
      return records;
    }
    if (currentApiData && Array.isArray(currentApiData.data)) {
      if (currentApiData.data.length > pageSize && currentApiData.totalPages === undefined) {
        const start = currentPage * pageSize;
        return currentApiData.data.slice(start, start + pageSize);
      }
      return currentApiData.data;
    }
    const start = currentPage * pageSize;
    return currentTabRecords.slice(start, start + pageSize);
  }, [activeTab, taxSubTab, taxSummaryRows, paymentSettlementRows, currentApiData, currentTabRecords, currentPage, pageSize]);

  // --------------------------------------------------------------------------
  // EXPORT TO EXCEL (.xlsx)
  // --------------------------------------------------------------------------
  const handleExportExcel = () => {
    let exportData = [];
    let fileName = `Serviq_${activeTab.toUpperCase()}_Report.xlsx`;

    if (activeTab === 'sales') {
      const list = (salesApiData && Array.isArray(salesApiData.data)) ? salesApiData.data : filteredOrders;
      exportData = list.map((ord, idx) => {
        const orderNo = getFormattedOrderNo(ord, idx);
        const billNo = ord.billNo || ord.billNumber || ord.bill_no || (ord.billId ? String(ord.billId) : '') || (orderNo !== '-' ? `BILL-${orderNo.replace('#', '')}` : '-');
        const invoiceNo = ord.invoiceNo || ord.invoiceNumber || ord.invoiceId || ord.invoice_no || ord.gstInvoiceNo || ord.taxInvoiceNo || (ord.invoiceGenerated && orderNo !== '-' ? `INV-${orderNo.replace('#', '')}` : '-');
        const gross = Number(ord.grossRevenue ?? ord.grossAmount ?? ord.subtotal ?? ord.totalAmount ?? 0);
        const disc = Number(ord.totalDiscount ?? ord.discount ?? ord.discountAmount ?? 0);
        const tax = Number(ord.taxCollected ?? ord.tax ?? ord.taxAmount ?? ord.gst ?? 0);
        const total = Number(ord.netSales ?? ord.total ?? ord.netTotal ?? (gross - disc));

        return {
          'S.No': idx + 1,
          'Date & Time': formatDateTimeDMY(ord.createdAt || ord.date || ord.orderDate),
          'Order No': orderNo,
          'Bill No.': billNo,
          'Invoice No.': invoiceNo,
          'Payment Method': ord.paymentMethod || ord.paymentMode || ord.mode || 'N/A',
          'Gross Subtotal (₹)': gross,
          'Discount (₹)': disc,
          'Tax (₹)': tax,
          'Net Total (₹)': total,
          'Status': ord.status || 'Paid'
        };
      });
    } else if (activeTab === 'items') {
      const list = (dishApiData && Array.isArray(dishApiData.data)) ? dishApiData.data : dishReportData.list;
      const totalSalesForPct = Number(
        dishApiData?.summary?.totalNetSales ??
        dishApiData?.summary?.totalDishSales ??
        dishApiData?.summary?.foodRevenueGenerated ??
        dishReportData.totalDishSales ??
        0
      );
      exportData = list.map((item, idx) => {
        const dishName = item.dishName || item.name || item.foodItem || item.itemName || item.title || 'Unknown Item';
        const cat = toDisplayText(item.category || item.categoryName, 'General');
        const foodType = item.foodType || resolveFoodType(item);
        const qty = Number(item.totalQuantitySold ?? item.quantitySold ?? item.qtySold ?? item.quantityPrepared ?? item.quantity ?? item.qty ?? 0);
        const gross = Number(item.grossSales ?? item.totalGrossSales ?? item.revenueGenerated ?? (Number(item.price || item.rate || 0) * qty) ?? 0);
        const disc = Number(item.discount ?? item.discountAmount ?? item.totalDiscount ?? 0);
        const net = Number(item.netSales ?? item.totalNetSales ?? (gross - disc) ?? 0);
        const salesPct = item.salesPercent ?? item.salesPct ?? item.salesPercentage ?? (totalSalesForPct > 0 ? ((net / totalSalesForPct) * 100).toFixed(1) : '0.0');

        return {
          'S.No': idx + 1,
          'Dish Name': dishName,
          'Category': cat,
          'Food Type': foodType,
          'Quantity Sold': qty,
          'Gross Sales': gross,
          'Discount': disc,
          'Net Sales': net,
          'Sales %': `${salesPct}%`
        };
      });
    } else if (activeTab === 'orders') {
      const list = (orderAnalyticsApiData && Array.isArray(orderAnalyticsApiData.data)) ? orderAnalyticsApiData.data : filteredOrders;
      exportData = list.map((ord, idx) => {
        const orderNo = getFormattedOrderNo(ord, idx);
        const rawType = ord.orderType || ord.type || ord.source || 'Dine-In';
        const orderType = String(rawType).toLowerCase().includes('take') ? 'Takeaway'
          : String(rawType).toLowerCase().includes('deliv') ? 'Delivery'
          : 'Dine-In';
        const rawTable = ord.tableNumber || ord.tableNo || ord.table || (typeof ord.table === 'object' ? ord.table?.name || ord.table?.tableNumber || ord.table?.tableNo : '');
        const tableDisplay = rawTable ? (String(rawTable).toLowerCase().startsWith('table') ? String(rawTable) : !isNaN(rawTable) ? `Table ${rawTable}` : String(rawTable)) : (orderType === 'Dine-In' ? 'N/A' : '-');
        const itemsCount = (ord.items || []).length;
        const total = Number(ord.total ?? ord.totalAmount ?? ord.grossAmount ?? 0);
        const billingStatus = ord.billingStatus || ord.paymentStatus || 'Paid';
        const status = ord.status || 'Completed';
        const staffName = ord.waiter || ord.staff || ord.staffName || ord.serverName || ord.paymentMethod || 'N/A';

        return {
          'S.No': idx + 1,
          'Order No.': orderNo,
          'Date & Time': formatDateTimeDMY(ord.createdAt || ord.date),
          'Order Type': orderType,
          'Table': tableDisplay,
          'Items Count': itemsCount,
          'Amount (₹)': total,
          'Payment Status': billingStatus,
          'Order Status': status,
          'Staff Responsible': staffName
        };
      });
    } else if (activeTab === 'inventory') {
      const wb = XLSX.utils.book_new();

      const itemsList = (inventoryApiData && Array.isArray(inventoryApiData.data)) ? inventoryApiData.data : inventoryReportData.list;
      const posData = itemsList.map((item, idx) => {
        const current = Number(item.closingStock ?? item.quantity ?? item.stock ?? 0);
        const min = Number(item.minStock ?? item.minimumStock ?? 10);
        const opening = Number(item.openingStock ?? (current + 5));
        const purchased = Number(item.purchased ?? item.purchasedAdded ?? item.added ?? 0);
        const used = Number(item.used ?? item.usedConsumed ?? item.consumed ?? 0);
        const wastage = Number(item.wastage ?? 0);
        const status = item.status || (current <= 0 ? 'Out of Stock' : (current <= min ? 'Low Stock' : 'In Stock'));

        return {
          'S.No': idx + 1,
          'Item Name': item.name || item.itemName,
          'Category': toDisplayText(item.category || item.categoryName, 'General'),
          'Unit': item.unit || 'pcs',
          'Opening Stock': opening,
          'Purchased / Added': purchased,
          'Used / Consumed': used,
          'Wastage': wastage,
          'Closing / Current Stock': current,
          'Minimum Stock': min,
          'Status': status
        };
      });

      const movData = stockMovementData.list.map((t, idx) => ({
        'S.No': idx + 1,
        'Date': formatDateTimeDMY(t.date),
        'Transaction No.': t.txnNo,
        'Transaction Type': t.type,
        'Item': t.item,
        'Quantity': t.quantity,
        'Unit': t.unit,
        'Source': t.source,
        'Destination': t.destination,
        'Reference No.': t.refNo,
        'Status': t.status
      }));

      const lowData = inventoryReportData.lowStockList.map((item, idx) => ({
        'S.No': idx + 1,
        'Item': item.name,
        'Current Stock': item.closingStock,
        'Minimum Stock': item.minStock,
        'Unit': item.unit,
        'Status': item.status
      }));

      const wsPos = XLSX.utils.json_to_sheet(posData);
      const wsMov = XLSX.utils.json_to_sheet(movData);
      const wsLow = XLSX.utils.json_to_sheet(lowData);

      XLSX.utils.book_append_sheet(wb, wsPos, "Stock Position");
      XLSX.utils.book_append_sheet(wb, wsMov, "Stock Movement");
      XLSX.utils.book_append_sheet(wb, wsLow, "Low Stock List");

      XLSX.writeFile(wb, fileName);
      ShowNotifications.showAlertNotification("Excel report downloaded successfully.", true);
      return;
    } else if (activeTab === 'staff') {
      const list = (staffApiData && staffApiData.data) ? staffApiData.data : staffReportData.list;
      exportData = list.map((s, idx) => ({
        'S.No': idx + 1,
        'Staff ID': s.staffId || s.employeeCode || s.staffCode || getFormattedStaffId(s, idx),
        'Staff Name': s.waiterName || s.name || s.staffName || 'Staff Member',
        'Role': s.role || 'Staff',
        'Orders Handled': s.ordersHandled ?? s.ordersServed ?? 0,
        'KOTs Handled': s.kotsHandled ?? s.kotCount ?? s.ordersHandled ?? s.ordersServed ?? 0,
        'Bills Generated': s.billsGenerated ?? s.ordersServed ?? 0,
        'Payments Collected': s.paymentsCollected ?? (Number(s.billsGenerated ?? s.ordersServed ?? 0) - Number(s.cancelledOrders ?? 0)),
        'Sales Amount (₹)': Number(s.salesAmount ?? s.revenue ?? 0),
        'Cancelled Orders': s.cancelledOrders ?? 0
      }));
    } else if (activeTab === 'tax') {
      const wb = XLSX.utils.book_new();
      const taxSheetData = taxSummaryRows.map(r => ({
        'Tax Type': r.taxType,
        'Tax Rate': r.taxRate,
        'Taxable Amount (₹)': Number(r.taxableAmount || 0),
        'Tax Amount (₹)': Number(r.taxAmount || 0)
      }));
      const settlementSheetData = paymentSettlementRows.map((s, idx) => ({
        'S.No': s.sNo || (idx + 1),
        'Payment Method': s.paymentMethod || s.method,
        'Transaction Count': Number(s.transactionCount ?? s.count ?? 0),
        'Taxable Amount (₹)': Number(s.taxableAmount ?? (s.collected ? s.collected - (s.refund || 0) : 0)),
        'Tax Amount (₹)': Number(s.taxAmount ?? 0),
        'Total Amount (₹)': Number(s.totalAmount ?? s.netCollected ?? s.collected ?? 0)
      }));

      const wsTax = XLSX.utils.json_to_sheet(taxSheetData);
      const wsSettlement = XLSX.utils.json_to_sheet(settlementSheetData);
      XLSX.utils.book_append_sheet(wb, wsTax, "Tax Summary");
      XLSX.utils.book_append_sheet(wb, wsSettlement, "Payment Settlement");
      XLSX.writeFile(wb, fileName);
      ShowNotifications.showAlertNotification("Excel report downloaded successfully.", true);
      return;
    }

    if (exportData.length === 0) {
      ShowNotifications.showAlertNotification("No records available to export.", false);
      return;
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report Data");
    XLSX.writeFile(wb, fileName);
    ShowNotifications.showAlertNotification("Excel report downloaded successfully.", true);
  };

  // --------------------------------------------------------------------------
  // EXPORT TO PDF (PRINT VIEW)
  // --------------------------------------------------------------------------
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="reports-container">
      {/* PAGE HEADER & ACTION BUTTONS */}
      <div className="reports-header-row">
        <div className="reports-title-group">
          <h2>
            {activeTab === 'sales' && 'Sales & Revenue Report'}
            {activeTab === 'items' && 'Dish Performance Report'}
            {activeTab === 'orders' && 'Order Analytics Report'}
            {activeTab === 'inventory' && (
              inventorySubTab === 'movement'
                ? 'Stock Movement Report'
                : inventorySubTab === 'low-stock'
                ? 'Low Stock Report'
                : 'Stock Position Report'
            )}
            {activeTab === 'staff' && 'Staff Performance Report'}
            {activeTab === 'tax' && (taxSubTab === 'tax-summary' ? 'Tax Summary Report' : 'Payment Settlement Report')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              background: (!branchFilter || branchFilter === 'ALL' || branchFilter === 'All' || String(branchFilter).toUpperCase() === 'COMPANY') ? '#eff6ff' : '#fff7ed',
              color: (!branchFilter || branchFilter === 'ALL' || branchFilter === 'All' || String(branchFilter).toUpperCase() === 'COMPANY') ? '#1d4ed8' : '#c2410c',
              border: `1px solid ${(!branchFilter || branchFilter === 'ALL' || branchFilter === 'All' || String(branchFilter).toUpperCase() === 'COMPANY') ? '#bfdbfe' : '#fed7aa'}`
            }}>
              {(!branchFilter || branchFilter === 'ALL' || branchFilter === 'All' || String(branchFilter).toUpperCase() === 'COMPANY') ? (
                <>🏢 Company View: Complete History (All Branches)</>
              ) : (
                <>📍 Branch View: {allBranchesList.find(b => String(b.id || b._id) === String(branchFilter) || String(b.branchCode) === String(branchFilter))?.name || 
                  allBranchesList.find(b => String(b.id || b._id) === String(branchFilter) || String(b.branchCode) === String(branchFilter))?.branchName || 
                  (branchFilter === 'MAIN' ? (activeRestaurant?.name || 'Main Branch') : `Branch: ${branchFilter}`)}</>
              )}
            </span>
          </div>
        </div>

        <div className="reports-export-btns">
          <button type="button" className="btn-export btn-export-excel" onClick={handleExportExcel}>
            <FileSpreadsheetIcon size={16} /> Export Excel
          </button>
          <button type="button" className="btn-export btn-export-pdf" onClick={handleExportPDF}>
            <PrinterIcon size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* 1st - SUMMARY KPI CARDS SECTION */}
      <div className={`reports-kpi-grid cards-${activeTab === 'orders' ? '7' : activeTab === 'sales' ? '5' : '4'}`}>
        {activeTab === 'sales' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Gross Revenue</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.grossRevenue ?? salesApiData?.summary?.grossSales ?? salesMetrics.grossRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Net Sales (Excl. Tax)</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.netSales ?? salesApiData?.summary?.netRevenue ?? salesMetrics.netSales ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Discount</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.totalDiscount ?? salesApiData?.summary?.totalDiscounts ?? salesMetrics.totalDiscount ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">GST / Tax Collected</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.taxCollected ?? salesApiData?.summary?.totalTax ?? salesMetrics.taxCollected ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Avg Order Value (AOV)</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.avgOrderValue ?? salesMetrics.aov ?? 0).toLocaleString()}
              </div>
            </div>
          </>
        )}

        {activeTab === 'items' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Total Quantity Sold</div>
              <div className="kpi-value">
                {Number(
                  dishApiData?.summary?.totalQuantitySold ??
                  dishApiData?.summary?.totalDishesPrepared ??
                  dishReportData.totalItemsSold ??
                  0
                ).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Net Sales</div>
              <div className="kpi-value">
                ₹{Number(
                  dishApiData?.summary?.totalNetSales ??
                  dishApiData?.summary?.foodRevenueGenerated ??
                  dishApiData?.summary?.totalDishSales ??
                  dishReportData.totalDishSales ??
                  0
                ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Top Selling Dish</div>
              <div className="kpi-value" style={{ fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={dishApiData?.summary?.topSellingDish || dishReportData.topSellingDish || 'N/A'}>
                {dishApiData?.summary?.topSellingDish || dishReportData.topSellingDish || 'N/A'}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Number of Dishes Sold</div>
              <div className="kpi-value">
                {Number(
                  dishApiData?.summary?.numberOfDishesSold ??
                  dishApiData?.summary?.distinctDishesSold ??
                  dishReportData.distinctDishesCount ??
                  0
                ).toLocaleString()}
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Total Orders</div>
              <div className="kpi-value">
                {orderAnalyticsApiData?.summary?.totalOrders ?? orderAnalyticsMetrics.total}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Completed Orders</div>
              <div className="kpi-value" style={{ color: '#16a34a' }}>
                {orderAnalyticsApiData?.summary?.completedOrders ?? orderAnalyticsMetrics.completed}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Pending / In-Progress Orders</div>
              <div className="kpi-value" style={{ color: '#d97706' }}>
                {orderAnalyticsApiData?.summary?.pendingOrders ?? orderAnalyticsMetrics.pending}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Cancelled Orders</div>
              <div className="kpi-value" style={{ color: '#dc2626' }}>
                {orderAnalyticsApiData?.summary?.cancelledOrders ?? orderAnalyticsMetrics.cancelled}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Dine-In Orders</div>
              <div className="kpi-value" style={{ color: '#2563eb' }}>
                {orderAnalyticsApiData?.summary?.dineInOrders ?? orderAnalyticsApiData?.summary?.dineIn ?? orderAnalyticsMetrics.dineIn}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Takeaway Orders</div>
              <div className="kpi-value" style={{ color: '#ea580c' }}>
                {orderAnalyticsCounts.takeaway}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Delivery Orders</div>
              <div className="kpi-value" style={{ color: '#7c3aed' }}>
                {orderAnalyticsCounts.delivery}
              </div>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          inventorySubTab === 'movement' ? (
            <>
              <div className="kpi-card">
                <div className="kpi-title">Total Stock Movements</div>
                <div className="kpi-value">{stockMovementData.list.length}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Inward Quantity (Added)</div>
                <div className="kpi-value" style={{ color: '#15803d' }}>+{stockMovementData.totalInward.toLocaleString()}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Outward Quantity (Consumed)</div>
                <div className="kpi-value" style={{ color: '#be123c' }}>-{stockMovementData.totalOutward.toLocaleString()}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Total Wastage Logged</div>
                <div className="kpi-value" style={{ color: '#b45309' }}>{stockMovementData.totalWastage.toLocaleString()}</div>
              </div>
            </>
          ) : inventorySubTab === 'low-stock' ? (
            <>
              <div className="kpi-card">
                <div className="kpi-title">Action Required Items</div>
                <div className="kpi-value" style={{ color: '#b45309' }}>{inventoryReportData.lowStockList.length}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Low Stock Warning</div>
                <div className="kpi-value" style={{ color: '#d97706' }}>{inventoryReportData.lowStockCount}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Out of Stock Alert</div>
                <div className="kpi-value" style={{ color: '#be123c' }}>{inventoryReportData.outOfStockCount}</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Reorder Estimated Cost</div>
                <div className="kpi-value">₹{inventoryReportData.lowStockList.reduce((sum, i) => sum + (Math.max(0, (i.minStock * 2) - i.closingStock) * i.unitCost), 0).toLocaleString()}</div>
              </div>
            </>
          ) : (
            <>
              <div className="kpi-card">
                <div className="kpi-title">Total Inventory Items</div>
                <div className="kpi-value">
                  {Number(inventoryApiData?.summary?.totalInventoryItems ?? inventoryReportData.totalItems).toLocaleString()}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Low Stock Items</div>
                <div className="kpi-value" style={{ color: '#b45309' }}>
                  {Number(inventoryApiData?.summary?.lowStockItems ?? inventoryReportData.lowStockCount).toLocaleString()}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Out of Stock Items</div>
                <div className="kpi-value" style={{ color: '#be123c' }}>
                  {Number(inventoryApiData?.summary?.outOfStockItems ?? inventoryReportData.outOfStockCount).toLocaleString()}
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-title">Total Stock Value</div>
                <div className="kpi-value">
                  ₹{Number(inventoryApiData?.summary?.totalStockValue ?? inventoryReportData.totalStockValue).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </>
          )
        )}

        {activeTab === 'staff' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Active Staff</div>
              <div className="kpi-value">
                {staffApiData?.summary?.activeStaff ?? staffApiData?.summary?.activeWaitersOnDuty ?? staffReportData.activeStaffCount}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Orders Handled</div>
              <div className="kpi-value">
                {staffApiData?.summary?.ordersHandled ?? staffApiData?.summary?.totalOrdersServed ?? staffReportData.totalOrdersHandled}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Bills Generated</div>
              <div className="kpi-value" style={{ color: '#0d9488' }}>
                {staffApiData?.summary?.billsGenerated ?? staffReportData.totalBillsGenerated}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Sales Amount</div>
              <div className="kpi-value" style={{ color: '#0f172a' }}>
                ₹{Number(staffApiData?.summary?.salesAmount ?? staffApiData?.summary?.totalStaffSales ?? staffApiData?.summary?.totalWaiterRevenue ?? staffReportData.totalStaffSales ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </>
        )}


        {activeTab === 'tax' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Total Taxable Amount</div>
              <div className="kpi-value">
                ₹{Number(taxApiData?.summary?.totalTaxableAmount ?? taxReportData.taxableAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Tax Collected</div>
              <div className="kpi-value" style={{ color: '#15803d' }}>
                ₹{Number(taxApiData?.summary?.totalTaxCollected ?? taxReportData.taxCollected ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Payments Collected</div>
              <div className="kpi-value" style={{ color: '#0f172a' }}>
                ₹{Number(taxApiData?.summary?.totalPaymentsCollected ?? taxReportData.totalPaymentsCollected ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Refund Amount</div>
              <div className="kpi-value" style={{ color: '#b91c1c' }}>
                ₹{Number(taxApiData?.summary?.refundAmount ?? taxReportData.refundAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 2nd - FILTERS SECTION */}
      <div className="reports-filter-card">
        {/* Quick Date Presets */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div className="filter-preset-btns">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: 'Last 7 Days' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Time' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                className={`btn-preset ${datePreset === p.id ? 'active' : ''}`}
                onClick={() => handleDatePreset(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button type="button" className="btn-clear-filters" onClick={handleClearFilters}>
            <RefreshCwIcon size={14} /> Clear Filters
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div className="reports-filter-grid">
          {/* Branch Filter */}
          <div className="filter-item">
            <label>Branch</label>
            <select
              className="filter-control"
              value={branchFilter}
              onChange={e => { setBranchFilter(e.target.value); setCurrentPage(1); }}
              disabled={isBranchLogin}
              title={isBranchLogin ? "Branch filter is locked to your assigned branch account" : "Filter by branch"}
            >
              {isBranchLogin ? (
                <option value={userBranchId}>
                  📍 {allBranchesList.find(b => String(b.id || b._id) === String(userBranchId) || String(b.branchCode) === String(userBranchId))?.name || 
                      allBranchesList.find(b => String(b.id || b._id) === String(userBranchId) || String(b.branchCode) === String(userBranchId))?.branchName || 
                      (userBranchId === 'MAIN' ? (activeRestaurant?.name || 'Main Branch') : `Branch: ${userBranchId}`)}
                </option>
              ) : (
                <>
                  <option value="ALL">🏢 All Branches (Company - Complete History)</option>
                  <option value="MAIN">{activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'Main Branch'}</option>
                  {allBranchesList.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name || b.branchName || b.branchCode}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          {/* Start Date */}
          <div className="filter-item">
            <label>Start Date</label>
            <input
              type="date"
              className="filter-control"
              value={dateStart}
              onChange={e => { setDateStart(e.target.value); setDatePreset('custom'); }}
            />
          </div>

          {/* End Date */}
          <div className="filter-item">
            <label>End Date</label>
            <input
              type="date"
              className="filter-control"
              value={dateEnd}
              onChange={e => { setDateEnd(e.target.value); setDatePreset('custom'); }}
            />
          </div>

          {/* Search Query */}
          <div className="filter-item">
            <label>Search Query</label>
            <input
              type="text"
              className="filter-control"
              placeholder="Search order, customer, dish..."
              value={searchQuery}
              onKeyDown={e => {
                if (e.key === ' ' || e.code === 'Space') {
                  e.preventDefault();
                }
              }}
              onChange={e => setSearchQuery(e.target.value.replace(/\s+/g, ''))}
            />
          </div>

          {/* Tab Specific Filters */}
          {(activeTab === 'sales' || (activeTab === 'tax' && taxSubTab === 'payment-settlement')) && (
            <div className="filter-item">
              <label>Payment Method</label>
              <select className="filter-control" value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">All Payment Methods</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          {(activeTab === 'tax' && taxSubTab === 'tax-summary') && (
            <div className="filter-item">
              <label>Tax Type</label>
              <select className="filter-control" value={taxTypeFilter} onChange={e => { setTaxTypeFilter(e.target.value); setCurrentPage(1); }}>
                <option value="ALL">All Taxes</option>
                <option value="GST 5%">GST 5%</option>
                <option value="CGST">CGST</option>
                <option value="SGST">SGST</option>
                <option value="VAT">VAT</option>
                <option value="Service Tax">Service Tax</option>
              </select>
            </div>
          )}

          {(activeTab === 'sales' || activeTab === 'items' || activeTab === 'orders') && (
            <div className="filter-item">
              <label>Order Type</label>
              <select className="filter-control" value={orderTypeFilter} onChange={e => setOrderTypeFilter(e.target.value)}>
                <option value="ALL">All Order Types</option>
                <option value="Dine-In">Dine-In</option>
                <option value="Takeaway">Takeaway</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="filter-item">
              <label>Order Status</label>
              <select className="filter-control" value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                <option value="ALL">All Statuses</option>
                <option value="new">New</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}

          {(activeTab === 'items' || activeTab === 'inventory') && (
            <div className="filter-item">
              <label>Category</label>
              <select className="filter-control" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="ALL">All Categories</option>
                {activeTab === 'inventory' ? (
                  availableInventoryCategories.length > 0 ? (
                    availableInventoryCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  ) : (
                    <>
                      <option value="Dairy">Dairy</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Meat & Poultry">Meat & Poultry</option>
                      <option value="Spices & Seasoning">Spices & Seasoning</option>
                      <option value="Beverages">Beverages</option>
                    </>
                  )
                ) : (
                  <>
                    <option value="Starter">Starter</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Desserts">Desserts</option>
                  </>
                )}
              </select>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="filter-item">
              <label>Dish</label>
              <select className="filter-control" value={dishFilter} onChange={e => setDishFilter(e.target.value)}>
                <option value="ALL">All Dishes</option>
                {availableDishes.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="filter-item">
              <label>Item</label>
              <select className="filter-control" value={inventoryItemFilter} onChange={e => setInventoryItemFilter(e.target.value)}>
                <option value="ALL">All Items</option>
                {availableInventoryItems.map(it => (
                  <option key={it} value={it}>{it}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'items' && (
            <div className="filter-item">
              <label>Food Type</label>
              <select className="filter-control" value={foodTypeFilter} onChange={e => setFoodTypeFilter(e.target.value)}>
                <option value="ALL">All Food Types</option>
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Egg">Egg</option>
              </select>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="filter-item">
              <label>Stock Status</label>
              <select className="filter-control" value={stockStatusFilter} onChange={e => setStockStatusFilter(e.target.value)}>
                <option value="ALL">All Stock Status</option>
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="filter-item">
              <label>Transaction Type</label>
              <select className="filter-control" value={transactionTypeFilter} onChange={e => setTransactionTypeFilter(e.target.value)}>
                <option value="ALL">All Transaction Types</option>
                <option value="Purchase">Purchase</option>
                <option value="Distribution">Distribution</option>
                <option value="Direct Purchase">Direct Purchase</option>
                <option value="Branch Transfer">Branch Transfer</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Consumption">Consumption</option>
                <option value="Wastage">Wastage</option>
              </select>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="filter-item">
              <label>Staff</label>
              <select className="filter-control" value={staffFilter} onChange={e => setStaffFilter(e.target.value)}>
                <option value="ALL">All Staff</option>
                {availableStaffMembers.map((s, idx) => (
                  <option key={s.id || s.name || idx} value={s.name}>
                    {s.staffId ? `${s.staffId} - ` : ''}{s.name} {s.role ? `(${s.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="filter-item">
              <label>Role</label>
              <select className="filter-control" value={staffRoleFilter} onChange={e => setStaffRoleFilter(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="Waiter">Waiter</option>
                <option value="Kitchen Staff">Kitchen Staff</option>
                <option value="Cashier">Cashier</option>
                <option value="Manager">Manager</option>
                {availableOtherStaffRoles.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3 TABS FOR INVENTORY & STOCK SECTION */}
      {activeTab === 'inventory' && (
        <div className="inventory-subtabs-container" style={{ display: 'flex', gap: '12px', marginBottom: '18px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn-subtab ${inventorySubTab === 'position' ? 'active' : ''}`}
            onClick={() => { setInventorySubTab('position'); setCurrentPage(1); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: inventorySubTab === 'position' ? '2px solid var(--primary, #ea580c)' : '1.5px solid #cbd5e1',
              background: inventorySubTab === 'position' ? '#fff7ed' : '#ffffff',
              color: inventorySubTab === 'position' ? 'var(--primary, #ea580c)' : '#475569',
              boxShadow: inventorySubTab === 'position' ? '0 4px 12px rgba(234, 88, 12, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <PackageIcon size={16} color={inventorySubTab === 'position' ? 'var(--primary, #ea580c)' : '#64748b'} />
            <span>Stock Position Table</span>
          </button>

          <button
            type="button"
            className={`btn-subtab ${inventorySubTab === 'movement' ? 'active' : ''}`}
            onClick={() => { setInventorySubTab('movement'); setCurrentPage(1); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: inventorySubTab === 'movement' ? '2px solid var(--primary, #ea580c)' : '1.5px solid #cbd5e1',
              background: inventorySubTab === 'movement' ? '#fff7ed' : '#ffffff',
              color: inventorySubTab === 'movement' ? 'var(--primary, #ea580c)' : '#475569',
              boxShadow: inventorySubTab === 'movement' ? '0 4px 12px rgba(234, 88, 12, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <RefreshCwIcon size={16} color={inventorySubTab === 'movement' ? 'var(--primary, #ea580c)' : '#64748b'} />
            <span>Stock Movement Table</span>
          </button>

          <button
            type="button"
            className={`btn-subtab ${inventorySubTab === 'low-stock' ? 'active' : ''}`}
            onClick={() => { setInventorySubTab('low-stock'); setCurrentPage(1); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: inventorySubTab === 'low-stock' ? '2px solid var(--primary, #ea580c)' : '1.5px solid #cbd5e1',
              background: inventorySubTab === 'low-stock' ? '#fff7ed' : '#ffffff',
              color: inventorySubTab === 'low-stock' ? 'var(--primary, #ea580c)' : '#475569',
              boxShadow: inventorySubTab === 'low-stock' ? '0 4px 12px rgba(234, 88, 12, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <AlertTriangleIcon size={16} color={inventorySubTab === 'low-stock' ? 'var(--primary, #ea580c)' : '#64748b'} />
            <span>Low Stock Table</span>
          </button>
        </div>
      )}

      {/* 2 TABS FOR TAX & PAYMENT SETTLEMENT SECTION */}
      {activeTab === 'tax' && (
        <div className="tax-subtabs-container" style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
          <button
            type="button"
            className={`btn-subtab ${taxSubTab === 'tax-summary' ? 'active' : ''}`}
            onClick={() => { setTaxSubTab('tax-summary'); setCurrentPage(1); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: taxSubTab === 'tax-summary' ? '2px solid var(--primary, #ea580c)' : '1.5px solid #cbd5e1',
              background: taxSubTab === 'tax-summary' ? '#fff7ed' : '#ffffff',
              color: taxSubTab === 'tax-summary' ? 'var(--primary, #ea580c)' : '#475569',
              boxShadow: taxSubTab === 'tax-summary' ? '0 4px 12px rgba(234, 88, 12, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <ReceiptIcon size={16} color={taxSubTab === 'tax-summary' ? 'var(--primary, #ea580c)' : '#64748b'} />
            <span> Tax Summary Table</span>
          </button>

          <button
            type="button"
            className={`btn-subtab ${taxSubTab === 'payment-settlement' ? 'active' : ''}`}
            onClick={() => { setTaxSubTab('payment-settlement'); setCurrentPage(1); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              border: taxSubTab === 'payment-settlement' ? '2px solid var(--primary, #ea580c)' : '1.5px solid #cbd5e1',
              background: taxSubTab === 'payment-settlement' ? '#fff7ed' : '#ffffff',
              color: taxSubTab === 'payment-settlement' ? 'var(--primary, #ea580c)' : '#475569',
              boxShadow: taxSubTab === 'payment-settlement' ? '0 4px 12px rgba(234, 88, 12, 0.12)' : '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <DollarSignIcon size={16} color={taxSubTab === 'payment-settlement' ? 'var(--primary, #ea580c)' : '#64748b'} />
            <span>Payment Settlement Table</span>
          </button>
        </div>
      )}

      {/* MAIN DATA TABLE SECTION */}
      {activeTab === 'tax' ? (
        taxSubTab === 'tax-summary' ? (
          /*  TAX SUMMARY TABLE */
          <div className="reports-table-card">
            <div className="reports-table-header-bar">
              <div className="reports-table-title">
                <span>Tax Summary Table</span>
                <span className="reports-record-badge">{taxSummaryRows.length} Records</span>
              </div>
            </div>

            <div className="reports-table-container">
              <table>
                <thead>
                  <tr>
                    <th>Tax Type</th>
                    <th>Tax Rate</th>
                    <th style={{ textAlign: 'right' }}>Taxable Amount</th>
                    <th style={{ textAlign: 'right' }}>Tax Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTaxReport ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Tax Summary report...
                      </td>
                    </tr>
                  ) : taxSummaryRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No tax summary records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    taxSummaryRows.map((r, idx) => (
                      <tr key={r.taxType || idx}>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{r.taxType || r.name || 'GST'}</strong>
                        </td>
                        <td>
                          <span className="badge-type">{r.taxRate || (r.rate ? `${r.rate}%` : '2.5%')}</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          ₹{Number(r.taxableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                          ₹{Number(r.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {taxSummaryRows.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan={2} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                        Total Tax Summary:
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                        ₹{Number(taxApiData?.tableSummary?.totalTaxableAmount ?? taxSummaryRows.reduce((sum, r) => sum + Number(r.taxableAmount || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#15803d' }}>
                        ₹{Number(taxApiData?.tableSummary?.totalTaxAmount ?? taxSummaryRows.reduce((sum, r) => sum + Number(r.taxAmount || 0), 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* PAGINATION BAR FOR TAX SUMMARY */}
            {totalRecordsCount > pageSize && (
              <div className="reports-pagination-bar">
                <div className="pagination-info">
                  Showing <strong>{totalRecordsCount === 0 ? 0 : currentPage * pageSize + 1}</strong> to <strong>{Math.min((currentPage + 1) * pageSize, totalRecordsCount)}</strong> of <strong>{totalRecordsCount}</strong> records
                </div>

                <div className="pagination-controls">
                  <div className="page-size-selector">
                    <span>Rows per page:</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="pagination-nav">
                    <button
                      type="button"
                      className="btn-page-nav"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                    >
                      Prev
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage + 1 > 3) {
                        pageNum = (currentPage + 1) - 3 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          className={`btn-page-nav ${currentPage === pageNum - 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum - 1)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className="btn-page-nav"
                      disabled={currentPage >= totalPages - 1 || totalPages === 0}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /*  PAYMENT SETTLEMENT TABLE */
          <div className="reports-table-card">
            <div className="reports-table-header-bar">
              <div className="reports-table-title">
                <span>Payment Settlement Table</span>
                <span className="reports-record-badge">{paymentSettlementRows.length} Records</span>
              </div>
            </div>

            <div className="reports-table-container">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '70px' }}>S.No</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Transaction Count</th>
                    <th style={{ textAlign: 'right' }}>Taxable Amount</th>
                    <th style={{ textAlign: 'right' }}>Tax Amount</th>
                    <th style={{ textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingTaxReport ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Payment Settlement report...
                      </td>
                    </tr>
                  ) : paymentSettlementRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No payment settlement records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    paymentSettlementRows.map((item, idx) => (
                      <tr key={item.paymentMethod || item.method || idx}>
                        <td style={{ color: '#64748b', fontWeight: 600 }}>
                          {item.sNo || (idx + 1)}
                        </td>
                        <td>
                          <strong style={{ color: '#0f172a' }}>{item.paymentMethod || item.method}</strong>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>
                          {Number(item.transactionCount ?? item.count ?? 0).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          ₹{Number(item.taxableAmount ?? (item.collected ? item.collected - (item.refund || 0) : 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>
                          ₹{Number(item.taxAmount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                          ₹{Number(item.totalAmount ?? item.netCollected ?? item.collected ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {item.refund > 0 && (
                            <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 500, marginTop: '2px' }}>
                              Refund: ₹{Number(item.refund).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {paymentSettlementRows.length > 0 && (
                  <tfoot>
                    <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan={2} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                        Total Settlement:
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                        {paymentSettlementRows.reduce((sum, s) => sum + Number(s.transactionCount ?? s.count ?? 0), 0).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                        ₹{paymentSettlementRows.reduce((sum, s) => sum + Number(s.taxableAmount ?? (s.collected ? s.collected - (s.refund || 0) : 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                        ₹{paymentSettlementRows.reduce((sum, s) => sum + Number(s.taxAmount ?? 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#15803d' }}>
                        ₹{paymentSettlementRows.reduce((sum, s) => sum + Number(s.totalAmount ?? s.netCollected ?? s.collected ?? 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* PAGINATION BAR FOR PAYMENT SETTLEMENT */}
            {totalRecordsCount > pageSize && (
              <div className="reports-pagination-bar">
                <div className="pagination-info">
                  Showing <strong>{totalRecordsCount === 0 ? 0 : currentPage * pageSize + 1}</strong> to <strong>{Math.min((currentPage + 1) * pageSize, totalRecordsCount)}</strong> of <strong>{totalRecordsCount}</strong> records
                </div>

                <div className="pagination-controls">
                  <div className="page-size-selector">
                    <span>Rows per page:</span>
                    <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div className="pagination-nav">
                    <button
                      type="button"
                      className="btn-page-nav"
                      disabled={currentPage === 0}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                    >
                      Prev
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage + 1 > 3) {
                        pageNum = (currentPage + 1) - 3 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          className={`btn-page-nav ${currentPage === pageNum - 1 ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum - 1)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className="btn-page-nav"
                      disabled={currentPage >= totalPages - 1 || totalPages === 0}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="reports-table-card">
          <div className="reports-table-header-bar">
            <div className="reports-table-title">
              <span>
                {activeTab === 'sales' && 'Sales & Revenue Data Table'}
                {activeTab === 'items' && 'Dish Performance - Detailed Table'}
                {activeTab === 'orders' && 'Order Analytics - Detailed Table'}
                {activeTab === 'inventory' && (
                  inventorySubTab === 'movement'
                    ? 'Stock Movement Table'
                    : inventorySubTab === 'low-stock'
                    ? 'Low Stock Table'
                    : 'Stock Position Table'
                )}
                {activeTab === 'staff' && 'Staff Performance - Detailed Table'}
              </span>
              <span className="reports-record-badge">{totalRecordsCount} Records</span>
            </div>
          </div>

        <div className="reports-table-container">
          
            <table>
              <thead>
                {activeTab === 'sales' && (
                  <tr>
                    <th>S.No</th>
                    <th>Date & Time</th>
                    <th>Order No</th>
                    <th>Bill No.</th>
                    <th>Invoice No.</th>
                    <th>Table / Type</th>
                    <th>Payment Method</th>
                    <th style={{ textAlign: 'right' }}>Gross Amount</th>
                    <th style={{ textAlign: 'right' }}>Discount</th>
                    <th style={{ textAlign: 'right' }}>Tax</th>
                    <th style={{ textAlign: 'right' }}>Net Sales</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                )}

                {activeTab === 'items' && (
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                    <th>Dish Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Food Type</th>
                    <th style={{ textAlign: 'right' }}>Quantity Sold</th>
                    <th style={{ textAlign: 'right' }}>Gross Sales</th>
                    <th style={{ textAlign: 'right' }}>Discount</th>
                    <th style={{ textAlign: 'right' }}>Net Sales</th>
                    <th style={{ textAlign: 'right' }}>Sales %</th>
                  </tr>
                )}

                {activeTab === 'orders' && (
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                    <th>Order No.</th>
                    <th>Date & Time</th>
                    <th>Order Type</th>
                    <th>Table</th>
                    <th style={{ textAlign: 'center' }}>Items Count</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Staff Responsible</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                )}

                {activeTab === 'inventory' && inventorySubTab === 'position' && (
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                    <th>Item Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'center' }}>Unit</th>
                    <th style={{ textAlign: 'right' }}>Opening Stock</th>
                    <th style={{ textAlign: 'right' }}>Purchased / Added</th>
                    <th style={{ textAlign: 'right' }}>Used / Consumed</th>
                    <th style={{ textAlign: 'right' }}>Wastage</th>
                    <th style={{ textAlign: 'right' }}>Closing / Current Stock</th>
                    <th style={{ textAlign: 'right' }}>Minimum Stock</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                )}

                {activeTab === 'inventory' && inventorySubTab === 'movement' && (
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                    <th>Date</th>
                    <th>Transaction No.</th>
                    <th>Transaction Type</th>
                    <th>Item</th>
                    <th style={{ textAlign: 'right' }}>Quantity</th>
                    <th style={{ textAlign: 'center' }}>Unit</th>
                    <th>Source</th>
                    <th>Destination</th>
                    <th>Reference No.</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                )}

                {activeTab === 'inventory' && inventorySubTab === 'low-stock' && (
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                    <th>Item</th>
                    <th style={{ textAlign: 'right' }}>Current Stock</th>
                    <th style={{ textAlign: 'right' }}>Minimum Stock</th>
                    <th style={{ textAlign: 'center' }}>Unit</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                )}

                {activeTab === 'staff' && (
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>S.No</th>
                    <th>Staff ID</th>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Orders Handled</th>
                    <th style={{ textAlign: 'right' }}>KOTs Handled</th>
                    <th style={{ textAlign: 'right' }}>Bills Generated</th>
                    <th style={{ textAlign: 'right' }}>Payments Collected</th>
                    <th style={{ textAlign: 'right' }}>Sales Amount</th>
                    <th style={{ textAlign: 'right' }}>Cancelled Orders</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeTab === 'sales' && (
                  loadingSalesReport ? (
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Sales & Revenue report...
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={13} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No sales & revenue records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((ord, idx) => {
                      const orderNo = getFormattedOrderNo(ord, idx);
                      const rawId = ord._id || ord.orderId || ord.id || '';
                      const billNo = ord.billNo || ord.billNumber || ord.bill_no || (ord.billId ? String(ord.billId) : '') || (orderNo !== '-' ? `BILL-${orderNo.replace('#', '')}` : '-');
                      const invoiceNo = ord.invoiceNo || ord.invoiceNumber || ord.invoiceId || ord.invoice_no || ord.gstInvoiceNo || ord.taxInvoiceNo || (ord.invoiceGenerated && orderNo !== '-' ? `INV-${orderNo.replace('#', '')}` : '-');
                      const date = ord.createdAt || ord.date || ord.orderDate || ord.timestamp;
                      const paymentMode = ord.paymentMethod || ord.paymentMode || ord.mode || 'N/A';
                      const gross = Number(ord.grossRevenue ?? ord.grossAmount ?? ord.subtotal ?? ord.totalAmount ?? 0);
                      const disc = Number(ord.totalDiscount ?? ord.discount ?? ord.discountAmount ?? 0);
                      const tax = Number(ord.taxCollected ?? ord.tax ?? ord.taxAmount ?? ord.gst ?? 0);
                      const total = Number(ord.netSales ?? ord.total ?? ord.netTotal ?? (gross - disc));

                      return (
                        <tr key={ord.id || ord._id || idx}>
                          <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                          <td>{formatDateTimeDMY(date)}</td>
                          <td><strong style={{ color: '#0f172a' }} title={rawId ? `Order ID: ${rawId}` : undefined}>{orderNo}</strong></td>
                          <td><span style={{ fontWeight: 600, color: '#334155' }}>{billNo}</span></td>
                          <td><span style={{ fontWeight: 600, color: invoiceNo !== '-' ? '#1e293b' : '#94a3b8' }}>{invoiceNo}</span></td>
                          <td>{toDisplayText(ord.table || ord.tableNumber || ord.orderType, 'Dine-In')}</td>
                          <td><span className="badge-type">{paymentMode}</span></td>
                          <td style={{ textAlign: 'right' }}>₹{gross.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', color: '#be123c' }}>₹{disc.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', color: '#15803d' }}>₹{tax.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{total.toLocaleString()}</td>
                          <td>
                            <span className="badge-status paid">
                              {ord.status || 'Paid'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-page-nav"
                              title="View Order Details"
                              onClick={() => setViewOrder(ord)}
                            >
                              <EyeIcon size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {activeTab === 'items' && (
                  loadingDishReport ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Dish Performance report...
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No dish performance records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((item, idx) => {
                      const serialNo = (currentPage - 1) * pageSize + idx + 1;
                      const dishName = item.dishName || item.name || item.foodItem || item.itemName || item.title || 'Unknown Item';
                      const cat = toDisplayText(item.category || item.categoryName, 'General');
                      const foodType = item.foodType || resolveFoodType(item);
                      const isVeg = String(foodType).toLowerCase() === 'veg' || String(foodType).toLowerCase() === 'vegetarian';
                      const isEgg = String(foodType).toLowerCase() === 'egg';
                      const qty = Number(item.totalQuantitySold ?? item.quantitySold ?? item.qtySold ?? item.quantityPrepared ?? item.quantity ?? item.qty ?? 0);
                      const gross = Number(item.grossSales ?? item.totalGrossSales ?? item.revenueGenerated ?? (Number(item.price || item.rate || 0) * qty) ?? 0);
                      const disc = Number(item.discount ?? item.discountAmount ?? item.totalDiscount ?? 0);
                      const net = Number(item.netSales ?? item.totalNetSales ?? (gross - disc) ?? 0);
                      const totalSalesForPct = Number(
                        dishApiData?.summary?.totalNetSales ??
                        dishApiData?.summary?.totalDishSales ??
                        dishApiData?.summary?.foodRevenueGenerated ??
                        dishReportData.totalDishSales ??
                        0
                      );
                      const salesPct = item.salesPercent ?? item.salesPct ?? item.salesPercentage ?? (totalSalesForPct > 0 ? ((net / totalSalesForPct) * 100).toFixed(1) : '0.0');

                      return (
                        <tr key={item._id || item.menuId || item.id || dishName + idx}>
                          <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{serialNo}</td>
                          <td><strong style={{ color: '#0f172a' }}>{dishName}</strong></td>
                          <td><span className="badge-type">{cat}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '3px 8px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              background: isVeg ? '#e6f4ea' : (isEgg ? '#fef3c7' : '#fce8e6'),
                              color: isVeg ? '#16a34a' : (isEgg ? '#d97706' : '#dc2626'),
                              border: `1px solid ${isVeg ? '#bbf7d0' : (isEgg ? '#fde68a' : '#fecaca')}`
                            }}>
                              {foodType}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{qty.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#334155' }}>₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: disc > 0 ? '#ef4444' : '#64748b' }}>
                            ₹{disc.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>{salesPct}%</td>
                        </tr>
                      );
                    })
                  )
                )}

                {activeTab === 'orders' && (
                  loadingOrderAnalyticsReport ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Order Analytics report...
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No orders found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((ord, idx) => {
                      const serialNo = (currentPage - 1) * pageSize + idx + 1;
                      const orderNo = getFormattedOrderNo(ord, idx);
                      const rawId = ord._id || ord.orderId || ord.id || '';
                      const date = ord.createdAt || ord.date;
                      const rawType = ord.orderType || ord.type || ord.source || 'Dine-In';
                      const orderType = String(rawType).toLowerCase().includes('take') ? 'Takeaway'
                        : String(rawType).toLowerCase().includes('deliv') ? 'Delivery'
                        : 'Dine-In';
                      const rawTable = ord.tableNumber || ord.tableNo || ord.table || (typeof ord.table === 'object' ? ord.table?.name || ord.table?.tableNumber || ord.table?.tableNo : '');
                      const tableDisplay = rawTable ? (String(rawTable).toLowerCase().startsWith('table') ? String(rawTable) : !isNaN(rawTable) ? `Table ${rawTable}` : String(rawTable)) : (orderType === 'Dine-In' ? 'N/A' : '-');
                      const itemsCount = (ord.items || []).length;
                      const total = Number(ord.total ?? ord.totalAmount ?? ord.grossAmount ?? 0);
                      const paymentMethod = ord.paymentMethod || ord.paymentMode || 'Cash';
                      const billingStatus = ord.billingStatus || ord.paymentStatus || 'paid';
                      const status = ord.status || 'completed';
                      const staffName = ord.waiter || ord.staff || ord.staffName || ord.serverName || paymentMethod;

                      return (
                        <tr key={ord._id || ord.id || idx}>
                          <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{serialNo}</td>
                          <td><strong style={{ color: '#0f172a' }} title={rawId ? `Order ID: ${rawId}` : undefined}>{orderNo}</strong></td>
                          <td>{formatDateTimeDMY(date)}</td>
                          <td>
                            <span className="badge-type" style={{
                              background: orderType === 'Dine-In' ? '#eff6ff' : orderType === 'Takeaway' ? '#fef3c7' : '#f3e8ff',
                              color: orderType === 'Dine-In' ? '#1d4ed8' : orderType === 'Takeaway' ? '#b45309' : '#7e22ce',
                              border: `1px solid ${orderType === 'Dine-In' ? '#bfdbfe' : orderType === 'Takeaway' ? '#fde68a' : '#e9d5ff'}`
                            }}>
                              {orderType}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: tableDisplay !== '-' ? '#334155' : '#94a3b8' }}>
                              {tableDisplay}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{itemsCount}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td>
                            <span className={`badge-status ${billingStatus.toLowerCase()}`}>
                              {billingStatus}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status ${status.toLowerCase()}`}>
                              {status}
                            </span>
                          </td>
                          <td><span style={{ color: '#475569', fontSize: '12.5px' }}>{staffName}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="btn-page-nav"
                              title="View Order Details"
                              onClick={() => setViewOrder(ord)}
                            >
                              <EyeIcon size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {activeTab === 'inventory' && (
                  inventorySubTab === 'movement' ? (
                    paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No stock movement records found matching filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((t, idx) => {
                        const serialNo = (currentPage - 1) * pageSize + idx + 1;
                        const isPositive = t.type === 'Purchase' || t.type === 'Direct Purchase' || (t.type === 'Adjustment' && Number(t.quantity) > 0);
                        const isNegative = t.type === 'Consumption' || t.type === 'Wastage' || t.type === 'Distribution' || (t.type === 'Adjustment' && Number(t.quantity) < 0);
                        return (
                          <tr key={t.id || idx}>
                            <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{serialNo}</td>
                            <td style={{ whiteSpace: 'nowrap', color: '#475569' }}>{formatDateTimeDMY(t.date)}</td>
                            <td><strong style={{ color: '#0f172a' }}>{t.txnNo || t.transactionNo}</strong></td>
                            <td><span className="badge-type">{t.type || t.transactionType}</span></td>
                            <td><strong style={{ color: '#0f172a' }}>{t.item || t.itemName}</strong></td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: isPositive ? '#15803d' : isNegative ? '#b91c1c' : '#0f172a' }}>
                              {isPositive ? `+${Math.abs(t.quantity)}` : isNegative ? `-${Math.abs(t.quantity)}` : t.quantity}
                            </td>
                            <td style={{ textAlign: 'center' }}>{t.unit}</td>
                            <td style={{ color: '#334155' }}>{t.source || '-'}</td>
                            <td style={{ color: '#334155' }}>{t.destination || '-'}</td>
                            <td><span style={{ fontWeight: 600, color: '#475569' }}>{t.refNo || t.referenceNo || '-'}</span></td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge-status ${(t.status || 'Completed').toLowerCase().replace(/\s+/g, '-')}`}>
                                {t.status || 'Completed'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )
                  ) : inventorySubTab === 'low-stock' ? (
                    paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#15803d', fontWeight: 600 }}>
                          All inventory items are sufficiently stocked! No low or out of stock items.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((item, idx) => {
                        const serialNo = (currentPage - 1) * pageSize + idx + 1;
                        return (
                          <tr key={item.id || idx}>
                            <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{serialNo}</td>
                            <td><strong style={{ color: '#0f172a' }}>{item.name}</strong></td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: item.closingStock <= 0 ? '#b91c1c' : '#b45309' }}>
                              {item.closingStock}
                            </td>
                            <td style={{ textAlign: 'right', color: '#64748b', fontWeight: 600 }}>{item.minStock}</td>
                            <td style={{ textAlign: 'center' }}>{item.unit}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge-status ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )
                  ) : (
                    loadingInventoryReport ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          Loading Stock Position report...
                        </td>
                      </tr>
                    ) : paginatedRecords.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                          No stock position records found.
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((item, idx) => {
                        const serialNo = (currentPage - 1) * pageSize + idx + 1;
                        const itemName = item.name || item.itemName || 'Inventory Item';
                        const cat = toDisplayText(item.category || item.categoryName, 'General');
                        const unit = item.unit || 'pcs';
                        const opening = Number(item.openingStock ?? (Number(item.closingStock ?? item.quantity ?? 0) + 5));
                        const purchased = Number(item.purchased ?? item.purchasedAdded ?? item.added ?? 0);
                        const used = Number(item.used ?? item.usedConsumed ?? item.consumed ?? 0);
                        const wastage = Number(item.wastage ?? 0);
                        const closing = Number(item.closingStock ?? item.quantity ?? item.currentStock ?? 0);
                        const min = Number(item.minStock ?? item.minimumStock ?? 10);
                        const status = item.status || (closing <= 0 ? 'Out of Stock' : (closing <= min ? 'Low Stock' : 'In Stock'));

                        return (
                          <tr key={item._id || item.id || idx}>
                            <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{serialNo}</td>
                            <td><strong style={{ color: '#0f172a' }}>{itemName}</strong></td>
                            <td><span className="badge-type">{cat}</span></td>
                            <td style={{ textAlign: 'center' }}>{unit}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{opening.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#15803d' }}>+{purchased.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#b91c1c' }}>-{used.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: wastage > 0 ? '#b45309' : '#64748b' }}>{wastage.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{closing.toLocaleString()}</td>
                            <td style={{ textAlign: 'right', color: '#64748b' }}>{min.toLocaleString()}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge-status ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )
                  )
                )}
                {activeTab === 'staff' && (
                  loadingStaffReport ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Staff Performance report...
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        No staff activity records found matching filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((s, idx) => {
                      const serialNo = (currentPage - 1) * pageSize + idx + 1;
                      const staffId = s.staffId || s.employeeCode || s.staffCode || getFormattedStaffId(s, (currentPage - 1) * pageSize + idx);
                      const staffName = s.waiterName || s.name || s.staffName || 'Staff Member';
                      const role = s.role || 'Staff';
                      const ordersHandled = Number(s.ordersHandled ?? s.ordersServed ?? 0);
                      const kotsHandled = Number(s.kotsHandled ?? s.kotCount ?? s.ordersHandled ?? s.ordersServed ?? 0);
                      const billsGenerated = Number(s.billsGenerated ?? s.ordersServed ?? 0);
                      const paymentsCollected = Number(s.paymentsCollected ?? Math.max(0, billsGenerated - Number(s.cancelledOrders ?? 0)));
                      const salesAmount = Number(s.salesAmount ?? s.revenue ?? 0);
                      const cancelledOrders = Number(s.cancelledOrders ?? 0);

                      return (
                        <tr key={s.id || s._id || idx}>
                          <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 600 }}>{serialNo}</td>
                          <td><span style={{ fontWeight: 600, color: '#334155' }}>{staffId}</span></td>
                          <td><strong style={{ color: '#0f172a' }}>{staffName}</strong></td>
                          <td><span className="badge-type">{role}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: 600 }}>{ordersHandled.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>{kotsHandled.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#0d9488' }}>{billsGenerated.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#15803d' }}>{paymentsCollected.toLocaleString()}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            ₹{salesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: cancelledOrders > 0 ? '#b91c1c' : '#64748b' }}>
                            {cancelledOrders.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
              {activeTab === 'sales' && paginatedRecords.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={7} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                      Total Summary:
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(salesApiData?.summary?.grossRevenue ?? salesApiData?.summary?.grossSales ?? salesMetrics.grossRevenue ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#be123c' }}>
                      ₹{Number(salesApiData?.summary?.totalDiscount ?? salesApiData?.summary?.totalDiscounts ?? salesMetrics.totalDiscount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#15803d' }}>
                      ₹{Number(salesApiData?.summary?.taxCollected ?? salesApiData?.summary?.totalTax ?? salesMetrics.taxCollected ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(salesApiData?.summary?.netSales ?? salesApiData?.summary?.netRevenue ?? salesMetrics.netSales ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
              {activeTab === 'items' && paginatedRecords.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={4} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                      Total Summary:
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      {Number(
                        dishApiData?.summary?.totalQuantitySold ??
                        dishApiData?.summary?.totalDishesPrepared ??
                        dishReportData.totalItemsSold ??
                        0
                      ).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#334155' }}>
                      ₹{Number(
                        dishApiData?.summary?.grossSales ??
                        dishApiData?.summary?.totalGrossSales ??
                        dishReportData.totalDishGross ??
                        0
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#be123c' }}>
                      ₹{Number(
                        dishApiData?.summary?.totalDiscount ??
                        dishApiData?.summary?.discount ??
                        dishReportData.totalDishDiscount ??
                        0
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(
                        dishApiData?.summary?.totalNetSales ??
                        dishApiData?.summary?.foodRevenueGenerated ??
                        dishApiData?.summary?.totalDishSales ??
                        dishReportData.totalDishSales ??
                        0
                      ).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#2563eb' }}>
                      100.0%
                    </td>
                  </tr>
                </tfoot>
              )}
              {activeTab === 'inventory' && inventorySubTab === 'position' && paginatedRecords.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={4} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                      Total Summary:
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      {Number(inventoryApiData?.tableSummary?.totalOpeningStock ?? inventoryReportData.list.reduce((sum, i) => sum + i.openingStock, 0)).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#15803d' }}>
                      {inventoryApiData?.tableSummary?.totalPurchasedAdded !== undefined
                        ? inventoryApiData.tableSummary.totalPurchasedAdded
                        : `+${inventoryReportData.list.reduce((sum, i) => sum + i.purchased, 0).toLocaleString()}`}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#b91c1c' }}>
                      {inventoryApiData?.tableSummary?.totalUsedConsumed !== undefined
                        ? inventoryApiData.tableSummary.totalUsedConsumed
                        : `-${inventoryReportData.list.reduce((sum, i) => sum + i.used, 0).toLocaleString()}`}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#b45309' }}>
                      {Number(inventoryApiData?.tableSummary?.totalWastage ?? inventoryReportData.list.reduce((sum, i) => sum + i.wastage, 0)).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      {Number(inventoryApiData?.tableSummary?.totalClosingStock ?? inventoryReportData.list.reduce((sum, i) => sum + i.closingStock, 0)).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', color: '#64748b' }}>
                      -
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
              {activeTab === 'inventory' && inventorySubTab === 'movement' && paginatedRecords.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={5} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                      Total Movements:
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      {stockMovementData.list.reduce((sum, t) => sum + Number(t.quantity || 0), 0)}
                    </td>
                    <td colSpan={5}></td>
                  </tr>
                </tfoot>
              )}
              {activeTab === 'inventory' && inventorySubTab === 'low-stock' && paginatedRecords.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={2} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                      Total Low / Out of Stock Items:
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#b91c1c' }}>
                      {inventoryReportData.lowStockList.reduce((sum, i) => sum + Number(i.closingStock || 0), 0)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#64748b' }}>
                      {inventoryReportData.lowStockList.reduce((sum, i) => sum + Number(i.minStock || 0), 0)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              )}
              {activeTab === 'staff' && paginatedRecords.length > 0 && (
                <tfoot>
                  <tr style={{ background: '#f8fafc', fontWeight: 700, borderTop: '2px solid #cbd5e1' }}>
                    <td colSpan={4} style={{ textAlign: 'right', padding: '12px 10px', color: '#0f172a', fontWeight: 800 }}>
                      Total Summary:
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      {Number(staffApiData?.tableSummary?.totalOrdersHandled ?? staffApiData?.summary?.ordersHandled ?? staffApiData?.summary?.totalOrdersServed ?? staffReportData.totalOrdersHandled).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#2563eb' }}>
                      {Number(staffApiData?.tableSummary?.totalKotsHandled ?? staffApiData?.summary?.kotsHandled ?? staffReportData.totalKotsHandled).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0d9488' }}>
                      {Number(staffApiData?.tableSummary?.totalBillsGenerated ?? staffApiData?.summary?.billsGenerated ?? staffReportData.totalBillsGenerated).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#15803d' }}>
                      {Number(staffApiData?.tableSummary?.totalPaymentsCollected ?? staffApiData?.summary?.paymentsCollected ?? staffReportData.totalPaymentsCollected).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(staffApiData?.tableSummary?.totalSalesAmount ?? staffApiData?.summary?.salesAmount ?? staffApiData?.summary?.totalStaffSales ?? staffApiData?.summary?.totalWaiterRevenue ?? staffReportData.totalStaffSales).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 10px', fontWeight: 800, color: '#b91c1c' }}>
                      {Number(staffApiData?.tableSummary?.totalCancelledOrders ?? staffApiData?.summary?.cancelledOrders ?? staffReportData.totalCancelledOrders).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
        </div>

        {/* PAGINATION BAR */}
        {totalRecordsCount > 0 && (
          <div className="reports-pagination-bar">
            <div className="pagination-info">
              Showing <strong>{totalRecordsCount === 0 ? 0 : currentPage * pageSize + 1}</strong> to <strong>{Math.min((currentPage + 1) * pageSize, totalRecordsCount)}</strong> of <strong>{totalRecordsCount}</strong> records
            </div>

            <div className="pagination-controls">
              <div className="page-size-selector">
                <span>Rows per page:</span>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(0); }}>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="pagination-nav">
                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                >
                  Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage + 1 > 3) {
                    pageNum = (currentPage + 1) - 3 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`btn-page-nav ${currentPage === pageNum - 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum - 1)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={currentPage >= totalPages - 1 || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      )}



      {/* ORDER DETAILS MODAL */}
      {viewOrder && (
        <Modal
          isOpen={!!viewOrder}
          onClose={() => setViewOrder(null)}
          title={`Order Details ${getFormattedOrderNo(viewOrder)}`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Date & Time</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{formatDateTimeDMY(viewOrder.date || viewOrder.createdAt)}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Table / Order Type</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{toDisplayText(viewOrder.table || viewOrder.orderType, 'Dine-In')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Bill No.</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewOrder.billNo || viewOrder.billNumber || viewOrder.bill_no || (getFormattedOrderNo(viewOrder) !== '-' ? `BILL-${getFormattedOrderNo(viewOrder).replace('#', '')}` : '-')}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Invoice No.</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewOrder.invoiceNo || viewOrder.invoiceNumber || viewOrder.invoiceId || viewOrder.gstInvoiceNo || '-'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Customer Name</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewOrder.customerName || 'Walk-in Customer'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment Method</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewOrder.paymentMode || viewOrder.paymentMethod || 'UPI'}</strong>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700 }}>Order Items</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Item</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(viewOrder.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px' }}>{toDisplayText(item.name || item.itemName)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity || item.qty || 1}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{Number(item.price || 0).toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{(Number(item.price || 0) * Number(item.quantity || item.qty || 1)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Gross Amount:</span>
                <strong>₹{Number(viewOrder.totalAmount || viewOrder.grossAmount || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#be123c' }}>
                <span>Discount:</span>
                <strong>-₹{Number(viewOrder.discount || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tax (GST):</span>
                <strong>₹{Number(viewOrder.tax || 0).toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#0f172a', borderTop: '2px dashed #e2e8f0', paddingTop: '8px' }}>
                <span>Net Total:</span>
                <span style={{ color: 'var(--primary)' }}>₹{(Number(viewOrder.totalAmount || 0) - Number(viewOrder.discount || 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
