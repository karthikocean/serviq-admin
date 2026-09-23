import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import * as XLSX from 'xlsx';
import '../pages/Reports/Reports.css';

// SVG Icons
const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
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

const UserIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChefIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
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

import ReportsApi from '../api/Reports';
import OrderApi from '../api/Order.js';
import BillingApi from '../api/Billing.js';
import UserApi from '../api/User.js';
import TableApi from '../api/Table.js';
import MenuApi from '../api/Menu.js';
import SearchableSelect from './SearchableSelect.jsx';
import ShowNotifications from '../helper/ShowNotifications.js';
import { formatDateDMY, formatDateTimeDMY, extractOrderISODate } from '../helper/DateHelper.js';

// Safe text extractor to avoid React child object errors
const toDisplayText = (val, fallback = '') => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    return val.name || val.categoryName || val.title || val.tableNumber || val.tableNo || val.label || fallback;
  }
  return String(val);
};

// Safe helper to extract records array from any server response shape
const extractServerList = (res) => {
  if (!res) return null;
  const payload = res.response || res.data || res;
  if (!payload || typeof payload !== 'object') return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.reports)) return payload.reports;
  if (Array.isArray(payload.kitchenReports)) return payload.kitchenReports;
  if (Array.isArray(payload.waiterReports)) return payload.waiterReports;
  if (Array.isArray(payload.dishes)) return payload.dishes;
  if (Array.isArray(payload.waiters)) return payload.waiters;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.orders)) return payload.orders;
  if (Array.isArray(payload.bills)) return payload.bills;
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data?.reports)) return payload.data.reports;
  if (Array.isArray(payload.data?.kitchenReports)) return payload.data.kitchenReports;
  if (Array.isArray(payload.data?.waiterReports)) return payload.data.waiterReports;
  if (Array.isArray(payload.data?.dishes)) return payload.data.dishes;
  if (Array.isArray(payload.data?.waiters)) return payload.data.waiters;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.data?.orders)) return payload.data.orders;
  if (Array.isArray(payload.data?.bills)) return payload.data.bills;
  if (Array.isArray(payload.data?.records)) return payload.data.records;
  if (Array.isArray(payload.data?.rows)) return payload.data.rows;
  if (Array.isArray(payload.data?.results)) return payload.data.results;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
  return null;
};

// Safe helper to extract summary object from server response
const extractServerSummary = (res) => {
  if (!res) return null;
  const payload = res.response || res.data || res;
  if (!payload || typeof payload !== 'object') return null;
  if (payload.summary && typeof payload.summary === 'object') return payload.summary;
  if (payload.data?.summary && typeof payload.data.summary === 'object') return payload.data.summary;
  if (payload.reportSummary && typeof payload.reportSummary === 'object') return payload.reportSummary;
  if (payload.data?.reportSummary && typeof payload.data.reportSummary === 'object') return payload.data.reportSummary;
  return null;
};

// Safe helper to extract pagination metadata from server response
const extractServerPagination = (res) => {
  if (!res) return null;
  const payload = res.response || res.data || res;
  if (!payload || typeof payload !== 'object') return null;
  const p = payload.pagination || payload.data?.pagination || payload.meta || payload.data?.meta;
  const totalItems = Number(
    p?.totalItems ?? p?.total ?? p?.totalRecords ?? p?.count ??
    payload.totalItems ?? payload.total ?? payload.totalCount ?? payload.count ??
    payload.data?.totalItems ?? payload.data?.total ?? payload.data?.totalCount ?? payload.data?.count
  );
  const totalPages = Number(
    p?.totalPages ?? p?.pages ?? payload.totalPages ?? payload.pages ?? payload.data?.totalPages
  );
  if (!isNaN(totalItems) && totalItems >= 0) {
    return {
      totalItems,
      totalPages: (!isNaN(totalPages) && totalPages > 0) ? totalPages : Math.ceil(totalItems / 10) || 1
    };
  }
  return null;
};

// Safe helper to extract items from any order shape
const extractOrderItems = (order) => {
  if (!order) return [];
  if (Array.isArray(order.items) && order.items.length > 0) return order.items;
  if (Array.isArray(order.orderItems) && order.orderItems.length > 0) return order.orderItems;
  if (Array.isArray(order.order_items) && order.order_items.length > 0) return order.order_items;
  if (typeof order.items === 'string' && order.items.trim()) {
    try {
      const parsed = JSON.parse(order.items);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      return order.items.split(',').map(name => ({ name: name.trim(), quantity: 1 }));
    }
  }
  return [];
};

// Helper: Safe extractor for branch IDs and names
const extractBranchIdentifiers = (val) => {
  if (!val) return [];
  const ids = [];
  if (typeof val === 'string' || typeof val === 'number') {
    const s = String(val).trim();
    if (s && s !== 'null' && s !== 'undefined') ids.push(s, s.toLowerCase());
  } else if (typeof val === 'object' && val !== null) {
    if (val._id) ids.push(String(val._id).trim(), String(val._id).trim().toLowerCase());
    if (val.id) ids.push(String(val.id).trim(), String(val.id).trim().toLowerCase());
    if (val.branchId) ids.push(String(val.branchId).trim(), String(val.branchId).trim().toLowerCase());
    if (val.branchCode || val.code) ids.push(String(val.branchCode || val.code).trim(), String(val.branchCode || val.code).trim().toLowerCase());
    if (val.branchName || val.name) ids.push(String(val.branchName || val.name).trim(), String(val.branchName || val.name).trim().toLowerCase());
    if (val.city) ids.push(String(val.city).trim().toLowerCase());
  }
  return Array.from(new Set(ids.filter(Boolean)));
};

// Helper: Check if an entity belongs to a selected branch
const isEntityInBranch = (entity, targetBranchId, branchesList = []) => {
  if (!targetBranchId || targetBranchId === 'All' || targetBranchId === 'ALL' || String(targetBranchId).toLowerCase() === 'all branches') {
    return true; // All Branches scope
  }
  if (!entity) return false;
  if (entity.isServerReport === true) return true;

  // 1. Resolve all target branch identifiers (IDs, codes, names)
  const targetIdStr = String(targetBranchId).trim().toLowerCase();
  const targetKeys = new Set([targetIdStr]);

  if (Array.isArray(branchesList) && branchesList.length > 0) {
    const matchedBranch = branchesList.find(b => {
      const bIds = extractBranchIdentifiers(b);
      return bIds.some(k => k.toLowerCase() === targetIdStr);
    });
    if (matchedBranch) {
      extractBranchIdentifiers(matchedBranch).forEach(k => targetKeys.add(k.toLowerCase()));
    }
  }

  // 2. Extract entity's branch identifiers
  const entityBranchCandidates = [
    entity.branchId,
    entity.branch,
    entity.branch_id,
    entity.outletId,
    entity.restaurantBranchId,
    entity.activeBranchId,
    entity.branchCode,
    entity.branchName,
    typeof entity.table === 'object' ? (entity.table?.branchId || entity.table?.branch) : null,
    typeof entity.tableId === 'object' ? (entity.tableId?.branchId || entity.tableId?.branch) : null
  ];

  if (Array.isArray(entity.branches)) {
    entity.branches.forEach(b => entityBranchCandidates.push(b));
  }
  if (Array.isArray(entity.branchIds)) {
    entity.branchIds.forEach(b => entityBranchCandidates.push(b));
  }

  const entityKeys = [];
  entityBranchCandidates.forEach(c => {
    if (c) {
      extractBranchIdentifiers(c).forEach(k => entityKeys.push(k.toLowerCase()));
    }
  });

  // If entity has explicitly defined branch keys, check for match
  if (entityKeys.length > 0) {
    return entityKeys.some(k => targetKeys.has(k));
  }

  return false;
};

// Helper: Safe extractor for order total amount
const getOrderTotalAmount = (order) => {
  if (!order) return 0;
  const candidates = [
    order.total,
    order.totalAmount,
    order.grandTotal,
    order.billAmount,
    order.finalAmount,
    order.netAmount,
    order.amount,
    order.totalPrice,
    order.bill?.total,
    order.bill?.grandTotal,
    order.payment?.amount
  ];
  for (const c of candidates) {
    if (typeof c === 'number' && !isNaN(c) && c > 0) return c;
    if (typeof c === 'string') {
      const parsed = parseFloat(c.replace(/[^0-9.]/g, ''));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  // Fallback: sum item totals
  const items = extractOrderItems(order);
  if (items.length > 0) {
    const sum = items.reduce((acc, it) => {
      const q = Number(it.quantity || it.qty || 1) || 1;
      const p = Number(it.price || it.rate || it.itemPrice || 0) || 0;
      return acc + (q * p);
    }, 0);
    if (sum > 0) return sum;
  }
  return 0;
};

// Helper: Resolve Category Name from ID or Object
const resolveCategoryName = (catVal, categoriesList = []) => {
  if (!catVal) return 'Main Course';
  if (typeof catVal === 'object' && catVal !== null) {
    return catVal.name || catVal.categoryName || catVal.title || 'Main Course';
  }
  const str = String(catVal).trim();
  if (!str || str === 'null' || str === 'undefined' || str === 'Uncategorized') return 'Main Course';
  
  if (Array.isArray(categoriesList) && categoriesList.length > 0) {
    const found = categoriesList.find(c => {
      const cId = String(c._id || c.id || '').trim();
      const cName = String(c.name || c.categoryName || c.title || '').trim();
      return cId.toLowerCase() === str.toLowerCase() || cName.toLowerCase() === str.toLowerCase();
    });
    if (found) {
      return found.name || found.categoryName || found.title || str;
    }
  }
  return str;
};

// Helper: Resolve if a staff member is a waiter
const isStaffWaiter = (s, rolesList = []) => {
  if (!s) return false;
  let roleStr = '';
  if (typeof s.roleId === 'object' && s.roleId !== null) {
    roleStr = String(s.roleId.roleName || s.roleId.name || '').toLowerCase();
  } else if (typeof s.role === 'object' && s.role !== null) {
    roleStr = String(s.role.roleName || s.role.name || '').toLowerCase();
  } else if (typeof s.role === 'string' && s.role) {
    roleStr = s.role.toLowerCase();
  } else if (s.roleName) {
    roleStr = String(s.roleName).toLowerCase();
  } else if (s.designation) {
    roleStr = String(s.designation).toLowerCase();
  } else if (typeof s.roleId === 'string' && s.roleId && Array.isArray(rolesList)) {
    const found = rolesList.find(r => r._id === s.roleId || r.id === s.roleId);
    if (found) roleStr = String(found.roleName || found.name || '').toLowerCase();
  }

  if (roleStr.includes('waiter') || roleStr.includes('server') || roleStr.includes('steward') || roleStr.includes('captain')) {
    return true;
  }

  const uType = String(s.userType || '').toUpperCase();
  if ((uType === 'STAFF' || uType === 'EMPLOYEE' || !uType) && 
      !roleStr.includes('kitchen') && !roleStr.includes('chef') && 
      !roleStr.includes('manager') && !roleStr.includes('admin') && 
      !roleStr.includes('owner')) {
    if (s.assignedTables || s.assignedTablesList || (Array.isArray(s.tables) && s.tables.length > 0)) return true;
    if (!roleStr) return true;
  }
  return false;
};

// =======================================================================
// CALCULATION ENGINES FOR ALL 6 ADMIN REPORT MODULES
// =======================================================================

// 1. SALES & REVENUE CALCULATION ENGINE
const computeSalesReports = (ordersList = [], filters = {}, branchesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, filterPaymentMode = 'All', searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  // Strict branch and date filtering
  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const ordDate = extractOrderISODate(o);
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  const formattedRows = filteredOrders.map((o, idx) => {
    const orderId = toDisplayText(o.orderNumber || o.orderId || o.billNumber || (o._id ? `ORD-${String(o._id).slice(-6).toUpperCase()}` : `ORD-${idx + 101}`));
    const rawDate = extractOrderISODate(o) || (o.createdAt ? o.createdAt.split('T')[0] : '');
    const timeStr = o.time || o.orderTime || (o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '12:30 PM');
    const rawTotal = getOrderTotalAmount(o);
    const discount = Number(o.discount || o.discountAmount || o.discountVal || o.bill?.discount || 0);
    const isCancelled = ['cancelled', 'rejected', 'void', 'failed'].includes(String(o.status || '').toLowerCase());

    let tax = Number(o.tax || o.taxAmount || o.gst || o.totalTax || o.bill?.tax || 0);
    if (!tax && !isCancelled && rawTotal > 0) {
      tax = Math.round((rawTotal - (rawTotal / 1.05)) * 100) / 100;
    }
    const netAmount = isCancelled ? 0 : Math.max(0, Math.round((rawTotal - tax - discount) * 100) / 100);

    const rawPayment = o.paymentMode || o.paymentMethod || o.billing?.paymentMethod || o.payment?.mode || (o.billingStatus === 'paid' ? 'UPI' : 'Cash');
    let paymentMode = 'Cash';
    if (/upi|gpay|phonepe|paytm|qr/i.test(rawPayment)) paymentMode = 'UPI';
    else if (/card|credit|debit|pos/i.test(rawPayment)) paymentMode = 'Card';
    else if (/cash/i.test(rawPayment)) paymentMode = 'Cash';
    else paymentMode = toDisplayText(rawPayment, 'Cash');

    const orderType = toDisplayText(o.orderType || o.diningType || (o.table || o.tableNumber || o.tableNo ? 'Dine-In' : 'Takeaway'), 'Dine-In');
    const rawTable = o.tableNumber || o.tableNo || (typeof o.table === 'object' ? (o.table?.tableNumber || o.table?.name) : o.table) || (typeof o.tableId === 'object' ? (o.tableId?.tableNumber || o.tableId?.name) : o.tableId);
    const tableDisplay = rawTable ? `Table ${String(rawTable).replace(/^Table\s*/i, '')}` : (orderType || 'Takeaway');
    const customer = toDisplayText(o.customer?.name || o.customerName || (typeof o.customer === 'string' ? o.customer : '') || 'Guest');
    const items = extractOrderItems(o);
    const itemsCount = items.reduce((acc, it) => acc + (Number(it.quantity || it.qty || 1) || 1), 0) || (items.length > 0 ? items.length : 1);

    return {
      id: orderId,
      _id: o._id || o.id || orderId,
      orderNumber: orderId,
      date: rawDate,
      time: timeStr,
      formattedDateTime: rawDate ? `${formatDateDMY(rawDate)}, ${timeStr}` : timeStr,
      customer,
      table: tableDisplay,
      orderType,
      itemsCount,
      items,
      paymentMode,
      grossAmount: rawTotal,
      discount,
      tax,
      netAmount,
      status: toDisplayText(o.status || 'Completed', 'Completed'),
      isCancelled,
      rawOrder: o
    };
  });

  // Filter by Payment Mode
  let data = formattedRows;
  if (filterPaymentMode && filterPaymentMode !== 'All' && filterPaymentMode !== 'ALL') {
    data = data.filter(r => r.paymentMode.toLowerCase() === filterPaymentMode.toLowerCase());
  }

  // Filter by Search Query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    data = data.filter(r =>
      r.orderNumber.toLowerCase().includes(q) ||
      r.customer.toLowerCase().includes(q) ||
      r.table.toLowerCase().includes(q) ||
      r.paymentMode.toLowerCase().includes(q) ||
      r.orderType.toLowerCase().includes(q)
    );
  }

  // Aggregate Executive Sales KPIs
  const nonCancelledRows = data.filter(r => !r.isCancelled);
  const grossSales = nonCancelledRows.reduce((acc, r) => acc + r.grossAmount, 0);
  const netSales = nonCancelledRows.reduce((acc, r) => acc + r.netAmount, 0);
  const totalDiscounts = nonCancelledRows.reduce((acc, r) => acc + r.discount, 0);
  const totalTaxes = nonCancelledRows.reduce((acc, r) => acc + r.tax, 0);
  const averageOrderValue = nonCancelledRows.length > 0 ? (grossSales / nonCancelledRows.length).toFixed(2) : '0.00';
  const totalTransactions = data.length;

  // Payment Breakdown
  const cashSales = nonCancelledRows.filter(r => r.paymentMode === 'Cash').reduce((a, b) => a + b.grossAmount, 0);
  const upiSales = nonCancelledRows.filter(r => r.paymentMode === 'UPI').reduce((a, b) => a + b.grossAmount, 0);
  const cardSales = nonCancelledRows.filter(r => r.paymentMode === 'Card').reduce((a, b) => a + b.grossAmount, 0);

  // Dining Type Breakdown
  const dineInCount = nonCancelledRows.filter(r => r.orderType === 'Dine-In').length;
  const takeawayCount = nonCancelledRows.filter(r => r.orderType !== 'Dine-In').length;

  const summary = {
    grossSales,
    netSales,
    totalDiscounts,
    totalTaxes,
    averageOrderValue,
    totalTransactions,
    paymentBreakdown: {
      cash: cashSales,
      upi: upiSales,
      card: cardSales
    },
    diningBreakdown: {
      dineIn: dineInCount,
      takeaway: takeawayCount
    }
  };

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)));
  const paginatedData = data.slice(safePage * limit, (safePage + 1) * limit);

  return {
    data: paginatedData,
    summary,
    totalPages,
    totalItems
  };
};

// 2. ITEM & CATEGORY PERFORMANCE ENGINE
const computeItemReports = (ordersList = [], menuList = [], categoriesList = [], filters = {}, branchesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, filterCategory = 'All', searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const isCancelled = ['cancelled', 'rejected', 'void', 'failed'].includes(String(o.status || '').toLowerCase());
    if (isCancelled) return false;
    const ordDate = extractOrderISODate(o);
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  const itemMap = new Map();

  // 1. Seed from branch menu list
  (menuList || []).forEach(m => {
    if (isBranchFiltered && !m.isServerReport && !isEntityInBranch(m, selectedBranchId, branchesList)) return;
    const name = toDisplayText(m.name || m.dishName || m.itemName || m.foodItem, '').trim();
    if (!name || name.toLowerCase() === 'food item') return;
    const nameLower = name.toLowerCase();
    const cat = resolveCategoryName(m.category || m.categoryName, categoriesList) || 'Main Course';
    const price = Number(m.price || m.rate || 0);

    itemMap.set(nameLower, {
      id: m._id || m.id || nameLower,
      name,
      category: cat,
      price,
      quantitySold: 0,
      totalRevenue: 0
    });
  });

  // 2. Aggregate sales from filtered orders
  filteredOrders.forEach(o => {
    const items = extractOrderItems(o);
    items.forEach(it => {
      const name = toDisplayText(it.name || it.menuItem?.name || it.dishName || it.foodItem, '').trim();
      if (!name || name.toLowerCase() === 'food item') return;
      const nameLower = name.toLowerCase();
      const qty = Number(it.quantity || it.qty || 1) || 1;
      const price = Number(it.price || it.rate || it.itemPrice || 0);

      if (!itemMap.has(nameLower)) {
        const rawCat = it.category || it.categoryName || it.menuItem?.category;
        const cat = resolveCategoryName(rawCat, categoriesList) || 'Main Course';
        itemMap.set(nameLower, {
          id: it._id || it.id || nameLower,
          name,
          category: cat,
          price: price || 0,
          quantitySold: qty,
          totalRevenue: (price * qty)
        });
      } else {
        const entry = itemMap.get(nameLower);
        entry.quantitySold += qty;
        const finalPrice = entry.price > 0 ? entry.price : price;
        entry.price = finalPrice;
        entry.totalRevenue += (finalPrice * qty);
      }
    });
  });

  let items = Array.from(itemMap.values());
  const soldItems = items.filter(it => it.quantitySold > 0);
  let activePool = soldItems.length > 0 ? soldItems : items;

  // Filter by Category
  if (filterCategory && filterCategory !== 'All' && filterCategory !== 'ALL') {
    const targetCat = String(filterCategory).trim().toLowerCase();
    activePool = activePool.filter(d => (d.category || '').toLowerCase() === targetCat);
  }

  // Filter by Search Query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    activePool = activePool.filter(d => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
  }

  // Sort by quantity sold descending
  activePool.sort((a, b) => b.quantitySold - a.quantitySold || b.totalRevenue - a.totalRevenue);

  const totalItemsSold = activePool.reduce((acc, it) => acc + it.quantitySold, 0);
  const totalItemRevenue = activePool.reduce((acc, it) => acc + it.totalRevenue, 0);

  // Compute contribution % and demand tag
  activePool = activePool.map((it, idx) => {
    const contributionPct = totalItemRevenue > 0 ? ((it.totalRevenue / totalItemRevenue) * 100).toFixed(1) : '0.0';
    let demandStatus = 'Regular';
    if (it.quantitySold >= 10 || idx < 3) demandStatus = 'Best Seller';
    else if (it.quantitySold >= 5) demandStatus = 'Popular';
    else if (it.quantitySold === 0) demandStatus = 'Low Demand';

    return {
      ...it,
      contributionPct,
      demandStatus
    };
  });

  // Category Breakdown
  const catRevMap = new Map();
  activePool.forEach(it => {
    const cat = it.category || 'Main Course';
    const cur = catRevMap.get(cat) || { category: cat, revenue: 0, qty: 0 };
    cur.revenue += it.totalRevenue;
    cur.qty += it.quantitySold;
    catRevMap.set(cat, cur);
  });
  const categoryBreakdown = Array.from(catRevMap.values()).sort((a, b) => b.revenue - a.revenue);

  const summary = {
    totalItemsSold,
    totalItemRevenue,
    topSellingItem: activePool[0]?.name || 'N/A',
    topCategory: categoryBreakdown[0]?.category || 'Main Course',
    totalMenuItems: activePool.length,
    categoryBreakdown
  };

  const totalItems = activePool.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)));
  const paginatedData = activePool.slice(safePage * limit, (safePage + 1) * limit);

  return {
    data: paginatedData,
    summary,
    totalPages,
    totalItems,
    categoryBreakdown
  };
};

// 3. ORDER & DINING ANALYTICS ENGINE
const computeOrderAnalytics = (ordersList = [], filters = {}, branchesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const ordDate = extractOrderISODate(o);
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  const hourHistogram = {};
  filteredOrders.forEach(o => {
    let hour = 12;
    if (o.createdAt) {
      const d = new Date(o.createdAt);
      if (!isNaN(d.getTime())) hour = d.getHours();
    } else if (o.time) {
      const match = String(o.time).match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const ampm = (match[3] || '').toUpperCase();
        if (ampm === 'PM' && h < 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        hour = h;
      }
    }
    hourHistogram[hour] = (hourHistogram[hour] || 0) + 1;
  });

  let peakHourNum = 13;
  let peakHourMax = 0;
  Object.keys(hourHistogram).forEach(h => {
    if (hourHistogram[h] > peakHourMax) {
      peakHourMax = hourHistogram[h];
      peakHourNum = parseInt(h, 10);
    }
  });

  const formatHourWindow = (h) => {
    const startPeriod = h >= 12 ? 'PM' : 'AM';
    const startH = h % 12 === 0 ? 12 : h % 12;
    const nextH = (h + 1) % 24;
    const endPeriod = nextH >= 12 ? 'PM' : 'AM';
    const endH = nextH % 12 === 0 ? 12 : nextH % 12;
    return `${String(startH).padStart(2, '0')}:00 ${startPeriod} – ${String(endH).padStart(2, '0')}:00 ${endPeriod}`;
  };

  const peakHourWindow = formatHourWindow(peakHourNum);
  const peakHourStr = peakHourWindow;

  const rows = filteredOrders.map((o, idx) => {
    const orderId = toDisplayText(o.orderNumber || o.orderId || o.billNumber || (o._id ? `ORD-${String(o._id).slice(-6).toUpperCase()}` : `ORD-${idx + 101}`));
    const rawDate = extractOrderISODate(o) || (o.createdAt ? o.createdAt.split('T')[0] : '');
    const timeStr = o.time || o.orderTime || (o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '12:30 PM');
    const orderType = toDisplayText(o.orderType || o.diningType || (o.table || o.tableNumber || o.tableNo ? 'Dine-In' : 'Takeaway'), 'Dine-In');
    const rawTable = o.tableNumber || o.tableNo || (typeof o.table === 'object' ? (o.table?.tableNumber || o.table?.name) : o.table) || (typeof o.tableId === 'object' ? (o.tableId?.tableNumber || o.tableId?.name) : o.tableId);
    const tableDisplay = rawTable ? `Table ${String(rawTable).replace(/^Table\s*/i, '')}` : orderType;
    const totalAmount = getOrderTotalAmount(o);
    const status = toDisplayText(o.status || 'Completed', 'Completed');
    const isCancelled = ['cancelled', 'rejected', 'void', 'failed'].includes(status.toLowerCase());
    const items = extractOrderItems(o);
    const itemsSummary = items.length > 0 ? items.map(it => `${it.quantity || it.qty || 1}x ${toDisplayText(it.name)}`).join(', ') : 'Food Order';

    return {
      id: orderId,
      _id: o._id || o.id || orderId,
      orderNumber: orderId,
      dateTime: rawDate ? `${formatDateDMY(rawDate)}, ${timeStr}` : timeStr,
      diningType: tableDisplay,
      orderType,
      itemsSummary,
      items,
      totalAmount,
      status,
      isCancelled,
      paymentStatus: toDisplayText(o.billingStatus || o.paymentStatus || (isCancelled ? 'Cancelled' : 'Paid'), 'Paid'),
      rawOrder: o
    };
  });

  let data = rows;
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    data = data.filter(r =>
      r.orderNumber.toLowerCase().includes(q) ||
      r.diningType.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      r.itemsSummary.toLowerCase().includes(q)
    );
  }

  const totalOrders = filteredOrders.length;
  const completedOrders = filteredOrders.filter(o => !['cancelled', 'rejected', 'void', 'failed'].includes(String(o.status || '').toLowerCase())).length;
  const cancelledOrders = filteredOrders.filter(o => ['cancelled', 'rejected', 'void', 'failed'].includes(String(o.status || '').toLowerCase())).length;
  const completionRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '100.0';
  const cancellationRate = totalOrders > 0 ? ((cancelledOrders / totalOrders) * 100).toFixed(1) : '0.0';
  const lostRevenue = filteredOrders
    .filter(o => ['cancelled', 'rejected', 'void', 'failed'].includes(String(o.status || '').toLowerCase()))
    .reduce((acc, o) => acc + getOrderTotalAmount(o), 0);

  const dineInCount = filteredOrders.filter(o => (o.table || o.tableNumber || o.tableNo || String(o.orderType).toLowerCase() === 'dine-in')).length;
  const takeawayCount = totalOrders - dineInCount;

  const summary = {
    totalOrders,
    completedOrders,
    cancelledOrders,
    completionRate,
    cancellationRate,
    lostRevenue,
    peakHour: peakHourStr,
    peakHourWindow,
    peakOrdersCount: peakHourMax,
    dineInCount,
    takeawayCount
  };

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)));
  const paginatedData = data.slice(safePage * limit, (safePage + 1) * limit);

  return {
    data: paginatedData,
    summary,
    totalPages,
    totalItems
  };
};

// 4. WAITER PERFORMANCE REPORT ENGINE (Preserved & Enhanced)
const computeWaiterReports = (ordersList = [], staffList = [], tablesList = [], filters = {}, branchesList = [], rolesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const ordDate = extractOrderISODate(o);
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  const branchStaff = isBranchFiltered 
    ? (staffList || []).filter(s => isEntityInBranch(s, selectedBranchId, branchesList))
    : (staffList || []);

  const branchTables = isBranchFiltered
    ? (tablesList || []).filter(t => isEntityInBranch(t, selectedBranchId, branchesList))
    : (tablesList || []);

  const waiterRoleStaff = branchStaff.filter(s => isStaffWaiter(s, rolesList));

  const waiterMap = new Map();
  waiterRoleStaff.forEach(s => {
    const sId = String(s._id || s.id || s.userId || s.email || s.name || '').toLowerCase();
    if (sId) waiterMap.set(sId, s);
  });

  branchTables.forEach(t => {
    const aw = t.assignedWaiter || t.waiter || t.waiterId || t.assignedWaiterId;
    if (aw) {
      const awId = String(typeof aw === 'object' ? (aw._id || aw.id) : aw).toLowerCase();
      const awName = String(typeof aw === 'object' ? (aw.name || aw.userName || aw.fullName) : aw).toLowerCase();
      const matched = branchStaff.find(s => {
        const sid = String(s._id || s.id || '').toLowerCase();
        const sname = String(s.name || s.userName || s.fullName || '').toLowerCase();
        return (awId && (sid === awId || sid.includes(awId) || awId.includes(sid))) ||
               (awName && (sname === awName || sname.includes(awName) || awName.includes(sname)));
      });
      if (matched) {
        const mId = String(matched._id || matched.id || matched.email || matched.name || '').toLowerCase();
        if (mId && !waiterMap.has(mId)) waiterMap.set(mId, matched);
      }
    }
  });

  filteredOrders.forEach((o, i) => {
    let orderWaiterName = '';
    let orderWaiterId = '';
    if (typeof o.waiter === 'string' && o.waiter.trim()) orderWaiterName = o.waiter.trim();
    else if (typeof o.waiter === 'object' && o.waiter?.name) {
      orderWaiterName = o.waiter.name.trim();
      orderWaiterId = String(o.waiter._id || o.waiter.id || '');
    }
    else if (o.waiterName) orderWaiterName = String(o.waiterName).trim();
    else if (o.server) orderWaiterName = typeof o.server === 'object' ? (o.server.name || '') : String(o.server).trim();
    else if (o.staff) orderWaiterName = typeof o.staff === 'object' ? (o.staff.name || '') : String(o.staff).trim();

    if (orderWaiterName || orderWaiterId) {
      const matched = branchStaff.find(s => {
        const sid = String(s._id || s.id || '').toLowerCase();
        const sname = String(s.name || s.userName || s.fullName || '').toLowerCase();
        return (orderWaiterId && sid === orderWaiterId.toLowerCase()) || (orderWaiterName && sname === orderWaiterName.toLowerCase());
      });
      if (matched) {
        const mId = String(matched._id || matched.id || matched.email || matched.name || '').toLowerCase();
        if (mId && !waiterMap.has(mId)) waiterMap.set(mId, matched);
      } else if (orderWaiterName) {
        const key = orderWaiterName.toLowerCase();
        if (!waiterMap.has(key)) {
          waiterMap.set(key, {
            id: `waiter-order-${i + 1}`,
            _id: `waiter-order-${i + 1}`,
            name: orderWaiterName,
            email: `${orderWaiterName.toLowerCase().replace(/\s+/g, '.')}@serviq.in`,
            phone: '',
            status: 'Active',
            dutyStatus: 'ON_DUTY',
            branchId: selectedBranchId
          });
        }
      }
    }
  });

  let waiters = Array.from(waiterMap.values());

  const waiterRows = waiters.map((w, wIdx) => {
    const wId = String(w.id || w._id || '').toLowerCase();
    const wName = String(w.name || w.userName || w.fullName || `Waiter ${wIdx + 1}`).trim();
    const wNameLower = wName.toLowerCase();
    const wEmailLower = String(w.email || '').toLowerCase();

    const profileTables = Array.isArray(w.assignedTablesList) 
      ? w.assignedTablesList.map(t => String(toDisplayText(t)).replace(/^table\s*/i, '').toLowerCase())
      : (Array.isArray(w.tables) ? w.tables.map(t => String(toDisplayText(t)).replace(/^table\s*/i, '').toLowerCase()) : []);

    const assignedOrders = filteredOrders.filter(o => {
      const ordWaiterObj = o.waiter;
      let ordWaiterName = '';
      let ordWaiterId = '';

      if (typeof ordWaiterObj === 'string') {
        ordWaiterName = ordWaiterObj.toLowerCase();
      } else if (typeof ordWaiterObj === 'object' && ordWaiterObj !== null) {
        ordWaiterName = String(ordWaiterObj.name || ordWaiterObj.userName || ordWaiterObj.fullName || '').toLowerCase();
        ordWaiterId = String(ordWaiterObj._id || ordWaiterObj.id || '').toLowerCase();
      }

      const ordDirectName = String(o.waiterName || o.server || o.serverName || o.assignedStaff || o.staff || o.servedBy || o.takenBy || o.createdBy || o.steward || o.captain || (typeof o.staff === 'object' ? (o.staff?.name || o.staff?.userName) : '') || '').toLowerCase();
      const ordDirectId = String(o.waiterId || o.userId || o.staffId || o.serverId || (typeof o.staff === 'object' ? (o.staff?._id || o.staff?.id) : '') || '').toLowerCase();

      if (ordWaiterId && wId && (ordWaiterId === wId || ordWaiterId.includes(wId) || wId.includes(ordWaiterId))) return true;
      if (ordDirectId && wId && (ordDirectId === wId || ordDirectId.includes(wId) || wId.includes(ordDirectId))) return true;
      if (ordWaiterName && (ordWaiterName.includes(wNameLower) || wNameLower.includes(ordWaiterName))) return true;
      if (ordDirectName && (ordDirectName.includes(wNameLower) || wNameLower.includes(ordDirectName))) return true;
      if (wEmailLower && String(o.email || o.waiterEmail || '').toLowerCase() === wEmailLower) return true;

      const rawTable = o.tableNumber || o.tableNo || (typeof o.table === 'object' ? (o.table?.tableNumber || o.table?.name || o.table?.tableNo) : o.table) || (typeof o.tableId === 'object' ? (o.tableId?.tableNumber || o.tableId?.name) : o.tableId);
      const orderTable = String(rawTable || '').replace(/^table\s*/i, '').trim().toLowerCase();
      if (orderTable && profileTables.includes(orderTable)) return true;

      return false;
    });

    const finalOrdersServed = Number(w.ordersServed || w.totalOrders || assignedOrders.length || 0);
    const calculatedRevenue = assignedOrders.reduce((acc, o) => acc + getOrderTotalAmount(o), 0);
    const finalTotalRevenue = Number(w.totalRevenue || w.revenue || calculatedRevenue || 0);
    const finalAov = finalOrdersServed > 0 ? (finalTotalRevenue / finalOrdersServed).toFixed(2) : (w.averageOrderValue || '0.00');

    const assignedTablesSet = new Set();
    profileTables.forEach(t => { if (t) assignedTablesSet.add(`Table ${t}`); });
    assignedOrders.forEach(o => {
      const rawT = o.tableNumber || o.tableNo || (typeof o.table === 'object' ? (o.table?.tableNumber || o.table?.name) : o.table);
      if (rawT) assignedTablesSet.add(`Table ${String(rawT).replace(/^Table\s*/i, '')}`);
    });
    const assignedTables = Array.from(assignedTablesSet);

    const isDutyActive = String(w.dutyStatus || w.status || 'Active').toLowerCase().includes('on') ||
      String(w.dutyStatus || w.status || 'Active').toLowerCase() === 'active';

    return {
      id: w.id || w._id || wId || `w-${wIdx}`,
      name: wName,
      phone: w.phone || w.mobileNumber || '',
      email: w.email || '',
      dutyStatus: isDutyActive ? 'ON_DUTY' : 'OFF_DUTY',
      assignedTablesList: assignedTables,
      ordersServed: finalOrdersServed,
      totalRevenue: finalTotalRevenue,
      averageOrderValue: finalAov,
      totalOrders: finalOrdersServed,
      orders: assignedOrders
    };
  });

  let data = waiterRows;
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    data = data.filter(w => 
      w.name.toLowerCase().includes(q) || 
      w.email.toLowerCase().includes(q) || 
      w.phone.toLowerCase().includes(q) ||
      (Array.isArray(w.assignedTablesList) && w.assignedTablesList.some(t => String(t).toLowerCase().includes(q)))
    );
  }

  const totalWaiters = data.length;
  const activeWaitersOnDuty = data.filter(w => w.dutyStatus === 'ON_DUTY').length;
  const totalOrdersServed = data.reduce((acc, w) => acc + (w.ordersServed || 0), 0);
  const totalWaiterRevenue = data.reduce((acc, w) => acc + (w.totalRevenue || 0), 0);
  const averageOrderValue = totalOrdersServed > 0 ? (totalWaiterRevenue / totalOrdersServed).toFixed(2) : '0.00';

  const summary = {
    totalWaiters,
    activeWaitersOnDuty,
    totalOrdersServed,
    totalWaiterRevenue,
    averageOrderValue
  };

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)));
  const paginatedData = data.slice(safePage * limit, (safePage + 1) * limit);

  return {
    data: paginatedData,
    summary,
    totalPages,
    totalItems
  };
};

// 5. KITCHEN PREPARATION REPORT ENGINE (Preserved & Enhanced)
const computeKitchenReports = (ordersList = [], menuList = [], categoriesList = [], filters = {}, branchesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, filterCategory = 'All', searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const ordDate = extractOrderISODate(o);
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  const itemMap = new Map();

  if (Array.isArray(menuList) && menuList.length > 0) {
    menuList.forEach(m => {
      if (isBranchFiltered && !m.isServerReport && !isEntityInBranch(m, selectedBranchId, branchesList)) return;
      const name = toDisplayText(m.foodItem || m.itemName || m.dishName || m.name || m.title, '').trim();
      if (!name || name.toLowerCase() === 'food item') return;
      const nameLower = name.toLowerCase();

      const rawCat = m.category || m.categoryName;
      const cat = resolveCategoryName(rawCat, categoriesList) || 'Main Course';
      const prep = toDisplayText(m.avgPrepTime || m.prepTime, '15 mins');
      const qty = Number(m.quantityPrepared ?? m.qtyPrepared ?? m.qty ?? m.quantity ?? m.count ?? 0);
      const rev = Number(m.revenueGenerated ?? m.revenue ?? m.totalRevenue ?? 0);
      const kStatus = toDisplayText(m.kitchenStatus || m.status, 'Completed');

      itemMap.set(nameLower, {
        ...m,
        foodItem: name,
        itemName: name,
        category: cat,
        quantityPrepared: qty,
        avgPrepTime: prep,
        revenueGenerated: rev,
        kitchenStatus: kStatus,
        status: qty >= 8 ? 'High Demand' : 'Optimal',
        branchId: m.branchId || selectedBranchId,
        fromServerReport: Boolean(m.isServerReport || qty > 0 || rev > 0)
      });
    });
  }

  filteredOrders.forEach(order => {
    const oStatus = String(order.status || '').toLowerCase();
    const orderItems = extractOrderItems(order);

    orderItems.forEach(it => {
      const name = toDisplayText(it.name || it.menuItem?.name || it.dishName || it.foodItem || it.itemName || '').trim();
      if (!name || name.toLowerCase() === 'food item') return;
      const nameLower = name.toLowerCase();
      const qty = Number(it.quantity || it.qty || 1) || 1;

      const matchedMenu = (menuList || []).find(m => {
        if (isBranchFiltered && !m.isServerReport && !isEntityInBranch(m, selectedBranchId, branchesList)) return false;
        const mName = toDisplayText(m.name || m.dishName || m.foodItem || m.itemName || '').trim().toLowerCase();
        return mName === nameLower || (m._id && (m._id === it.menuItemId || m._id === it.menuItem || m._id === it.dishId));
      });

      const price = Number(it.price || it.rate || matchedMenu?.price || 0);
      const rawCat = it.category || it.categoryName || it.menuItem?.category || matchedMenu?.category || matchedMenu?.categoryName;
      let cat = resolveCategoryName(rawCat, categoriesList);

      let prep = toDisplayText(it.prepTime || it.preparationTime || matchedMenu?.prepTime || matchedMenu?.preparationTime);
      if (!prep || prep === 'N/A' || prep === 'null' || prep === 'undefined') {
        prep = '15 mins';
      }

      if (!itemMap.has(nameLower)) {
        itemMap.set(nameLower, {
          foodItem: name,
          itemName: name,
          category: cat || 'Main Course',
          quantityPrepared: qty,
          avgPrepTime: prep,
          revenueGenerated: (qty * price),
          kitchenStatus: (oStatus === 'served' || oStatus === 'completed') ? 'Completed' : (oStatus === 'ready' ? 'Ready' : (oStatus === 'preparing' ? 'In Progress' : 'Completed')),
          status: qty >= 8 ? 'High Demand' : 'Optimal',
          branchId: selectedBranchId
        });
      } else {
        const entry = itemMap.get(nameLower);
        if (!entry.fromServerReport) {
          entry.quantityPrepared += qty;
          entry.revenueGenerated += (qty * price);
          if (cat && (!entry.category || entry.category === 'Main Course')) entry.category = cat;
          if (oStatus === 'preparing') entry.kitchenStatus = 'In Progress';
          else if (oStatus === 'ready') entry.kitchenStatus = 'Ready';
          if (entry.quantityPrepared >= 8) entry.status = 'High Demand';
        }
      }
    });
  });

  let allDishes = Array.from(itemMap.values());
  const preparedDishes = allDishes.filter(d => Number(d.quantityPrepared || 0) > 0 || Number(d.revenueGenerated || 0) > 0);
  let dishes = preparedDishes.length > 0 ? preparedDishes : allDishes;

  if (filterCategory && filterCategory !== 'All' && filterCategory !== 'ALL') {
    const targetCat = String(filterCategory).trim().toLowerCase();
    dishes = dishes.filter(d => (d.category || '').toLowerCase() === targetCat);
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    dishes = dishes.filter(d => (d.foodItem || '').toLowerCase().includes(q) || (d.category || '').toLowerCase().includes(q));
  }

  const totalDishesPrepared = dishes.reduce((acc, d) => acc + Number(d.quantityPrepared || 0), 0);
  const foodRevenueGenerated = dishes.reduce((acc, d) => acc + Number(d.revenueGenerated || 0), 0);
  const activeFoodItems = dishes.length;
  const activeCategories = Array.from(new Set(dishes.map(d => d.category).filter(Boolean))).length;
  
  const prepMinutes = dishes.map(d => parseInt(d.avgPrepTime) || 15).filter(n => !isNaN(n));
  const avgMins = prepMinutes.length > 0 ? Math.round(prepMinutes.reduce((a, b) => a + b, 0) / prepMinutes.length) : 15;

  const summary = {
    totalDishesPrepared,
    foodRevenueGenerated,
    activeFoodItems,
    activeCategories,
    avgPrepTime: `${avgMins} mins`
  };

  const totalItems = dishes.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)));
  const paginatedData = dishes.slice(safePage * limit, (safePage + 1) * limit);

  return {
    data: paginatedData,
    summary,
    totalPages,
    totalItems
  };
};

// 6. TAX & FINANCIAL SETTLEMENT ENGINE
const computeTaxSettlement = (ordersList = [], filters = {}, branchesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const isCancelled = ['cancelled', 'rejected', 'void', 'failed'].includes(String(o.status || '').toLowerCase());
    if (isCancelled) return false;
    const ordDate = extractOrderISODate(o);
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  const rows = filteredOrders.map((o, idx) => {
    const rawTotal = getOrderTotalAmount(o);
    const invoiceNo = `INV-${toDisplayText(o.orderId || o.orderNumber || o.billNumber || o.id || o._id || (idx + 1001))}`;
    const rawDate = extractOrderISODate(o) || (o.createdAt ? o.createdAt.split('T')[0] : '');

    let explicitTax = Number(o.tax || o.taxAmount || o.gst || o.totalTax || o.bill?.tax || 0);
    let taxableAmount = 0;
    let cgst = 0;
    let sgst = 0;
    let totalTax = 0;

    if (explicitTax > 0) {
      totalTax = explicitTax;
      taxableAmount = Math.max(0, rawTotal - explicitTax);
      cgst = Math.round((totalTax / 2) * 100) / 100;
      sgst = Math.round((totalTax - cgst) * 100) / 100;
    } else {
      taxableAmount = Math.round((rawTotal / 1.05) * 100) / 100;
      totalTax = Math.round((rawTotal - taxableAmount) * 100) / 100;
      cgst = Math.round((taxableAmount * 0.025) * 100) / 100;
      sgst = Math.round((taxableAmount * 0.025) * 100) / 100;
    }

    const rawPayment = o.paymentMode || o.paymentMethod || o.billing?.paymentMethod || o.payment?.mode || (o.billingStatus === 'paid' ? 'UPI' : 'Cash');
    let paymentMode = 'Cash';
    if (/upi|gpay|phonepe|paytm|qr/i.test(rawPayment)) paymentMode = 'UPI';
    else if (/card|credit|debit|pos/i.test(rawPayment)) paymentMode = 'Card';
    else paymentMode = 'Cash';

    return {
      id: invoiceNo,
      invoiceNo,
      date: rawDate ? formatDateDMY(rawDate) : 'Today',
      taxableAmount,
      cgst,
      sgst,
      totalTax,
      grossAmount: rawTotal,
      paymentMode,
      settlementStatus: 'Settled'
    };
  });

  let data = rows;
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    data = data.filter(r => r.invoiceNo.toLowerCase().includes(q) || r.paymentMode.toLowerCase().includes(q));
  }

  const totalGross = data.reduce((acc, r) => acc + r.grossAmount, 0);
  const totalTaxable = data.reduce((acc, r) => acc + r.taxableAmount, 0);
  const totalCGST = data.reduce((acc, r) => acc + r.cgst, 0);
  const totalSGST = data.reduce((acc, r) => acc + r.sgst, 0);
  const totalGST = data.reduce((acc, r) => acc + r.totalTax, 0);
  const cashInDrawer = data.filter(r => r.paymentMode === 'Cash').reduce((acc, r) => acc + r.grossAmount, 0);
  const digitalSettlement = data.filter(r => r.paymentMode !== 'Cash').reduce((acc, r) => acc + r.grossAmount, 0);

  const summary = {
    totalGross,
    totalTaxable,
    totalCGST,
    totalSGST,
    totalGST,
    cashInDrawer,
    digitalSettlement,
    totalInvoices: data.length
  };

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.max(0, Math.min(page, Math.max(0, totalPages - 1)));
  const paginatedData = data.slice(safePage * limit, (safePage + 1) * limit);

  return {
    data: paginatedData,
    summary,
    totalPages,
    totalItems
  };
};

export default function ReportsPanel({
  orders = [],
  allOrders = [],
  staff = [],
  tables = [],
  menu = [],
  branches = [],
  selectedBranchId = null,
  activeRestaurant = {},
  initialTab = 'sales'
}) {
  const VALID_TABS = ['sales', 'items', 'orders', 'waiter', 'kitchen', 'tax'];
  const [activeReportTab, setActiveReportTab] = useState(
    VALID_TABS.includes(initialTab) ? initialTab : 'sales'
  );

  // Date filters & quick preset
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [datePreset, setDatePreset] = useState('all'); // 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom'

  // Additional tab-specific filter states
  const [filterKitchenCategory, setFilterKitchenCategory] = useState('All');
  const [filterPaymentMode, setFilterPaymentMode] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveCategories, setLiveCategories] = useState([]);

  // Modals for Order & Receipt details
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [selectedWaiterOrdersModal, setSelectedWaiterOrdersModal] = useState(null);

  const [loading, setLoading] = useState(false);

  // TAB 1: SALES & REVENUE STATE
  const [salesData, setSalesData] = useState([]);
  const [salesSummary, setSalesSummary] = useState(null);
  const [salesTotalCount, setSalesTotalCount] = useState(0);
  const [salesPagination, setSalesPagination] = useState({ page: 0, limit: 10, totalPages: 1, totalItems: 0 });

  // TAB 2: ITEM PERFORMANCE STATE
  const [itemsData, setItemsData] = useState([]);
  const [itemsSummary, setItemsSummary] = useState(null);
  const [itemsTotalCount, setItemsTotalCount] = useState(0);
  const [itemsPagination, setItemsPagination] = useState({ page: 0, limit: 10, totalPages: 1, totalItems: 0 });

  // TAB 3: ORDER ANALYTICS STATE
  const [ordersData, setOrdersData] = useState([]);
  const [ordersSummary, setOrdersSummary] = useState(null);
  const [ordersTotalCount, setOrdersTotalCount] = useState(0);
  const [ordersPagination, setOrdersPagination] = useState({ page: 0, limit: 10, totalPages: 1, totalItems: 0 });

  // TAB 4: WAITER PERFORMANCE STATE
  const [waiterData, setWaiterData] = useState([]);
  const [waiterSummary, setWaiterSummary] = useState(null);
  const [waiterTotalCount, setWaiterTotalCount] = useState(0);
  const [waiterPagination, setWaiterPagination] = useState({ page: 0, limit: 10, totalPages: 1, totalItems: 0 });

  // TAB 5: KITCHEN OPERATIONS STATE
  const [kitchenData, setKitchenData] = useState([]);
  const [kitchenSummary, setKitchenSummary] = useState(null);
  const [kitchenTotalCount, setKitchenTotalCount] = useState(0);
  const [kitchenPagination, setKitchenPagination] = useState({ page: 0, limit: 10, totalPages: 1, totalItems: 0 });

  // TAB 6: TAX & SETTLEMENT STATE
  const [taxData, setTaxData] = useState([]);
  const [taxSummary, setTaxSummary] = useState(null);
  const [taxTotalCount, setTaxTotalCount] = useState(0);
  const [taxPagination, setTaxPagination] = useState({ page: 0, limit: 10, totalPages: 1, totalItems: 0 });

  // Active summary and pagination pointers
  const summary = {
    sales: salesSummary,
    items: itemsSummary,
    orders: ordersSummary,
    waiter: waiterSummary,
    kitchen: kitchenSummary,
    tax: taxSummary
  }[activeReportTab];

  const currentPagination = {
    sales: salesPagination,
    items: itemsPagination,
    orders: ordersPagination,
    waiter: waiterPagination,
    kitchen: kitchenPagination,
    tax: taxPagination
  }[activeReportTab] || { page: 0, limit: 10, totalPages: 1, totalItems: 0 };

  const currency = activeRestaurant?.settings?.currency || '₹';
  const effectiveBranches = Array.isArray(branches) && branches.length > 0 ? branches : (activeRestaurant?.branches || []);
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All';

  // Synchronize URL initialTab
  useEffect(() => {
    if (VALID_TABS.includes(initialTab)) {
      setActiveReportTab(initialTab);
    }
  }, [initialTab]);

  // Handle Quick Date Presets
  const handleDatePreset = (preset) => {
    setDatePreset(preset);
    const today = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      const t = formatDate(today);
      setDateStart(t);
      setDateEnd(t);
    } else if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const yStr = formatDate(y);
      setDateStart(yStr);
      setDateEnd(yStr);
    } else if (preset === 'this_week') {
      const start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      setDateStart(formatDate(start));
      setDateEnd(formatDate(today));
    } else if (preset === 'this_month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateStart(formatDate(start));
      setDateEnd(formatDate(today));
    } else {
      setDateStart('');
      setDateEnd('');
    }
  };

  // Load categories strictly for active branch for Kitchen & Item reports
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const branchParam = isBranchFiltered ? { branchId: selectedBranchId } : {};
        const catRes = await MenuApi.getCategories({ ...branchParam, limit:10}).catch(() => null);
        if (isMounted && catRes?.status && catRes?.response) {
          const cd = catRes.response.data || catRes.response.categories || catRes.response;
          if (Array.isArray(cd)) {
            const filteredCd = isBranchFiltered ? cd.filter(c => isEntityInBranch(c, selectedBranchId, effectiveBranches)) : cd;
            setLiveCategories(filteredCd);
          }
        }
      } catch (e) {
        console.warn("Failed to load categories for reports filter:", e);
      }
    };
    loadCategories();
    return () => { isMounted = false; };
  }, [selectedBranchId, isBranchFiltered]);

  // Derived effective base collections strictly filtered by active branch
  const filterBranch = (item) => isEntityInBranch(item, selectedBranchId, effectiveBranches);

  // Helper: Aggregate unique dishes for kitchen report
  const aggregateDishes = (dishList = []) => {
    const itemMap = new Map();
    dishList.forEach(k => {
      if (isBranchFiltered && (k.branchId || k.branch || k.branchCode) && !isEntityInBranch(k, selectedBranchId, effectiveBranches)) return;
      const foodItem = toDisplayText(k.foodItem || k.itemName || k.dishName || k.name || k.title, '').trim();
      if (!foodItem || foodItem.toLowerCase() === 'food item') return;
      const nameLower = foodItem.toLowerCase();
      const cat = resolveCategoryName(k.category || k.categoryName, liveCategories) || 'Main Course';
      const prep = toDisplayText(k.avgPrepTime || k.prepTime, '15 mins');
      const qty = Number(k.quantityPrepared ?? k.qtyPrepared ?? k.qty ?? k.quantity ?? k.count ?? 0) || 1;
      const rev = Number(k.revenueGenerated ?? k.revenue ?? k.totalRevenue ?? 0);
      const status = toDisplayText(k.kitchenStatus || k.status, 'Completed');

      if (!itemMap.has(nameLower)) {
        itemMap.set(nameLower, {
          ...k,
          foodItem,
          itemName: foodItem,
          category: cat,
          kitchenStatus: status,
          avgPrepTime: prep,
          quantityPrepared: qty,
          revenueGenerated: rev,
          isServerReport: true
        });
      } else {
        const existing = itemMap.get(nameLower);
        existing.quantityPrepared += qty;
        existing.revenueGenerated += rev;
      }
    });
    return Array.from(itemMap.values());
  };

  // Helper: Aggregate unique waiters for waiter report
  const aggregateWaiters = (waiterList = []) => {
    const waiterMap = new Map();
    waiterList.forEach((w, idx) => {
      const waiterObj = (typeof w.waiter === 'object' && w.waiter !== null) ? w.waiter : w;
      if (isBranchFiltered && (waiterObj.branchId || waiterObj.branch || waiterObj.branchCode) && !isEntityInBranch(waiterObj, selectedBranchId, effectiveBranches)) return;
      const name = toDisplayText(waiterObj.name || waiterObj.userName || waiterObj.waiterName || w.waiter, 'Waiter').trim();
      if (!name || (name.toLowerCase() === 'waiter' && !waiterObj.email && !waiterObj._id)) return;

      const email = toDisplayText(waiterObj.email).trim();
      const phone = toDisplayText(waiterObj.phone || waiterObj.mobileNumber).trim();
      const id = String(waiterObj.id || waiterObj._id || waiterObj.userId || email || `w-${idx}`);
      const key = email ? email.toLowerCase() : (id ? id.toLowerCase() : name.toLowerCase());

      const dutyStatus = toDisplayText(waiterObj.dutyStatus || waiterObj.status, 'ON_DUTY');
      const assignedTables = Array.isArray(waiterObj.assignedTablesList) 
        ? waiterObj.assignedTablesList.map(t => toDisplayText(t))
        : (Array.isArray(waiterObj.tables) ? waiterObj.tables.map(t => toDisplayText(t)) : []);
      const ordersServed = Number(w.ordersServed || w.totalOrders || 0);
      const totalRevenue = Number(w.totalRevenue || w.revenue || 0);

      if (!waiterMap.has(key)) {
        waiterMap.set(key, {
          ...waiterObj,
          id,
          name,
          email,
          phone,
          dutyStatus,
          assignedTablesList: assignedTables,
          ordersServed,
          totalRevenue,
          averageOrderValue: toDisplayText(w.averageOrderValue || (ordersServed > 0 ? (totalRevenue / ordersServed).toFixed(2) : '0.00')),
          branchId: waiterObj.branchId || selectedBranchId,
          isServerReport: true
        });
      } else {
        const existing = waiterMap.get(key);
        existing.ordersServed += ordersServed;
        existing.totalRevenue += totalRevenue;
        existing.averageOrderValue = existing.ordersServed > 0 ? (existing.totalRevenue / existing.ordersServed).toFixed(2) : '0.00';
        if (assignedTables.length > 0) {
          existing.assignedTablesList = Array.from(new Set([...existing.assignedTablesList, ...assignedTables]));
        }
      }
    });
    return Array.from(waiterMap.values());
  };

  // Main Report Fetcher - Calls Only Mandatory APIs for the Active Tab
  const fetchReports = async (page = 0) => {
    setLoading(true);
    try {
      const branchParam = isBranchFiltered ? { branchId: selectedBranchId } : {};
      const dateParam = {
        startDate: dateStart || undefined,
        endDate: dateEnd || undefined
      };

      // TAB 1: SALES & REVENUE
      if (activeReportTab === 'sales') {
        const [ordersRes, billingRes] = await Promise.all([
          OrderApi.getOrders({ ...branchParam, ...dateParam, limit: 10 }).catch(() => null),
          BillingApi.getBillingHistory({ ...branchParam, ...dateParam, limit: 10 }).catch(() => null)
        ]);

        const rawOrders = extractServerList(ordersRes) || [];
        const rawBills = extractServerList(billingRes) || [];
        const combined = [...rawOrders, ...rawBills, ...(Array.isArray(orders) ? orders : [])];
        const uniqueOrders = Array.from(new Map(combined.map(o => [o._id || o.id || o.orderId || JSON.stringify(o), o])).values());

        const computed = computeSalesReports(uniqueOrders, {
          dateStart,
          dateEnd,
          selectedBranchId,
          filterPaymentMode,
          searchQuery,
          page,
          limit: 10
        }, effectiveBranches);

        setSalesData(computed.data);
        setSalesSummary(computed.summary);
        setSalesTotalCount(computed.totalItems);
        setSalesPagination({ page, limit: 10, totalPages: computed.totalPages, totalItems: computed.totalItems });
      }

      // TAB 2: ITEM PERFORMANCE
      else if (activeReportTab === 'items') {
        const [ordersRes, menuRes, catRes] = await Promise.all([
          OrderApi.getOrders({ ...branchParam, ...dateParam, limit: 10 }).catch(() => null),
          MenuApi.getMenuItems({ ...branchParam, limit: 10}).catch(() => null),
          MenuApi.getCategories({ ...branchParam, limit: 10 }).catch(() => null)
        ]);

        const rawOrders = extractServerList(ordersRes) || [];
        const rawMenu = extractServerList(menuRes) || [];
        const combinedOrders = [...rawOrders, ...(Array.isArray(orders) ? orders : [])];
        const uniqueOrders = Array.from(new Map(combinedOrders.map(o => [o._id || o.id || JSON.stringify(o), o])).values());

        const combinedMenu = [...rawMenu, ...(Array.isArray(menu) ? menu : [])];
        const uniqueMenu = Array.from(new Map(combinedMenu.map(m => [m._id || m.id || m.name || JSON.stringify(m), m])).values());

        const categoriesList = liveCategories.length > 0 ? liveCategories : (extractServerList(catRes) || []);

        const computed = computeItemReports(uniqueOrders, uniqueMenu, categoriesList, {
          dateStart,
          dateEnd,
          selectedBranchId,
          filterCategory: filterKitchenCategory,
          searchQuery,
          page,
          limit: 10
        }, effectiveBranches);

        setItemsData(computed.data);
        setItemsSummary(computed.summary);
        setItemsTotalCount(computed.totalItems);
        setItemsPagination({ page, limit: 10, totalPages: computed.totalPages, totalItems: computed.totalItems });
      }

      // TAB 3: ORDER ANALYTICS
      else if (activeReportTab === 'orders') {
        const [ordersRes] = await Promise.all([
          OrderApi.getOrders({ ...branchParam, ...dateParam, limit: 10 }).catch(() => null)
        ]);

        const rawOrders = extractServerList(ordersRes) || [];
        const combined = [...rawOrders, ...(Array.isArray(orders) ? orders : [])];
        const uniqueOrders = Array.from(new Map(combined.map(o => [o._id || o.id || JSON.stringify(o), o])).values());

        const computed = computeOrderAnalytics(uniqueOrders, {
          dateStart,
          dateEnd,
          selectedBranchId,
          searchQuery,
          page,
          limit: 10
        }, effectiveBranches);

        setOrdersData(computed.data);
        setOrdersSummary(computed.summary);
        setOrdersTotalCount(computed.totalItems);
        setOrdersPagination({ page, limit: 10, totalPages: computed.totalPages, totalItems: computed.totalItems });
      }

      // TAB 4: WAITER PERFORMANCE
      else if (activeReportTab === 'waiter') {
        const [waiterReportRes, usersRes, tablesRes, ordersRes] = await Promise.all([
          ReportsApi.getWaiterReports({ ...branchParam, ...dateParam, search: searchQuery || undefined, page, limit: 10 }).catch(() => null),
          UserApi.getUsers({ ...branchParam, limit: 10}).catch(() => null),
          TableApi.getTables({ ...branchParam, limit: 10 }).catch(() => null),
          OrderApi.getOrders({ ...branchParam, ...dateParam, limit: 10}).catch(() => null)
        ]);

        const rawWaitersFromApi = extractServerList(waiterReportRes) || [];
        const rawUsers = extractServerList(usersRes) || [];
        const rawTables = extractServerList(tablesRes) || [];
        const rawOrders = extractServerList(ordersRes) || [];

        const filteredRawUsers = isBranchFiltered ? rawUsers.filter(filterBranch) : rawUsers;
        const filteredPropStaff = isBranchFiltered ? (Array.isArray(staff) ? staff.filter(filterBranch) : []) : (Array.isArray(staff) ? staff : []);
        const combinedStaff = [...filteredRawUsers, ...filteredPropStaff, ...(Array.isArray(activeRestaurant?.staff) ? activeRestaurant.staff : [])];
        const uniqueStaff = Array.from(new Map(combinedStaff.map(s => [s._id || s.id || s.email || JSON.stringify(s), s])).values());

        const filteredRawTables = isBranchFiltered ? rawTables.filter(filterBranch) : rawTables;
        const combinedTables = [...filteredRawTables, ...(Array.isArray(tables) ? tables : [])];
        const uniqueTables = Array.from(new Map(combinedTables.map(t => [t._id || t.id || t.tableNumber || JSON.stringify(t), t])).values());

        const filteredRawOrders = isBranchFiltered ? rawOrders.filter(filterBranch) : rawOrders;
        const combinedOrders = [...filteredRawOrders, ...(Array.isArray(orders) ? orders : [])];
        const uniqueOrders = Array.from(new Map(combinedOrders.map(o => [o._id || o.id || JSON.stringify(o), o])).values());

        let apiWaiters = aggregateWaiters(rawWaitersFromApi);
        const staffPoolMap = new Map();
        uniqueStaff.forEach(s => {
          const key = String(s._id || s.id || s.email || s.name || '').toLowerCase();
          if (key) staffPoolMap.set(key, s);
        });
        apiWaiters.forEach(w => {
          const key = String(w._id || w.id || w.email || w.name || '').toLowerCase();
          if (key) {
            const existing = staffPoolMap.get(key) || {};
            staffPoolMap.set(key, { ...existing, ...w });
          } else {
            staffPoolMap.set(key, w);
          }
        });
        const mergedStaff = Array.from(staffPoolMap.values());

        const computed = computeWaiterReports(uniqueOrders, mergedStaff, uniqueTables, {
          dateStart,
          dateEnd,
          selectedBranchId,
          searchQuery,
          page,
          limit: 10
        }, effectiveBranches, activeRestaurant?.roles || []);

        const serverWaiterSummary = extractServerSummary(waiterReportRes);
        const serverWaiterPagination = extractServerPagination(waiterReportRes);

        const effectiveWaiterSummary = {
          totalOrdersServed: serverWaiterSummary?.totalOrdersServed ?? serverWaiterSummary?.ordersServed ?? computed.summary.totalOrdersServed,
          totalWaiterRevenue: serverWaiterSummary?.totalWaiterRevenue ?? serverWaiterSummary?.revenue ?? computed.summary.totalWaiterRevenue,
          activeWaitersOnDuty: serverWaiterSummary?.activeWaitersOnDuty ?? computed.summary.activeWaitersOnDuty,
          totalWaiters: serverWaiterSummary?.totalWaiters ?? computed.summary.totalWaiters,
          averageOrderValue: serverWaiterSummary?.averageOrderValue ?? computed.summary.averageOrderValue
        };

        setWaiterData(computed.data);
        setWaiterSummary(effectiveWaiterSummary);
        const finalWaiterCount = serverWaiterPagination?.totalItems ?? computed.totalItems;
        setWaiterTotalCount(finalWaiterCount);
        setWaiterPagination({
          page,
          limit: 10,
          totalPages: serverWaiterPagination?.totalPages ?? computed.totalPages,
          totalItems: finalWaiterCount
        });
      }

      // TAB 5: KITCHEN OPERATIONS
      else if (activeReportTab === 'kitchen') {
        const [kitchenReportRes, catRes, menuRes, ordersRes] = await Promise.all([
          ReportsApi.getKitchenReports({
            ...branchParam,
            ...dateParam,
            categoryId: (filterKitchenCategory && filterKitchenCategory !== 'All') ? filterKitchenCategory : undefined,
            search: searchQuery || undefined,
            page,
            limit: 10
          }).catch(() => null),
          MenuApi.getCategories({ ...branchParam, limit: 10}).catch(() => null),
          MenuApi.getMenuItems({ ...branchParam, limit: 10}).catch(() => null),
          OrderApi.getOrders({ ...branchParam, ...dateParam, limit: 10 }).catch(() => null)
        ]);

        if (catRes?.status && catRes?.response) {
          const cd = catRes.response.data || catRes.response.categories || catRes.response;
          if (Array.isArray(cd)) {
            const branchCats = isBranchFiltered ? cd.filter(filterBranch) : cd;
            setLiveCategories(branchCats);
          }
        }

        const rawKitchenFromApi = extractServerList(kitchenReportRes) || [];
        const rawMenuItems = extractServerList(menuRes) || [];
        const rawOrders = extractServerList(ordersRes) || [];

        const filteredRawMenu = isBranchFiltered ? rawMenuItems.filter(filterBranch) : rawMenuItems;
        const combinedMenu = [...filteredRawMenu, ...(Array.isArray(menu) ? menu : [])];
        const uniqueMenu = Array.from(new Map(combinedMenu.map(m => [m._id || m.id || m.name || JSON.stringify(m), m])).values());

        const filteredRawOrders = isBranchFiltered ? rawOrders.filter(filterBranch) : rawOrders;
        const combinedOrders = [...filteredRawOrders, ...(Array.isArray(orders) ? orders : [])];
        const uniqueOrders = Array.from(new Map(combinedOrders.map(o => [o._id || o.id || JSON.stringify(o), o])).values());

        let apiKitchen = aggregateDishes(rawKitchenFromApi);
        const categoriesList = liveCategories.length > 0 ? liveCategories : (catRes?.response?.data || []);

        const serverKitchenSummary = extractServerSummary(kitchenReportRes);
        const serverKitchenPagination = extractServerPagination(kitchenReportRes);
        const dishesSource = (apiKitchen && apiKitchen.length > 0) ? apiKitchen : uniqueMenu;

        const computed = computeKitchenReports(uniqueOrders, dishesSource, categoriesList, {
          dateStart,
          dateEnd,
          selectedBranchId,
          filterCategory: filterKitchenCategory,
          searchQuery,
          page,
          limit: 10
        }, effectiveBranches);

        const serverCats = (serverKitchenSummary?.activeCategories !== undefined && serverKitchenSummary.activeCategories !== null)
          ? Number(serverKitchenSummary.activeCategories)
          : undefined;

        const serverFoodItems = (serverKitchenSummary?.activeFoodItems !== undefined && serverKitchenSummary.activeFoodItems !== null)
          ? Number(serverKitchenSummary.activeFoodItems)
          : (serverKitchenSummary?.totalDishes !== undefined ? Number(serverKitchenSummary.totalDishes) : serverCats);

        const effectiveKitchenSummary = {
          totalDishesPrepared: serverKitchenSummary?.totalDishesPrepared ?? computed.summary.totalDishesPrepared,
          foodRevenueGenerated: serverKitchenSummary?.foodRevenueGenerated ?? computed.summary.foodRevenueGenerated,
          activeCategories: serverCats ?? computed.summary.activeCategories,
          avgPrepTime: serverKitchenSummary?.avgPrepTime ?? computed.summary.avgPrepTime,
          activeFoodItems: serverFoodItems ?? (serverCats !== undefined ? serverCats : computed.summary.activeFoodItems)
        };

        setKitchenData(computed.data);
        setKitchenSummary(effectiveKitchenSummary);
        const finalKitchenCount = serverKitchenPagination?.totalItems ?? (
          (serverKitchenSummary?.activeFoodItems !== undefined && Number(serverKitchenSummary.activeFoodItems) > 0)
            ? Number(serverKitchenSummary.activeFoodItems)
            : computed.totalItems
        );
        setKitchenTotalCount(finalKitchenCount);
        setKitchenPagination({
          page,
          limit: 10,
          totalPages: serverKitchenPagination?.totalPages ?? computed.totalPages,
          totalItems: finalKitchenCount
        });
      }

      // TAB 6: TAX & FINANCIAL SETTLEMENT
      else if (activeReportTab === 'tax') {
        const [ordersRes, billingRes] = await Promise.all([
          OrderApi.getOrders({ ...branchParam, ...dateParam, limit: 10 }).catch(() => null),
          BillingApi.getBillingHistory({ ...branchParam, ...dateParam, limit: 10 }).catch(() => null)
        ]);

        const rawOrders = extractServerList(ordersRes) || [];
        const rawBills = extractServerList(billingRes) || [];
        const combined = [...rawOrders, ...rawBills, ...(Array.isArray(orders) ? orders : [])];
        const uniqueOrders = Array.from(new Map(combined.map(o => [o._id || o.id || o.orderId || JSON.stringify(o), o])).values());

        const computed = computeTaxSettlement(uniqueOrders, {
          dateStart,
          dateEnd,
          selectedBranchId,
          searchQuery,
          page,
          limit: 10
        }, effectiveBranches);

        setTaxData(computed.data);
        setTaxSummary(computed.summary);
        setTaxTotalCount(computed.totalItems);
        setTaxPagination({ page, limit: 10, totalPages: computed.totalPages, totalItems: computed.totalItems });
      }
    } catch (err) {
      console.error("fetchReports error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(0);
  }, [
    activeReportTab,
    dateStart,
    dateEnd,
    filterKitchenCategory,
    filterPaymentMode,
    searchQuery,
    selectedBranchId
  ]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < currentPagination.totalPages) {
      fetchReports(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = currentPagination.page + 1;
    const total = Math.max(1, currentPagination.totalPages || 1);
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(total, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handleResetFilters = () => {
    setDateStart('');
    setDateEnd('');
    setDatePreset('all');
    setFilterKitchenCategory('All');
    setFilterPaymentMode('All');
    setSearchQuery('');
  };

  // Dynamic Export to Excel for All 6 Modules
  const exportToExcel = () => {
    let exportData = [];
    let sheetName = '';
    let fileName = '';
    const dateStamp = new Date().toISOString().split('T')[0];

    if (activeReportTab === 'sales') {
      sheetName = 'Sales & Revenue Report';
      fileName = `Sales_Revenue_Report_${dateStamp}.xlsx`;
      exportData = salesData.map((r, i) => ({
        'S.No': i + 1,
        'Date & Time': r.formattedDateTime,
        'Table / Type': r.table,
        'Customer': r.customer,
        'Payment Mode': r.paymentMode,
        'Gross Amount (INR)': r.grossAmount,
        'Discount (INR)': r.discount,
        'Taxes (INR)': r.tax,
        'Net Sales (INR)': r.netAmount,
        'Status': r.status
      }));
    } else if (activeReportTab === 'items') {
      sheetName = 'Item Performance Report';
      fileName = `Item_Performance_Report_${dateStamp}.xlsx`;
      exportData = itemsData.map((r, i) => ({
        'S.No': i + 1,
        'Item Name': r.name,
        'Category': r.category,
        'Unit Price (INR)': r.price,
        'Quantity Sold': r.quantitySold,
        'Total Revenue (INR)': r.totalRevenue,
        'Contribution %': `${r.contributionPct}%`,
        'Demand Status': r.demandStatus
      }));
    } else if (activeReportTab === 'orders') {
      sheetName = 'Order Analytics Report';
      fileName = `Order_Analytics_Report_${dateStamp}.xlsx`;
      exportData = ordersData.map((r, i) => ({
        'S.No': i + 1,
        'Date & Time': r.dateTime,
        'Dining Option': r.diningType,
        'Items Summary': r.itemsSummary,
        'Total Amount (INR)': r.totalAmount,
        'Order Status': r.status,
        'Payment Status': r.paymentStatus
      }));
    } else if (activeReportTab === 'waiter') {
      sheetName = 'Waiter Performance Reports';
      fileName = `Waiter_Reports_${dateStamp}.xlsx`;
      exportData = waiterData.map((r, i) => ({
        'S.No': i + 1,
        'Waiter Name': r.name || 'Waiter',
        'Duty Status': toDisplayText(r.dutyStatus) === 'ON_DUTY' ? 'On Duty' : 'Off Duty',
        'Assigned Tables': (Array.isArray(r.assignedTablesList) && r.assignedTablesList.length > 0) ? r.assignedTablesList.join(', ') : 'None',
        'Orders Fulfilled': Number(r.ordersServed || r.totalOrders || 0),
        'Total Revenue (INR)': Number(r.totalRevenue || r.revenue || 0),
        'Average Order Value (INR)': Number(r.averageOrderValue || 0)
      }));
    } else if (activeReportTab === 'kitchen') {
      sheetName = 'Kitchen Preparation Reports';
      fileName = `Kitchen_Reports_${dateStamp}.xlsx`;
      exportData = kitchenData.map((r, i) => ({
        'S.No': i + 1,
        'Food Item Name': r.foodItem || r.itemName || 'Food Item',
        'Category': r.category || 'Main Course',
        'Quantity Prepared': Number(r.quantityPrepared || 0),
        'Average Prep Time': r.avgPrepTime || '15 mins',
        'Total Revenue (INR)': Number(r.revenueGenerated || r.revenue || 0),
        'Kitchen Status': r.kitchenStatus || r.status || 'Completed'
      }));
    } else if (activeReportTab === 'tax') {
      sheetName = 'Tax & Settlement Report';
      fileName = `Tax_Settlement_Report_${dateStamp}.xlsx`;
      exportData = taxData.map((r, i) => ({
        'S.No': i + 1,
        'Invoice Number': r.invoiceNo,
        'Invoice Date': r.date,
        'Taxable Value (INR)': r.taxableAmount,
        'CGST 2.5% (INR)': r.cgst,
        'SGST 2.5% (INR)': r.sgst,
        'Total GST (INR)': r.totalTax,
        'Gross Amount (INR)': r.grossAmount,
        'Payment Mode': r.paymentMode,
        'Settlement Status': r.settlementStatus
      }));
    }

    if (exportData.length === 0) {
      ShowNotifications.showAlertNotification("No report records available to export for this period.", false);
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const keys = Object.keys(exportData[0] || {});
    worksheet['!cols'] = keys.map(key => {
      let maxLen = String(key).length;
      exportData.forEach(row => {
        const valStr = row[key] !== null && row[key] !== undefined ? String(row[key]) : '';
        if (valStr.length > maxLen) maxLen = valStr.length;
      });
      return { wch: Math.max(maxLen + 6, 18) };
    });

    XLSX.writeFile(workbook, fileName);
  };

  // Dynamic Export to PDF for All 6 Modules
  const exportToPDF = () => {
    const titles = {
      sales: 'Sales & Revenue Report',
      items: 'Item & Category Performance Report',
      orders: 'Order & Dining Analytics Report',
      waiter: 'Waiter Performance Report',
      kitchen: 'Kitchen Operations Report',
      tax: 'Tax & Financial Settlement Report'
    };
    const reportTitle = titles[activeReportTab] || 'Restaurant Operations Report';

    let tableHeaders = [];
    let tableRows = [];

    if (activeReportTab === 'sales') {
      tableHeaders = ['S.No', 'Date & Time', 'Table / Type', 'Payment Mode', 'Gross Total', 'Net Sales', 'Status'];
      tableRows = salesData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.formattedDateTime}</td>
          <td>${r.table}</td>
          <td>${r.paymentMode}</td>
          <td>${currency}${r.grossAmount.toLocaleString('en-IN')}</td>
          <td>${currency}${r.netAmount.toLocaleString('en-IN')}</td>
          <td>${r.status}</td>
        </tr>
      `);
    } else if (activeReportTab === 'items') {
      tableHeaders = ['S.No', 'Item Name', 'Category', 'Unit Price', 'Qty Sold', 'Total Revenue', 'Contribution %', 'Status'];
      tableRows = itemsData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.name}</strong></td>
          <td>${r.category}</td>
          <td>${currency}${r.price}</td>
          <td>${r.quantitySold}</td>
          <td>${currency}${r.totalRevenue.toLocaleString('en-IN')}</td>
          <td>${r.contributionPct}%</td>
          <td>${r.demandStatus}</td>
        </tr>
      `);
    } else if (activeReportTab === 'orders') {
      tableHeaders = ['S.No', 'Date & Time', 'Table / Dining', 'Items Ordered', 'Order Total', 'Status'];
      tableRows = ordersData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.dateTime}</td>
          <td>${r.diningType}</td>
          <td style="max-width:250px;">${r.itemsSummary}</td>
          <td>${currency}${r.totalAmount.toLocaleString('en-IN')}</td>
          <td>${r.status}</td>
        </tr>
      `);
    } else if (activeReportTab === 'waiter') {
      tableHeaders = ['S.No', 'Waiter Name', 'Duty Status', 'Assigned Tables', 'Orders Served', 'Revenue', 'Avg Order Value'];
      tableRows = waiterData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.name}</strong></td>
          <td>${r.dutyStatus === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}</td>
          <td>${(Array.isArray(r.assignedTablesList) && r.assignedTablesList.length > 0) ? r.assignedTablesList.join(', ') : 'None'}</td>
          <td>${r.ordersServed || 0}</td>
          <td>${currency}${Number(r.totalRevenue || 0).toLocaleString('en-IN')}</td>
          <td>${currency}${r.averageOrderValue}</td>
        </tr>
      `);
    } else if (activeReportTab === 'kitchen') {
      tableHeaders = ['S.No', 'Food Item Name', 'Category', 'Quantity Prepared', 'Avg Prep Time', 'Revenue', 'Status'];
      tableRows = kitchenData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.foodItem || r.itemName}</strong></td>
          <td>${r.category}</td>
          <td>${r.quantityPrepared}</td>
          <td>${r.avgPrepTime}</td>
          <td>${currency}${Number(r.revenueGenerated || 0).toLocaleString('en-IN')}</td>
          <td>${r.kitchenStatus || 'Completed'}</td>
        </tr>
      `);
    } else if (activeReportTab === 'tax') {
      tableHeaders = ['S.No', 'Invoice No', 'Date', 'Taxable Value', 'CGST (2.5%)', 'SGST (2.5%)', 'Total GST', 'Gross Total', 'Payment Mode'];
      tableRows = taxData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.invoiceNo}</strong></td>
          <td>${r.date}</td>
          <td>${currency}${r.taxableAmount.toLocaleString('en-IN')}</td>
          <td>${currency}${r.cgst.toLocaleString('en-IN')}</td>
          <td>${currency}${r.sgst.toLocaleString('en-IN')}</td>
          <td>${currency}${r.totalTax.toLocaleString('en-IN')}</td>
          <td>${currency}${r.grossAmount.toLocaleString('en-IN')}</td>
          <td>${r.paymentMode}</td>
        </tr>
      `);
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle} - ${activeRestaurant.name || 'Serviq'}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 36px; color: #0f172a; margin: 0; }
            h1 { font-family: 'Outfit', sans-serif; font-size: 24px; margin: 0 0 4px 0; }
            p { font-size: 13px; color: #64748b; margin: 0; }
            .header-row { display: flex; justify-content: space-between; border-bottom: 2px solid #ff5a1f; padding-bottom: 16px; margin-bottom: 24px; }
            .meta-block { text-align: right; font-size: 12px; line-height: 1.6; color: #475569; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; text-align: left; }
            th { background-color: #f1f5f9; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; }
            td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #e2e8f0; }
            tr:last-child td { border-bottom: none; }
            @media print {
              body { padding: 16px; }
            }
          </style>
        </head>
        <body>
          <div class="header-row">
            <div>
              <h1>${reportTitle}</h1>
              <p>${activeRestaurant.name || 'Serviq Restaurant'} - Executive Operations Report</p>
            </div>
            <div class="meta-block">
              <strong>Generated:</strong> ${formatDateDMY(new Date())}<br>
              <strong>Date Range:</strong> ${dateStart ? formatDateDMY(dateStart) : 'All Time'} to ${dateEnd ? formatDateDMY(dateEnd) : 'Present'}
            </div>
          </div>
          <table>
            <thead>
              <tr>${tableHeaders.map(th => `<th>${th}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${tableRows.join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <section className="panel-view active" style={{ width: '100%', paddingBottom: '24px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '16px',
        marginBottom: '20px',
        borderBottom: '1.5px solid #fdba74',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="premium-filter-btn-reset" onClick={exportToExcel} title="Download Excel CSV Sheet">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Export Excel
          </button>
          <button className="premium-filter-btn-reset" onClick={exportToPDF} title="Download PDF print copy">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* 6 EXECUTIVE ADMIN REPORT TABS */}
      <div className="reports-nav-tabs">
        {[
          { id: 'sales', label: 'Sales & Revenue', icon: DollarSignIcon },
          { id: 'items', label: 'Item Performance', icon: UtensilsIcon },
          { id: 'orders', label: 'Order Analytics', icon: ShoppingBagIcon },
          { id: 'waiter', label: 'Waiter Reports', icon: UserIcon },
          { id: 'kitchen', label: 'Kitchen Reports', icon: ChefIcon },
          { id: 'tax', label: 'Tax & Settlement', icon: PercentIcon }
        ].map(tab => {
          const isActive = activeReportTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveReportTab(tab.id);
                setSearchQuery('');
              }}
              className={`reports-nav-tab-btn ${isActive ? 'active' : ''}`}
            >
              <IconComp size={16} color={isActive ? '#ff7a00' : '#64748b'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* KPI OVERVIEW CARDS (TAB SPECIFIC) */}
      {/* 1. SALES KPI CARDS */}
      {activeReportTab === 'sales' && (
        <div style={{ marginBottom: '20px' }}>
          <div className="reports-kpi-grid" style={{ marginBottom: '14px' }}>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Gross Revenue</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
                {currency}{(summary?.grossSales || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Net Sales (Excl. Tax)</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#3b82f6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
                {currency}{(summary?.netSales || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>GST & Taxes Collected</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#ea580c', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
                {currency}{(summary?.totalTaxes || 0).toLocaleString('en-IN')}
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Average Order Value (AOV)</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#8b5cf6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
                {currency}{summary?.averageOrderValue || '0.00'}
              </div>
            </div>
          </div>

          {/* Payment Split Widget */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 18px',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              📊 Payment Modes Breakdown:
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 700, background: '#dcfce7', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px' }}>
                💵 Cash: <strong>{currency}{(summary?.paymentBreakdown?.cash || 0).toLocaleString('en-IN')}</strong>
              </span>
              <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 700, background: '#eff6ff', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px' }}>
                📱 UPI: <strong>{currency}{(summary?.paymentBreakdown?.upi || 0).toLocaleString('en-IN')}</strong>
              </span>
              <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 700, background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '4px 10px', borderRadius: '6px' }}>
                💳 Card: <strong>{currency}{(summary?.paymentBreakdown?.card || 0).toLocaleString('en-IN')}</strong>
              </span>
              <span style={{ fontSize: '12px', color: '#9a3412', fontWeight: 700, background: '#fff7ed', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px' }}>
                🍽️ Dine-In: <strong>{summary?.diningBreakdown?.dineIn || 0}</strong> | 🛍️ Takeaway: <strong>{summary?.diningBreakdown?.takeaway || 0}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. ITEM PERFORMANCE KPI CARDS */}
      {activeReportTab === 'items' && (
        <div className="reports-kpi-grid">
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Total Items Sold</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.totalItemsSold || 0} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>units</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Total Item Sales</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#3b82f6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{(summary?.totalItemRevenue || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Best-Selling Item</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c', fontFamily: "'Outfit', sans-serif", lineHeight: 1.2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={summary?.topSellingItem || 'N/A'}>
              {summary?.topSellingItem || 'N/A'}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Top Category</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#8b5cf6', fontFamily: "'Outfit', sans-serif", lineHeight: 1.2, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={summary?.topCategory || 'Main Course'}>
              {summary?.topCategory || 'Main Course'}
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDER ANALYTICS KPI CARDS */}
      {activeReportTab === 'orders' && (
        <div className="reports-kpi-grid">
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Total Orders Placed</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#3b82f6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.totalOrders || 0}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Order Fulfillment Rate</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.completionRate || '100'}%
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ef4444', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Cancelled Orders</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#ef4444', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.cancelledOrders || 0} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>({summary?.cancellationRate || '0.0'}%)</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Peak Rush Hour</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#ea580c', fontFamily: "'Outfit', sans-serif", lineHeight: 1.2, margin: 0, whiteSpace: 'nowrap' }}>
              ⚡ {summary?.peakHourWindow || (summary?.peakHour ? summary.peakHour.split('(')[0].trim() : '01:00 PM – 02:00 PM')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap' }}>
              {summary?.peakOrdersCount > 0 ? `${summary.peakOrdersCount} orders during rush` : 'Highest order volume'}
            </div>
          </div>
        </div>
      )}

      {/* 4. WAITER REPORTS KPI CARDS */}
      {activeReportTab === 'waiter' && (
        <div className="reports-kpi-grid">
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Total Waiter Revenue</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{(summary?.totalWaiterRevenue || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Orders Served</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#3b82f6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.totalOrdersServed || 0}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Active Waiters On Duty</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.activeWaitersOnDuty || 0} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>/ {summary?.totalWaiters || waiterData.length || 0}</span>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Avg Order Value</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#8b5cf6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{summary?.averageOrderValue || '0.00'}
            </div>
          </div>
        </div>
      )}

      {/* 5. KITCHEN REPORTS KPI CARDS */}
      {activeReportTab === 'kitchen' && (
        <div className="reports-kpi-grid">
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Dishes Prepared</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#ea580c', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.totalDishesPrepared || 0}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Food Revenue Generated</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{(summary?.foodRevenueGenerated || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Active Food Categories</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.activeCategories ?? summary?.activeFoodItems ?? 0}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Avg Prep Time</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#8b5cf6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {summary?.avgPrepTime || '15 mins'}
            </div>
          </div>
        </div>
      )}

      {/* 6. TAX & SETTLEMENT KPI CARDS */}
      {activeReportTab === 'tax' && (
        <div className="reports-kpi-grid">
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Total Taxable Sales</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#16a34a', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{(summary?.totalTaxable || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Total GST Collected (5%)</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#ea580c', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{(summary?.totalGST || 0).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
              CGST: {currency}{(summary?.totalCGST || 0).toLocaleString('en-IN')} · SGST: {currency}{(summary?.totalSGST || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Cash In Drawer</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#3b82f6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{(summary?.cashInDrawer || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #8b5cf6', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', minHeight: '94px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', whiteSpace: 'nowrap' }}>Digital Settlements (UPI/Card)</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#8b5cf6', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'baseline', gap: '6px', lineHeight: 1.2, margin: 0 }}>
              {currency}{(summary?.digitalSettlement || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* SEARCH AND FILTERS TOOLBAR */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
      }}>
        {/* Row 1: Search & Contextual Category/Payment Filter & Reset */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 320px', minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
            <input
              type="text"
              placeholder={
                activeReportTab === 'waiter' ? "Search waiter name, phone, table..." :
                activeReportTab === 'kitchen' ? "Search food item or category..." :
                activeReportTab === 'items' ? "Search item name or category..." :
                activeReportTab === 'sales' ? "Search order #, customer, table..." :
                activeReportTab === 'orders' ? "Search order #, dining type..." :
                "Search invoice # or payment mode..."
              }
              value={searchQuery}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.code === 'Space' || e.keyCode === 32) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/\s+/g, '');
                setSearchQuery(val);
                setPage(0);
              }}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 12px 0 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, flexWrap: 'nowrap' }}>
            {/* Category Filter for Kitchen & Item reports */}
            {(activeReportTab === 'kitchen' || activeReportTab === 'items') && (
              <select
                value={filterKitchenCategory}
                onChange={(e) => setFilterKitchenCategory(e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#f8fafc',
                  outline: 'none',
                  fontWeight: 600,
                  color: '#334155',
                  boxSizing: 'border-box',
                  minWidth: '160px'
                }}
              >
                <option value="All">All Categories</option>
                {liveCategories.map(c => {
                  const cName = typeof c === 'string' ? c : (c.name || c.categoryName || c.title || '');
                  const cId = typeof c === 'object' ? (c._id || c.id || cName) : c;
                  if (!cName) return null;
                  return <option key={cId} value={cName}>{cName}</option>;
                })}
              </select>
            )}

            {/* Payment Mode Filter for Sales report */}
            {activeReportTab === 'sales' && (
              <select
                value={filterPaymentMode}
                onChange={(e) => setFilterPaymentMode(e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  background: '#f8fafc',
                  outline: 'none',
                  fontWeight: 600,
                  color: '#334155',
                  boxSizing: 'border-box',
                  minWidth: '150px'
                }}
              >
                <option value="All">All Payments</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
              </select>
            )}

            {/* Reset Filters */}
            {(dateStart || dateEnd || searchQuery || filterKitchenCategory !== 'All' || filterPaymentMode !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                style={{
                  height: '38px',
                  padding: '0 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Date Presets & Date Pickers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #f1f5f9'
        }}>
          {/* Quick Date Presets */}
          <div style={{
            display: 'inline-flex',
            gap: '4px',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '8px',
            alignItems: 'center'
          }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleDatePreset(p.id)}
                style={{
                  height: '28px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: datePreset === p.id ? '#ff5a1f' : 'transparent',
                  color: datePreset === p.id ? '#ffffff' : '#475569',
                  fontSize: '12px',
                  fontWeight: datePreset === p.id ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              Custom:
            </span>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => { setDateStart(e.target.value); setDatePreset('custom'); }}
              title="From Date"
              style={{
                height: '32px',
                padding: '0 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                background: '#f8fafc',
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>to</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => { setDateEnd(e.target.value); setDatePreset('custom'); }}
              title="To Date"
              style={{
                height: '32px',
                padding: '0 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                background: '#f8fafc',
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>
      </div>

      {/* REPORT DATA TABLES */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div className="reports-table-container" style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
          
          {/* TAB 1: SALES & REVENUE TABLE */}
          {activeReportTab === 'sales' && (
            <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ width: '60px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>S.NO</th>
                  <th style={{ minWidth: '170px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>DATE & TIME</th>
                  <th style={{ minWidth: '180px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>TABLE / TYPE</th>
                  <th style={{ minWidth: '130px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>PAYMENT</th>
                  <th style={{ minWidth: '130px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>GROSS TOTAL</th>
                  <th style={{ minWidth: '110px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>DISCOUNT</th>
                  <th style={{ minWidth: '130px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>NET SALES</th>
                  <th style={{ minWidth: '110px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ minWidth: '110px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading sales reports...
                    </td>
                  </tr>
                ) : salesData.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      No sales transaction records found for this period.
                    </td>
                  </tr>
                ) : (
                  salesData.map((row, index) => (
                    <tr key={row.id || index} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: '#0f172a', fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {currentPagination.page * currentPagination.limit + index + 1}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {row.formattedDateTime}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          {row.table}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: row.paymentMode === 'Cash' ? '#dcfce7' : (row.paymentMode === 'UPI' ? '#eff6ff' : '#f3e8ff'),
                          color: row.paymentMode === 'Cash' ? '#166534' : (row.paymentMode === 'UPI' ? '#1e40af' : '#6b21a8')
                        }}>
                          {row.paymentMode}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '13.5px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {currency}{row.grossAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: row.discount > 0 ? '#ef4444' : '#94a3b8', fontSize: '12.5px', fontWeight: 600, fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {row.discount > 0 ? `-${currency}${row.discount}` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#16a34a', fontSize: '14px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {currency}{row.netAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          background: row.isCancelled ? '#fee2e2' : '#dcfce7',
                          color: row.isCancelled ? '#991b1b' : '#166534',
                          textTransform: 'uppercase'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForReceipt(row.rawOrder || row)}
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            color: '#059669',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <ReceiptIcon size={13} color="#059669" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: ITEM PERFORMANCE TABLE */}
          {activeReportTab === 'items' && (
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ width: '60px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>S.NO</th>
                  <th style={{ minWidth: '240px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>ITEM NAME</th>
                  <th style={{ minWidth: '160px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>CATEGORY</th>
                  <th style={{ minWidth: '130px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>UNIT PRICE</th>
                  <th style={{ minWidth: '140px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>QUANTITY SOLD</th>
                  <th style={{ minWidth: '160px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>TOTAL REVENUE</th>
                  <th style={{ minWidth: '140px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>SALES SHARE</th>
                  <th style={{ minWidth: '130px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>DEMAND STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading item performance...
                    </td>
                  </tr>
                ) : itemsData.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      No item sales records found for this period.
                    </td>
                  </tr>
                ) : (
                  itemsData.map((row, index) => (
                    <tr key={row.id || index} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: '#0f172a', fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {currentPagination.page * currentPagination.limit + index + 1}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>
                        {row.name}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          {row.category}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '13px', fontFamily: "'Outfit', sans-serif" }}>
                        {currency}{Number(row.price || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 900, color: '#ea580c', fontSize: '14px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {row.quantitySold} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>sold</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '14px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {currency}{row.totalRevenue.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 800, fontSize: '12px', color: '#3b82f6', background: '#eff6ff', padding: '3px 8px', borderRadius: '10px' }}>
                          {row.contributionPct}%
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: row.demandStatus === 'Best Seller' ? '#ffedd5' : (row.demandStatus === 'Popular' ? '#eff6ff' : '#f1f5f9'),
                          color: row.demandStatus === 'Best Seller' ? '#9a3412' : (row.demandStatus === 'Popular' ? '#1e40af' : '#64748b'),
                          border: row.demandStatus === 'Best Seller' ? '1px solid #fed7aa' : '1px solid transparent'
                        }}>
                          {row.demandStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: ORDER ANALYTICS TABLE */}
          {activeReportTab === 'orders' && (
            <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ width: '60px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>S.NO</th>
                  <th style={{ minWidth: '170px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>DATE & TIME</th>
                  <th style={{ minWidth: '180px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>DINING OPTION</th>
                  <th style={{ minWidth: '240px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>ITEMS SUMMARY</th>
                  <th style={{ minWidth: '140px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>BILL AMOUNT</th>
                  <th style={{ minWidth: '120px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>STATUS</th>
                  <th style={{ minWidth: '110px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading orders analytics...
                    </td>
                  </tr>
                ) : ordersData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      No order records found for this period.
                    </td>
                  </tr>
                ) : (
                  ordersData.map((row, index) => (
                    <tr key={row.id || index} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: '#0f172a', fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {currentPagination.page * currentPagination.limit + index + 1}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {row.dateTime}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          whiteSpace: 'nowrap'
                        }}>
                          {row.diningType}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', color: '#334155' }}>
                        {row.itemsSummary}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '14px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {currency}{row.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          background: row.isCancelled ? '#fee2e2' : '#dcfce7',
                          color: row.isCancelled ? '#991b1b' : '#166534',
                          textTransform: 'uppercase'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedOrderForView(row.rawOrder || row)}
                          style={{
                            background: '#fff0e6',
                            border: '1px solid #ffd8bf',
                            color: '#ff7a00',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <EyeIcon size={13} color="#ff7a00" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 4: WAITER PERFORMANCE TABLE */}
          {activeReportTab === 'waiter' && (
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ width: '70px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>S.NO</th>
                  <th style={{ minWidth: '220px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>WAITER NAME</th>
                  <th style={{ minWidth: '140px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>DUTY STATUS</th>
                  <th style={{ minWidth: '180px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>ASSIGNED TABLES</th>
                  <th style={{ minWidth: '160px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>TOTAL REVENUE</th>
                  <th style={{ minWidth: '160px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>AVG ORDER VALUE</th>
                  <th style={{ minWidth: '130px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading waiter reports...
                    </td>
                  </tr>
                ) : waiterData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      No waiter performance records found for this period.
                    </td>
                  </tr>
                ) : (
                  waiterData.map((w, index) => (
                    <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9', height: '62px', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '13px', color: '#0f172a', fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {currentPagination.page * currentPagination.limit + index + 1}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: '#ecfdf5',
                            border: '1.5px solid #a7f3d0',
                            color: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 800,
                            flexShrink: 0
                          }}>
                            {toDisplayText(w.name, 'W').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                              {toDisplayText(w.name, 'Waiter')}
                            </div>
                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap' }}>
                              {toDisplayText(w.email)} {w.phone ? `· ${toDisplayText(w.phone)}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          letterSpacing: '0.3px',
                          width: '105px',
                          minWidth: '105px',
                          whiteSpace: 'nowrap',
                          boxSizing: 'border-box',
                          flexShrink: 0,
                          backgroundColor: toDisplayText(w.dutyStatus) === 'ON_DUTY' ? '#dcfce7' : '#f1f5f9',
                          color: toDisplayText(w.dutyStatus) === 'ON_DUTY' ? '#166534' : '#64748b',
                          border: toDisplayText(w.dutyStatus) === 'ON_DUTY' ? '1.5px solid #86efac' : '1.5px solid #cbd5e1'
                        }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: toDisplayText(w.dutyStatus) === 'ON_DUTY' ? '#16a34a' : '#94a3b8', flexShrink: 0 }}></span>
                          {toDisplayText(w.dutyStatus) === 'ON_DUTY' ? 'ON DUTY' : 'OFF DUTY'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600, display: 'inline-block' }}>
                          {Array.isArray(w.assignedTablesList) && w.assignedTablesList.length > 0 ? w.assignedTablesList.map(t => toDisplayText(t)).join(', ') : 'None'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '14.5px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {currency}{Number(w.totalRevenue || 0).toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '13.5px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {currency}{toDisplayText(w.averageOrderValue, '0.00')}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedWaiterOrdersModal(w)}
                          title="View Orders Fulfilled"
                          style={{
                            background: '#fff0e6',
                            border: '1px solid #ffd8bf',
                            color: 'var(--primary, #ff7a00)',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '5px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <EyeIcon size={14} color="var(--primary, #ff7a00)" />
                          Orders ({Number(w.ordersServed || w.orders?.length || 0)})
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 5: KITCHEN OPERATIONS TABLE */}
          {activeReportTab === 'kitchen' && (
            <table style={{ width: '100%', minWidth: '1100px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ width: '70px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>S.NO</th>
                  <th style={{ minWidth: '240px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>FOOD ITEM</th>
                  <th style={{ minWidth: '160px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>CATEGORY</th>
                  <th style={{ minWidth: '160px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>QUANTITY PREPARED</th>
                  <th style={{ minWidth: '150px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>AVG PREP TIME</th>
                  <th style={{ minWidth: '180px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>REVENUE GENERATED</th>
                  <th style={{ minWidth: '150px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>KITCHEN STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading kitchen reports...
                    </td>
                  </tr>
                ) : kitchenData.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      No kitchen preparation records found for this period.
                    </td>
                  </tr>
                ) : (
                  kitchenData.map((k, index) => {
                    const statusStr = toDisplayText(k.kitchenStatus || k.status, 'Completed');
                    const isInProgress = statusStr === 'In Progress' || statusStr === 'Preparing';
                    const isReady = statusStr === 'Ready' || statusStr === 'High Demand';

                    let badgeBg = '#ecfdf5';
                    let badgeBorder = '#a7f3d0';
                    let badgeText = '#065f46';
                    let dotColor = '#10b981';

                    if (isInProgress) {
                      badgeBg = '#fff7ed';
                      badgeBorder = '#fed7aa';
                      badgeText = '#9a3412';
                      dotColor = '#f59e0b';
                    } else if (isReady) {
                      badgeBg = '#eff6ff';
                      badgeBorder = '#bfdbfe';
                      badgeText = '#1e40af';
                      dotColor = '#3b82f6';
                    }

                    return (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', height: '62px', transition: 'background-color 0.15s' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800, fontSize: '13px', color: '#0f172a', fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          {currentPagination.page * currentPagination.limit + index + 1}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', fontSize: '13.5px', textAlign: 'left' }}>
                          {toDisplayText(k.foodItem || k.itemName, 'Food Item')}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: '11.5px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: 600 }}>
                            {toDisplayText(k.category, 'Main Course')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 800, color: '#ea580c', fontSize: '14px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                          {Number(k.quantityPrepared || 0)} <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>dishes</span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {toDisplayText(k.avgPrepTime, '15 mins')}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '14.5px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                          {currency}{Number(k.revenueGenerated || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 800,
                            backgroundColor: badgeBg,
                            border: `1px solid ${badgeBorder}`,
                            color: badgeText
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dotColor }}></span>
                            {statusStr}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* TAB 6: TAX & SETTLEMENT TABLE */}
          {activeReportTab === 'tax' && (
            <table style={{ width: '100%', minWidth: '1050px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ width: '60px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>S.NO</th>
                  <th style={{ minWidth: '150px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>INVOICE #</th>
                  <th style={{ minWidth: '130px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', whiteSpace: 'nowrap' }}>DATE</th>
                  <th style={{ minWidth: '140px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>TAXABLE AMOUNT</th>
                  <th style={{ minWidth: '120px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>CGST (2.5%)</th>
                  <th style={{ minWidth: '120px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>SGST (2.5%)</th>
                  <th style={{ minWidth: '120px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>TOTAL GST</th>
                  <th style={{ minWidth: '140px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>GROSS TOTAL</th>
                  <th style={{ minWidth: '120px', padding: '14px 16px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>MODE</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading tax settlement reports...
                    </td>
                  </tr>
                ) : taxData.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '14px' }}>
                      No tax settlement records found for this period.
                    </td>
                  </tr>
                ) : (
                  taxData.map((row, index) => (
                    <tr key={row.id || index} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, fontSize: '13px', color: '#0f172a', fontFamily: 'monospace', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {currentPagination.page * currentPagination.limit + index + 1}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>
                        {row.invoiceNo}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12.5px', color: '#475569', whiteSpace: 'nowrap' }}>
                        {row.date}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '13.5px', fontFamily: "'Outfit', sans-serif" }}>
                        {currency}{row.taxableAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontSize: '12.5px', fontFamily: "'Outfit', sans-serif" }}>
                        {currency}{row.cgst.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#64748b', fontSize: '12.5px', fontFamily: "'Outfit', sans-serif" }}>
                        {currency}{row.sgst.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#ea580c', fontSize: '13.5px', fontFamily: "'Outfit', sans-serif" }}>
                        {currency}{row.totalTax.toFixed(2)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 900, color: '#16a34a', fontSize: '14px', fontFamily: "'Outfit', sans-serif", whiteSpace: 'nowrap' }}>
                        {currency}{row.grossAmount.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 9px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 800,
                          background: row.paymentMode === 'Cash' ? '#dcfce7' : '#eff6ff',
                          color: row.paymentMode === 'Cash' ? '#166534' : '#1e40af'
                        }}>
                          {row.paymentMode}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* PAGINATION FOOTER */}
      {(currentPagination.totalPages > 1 || currentPagination.totalItems > 0) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '12px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {currentPagination.totalItems === 0 ? 0 : currentPagination.page * currentPagination.limit + 1} to {Math.min((currentPagination.page + 1) * currentPagination.limit, currentPagination.totalItems)} of {currentPagination.totalItems} records
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handlePageChange(currentPagination.page - 1)}
              disabled={currentPagination.page === 0}
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: currentPagination.page === 0 ? '#f8fafc' : '#ffffff',
                color: currentPagination.page === 0 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: currentPagination.page === 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum - 1)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: currentPagination.page + 1 === pageNum ? 700 : 500,
                  border: currentPagination.page + 1 === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: currentPagination.page + 1 === pageNum ? '#000000' : '#ffffff',
                  color: currentPagination.page + 1 === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxSizing: 'border-box',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(currentPagination.page + 1)}
              disabled={currentPagination.page >= currentPagination.totalPages - 1 || currentPagination.totalPages === 0}
              style={{
                height: '32px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (currentPagination.page >= currentPagination.totalPages - 1 || currentPagination.totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (currentPagination.page >= currentPagination.totalPages - 1 || currentPagination.totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (currentPagination.page >= currentPagination.totalPages - 1 || currentPagination.totalPages === 0) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* WAITER ORDERS MODAL */}
      <Modal
        isOpen={!!selectedWaiterOrdersModal}
        onClose={() => setSelectedWaiterOrdersModal(null)}
        title={`Orders Fulfilled by ${selectedWaiterOrdersModal?.name || 'Waiter'}`}
        maxWidth="720px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', alignItems: 'center', background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Serving Staff</span>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{toDisplayText(selectedWaiterOrdersModal?.name, 'Waiter')}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Orders Fulfilled</span>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#2563eb', fontFamily: "'Outfit', sans-serif" }}>
                {Number(selectedWaiterOrdersModal?.orders?.length || selectedWaiterOrdersModal?.ordersServed || 0)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Total Revenue</span>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
                {currency}{Number(selectedWaiterOrdersModal?.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Order ID</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Table</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Items</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Total</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(selectedWaiterOrdersModal?.orders || []).map((ord, idx) => (
                  <tr key={ord.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: 'monospace' }}>#{toDisplayText(ord.orderId || ord.id)}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>Table {toDisplayText(ord.tableNumber || ord.tableNo || ord.table)}</td>
                    <td style={{ padding: '10px 12px', maxWidth: '200px' }}>
                      <div style={{ fontSize: '12px', color: '#334155' }}>
                        {(ord.items || []).length > 0
                          ? ord.items.map(i => `${i.quantity || i.qty || 1}x ${toDisplayText(i.name)}`).join(', ')
                          : 'Food Order'}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
                      {currency}{Number(getOrderTotalAmount(ord) || ord.total || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 800,
                        background: '#dcfce7',
                        color: '#166534',
                        textTransform: 'uppercase'
                      }}>
                        {toDisplayText(ord.status, 'Served')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        type="button"
                        title="View Receipt"
                        onClick={() => setSelectedOrderForReceipt(ord)}
                        style={{
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          color: '#059669',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        <ReceiptIcon size={14} color="#059669" />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}

                {(!selectedWaiterOrdersModal?.orders || selectedWaiterOrdersModal.orders.length === 0) && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                      No order details found for this waiter in the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              type="button"
              className="btn btn-black"
              onClick={() => setSelectedWaiterOrdersModal(null)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                background: '#0f172a',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* VIEW ORDER DETAILS MODAL */}
      <Modal
        isOpen={!!selectedOrderForView}
        onClose={() => setSelectedOrderForView(null)}
        title={`Order Details #${toDisplayText(selectedOrderForView?.orderNumber || selectedOrderForView?.id || '')}`}
        maxWidth="500px"
      >
        {selectedOrderForView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>TABLE / TYPE</span>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>{toDisplayText(selectedOrderForView.diningType || selectedOrderForView.table)}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>PAYMENT</span>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e40af' }}>{toDisplayText(selectedOrderForView.paymentMode || selectedOrderForView.paymentStatus, 'Paid')}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 800 }}>STATUS</span>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#16a34a' }}>{toDisplayText(selectedOrderForView.status)?.toUpperCase()}</div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#f1f5f9', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', color: '#475569' }}>
                Items Ordered
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(extractOrderItems(selectedOrderForView) || []).length > 0 ? (
                  extractOrderItems(selectedOrderForView).map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                      <span style={{ color: '#0f172a', fontWeight: 600 }}>{it.quantity || it.qty || 1}x {toDisplayText(it.name)}</span>
                      <span style={{ fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                        {currency}{(Number(it.price || 0) * (it.quantity || it.qty || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#64748b' }}>{selectedOrderForView.itemsSummary || '1x Food Items Combo'}</div>
                )}
              </div>
              <div style={{ padding: '12px 14px', background: '#fff7ed', borderTop: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Total Amount</span>
                <span style={{ color: '#ea580c', fontSize: '16px', fontFamily: "'Outfit', sans-serif" }}>
                  {currency}{Number(getOrderTotalAmount(selectedOrderForView) || selectedOrderForView.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => setSelectedOrderForView(null)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* VIEW RECEIPT MODAL */}
      <Modal
        isOpen={!!selectedOrderForReceipt}
        onClose={() => setSelectedOrderForReceipt(null)}
        title={`Receipt #${toDisplayText(selectedOrderForReceipt?.orderNumber || selectedOrderForReceipt?.id || '')}`}
        maxWidth="420px"
      >
        {selectedOrderForReceipt && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '10px',
            padding: '20px',
            background: '#fafafa',
            border: '1.5px dashed #cbd5e1',
            borderRadius: '12px',
            fontFamily: "'Courier New', Courier, monospace"
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: '#0f172a' }}>
                {toDisplayText(activeRestaurant?.name || activeRestaurant, 'Serviq Restaurant')}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Official Order Receipt</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Order #: {toDisplayText(selectedOrderForReceipt.orderNumber || selectedOrderForReceipt.id)}</span>
              <span>Table: {toDisplayText(selectedOrderForReceipt.table || selectedOrderForReceipt.tableNumber || '-')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
              <span>Mode: {toDisplayText(selectedOrderForReceipt.paymentMode, 'Cash')}</span>
              <span>{selectedOrderForReceipt.date || formatDateDMY(new Date())}</span>
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(extractOrderItems(selectedOrderForReceipt) || []).length > 0 ? (
                extractOrderItems(selectedOrderForReceipt).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                    <span>{it.quantity || it.qty || 1}x {toDisplayText(it.name)}</span>
                    <span style={{ fontWeight: 700 }}>{currency}{(Number(it.price || 0) * (it.quantity || it.qty || 1)).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span>1x Food & Beverage Order</span>
                  <span style={{ fontWeight: 700 }}>{currency}{Number(getOrderTotalAmount(selectedOrderForReceipt) || selectedOrderForReceipt.totalAmount || 0).toFixed(2)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>
              <span>GRAND TOTAL</span>
              <span style={{ color: '#16a34a' }}>{currency}{Number(getOrderTotalAmount(selectedOrderForReceipt) || selectedOrderForReceipt.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '8px',
                  background: '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
                onClick={() => window.print()}
              >
                <ReceiptIcon size={15} color="#fff" />
                Print Receipt
              </button>
              <button
                type="button"
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedOrderForReceipt(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
