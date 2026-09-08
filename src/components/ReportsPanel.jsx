import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

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

import ReportsApi from '../api/Reports';
import OrderApi from '../api/Order.js';
import UserApi from '../api/User.js';
import TableApi from '../api/Table.js';
import apiClient from '../config/index.js';
import MenuApi from '../api/Menu.js';
import SearchableSelect from './SearchableSelect.jsx';
import { formatDateDMY } from '../helper/DateHelper.js';

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
  if (!res || !res.status) return null;
  const payload = res.response;
  if (!payload) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.reports)) return payload.reports;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data?.reports)) return payload.data.reports;
  if (Array.isArray(payload.data?.items)) return payload.data.items;
  if (Array.isArray(payload.data?.data)) return payload.data.data;
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
    entity.branchName
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

// Helper: Calculate Waiter Reports from restaurant orders and staff
const computeWaiterReports = (ordersList = [], staffList = [], tablesList = [], filters = {}, branchesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  // 1. Filter orders strictly by branch and date
  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const ordDate = o.createdAt ? o.createdAt.split('T')[0] : (o.date || '');
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  // 2. Filter staff strictly by branch if specific branch is active
  const branchStaff = isBranchFiltered 
    ? (staffList || []).filter(s => isEntityInBranch(s, selectedBranchId, branchesList))
    : (staffList || []);

  // Filter tables strictly by branch
  const branchTables = isBranchFiltered
    ? (tablesList || []).filter(t => isEntityInBranch(t, selectedBranchId, branchesList))
    : (tablesList || []);

  // 3. Identify Waiters
  let waiters = branchStaff.filter(s => {
    const roleStr = String(s.role || s.roleName || s.designation || '').toLowerCase();
    return roleStr.includes('waiter') || roleStr.includes('server') || roleStr.includes('steward');
  });

  // If no explicit waiters, include all non-admin staff of this branch
  if (waiters.length === 0 && branchStaff.length > 0) {
    const nonAdmin = branchStaff.filter(s => {
      const roleStr = String(s.role || s.roleName || '').toLowerCase();
      return !roleStr.includes('kitchen') && !roleStr.includes('superadmin') && !roleStr.includes('chef') && !roleStr.includes('cook');
    });
    if (nonAdmin.length > 0) waiters = nonAdmin;
  }

  // If still empty, infer from branch orders
  if (waiters.length === 0) {
    const orderWaiterNames = Array.from(new Set(filteredOrders.map(o => o.waiter || o.waiterName || o.server).filter(Boolean)));
    if (orderWaiterNames.length > 0) {
      waiters = orderWaiterNames.map((name, i) => ({
        id: `waiter-${i + 1}`,
        _id: `waiter-${i + 1}`,
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@serviq.in`,
        phone: '',
        status: 'Active',
        dutyStatus: 'ON_DUTY',
        branchId: selectedBranchId
      }));
    } else {
      waiters = [];
    }
  }

  // 4. Map orders to waiters and aggregate metrics
  const waiterRows = waiters.map((w, wIdx) => {
    const wId = String(w.id || w._id || '');
    const wName = w.name || w.userName || w.fullName || `Waiter ${wIdx + 1}`;
    const wNameLower = wName.toLowerCase();

    // Find orders matched by waiter name or ID
    const assignedOrders = filteredOrders.filter(o => {
      const ordWaiter = String(o.waiter || o.waiterName || o.server || o.assignedStaff || '').toLowerCase();
      const ordWaiterId = String(o.waiterId || o.userId || '');
      return (ordWaiter && ordWaiter.includes(wNameLower)) || (ordWaiterId && ordWaiterId === wId);
    });

    const ordersServedCount = assignedOrders.filter(o => {
      const st = String(o.status || '').toLowerCase();
      return st !== 'cancelled' && st !== 'rejected';
    }).length;

    const totalRevenueNum = assignedOrders.reduce((sum, o) => {
      const rawTot = o.total || o.totalAmount || o.billAmount || 0;
      const num = typeof rawTot === 'number' ? rawTot : (parseFloat(String(rawTot).replace(/[^0-9.]/g, '')) || 0);
      return sum + num;
    }, 0);

    const aov = ordersServedCount > 0 ? (totalRevenueNum / ordersServedCount).toFixed(2) : '0.00';

    // Extract tables served by this waiter
    const assignedTables = Array.from(new Set(assignedOrders.map(o => {
      if (o.tableNumber) return `Table ${o.tableNumber}`;
      if (o.tableNo) return `Table ${o.tableNo}`;
      if (o.table) return String(o.table).startsWith('Table') ? o.table : `Table ${o.table}`;
      if (o.tableId && typeof o.tableId === 'object') return `Table ${o.tableId.tableNumber || o.tableId.name || '1'}`;
      return null;
    }).filter(Boolean)));

    // Normalize order list for detailed popup modal
    const normalizedOrders = assignedOrders.map((o, idx) => {
      const oId = o.orderId || o.id || (o._id ? String(o._id).slice(-5).toUpperCase() : `ORD-${idx + 101}`);
      const tNum = o.tableNumber || o.tableNo || (typeof o.table === 'object' ? (o.table?.tableNumber || o.table?.name) : o.table) || (typeof o.tableId === 'object' ? (o.tableId?.tableNumber || o.tableId?.name) : o.tableId) || `${idx + 1}`;
      const oTotal = typeof o.total === 'number' ? o.total : (parseFloat(String(o.total || 0).replace(/[^0-9.]/g, '')) || 0);

      let oItems = [];
      if (Array.isArray(o.items) && o.items.length > 0) {
        oItems = o.items.map(it => ({
          qty: it.quantity || it.qty || 1,
          name: it.name || it.menuItem?.name || 'Dish',
          price: it.price || 0
        }));
      }

      return {
        id: oId,
        table: String(tNum).replace(/^Table\s*/i, ''),
        items: oItems,
        total: oTotal,
        status: o.status || 'served',
        waiter: wName
      };
    });

    const isDutyActive = String(w.dutyStatus || w.status || 'Active').toLowerCase().includes('on') ||
      String(w.dutyStatus || w.status || 'Active').toLowerCase() === 'active';

    return {
      id: w.id || w._id || wId || `w-${wIdx}`,
      name: w.name || wName || 'Staff Member',
      phone: w.phone || w.mobileNumber || '',
      email: w.email || '',
      dutyStatus: isDutyActive ? 'ON_DUTY' : 'OFF_DUTY',
      assignedTablesList: assignedTables.length > 0 ? assignedTables : (Array.isArray(w.assignedTablesList) && w.assignedTablesList.length > 0 ? w.assignedTablesList : []),
      ordersServed: ordersServedCount,
      totalRevenue: totalRevenueNum,
      averageOrderValue: aov,
      totalOrders: assignedOrders.length,
      orders: normalizedOrders
    };
  });

  let data = waiterRows;

  // 5. Search Filter
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    data = data.filter(w => 
      (w.name || '').toLowerCase().includes(q) || 
      (w.email || '').toLowerCase().includes(q) || 
      (w.phone || '').toLowerCase().includes(q) ||
      (Array.isArray(w.assignedTablesList) && w.assignedTablesList.some(t => String(t).toLowerCase().includes(q)))
    );
  }

  // 6. Summary metrics
  const totalWaiters = data.length;
  const activeWaitersOnDuty = data.filter(w => w.dutyStatus === 'ON_DUTY').length;
  const totalOrdersServed = data.reduce((acc, w) => acc + (w.ordersServed || 0), 0);
  const totalWaiterRevenue = data.reduce((acc, w) => acc + (w.totalRevenue || 0), 0);
  const averageOrderValue = totalOrdersServed > 0 ? (totalWaiterRevenue / totalOrdersServed).toFixed(2) : '0.00';
  const avgEfficiency = averageOrderValue;

  const summary = {
    totalWaiters,
    activeWaitersOnDuty,
    totalOrdersServed,
    totalWaiterRevenue,
    averageOrderValue,
    avgEfficiency: `${avgEfficiency}`
  };

  // 7. Pagination
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

// Helper: Calculate Kitchen Preparation Reports strictly by branch
const computeKitchenReports = (ordersList = [], menuList = [], categoriesList = [], filters = {}, branchesList = []) => {
  const { dateStart, dateEnd, selectedBranchId, filterCategory = 'All', searchQuery, page = 0, limit = 10 } = filters;
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'All' && selectedBranchId !== 'ALL';

  // 1. Filter orders strictly by branch and date
  const filteredOrders = (ordersList || []).filter(o => {
    if (isBranchFiltered && !isEntityInBranch(o, selectedBranchId, branchesList)) return false;
    const ordDate = o.createdAt ? o.createdAt.split('T')[0] : (o.date || '');
    if (dateStart && ordDate && ordDate < dateStart) return false;
    if (dateEnd && ordDate && ordDate > dateEnd) return false;
    return true;
  });

  // 2. Aggregate dishes cooked / ordered in this branch
  const itemMap = new Map();

  filteredOrders.forEach(order => {
    const oStatus = String(order.status || '').toLowerCase();
    const orderItems = extractOrderItems(order);

    orderItems.forEach(it => {
      const name = toDisplayText(it.name || it.menuItem?.name || it.dishName || '').trim();
      if (!name) return;
      const nameLower = name.toLowerCase();
      const qty = Number(it.quantity || it.qty || 1);

      const matchedMenu = (menuList || []).find(m => {
        const mName = toDisplayText(m.name || m.dishName || '').trim().toLowerCase();
        return mName === nameLower || (m._id && (m._id === it.menuItemId || m._id === it.menuItem));
      });

      const price = Number(it.price || it.rate || matchedMenu?.price || 0);
      let cat = toDisplayText(it.category || it.categoryName || it.menuItem?.category || matchedMenu?.category || matchedMenu?.categoryName);
      if (!cat || cat === 'Uncategorized' || cat === 'null' || cat === 'undefined' || cat === 'N/A') {
        cat = 'Main Course';
      }

      let prep = toDisplayText(it.prepTime || it.preparationTime || matchedMenu?.prepTime || matchedMenu?.preparationTime);
      if (!prep || prep === 'N/A' || prep === 'null' || prep === 'undefined') {
        prep = '15 mins';
      }

      if (!itemMap.has(nameLower)) {
        itemMap.set(nameLower, {
          foodItem: name,
          itemName: name,
          category: cat,
          quantityPrepared: 0,
          avgPrepTime: prep,
          revenueGenerated: 0,
          kitchenStatus: oStatus === 'served' ? 'Completed' : (oStatus === 'ready' ? 'Ready' : (oStatus === 'preparing' ? 'In Progress' : 'Optimal')),
          status: 'Optimal'
        });
      }

      const entry = itemMap.get(nameLower);
      entry.quantityPrepared += qty;
      entry.revenueGenerated += (qty * price);
      if (oStatus === 'preparing') entry.kitchenStatus = 'In Progress';
      if (entry.quantityPrepared >= 8) entry.status = 'High Demand';
    });
  });

  let dishes = Array.from(itemMap.values());

  // 3. Filter by Category
  if (filterCategory && filterCategory !== 'All' && filterCategory !== 'ALL') {
    dishes = dishes.filter(d => String(d.category).toLowerCase() === String(filterCategory).toLowerCase());
  }

  // 4. Filter by Search Query
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    dishes = dishes.filter(d => d.foodItem.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
  }

  // 5. Summary KPI metrics
  const totalDishesPrepared = dishes.reduce((acc, d) => acc + d.quantityPrepared, 0);
  const foodRevenueGenerated = dishes.reduce((acc, d) => acc + d.revenueGenerated, 0);
  const activeCategories = Array.from(new Set(dishes.map(d => d.category))).length;
  
  const prepMinutes = dishes.map(d => parseInt(d.avgPrepTime) || 15);
  const avgMins = prepMinutes.length > 0 ? Math.round(prepMinutes.reduce((a, b) => a + b, 0) / prepMinutes.length) : 15;

  const summary = {
    totalDishesPrepared,
    foodRevenueGenerated,
    activeCategories,
    avgPrepTime: `${avgMins} mins`
  };

  // 6. Pagination
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

export default function ReportsPanel({
  orders = [],
  allOrders = [],
  staff = [],
  tables = [],
  menu = [],
  branches = [],
  selectedBranchId = null,
  activeRestaurant = {},
  initialTab = 'waiter'
}) {
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [activeReportTab, setActiveReportTab] = useState(initialTab === 'kitchen' ? 'kitchen' : 'waiter'); // 'waiter' | 'kitchen'
  
  // Kitchen filter states
  const [filterKitchenCategory, setFilterKitchenCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Live Context State from APIs
  const [liveOrders, setLiveOrders] = useState([]);
  const [liveStaff, setLiveStaff] = useState([]);
  const [liveTables, setLiveTables] = useState([]);
  const [liveCategories, setLiveCategories] = useState([]);
  const [liveMenu, setLiveMenu] = useState([]);

  // Modals for Waiter / Order details
  const [selectedOrderForView, setSelectedOrderForView] = useState(null);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState(null);
  const [selectedWaiterOrdersModal, setSelectedWaiterOrdersModal] = useState(null);

  const [loading, setLoading] = useState(false);
  const [waiterData, setWaiterData] = useState([]);
  const [kitchenData, setKitchenData] = useState([]);
  const [waiterTotalCount, setWaiterTotalCount] = useState(0);
  const [kitchenTotalCount, setKitchenTotalCount] = useState(0);
  const [summary, setSummary] = useState(null);

  const [pagination, setPagination] = useState({ page: 0, limit: 10, totalPages: 1, totalItems: 0 });

  const currency = activeRestaurant?.settings?.currency || '₹';
  const effectiveBranches = Array.isArray(branches) && branches.length > 0 ? branches : (activeRestaurant?.branches || []);

  // Fetch Live Operational Data across one or all branches
  useEffect(() => {
    let isMounted = true;
    const fetchLiveContext = async () => {
      try {
        const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All';
        
        let orderList = [];
        let staffList = [];
        let tableList = [];
        let menuList = [];

        if (isBranchFiltered) {
          const branchParam = { branchId: selectedBranchId, limit: 1000 };
          const [orderRes, staffRes, tableRes, catRes, menuRes] = await Promise.all([
            OrderApi.getOrders(branchParam).catch(() => null),
            UserApi.getUsers(branchParam).catch(() => null),
            TableApi.getTables(branchParam).catch(() => null),
            MenuApi.getCategories({ limit: 1000 }).catch(() => null),
            MenuApi.getMenuItems(branchParam).catch(() => null)
          ]);

          if (orderRes?.status && orderRes?.response) orderList = extractServerList(orderRes) || [];
          if (staffRes?.status && staffRes?.response) staffList = extractServerList(staffRes) || [];
          if (tableRes?.status && tableRes?.response) tableList = extractServerList(tableRes) || [];
          if (catRes?.status && catRes?.response) {
            const cd = catRes.response.data || catRes.response.categories || catRes.response;
            if (Array.isArray(cd)) setLiveCategories(cd);
          }
          if (menuRes?.status && menuRes?.response) menuList = extractServerList(menuRes) || [];
        } else {
          // All Branches: Fetch global + all branches in parallel
          const [globalOrders, globalStaff, globalTables, catRes, globalMenu] = await Promise.all([
            OrderApi.getOrders({ limit: 1000 }).catch(() => null),
            UserApi.getUsers({ limit: 1000 }).catch(() => null),
            TableApi.getTables({ limit: 1000 }).catch(() => null),
            MenuApi.getCategories({ limit: 1000 }).catch(() => null),
            MenuApi.getMenuItems({ limit: 1000 }).catch(() => null)
          ]);

          if (catRes?.status && catRes?.response) {
            const cd = catRes.response.data || catRes.response.categories || catRes.response;
            if (Array.isArray(cd)) setLiveCategories(cd);
          }

          orderList = extractServerList(globalOrders) || [];
          staffList = extractServerList(globalStaff) || [];
          tableList = extractServerList(globalTables) || [];
          menuList = extractServerList(globalMenu) || [];

          if (Array.isArray(effectiveBranches) && effectiveBranches.length > 0) {
            const branchPromises = effectiveBranches.map(async (b) => {
              const bId = b._id || b.id || b.branchId;
              if (!bId) return null;
              const [bOrders, bStaff, bTables, bMenu] = await Promise.all([
                OrderApi.getOrders({ branchId: bId, limit: 1000 }).catch(() => null),
                UserApi.getUsers({ branchId: bId, limit: 1000 }).catch(() => null),
                TableApi.getTables({ branchId: bId, limit: 1000 }).catch(() => null),
                MenuApi.getMenuItems({ branchId: bId, limit: 1000 }).catch(() => null)
              ]);
              return {
                orders: extractServerList(bOrders) || [],
                staff: extractServerList(bStaff) || [],
                tables: extractServerList(bTables) || [],
                menu: extractServerList(bMenu) || []
              };
            });

            const branchResults = await Promise.all(branchPromises);
            branchResults.forEach(res => {
              if (res) {
                if (res.orders.length > 0) orderList.push(...res.orders);
                if (res.staff.length > 0) staffList.push(...res.staff);
                if (res.tables.length > 0) tableList.push(...res.tables);
                if (res.menu.length > 0) menuList.push(...res.menu);
              }
            });
          }
        }

        if (!isMounted) return;

        // Deduplicate items
        const uniqueOrders = Array.from(new Map(orderList.map(o => [o._id || o.id || JSON.stringify(o), o])).values());
        const uniqueStaff = Array.from(new Map(staffList.map(s => [s._id || s.id || s.email || JSON.stringify(s), s])).values());
        const uniqueTables = Array.from(new Map(tableList.map(t => [t._id || t.id || t.tableNumber || JSON.stringify(t), t])).values());
        const uniqueMenu = Array.from(new Map(menuList.map(m => [m._id || m.id || m.name || JSON.stringify(m), m])).values());

        if (uniqueOrders.length > 0) setLiveOrders(uniqueOrders);
        if (uniqueStaff.length > 0) setLiveStaff(uniqueStaff);
        if (uniqueTables.length > 0) setLiveTables(uniqueTables);
        if (uniqueMenu.length > 0) setLiveMenu(uniqueMenu);
      } catch (e) {
        console.warn("Live context fetch error in ReportsPanel:", e);
      }
    };

    fetchLiveContext();
    return () => { isMounted = false; };
  }, [selectedBranchId, effectiveBranches.length]);

  // Derived effective collections strictly filtered by active branch
  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All';

  const baseOrders = (liveOrders.length > 0)
    ? liveOrders
    : ((orders && orders.length > 0) ? orders : (activeRestaurant?.orders || []));
  const effectiveOrders = isBranchFiltered
    ? baseOrders.filter(o => isEntityInBranch(o, selectedBranchId, effectiveBranches))
    : baseOrders;

  const baseStaff = (liveStaff.length > 0)
    ? liveStaff
    : ((staff && staff.length > 0) ? staff : (activeRestaurant?.staff || []));
  const effectiveStaff = isBranchFiltered
    ? baseStaff.filter(s => isEntityInBranch(s, selectedBranchId, effectiveBranches))
    : baseStaff;

  const baseTables = (liveTables.length > 0)
    ? liveTables
    : ((tables && tables.length > 0) ? tables : (activeRestaurant?.tables || []));
  const effectiveTables = isBranchFiltered
    ? baseTables.filter(t => isEntityInBranch(t, selectedBranchId, effectiveBranches))
    : baseTables;

  const baseMenu = (liveMenu.length > 0)
    ? liveMenu
    : ((menu && menu.length > 0) ? menu : (activeRestaurant?.menu || []));
  const effectiveMenu = isBranchFiltered
    ? baseMenu.filter(m => isEntityInBranch(m, selectedBranchId, effectiveBranches))
    : baseMenu;

  // Helper: Fetch server list across all branches if All Branches is selected
  const fetchMultiBranchReport = async (apiCall, filters) => {
    if (isBranchFiltered) {
      const res = await apiCall(filters).catch(() => null);
      let list = extractServerList(res) || [];
      if (Array.isArray(list)) {
        list = list.filter(item => isEntityInBranch(item, selectedBranchId, effectiveBranches));
      }
      return list;
    }

    // All Branches: query direct global + all branches in parallel
    const globalRes = await apiCall({ ...filters, branchId: undefined }).catch(() => null);
    const globalList = extractServerList(globalRes) || [];

    if (Array.isArray(effectiveBranches) && effectiveBranches.length > 0) {
      const branchPromises = effectiveBranches.map(b => {
        const bId = b._id || b.id || b.branchId;
        if (!bId) return null;
        return apiCall({ ...filters, branchId: bId }).catch(() => null);
      });

      const branchResults = await Promise.all(branchPromises);
      const combined = [...globalList];
      branchResults.forEach(res => {
        const bList = extractServerList(res);
        if (Array.isArray(bList) && bList.length > 0) {
          combined.push(...bList);
        }
      });

      return combined;
    }

    return globalList;
  };

  // Helper: Aggregate unique dishes from list
  const aggregateDishes = (dishList = []) => {
    const itemMap = new Map();

    dishList.forEach(k => {
      const foodItem = toDisplayText(k.foodItem || k.itemName || k.name || k.title, '').trim();
      if (!foodItem || foodItem.toLowerCase() === 'food item') return;
      const nameLower = foodItem.toLowerCase();

      const matchedMenu = (effectiveMenu || []).find(m => {
        const mName = toDisplayText(m.name || m.dishName || '').trim().toLowerCase();
        return mName === nameLower || (m._id && (m._id === k.menuItemId || m._id === k.itemId || m._id === k._id));
      });

      let cat = toDisplayText(k.category || k.categoryName);
      if (!cat || cat === 'Uncategorized' || cat === 'null' || cat === 'undefined' || cat === 'N/A') {
        cat = toDisplayText(matchedMenu?.category || matchedMenu?.categoryName, 'Main Course');
      }

      let prep = toDisplayText(k.avgPrepTime || k.prepTime);
      if (!prep || prep === 'N/A' || prep === 'null' || prep === 'undefined') {
        prep = toDisplayText(matchedMenu?.prepTime || matchedMenu?.preparationTime, '15 mins');
      }

      const qty = Number(k.quantityPrepared ?? k.qty ?? k.quantity ?? 0);
      const rate = Number(k.price || matchedMenu?.price || 0);
      const rev = Number(k.revenueGenerated ?? k.revenue ?? (qty * rate) ?? 0);
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
          revenueGenerated: rev
        });
      } else {
        const existing = itemMap.get(nameLower);
        existing.quantityPrepared += qty;
        existing.revenueGenerated += rev;
        if (status === 'In Progress') existing.kitchenStatus = 'In Progress';
        if (!existing.category || existing.category === 'Main Course') existing.category = cat;
      }
    });

    return Array.from(itemMap.values());
  };

  // Helper: Aggregate unique waiters from list
  const aggregateWaiters = (waiterList = []) => {
    const waiterMap = new Map();

    waiterList.forEach((w, idx) => {
      const name = toDisplayText(w.name || w.userName, 'Waiter').trim();
      const email = toDisplayText(w.email).trim();
      const phone = toDisplayText(w.phone || w.mobileNumber).trim();
      const id = String(w.id || w._id || w.userId || email || `w-${idx}`);
      const key = email ? email.toLowerCase() : (id ? id.toLowerCase() : name.toLowerCase());

      const dutyStatus = toDisplayText(w.dutyStatus || w.status, 'ON_DUTY');
      const assignedTables = Array.isArray(w.assignedTablesList) 
        ? w.assignedTablesList.map(t => toDisplayText(t))
        : (Array.isArray(w.tables) ? w.tables.map(t => toDisplayText(t)) : []);
      const ordersServed = Number(w.ordersServed || w.totalOrders || 0);
      const totalRevenue = Number(w.totalRevenue || w.revenue || 0);

      if (!waiterMap.has(key)) {
        waiterMap.set(key, {
          ...w,
          id,
          name,
          email,
          phone,
          dutyStatus,
          assignedTablesList: assignedTables,
          ordersServed,
          totalRevenue,
          averageOrderValue: toDisplayText(w.averageOrderValue || (ordersServed > 0 ? (totalRevenue / ordersServed).toFixed(2) : '0.00'))
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

  // Sync both tab counts accurately
  const syncBothTabCounts = async () => {
    try {
      const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All';
      const baseFilters = {
        startDate: dateStart,
        endDate: dateEnd,
        branchId: isBranchFiltered ? selectedBranchId : undefined,
        limit: 1000
      };

      const [rawWaiters, rawKitchen] = await Promise.all([
        fetchMultiBranchReport((f) => ReportsApi.getWaiterReports(f), baseFilters),
        fetchMultiBranchReport((f) => ReportsApi.getKitchenReports(f), baseFilters)
      ]);

      // 1. Sync Waiter Count
      const aggregatedWaiters = aggregateWaiters(rawWaiters);
      if (aggregatedWaiters.length > 0) {
        setWaiterTotalCount(aggregatedWaiters.length);
      } else {
        const computedW = computeWaiterReports(effectiveOrders, effectiveStaff, effectiveTables, {
          dateStart,
          dateEnd,
          selectedBranchId,
          searchQuery: '',
          page: 0,
          limit: 1000
        }, effectiveBranches);
        setWaiterTotalCount(computedW.totalItems || 0);
      }

      // 2. Sync Kitchen Count
      const aggregatedKitchen = aggregateDishes(rawKitchen);
      if (aggregatedKitchen.length > 0) {
        setKitchenTotalCount(aggregatedKitchen.length);
      } else {
        const computedK = computeKitchenReports(effectiveOrders, effectiveMenu, liveCategories, {
          dateStart,
          dateEnd,
          selectedBranchId,
          filterCategory: 'All',
          searchQuery: '',
          page: 0,
          limit: 1000
        }, effectiveBranches);
        setKitchenTotalCount(computedK.totalItems || 0);
      }
    } catch (err) {
      console.warn("syncBothTabCounts error:", err);
    }
  };

  useEffect(() => {
    syncBothTabCounts();
  }, [
    effectiveOrders.length,
    effectiveStaff.length,
    effectiveTables.length,
    effectiveMenu.length,
    dateStart,
    dateEnd,
    selectedBranchId
  ]);

  useEffect(() => {
    if (initialTab === 'kitchen' || initialTab === 'waiter') {
      setActiveReportTab(initialTab);
    }
  }, [initialTab]);

  const fetchReports = async (page = 0) => {
    setLoading(true);
    try {
      const filters = {
        startDate: dateStart,
        endDate: dateEnd,
        branchId: isBranchFiltered ? selectedBranchId : undefined,
        search: searchQuery,
        page: page + 1,
        limit: pagination.limit
      };

      if (activeReportTab === 'waiter') {
        const rawWaiters = await fetchMultiBranchReport((f) => ReportsApi.getWaiterReports(f), filters);
        let cleanWaiters = aggregateWaiters(rawWaiters);

        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          cleanWaiters = cleanWaiters.filter(w =>
            w.name.toLowerCase().includes(q) ||
            w.email.toLowerCase().includes(q) ||
            w.phone.toLowerCase().includes(q) ||
            w.assignedTablesList.some(t => String(t).toLowerCase().includes(q))
          );
        }

        if (cleanWaiters.length > 0) {
          setWaiterData(cleanWaiters);
          const totalOrdersServed = cleanWaiters.reduce((acc, w) => acc + (w.ordersServed || 0), 0);
          const totalWaiterRevenue = cleanWaiters.reduce((acc, w) => acc + (w.totalRevenue || 0), 0);
          const aov = totalOrdersServed > 0 ? (totalWaiterRevenue / totalOrdersServed).toFixed(2) : '0.00';
          const activeOnDuty = cleanWaiters.filter(w => toDisplayText(w.dutyStatus) === 'ON_DUTY').length;

          setSummary({
            totalWaiters: cleanWaiters.length,
            activeWaitersOnDuty: activeOnDuty,
            totalOrdersServed,
            totalWaiterRevenue,
            averageOrderValue: aov
          });

          const totalCount = cleanWaiters.length;
          setWaiterTotalCount(totalCount);
          setPagination(prev => ({
            ...prev,
            page: 0,
            totalPages: Math.max(1, Math.ceil(totalCount / pagination.limit)),
            totalItems: totalCount
          }));
        } else {
          // Automatic high-precision computation
          const computed = computeWaiterReports(effectiveOrders, effectiveStaff, effectiveTables, {
            dateStart,
            dateEnd,
            selectedBranchId,
            searchQuery,
            page,
            limit: pagination.limit
          }, effectiveBranches);
          setWaiterData(computed.data);
          setSummary(computed.summary);
          setWaiterTotalCount(computed.totalItems);
          setPagination(prev => ({
            ...prev,
            page,
            totalPages: computed.totalPages,
            totalItems: computed.totalItems
          }));
        }
      } else {
        filters.categoryId = (filterKitchenCategory && filterKitchenCategory !== 'All') ? filterKitchenCategory : undefined;
        const rawKitchen = await fetchMultiBranchReport((f) => ReportsApi.getKitchenReports(f), filters);
        let cleanKitchen = aggregateDishes(rawKitchen);

        // Apply client filters if present
        if (filterKitchenCategory && filterKitchenCategory !== 'All' && filterKitchenCategory !== 'ALL') {
          cleanKitchen = cleanKitchen.filter(k => String(k.category).toLowerCase() === String(filterKitchenCategory).toLowerCase());
        }
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          cleanKitchen = cleanKitchen.filter(k => k.foodItem.toLowerCase().includes(q) || k.category.toLowerCase().includes(q));
        }

        if (cleanKitchen.length > 0) {
          setKitchenData(cleanKitchen);

          const totalDishesPrepared = cleanKitchen.reduce((acc, d) => acc + d.quantityPrepared, 0);
          const foodRevenueGenerated = cleanKitchen.reduce((acc, d) => acc + d.revenueGenerated, 0);
          const activeCategories = Array.from(new Set(cleanKitchen.map(d => d.category).filter(Boolean))).length;
          const prepMinutes = cleanKitchen.map(d => parseInt(d.avgPrepTime) || 15);
          const avgMins = prepMinutes.length > 0 ? Math.round(prepMinutes.reduce((a, b) => a + b, 0) / prepMinutes.length) : 15;

          setSummary({
            totalDishesPrepared,
            foodRevenueGenerated,
            activeCategories,
            avgPrepTime: `${avgMins} mins`
          });

          const totalCount = cleanKitchen.length;
          setKitchenTotalCount(totalCount);
          setPagination(prev => ({
            ...prev,
            page: 0,
            totalPages: Math.max(1, Math.ceil(totalCount / pagination.limit)),
            totalItems: totalCount
          }));
        } else {
          // Automatic high-precision computation
          const computed = computeKitchenReports(effectiveOrders, effectiveMenu, liveCategories, {
            dateStart,
            dateEnd,
            selectedBranchId,
            filterCategory: filterKitchenCategory,
            searchQuery,
            page,
            limit: pagination.limit
          }, effectiveBranches);
          setKitchenData(computed.data);
          setSummary(computed.summary);
          setKitchenTotalCount(computed.totalItems);
          setPagination(prev => ({
            ...prev,
            page,
            totalPages: computed.totalPages,
            totalItems: computed.totalItems
          }));
        }
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
    searchQuery,
    selectedBranchId,
    pagination.limit,
    effectiveOrders.length,
    effectiveStaff.length,
    effectiveMenu.length
  ]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      fetchReports(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = pagination.page + 1;
    const total = Math.max(1, pagination.totalPages || 1);
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
    setFilterKitchenCategory('All');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Excel / CSV Export
  const exportToExcel = () => {
    let headers = [];
    let rows = [];
    let filename = '';

    if (activeReportTab === 'waiter') {
      headers = ['S.No', 'Waiter Name', 'Duty Status', 'Assigned Tables', 'Orders Served', `Revenue Generated (${currency})`, `Avg Order (${currency})`];
      rows = waiterData.map((r, i) => [
        i + 1,
        r.name,
        r.dutyStatus === 'ON_DUTY' ? 'On Duty' : 'Off Duty',
        (Array.isArray(r.assignedTablesList) && r.assignedTablesList.length > 0) ? r.assignedTablesList.join('; ') : 'None',
        r.ordersServed || r.totalOrders || 0,
        Number(r.totalRevenue || r.revenue || 0),
        r.averageOrderValue || '0.00'
      ]);
      filename = 'waiter_reports.csv';
    } else {
      headers = ['S.No', 'Food Item Name', 'Category', 'Quantity Prepared', 'Avg Prep Time', `Revenue (${currency})`, 'Status'];
      rows = kitchenData.map((r, i) => [
        i + 1,
        r.foodItem || r.itemName,
        r.category,
        r.quantityPrepared || 0,
        r.avgPrepTime || '15 mins',
        Number(r.revenueGenerated || r.revenue || 0),
        r.kitchenStatus || r.status || 'Completed'
      ]);
      filename = 'kitchen_reports.csv';
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Export
  const exportToPDF = () => {
    let reportTitle = activeReportTab === 'waiter' ? 'Waiter Performance Reports' : 'Kitchen Preparation Reports';
    let tableHeaders = [];
    let tableRows = [];

    if (activeReportTab === 'waiter') {
      tableHeaders = ['S.No', 'Waiter Name', 'Duty Status', 'Assigned Tables', 'Orders Served', 'Revenue', 'Avg Order Value'];
      tableRows = waiterData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.name}</strong></td>
          <td>${r.dutyStatus === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}</td>
          <td>${(Array.isArray(r.assignedTablesList) && r.assignedTablesList.length > 0) ? r.assignedTablesList.join(', ') : 'None'}</td>
          <td>${r.ordersServed || r.totalOrders || 0}</td>
          <td>${currency}${Number(r.totalRevenue || r.revenue || 0).toLocaleString()}</td>
          <td>${currency}${r.averageOrderValue}</td>
        </tr>
      `);
    } else {
      tableHeaders = ['S.No', 'Food Item Name', 'Category', 'Quantity Prepared', 'Avg Prep Time', 'Revenue', 'Status'];
      tableRows = kitchenData.map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${r.foodItem || r.itemName}</strong></td>
          <td>${r.category}</td>
          <td>${r.quantityPrepared}</td>
          <td>${r.avgPrepTime}</td>
          <td>${currency}${Number(r.revenueGenerated || r.revenue || 0).toLocaleString()}</td>
          <td>${r.kitchenStatus || r.status || 'Completed'}</td>
        </tr>
      `);
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle} - ${activeRestaurant.name || 'Serviq'}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #0f172a; }
            h1 { font-family: 'Outfit', sans-serif; font-size: 24px; margin-bottom: 4px; }
            p { font-size: 13px; color: #64748b; margin-top: 0; }
            .header-row { display: flex; justify-content: space-between; border-bottom: 2px solid #ff7a00; padding-bottom: 20px; margin-bottom: 30px; }
            .meta-block { text-align: right; font-size: 12px; line-height: 1.6; }
            .summary-bar { display: flex; gap: 20px; margin-bottom: 30px; }
            .summary-box { flex: 1; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 16px; background-color: #f8fafc; }
            .summary-label { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .summary-val { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 6px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; text-align: left; }
            th { background-color: #f1f5f9; padding: 12px 14px; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; border-bottom: 1.5px solid #cbd5e1; }
            td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
            tr:last-child td { border-bottom: none; }
            @media print {
              body { padding: 20px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-row">
            <div>
              <h1>${reportTitle}</h1>
              <p>${activeRestaurant.name || 'Serviq'} - Restaurant Operations Reports</p>
            </div>
            <div class="meta-block">
              <strong>Generated on:</strong> ${formatDateDMY(new Date())}<br>
              <strong>Date Range:</strong> ${dateStart ? formatDateDMY(dateStart) : 'All Time'} to ${dateEnd ? formatDateDMY(dateEnd) : 'Present'}
            </div>
          </div>

          <div class="summary-bar">
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Total Waiter Revenue' : 'Total Kitchen Revenue'}</div>
              <div class="summary-val">${currency}${(activeReportTab === 'waiter' ? (summary?.totalWaiterRevenue || 0) : (summary?.foodRevenueGenerated || 0)).toLocaleString()}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Orders Fulfilled' : 'Dishes Prepared'}</div>
              <div class="summary-val">${activeReportTab === 'waiter' ? (summary?.totalOrdersServed || 0) : (summary?.totalDishesPrepared || 0)}</div>
            </div>
            <div class="summary-box">
              <div class="summary-label">${activeReportTab === 'waiter' ? 'Waiters On Duty' : 'Active Food Categories'}</div>
              <div class="summary-val">${activeReportTab === 'waiter' ? `${summary?.activeWaitersOnDuty || 0} / ${summary?.totalWaiters || 0}` : (summary?.activeCategories || 0)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                ${tableHeaders.map(th => `<th>${th}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${tableRows.join('')}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            }
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
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            Reports
          </h2>
          
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

      {/* 2 MAIN DEDICATED REPORT TABS */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        background: '#fff',
        padding: '8px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        width: 'fit-content'
      }}>
        <button
          type="button"
          onClick={() => { setActiveReportTab('waiter'); handleResetFilters(); }}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: activeReportTab === 'waiter' ? '1.5px solid #ff5a1f' : '1px solid transparent',
            background: activeReportTab === 'waiter' ? '#fff7ed' : 'transparent',
            color: activeReportTab === 'waiter' ? '#ff5a1f' : '#64748b',
            fontSize: '14px',
            fontWeight: activeReportTab === 'waiter' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          <UserIcon size={16} color={activeReportTab === 'waiter' ? '#ff5a1f' : '#64748b'} />
          <span>Waiter Reports ({activeReportTab === 'waiter' ? (pagination.totalItems ?? waiterData.length) : (waiterTotalCount || waiterData.length || 0)})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveReportTab('kitchen'); handleResetFilters(); }}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: activeReportTab === 'kitchen' ? '1.5px solid #ea580c' : '1px solid transparent',
            background: activeReportTab === 'kitchen' ? '#ffedd5' : 'transparent',
            color: activeReportTab === 'kitchen' ? '#9a3412' : '#64748b',
            fontSize: '14px',
            fontWeight: activeReportTab === 'kitchen' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          <ChefIcon size={16} color={activeReportTab === 'kitchen' ? '#9a3412' : '#64748b'} />
          <span>Kitchen Reports ({activeReportTab === 'kitchen' ? (pagination.totalItems ?? kitchenData.length) : (kitchenTotalCount || kitchenData.length || 0)})</span>
        </button>
      </div>

      {/* KPI Overview Cards for Active Report */}
      {activeReportTab === 'waiter' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Waiter Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{currency}{(summary?.totalWaiterRevenue || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Fulfilled by serving team</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders Served</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.totalOrdersServed || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Completed order tickets</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Waiters On Duty</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.activeWaitersOnDuty || 0} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>/ {summary?.totalWaiters || waiterData.length || 0}</span></div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>Available for table service</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #f59e0b', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Order Value</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>
              {currency}{summary?.averageOrderValue || '0.00'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Per customer order</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #ea580c', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Dishes Prepared</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ea580c', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.totalDishesPrepared || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Cooked and dispatched</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid var(--primary)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Food Revenue Generated</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{currency}{(summary?.foodRevenueGenerated || 0).toLocaleString('en-IN')}</div>
            <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>Total value of dishes cooked</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Food Categories</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#3b82f6', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.activeCategories || 0}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Starters, Meals, Drinks, etc.</div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #e2e8f0', borderLeft: '4px solid #10b981', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Avg Kitchen Preparation Time</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginTop: '6px', fontFamily: "'Outfit', sans-serif" }}>{summary?.avgPrepTime || '15 mins'}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px', fontWeight: 600 }}>Average order fulfillment</div>
          </div>
        </div>
      )}

      {/* Date Filters & Search Row */}
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: activeReportTab === 'kitchen' ? '1fr 1fr 1.2fr 1fr auto' : '1fr 1fr 1.2fr auto',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Start Date</label>
            <input 
              type="date"
              value={dateStart}
              onChange={e => setDateStart(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>End Date</label>
            <input 
              type="date"
              value={dateEnd}
              onChange={e => setDateEnd(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc' }}
            />
          </div>

          {activeReportTab === 'kitchen' && (
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                Filter by Category
              </label>
              <SearchableSelect
                value={filterKitchenCategory}
                onChange={e => setFilterKitchenCategory(e.target.value)}
                options={[
                  { value: 'All', label: 'All Food Categories' },
                  ...Array.from(new Set([
                    ...effectiveMenu.map(m => toDisplayText(m.category || m.categoryName)),
                    ...liveCategories.map(c => toDisplayText(c.name || c.categoryName || c.title || c)),
                    ...kitchenData.map(k => toDisplayText(k.category)),
                    'Main Course', 'Starters', 'Beverages', 'Desserts', 'Breads'
                  ].filter(Boolean))).map(cat => ({
                    value: cat,
                    label: cat
                  }))
                ]}
                placeholder="Select Category..."
              />
            </div>
          )}

          <div style={{ width: '320px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Search</label>
            <input
              type="text"
              placeholder={activeReportTab === 'waiter' ? 'Search waiter, table...' : 'Search food item...'}
              value={searchQuery}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={e => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchQuery(val);
              }}
              style={{ width: '100%', height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ alignSelf: 'flex-end' }}>
            <button
              type="button"
              className="premium-filter-btn-reset"
              onClick={handleResetFilters}
              style={{ padding: '8px 14px', fontSize: '12px' }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT TABLES */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        {/* 1. WAITER PERFORMANCE REPORT TABLE */}
        {activeReportTab === 'waiter' && (
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ width: '5%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.NO</th>
                <th style={{ width: '22%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WAITER NAME</th>
                <th style={{ width: '11%', padding: '14px 10px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>DUTY STATUS</th>
                <th style={{ width: '16%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSIGNED TABLES</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ORDERS SERVED</th>
                <th style={{ width: '14%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>TOTAL REVENUE</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>AVG ORDER VALUE</th>
                <th style={{ width: '8%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {waiterData.map((w, index) => (
                <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {pagination.page * pagination.limit + index + 1}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#166534',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {toDisplayText(w.name, 'W').charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {toDisplayText(w.name, 'Waiter')}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {toDisplayText(w.email)} {w.phone ? `· ${toDisplayText(w.phone)}` : ''}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: toDisplayText(w.dutyStatus) === 'ON_DUTY' ? '#dcfce7' : '#f1f5f9',
                      color: toDisplayText(w.dutyStatus) === 'ON_DUTY' ? '#166534' : '#64748b'
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: toDisplayText(w.dutyStatus) === 'ON_DUTY' ? '#16a34a' : '#94a3b8' }}></span>
                      {toDisplayText(w.dutyStatus) === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
                      {Array.isArray(w.assignedTablesList) && w.assignedTablesList.length > 0 ? w.assignedTablesList.map(t => toDisplayText(t)).join(', ') : 'Table 1, Table 2'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                    {Number(w.ordersServed || 0)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>orders</span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: '#16a34a', fontSize: '14px', fontFamily: "'Outfit', sans-serif" }}>
                    {currency}{Number(w.totalRevenue || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#475569', fontSize: '13px' }}>
                    {currency}{toDisplayText(w.averageOrderValue, '0.00')}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedWaiterOrdersModal(w)}
                      title="View Orders Fulfilled"
                      style={{
                        background: '#fff0e6',
                        border: '1px solid #ffd8bf',
                        color: 'var(--primary, #ff7a00)',
                        cursor: 'pointer',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <EyeIcon size={14} color="var(--primary, #ff7a00)" />
                      Orders
                    </button>
                  </td>
                </tr>
              ))}

              {waiterData.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No waiter performance records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* 2. KITCHEN PREPARATION REPORT TABLE */}
        {activeReportTab === 'kitchen' && (
          <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ width: '5%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>S.NO</th>
                <th style={{ width: '25%', padding: '14px 14px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>FOOD ITEM</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CATEGORY</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>QUANTITY PREPARED</th>
                <th style={{ width: '15%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>AVG PREP TIME</th>
                <th style={{ width: '13%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>REVENUE GENERATED</th>
                <th style={{ width: '12%', padding: '14px 12px', fontSize: '11px', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>KITCHEN STATUS</th>
              </tr>
            </thead>
            <tbody>
              {kitchenData.map((k, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', height: '58px', transition: 'background-color 0.15s' }}>
                  <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {pagination.page * pagination.limit + index + 1}
                  </td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                    {toDisplayText(k.foodItem || k.itemName, 'Food Item')}
                  </td>
                  <td style={{ padding: '12px 12px' }}>
                    <span style={{ fontSize: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>
                      {toDisplayText(k.category, 'Uncategorized')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', fontWeight: 800, color: '#ea580c', fontSize: '14px', fontFamily: "'Outfit', sans-serif" }}>
                    {Number(k.quantityPrepared || 0)} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>dishes</span>
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                    {toDisplayText(k.avgPrepTime, '15 mins')}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: 'var(--primary)', fontSize: '13px', fontFamily: "'Outfit', sans-serif" }}>
                    {currency}{Number(k.revenueGenerated || 0).toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '3px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: (toDisplayText(k.kitchenStatus || k.status) === 'Completed' || toDisplayText(k.kitchenStatus || k.status) === 'Optimal') ? '#dcfce7' : '#ffedd5',
                      color: (toDisplayText(k.kitchenStatus || k.status) === 'Completed' || toDisplayText(k.kitchenStatus || k.status) === 'Optimal') ? '#166534' : '#c2410c'
                    }}>
                      {toDisplayText(k.kitchenStatus || k.status, 'Completed')}
                    </span>
                  </td>
                </tr>
              ))}

              {kitchenData.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No kitchen preparation records found for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {(pagination.totalPages > 1 || pagination.totalItems > 0) && (
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
            Showing {pagination.totalItems === 0 ? 0 : pagination.page * pagination.limit + 1} to {Math.min((pagination.page + 1) * pagination.limit, pagination.totalItems)} of {pagination.totalItems} records
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: pagination.page === 0 ? '#f8fafc' : '#ffffff',
                color: pagination.page === 0 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: pagination.page === 0 ? 'not-allowed' : 'pointer',
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
                  fontWeight: pagination.page + 1 === pageNum ? 700 : 500,
                  border: pagination.page + 1 === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: pagination.page + 1 === pageNum ? '#000000' : '#ffffff',
                  color: pagination.page + 1 === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages - 1 || pagination.totalPages === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (pagination.page >= pagination.totalPages - 1 || pagination.totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (pagination.page >= pagination.totalPages - 1 || pagination.totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (pagination.page >= pagination.totalPages - 1 || pagination.totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* WAITER ORDERS POPUP MODAL */}
      <Modal
        isOpen={!!selectedWaiterOrdersModal}
        onClose={() => setSelectedWaiterOrdersModal(null)}
        title={`Orders Fulfilled by ${selectedWaiterOrdersModal?.name || ''}`}
        maxWidth="680px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Table</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left' }}>Items</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(selectedWaiterOrdersModal?.orders || []).map(ord => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700 }}>#{toDisplayText(ord.id)}</td>
                    <td style={{ padding: '8px 10px' }}>Table {toDisplayText(ord.table)}</td>
                    <td style={{ padding: '8px 10px' }}>{(ord.items || []).map(i => `${i.qty}x ${toDisplayText(i.name)}`).join(', ')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>{currency}{Number(ord.total || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          title="View Order Details"
                          onClick={() => setSelectedOrderForView(ord)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}
                        >
                          <EyeIcon size={16} />
                        </button>
                        <button
                          type="button"
                          title="View Receipt"
                          onClick={() => setSelectedOrderForReceipt(ord)}
                          style={{ background: 'transparent', border: 'none', color: '#16a34a', cursor: 'pointer', padding: '4px' }}
                        >
                          <ReceiptIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-black"
              onClick={() => setSelectedWaiterOrdersModal(null)}
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
        title={`Order Details #${toDisplayText(selectedOrderForView?.id || '')}`}
        maxWidth="500px"
      >
        {selectedOrderForView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TABLE</span>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>Table {toDisplayText(selectedOrderForView.table)}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>WAITER</span>
                <div style={{ fontWeight: 800, fontSize: '14px' }}>{toDisplayText(selectedOrderForView.waiter)}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>STATUS</span>
                <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--primary)' }}>{toDisplayText(selectedOrderForView.status)?.toUpperCase()}</div>
              </div>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#f1f5f9', fontWeight: 700, fontSize: '13px' }}>Items Ordered</div>
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedOrderForView.items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{it.qty}x {toDisplayText(it.name)}</span>
                    <span style={{ fontWeight: 700 }}>{currency}{(Number(it.price || 0) * (it.qty || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 14px', background: '#fff7ed', borderTop: '1px solid #fed7aa', display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                <span>Total Amount</span>
                <span style={{ color: 'var(--primary)', fontSize: '16px' }}>{currency}{toDisplayText(selectedOrderForView.total)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => setSelectedOrderForView(null)}
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
        title={`Receipt #${toDisplayText(selectedOrderForReceipt?.id || '')}`}
        maxWidth="400px"
      >
        {selectedOrderForReceipt && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '10px',
            padding: '16px',
            background: '#fafafa',
            border: '1px dashed #cbd5e1',
            borderRadius: '8px',
            fontFamily: 'monospace'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif" }}>{toDisplayText(activeRestaurant?.name || activeRestaurant, 'Serviq Restaurant')}</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#64748b' }}>Tax Invoice / Bill</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span>Order ID: #{toDisplayText(selectedOrderForReceipt.id)}</span>
              <span>Table: {toDisplayText(selectedOrderForReceipt.table)}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Waiter: {toDisplayText(selectedOrderForReceipt.waiter)}
            </div>

            <div style={{ borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {(selectedOrderForReceipt.items || []).map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>{it.qty}x {toDisplayText(it.name)}</span>
                  <span>{currency}{(Number(it.price || 0) * (it.qty || 1)).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '15px' }}>
              <span>TOTAL</span>
              <span>{currency}{toDisplayText(selectedOrderForReceipt.total)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-black"
                style={{ width: '100%' }}
                onClick={() => setSelectedOrderForReceipt(null)}
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
