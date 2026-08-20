import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRestaurantsData, initialState, AVAILABLE_PLANS } from './initialData';
import AuthApi from '../api/Auth.js';
import MemberApi from '../api/Table.js';
import QrCodeApi from '../api/QrCode.js';
import OrderApi from '../api/Order.js';
import MenuApi from '../api/Menu.js';
import BranchApi from '../api/Branch.js';
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

export const AppProvider = ({ children }) => {
  // Core database states
  const [restaurantsData, setRestaurantsData] = useState(initialRestaurantsData);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('serviq_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [currentRestaurantId, setCurrentRestaurantId] = useState(() => {
    try {
      return localStorage.getItem('serviq_rest_id') || (initialRestaurantsData['rest-1'] ? 'rest-1' : null);
    } catch (e) {
      return null;
    }
  });
  // Active Tenant settings overrides / defaults
  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState('#ff7a00');
  const [qrCustomizer, setQrCustomizer] = useState({ color: '#ff7a00', showLogo: true });
  // Branch filter state (null = All Branches)
  const [selectedBranchId, setSelectedBranchId] = useState(() => {
    return localStorage.getItem('serviq_branch_id') || null;
  });

  // Sync selectedBranchId to localStorage
  useEffect(() => {
    if (selectedBranchId) {
      localStorage.setItem('serviq_branch_id', selectedBranchId);
    } else {
      localStorage.removeItem('serviq_branch_id');
    }
  }, [selectedBranchId]);


  // Active computed tenant info
  const activeRestaurant = (currentRestaurantId ? restaurantsData[currentRestaurantId] : null) || {
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
    waiterRequests: [],
    serviceRequests: [],
    feedback: []
  };

  const computeBillingData = (ordersList = [], tablesList = []) => {
    return tablesList.map(t => {
      const tableNum = t.id.replace('T-', '');
      const tableLabel = `Table ${tableNum}`;
      const unpaidOrders = ordersList.filter(o => {
        const oTable = o.table.replace('Table ', '').trim();
        return (oTable === tableNum || parseInt(oTable) === parseInt(tableNum)) && o.billingStatus === 'unpaid';
      });

      if (unpaidOrders.length > 0) {
        const total = unpaidOrders.reduce((sum, o) => sum + o.total, 0);
        return {
          table: tableLabel,
          orders: unpaidOrders.length,
          total: total,
          status: 'Unpaid'
        };
      } else {
        const paidOrders = ordersList.filter(o => {
          const oTable = o.table.replace('Table ', '').trim();
          return (oTable === tableNum || parseInt(oTable) === parseInt(tableNum)) && o.billingStatus === 'paid';
        });
        const lastPaidTotal = paidOrders.length > 0 ? paidOrders[paidOrders.length - 1].total : 0;
        return {
          table: tableLabel,
          orders: 0,
          total: lastPaidTotal,
          status: 'Paid'
        };
      }
    });
  };

  const fetchTables = async () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token || !currentRestaurantId) return;
    try {
      const res = await MemberApi.getTables();
      if (res && res.status && res.response && res.response.data) {
        setRestaurantsData(prev => {
          const rest = prev[currentRestaurantId];
          if (!rest) return prev;
          const localTables = rest.tables || [];
          const mapped = res.response.data.map(t => {
            const localT = localTables.find(lt => lt.id.toLowerCase() === t.tableNumber.toLowerCase());
            return {
              _id: t._id,
              id: t.tableNumber,
              seats: t.seatingCapacity,
              status: t.status ? 'Occupied' : 'Free',
              isActive: t.isActive,
              assignedWaiterId: localT?.assignedWaiterId || null,
              tempWaiterId: localT?.tempWaiterId || null,
              assignedQrId: t.assignedQrId || null
            };
          });
          const computedBillData = computeBillingData(rest.orders || [], mapped);
          return {
            ...prev,
            [currentRestaurantId]: {
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

  const fetchQrCodes = async () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token || !currentRestaurantId) return;
    try {
      const res = await QrCodeApi.getQrCodes();
      if (res && res.status && res.response && res.response.data) {
        setRestaurantsData(prev => {
          const rest = prev[currentRestaurantId];
          if (!rest) return prev;
          return {
            ...prev,
            [currentRestaurantId]: {
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

  const fetchOrders = async () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token || !currentRestaurantId) return;
    try {
      const res = await OrderApi.getOrders();
      if (res && res.status && res.response && res.response.data) {
        setRestaurantsData(prev => {
          const rest = prev[currentRestaurantId];
          if (!rest) return prev;
          const computedBillData = computeBillingData(res.response.data, rest.tables || []);
          return {
            ...prev,
            [currentRestaurantId]: {
              ...rest,
              orders: res.response.data,
              billingData: computedBillData
            }
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch orders", e);
    }
  };

  const fetchMenu = async () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token || !currentRestaurantId) return;
    try {
      const res = await MenuApi.getMenuItems();
      if (res && res.status && res.response && res.response.data) {
        setRestaurantsData(prev => {
          const rest = prev[currentRestaurantId];
          if (!rest) return prev;
          return {
            ...prev,
            [currentRestaurantId]: {
              ...rest,
              menu: res.response.data
            }
          };
        });
      }
    } catch (e) {
      console.error("Failed to fetch menu items", e);
    }
  };

  const fetchBranches = async () => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token || !currentRestaurantId || token.startsWith('mock_')) return;
    try {
      const res = await BranchApi.getBranches();
      if (res && res.status && res.response) {
        const branchArray = Array.isArray(res.response) ? res.response : res.response.data;
        if (Array.isArray(branchArray)) {
          setRestaurantsData(prev => {
            const rest = prev[currentRestaurantId] || {
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
              inventoryLogs: []
            };
            
            const mappedBranches = branchArray.map(b => ({
              id: b._id,
              branchName: b.branchName,
              branchCode: b.branchCode,
              branchManager: b.managerName || b.branchManager,
              mobileNumber: b.contactNumber || b.mobileNumber,
              email: b.email,
              address: b.address?.street || b.address || '',
              country: b.address?.country || b.country || '',
              state: b.address?.state || b.state || '',
              city: b.address?.city || b.city || '',
              pincode: b.address?.pincode || b.pincode || '',
              openingDate: b.branchOpeningDate ? b.branchOpeningDate.split('T')[0] : (b.openingDate || ''),
              status: b.status || 'Active',
              totalTables: b.totalTables || 10
            }));

            return {
              ...prev,
              [currentRestaurantId]: {
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

  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token || !currentUser || !currentRestaurantId || token.startsWith('mock_')) return;

    const initData = async () => {
      await fetchBranches();
    };
    initData();
  }, [currentUser, currentRestaurantId]);

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
    let backendErrorMessage = '';

    // 1. Backend API login attempt
    try {
      const apiRes = await AuthApi.login(cleanEmail, password);
      if (apiRes && (apiRes.status === true || apiRes.response?.success === true)) {
        const payload = apiRes.response || apiRes.data;
        const token = payload?.data?.token;
        const apiUser = payload?.data?.user;

        if (token) {
          localStorage.setItem("userToken", token);
          localStorage.setItem("token", token);
        }

        if (apiUser) {
          const userTypeUpper = (apiUser.userType || '').toUpperCase();
          const user = {
            id: apiUser.id,
            name: apiUser.name,
            email: apiUser.email || cleanEmail,
            phoneNumber: apiUser.phoneNumber,
            userType: apiUser.userType, // "RESTAURANT_OWNER"
            role: userTypeUpper === 'RESTAURANT_OWNER' ? 'RESTAURANT_OWNER' : (apiUser.role || 'Admin'),
            restaurantId: apiUser.restaurantId || currentRestaurantId || 'rest-1',
            activeBranchId: apiUser.activeBranchId || 'ALL',
            branchId: userTypeUpper === 'RESTAURANT_OWNER' ? 'ALL' : (apiUser.activeBranchId || 'ALL')
          };

          setCurrentUser(user);
          const targetRestId = apiUser.restaurantId || currentRestaurantId || 'rest-1';
          setCurrentRestaurantId(targetRestId);
          setSelectedBranchId(user.branchId === 'ALL' ? null : user.branchId);

          try {
            localStorage.setItem('serviq_user', JSON.stringify(user));
            localStorage.setItem('serviq_rest_id', targetRestId);
          } catch (e) {}

          ShowNotifications.showAlertNotification(payload.message || "Login successful.", true);
          return { success: true, user };
        }
      } else if (apiRes && !apiRes.status) {
        backendErrorMessage = apiRes.message || apiRes.response?.message || '';
      }
    } catch (e) {
      console.warn("Backend API login attempt note:", e);
    }

    // 2. Mock/Offline Fallback for Restaurant Owner (e.g. arjun.kumar@royalspice.test or admin@serviq.com)
    if (
      (cleanEmail === 'arjun.kumar@royalspice.test' || cleanEmail === 'admin@serviq.com') &&
      (password === 'admin123' || password === 'admin' || password === '123456' || password === 'password123')
    ) {
      const user = {
        id: cleanEmail === 'admin@serviq.com' ? 'adm-serviq-01' : '6a7ef447d15d03c37e50ea65',
        name: cleanEmail === 'admin@serviq.com' ? 'Admin' : 'Arjun Kumar',
        email: cleanEmail,
        phoneNumber: '9876543211',
        userType: 'RESTAURANT_OWNER',
        role: 'RESTAURANT_OWNER',
        restaurantId: 'rest-1',
        activeBranchId: 'BR-001',
        branchId: 'ALL'
      };
      const mockToken = 'mock_jwt_token_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      localStorage.setItem("userToken", mockToken);
      localStorage.setItem("token", mockToken);
      setCurrentUser(user);
      setCurrentRestaurantId('rest-1');
      setSelectedBranchId(null);
      try {
        localStorage.setItem('serviq_user', JSON.stringify(user));
        localStorage.setItem('serviq_rest_id', 'rest-1');
        localStorage.removeItem('serviq_branch_id');
      } catch (e) {}
      ShowNotifications.showAlertNotification("Login successful", true);
      return { success: true, user };
    }

    // 3. Check Admin / users / staff in local restaurant dataset
    for (let id in restaurantsData) {
      const rest = restaurantsData[id];
      if (!rest) continue;

      // Check Tenant owner/admin
      if (
        ((rest.owner && rest.owner.toLowerCase() === cleanEmail) || (rest.email && rest.email.toLowerCase() === cleanEmail)) &&
        (password === 'admin123' || password === 'admin' || password === '123456' || password === 'password123')
      ) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = {
          id: rest.id || id,
          name: rest.ownerName || rest.name + ' Admin',
          email: cleanEmail,
          role: 'RESTAURANT_OWNER',
          userType: 'RESTAURANT_OWNER',
          restaurantId: id,
          activeBranchId: 'ALL',
          branchId: 'ALL'
        };
        const mockToken = 'mock_jwt_token_' + id;
        localStorage.setItem("userToken", mockToken);
        localStorage.setItem("token", mockToken);
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        setSelectedBranchId(null);
        try {
          localStorage.setItem('serviq_user', JSON.stringify(user));
          localStorage.setItem('serviq_rest_id', id);
          localStorage.removeItem('serviq_branch_id');
        } catch (e) {}
        if (rest.settings) {
          setAccentColor(rest.settings.accentColor || '#ff7a00');
          setDarkMode(rest.settings.darkMode || false);
        }
        ShowNotifications.showAlertNotification("Login successful", true);
        return { success: true, user };
      }

      // Check User accounts array
      const matchingUser = (rest.users || []).find(u => u.email && u.email.toLowerCase() === cleanEmail);
      if (matchingUser && (password === 'admin123' || password === matchingUser.password || password === '1234' || password === '123456')) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = {
          id: matchingUser.id || 'usr-001',
          name: matchingUser.name,
          email: matchingUser.email,
          role: matchingUser.role,
          userType: matchingUser.role,
          restaurantId: id,
          branchId: matchingUser.branchId || 'ALL'
        };
        const mockToken = 'mock_jwt_token_' + (matchingUser.id || 'user');
        localStorage.setItem("userToken", mockToken);
        localStorage.setItem("token", mockToken);
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        if (user.branchId && user.branchId !== 'ALL') {
          setSelectedBranchId(user.branchId);
          try { localStorage.setItem('serviq_branch_id', user.branchId); } catch (e) {}
        } else {
          setSelectedBranchId(null);
          try { localStorage.removeItem('serviq_branch_id'); } catch (e) {}
        }
        try {
          localStorage.setItem('serviq_user', JSON.stringify(user));
          localStorage.setItem('serviq_rest_id', id);
        } catch (e) {}
        ShowNotifications.showAlertNotification("Login successful", true);
        return { success: true, user };
      }

      // Check Kitchen Login credentials
      if (rest.kitchenLogin && rest.kitchenLogin.email && cleanEmail === rest.kitchenLogin.email.toLowerCase() && (password === rest.kitchenLogin.password || password === 'admin123' || password === '123456')) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = {
          id: 'kitchen-001',
          name: 'Kitchen Station',
          email: cleanEmail,
          role: 'Kitchen',
          userType: 'Kitchen',
          restaurantId: id,
          branchId: 'BR-001'
        };
        const mockToken = 'mock_jwt_token_kitchen';
        localStorage.setItem("userToken", mockToken);
        localStorage.setItem("token", mockToken);
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        setSelectedBranchId('BR-001');
        try {
          localStorage.setItem('serviq_user', JSON.stringify(user));
          localStorage.setItem('serviq_rest_id', id);
        } catch (e) {}
        ShowNotifications.showAlertNotification("Login successful", true);
        return { success: true, user };
      }

      // Check Staff credentials
      const staffMember = (rest.staff || []).find(s => s.email && s.email.toLowerCase() === cleanEmail && (s.password === password || password === '1234' || password === 'admin123' || password === '123456'));
      if (staffMember) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the administration.' };
        }
        const user = {
          id: staffMember.id,
          name: staffMember.name,
          email: staffMember.email,
          role: staffMember.role,
          userType: staffMember.role,
          restaurantId: id,
          branchId: staffMember.branchId || 'BR-001'
        };
        const mockToken = 'mock_jwt_token_staff';
        localStorage.setItem("userToken", mockToken);
        localStorage.setItem("token", mockToken);
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        if (user.branchId) {
          setSelectedBranchId(user.branchId);
          try { localStorage.setItem('serviq_branch_id', user.branchId); } catch (e) {}
        }
        try {
          localStorage.setItem('serviq_user', JSON.stringify(user));
          localStorage.setItem('serviq_rest_id', id);
        } catch (e) {}
        ShowNotifications.showAlertNotification("Login successful", true);
        return { success: true, user };
      }
    }

    return { success: false, error: backendErrorMessage || 'Invalid email or password. Please check your credentials.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRestaurantId(null);
    setSelectedBranchId(null);
    try {
      localStorage.removeItem('serviq_user');
      localStorage.removeItem('serviq_rest_id');
      localStorage.removeItem('userToken');
      localStorage.removeItem('token');
      localStorage.removeItem('serviq_branch_id');
    } catch (e) {}
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
    const newItem = {
      id: itemData.id || `menu-${Date.now()}`,
      _id: itemData._id || `menu-${Date.now()}`,
      name: itemData.name,
      desc: itemData.desc || '',
      price: Number(itemData.price) || 0,
      gst: itemData.gst !== undefined ? Number(itemData.gst) : 5,
      category: itemData.category || 'Starters',
      image: itemData.image || '',
      coverImage: itemData.coverImage || '',
      available: itemData.available !== undefined ? itemData.available : true,
      veg: itemData.veg !== undefined ? itemData.veg : true,
      bestseller: !!itemData.bestseller,
      chefSpecial: !!itemData.chefSpecial,
      prepTime: Number(itemData.prepTime) || 15,
      allowSpecialInstructions: itemData.allowSpecialInstructions !== undefined ? !!itemData.allowSpecialInstructions : true,
      stockQuantity: itemData.stockQuantity !== undefined ? Number(itemData.stockQuantity) : 50,
      minStockThreshold: itemData.minStockThreshold !== undefined ? Number(itemData.minStockThreshold) : 5,
      branchId: itemData.branchId || selectedBranchId || 'BR-001'
    };

    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          menu: [newItem, ...(rest.menu || [])]
        }
      };
    });

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
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          menu: (rest.menu || []).map(m => (m.id === itemId || m._id === itemId) ? { ...m, ...updatedData } : m)
        }
      };
    });

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
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          menu: (rest.menu || []).filter(m => m.id !== itemId && m._id !== itemId)
        }
      };
    });

    try {
      const res = await MenuApi.deleteMenuItem(itemId);
      if (res && res.status) {
        await fetchMenu();
      }
    } catch (e) {
      console.error("Failed to delete menu item", e);
    }
  };

  // Waiter Requests Handlers (Integrated with Table Waiter Assignments)
  const addWaiterRequest = (id, requestData) => {
    const currentRest = (restaurantsData && restaurantsData[id]) || activeRestaurant;
    let assignedWaiterName = requestData.assignedStaff || requestData.assignedWaiterName || '';
    let assignedWaiterId = requestData.assignedWaiterId || '';

    // Auto-lookup assigned waiter from table assignment if not passed
    const targetTableNum = String(requestData.table || '01').replace('Table ', '').replace('T-', '');
    const foundTable = (currentRest?.tables || []).find(t =>
      String(t.id).replace('T-', '') === targetTableNum ||
      String(t.tableNo || t.name || '').includes(targetTableNum)
    );

    if (foundTable && (!assignedWaiterName || assignedWaiterName === 'Unassigned')) {
      if (foundTable.assignedWaiterId) {
        assignedWaiterId = foundTable.assignedWaiterId;
        const matchedStaff = (currentRest?.staff || []).find(s => s.id === foundTable.assignedWaiterId || s._id === foundTable.assignedWaiterId);
        if (matchedStaff) {
          assignedWaiterName = matchedStaff.name || matchedStaff.fullName;
        }
      }
    }

    if (!assignedWaiterName) {
      assignedWaiterName = 'Unassigned';
    }

    const nextReq = {
      id: requestData.id || `WR-${Date.now().toString().slice(-4)}`,
      branchId: requestData.branchId || selectedBranchId || '60a1b2c3d4e5f6a7b8c9d0e1',
      table: targetTableNum,
      requestType: requestData.requestType || 'Call Waiter',
      requestTime: requestData.requestTime || requestData.requestedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      requestedTime: requestData.requestedTime || requestData.requestTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: 'Just now',
      status: requestData.status || 'Pending', // Pending | Accepted | Completed
      assignedWaiterId: assignedWaiterId,
      assignedWaiterName: assignedWaiterName,
      assignedStaff: assignedWaiterName,
      notes: requestData.notes || 'Customer called waiter to table',
      acceptedTime: requestData.acceptedTime || null,
      completedTime: requestData.completedTime || null,
      duration: requestData.duration || null,
      createdAt: new Date().toISOString()
    };

    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const updatedList = [nextReq, ...(rest.waiterRequests || rest.serviceRequests || [])];
      return {
        ...prev,
        [id]: {
          ...rest,
          waiterRequests: updatedList,
          serviceRequests: updatedList
        }
      };
    });

    return nextReq;
  };

  const updateWaiterRequestStatus = (id, requestId, newStatus, assignedStaff) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const currentList = rest.waiterRequests || rest.serviceRequests || [];
      const updatedList = currentList.map(r => {
        if (r.id === requestId || r._id === requestId) {
          const updated = {
            ...r,
            status: newStatus || r.status,
            assignedStaff: assignedStaff !== undefined ? assignedStaff : r.assignedStaff,
            assignedWaiterName: assignedStaff !== undefined ? assignedStaff : (r.assignedWaiterName || r.assignedStaff)
          };
          if (newStatus === 'Accepted' && !r.acceptedTime) {
            updated.acceptedTime = nowStr;
          }
          if (newStatus === 'Completed') {
            updated.completedTime = nowStr;
            updated.duration = r.acceptedTime ? 'Attended in 3 mins' : 'Completed';
          }
          return updated;
        }
        return r;
      });

      return {
        ...prev,
        [id]: {
          ...rest,
          waiterRequests: updatedList,
          serviceRequests: updatedList
        }
      };
    });
  };

  const deleteWaiterRequest = (id, requestId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const updatedList = (rest.waiterRequests || rest.serviceRequests || []).filter(r => r.id !== requestId && r._id !== requestId);
      return {
        ...prev,
        [id]: {
          ...rest,
          waiterRequests: updatedList,
          serviceRequests: updatedList
        }
      };
    });
  };

  // Backwards compatibility aliases for any external components
  const addServiceRequest = addWaiterRequest;
  const updateServiceRequestStatus = updateWaiterRequestStatus;
  const deleteServiceRequest = deleteWaiterRequest;

  // Customer Feedback Handlers
  const addFeedback = (id, feedbackData) => {
    const foodR = Number(feedbackData.foodRating) || 5;
    const servR = Number(feedbackData.serviceRating) || 5;
    const nextFb = {
      id: feedbackData.id || `FB-${Date.now().toString().slice(-4)}`,
      branchId: feedbackData.branchId || selectedBranchId || 'BR-001',
      orderId: feedbackData.orderId || '',
      table: feedbackData.table || '01',
      customerName: feedbackData.customerName || 'Anonymous Guest',
      phone: feedbackData.phone || '',
      foodRating: foodR,
      serviceRating: servR,
      overallRating: Number(feedbackData.overallRating) || parseFloat(((foodR + servR) / 2).toFixed(1)),
      comments: feedbackData.comments || '',
      date: feedbackData.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: feedbackData.status || 'Reviewed',
      createdAt: new Date().toISOString()
    };
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          feedback: [nextFb, ...(rest.feedback || [])]
        }
      };
    });
    return nextFb;
  };

  const deleteFeedback = (id, feedbackId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          feedback: (rest.feedback || []).filter(f => f.id !== feedbackId && f._id !== feedbackId)
        }
      };
    });
  };

  // Reorder Support
  const reorderOrder = (id, orderId, targetTable) => {
    const rest = restaurantsData[id];
    if (!rest) return null;
    const sourceOrder = (rest.orders || []).find(o => o.id === orderId || o._id === orderId || String(o.id) === String(orderId));
    if (!sourceOrder) return null;
    const reorderedOrderData = {
      id: String(Date.now()).slice(-4),
      table: targetTable || sourceOrder.table || '01',
      items: Array.isArray(sourceOrder.items) ? sourceOrder.items.map(it => ({ ...it })) : sourceOrder.items,
      spiceLevel: sourceOrder.spiceLevel || 'Medium Spicy',
      specialInstructions: sourceOrder.specialInstructions || '',
      notes: sourceOrder.notes || '',
      subtotal: sourceOrder.subtotal || 0,
      tax: sourceOrder.tax || 0,
      charge: sourceOrder.charge || 0,
      total: sourceOrder.total || 0,
      status: 'new',
      billingStatus: 'unpaid',
      waiter: 'Unassigned',
      branchId: sourceOrder.branchId || selectedBranchId || 'BR-001'
    };
    return addOrder(id, reorderedOrderData);
  };

  const addDiningTable = async (id, table) => {
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
    } catch (e) {
      console.error(e);
    }
    return true;
  };

  const updateDiningTable = async (id, tableId, updatedFields) => {
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

    const statuses = updatedItems.map(item => item.status || 'new');
    const allServed = statuses.every(s => s === 'done' || s === 'served');
    const allReadyOrServed = statuses.every(s => s === 'ready' || s === 'done' || s === 'served');
    const anyPreparingOrReady = statuses.some(s => s === 'preparing' || s === 'ready');

    let newOrderStatus = order.status;
    if (allServed) {
      newOrderStatus = 'done';
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

    if (newOrderStatus === 'done') {
      payload.billingStatus = 'paid';
    }

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

  const upgradeRestaurantPlan = (id, planName) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const targetPlan = AVAILABLE_PLANS.find(p => p.name.toLowerCase() === planName.toLowerCase()) || {
        id: `plan-${planName.toLowerCase()}`,
        name: planName,
        branchLimit: planName === 'Enterprise' ? 100 : planName === 'Premium' ? 10 : planName === 'Standard' ? 3 : 1,
        monthlyPrice: planName === 'Enterprise' ? 9999 : planName === 'Premium' ? 4999 : planName === 'Standard' ? 1999 : 999,
        annualPrice: planName === 'Enterprise' ? 99990 : planName === 'Premium' ? 49999 : planName === 'Standard' ? 19999 : 9999,
        extraBranchPrice: planName === 'Enterprise' ? 399 : planName === 'Premium' ? 499 : planName === 'Standard' ? 699 : 799
      };

      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);

      const existingInvoices = rest.subscriptionInvoices || [];
      const newInvoice = {
        id: `INV-PLN-${Date.now().toString().slice(-6)}`,
        planName: `${targetPlan.name} Plan`,
        description: `Plan Upgrade to ${targetPlan.name} Plan`,
        branchesIncluded: targetPlan.branchLimit,
        amount: targetPlan.monthlyPrice,
        date: now.toISOString().split('T')[0],
        paymentMethod: "Credit Card (•••• 4242)",
        status: "Paid"
      };

      return {
        ...prev,
        [id]: {
          ...rest,
          plan: targetPlan.name,
          subscription: {
            ...(rest.subscription || {}),
            planId: targetPlan.id,
            planName: targetPlan.name,
            status: 'Active',
            price: targetPlan.monthlyPrice,
            annualPrice: targetPlan.annualPrice,
            baseBranchLimit: targetPlan.branchLimit,
            extraBranchPrice: targetPlan.extraBranchPrice || 699,
            nextBillingDate: nextMonth.toISOString().split('T')[0]
          },
          subscriptionInvoices: [newInvoice, ...existingInvoices]
        }
      };
    });
  };

  const upgradeSubscriptionPlan = (id, planId, billingCycle = 'monthly', paymentMethod = 'Credit Card (•••• 4242)') => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const targetPlan = AVAILABLE_PLANS.find(p => p.id === planId || p.name.toLowerCase() === planId.toLowerCase()) || AVAILABLE_PLANS[1];
      const amount = billingCycle === 'annual' ? targetPlan.annualPrice : targetPlan.monthlyPrice;

      const now = new Date();
      const nextDate = new Date(now);
      if (billingCycle === 'annual') {
        nextDate.setFullYear(now.getFullYear() + 1);
      } else {
        nextDate.setMonth(now.getMonth() + 1);
      }

      const existingInvoices = rest.subscriptionInvoices || [];
      const newInvoice = {
        id: `INV-PLN-${Date.now().toString().slice(-6)}`,
        planName: `${targetPlan.name} (${billingCycle === 'annual' ? 'Annual' : 'Monthly'})`,
        description: `Plan Upgrade to ${targetPlan.name} (${billingCycle})`,
        branchesIncluded: targetPlan.branchLimit,
        amount: amount,
        date: now.toISOString().split('T')[0],
        paymentMethod: paymentMethod,
        status: "Paid"
      };

      return {
        ...prev,
        [id]: {
          ...rest,
          plan: targetPlan.name,
          subscription: {
            ...(rest.subscription || {}),
            planId: targetPlan.id,
            planName: targetPlan.name,
            status: 'Active',
            billingCycle: billingCycle,
            price: targetPlan.monthlyPrice,
            annualPrice: targetPlan.annualPrice,
            baseBranchLimit: targetPlan.branchLimit,
            extraBranchPrice: targetPlan.extraBranchPrice || 699,
            nextBillingDate: nextDate.toISOString().split('T')[0]
          },
          subscriptionInvoices: [newInvoice, ...existingInvoices]
        }
      };
    });
  };

  const purchaseExtraBranchSlots = (id, slotCount = 1, paymentMethod = 'Credit Card (•••• 4242)') => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentSub = rest.subscription || {
        planName: rest.plan || 'Standard',
        baseBranchLimit: 3,
        extraBranchSlots: 0,
        extraBranchPrice: 699
      };

      const unitPrice = currentSub.extraBranchPrice || 699;
      const amount = unitPrice * slotCount;
      const now = new Date();

      const existingInvoices = rest.subscriptionInvoices || [];
      const newInvoice = {
        id: `INV-SLOT-${Date.now().toString().slice(-6)}`,
        planName: `${currentSub.planName || 'Standard'} Add-on`,
        description: `Additional Branch Slot x${slotCount} (Recurring Add-on)`,
        branchesIncluded: slotCount,
        amount: amount,
        date: now.toISOString().split('T')[0],
        paymentMethod: paymentMethod,
        status: "Paid"
      };

      return {
        ...prev,
        [id]: {
          ...rest,
          subscription: {
            ...currentSub,
            extraBranchSlots: (currentSub.extraBranchSlots || 0) + slotCount
          },
          subscriptionInvoices: [newInvoice, ...existingInvoices]
        }
      };
    });
  };

  const toggleSubscriptionAutoRenew = (id) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const currentSub = rest.subscription || {};
      return {
        ...prev,
        [id]: {
          ...rest,
          subscription: {
            ...currentSub,
            autoRenew: !currentSub.autoRenew
          }
        }
      };
    });
  };

  const updateDiningTableSeats = (id, tableId, seats) => {
    updateDiningTable(id, tableId, { seats });
  };

  const deleteDiningTable = async (id, tableId) => {
    const rest = restaurantsData[id];
    if (!rest) return;
    const targetTable = rest.tables?.find(t => t.id === tableId);
    if (!targetTable) return;

    // Update local state optimistically
    setRestaurantsData(prev => {
      const restObj = prev[id];
      if (!restObj) return prev;
      const qrs = restObj.qrCodes || [];
      const updatedQrCodes = qrs.map(q => {
        if (q.tableId === tableId) {
          return { ...q, status: 'Unassigned', tableId: null };
        }
        return q;
      });
      return {
        ...prev,
        [id]: {
          ...restObj,
          tables: restObj.tables.filter(t => t.id !== tableId),
          qrCodes: updatedQrCodes,
          settings: {
            ...restObj.settings,
            tablesCount: Math.max(0, restObj.tables.length - 1)
          }
        }
      };
    });

    try {
      await MemberApi.deleteTable(targetTable._id);
      await fetchTables();
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
          const isDone = nextStatus === 'done' || nextStatus === 'served';
          return {
            ...o,
            status: nextStatus,
            billingStatus: isDone ? 'paid' : (o.billingStatus || 'unpaid')
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
          if (nextStatus === 'done' || nextStatus === 'served') {
            payload.billingStatus = 'paid';
          }
          const idToUpdate = order._id || order.id || order.orderId;
          await OrderApi.updateOrder(idToUpdate, payload).catch(() => {});
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
          await OrderApi.updateOrder(idToUpdate, { waiter: waiterName }).catch(() => {});
        }
      }
    } catch (e) {
      // Ignore background sync errors
    }
  };

  const addOrder = async (id, newOrderData) => {
    // 1. Optimistic Local State Update
    const orderWithDefaults = {
      id: newOrderData.id || String(Date.now()).slice(-4),
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

    // 2. Safe API Sync
    try {
      if (OrderApi && OrderApi.createOrder) {
        await OrderApi.createOrder({
          restaurantId: id,
          ...orderWithDefaults
        }).catch(() => {});
      }
    } catch (e) {
      // Ignore background sync errors
    }

    return orderWithDefaults;
  };

  const deleteOrder = async (id, orderId) => {
    // 1. Optimistic Local State Update
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

    // 2. Safe API Sync
    try {
      const rest = restaurantsData[id];
      if (rest) {
        const order = (rest.orders || []).find(o => o.orderId === orderId || o.id === orderId || o._id === orderId || String(o.id) === String(orderId));
        if (order) {
          const idToDelete = order._id || order.id || order.orderId;
          await OrderApi.deleteOrder(idToDelete).catch(() => {});
        }
      }
    } catch (e) {
      // Ignore background sync errors
    }
  };

  const updateOrder = async (id, orderId, updatedFields) => {
    // 1. Optimistic Local State Update
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

    // 2. Safe API Sync
    try {
      const rest = restaurantsData[id];
      if (rest) {
        const order = (rest.orders || []).find(o => o.orderId === orderId || o.id === orderId || o._id === orderId || String(o.id) === String(orderId));
        if (order) {
          const idToUpdate = order._id || order.id || order.orderId;
          await OrderApi.updateOrder(idToUpdate, updatedFields).catch(() => {});
        }
      }
    } catch (e) {
      // Ignore background sync errors
    }
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
            status: 'done'
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
      await OrderApi.payBill(tableLabel).catch(() => {});
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
    const userRole = (currentUser?.role || '').toLowerCase();
    const userType = (currentUser?.userType || '').toUpperCase();
    return userRole === 'admin' || userRole === 'super admin' || userRole === 'owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';
  };

  const addBranch = (restaurantId, branchData) => {
    if (!checkIsAdmin()) {
      ShowNotifications.showAlertNotification("Unauthorized: Only Admin role can create new branches.", false);
      return;
    }
    setRestaurantsData(prev => {
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentBranches = rest.branches || [];
      const newBranch = {
        id: branchData.id || `BR-${Date.now()}`,
        branchCode: branchData.branchCode || `BR-${Math.floor(100 + Math.random() * 900)}`,
        branchName: branchData.branchName || 'New Branch',
        branchManager: branchData.branchManager || 'Unassigned',
        mobileNumber: branchData.mobileNumber || '',
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
        [restaurantId]: {
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
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentBranches = rest.branches || [];
      const updatedBranches = currentBranches.map(b => {
        if (b.id === branchId) {
          return {
            ...b,
            ...updatedData,
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
        [restaurantId]: {
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
      const rest = prev[restaurantId];
      if (!rest) return prev;
      const currentBranches = rest.branches || [];
      return {
        ...prev,
        [restaurantId]: {
          ...rest,
          branches: currentBranches.filter(b => b.id !== branchId)
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
        deleteInventoryCategory,
        addWaiterRequest,
        updateWaiterRequestStatus,
        deleteWaiterRequest,
        addServiceRequest,
        updateServiceRequestStatus,
        deleteServiceRequest,
        addFeedback,
        deleteFeedback,
        reorderOrder
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => useContext(AppContext);
