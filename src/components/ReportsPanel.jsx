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

// Safe text extractor
const toDisplayText = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.categoryName || val.title || val.tableNumber || val.tableNo || val.label || fallback;
  }
  return String(val);
};

export default function ReportsPanel({
  branches = [],
  selectedBranchId,
  activeRestaurant,
  initialTab = 'sales'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Filters State
  const [branchFilter, setBranchFilter] = useState(selectedBranchId || 'ALL');
  const [datePreset, setDatePreset] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [orderTypeFilter, setOrderTypeFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dishFilter, setDishFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [staffRoleFilter, setStaffRoleFilter] = useState('ALL');
  const [taxTypeFilter, setTaxTypeFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
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

  const [staffApiData, setStaffApiData] = useState(null);
  const [loadingStaffReport, setLoadingStaffReport] = useState(false);

  const [taxApiData, setTaxApiData] = useState(null);
  const [loadingTaxReport, setLoadingTaxReport] = useState(false);

  // Fetch Report Data from APIs when Tab or Filters change
  useEffect(() => {
    let isSubscribed = true;
    const commonFilters = {
      branchId: branchFilter,
      startDate: dateStart,
      endDate: dateEnd,
      search: searchQuery,
      page: currentPage,
      limit: pageSize
    };

    if (activeTab === 'sales') {
      setLoadingSalesReport(true);
      ReportsApi.getSalesReport({ ...commonFilters, paymentMethod: paymentFilter })
        .then(res => {
          if (isSubscribed) setSalesApiData(res?.status ? res.response : null);
        })
        .catch(() => { if (isSubscribed) setSalesApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingSalesReport(false); });
    } else if (activeTab === 'items') {
      setLoadingDishReport(true);
      ReportsApi.getDishPerformanceReport({ ...commonFilters, category: categoryFilter })
        .then(res => {
          if (isSubscribed) setDishApiData(res?.status ? res.response : null);
        })
        .catch(() => { if (isSubscribed) setDishApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingDishReport(false); });
    } else if (activeTab === 'orders') {
      setLoadingOrderAnalyticsReport(true);
      ReportsApi.getOrderAnalyticsReport({ ...commonFilters, orderType: orderTypeFilter, orderStatus: orderStatusFilter })
        .then(res => {
          if (isSubscribed) setOrderAnalyticsApiData(res?.status ? res.response : null);
        })
        .catch(() => { if (isSubscribed) setOrderAnalyticsApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingOrderAnalyticsReport(false); });
    } else if (activeTab === 'staff') {
      setLoadingStaffReport(true);
      ReportsApi.getStaffPerformanceReport({ ...commonFilters })
        .then(res => {
          if (isSubscribed) setStaffApiData(res?.status ? res.response : null);
        })
        .catch(() => { if (isSubscribed) setStaffApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingStaffReport(false); });
    } else if (activeTab === 'tax') {
      setLoadingTaxReport(true);
      ReportsApi.getTaxSettlementReport({ ...commonFilters, paymentMethod: paymentFilter })
        .then(res => {
          if (isSubscribed) setTaxApiData(res?.status ? res.response : null);
        })
        .catch(() => { if (isSubscribed) setTaxApiData(null); })
        .finally(() => { if (isSubscribed) setLoadingTaxReport(false); });
    }

    return () => {
      isSubscribed = false;
    };
  }, [
    activeTab,
    branchFilter,
    dateStart,
    dateEnd,
    paymentFilter,
    orderTypeFilter,
    orderStatusFilter,
    categoryFilter,
    searchQuery,
    currentPage,
    pageSize
  ]);

  // Sync branch filter prop
  useEffect(() => {
    if (selectedBranchId) {
      setBranchFilter(selectedBranchId);
    }
  }, [selectedBranchId]);

  // Reset pagination when active tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeTab,
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
    stockStatusFilter,
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
    setBranchFilter(selectedBranchId || 'ALL');
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
    setStaffFilter('ALL');
    setStaffRoleFilter('ALL');
    setTaxTypeFilter('ALL');
  };

  // Raw data sources from activeRestaurant
  const rawOrders = useMemo(() => activeRestaurant?.orders || [], [activeRestaurant?.orders]);
  const rawMenu = useMemo(() => activeRestaurant?.menu || [], [activeRestaurant?.menu]);
  const rawInventory = useMemo(() => activeRestaurant?.inventory || [], [activeRestaurant?.inventory]);
  const rawStaff = useMemo(() => activeRestaurant?.staff || activeRestaurant?.users || [], [activeRestaurant]);

  // Base Branch Filtered Orders
  const branchOrders = useMemo(() => {
    return rawOrders.filter(ord => {
      if (branchFilter === 'MAIN') {
        if (ord.branchId && ord.branchId !== 'MAIN' && ord.branchId !== 'main' && ord.branchId !== '') return false;
      } else if (branchFilter && branchFilter !== 'ALL' && branchFilter !== 'All') {
        if (ord.branchId && ord.branchId !== branchFilter) return false;
      }
      return true;
    });
  }, [rawOrders, branchFilter]);

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
        const orderNo = String(ord.id || ord.orderNo || '').toLowerCase();
        const customer = String(ord.customerName || ord.customer || '').toLowerCase();
        const table = String(ord.table || ord.tableNo || '').toLowerCase();
        const waiter = String(ord.waiter || ord.staff || '').toLowerCase();
        if (!orderNo.includes(q) && !customer.includes(q) && !table.includes(q) && !waiter.includes(q)) {
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
  const dishReportData = useMemo(() => {
    const map = {};

    validCompletedOrders.forEach(ord => {
      const items = ord.items || [];
      items.forEach(item => {
        const name = toDisplayText(item.name || item.title || item.itemName, 'Unknown Item');
        const cat = toDisplayText(item.category || item.categoryName, 'General');
        const qty = Number(item.quantity || item.qty || 1);
        const price = Number(item.price || item.rate || 0);
        const gross = price * qty;
        const disc = Number(item.discount || 0);
        const net = gross - disc;

        if (!map[name]) {
          map[name] = { name, category: cat, qtySold: 0, grossSales: 0, discount: 0, netSales: 0 };
        }
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
      list = list.filter(d => d.name.toLowerCase().includes(dishFilter.toLowerCase()));
    }

    const totalDishSales = list.reduce((sum, d) => sum + d.netSales, 0);
    const totalItemsSold = list.reduce((sum, d) => sum + d.qtySold, 0);
    
    // Sort by net sales descending
    list.sort((a, b) => b.netSales - a.netSales);
    const topSelling = list.length > 0 ? list[0].name : 'N/A';

    return {
      list: list.map(d => ({
        ...d,
        salesPercent: totalDishSales > 0 ? ((d.netSales / totalDishSales) * 100).toFixed(1) : '0.0'
      })),
      totalItemsSold,
      totalDishSales,
      topSelling,
      dishesCount: list.length
    };
  }, [validCompletedOrders, categoryFilter, dishFilter]);

  // --------------------------------------------------------------------------
  // TAB 3: ORDER ANALYTICS REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const orderAnalyticsMetrics = useMemo(() => {
    const total = filteredOrders.length;
    const completed = filteredOrders.filter(o => (o.status || '').toLowerCase() === 'completed' || (o.billingStatus || '').toLowerCase() === 'paid').length;
    const pending = filteredOrders.filter(o => ['new', 'preparing', 'ready'].includes((o.status || '').toLowerCase())).length;
    const cancelled = filteredOrders.filter(o => (o.status || '').toLowerCase() === 'cancelled').length;
    const dineIn = filteredOrders.filter(o => (o.orderType || o.type || 'Dine-In').toLowerCase().includes('dine')).length;
    const takeawayDelivery = filteredOrders.filter(o => {
      const t = (o.orderType || o.type || '').toLowerCase();
      return t.includes('takeaway') || t.includes('delivery');
    }).length;

    return { total, completed, pending, cancelled, dineIn, takeawayDelivery };
  }, [filteredOrders]);

  // --------------------------------------------------------------------------
  // TAB 4: INVENTORY & STOCK REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const inventoryReportData = useMemo(() => {
    let list = rawInventory.map(item => {
      const name = item.name || item.itemName || 'Inventory Item';
      const unit = item.unit || 'pcs';
      const current = Number(item.quantity ?? item.stock ?? item.closingStock ?? 0);
      const min = Number(item.minStock ?? item.minimumStock ?? 10);
      const opening = Number(item.openingStock ?? (current + 5));
      const purchased = Number(item.purchased ?? item.added ?? 10);
      const used = Number(item.used ?? item.consumed ?? 5);
      const wastage = Number(item.wastage ?? 0);
      const unitCost = Number(item.cost || item.price || item.unitCost || 50);

      let status = 'Normal';
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(i => i.name.toLowerCase().includes(q));
    }

    if (stockStatusFilter !== 'ALL') {
      list = list.filter(i => i.status.toLowerCase() === stockStatusFilter.toLowerCase());
    }

    const totalItems = list.length;
    const lowStockCount = list.filter(i => i.status === 'Low Stock').length;
    const outOfStockCount = list.filter(i => i.status === 'Out of Stock').length;
    const totalStockValue = list.reduce((sum, i) => sum + i.stockValue, 0);

    const lowStockList = list.filter(i => i.status === 'Low Stock' || i.status === 'Out of Stock');

    return { list, totalItems, lowStockCount, outOfStockCount, totalStockValue, lowStockList };
  }, [rawInventory, categoryFilter, searchQuery, stockStatusFilter]);

  // --------------------------------------------------------------------------
  // TAB 5: STAFF PERFORMANCE REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const staffReportData = useMemo(() => {
    const map = {};

    rawStaff.forEach(s => {
      const name = s.name || s.staffName || 'Staff Member';
      const role = s.role || s.userType || 'Waiter';
      map[name] = { name, role, ordersHandled: 0, billsGenerated: 0, salesAmount: 0, cancelledOrders: 0 };
    });

    filteredOrders.forEach(ord => {
      const staffName = ord.waiter || ord.staff || ord.server || 'Unassigned';
      if (!map[staffName]) {
        map[staffName] = { name: staffName, role: 'Staff', ordersHandled: 0, billsGenerated: 0, salesAmount: 0, cancelledOrders: 0 };
      }

      map[staffName].ordersHandled += 1;
      const isCancelled = (ord.status || '').toLowerCase() === 'cancelled';
      if (isCancelled) {
        map[staffName].cancelledOrders += 1;
      } else {
        map[staffName].billsGenerated += 1;
        const gross = Number(ord.totalAmount || ord.grossAmount || 0);
        const disc = Number(ord.discount || 0);
        map[staffName].salesAmount += (gross - disc);
      }
    });

    let list = Object.values(map);

    if (staffFilter !== 'ALL') {
      list = list.filter(s => s.name.toLowerCase() === staffFilter.toLowerCase());
    }

    if (staffRoleFilter !== 'ALL') {
      list = list.filter(s => s.role.toLowerCase().includes(staffRoleFilter.toLowerCase()));
    }

    const activeStaffCount = list.length;
    const totalOrdersHandled = list.reduce((sum, s) => sum + s.ordersHandled, 0);
    const totalBillsGenerated = list.reduce((sum, s) => sum + s.billsGenerated, 0);
    const totalStaffSales = list.reduce((sum, s) => sum + s.salesAmount, 0);

    return { list, activeStaffCount, totalOrdersHandled, totalBillsGenerated, totalStaffSales };
  }, [rawStaff, filteredOrders, staffFilter, staffRoleFilter]);

  // --------------------------------------------------------------------------
  // TAB 6: TAX & PAYMENT SETTLEMENT REPORT CALCULATIONS
  // --------------------------------------------------------------------------
  const taxReportData = useMemo(() => {
    let taxableAmount = 0;
    let taxCollected = 0;
    let totalPaymentsCollected = 0;
    let refundAmount = 0;

    const settlementMap = {
      'UPI': { method: 'UPI', count: 0, collected: 0, refund: 0 },
      'Cash': { method: 'Cash', count: 0, collected: 0, refund: 0 },
      'Credit / Debit Card': { method: 'Credit / Debit Card', count: 0, collected: 0, refund: 0 },
      'Net Banking': { method: 'Net Banking', count: 0, collected: 0, refund: 0 }
    };

    filteredOrders.forEach(ord => {
      const isCancelled = (ord.status || '').toLowerCase() === 'cancelled';
      const amt = Number(ord.totalAmount || ord.grossAmount || 0) - Number(ord.discount || 0);
      const tax = Number(ord.tax || ord.taxAmount || ord.gst || 0);
      const mode = ord.paymentMode || ord.paymentMethod || 'UPI';

      let key = 'UPI';
      if (mode.toLowerCase().includes('cash')) key = 'Cash';
      else if (mode.toLowerCase().includes('card')) key = 'Credit / Debit Card';
      else if (mode.toLowerCase().includes('net') || mode.toLowerCase().includes('bank')) key = 'Net Banking';

      if (isCancelled) {
        refundAmount += amt;
        if (settlementMap[key]) settlementMap[key].refund += amt;
      } else {
        taxableAmount += amt;
        taxCollected += tax;
        totalPaymentsCollected += (amt + tax);

        if (settlementMap[key]) {
          settlementMap[key].count += 1;
          settlementMap[key].collected += (amt + tax);
        }
      }
    });

    const taxRows = [
      { type: 'CGST', rate: '2.5%', taxable: taxableAmount, amount: taxCollected / 2 },
      { type: 'SGST', rate: '2.5%', taxable: taxableAmount, amount: taxCollected / 2 },
      { type: 'Total GST', rate: '5.0%', taxable: taxableAmount, amount: taxCollected }
    ];

    let settlementList = Object.values(settlementMap);
    if (paymentFilter !== 'ALL') {
      settlementList = settlementList.filter(s => s.method.toLowerCase().includes(paymentFilter.toLowerCase()));
    }

    return {
      taxableAmount,
      taxCollected,
      totalPaymentsCollected,
      refundAmount,
      taxRows,
      settlementList
    };
  }, [filteredOrders, paymentFilter]);

  // --------------------------------------------------------------------------
  // PAGINATION HELPER FOR CURRENT ACTIVE TAB
  // --------------------------------------------------------------------------
  const currentTabRecords = useMemo(() => {
    if (activeTab === 'sales') return filteredOrders;
    if (activeTab === 'items') return dishReportData.list;
    if (activeTab === 'orders') return filteredOrders;
    if (activeTab === 'inventory') return inventoryReportData.list;
    if (activeTab === 'staff') return staffReportData.list;
    if (activeTab === 'tax') return taxReportData.settlementList;
    return [];
  }, [activeTab, filteredOrders, dishReportData.list, inventoryReportData.list, staffReportData.list, taxReportData.settlementList]);

  const currentApiData = useMemo(() => {
    if (activeTab === 'sales') return salesApiData;
    if (activeTab === 'items') return dishApiData;
    if (activeTab === 'orders') return orderAnalyticsApiData;
    if (activeTab === 'staff') return staffApiData;
    if (activeTab === 'tax') return taxApiData;
    return null;
  }, [activeTab, salesApiData, dishApiData, orderAnalyticsApiData, staffApiData, taxApiData]);

  const totalRecordsCount = useMemo(() => {
    if (currentApiData && currentApiData.totalItems !== undefined) {
      return currentApiData.totalItems;
    }
    return currentTabRecords.length;
  }, [currentApiData, currentTabRecords.length]);

  const totalPages = useMemo(() => {
    if (currentApiData && currentApiData.totalPages !== undefined) {
      return currentApiData.totalPages || 1;
    }
    return Math.ceil(totalRecordsCount / pageSize) || 1;
  }, [currentApiData, totalRecordsCount, pageSize]);

  const paginatedRecords = useMemo(() => {
    if (currentApiData && Array.isArray(currentApiData.data) && currentApiData.data.length > 0) {
      if (currentApiData.data.length > pageSize) {
        const start = (currentPage - 1) * pageSize;
        return currentApiData.data.slice(start, start + pageSize);
      }
      return currentApiData.data;
    }
    const start = (currentPage - 1) * pageSize;
    return currentTabRecords.slice(start, start + pageSize);
  }, [currentApiData, currentTabRecords, currentPage, pageSize]);

  // --------------------------------------------------------------------------
  // EXPORT TO EXCEL (.xlsx)
  // --------------------------------------------------------------------------
  const handleExportExcel = () => {
    let exportData = [];
    let fileName = `Serviq_${activeTab.toUpperCase()}_Report.xlsx`;

    if (activeTab === 'sales') {
      const list = (salesApiData && salesApiData.data) ? salesApiData.data : filteredOrders;
      exportData = list.map((ord, idx) => ({
        'S.No': idx + 1,
        'Date & Time': formatDateTimeDMY(ord.createdAt || ord.date),
        'Order No': ord.orderId || ord.id || ord.orderNo,
        'Payment Method': ord.paymentMethod || ord.paymentMode || 'N/A',
        'Gross Subtotal (₹)': Number(ord.subtotal ?? ord.totalAmount ?? 0),
        'Discount (₹)': Number(ord.discount || 0),
        'Tax (₹)': Number(ord.tax || 0),
        'Net Total (₹)': Number(ord.total ?? ord.totalAmount ?? 0),
        'Status': ord.status || 'Paid'
      }));
    } else if (activeTab === 'items') {
      const list = (dishApiData && dishApiData.data) ? dishApiData.data : dishReportData.list;
      exportData = list.map(item => ({
        'Dish Name': item.foodItem || item.name,
        'Category': item.category || 'Uncategorized',
        'Quantity Prepared / Sold': item.quantityPrepared ?? item.qtySold ?? 0,
        'Revenue Generated (₹)': item.revenueGenerated ?? item.grossSales ?? 0,
        'Avg Prep Time': item.avgPrepTime || 'N/A',
        'Kitchen Status': item.kitchenStatus || 'Completed'
      }));
    } else if (activeTab === 'orders') {
      const list = (orderAnalyticsApiData && orderAnalyticsApiData.data) ? orderAnalyticsApiData.data : filteredOrders;
      exportData = list.map(ord => ({
        'Order No': ord.orderId || ord.id || ord.orderNo,
        'Date & Time': formatDateTimeDMY(ord.createdAt || ord.date),
        'Items Count': (ord.items || []).length,
        'Subtotal (₹)': Number(ord.subtotal || 0),
        'Tax (₹)': Number(ord.tax || 0),
        'Total Amount (₹)': Number(ord.total || ord.totalAmount || 0),
        'Payment Method': ord.paymentMethod || 'cash',
        'Billing Status': ord.billingStatus || 'paid',
        'Order Status': ord.status || 'completed'
      }));
    } else if (activeTab === 'inventory') {
      exportData = inventoryReportData.list.map(item => ({
        'Item Name': item.name,
        'Unit': item.unit,
        'Opening Stock': item.openingStock,
        'Purchased / Added': item.purchased,
        'Used / Consumed': item.used,
        'Wastage': item.wastage,
        'Closing Stock': item.closingStock,
        'Minimum Stock': item.minStock,
        'Stock Valuation (₹)': item.stockValue,
        'Status': item.status
      }));
    } else if (activeTab === 'staff') {
      const list = (staffApiData && staffApiData.data) ? staffApiData.data : staffReportData.list;
      exportData = list.map(s => ({
        'Staff Name': s.waiterName || s.name || 'Staff Member',
        'Role': s.role || 'Waiter',
        'Orders Served': s.ordersServed ?? s.ordersHandled ?? 0,
        'Bills Generated': s.billsGenerated ?? s.ordersServed ?? 0,
        'Sales Revenue (₹)': s.revenue ?? s.salesAmount ?? 0,
        'Cancelled Orders': s.cancelledOrders ?? 0
      }));
    } else if (activeTab === 'tax') {
      const taxList = (taxApiData && taxApiData.data) ? taxApiData.data : taxReportData.settlementList;
      exportData = taxList.map((item, idx) => ({
        'S.No': idx + 1,
        'Date & Time': formatDateTimeDMY(item.createdAt || item.date),
        'Order ID': item.orderId || item.id || 'N/A',
        'Invoice ID': item.invoiceId || 'N/A',
        'Branch Name': item.branchName || 'Main Branch',
        'Table Number': item.tableNumber || 'N/A',
        'Taxable Amount (₹)': Number(item.taxableAmount ?? (item.collected ? item.collected - item.refund : 0)),
        'Tax Amount (₹)': Number(item.taxAmount ?? 0),
        'Total Amount (₹)': Number(item.totalAmount ?? item.collected ?? 0),
        'Refund Amount (₹)': Number(item.refundAmount ?? item.refund ?? 0),
        'Payment Method': item.paymentMethod || item.method || 'N/A',
        'Payment Status': item.paymentStatus || 'Pending',
        'Order Status': item.orderStatus || 'Completed'
      }));
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
      {/* 6-TAB NAVIGATION HEADER */}
      <div className="reports-nav-tabs">
        {[
          { id: 'sales', label: 'Sales & Revenue', icon: <DollarSignIcon size={16} /> },
          { id: 'items', label: 'Dish Performance', icon: <UtensilsIcon size={16} /> },
          { id: 'orders', label: 'Order Analytics', icon: <ShoppingBagIcon size={16} /> },
          { id: 'inventory', label: 'Inventory & Stock', icon: <PackageIcon size={16} /> },
          { id: 'staff', label: 'Staff Performance', icon: <UserIcon size={16} /> },
          { id: 'tax', label: 'Tax & Settlement', icon: <ReceiptIcon size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`reports-nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* PAGE HEADER & ACTION BUTTONS */}
      <div className="reports-header-row">
        <div className="reports-title-group">
          <h2>
            {activeTab === 'sales' && 'Sales & Revenue Report'}
            {activeTab === 'items' && 'Item & Dish Performance Report'}
            {activeTab === 'orders' && 'Order Analytics Report'}
            {activeTab === 'inventory' && 'Inventory & Stock Report'}
            {activeTab === 'staff' && 'Staff Performance Report'}
            {activeTab === 'tax' && 'Tax & Payment Settlement Report'}
          </h2>

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
      <div className={`reports-kpi-grid cards-${activeTab === 'orders' ? '6' : activeTab === 'sales' ? '5' : '4'}`}>
        {activeTab === 'sales' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Gross Revenue</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.grossSales ?? salesMetrics.grossRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Net Sales (Excl. Tax)</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.netRevenue ?? salesMetrics.netSales ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Discount</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.totalDiscounts ?? salesMetrics.totalDiscount ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">GST / Tax Collected</div>
              <div className="kpi-value">
                ₹{Number(salesApiData?.summary?.totalTax ?? salesMetrics.taxCollected ?? 0).toLocaleString()}
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
              <div className="kpi-title">Total Items Sold</div>
              <div className="kpi-value">
                {Number(dishApiData?.summary?.totalDishesPrepared ?? dishReportData.totalItemsSold ?? 0).toLocaleString()} pcs
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Item Sales</div>
              <div className="kpi-value">
                ₹{Number(dishApiData?.summary?.foodRevenueGenerated ?? dishReportData.totalDishSales ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Active Categories</div>
              <div className="kpi-value">
                {dishApiData?.summary?.activeCategories ?? dishReportData.topSelling}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Avg Prep Time</div>
              <div className="kpi-value">
                {dishApiData?.summary?.avgPrepTime ?? dishReportData.dishesCount}
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
              <div className="kpi-value">
                {orderAnalyticsApiData?.summary?.completedOrders ?? orderAnalyticsMetrics.completed}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Pending / In-Progress</div>
              <div className="kpi-value">
                {orderAnalyticsApiData?.summary?.pendingOrders ?? orderAnalyticsMetrics.pending}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Cancelled Orders</div>
              <div className="kpi-value">
                {orderAnalyticsApiData?.summary?.cancelledOrders ?? orderAnalyticsMetrics.cancelled}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Revenue</div>
              <div className="kpi-value">
                ₹{Number(orderAnalyticsApiData?.summary?.totalRevenue ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Completion Rate</div>
              <div className="kpi-value">
                {orderAnalyticsApiData?.summary?.completionRate ?? 0}%
              </div>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Total Inventory Items</div>
              <div className="kpi-value">{inventoryReportData.totalItems}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Low Stock Items</div>
              <div className="kpi-value" style={{ color: '#b45309' }}>{inventoryReportData.lowStockCount}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Out of Stock Items</div>
              <div className="kpi-value" style={{ color: '#be123c' }}>{inventoryReportData.outOfStockCount}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Stock Value</div>
              <div className="kpi-value">₹{inventoryReportData.totalStockValue.toLocaleString()}</div>
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Active Waiters On Duty</div>
              <div className="kpi-value">
                {staffApiData?.summary?.activeWaitersOnDuty ?? staffReportData.activeStaffCount}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Orders Served</div>
              <div className="kpi-value">
                {staffApiData?.summary?.totalOrdersServed ?? staffReportData.totalOrdersHandled}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Waiter Revenue</div>
              <div className="kpi-value">
                ₹{Number(staffApiData?.summary?.totalWaiterRevenue ?? staffReportData.totalStaffSales ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Average Order Value</div>
              <div className="kpi-value">
                ₹{Number(staffApiData?.summary?.averageOrderValue ?? 0).toLocaleString()}
              </div>
            </div>
          </>
        )}


        {activeTab === 'tax' && (
          <>
            <div className="kpi-card">
              <div className="kpi-title">Total Taxable Amount</div>
              <div className="kpi-value">
                ₹{Number(taxApiData?.summary?.totalTaxableAmount ?? taxReportData.taxableAmount ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Tax Collected</div>
              <div className="kpi-value">
                ₹{Number(taxApiData?.summary?.totalTaxCollected ?? taxReportData.taxCollected ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Total Payments Collected</div>
              <div className="kpi-value">
                ₹{Number(taxApiData?.summary?.totalPaymentsCollected ?? taxReportData.totalPaymentsCollected ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-title">Refund Amount</div>
              <div className="kpi-value">
                ₹{Number(taxApiData?.summary?.refundAmount ?? taxReportData.refundAmount ?? 0).toLocaleString()}
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
              onChange={e => setBranchFilter(e.target.value)}
              disabled={Boolean(selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all')}
              title={selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' ? "Branch dropdown is locked to topbar selected branch" : "Filter by branch"}
            >
              <option value="ALL">All Branches</option>
              <option value="MAIN">{activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'Main Branch'}</option>
              {branches.map(b => (
                <option key={b.id || b._id} value={b.id || b._id}>{b.name || b.branchName}</option>
              ))}
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
          {(activeTab === 'sales' || activeTab === 'tax') && (
            <div className="filter-item">
              <label>Payment Method</label>
              <select className="filter-control" value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}>
                <option value="ALL">All Payments</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Credit / Debit Card</option>
                <option value="Net Banking">Net Banking</option>
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
                <option value="Starter">Starter</option>
                <option value="Main Course">Main Course</option>
                <option value="Beverages">Beverages</option>
                <option value="Desserts">Desserts</option>
                <option value="Dairy">Dairy</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Meat & Poultry">Meat & Poultry</option>
              </select>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="filter-item">
              <label>Stock Status</label>
              <select className="filter-control" value={stockStatusFilter} onChange={e => setStockStatusFilter(e.target.value)}>
                <option value="ALL">All Stock Status</option>
                <option value="Normal">Normal</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="filter-item">
              <label>Staff Role</label>
              <select className="filter-control" value={staffRoleFilter} onChange={e => setStaffRoleFilter(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="Waiter">Waiter</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* MAIN DATA TABLE SECTION */}
      <div className="reports-table-card">
        <div className="reports-table-header-bar">
          <div className="reports-table-title">
            <span>
              {activeTab === 'sales' && 'Sales & Revenue Data Table'}
              {activeTab === 'items' && 'Item & Dish Sales Table'}
              {activeTab === 'orders' && 'Orders Master Table'}
              {activeTab === 'inventory' && 'Inventory Items Master Table'}
              {activeTab === 'staff' && 'Staff Activity & Performance Table'}
              {activeTab === 'tax' && 'Payment Settlement Table'}
            </span>
            <span className="reports-record-badge">{totalRecordsCount} Records</span>
          </div>
        </div>

        <div className="reports-table-container">
          {totalRecordsCount === 0 ? (
            <div className="reports-empty-state">
              <div className="empty-icon-box">
                <FilterIcon size={28} />
              </div>
              <h4>No Records Found</h4>
              <p>There are no report records matching your current filter criteria. Try clearing filters or adjusting your date range.</p>
            </div>
          ) : (
            <table>
              <thead>
                {activeTab === 'sales' && (
                  <tr>
                    <th>S.No</th>
                    <th>Date & Time</th>
                    <th>Order No</th>
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
                    <th>Dish Name</th>
                    <th>Category</th>
                    <th style={{ textAlign: 'right' }}>Quantity Sold</th>
                    <th style={{ textAlign: 'right' }}>Gross Sales</th>
                    <th style={{ textAlign: 'right' }}>Discount</th>
                    <th style={{ textAlign: 'right' }}>Net Sales</th>
                    <th style={{ textAlign: 'right' }}>Sales %</th>
                  </tr>
                )}

                {activeTab === 'orders' && (
                  <tr>
                    <th>Order No</th>
                    <th>Date & Time</th>
                    <th>Table / Type</th>
                    <th>Items Count</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                    <th>Staff Responsible</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                )}

                {activeTab === 'inventory' && (
                  <tr>
                    <th>Item Name</th>
                    <th>Unit</th>
                    <th style={{ textAlign: 'right' }}>Opening Stock</th>
                    <th style={{ textAlign: 'right' }}>Purchased / Added</th>
                    <th style={{ textAlign: 'right' }}>Used / Consumed</th>
                    <th style={{ textAlign: 'right' }}>Wastage</th>
                    <th style={{ textAlign: 'right' }}>Closing Stock</th>
                    <th style={{ textAlign: 'right' }}>Minimum Stock</th>
                    <th>Status</th>
                  </tr>
                )}

                {activeTab === 'staff' && (
                  <tr>
                    <th>Staff Name</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Orders Handled</th>
                    <th style={{ textAlign: 'right' }}>Bills Generated</th>
                    <th style={{ textAlign: 'right' }}>Sales Amount</th>
                    <th style={{ textAlign: 'right' }}>Cancelled Orders</th>
                  </tr>
                )}

                {activeTab === 'tax' && (
                  <tr>
                    <th>S.No</th>
                    <th>Date & Time</th>
                    <th>Order ID</th>
                    <th>Invoice ID</th>
                    <th>Branch</th>
                    <th>Table</th>
                    <th style={{ textAlign: 'right' }}>Taxable Amount</th>
                    <th style={{ textAlign: 'right' }}>Tax Amount</th>
                    <th style={{ textAlign: 'right' }}>Total Amount</th>
                    <th>Payment Method</th>
                    <th>Payment Status</th>
                    <th>Order Status</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {activeTab === 'sales' && (
                  loadingSalesReport ? (
                    <tr>
                      <td colSpan={11} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Sales & Revenue report...
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((ord, idx) => {
                      const orderNo = ord.orderId || ord.id || ord.orderNo;
                      const date = ord.createdAt || ord.date;
                      const paymentMode = ord.paymentMethod || ord.paymentMode || 'N/A';
                      const gross = Number(ord.subtotal ?? ord.totalAmount ?? ord.grossAmount ?? 0);
                      const disc = Number(ord.discount ?? 0);
                      const tax = Number(ord.tax ?? 0);
                      const total = Number(ord.total ?? (gross - disc));

                      return (
                        <tr key={ord.id || ord._id || idx}>
                          <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                          <td>{formatDateTimeDMY(date)}</td>
                          <td><strong>#{orderNo}</strong></td>
                          <td>{toDisplayText(ord.table || ord.orderType, 'Dine-In')}</td>
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
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Dish Performance report...
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((item, idx) => {
                      const dishName = item.foodItem || item.name;
                      const cat = item.category || 'Uncategorized';
                      const qty = item.quantityPrepared ?? item.qtySold ?? 0;
                      const rev = item.revenueGenerated ?? item.grossSales ?? 0;
                      const prepTime = item.avgPrepTime || 'N/A';
                      const status = item.kitchenStatus || 'Completed';

                      return (
                        <tr key={item.menuId || idx}>
                          <td><strong>{dishName}</strong></td>
                          <td><span className="badge-type">{cat}</span></td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{qty} pcs</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{Number(rev).toLocaleString()}</td>
                          <td style={{ textAlign: 'center' }}>{prepTime}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge-status ${status.toLowerCase()}`}>
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )
                )}

                {activeTab === 'orders' && (
                  loadingOrderAnalyticsReport ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Order Analytics report...
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((ord, idx) => {
                      const orderNo = ord.orderId || ord.id || ord.orderNo;
                      const date = ord.createdAt || ord.date;
                      const itemsCount = (ord.items || []).length;
                      const subtotal = Number(ord.subtotal || 0);
                      const tax = Number(ord.tax || 0);
                      const total = Number(ord.total || ord.totalAmount || 0);
                      const paymentMethod = ord.paymentMethod || 'cash';
                      const billingStatus = ord.billingStatus || 'paid';
                      const status = ord.status || 'completed';

                      return (
                        <tr key={ord._id || ord.id || idx}>
                          <td><strong>#{orderNo}</strong></td>
                          <td>{formatDateTimeDMY(date)}</td>
                          <td>{toDisplayText(ord.table || ord.orderType, 'Dine-In')}</td>
                          <td>{itemsCount} items</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{total.toLocaleString()}</td>
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
                          <td><span className="badge-type">{paymentMethod}</span></td>
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

                {activeTab === 'inventory' && paginatedRecords.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.unit}</td>
                    <td style={{ textAlign: 'right' }}>{item.openingStock}</td>
                    <td style={{ textAlign: 'right', color: '#15803d' }}>+{item.purchased}</td>
                    <td style={{ textAlign: 'right', color: '#b91c1c' }}>-{item.used}</td>
                    <td style={{ textAlign: 'right', color: '#b45309' }}>{item.wastage}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{item.closingStock}</td>
                    <td style={{ textAlign: 'right' }}>{item.minStock}</td>
                    <td>
                      <span className={`badge-status ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {activeTab === 'staff' && (
                  loadingStaffReport ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Staff Performance report...
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((s, idx) => (
                      <tr key={idx}>
                        <td><strong>{s.waiterName || s.name || s.staffName || 'Staff Member'}</strong></td>
                        <td><span className="badge-type">{s.role || 'Waiter'}</span></td>
                        <td style={{ textAlign: 'right' }}>{s.ordersServed ?? s.ordersHandled ?? 0}</td>
                        <td style={{ textAlign: 'right' }}>{s.billsGenerated ?? s.ordersServed ?? 0}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{Number(s.revenue ?? s.salesAmount ?? 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'right', color: '#b91c1c' }}>{s.cancelledOrders ?? 0}</td>
                      </tr>
                    ))
                  )
                )}


                {activeTab === 'tax' && (
                  loadingTaxReport ? (
                    <tr>
                      <td colSpan={12} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Loading Tax & Payment Settlement report...
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((item, idx) => {
                      const isApiRecord = Boolean(item.orderId || item.invoiceId || item.createdAt);
                      if (isApiRecord) {
                        return (
                          <tr key={item.id || item._id || idx}>
                            <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                            <td>{formatDateTimeDMY(item.createdAt)}</td>
                            <td><strong>#{item.orderId || item.id}</strong></td>
                            <td>{item.invoiceId || 'N/A'}</td>
                            <td>{item.branchName || 'Main Branch'}</td>
                            <td>{item.tableNumber || 'N/A'}</td>
                            <td style={{ textAlign: 'right' }}>₹{Number(item.taxableAmount || 0).toLocaleString()}</td>
                            <td style={{ textAlign: 'right', color: '#15803d' }}>₹{Number(item.taxAmount || 0).toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{Number(item.totalAmount || 0).toLocaleString()}</td>
                            <td><span className="badge-type">{item.paymentMethod || 'N/A'}</span></td>
                            <td>
                              <span className={`badge-status ${(item.paymentStatus || 'pending').toLowerCase()}`}>
                                {item.paymentStatus || 'Pending'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge-status ${(item.orderStatus || 'new').toLowerCase()}`}>
                                {item.orderStatus || 'New'}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={idx}>
                          <td>{(currentPage - 1) * pageSize + idx + 1}</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td>-</td>
                          <td style={{ textAlign: 'right' }}>₹{Number(item.collected - item.refund || 0).toLocaleString()}</td>
                          <td style={{ textAlign: 'right' }}>₹0</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>₹{Number(item.collected || 0).toLocaleString()}</td>
                          <td><span className="badge-type">{item.method}</span></td>
                          <td><span className="badge-status paid">Paid</span></td>
                          <td><span className="badge-status completed">Completed</span></td>
                        </tr>
                      );
                    })
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION BAR */}
        {totalRecordsCount > 0 && (
          <div className="reports-pagination-bar">
            <div className="pagination-info">
              Showing <strong>{Math.min((currentPage - 1) * pageSize + 1, totalRecordsCount)}</strong> to <strong>{Math.min(currentPage * pageSize, totalRecordsCount)}</strong> of <strong>{totalRecordsCount}</strong> records
            </div>

            <div className="pagination-controls">
              <div className="page-size-selector">
                <span>Rows per page:</span>
                <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
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
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Prev
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i;
                    if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      className={`btn-page-nav ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  className="btn-page-nav"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECONDARY SECTION FOR TAX REPORT: TAX TYPE BREAKDOWN TABLE */}
      {activeTab === 'tax' && (
        <div className="reports-table-card" style={{ marginTop: '24px' }}>
          <div className="reports-table-header-bar">
            <div className="reports-table-title">
              <span>GST & Tax Breakdown</span>
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
                {taxReportData.taxRows.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.type}</strong></td>
                    <td><span className="badge-type">{r.rate}</span></td>
                    <td style={{ textAlign: 'right' }}>₹{r.taxable.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>₹{r.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECONDARY SECTION FOR INVENTORY REPORT: LOW STOCK REORDER ALERT TABLE */}
      {activeTab === 'inventory' && inventoryReportData.lowStockList.length > 0 && (
        <div className="reports-table-card" style={{ marginTop: '24px' }}>
          <div className="reports-table-header-bar" style={{ background: '#fff7ed' }}>
            <div className="reports-table-title" style={{ color: '#c2410c' }}>
              <AlertTriangleIcon size={18} color="#c2410c" />
              <span>Low Stock Alerts & Reorder List</span>
            </div>
            <span className="reports-record-badge" style={{ background: '#ffedd5', color: '#c2410c' }}>
              {inventoryReportData.lowStockList.length} Items Require Action
            </span>
          </div>
          <div className="reports-table-container">
            <table>
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th style={{ textAlign: 'right' }}>Current Stock</th>
                  <th style={{ textAlign: 'right' }}>Minimum Stock</th>
                  <th>Unit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReportData.lowStockList.map((item, i) => (
                  <tr key={i}>
                    <td><strong>{item.name}</strong></td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: item.closingStock <= 0 ? '#b91c1c' : '#b45309' }}>{item.closingStock}</td>
                    <td style={{ textAlign: 'right' }}>{item.minStock}</td>
                    <td>{item.unit}</td>
                    <td>
                      <span className={`badge-status ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL */}
      {viewOrder && (
        <Modal
          isOpen={!!viewOrder}
          onClose={() => setViewOrder(null)}
          title={`Order Details #${viewOrder.id || viewOrder.orderNo}`}
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
