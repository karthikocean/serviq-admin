import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRestaurantsData, initialState, AVAILABLE_PLANS } from './initialData';
import AuthApi from '../api/Auth.js';
import MemberApi from '../api/Table.js';
import QrCodeApi from '../api/QrCode.js';
import OrderApi from '../api/Order.js';
import MenuApi from '../api/Menu.js';
import ShowNotifications from '../helper/ShowNotifications.js';

const AppContext = createContext();

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
      waiter: { view: false, add: false, edit: false, delete: false },
      kitchen: { view: true, add: false, edit: true, delete: false },
      Reports: { view: false, add: false, edit: false, delete: false },
      users: { view: false, add: false, edit: false, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      Settings: { view: false, add: false, edit: false, delete: false }
    }
  }
};

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
  const [selectedBranchId, setSelectedBranchId] = useState(null);



  // Active computed tenant info
  const activeRestaurant = currentRestaurantId ? restaurantsData[currentRestaurantId] : null;

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

  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('token');
    if (!token || !currentUser || !currentRestaurantId) return;

    const initData = async () => {
      await fetchTables();
      await fetchOrders();
      await fetchQrCodes();
      await fetchMenu();
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

    // 2. Mock/Offline Fallback for Restaurant Owner (e.g. arjun.kumar@royalspice.test)
    if (cleanEmail === 'arjun.kumar@royalspice.test' && (password === 'admin123' || password === 'admin' || password === '123456' || password === 'password123')) {
      const user = {
        id: '6a7ef447d15d03c37e50ea65',
        name: 'Arjun Kumar',
        email: 'arjun.kumar@royalspice.test',
        phoneNumber: '9876543211',
        userType: 'RESTAURANT_OWNER',
        role: 'RESTAURANT_OWNER',
        restaurantId: 'rest-1',
        activeBranchId: 'BR-001',
        branchId: 'ALL'
      };
      setCurrentUser(user);
      setCurrentRestaurantId('rest-1');
      setSelectedBranchId(null);
      try {
        localStorage.setItem('serviq_user', JSON.stringify(user));
        localStorage.setItem('serviq_rest_id', 'rest-1');
        localStorage.removeItem('serviq_branch_id');
      } catch (e) {}
      ShowNotifications.showAlertNotification("Login successful as Restaurant Owner (Offline Mode)", true);
      return { success: true, user };
    }

    // 3. Check Admin / users / staff in local restaurant dataset
    for (let id in restaurantsData) {
      const rest = restaurantsData[id];
      
      // Check Tenant owner/admin
      if (rest.owner.toLowerCase() === cleanEmail && (password === 'admin123' || password === 'admin' || password === '123456')) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = { name: rest.name + ' Admin', email: cleanEmail, role: 'RESTAURANT_OWNER', userType: 'RESTAURANT_OWNER', branchId: 'ALL' };
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
        return { success: true, user };
      }

      // Check User accounts array
      const matchingUser = (rest.users || []).find(u => u.email.toLowerCase() === cleanEmail);
      if (matchingUser && (password === 'admin123' || password === matchingUser.password || password === '1234' || password === '123456')) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = {
          name: matchingUser.name,
          email: matchingUser.email,
          role: matchingUser.role,
          userType: matchingUser.role,
          branchId: matchingUser.branchId || 'ALL'
        };
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
        return { success: true, user };
      }

      // Check Kitchen Login credentials
      if (rest.kitchenLogin && cleanEmail === rest.kitchenLogin.email.toLowerCase() && (password === rest.kitchenLogin.password || password === '123456')) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = { name: 'Kitchen Station', email: cleanEmail, role: 'Kitchen', userType: 'Kitchen', branchId: 'BR-001' };
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        setSelectedBranchId('BR-001');
        try {
          localStorage.setItem('serviq_user', JSON.stringify(user));
          localStorage.setItem('serviq_rest_id', id);
        } catch (e) {}
        return { success: true, user };
      }

      // Check Staff credentials
      const staffMember = (rest.staff || []).find(s => s.email.toLowerCase() === cleanEmail && (s.password === password || password === '1234' || password === 'admin123' || password === '123456'));
      if (staffMember) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the administration.' };
        }
        const user = { name: staffMember.name, email: staffMember.email, role: staffMember.role, userType: staffMember.role, branchId: staffMember.branchId || 'BR-001' };
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
    try {
      const rest = restaurantsData[id];
      if (!rest) return;
      const order = rest.orders.find(o => o.orderId === orderId || o.id === orderId || o._id === orderId);
      if (!order) return;
      
      const payload = { status: nextStatus };
      if (nextStatus === 'done') {
        payload.billingStatus = 'paid';
      }
      
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

  const assignWaiterToOrder = async (id, orderId, waiterName) => {
    try {
      const rest = restaurantsData[id];
      if (!rest) return;
      const order = rest.orders.find(o => o.orderId === orderId || o.id === orderId || o._id === orderId);
      if (!order) return;

      const idToUpdate = order._id || order.id || order.orderId;
      const res = await OrderApi.updateOrder(idToUpdate, { waiter: waiterName });
      if (res && res.status) {
        await fetchOrders();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteOrder = async (id, orderId) => {
    try {
      const rest = restaurantsData[id];
      if (!rest) return;
      const order = rest.orders.find(o => o.orderId === orderId || o.id === orderId || o._id === orderId);
      if (!order) return;

      const idToDelete = order._id || order.id || order.orderId;
      const res = await OrderApi.deleteOrder(idToDelete);
      if (res && res.status) {
        await fetchOrders();
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateOrder = async (id, orderId, updatedFields) => {
    try {
      const rest = restaurantsData[id];
      if (!rest) return;
      const order = rest.orders.find(o => o.orderId === orderId || o.id === orderId || o._id === orderId);
      if (!order) return;

      const idToUpdate = order._id || order.id || order.orderId;
      const res = await OrderApi.updateOrder(idToUpdate, updatedFields);
      if (res && res.status) {
        await fetchOrders();
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markBillAsPaid = async (id, tableLabel) => {
    try {
      const res = await OrderApi.payBill(tableLabel);
      if (res && res.status) {
        await fetchOrders();
        await fetchTables();
      }
    } catch (e) {
      console.error(e);
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

  const addBranch = (restaurantId, branchData) => {
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
        selectedBranchId,
        setSelectedBranchId
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => useContext(AppContext);

