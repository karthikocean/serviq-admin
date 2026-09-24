import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialRestaurantsData, initialState, AVAILABLE_PLANS, getPlanBranchLimit, resolveHumanPlanName, isMongoId } from './initialData';
import { isTokenExpired } from './index.js';
import AuthApi from '../api/Auth.js';
import MemberApi from '../api/Table.js';
import QrCodeApi from '../api/QrCode.js';
import OrderApi from '../api/Order.js';
import MenuApi from '../api/Menu.js';
import BranchApi from '../api/Branch.js';
import UserApi from '../api/User.js';
import SubscriptionApi from '../api/Subscription.js';
import { resolveBranchManagerName, resolveBranchContactNumber } from '../helper/BranchHelper.js';
import ShowNotifications from '../helper/ShowNotifications.js';

export const AppContext = createContext();

export const DEFAULT_ROLES = {
  'RESTAURANT_OWNER': {
    permissions: {
      overview: { view: true, add: true, edit: true, delete: true },
      'branch-management': { view: true, add: true, edit: true, delete: true },
      'plans-management': { view: true, add: true, edit: true, delete: true },
      orders: { view: true, add: true, edit: true, delete: true },
      menu: { view: true, add: true, edit: true, delete: true },
      tables: { view: true, add: true, edit: true, delete: true },
      inventory: { view: true, add: true, edit: true, delete: true },
      stock_reduction: { view: true, add: true, edit: true, delete: true },
      billing: { view: true, add: true, edit: true, delete: true },
      staff: { view: true, add: true, edit: true, delete: true },
      waiter: { view: true, add: true, edit: true, delete: true },
      kitchen: { view: true, add: true, edit: true, delete: true },
      Reports: { view: true, add: true, edit: true, delete: true },
      users: { view: true, add: true, edit: true, delete: true },
      'roles-permissions': { view: true, add: true, edit: true, delete: true },
      Settings: { view: true, add: true, edit: true, delete: true }
    }
  },
  'Super Admin': {
    permissions: {
      overview: { view: true, add: true, edit: true, delete: true },
      'branch-management': { view: true, add: true, edit: true, delete: true },
      'plans-management': { view: true, add: true, edit: true, delete: true },
      orders: { view: true, add: true, edit: true, delete: true },
      menu: { view: true, add: true, edit: true, delete: true },
      tables: { view: true, add: true, edit: true, delete: true },
      inventory: { view: true, add: true, edit: true, delete: true },
      stock_reduction: { view: true, add: true, edit: true, delete: true },
      billing: { view: true, add: true, edit: true, delete: true },
      staff: { view: true, add: true, edit: true, delete: true },
      waiter: { view: true, add: true, edit: true, delete: true },
      kitchen: { view: true, add: true, edit: true, delete: true },
      Reports: { view: true, add: true, edit: true, delete: true },
      users: { view: true, add: true, edit: true, delete: true },
      'roles-permissions': { view: true, add: true, edit: true, delete: true },
      Settings: { view: true, add: true, edit: true, delete: true }
    }
  },
  Admin: {
    permissions: {
      overview: { view: true, add: true, edit: true, delete: true },
      'branch-management': { view: true, add: true, edit: true, delete: true },
      'plans-management': { view: true, add: true, edit: true, delete: true },
      orders: { view: true, add: true, edit: true, delete: true },
      menu: { view: true, add: true, edit: true, delete: true },
      tables: { view: true, add: true, edit: true, delete: true },
      inventory: { view: true, add: true, edit: true, delete: true },
      stock_reduction: { view: true, add: true, edit: true, delete: true },
      billing: { view: true, add: true, edit: true, delete: true },
      staff: { view: true, add: true, edit: true, delete: true },
      waiter: { view: true, add: true, edit: true, delete: true },
      kitchen: { view: true, add: true, edit: true, delete: true },
      Reports: { view: true, add: true, edit: true, delete: true },
      users: { view: true, add: true, edit: true, delete: true },
      'roles-permissions': { view: true, add: true, edit: true, delete: true },
      Settings: { view: true, add: true, edit: true, delete: true }
    }
  },
  'Branch Admin': {
    permissions: {
      overview: { view: true, add: true, edit: true, delete: true },
      'branch-management': { view: false, add: false, edit: false, delete: false },
      'plans-management': { view: false, add: false, edit: false, delete: false },
      orders: { view: true, add: true, edit: true, delete: true },
      menu: { view: true, add: true, edit: true, delete: true },
      tables: { view: true, add: true, edit: true, delete: true },
      inventory: { view: true, add: true, edit: true, delete: true },
      stock_reduction: { view: true, add: true, edit: true, delete: true },
      billing: { view: true, add: true, edit: true, delete: true },
      staff: { view: true, add: true, edit: true, delete: true },
      waiter: { view: true, add: true, edit: true, delete: true },
      kitchen: { view: true, add: true, edit: true, delete: true },
      Reports: { view: true, add: true, edit: true, delete: false },
      users: { view: true, add: true, edit: true, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      Settings: { view: true, add: false, edit: true, delete: false }
    }
  },
  Manager: {
    permissions: {
      overview: { view: true, add: false, edit: false, delete: false },
      'branch-management': { view: false, add: false, edit: false, delete: false },
      'plans-management': { view: false, add: false, edit: false, delete: false },
      orders: { view: true, add: true, edit: true, delete: true },
      menu: { view: true, add: true, edit: true, delete: false },
      tables: { view: true, add: true, edit: true, delete: false },
      inventory: { view: true, add: true, edit: true, delete: false },
      stock_reduction: { view: true, add: true, edit: true, delete: false },
      billing: { view: true, add: true, edit: true, delete: false },
      staff: { view: true, add: true, edit: true, delete: false },
      waiter: { view: true, add: true, edit: true, delete: false },
      kitchen: { view: true, add: true, edit: true, delete: false },
      Reports: { view: true, add: false, edit: false, delete: false },
      users: { view: true, add: true, edit: true, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      Settings: { view: false, add: false, edit: false, delete: false }
    }
  },
  Waiter: {
    permissions: {
      overview: { view: false, add: false, edit: false, delete: false },
      'branch-management': { view: false, add: false, edit: false, delete: false },
      'plans-management': { view: false, add: false, edit: false, delete: false },
      orders: { view: true, add: true, edit: true, delete: false },
      menu: { view: false, add: false, edit: false, delete: false },
      tables: { view: true, add: false, edit: true, delete: false },
      billing: { view: false, add: false, edit: false, delete: false },
      staff: { view: true, add: false, edit: false, delete: false },
      waiter: { view: true, add: false, edit: false, delete: false },
      kitchen: { view: false, add: false, edit: false, delete: false },
      Reports: { view: false, add: false, edit: false, delete: false },
      users: { view: false, add: false, edit: false, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      Settings: { view: false, add: false, edit: false, delete: false }
    }
  },
  Kitchen: {
    permissions: {
      overview: { view: false, add: false, edit: false, delete: false },
      'branch-management': { view: false, add: false, edit: false, delete: false },
      'plans-management': { view: false, add: false, edit: false, delete: false },
      orders: { view: true, add: false, edit: true, delete: false },
      menu: { view: false, add: false, edit: false, delete: false },
      tables: { view: false, add: false, edit: false, delete: false },
      billing: { view: false, add: false, edit: false, delete: false },
      staff: { view: true, add: false, edit: false, delete: false },
      waiter: { view: false, add: false, edit: false, delete: false },
      kitchen: { view: true, add: false, edit: false, delete: false },
      Reports: { view: false, add: false, edit: false, delete: false },
      users: { view: false, add: false, edit: false, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      Settings: { view: false, add: false, edit: false, delete: false }
    }
  }
};

export const DEFAULT_INVENTORY_CATEGORIES = [
  { id: "INV-CAT-001", name: "Dairy", description: "Milk, butter, paneer, cream, yogurt", status: "AVAILABLE" },
  { id: "INV-CAT-002", name: "Grains & Rice", description: "Basmati rice, wheat flour, grains, pulses", status: "AVAILABLE" },
  { id: "INV-CAT-003", name: "Oils & Ghee", description: "Cooking oil, mustard oil, pure desi ghee", status: "AVAILABLE" },
  { id: "INV-CAT-004", name: "Meat & Poultry", description: "Fresh chicken, mutton, seafood", status: "AVAILABLE" },
  { id: "INV-CAT-005", name: "Vegetables", description: "Farm fresh onions, tomatoes, potatoes, herbs", status: "AVAILABLE" },
  { id: "INV-CAT-006", name: "Spices & Condiments", description: "Cardamom, clove, whole & ground spices", status: "AVAILABLE" },
  { id: "INV-CAT-007", name: "Beverages", description: "Tea leaves, coffee beans, syrups, juices", status: "AVAILABLE" },
  { id: "INV-CAT-008", name: "Packaging", description: "Containers, paper bags, foil rolls, cups", status: "AVAILABLE" }
];

export const KNOWN_RESTAURANT_MAP = {
  'test@gmail.com': 'Spice Route Restaurat',
  'alice@gmail.com': 'AZ',
  'test2@gmail.com': 'test',
  'saravana@gmail.com': 'Saravana Bhavan',
  'gayusmr5@gmail.com': 'Copper kitchen',
  'mirchi@gmail.com': 'Mirchi',
  'eee@gmail.com': 'eee',
  'tttt@gmail.com': 'test'
};

export const extractRestaurantFromToken = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload) {
        return (
          payload.restaurantName ||
          payload.restaurant_name ||
          (typeof payload.restaurant === 'object' ? (payload.restaurant?.restaurantName || payload.restaurant?.name) : null) ||
          (typeof payload.restaurant === 'string' && !/^[0-9a-fA-F]{24}$/.test(payload.restaurant) ? payload.restaurant : null) ||
          null
        );
      }
    }
  } catch (e) {}
  return null;
};

const loadSavedUser = () => {
  
  try {
    // Clear any legacy localStorage items
    localStorage.clear();
  } catch (e) {}

  try {
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    const savedUserStr = sessionStorage.getItem('currentUser');
    if (token && savedUserStr) {
      if (isTokenExpired(token)) {
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('currentUser');
        try { sessionStorage.clear(); } catch (e) { }
        return null;
      }
      const parsed = JSON.parse(savedUserStr);
      const emailKey = (parsed.email || '').toLowerCase().trim();
      const tokenRestName = extractRestaurantFromToken(token);
      const mappedRestName = KNOWN_RESTAURANT_MAP[emailKey];

      const resolvedRestName =
        (parsed.restaurantName && parsed.restaurantName !== parsed.ownerName && parsed.restaurantName !== parsed.name ? parsed.restaurantName : null) ||
        tokenRestName ||
        mappedRestName ||
        parsed.restaurantName ||
        '';

      parsed.restaurantName = resolvedRestName;
      return parsed;
    }
  } catch (e) {
    console.warn("Could not load saved user session", e);
  }
  return null;
};

export const AppProvider = ({ children }) => {
  const [restaurantsData, setRestaurantsData] = useState(() => {
    try {
      const raw = sessionStorage.getItem('activePlanSelection');
      if (raw) {
        const savedPlan = JSON.parse(raw);
        if (savedPlan && savedPlan.cleanName) {
          const base = { ...initialRestaurantsData };
          if (base['rest-1']) {
            base['rest-1'] = {
              ...base['rest-1'],
              plan: savedPlan.cleanName,
              subscription: {
                ...base['rest-1'].subscription,
                planId: savedPlan.planId,
                planName: savedPlan.planName,
                status: 'Active',
                billingCycle: savedPlan.billingCycle || 'monthly',
                price: savedPlan.price,
                monthlyPrice: savedPlan.monthlyPrice,
                annualPrice: savedPlan.annualPrice,
                startDate: savedPlan.startDate,
                expiryDate: savedPlan.expiryDate,
                nextBillingDate: savedPlan.nextBillingDate || savedPlan.nextRenewal,
                baseBranchLimit: savedPlan.baseBranchLimit || getPlanBranchLimit(savedPlan.cleanName, 5)
              }
            };
          }
          return base;
        }
      }
    } catch (e) {}
    return initialRestaurantsData;
  });
  const [currentUser, setCurrentUser] = useState(loadSavedUser);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(initialRestaurantsData['rest-1'] ? 'rest-1' : null);
  // Active Tenant settings overrides / defaults
  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState('#ff7a00');
  const [qrCustomizer, setQrCustomizer] = useState({ color: '#ff7a00', showLogo: true });
  // Branch filter state (null = All Branches)
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    try {
      const stored = sessionStorage.getItem('selectedBranchId');
      if (stored && stored !== 'ALL') return stored;
      const user = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      if (user) {
        const uType = (user.userType || '').toUpperCase();
        const uRole = (typeof user.role === 'object' ? (user.role?.roleName || user.role?.name) : (user.role || '')).toUpperCase();
        const isOwner = uType === 'RESTAURANT_OWNER' || uType === 'OWNER' || uType === 'SUPER ADMIN' || uType === 'SUPER_ADMIN' || uRole === 'RESTAURANT_OWNER' || uRole === 'OWNER' || uRole === 'SUPER ADMIN';
        if (!isOwner) {
          const bId = typeof user.branchId === 'object' && user.branchId !== null ? (user.branchId._id || user.branchId.id) : (user.branchId || user.activeBranchId);
          if (bId && bId !== 'ALL') return bId;
        }
      }
    } catch (e) {}
    return null;
  });

  // Synchronize currentUser to sessionStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.clear();
    } catch (e) {}

    if (currentUser) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Periodic token expiration check & auto-logout
  useEffect(() => {
    const checkTokenExpiry = () => {
      const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
      if (token && isTokenExpired(token)) {
        ShowNotifications.showAlertNotification("Session expired. Please log in again.", false);
        logout();
      }
    };

    const interval = setInterval(checkTokenExpiry, 15000);
    window.addEventListener('focus', checkTokenExpiry);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', checkTokenExpiry);
    };
  }, []);


  // Fallback empty tenant with Premium plan defaults
  const FALLBACK_RESTAURANT = useMemo(() => ({
    tables: [],
    orders: [],
    menu: [],
    staff: [],
    qrCodes: [],
    kitchenLogin: {},
    billing: {},
    roles: DEFAULT_ROLES,
    branches: [],
    users: [],
    inventory: [],
    inventoryLogs: [],
    inventoryCategories: DEFAULT_INVENTORY_CATEGORIES,
    plan: "Standard",
    subscription: {
      planId: "plan-standard",
      planName: "Standard",
      status: "Active",
      billingCycle: "monthly",
      baseBranchLimit: 5,
      extraBranchSlots: 0,
      extraBranchPrice: 699
    }
  }), []);

  // Active computed tenant info
  const activeRestaurant = useMemo(() => {
    const rawActive = (currentRestaurantId ? restaurantsData[currentRestaurantId] : null) || FALLBACK_RESTAURANT;
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    const tokenRestName = extractRestaurantFromToken(token);
    const emailKey = (currentUser?.email || '').toLowerCase().trim();
    const mappedRestName = KNOWN_RESTAURANT_MAP[emailKey];

    // Priority: Explicit restaurant name (if distinct from owner's name) > token > email map > fallback
    const dynamicName = 
      (currentUser?.restaurantName && currentUser.restaurantName !== currentUser?.ownerName && currentUser.restaurantName !== currentUser?.name ? currentUser.restaurantName : null) ||
      tokenRestName ||
      mappedRestName ||
      currentUser?.restaurantName ||
      rawActive.restaurantName || 
      rawActive.name || 
      'Main Branch';

    const dynamicOwner = currentUser?.ownerName || (currentUser?.userType === 'RESTAURANT_OWNER' ? currentUser?.name : null) || rawActive.ownerName || 'Administrator';
    const dynamicEmail = currentUser?.email || rawActive.email || '';

    let savedPlanInfo = null;
    try {
      const rawSaved = sessionStorage.getItem('activePlanSelection') || localStorage.getItem('activePlanSelection');
      if (rawSaved) savedPlanInfo = JSON.parse(rawSaved);
    } catch (e) {}

    const dynamicPlan = savedPlanInfo?.cleanName || currentUser?.plan || rawActive.plan || 'Standard';

    return {
      ...rawActive,
      id: currentRestaurantId || rawActive.id || 'rest-1',
      name: dynamicName,
      restaurantName: dynamicName,
      ownerName: dynamicOwner,
      email: dynamicEmail,
      plan: dynamicPlan,
      subscription: {
        ...(rawActive.subscription || {}),
        ...(currentUser?.subscription || {}),
        ...(savedPlanInfo ? {
          planId: savedPlanInfo.planId,
          planName: savedPlanInfo.planName || `${savedPlanInfo.cleanName} Plan`,
          billingCycle: savedPlanInfo.billingCycle,
          price: savedPlanInfo.price,
          monthlyPrice: savedPlanInfo.monthlyPrice,
          annualPrice: savedPlanInfo.annualPrice,
          baseBranchLimit: savedPlanInfo.baseBranchLimit,
          startDate: savedPlanInfo.startDate,
          expiryDate: savedPlanInfo.expiryDate,
          nextBillingDate: savedPlanInfo.nextBillingDate
        } : {}),
        planName: dynamicPlan
      }
    };
  }, [currentRestaurantId, restaurantsData, currentUser, FALLBACK_RESTAURANT]);

  const computeBillingData = (ordersList = [], tablesList = []) => {
    if (!Array.isArray(tablesList) || !Array.isArray(ordersList)) return [];

    const extractOrderTable = (o) => {
      if (!o) return '';
      if (typeof o.table === 'string') return o.table;
      if (typeof o.table === 'number') return String(o.table);
      if (o.tableId && typeof o.tableId === 'object') {
        return String(o.tableId.tableNumber || o.tableId.tableNo || o.tableId.name || o.tableId._id || '');
      }
      if (typeof o.tableId === 'string' || typeof o.tableId === 'number') {
        return String(o.tableId);
      }
      return '';
    };

    return tablesList.map(t => {
      if (!t) return null;
      const tIdStr = String(t.id || t.tableNumber || t.tableNo || t.name || '').trim();
      const tableNum = tIdStr.replace(/^T-|^Table\s*/i, '').trim();
      const tableLabel = `Table ${tableNum || tIdStr || '1'}`;

      const unpaidOrders = ordersList.filter(o => {
        if (!o) return false;
        const rawTable = extractOrderTable(o);
        const cleanTable = rawTable.replace(/^Table\s*|^T-/i, '').trim();
        const isMatch = (cleanTable && tableNum && cleanTable.toLowerCase() === tableNum.toLowerCase()) ||
          (cleanTable && tableNum && parseInt(cleanTable, 10) === parseInt(tableNum, 10)) ||
          (t._id && String(o.tableId?._id || o.tableId) === String(t._id));
        const bStatus = (o.billingStatus || '').toLowerCase();
        return isMatch && bStatus !== 'paid';
      });

      if (unpaidOrders.length > 0) {
        const total = unpaidOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        return {
          table: tableLabel,
          orders: unpaidOrders.length,
          total: total,
          status: 'Unpaid'
        };
      } else {
        const paidOrders = ordersList.filter(o => {
          if (!o) return false;
          const rawTable = extractOrderTable(o);
          const cleanTable = rawTable.replace(/^Table\s*|^T-/i, '').trim();
          const isMatch = (cleanTable && tableNum && cleanTable.toLowerCase() === tableNum.toLowerCase()) ||
            (cleanTable && tableNum && parseInt(cleanTable, 10) === parseInt(tableNum, 10)) ||
            (t._id && String(o.tableId?._id || o.tableId) === String(t._id));
          const bStatus = (o.billingStatus || '').toLowerCase();
          return isMatch && bStatus === 'paid';
        });
        const lastPaidTotal = paidOrders.length > 0 ? (Number(paidOrders[paidOrders.length - 1].total) || 0) : 0;
        return {
          table: tableLabel,
          orders: 0,
          total: lastPaidTotal,
          status: 'Paid'
        };
      }
    }).filter(Boolean);
  };

  const fetchTables = async (params = {}) => {
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    const targetId = currentRestaurantId || 'rest-1';
    if (!token) return;
    try {
      const res = await MemberApi.getTables({ limit: 10, ...params });
      if (res && res.status && res.response && res.response.data) {
        setRestaurantsData(prev => {
          const rest = prev[targetId];
          if (!rest) return prev;
          const localTables = rest.tables || [];
          const mapped = res.response.data.map(t => {
            const localT = localTables.find(lt => lt && lt.id && t && t.tableNumber && String(lt.id).toLowerCase() === String(t.tableNumber).toLowerCase());
            const backendWaiterId = (typeof t.assignedWaiter === 'object' ? t.assignedWaiter?._id : t.assignedWaiter) || t.assignedWaiterId;
            const statusStr = typeof t.status === 'string' ? t.status : (t.status ? 'Occupied' : 'Free');
            const isOcc = ['occupied', 'busy', 'reserved'].includes(String(statusStr || t.occupancyStatus || '').toLowerCase()) || t.isOccupied === true;
            return {
              _id: t._id,
              id: t.tableNumber || t.tableNo || t.id,
              tableNumber: t.tableNumber || t.tableNo || t.id,
              tableNo: t.tableNo || t.tableNumber || t.id,
              seats: t.seatingCapacity ?? t.seats ?? 4,
              seatingCapacity: t.seatingCapacity ?? t.seats ?? 4,
              status: isOcc ? 'Occupied' : (statusStr || 'Free'),
              isActive: t.isActive,
              assignedWaiter: t.assignedWaiter || null,
              assignedWaiterId: backendWaiterId || localT?.assignedWaiterId || null,
              tempWaiterId: t.coverWaiterId || t.tempWaiterId || localT?.tempWaiterId || null,
              assignedQrId: t.assignedQrId || null,
              qrUrl: t.qrUrl || null,
              section: t.section || 'Main Dining',
              branchId: t.branchId
            };
          });
          const computedBillData = computeBillingData(rest.orders || [], mapped);
          return {
            ...prev,
            [targetId]: {
              ...rest,
              tables: mapped,
              billingData: computedBillData
            }
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch tables", e);
    }
  };

  const fetchQrCodes = async (params = {}) => {
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    const targetId = currentRestaurantId || 'rest-1';
    if (!token) return;
    try {
      const res = await QrCodeApi.getQrCodes(params);
      if (res && res.status && res.response && res.response.data) {
        setRestaurantsData(prev => {
          const rest = prev[targetId];
          if (!rest) return prev;
          return {
            ...prev,
            [targetId]: {
              ...rest,
              qrCodes: res.response.data
            }
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch QR codes", e);
    }
  };

  const fetchOrders = async (params = {}) => {
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    const targetId = currentRestaurantId || 'rest-1';
    if (!token) return;
    try {
      const res = await OrderApi.getOrders(params);
      if (res && res.status) {
        const payload = res.response || {};
        const rawOrders = Array.isArray(payload) ? payload :
          Array.isArray(payload.data) ? payload.data :
          Array.isArray(payload.data?.orders) ? payload.data.orders :
          Array.isArray(payload.orders) ? payload.orders :
          Array.isArray(payload.response?.data) ? payload.response.data :
          [];

        setRestaurantsData(prev => {
          const rest = prev[targetId];
          if (!rest) return prev;
          const computedBillData = computeBillingData(rawOrders, rest.tables || []);
          return {
            ...prev,
            [targetId]: {
              ...rest,
              orders: rawOrders,
              billingData: computedBillData
            }
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch orders", e);
    }
  };

  const fetchMenu = async (params = {}) => {
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    const targetId = currentRestaurantId || 'rest-1';
    if (!token) return;
    try {
      const queryParams = { limit: 10, ...params };
      const res = await MenuApi.getMenuItems(queryParams);
      if (res && res.status && res.response) {
        const menuData = Array.isArray(res.response.data)
          ? res.response.data
          : (Array.isArray(res.response.data?.items)
              ? res.response.data.items
              : (Array.isArray(res.response) ? res.response : []));
        setRestaurantsData(prev => {
          const rest = prev[targetId];
          if (!rest) return prev;
          return {
            ...prev,
            [targetId]: {
              ...rest,
              menu: menuData
            }
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch menu items", e);
    }
  };

  const fetchBranches = async (params = {}) => {
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    if (!token) return;
    try {
      const branchParams = { limit: 10, ...params };
      const branchResponse = await BranchApi.getBranches(branchParams);

      if (branchResponse && branchResponse.status && branchResponse.response) {
        const branchArray = Array.isArray(branchResponse.response) 
          ? branchResponse.response 
          : (Array.isArray(branchResponse.response.data) ? branchResponse.response.data : (branchResponse.response.branches || []));
        if (Array.isArray(branchArray)) {
          setRestaurantsData(prev => {
            const targetId = currentRestaurantId || 'rest-1';
            const rest = prev[targetId] || initialRestaurantsData[targetId] || initialRestaurantsData['rest-1'] || {
              tables: [],
              orders: [],
              menu: [],
              staff: [],
              qrCodes: [],
              kitchenLogin: {},
              billing: {},
              roles: DEFAULT_ROLES,
              branches: [],
              users: [],
              inventory: [],
              inventoryLogs: [],
              plan: "Standard",
              subscription: {
                planId: "plan-standard",
                planName: "Standard",
                baseBranchLimit: 5,
                extraBranchSlots: 0,
                extraBranchPrice: 699
              }
            };

            const mappedBranches = branchArray.map(b => {
              const resolvedMgr = (b.managerName && b.managerName !== 'Unassigned') ? b.managerName : ((b.branchManager && b.branchManager !== 'Unassigned') ? b.branchManager : 'Unassigned');

              return {
                id: b._id || b.id,
                _id: b._id || b.id,
                branchName: b.branchName || b.name,
                branchCode: b.branchCode || b.code,
                branchManager: resolvedMgr,
                managerName: resolvedMgr,
                mobileNumber: b.contactNumber || b.mobileNumber || b.phone || b.managerMobile || '',
                email: b.email || b.managerEmail || '',
                address: typeof b.address === 'object' && b.address !== null ? (b.address.street || '') : (b.address || b.street || ''),
                country: typeof b.address === 'object' && b.address !== null ? (b.address.country || '') : (b.country || ''),
                state: typeof b.address === 'object' && b.address !== null ? (b.address.state || '') : (b.state || ''),
                city: typeof b.address === 'object' && b.address !== null ? (b.address.city || '') : (b.city || ''),
                pincode: typeof b.address === 'object' && b.address !== null ? (b.address.pincode || '') : (b.pincode || ''),
                openingDate: b.branchOpeningDate ? b.branchOpeningDate.split('T')[0] : (b.openingDate || ''),
                status: b.status || 'Active',
                totalTables: b.totalTables !== undefined ? b.totalTables : (Array.isArray(b.tables) ? b.tables.length : 0)
              };
            });

            // Prevent state reference invalidation if branches haven't changed
            const prevBranches = rest.branches || [];
            if (
              prevBranches.length === mappedBranches.length &&
              prevBranches.every((pb, idx) => {
                const mb = mappedBranches[idx];
                return pb && mb && (pb.id === mb.id || pb._id === mb._id) && pb.branchName === mb.branchName && pb.status === mb.status;
              })
            ) {
              return prev;
            }

            return {
              ...prev,
              [targetId]: {
                ...rest,
                branches: mappedBranches
              }
            };
          });
        }
      }
    } catch (e) {
      console.error("Failed to fetch branches", e);
    }
  };

  const fetchSubscriptionDashboard = async () => {
    const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
    if (!token) return;
    try {
      let savedPlan = null;
      try {
        const rawSaved = sessionStorage.getItem('activePlanSelection');
        if (rawSaved) savedPlan = JSON.parse(rawSaved);
      } catch (e) {}

      const [dashRes, plansRes] = await Promise.allSettled([
        SubscriptionApi.getDashboard(),
        SubscriptionApi.getPlans()
      ]);

      const res = dashRes.status === 'fulfilled' ? dashRes.value : null;
      const plansResVal = plansRes.status === 'fulfilled' ? plansRes.value : null;

      let livePlans = [];
      if (plansResVal && plansResVal.status && plansResVal.response) {
        const raw = Array.isArray(plansResVal.response?.data) 
          ? plansResVal.response.data 
          : (Array.isArray(plansResVal.response) ? plansResVal.response : (plansResVal.response?.plans || []));
        if (raw.length > 0) {
          livePlans = raw;
          raw.forEach(p => {
            const cleanP = String(p.planName || p.name || '').toLowerCase().replace(/\s*plan$/i, '').trim();
            const target = AVAILABLE_PLANS.find(ap => 
              ap.id === p.id || 
              ap.id === p._id || 
              ap.name.toLowerCase().includes(cleanP) || 
              cleanP.includes(ap.name.toLowerCase().replace(/\s*plan$/i, '').trim())
            );
            if (target) {
              const cap = p.maxBranches ?? p.branchLimit ?? p.baseBranchLimit ?? p.branchCapacity ?? p.allowedBranches ?? p.maxOutlets;
              if (cap !== undefined) {
                target.maxBranches = Number(cap);
                target.branchLimit = Number(cap);
                target.baseBranchLimit = Number(cap);
                target.branchCapacity = Number(cap);
              }
              const mPrice = p.monthlyPrice ?? p.basePrice ?? p.baseValue ?? p.price ?? p.monthlyRate ?? p.rate ?? p.amount ?? p.planPrice;
              if (mPrice !== undefined) {
                target.monthlyPrice = Number(mPrice);
                target.price = Number(mPrice);
                target.basePrice = Number(mPrice);
              }
              const aPrice = p.annualPrice ?? p.yearlyPrice ?? p.annualRate ?? p.yearlyRate;
              if (aPrice !== undefined) {
                target.annualPrice = Number(aPrice);
                target.yearlyPrice = Number(aPrice);
              }
            }
          });
        }
      }

      if (res && res.status && res.response) {
        const data = res.response.data || res.response;
        const activePlan = data.activePlan;

        const rawName = savedPlan?.cleanName || savedPlan?.planName || activePlan?.planName || activePlan?.name || 'Standard';
        const cleanName = resolveHumanPlanName(rawName);
        const matchedLive = livePlans.find(lp => {
          const lName = String(lp.planName || lp.name || '').toLowerCase().replace(/\s*plan$/i, '').trim();
          return lName === cleanName.toLowerCase();
        });

        const matchedPlanConfig = AVAILABLE_PLANS.find(p => p.name.toLowerCase().includes(cleanName.toLowerCase())) || AVAILABLE_PLANS[1];

        const resolvedLimit = Number(
          savedPlan?.baseBranchLimit ??
          matchedLive?.maxBranches ??
          matchedLive?.branchLimit ??
          matchedLive?.baseBranchLimit ??
          matchedPlanConfig?.maxBranches ??
          matchedPlanConfig?.branchLimit ??
          getPlanBranchLimit(cleanName, 5)
        );

        const isCycleAnnual = String(savedPlan?.billingCycle || activePlan?.billingCycle || 'monthly').toLowerCase().includes('annual');

        const resolvedPrice = isCycleAnnual
          ? Number(
              savedPlan?.annualPrice ??
              savedPlan?.price ??
              matchedLive?.annualPrice ??
              matchedLive?.yearlyPrice ??
              matchedPlanConfig?.annualPrice ??
              (cleanName.toLowerCase() === 'premium' ? 49999 : cleanName.toLowerCase() === 'basic' ? 9999 : 19999)
            )
          : Number(
              savedPlan?.monthlyPrice ??
              savedPlan?.price ??
              matchedLive?.monthlyPrice ??
              matchedLive?.basePrice ??
              matchedPlanConfig?.monthlyPrice ??
              (cleanName.toLowerCase() === 'premium' ? 4999 : cleanName.toLowerCase() === 'basic' ? 999 : 1999)
            );

        const now = new Date();
        const nextDate = new Date(now);
        if (isCycleAnnual) {
          nextDate.setFullYear(now.getFullYear() + 1);
        } else {
          nextDate.setMonth(now.getMonth() + 1);
        }

        const resolvedStartDate = savedPlan?.startDate || activePlan?.startDate || now.toISOString().split('T')[0];
        
        // Dynamically calculate expiry date matching the cycle and start date
        const calcStartDate = new Date(resolvedStartDate.includes('/') ? resolvedStartDate.split('/').reverse().join('-') : resolvedStartDate);
        const validStartDate = isNaN(calcStartDate.getTime()) ? now : calcStartDate;
        const calcExp = new Date(validStartDate);
        if (isCycleAnnual) {
          calcExp.setFullYear(calcExp.getFullYear() + 1);
        } else {
          calcExp.setMonth(calcExp.getMonth() + 1);
        }
        const calcExpiryStr = calcExp.toISOString().split('T')[0];

        const resolvedRenewalDate = (savedPlan?.billingCycle && (String(savedPlan.billingCycle).toLowerCase().includes('annual')) === isCycleAnnual && (savedPlan?.nextRenewal || savedPlan?.nextBillingDate)) || calcExpiryStr;
        const resolvedExpiryDate = (savedPlan?.billingCycle && (String(savedPlan.billingCycle).toLowerCase().includes('annual')) === isCycleAnnual && (savedPlan?.expiryDate || savedPlan?.validity)) || calcExpiryStr;

        if (activePlan || (savedPlan && savedPlan.cleanName)) {
          setRestaurantsData(prev => {
            const targetId = currentRestaurantId || 'rest-1';
            const baseRest = prev[targetId] || prev['rest-1'] || initialRestaurantsData['rest-1'] || {};
            return {
              ...prev,
              [targetId]: {
                ...baseRest,
                plan: cleanName,
                subscription: {
                  ...(baseRest.subscription || {}),
                  planId: savedPlan?.planId || activePlan?.planId || `plan-${cleanName.toLowerCase()}`,
                  planName: `${cleanName} Plan`,
                  status: activePlan?.status || 'Active',
                  billingCycle: isCycleAnnual ? 'annual' : 'monthly',
                  price: resolvedPrice,
                  monthlyPrice: matchedLive?.monthlyPrice || matchedPlanConfig?.monthlyPrice || (cleanName.toLowerCase() === 'premium' ? 4999 : cleanName.toLowerCase() === 'basic' ? 999 : 1999),
                  annualPrice: matchedLive?.annualPrice || matchedPlanConfig?.annualPrice || (cleanName.toLowerCase() === 'premium' ? 49999 : cleanName.toLowerCase() === 'basic' ? 9999 : 19999),
                  baseBranchLimit: resolvedLimit,
                  maxBranches: resolvedLimit,
                  startDate: resolvedStartDate,
                  nextBillingDate: resolvedRenewalDate,
                  expiryDate: resolvedExpiryDate,
                  extraBranchSlots: savedPlan?.extraBranchSlots !== undefined
                    ? savedPlan.extraBranchSlots
                    : (data.branchCapacity?.extraSlots !== undefined 
                        ? data.branchCapacity.extraSlots 
                        : (data.branchCapacity?.addons !== undefined
                            ? data.branchCapacity.addons
                            : (baseRest.subscription?.extraBranchSlots || 0))),
                  extraBranchPrice: data.extraBranchRate?.rate || baseRest.subscription?.extraBranchPrice || 699,
                  autoRenew: savedPlan?.autoRenew !== undefined ? savedPlan.autoRenew : (baseRest.subscription?.autoRenew !== false)
                }
              }
            };
          });
        }
      }
    } catch (e) {
      console.warn("Failed to fetch subscription in AppContext:", e);
    }
  };

  const upgradeSubscriptionPlan = (id, planId, billingCycle = 'monthly', paymentMethod = 'Online Payment') => {
    const cleanName = resolveHumanPlanName(planId);
    const planConfig = AVAILABLE_PLANS.find(p => p.id === planId || p._id === planId || p.name.toLowerCase().includes(cleanName.toLowerCase())) || AVAILABLE_PLANS[1];
    
    const isAnnual = String(billingCycle).toLowerCase().includes('annual') || String(billingCycle).toLowerCase().includes('year');
    const branchLimit = planConfig.branchLimit || planConfig.maxBranches || getPlanBranchLimit(cleanName, 5);
    const monthlyPrice = planConfig.monthlyPrice || (cleanName.toLowerCase() === 'premium' ? 4999 : cleanName.toLowerCase() === 'basic' ? 999 : 1999);
    const annualPrice = planConfig.annualPrice || (cleanName.toLowerCase() === 'premium' ? 49999 : cleanName.toLowerCase() === 'basic' ? 9999 : 19999);
    const price = isAnnual ? annualPrice : monthlyPrice;
    
    const now = new Date();
    const startDateStr = now.toISOString().split('T')[0];
    const expiryDateObj = new Date(now);
    if (isAnnual) {
      expiryDateObj.setFullYear(now.getFullYear() + 1);
    } else {
      expiryDateObj.setMonth(now.getMonth() + 1);
    }
    const expiryDateStr = expiryDateObj.toISOString().split('T')[0];
    const nextRenewalStr = expiryDateStr;

    const savedSelection = {
      planId: planConfig.id || `plan-${cleanName.toLowerCase()}`,
      planName: `${cleanName} Plan`,
      cleanName: cleanName,
      billingCycle: isAnnual ? 'annual' : 'monthly',
      price: price,
      monthlyPrice: monthlyPrice,
      annualPrice: annualPrice,
      baseBranchLimit: branchLimit,
      startDate: startDateStr,
      expiryDate: expiryDateStr,
      validity: expiryDateStr,
      nextBillingDate: nextRenewalStr,
      nextRenewal: nextRenewalStr,
      paymentMethod: paymentMethod,
      updatedAt: new Date().toISOString()
    };

    try {
      sessionStorage.setItem('activePlanSelection', JSON.stringify(savedSelection));
      localStorage.setItem('activePlanSelection', JSON.stringify(savedSelection));
    } catch (e) {}

    // Synchronize currentUser in state and sessionStorage so activeRestaurant subscription computes consistently
    setCurrentUser(prevUser => {
      if (!prevUser) return prevUser;
      const updatedUser = {
        ...prevUser,
        plan: cleanName,
        subscription: {
          ...(prevUser.subscription || {}),
          planId: savedSelection.planId,
          planName: `${cleanName} Plan`,
          status: 'Active',
          billingCycle: isAnnual ? 'annual' : 'monthly',
          price: price,
          monthlyPrice: monthlyPrice,
          annualPrice: annualPrice,
          baseBranchLimit: branchLimit,
          maxBranches: branchLimit,
          startDate: startDateStr,
          expiryDate: expiryDateStr,
          nextBillingDate: nextRenewalStr
        }
      };
      try {
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } catch (e) {}
      return updatedUser;
    });

    setRestaurantsData(prev => {
      const targetId = id || currentRestaurantId || 'rest-1';
      const baseRest = prev[targetId] || prev['rest-1'] || initialRestaurantsData['rest-1'] || {};
      return {
        ...prev,
        [targetId]: {
          ...baseRest,
          plan: cleanName,
          subscription: {
            ...(baseRest.subscription || {}),
            planId: savedSelection.planId,
            planName: `${cleanName} Plan`,
            status: 'Active',
            billingCycle: savedSelection.billingCycle,
            price: price,
            monthlyPrice: monthlyPrice,
            annualPrice: annualPrice,
            baseBranchLimit: branchLimit,
            maxBranches: branchLimit,
            startDate: startDateStr,
            expiryDate: expiryDateStr,
            nextBillingDate: nextRenewalStr
          }
        }
      };
    });

    window.dispatchEvent(new Event('plan_updated'));
    window.dispatchEvent(new Event('storage'));
  };

  const upgradeRestaurantPlan = (id, planName, billingCycle = 'monthly', paymentMethod = 'Online Payment') => {
    const cleanName = String(planName).replace(/\s*plan$/i, '').trim();
    const targetPlan = AVAILABLE_PLANS.find(p => p.name.toLowerCase().includes(cleanName.toLowerCase())) || AVAILABLE_PLANS[1];
    upgradeSubscriptionPlan(id, targetPlan.id, billingCycle, paymentMethod);
  };

  const toggleSubscriptionAutoRenew = (id) => {
    setRestaurantsData(prev => {
      const targetId = id || currentRestaurantId || 'rest-1';
      const baseRest = prev[targetId] || prev['rest-1'] || initialRestaurantsData['rest-1'] || {};
      const currentAutoRenew = baseRest.subscription?.autoRenew !== false;
      const nextAutoRenew = !currentAutoRenew;

      try {
        const raw = sessionStorage.getItem('activePlanSelection');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.autoRenew = nextAutoRenew;
          sessionStorage.setItem('activePlanSelection', JSON.stringify(parsed));
        }
      } catch (e) {}

      return {
        ...prev,
        [targetId]: {
          ...baseRest,
          subscription: {
            ...(baseRest.subscription || {}),
            autoRenew: nextAutoRenew
          }
        }
      };
    });

    try {
      SubscriptionApi.updateAutoRenew({ autoRenew: true }).catch(() => {});
    } catch (e) {}

    window.dispatchEvent(new Event('plan_updated'));
  };

  const purchaseExtraBranchSlots = (id, slotsCount = 1, paymentMethod = 'Credit Card') => {
    const slots = Number(slotsCount) || 1;
    setRestaurantsData(prev => {
      const targetId = id || currentRestaurantId || 'rest-1';
      const baseRest = prev[targetId] || prev['rest-1'] || initialRestaurantsData['rest-1'] || {};
      const currentSlots = Number(baseRest.subscription?.extraBranchSlots || 0);
      const nextSlots = currentSlots + slots;

      try {
        const raw = sessionStorage.getItem('activePlanSelection');
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.extraBranchSlots = nextSlots;
          sessionStorage.setItem('activePlanSelection', JSON.stringify(parsed));
        }
      } catch (e) {}

      return {
        ...prev,
        [targetId]: {
          ...baseRest,
          subscription: {
            ...(baseRest.subscription || {}),
            extraBranchSlots: nextSlots
          }
        }
      };
    });

    window.dispatchEvent(new Event('branch_updated'));
    window.dispatchEvent(new Event('plan_updated'));
  };

  // Automatically fetch live branches from API for current user
  useEffect(() => {
    if (currentUser) {
      fetchBranches({ limit: 10 });
    }
  }, [currentUser?.id, currentUser?.restaurantId]);

  // Sync theme changes with body class and css variables
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', accentColor);
    document.documentElement.style.setProperty('--primary-light', accentColor + '15');
  }, [accentColor]);

  // Actions
  const login = async (email, password, role) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Strict Backend API login attempt with the exact entered credentials only
    try {
      const apiRes = await AuthApi.login(cleanEmail, password);

      if (apiRes && (apiRes.status === true || apiRes.response?.success === true)) {
        const payload = apiRes.response || apiRes.data;
        const token = payload?.data?.token || payload?.token || payload?.data?.accessToken || payload?.accessToken;
        const apiUser = payload?.data?.user || payload?.data?.admin || payload?.data?.restaurant || payload?.user || payload?.admin || payload?.restaurant || payload?.data;

        if (token && apiUser) {
          const userTypeUpper = (apiUser.userType || '').toUpperCase();
          const roleObj = (typeof apiUser.role === 'object' && apiUser.role !== null) ? apiUser.role : 
                          (typeof apiUser.roleId === 'object' && apiUser.roleId !== null) ? apiUser.roleId : null;
          const roleStr = roleObj?.roleName || roleObj?.name || (typeof apiUser.role === 'string' ? apiUser.role : '') || (typeof apiUser.roleId === 'string' && !/^[0-9a-fA-F]{24}$/.test(apiUser.roleId) ? apiUser.roleId : '') || (apiUser.roleName || '');
          const roleUpper = roleStr.toUpperCase();
          const roleLower = roleStr.toLowerCase().trim();
          const emailLower = cleanEmail.toLowerCase().trim();

          const isRestaurantOwner = 
            userTypeUpper === 'RESTAURANT_OWNER' || 
            userTypeUpper === 'OWNER' || 
            userTypeUpper === 'SUPER ADMIN' || 
            userTypeUpper === 'SUPER_ADMIN' ||
            userTypeUpper === 'ADMIN' ||
            roleUpper === 'SUPER ADMIN' ||
            roleUpper === 'RESTAURANT_OWNER' ||
            roleUpper === 'OWNER' ||
            roleUpper === 'ADMIN' ||
            roleLower === 'admin' ||
            String(apiUser.name || '').toLowerCase().includes('admin') ||
            emailLower.includes('admin');

          const isManagerOrBranchAdmin = 
            userTypeUpper === 'BRANCH_ADMIN' ||
            userTypeUpper === 'BRANCH ADMIN' ||
            userTypeUpper === 'MANAGER' ||
            roleLower.includes('manager') ||
            roleLower.includes('admin') ||
            roleLower.includes('supervisor');

          // ONLY Waiter and Kitchen staff are disallowed from Admin Panel login.
          // Branch managers, Managers, and all other management roles have login access.
          const isDisallowedStaff = 
            !isRestaurantOwner &&
            !isManagerOrBranchAdmin &&
            (
              roleLower.includes('waiter') ||
              roleLower.includes('kitchen') ||
              roleLower.includes('chef') ||
              roleLower.includes('cook') ||
              roleLower.includes('server') ||
              roleLower.includes('steward') ||
              userTypeUpper === 'STATION'
            );

          if (isDisallowedStaff) {
            sessionStorage.removeItem("userToken");
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("currentUser");
            sessionStorage.clear();
            try { localStorage.clear(); } catch (e) { }
            setCurrentUser(null);
            return {
              success: false,
              error: "Access Denied: Staff credentials (Waiters, Kitchen staff) are only for mobile app login, not for the Admin panel."
            };
          }

          sessionStorage.setItem("userToken", token);
          sessionStorage.setItem("token", token);
          try { localStorage.clear(); } catch (e) { }

          const userBranchId = typeof apiUser.branchId === 'object' && apiUser.branchId !== null
            ? (apiUser.branchId._id || apiUser.branchId.id)
            : (apiUser.branchId || apiUser.activeBranchId || '');

          const resolvedRole = isRestaurantOwner 
            ? 'RESTAURANT_OWNER' 
            : (roleStr || apiUser.role || (isManagerOrBranchAdmin ? 'Branch manager' : 'Staff'));

          const emailKey = cleanEmail.toLowerCase().trim();
          const tokenRestName = extractRestaurantFromToken(token);
          const mappedRestName = KNOWN_RESTAURANT_MAP[emailKey];

          const resolvedRestaurantName = 
            apiUser.restaurantName || 
            apiUser.restaurant_name ||
            (typeof apiUser.restaurant === 'object' ? (apiUser.restaurant?.restaurantName || apiUser.restaurant?.name) : '') ||
            payload?.data?.restaurantName ||
            payload?.restaurantName ||
            (typeof payload?.data?.restaurant === 'object' ? (payload?.data?.restaurant?.restaurantName || payload?.data?.restaurant?.name) : '') ||
            tokenRestName ||
            mappedRestName ||
            '';

          const resolvedOwnerName = apiUser.ownerName || apiUser.name || 'Administrator';
          const resolvedDisplayName = apiUser.name || resolvedOwnerName || resolvedRestaurantName || 'Restaurant Admin';

          const user = {     
            id: apiUser.id || apiUser._id,
            name: resolvedDisplayName,
            restaurantName: resolvedRestaurantName || mappedRestName || 'Main Branch',
            ownerName: resolvedOwnerName,
            email: apiUser.email || cleanEmail,
            phoneNumber: apiUser.phoneNumber || '',
            userType: apiUser.userType || (isRestaurantOwner ? 'RESTAURANT_OWNER' : (isManagerOrBranchAdmin ? 'BRANCH_ADMIN' : 'STAFF')),
            role: resolvedRole,
            roleId: apiUser.roleId || apiUser.role,
            restaurantId: apiUser.restaurantId || (typeof apiUser._id === 'string' ? apiUser._id : currentRestaurantId) || 'rest-1',
            plan: apiUser.plan || apiUser.subscription?.planName || 'Standard',
            subscription: apiUser.subscription || null,
            activeBranchId: isRestaurantOwner ? 'ALL' : (userBranchId || 'ALL'),
            branchId: isRestaurantOwner ? 'ALL' : (userBranchId || 'ALL')
          };

          sessionStorage.setItem("currentUser", JSON.stringify(user));
          setCurrentUser(user);
          const targetRestId = user.restaurantId;
          setCurrentRestaurantId(targetRestId);

          if (!isRestaurantOwner && userBranchId && userBranchId !== 'ALL') {
            setSelectedBranchId(userBranchId);
            sessionStorage.setItem("selectedBranchId", userBranchId);
          } else {
            setSelectedBranchId(null);
            sessionStorage.removeItem("selectedBranchId");
          }

          ShowNotifications.showAlertNotification(payload.message || "Login successful.", true);
          return { success: true, user };
        }
      }

      // If backend rejected login (invalid credentials, incorrect password, etc.)
      const backendMessage =
        apiRes?.response?.data?.message ||
        apiRes?.response?.message ||
        apiRes?.message ||
        apiRes?.data?.message ||
        apiRes?.response?.data?.error ||
        apiRes?.error ||
        "";

      const errorMsg = backendMessage && typeof backendMessage === 'string' && backendMessage.trim()
        ? backendMessage.trim()
        : "Invalid credentials";

      sessionStorage.removeItem("userToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("currentUser");
      sessionStorage.clear();
      try { localStorage.clear(); } catch (e) { }
      setCurrentUser(null);

      // No error toast popup on login page per requirement
      return { success: false, error: errorMsg };
    } catch (e) {
      console.warn("Backend API login error:", e);
      const backendCatchMsg =
        e?.response?.data?.message ||
        e?.response?.message ||
        e?.message ||
        "";

      const errMsg = backendCatchMsg && typeof backendCatchMsg === 'string' && backendCatchMsg.trim()
        ? backendCatchMsg.trim()
        : "Invalid credentials";

      sessionStorage.removeItem("userToken");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("currentUser");
      sessionStorage.clear();
      try { localStorage.clear(); } catch (e) { }
      setCurrentUser(null);
      // No error toast popup on login page per requirement
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRestaurantId(null);
    setSelectedBranchId(null);
    try {
      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('currentUser');
      sessionStorage.clear();
      localStorage.clear();
    } catch (e) { }
    window.location.href = '/login';
  };


  // Restaurant Admin actions
  const saveRestaurantSettings = (id, settings) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;

      const flatSettings = settings.settings || {};

      const updatedRest = {
        ...rest,
        name: settings.name || rest.name,
        logo: flatSettings.logo !== undefined ? flatSettings.logo : rest.logo,
        banner: flatSettings.banner !== undefined ? flatSettings.banner : rest.banner,
        phone: flatSettings.phone !== undefined ? flatSettings.phone : rest.phone,
        address: flatSettings.address !== undefined ? flatSettings.address : rest.address,
        city: flatSettings.city !== undefined ? flatSettings.city : rest.city,
        state: flatSettings.state !== undefined ? flatSettings.state : rest.state,
        gstNumber: flatSettings.gstNumber !== undefined ? flatSettings.gstNumber : rest.gstNumber,
        openingTime: flatSettings.openingTime !== undefined ? flatSettings.openingTime : rest.openingTime,
        closingTime: flatSettings.closingTime !== undefined ? flatSettings.closingTime : rest.closingTime,
        settings: {
          ...rest.settings,
          ...settings,
          ...flatSettings
        }
      };

      // Handle table count resizing inside the hook
      let tables = [...(rest.tables || [])];
      const targetCount = flatSettings.tablesCount !== undefined ? flatSettings.tablesCount : (rest.settings?.tablesCount || 5);
      if (targetCount > tables.length) {
        for (let i = tables.length + 1; i <= targetCount; i++) {
          const displayId = i < 10 ? `0${i}` : i;
          tables.push({ id: `T-${displayId}`, status: 'Free', seats: 4 });
        }
      } else if (targetCount < tables.length) {
        tables = tables.slice(0, targetCount);
      }
      updatedRest.tables = tables;

      return {
        ...prev,
        [id]: updatedRest
      };
    });

    if (settings.accentColor) setAccentColor(settings.accentColor);
    setDarkMode(!!settings.darkMode);
  };

  const addMenuItem = async (id, itemData) => {
    try {
      const res = await MenuApi.createMenuItem(itemData);
      if (res && res.status) {
        await fetchMenu();
      }
    } catch (e) {
      console.error("Failed to add menu item", e);
    }
  };

  const updateMenuItem = async (id, itemId, updatedData) => {
    try {
      const res = await MenuApi.updateMenuItem(itemId, updatedData);
      if (res && res.status) {
        await fetchMenu();
      }
    } catch (e) {
      console.error("Failed to update menu item", e);
    }
  };

  const deleteMenuItem = async (id, itemId) => {
    try {
      const res = await MenuApi.deleteMenuItem(itemId);
      if (res && res.status) {
        await fetchMenu();
      }
    } catch (e) {
      console.error("Failed to delete menu item", e);
    }
  };

  const addDiningTable = async (id, table, skipApi = false) => {
    const tableWithBranch = {
      ...table,
      branchId: table.branchId || selectedBranchId || 'BR-001'
    };
    // Update local state optimistically
    setRestaurantsData(prev => {
      const restObj = prev[id];
      if (!restObj) return prev;
      const curTables = restObj.tables || [];
      if (curTables.some(t => t.id === table.id)) return prev;
      return {
        ...prev,
        [id]: {
          ...restObj,
          tables: [...curTables, tableWithBranch]
        }
      };
    });

    if (skipApi || table?.skipApi) {
      await fetchTables();
      return true;
    }

    try {
      const payload = {
        tableNumber: table.id,
        seatingCapacity: table.seats
      };
      const res = await MemberApi.createTable(payload);
      if (res && res.status) {
        await fetchTables();
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateDiningTable = async (id, tableId, updatedFields, skipApi = false) => {
    const rest = restaurantsData[id];
    if (!rest) return;
    const targetTable = rest.tables?.find(t => t.id === tableId);
    if (!targetTable) return;

    const payload = {};
    if (updatedFields.seats !== undefined) payload.seatingCapacity = updatedFields.seats;
    if (updatedFields.status !== undefined) payload.status = updatedFields.status === 'Occupied';
    if (updatedFields.isActive !== undefined) payload.isActive = updatedFields.isActive;

    // Update local state optimistically
    setRestaurantsData(prev => {
      const restObj = prev[id];
      if (!restObj) return prev;
      return {
        ...prev,
        [id]: {
          ...restObj,
          tables: restObj.tables.map(t => t.id === tableId ? { ...t, ...updatedFields } : t)
        }
      };
    });

    if (skipApi || updatedFields?.skipApi) {
      await fetchTables();
      return;
    }

    try {
      await MemberApi.updateTable(targetTable._id, payload);
      await fetchTables();
    } catch (e) {
      console.error(e);
    }
  };

  const assignTablesToWaiter = (id, waiterId, tableIds, coverWaiterId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          tables: rest.tables.map(t => {
            const isAssignedToThisWaiter = tableIds.includes(t.id);
            if (isAssignedToThisWaiter) {
              return {
                ...t,
                assignedWaiterId: waiterId,
                tempWaiterId: coverWaiterId || null
              };
            } else if (t.assignedWaiterId === waiterId) {
              return {
                ...t,
                assignedWaiterId: null,
                tempWaiterId: null
              };
            }
            return t;
          })
        }
      };
    });
  };

  const updateOrderItemStatus = async (id, orderId, itemName, nextStatus) => {
    const rest = restaurantsData[id];
    if (!rest) return;
    const order = rest.orders.find(o => o.orderId === orderId || o.id === orderId || o._id === orderId);
    if (!order) return;

    const updatedItems = order.items.map(item => {
      if (item.name === itemName) {
        return { ...item, status: nextStatus };
      }
      return item;
    });

    const status = updatedItems.map(item => item.status || 'new');
    const allServed = status.every(s => s === 'completed' || s === 'served');
    const allReadyOrServed = status.every(s => s === 'ready' || s === 'completed' || s === 'served');
    const anyPreparingOrReady = status.some(s => s === 'preparing' || s === 'ready');

    let newOrderStatus = order.status;
    if (allServed) {
      newOrderStatus = 'served';
    } else if (allReadyOrServed) {
      newOrderStatus = 'ready';
    } else if (anyPreparingOrReady) {
      newOrderStatus = 'preparing';
    } else {
      newOrderStatus = 'new';
    }

    const payload = {
      items: updatedItems,
      status: newOrderStatus
    };



    try {
      const idToUpdate = order._id || order.id || order.orderId;
      const res = await OrderApi.updateOrder(idToUpdate, payload);
      if (res && res.status) {
        await fetchOrders();
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateDiningTableSeats = (id, tableId, seats) => {
    updateDiningTable(id, tableId, { seats });
  };

  const deleteDiningTable = async (idOrTableId, maybeTableId) => {
    const tableIdentifier = (typeof idOrTableId === 'object' && idOrTableId !== null)
      ? (idOrTableId._id || idOrTableId.id)
      : (maybeTableId || idOrTableId);

    const restaurantId = activeRestaurant?._id || activeRestaurant?.id || 'rest-001';
    const rest = restaurantsData[restaurantId] || Object.values(restaurantsData)[0];
    const targetTable = rest?.tables?.find(t => t._id === tableIdentifier || t.id === tableIdentifier) || { _id: tableIdentifier };

    // Update local state optimistically
    if (rest && restaurantId) {
      setRestaurantsData(prev => {
        const restObj = prev[restaurantId];
        if (!restObj) return prev;
        const qrs = restObj.qrCodes || [];
        const updatedQrCodes = qrs.map(q => {
          if (q.tableId === tableIdentifier || q.tableId === targetTable.id) {
            return { ...q, status: 'Unassigned', tableId: null };
          }
          return q;
        });
        return {
          ...prev,
          [restaurantId]: {
            ...restObj,
            tables: restObj.tables.filter(t => t._id !== tableIdentifier && t.id !== tableIdentifier),
            qrCodes: updatedQrCodes,
            settings: {
              ...restObj.settings,
              tablesCount: Math.max(0, restObj.tables.length - 1)
            }
          }
        };
      });
    }

    try {
      const deleteId = targetTable._id || targetTable.id || tableIdentifier;
      if (deleteId && deleteId !== 'undefined') {
        await MemberApi.deleteTable(deleteId);
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateQrCode = async (restId) => {
    try {
      const res = await QrCodeApi.generateQrCode();
      if (res && res.status) {
        await fetchQrCodes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const assignQrCode = async (restId, qrId, tableId) => {
    try {
      const res = await QrCodeApi.assignQrCode(qrId, tableId);
      if (res && res.status) {
        await fetchQrCodes();
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const revokeQrCode = async (restId, qrId) => {
    try {
      const res = await QrCodeApi.revokeQrCode(qrId);
      if (res && res.status) {
        await fetchQrCodes();
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteQrCode = async (restId, qrId) => {
    try {
      const res = await QrCodeApi.deleteQrCode(qrId);
      if (res && res.status) {
        await fetchQrCodes();
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addStaff = (id, staffMember) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          staff: [...rest.staff, staffMember]
        }
      };
    });
  };

  const updateStaff = (id, updatedStaff) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          staff: rest.staff.map(s => s.id === updatedStaff.id ? updatedStaff : s)
        }
      };
    });
  };

  const deleteStaff = (id, staffId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          staff: rest.staff.filter(s => s.id !== staffId)
        }
      };
    });
  };

  const updateKitchenPassword = (id, password) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          kitchenLogin: {
            ...rest.kitchenLogin,
            password
          }
        }
      };
    });
  };

  // Inbound Orders
  const updateOrderStatus = async (id, orderId, nextStatus) => {
    // 1. Optimistic Local State Update
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentOrders = rest.orders || [];
      const updatedOrders = currentOrders.map(o => {
        if (o.id === orderId || o._id === orderId || o.orderId === orderId || String(o.id) === String(orderId)) {
          return {
            ...o,
            status: nextStatus
          };
        }
        return o;
      });

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders,
          billingData: computeBillingData(updatedOrders, rest.tables || [])
        }
      };
    });

    // 2. Safe API Sync
    try {
      const rest = restaurantsData[id];
      if (rest) {
        const order = (rest.orders || []).find(o => o.orderId === orderId || o.id === orderId || o._id === orderId || String(o.id) === String(orderId));
        if (order) {
          const payload = { status: nextStatus };
          const idToUpdate = order._id || order.id || order.orderId;
          await OrderApi.updateOrder(idToUpdate, payload).catch(() => { });
        }
      }
    } catch (e) {
      // Ignore background sync errors
    }
  };

  const assignWaiterToOrder = async (id, orderId, waiterName) => {
    // 1. Optimistic Local State Update
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentOrders = rest.orders || [];
      const updatedOrders = currentOrders.map(o => {
        if (o.id === orderId || o._id === orderId || o.orderId === orderId || String(o.id) === String(orderId)) {
          return {
            ...o,
            waiter: waiterName
          };
        }
        return o;
      });

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders
        }
      };
    });

    // 2. Safe API Sync
    try {
      const rest = restaurantsData[id];
      if (rest) {
        const order = (rest.orders || []).find(o => o.orderId === orderId || o.id === orderId || o._id === orderId || String(o.id) === String(orderId));
        if (order) {
          const idToUpdate = order._id || order.id || order.orderId;
          await OrderApi.updateOrder(idToUpdate, { waiter: waiterName }).catch(() => { });
        }
      }
    } catch (e) {
      // Ignore background sync errors
    }
  };

  const addOrder = async (id, newOrderData, skipApiCall = false) => {
    // 1. Optimistic Local State Update
    const orderWithDefaults = {
      id: newOrderData.orderId || newOrderData.id || `ORD-TMP-${String(Date.now()).slice(-4)}`,
      orderId: newOrderData.orderId || newOrderData.id || `ORD-TMP-${String(Date.now()).slice(-4)}`,
      table: newOrderData.table || '01',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: 'Just now',
      items: newOrderData.items || [],
      notes: newOrderData.notes || '',
      subtotal: newOrderData.subtotal || 0,
      tax: newOrderData.tax || 0,
      total: newOrderData.total || 0,
      status: newOrderData.status || 'new',
      billingStatus: newOrderData.billingStatus || 'unpaid',
      waiter: newOrderData.waiter || 'Unassigned',
      branchId: newOrderData.branchId || 'BR-001',
      createdAt: new Date().toISOString(),
      ...newOrderData
    };

    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentOrders = rest.orders || [];
      const updatedOrders = [orderWithDefaults, ...currentOrders];

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders,
          billingData: computeBillingData(updatedOrders, rest.tables || [])
        }
      };
    });

    return orderWithDefaults;
  };

  const deleteOrder = async (id, orderId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentOrders = rest.orders || [];
      const updatedOrders = currentOrders.filter(o => o.id !== orderId && o._id !== orderId && String(o.id) !== String(orderId));

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders,
          billingData: computeBillingData(updatedOrders, rest.tables || [])
        }
      };
    });
  };

  const updateOrder = async (id, orderId, updatedFields) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentOrders = rest.orders || [];
      const updatedOrders = currentOrders.map(o => {
        if (o.id === orderId || o._id === orderId || o.orderId === orderId || String(o.id) === String(orderId)) {
          return {
            ...o,
            ...updatedFields
          };
        }
        return o;
      });

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders,
          billingData: computeBillingData(updatedOrders, rest.tables || [])
        }
      };
    });


  };

  const markBillAsPaid = async (id, tableLabel) => {
    // 1. Optimistic Local State Update
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const cleanTable = tableLabel.replace('Table ', '').trim();
      const updatedOrders = (rest.orders || []).map(o => {
        const oTable = o.table.replace('Table ', '').trim();
        if (oTable === cleanTable) {
          return {
            ...o,
            billingStatus: 'paid',
            status: 'completed'
          };
        }
        return o;
      });

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders,
          billingData: computeBillingData(updatedOrders, rest.tables || [])
        }
      };
    });

    // 2. Safe API Sync
    try {
      await OrderApi.payBill(tableLabel).catch(() => { });
    } catch (e) {
      // Ignore background sync errors
    }
  };

  const updateRolePermissions = (restaurantId, roleName, permissions) => {
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentRoles = rest.roles || DEFAULT_ROLES;
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          roles: {
            ...currentRoles,
            [roleName]: {
              ...currentRoles[roleName],
              permissions
            }
          }
        }
      };
    });
  };

  const addNewRole = (restaurantId, roleName) => {
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentRoles = rest.roles || DEFAULT_ROLES;
      if (currentRoles[roleName]) return prev;
      const basePermissions = {
        overview: { view: false, add: false, edit: false, delete: false },
        'branch-management': { view: false, add: false, edit: false, delete: false },
        orders: { view: false, add: false, edit: false, delete: false },
        menu: { view: false, add: false, edit: false, delete: false },
        tables: { view: false, add: false, edit: false, delete: false },
        billing: { view: false, add: false, edit: false, delete: false },
        waiter: { view: false, add: false, edit: false, delete: false },
        kitchen: { view: false, add: false, edit: false, delete: false },
        Reports: { view: false, add: false, edit: false, delete: false },
        users: { view: false, add: false, edit: false, delete: false },
        'roles-permissions': { view: false, add: false, edit: false, delete: false },
        Settings: { view: false, add: false, edit: false, delete: false }
      };
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          roles: {
            ...currentRoles,
            [roleName]: {
              permissions: basePermissions
            }
          }
        }
      };
    });
  };

  const deleteRole = (restaurantId, roleName) => {
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentRoles = rest.roles || DEFAULT_ROLES;
      const nextRoles = { ...currentRoles };
      delete nextRoles[roleName];
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          roles: nextRoles
        }
      };
    });
  };

  const updateMenuCategories = (restaurantId, categories) => {
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          categories
        }
      };
    });
  };

  const checkIsAdmin = () => {
    const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
      ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
      : (typeof currentUser?.role === 'string' ? currentUser.role : '');
    const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

    const userRole = (roleStr || '').toLowerCase();
    const userType = (userTypeStr || '').toUpperCase();
    return (
      userRole === 'admin' || 
      userRole === 'super admin' || 
      userRole === 'super_admin' || 
      userRole === 'owner' || 
      userRole === 'restaurant_owner' || 
      userRole === 'restaurant owner' ||
      userRole === 'administrator' ||
      userType === 'ADMIN' || 
      userType === 'SUPER ADMIN' || 
      userType === 'SUPER_ADMIN' || 
      userType === 'RESTAURANT_OWNER' || 
      userType === 'OWNER' ||
      userType === 'ADMINISTRATOR' ||
      String(currentUser?.name || '').toLowerCase().includes('admin') ||
      String(currentUser?.email || '').toLowerCase().includes('admin') ||
      !currentUser?.branchId ||
      currentUser?.branchId === 'ALL'
    );
  };

  const addBranch = (restaurantId, branchData) => {
    if (!checkIsAdmin()) {
      ShowNotifications.showAlertNotification("Unauthorized: Only Admin role can create new branches.", false);
      return;
    }
    setRestaurantsData(prev => {
      const rest = prev[restaurantId] || (currentRestaurantId ? prev[currentRestaurantId] : null) || Object.values(prev)[0];
      if (!rest) return prev;
      const targetRestKey = restaurantId && prev[restaurantId] ? restaurantId : (currentRestaurantId && prev[currentRestaurantId] ? currentRestaurantId : Object.keys(prev)[0]);
      const currentBranches = rest.branches || [];
      const mgrName = branchData.managerName || branchData.branchManager || '';
      const newBranch = {
        id: branchData.id || `BR-${Date.now()}`,
        _id: branchData._id || branchData.id || `BR-${Date.now()}`,
        branchCode: branchData.branchCode || `BR-${Math.floor(100 + Math.random() * 900)}`,
        branchName: branchData.branchName || branchData.name || 'New Branch',
        name: branchData.branchName || branchData.name || 'New Branch',
        managerName: mgrName,
        branchManager: mgrName,
        mobileNumber: branchData.mobileNumber || branchData.contactNumber || branchData.phone || '',
        email: branchData.email || '',
        address: branchData.address || '',
        country: branchData.country || 'India',
        state: branchData.state || 'Tamil Nadu',
        city: branchData.city || '',
        pincode: branchData.pincode || '',
        openingDate: branchData.openingDate || new Date().toISOString().split('T')[0],
        status: branchData.status || 'Active',
        totalTables: parseInt(branchData.totalTables) || 10,
        username: branchData.username || '',
        password: branchData.password || '',
        gstNumber: branchData.gstNumber || '',
        fssaiNumber: branchData.fssaiNumber || '',
        operationalData: branchData.operationalData || {
          tablesCount: parseInt(branchData.totalTables) || 10,
          activeOrders: 0,
          staffCount: 5,
          kitchenStations: 1,
          todayRevenue: "₹0"
        }
      };
      return {
        ...prev,
        [targetRestKey]: {
          ...rest,
          branches: [...currentBranches, newBranch]
        }
      };
    });
  };

  const updateBranch = (restaurantId, branchId, updatedData) => {
    if (!checkIsAdmin()) {
      ShowNotifications.showAlertNotification("Unauthorized: Only Admin role can edit branches.", false);
      return;
    }
    setRestaurantsData(prev => {
      const targetRestKey = restaurantId && prev[restaurantId] ? restaurantId : (currentRestaurantId && prev[currentRestaurantId] ? currentRestaurantId : Object.keys(prev)[0]);
      const rest = prev[targetRestKey];
      if (!rest) return prev;
      const currentBranches = rest.branches || [];
      const updatedBranches = currentBranches.map(b => {
        if (b.id === branchId || b._id === branchId || String(b.id) === String(branchId) || String(b._id) === String(branchId)) {
          const nameVal = updatedData.branchName || updatedData.name || b.branchName || b.name || '';
          const mgr = updatedData.managerName || updatedData.branchManager || b.managerName || b.branchManager || '';
          return {
            ...b,
            ...updatedData,
            name: nameVal,
            branchName: nameVal,
            managerName: mgr,
            branchManager: mgr,
            totalTables: updatedData.totalTables ? parseInt(updatedData.totalTables) : b.totalTables,
            operationalData: {
              ...b.operationalData,
              tablesCount: updatedData.totalTables ? parseInt(updatedData.totalTables) : (b.operationalData?.tablesCount || b.totalTables)
            }
          };
        }
        return b;
      });
      return {
        ...prev,
        [targetRestKey]: {
          ...rest,
          branches: updatedBranches
        }
      };
    });
  };

  const deleteBranch = (restaurantId, branchId) => {
    if (!checkIsAdmin()) {
      ShowNotifications.showAlertNotification("Unauthorized: Only Admin role can delete branches.", false);
      return;
    }
    setRestaurantsData(prev => {
      const targetRestKey = restaurantId && prev[restaurantId] ? restaurantId : (currentRestaurantId && prev[currentRestaurantId] ? currentRestaurantId : Object.keys(prev)[0]);
      const rest = prev[targetRestKey];
      if (!rest) return prev;
      const currentBranches = rest.branches || [];
      return {
        ...prev,
        [targetRestKey]: {
          ...rest,
          branches: currentBranches.filter(b => b.id !== branchId && b._id !== branchId)
        }
      };
    });
  };

  const toggleBranchStatus = (restaurantId, branchId) => {
    if (!checkIsAdmin()) {
      ShowNotifications.showAlertNotification("Unauthorized: Only Admin role can change branch status.", false);
      return;
    }
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentBranches = rest.branches || [];
      const updatedBranches = currentBranches.map(b => {
        if (b.id === branchId) {
          return {
            ...b,
            status: b.status === 'Active' ? 'Inactive' : 'Active'
          };
        }
        return b;
      });
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          branches: updatedBranches
        }
      };
    });
  };

  const addUser = (restaurantId, userData) => {
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentUsers = rest.users || [];
      const newUser = {
        id: userData.id || `USR-${Date.now()}`,
        branchId: userData.branchId || (selectedBranchId || 'ALL'),
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        role: userData.role || 'Branch Admin',
        status: userData.status || 'Active',
        lastLogin: 'Never'
      };
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          users: [...currentUsers, newUser]
        }
      };
    });
  };

  const updateUser = (restaurantId, userId, updatedData) => {
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentUsers = rest.users || [];
      const updatedUsers = currentUsers.map(u => {
        if (u.id === userId) {
          return {
            ...u,
            ...updatedData
          };
        }
        return u;
      });
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          users: updatedUsers
        }
      };
    });
  };

  const deleteUser = (restaurantId, userId) => {
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentUsers = rest.users || [];
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          users: currentUsers.filter(u => u.id !== userId)
        }
      };
    });
  };

  // INVENTORY MANAGEMENT HANDLERS
  const addInventoryItem = (id, itemData) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentInventory = rest.inventory || [];
      const newId = itemData.id || `INV-${String(currentInventory.length + 1).padStart(3, '0')}`;
      const newItem = {
        ...itemData,
        id: newId,
        currentStock: Number(itemData.currentStock) || 0,
        minStockLevel: Number(itemData.minStockLevel) || 0,
        costPerUnit: Number(itemData.costPerUnit) || 0,
        status: (Number(itemData.currentStock) <= 0) ? 'Out of Stock' : (Number(itemData.currentStock) <= Number(itemData.minStockLevel)) ? 'Low Stock' : 'In Stock',
        lastRestocked: itemData.lastRestocked || new Date().toISOString().split('T')[0]
      };

      const newLog = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        itemId: newId,
        itemName: newItem.name,
        type: 'Stock In',
        quantity: newItem.currentStock,
        unit: newItem.unit,
        date: new Date().toLocaleString(),
        reason: 'Initial Stock Creation',
        user: currentUser?.name || 'Admin',
        notes: 'Item added to inventory'
      };

      return {
        ...prev,
        [id]: {
          ...rest,
          inventory: [newItem, ...currentInventory],
          inventoryLogs: [newLog, ...(rest.inventoryLogs || [])]
        }
      };
    });
  };

  const updateInventoryItem = (id, itemId, itemData) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentInventory = rest.inventory || [];
      return {
        ...prev,
        [id]: {
          ...rest,
          inventory: currentInventory.map(item => {
            if (item.id === itemId) {
              const updatedStock = itemData.currentStock !== undefined ? Number(itemData.currentStock) : item.currentStock;
              const updatedMin = itemData.minStockLevel !== undefined ? Number(itemData.minStockLevel) : item.minStockLevel;
              const status = (updatedStock <= 0) ? 'Out of Stock' : (updatedStock <= updatedMin) ? 'Low Stock' : 'In Stock';
              return {
                ...item,
                ...itemData,
                currentStock: updatedStock,
                minStockLevel: updatedMin,
                costPerUnit: itemData.costPerUnit !== undefined ? Number(itemData.costPerUnit) : item.costPerUnit,
                status
              };
            }
            return item;
          })
        }
      };
    });
  };

  const deleteInventoryItem = (id, itemId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          inventory: (rest.inventory || []).filter(item => item.id !== itemId)
        }
      };
    });
  };

  const adjustStock = (id, itemId, type, quantity, reason, notes) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const qtyNum = Number(quantity) || 0;
      let targetItemName = '';
      let targetUnit = '';

      const updatedInventory = (rest.inventory || []).map(item => {
        if (item.id === itemId) {
          targetItemName = item.name;
          targetUnit = item.unit;
          let newStock = item.currentStock;
          if (type === 'Stock In') {
            newStock += qtyNum;
          } else {
            newStock = Math.max(0, newStock - qtyNum);
          }
          const status = (newStock <= 0) ? 'Out of Stock' : (newStock <= item.minStockLevel) ? 'Low Stock' : 'In Stock';
          return {
            ...item,
            currentStock: newStock,
            status,
            lastRestocked: type === 'Stock In' ? new Date().toISOString().split('T')[0] : item.lastRestocked
          };
        }
        return item;
      });

      const newLog = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        itemId: itemId,
        itemName: targetItemName || 'Inventory Item',
        type: type,
        quantity: qtyNum,
        unit: targetUnit || 'units',
        date: new Date().toLocaleString(),
        reason: reason || (type === 'Stock In' ? 'Stock Purchase' : 'Kitchen Issue'),
        user: currentUser?.name || 'Admin',
        notes: notes || ''
      };

      return {
        ...prev,
        [id]: {
          ...rest,
          inventory: updatedInventory,
          inventoryLogs: [newLog, ...(rest.inventoryLogs || [])]
        }
      };
    });
  };

  const reduceInventoryStock = (id, reductionData) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;

      const qtyNum = Math.abs(Number(reductionData.quantity)) || 0;
      let targetItemName = '';
      let targetSku = '';
      let targetCategory = '';
      let targetUnit = 'kg';
      let remainingStockVal = 0;

      const updatedInventory = (rest.inventory || []).map(item => {
        if (item.id === reductionData.itemId) {
          targetItemName = item.name;
          targetSku = item.sku || '';
          targetCategory = item.category || 'General';
          targetUnit = item.unit || 'units';
          const newStock = Math.max(0, parseFloat((item.currentStock - qtyNum).toFixed(2)));
          remainingStockVal = newStock;
          const status = (newStock <= 0) ? 'Out of Stock' : (newStock <= (item.minStockLevel || 5)) ? 'Low Stock' : 'In Stock';
          return {
            ...item,
            currentStock: newStock,
            status
          };
        }
        return item;
      });

      const nextRedId = `RED-${Date.now().toString().slice(-6)}`;
      const newReduction = {
        id: nextRedId,
        itemId: reductionData.itemId,
        itemName: targetItemName || reductionData.itemName || 'Item',
        sku: targetSku,
        category: targetCategory,
        branchId: reductionData.branchId || rest.selectedBranchId || 'BR-001',
        quantity: qtyNum,
        unit: targetUnit,
        remainingStock: remainingStockVal,
        reason: reductionData.reason || 'Kitchen Usage',
        date: reductionData.date || new Date().toLocaleString(),
        reducedBy: reductionData.reducedBy || currentUser?.name || 'Admin',
        notes: reductionData.notes || ''
      };

      const newLog = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        itemId: reductionData.itemId,
        itemName: targetItemName || 'Inventory Item',
        type: 'Stock Out',
        quantity: qtyNum,
        unit: targetUnit,
        date: new Date().toLocaleString(),
        reason: reductionData.reason || 'Stock Reduction',
        user: reductionData.reducedBy || currentUser?.name || 'Admin',
        notes: `Reduced ${qtyNum} ${targetUnit} (${reductionData.reason || 'Manual'}). Remaining: ${remainingStockVal} ${targetUnit}. ${reductionData.notes || ''}`
      };

      return {
        ...prev,
        [id]: {
          ...rest,
          inventory: updatedInventory,
          inventoryReductions: [newReduction, ...(rest.inventoryReductions || [])],
          inventoryLogs: [newLog, ...(rest.inventoryLogs || [])]
        }
      };
    });
  };

  const addPurchaseRecord = (id, purchaseData) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;

      const qtyNum = Number(purchaseData.quantity) || 0;
      const unitPriceNum = Number(purchaseData.unitPrice) || 0;
      const totalAmountNum = purchaseData.totalAmount ? Number(purchaseData.totalAmount) : (qtyNum * unitPriceNum);
      const nextPurId = `PUR-${Date.now().toString().slice(-6)}`;

      let targetItemName = purchaseData.itemName || '';
      let targetUnit = purchaseData.unit || 'kg';
      let foundExisting = false;

      const updatedInventory = (rest.inventory || []).map(item => {
        if (item.id === purchaseData.itemId || (purchaseData.itemName && item.name.toLowerCase() === purchaseData.itemName.toLowerCase())) {
          foundExisting = true;
          targetItemName = item.name;
          targetUnit = item.unit || purchaseData.unit || 'kg';
          const newStock = parseFloat((item.currentStock + qtyNum).toFixed(2));
          const status = (newStock <= 0) ? 'Out of Stock' : (newStock <= (item.minStockLevel || 5)) ? 'Low Stock' : 'In Stock';
          return {
            ...item,
            currentStock: newStock,
            costPerUnit: unitPriceNum || item.costPerUnit,
            lastRestocked: purchaseData.purchaseDate || new Date().toISOString().split('T')[0],
            supplierName: purchaseData.supplierName || item.supplierName,
            supplierPhone: purchaseData.supplierPhone || item.supplierPhone,
            status
          };
        }
        return item;
      });

      // If it's a new item not in inventory yet, add it
      let finalInventory = updatedInventory;
      if (!foundExisting && purchaseData.itemName) {
        const newItemObj = {
          id: purchaseData.itemId || `INV-${String(rest.inventory?.length + 1 || 1).padStart(3, '0')}`,
          sku: purchaseData.sku || `ING-${purchaseData.itemName.slice(0, 3).toUpperCase()}-01`,
          name: purchaseData.itemName,
          category: purchaseData.category || 'General',
          branchId: purchaseData.branchId || 'BR-001',
          currentStock: qtyNum,
          minStockLevel: 5.0,
          unit: purchaseData.unit || 'kg',
          costPerUnit: unitPriceNum,
          supplierName: purchaseData.supplierName || 'General Supplier',
          supplierPhone: purchaseData.supplierPhone || '',
          lastRestocked: purchaseData.purchaseDate || new Date().toISOString().split('T')[0],
          status: qtyNum > 0 ? 'In Stock' : 'Out of Stock'
        };
        finalInventory = [newItemObj, ...finalInventory];
      }

      const newPurchase = {
        id: nextPurId,
        itemId: purchaseData.itemId || (finalInventory[0]?.id),
        itemName: targetItemName || purchaseData.itemName,
        category: purchaseData.category || 'General',
        branchId: purchaseData.branchId || 'BR-001',
        supplierName: purchaseData.supplierName || 'General Supplier',
        supplierPhone: purchaseData.supplierPhone || '',
        supplierEmail: purchaseData.supplierEmail || '',
        quantity: qtyNum,
        unit: targetUnit,
        unitPrice: unitPriceNum,
        totalAmount: totalAmountNum,
        invoiceNumber: purchaseData.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`,
        purchaseDate: purchaseData.purchaseDate || new Date().toISOString().split('T')[0],
        paymentStatus: purchaseData.paymentStatus || 'Paid',
        addedBy: purchaseData.addedBy || currentUser?.name || 'Admin',
        notes: purchaseData.notes || ''
      };

      const newLog = {
        id: `LOG-${Date.now().toString().slice(-6)}`,
        itemId: newPurchase.itemId,
        itemName: newPurchase.itemName,
        type: 'Stock In',
        quantity: qtyNum,
        unit: targetUnit,
        date: new Date().toLocaleString(),
        reason: 'Supplier Purchase',
        user: purchaseData.addedBy || currentUser?.name || 'Admin',
        notes: `Purchased ${qtyNum} ${targetUnit} from ${purchaseData.supplierName || 'Supplier'} (Invoice #${newPurchase.invoiceNumber})`
      };

      return {
        ...prev,
        [id]: {
          ...rest,
          inventory: finalInventory,
          inventoryPurchases: [newPurchase, ...(rest.inventoryPurchases || [])],
          inventoryLogs: [newLog, ...(rest.inventoryLogs || [])]
        }
      };
    });
  };

  const deletePurchaseRecord = (id, purchaseId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          inventoryPurchases: (rest.inventoryPurchases || []).filter(p => p.id !== purchaseId)
        }
      };
    });
  };

  const deleteReductionRecord = (id, reductionId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          inventoryReductions: (rest.inventoryReductions || []).filter(r => r.id !== reductionId)
        }
      };
    });
  };

  const addInventoryCategory = (id, categoryData) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentCategories = rest.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES;
      const newCategory = {
        id: categoryData.id || `INV-CAT-${String(currentCategories.length + 1).padStart(3, '0')}`,
        name: categoryData.name,
        description: categoryData.description || '',
        status: categoryData.status || 'AVAILABLE'
      };
      return {
        ...prev,
        [id]: {
          ...rest,
          inventoryCategories: [newCategory, ...currentCategories]
        }
      };
    });
  };

  const updateInventoryCategory = (id, catId, categoryData) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentCategories = rest.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES;
      return {
        ...prev,
        [id]: {
          ...rest,
          inventoryCategories: currentCategories.map(cat => (cat.id === catId || cat._id === catId) ? { ...cat, ...categoryData } : cat)
        }
      };
    });
  };

  const deleteInventoryCategory = (id, catId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentCategories = rest.inventoryCategories || DEFAULT_INVENTORY_CATEGORIES;
      return {
        ...prev,
        [id]: {
          ...rest,
          inventoryCategories: currentCategories.filter(cat => cat.id !== catId && cat._id !== catId)
        }
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        restaurantsData,
        currentUser,
        currentRestaurantId,
        darkMode,
        accentColor,
        qrCustomizer,
        activeRestaurant,
        selectedBranchId,
        setSelectedBranchId,
        fetchBranches,
        fetchSubscriptionDashboard,
        fetchOrders,
        fetchTables,
        fetchMenu,

        login,
        logout,
        saveRestaurantSettings,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        addDiningTable,
        updateDiningTableSeats,
        updateDiningTable,
        assignTablesToWaiter,
        deleteDiningTable,
        generateQrCode,
        assignQrCode,
        revokeQrCode,
        deleteQrCode,
        addStaff,
        updateStaff,
        deleteStaff,
        updateKitchenPassword,
        updateOrderStatus,
        updateOrderItemStatus,
        upgradeRestaurantPlan,
        upgradeSubscriptionPlan,
        purchaseExtraBranchSlots,
        toggleSubscriptionAutoRenew,
        assignWaiterToOrder,
        addOrder,
        createOrder: addOrder,
        deleteOrder,
        updateOrder,
        markBillAsPaid,
        setDarkMode,
        setAccentColor,
        setQrCustomizer,
        updateRolePermissions,
        addNewRole,
        deleteRole,
        updateMenuCategories,
        addBranch,
        updateBranch,
        deleteBranch,
        toggleBranchStatus,
        addUser,
        updateUser,
        deleteUser,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        adjustStock,
        reduceInventoryStock,
        addPurchaseRecord,
        deletePurchaseRecord,
        deleteReductionRecord,
        addInventoryCategory,
        updateInventoryCategory,
        deleteInventoryCategory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => useContext(AppContext);
