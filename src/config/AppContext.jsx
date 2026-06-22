import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRestaurantsData, initialState } from './initialData';
import MemberApi from '../api/Table.js';
import QrCodeApi from '../api/QrCode.js';
import OrderApi from '../api/Order.js';

const AppContext = createContext();

export const DEFAULT_ROLES = {
  Admin: {
    permissions: {
      overview: { view: true, add: true, edit: true, delete: true },
      orders: { view: true, add: true, edit: true, delete: true },
      menu: { view: true, add: true, edit: true, delete: true },
      tables: { view: true, add: true, edit: true, delete: true },
      billing: { view: true, add: true, edit: true, delete: true },
      waiter: { view: true, add: true, edit: true, delete: true },
      kitchen: { view: true, add: true, edit: true, delete: true },
      Reports: { view: true, add: true, edit: true, delete: true },
      users: { view: true, add: true, edit: true, delete: true },
      'roles-permissions': { view: true, add: true, edit: true, delete: true },
      settings: { view: true, add: true, edit: true, delete: true }
    }
  },
  Manager: {
    permissions: {
      overview: { view: true, add: false, edit: false, delete: false },
      orders: { view: true, add: true, edit: true, delete: true },
      menu: { view: true, add: true, edit: true, delete: false },
      tables: { view: true, add: true, edit: true, delete: false },
      billing: { view: true, add: true, edit: true, delete: false },
      waiter: { view: true, add: true, edit: true, delete: false },
      kitchen: { view: true, add: true, edit: true, delete: false },
      Reports: { view: true, add: false, edit: false, delete: false },
      users: { view: true, add: true, edit: true, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      settings: { view: false, add: false, edit: false, delete: false }
    }
  },
  Waiter: {
    permissions: {
      overview: { view: false, add: false, edit: false, delete: false },
      orders: { view: true, add: true, edit: true, delete: false },
      menu: { view: false, add: false, edit: false, delete: false },
      tables: { view: true, add: false, edit: true, delete: false },
      billing: { view: false, add: false, edit: false, delete: false },
      waiter: { view: true, add: false, edit: false, delete: false },
      kitchen: { view: false, add: false, edit: false, delete: false },
      Reports: { view: false, add: false, edit: false, delete: false },
      users: { view: false, add: false, edit: false, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      settings: { view: false, add: false, edit: false, delete: false }
    }
  },
  Kitchen: {
    permissions: {
      overview: { view: false, add: false, edit: false, delete: false },
      orders: { view: true, add: false, edit: true, delete: false },
      menu: { view: false, add: false, edit: false, delete: false },
      tables: { view: false, add: false, edit: false, delete: false },
      billing: { view: false, add: false, edit: false, delete: false },
      waiter: { view: false, add: false, edit: false, delete: false },
      kitchen: { view: true, add: false, edit: true, delete: false },
      Reports: { view: false, add: false, edit: false, delete: false },
      users: { view: false, add: false, edit: false, delete: false },
      'roles-permissions': { view: false, add: false, edit: false, delete: false },
      settings: { view: false, add: false, edit: false, delete: false }
    }
  }
};

export const AppProvider = ({ children }) => {
  // Core database states
  const [restaurantsData, setRestaurantsData] = useState(initialRestaurantsData);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);
  // Active Tenant settings overrides / defaults
  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState('#ff7a00');
  const [qrCustomizer, setQrCustomizer] = useState({ color: '#ff7a00', showLogo: true });



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
    if (!currentRestaurantId) return;
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
    if (!currentRestaurantId) return;
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
    if (!currentRestaurantId) return;
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

  useEffect(() => {
    const initData = async () => {
      await fetchTables();
      await fetchOrders();
      await fetchQrCodes();
    };
    initData();
  }, [currentRestaurantId]);

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
  const login = (email, password, role) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check Admin / staff
    for (let id in restaurantsData) {
      const rest = restaurantsData[id];
      
      // Check Tenant owner/admin
      if (rest.owner.toLowerCase() === cleanEmail && password === 'admin123') {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = { name: rest.name + ' Admin', email: cleanEmail, role: 'Admin' };
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        // Load settings values
        if (rest.settings) {
          setAccentColor(rest.settings.accentColor || '#ff7a00');
          setDarkMode(rest.settings.darkMode || false);
        }
        return { success: true, user };
      }

      // Check Kitchen Login credentials
      if (cleanEmail === rest.kitchenLogin.email.toLowerCase() && password === rest.kitchenLogin.password) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the platform administration.' };
        }
        const user = { name: 'Kitchen Station', email: cleanEmail, role: 'Kitchen' };
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        return { success: true, user };
      }

      // Check Staff credentials
      const staffMember = rest.staff.find(s => s.email.toLowerCase() === cleanEmail && s.password === password);
      if (staffMember) {
        if (rest.status === 'Suspended') {
          return { success: false, error: 'This restaurant account has been suspended by the administration.' };
        }
        const user = { name: staffMember.name, email: staffMember.email, role: staffMember.role };
        setCurrentUser(user);
        setCurrentRestaurantId(id);
        return { success: true, user };
      }
    }

    return { success: false, error: 'Invalid email or password. Please try again.' };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRestaurantId(null);
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

  const addMenuItem = (id, item) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          menu: [...rest.menu, item]
        }
      };
    });
  };

  const updateMenuItem = (id, updatedItem) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          menu: rest.menu.map(item => item.id === updatedItem.id ? updatedItem : item)
        }
      };
    });
  };

  const deleteMenuItem = (id, itemId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          menu: rest.menu.filter(item => item.id !== itemId)
        }
      };
    });
  };

  const addDiningTable = async (id, table) => {
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
    return false;
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
      return {
        ...prev,
        [id]: {
          ...rest,
          plan: planName
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
        orders: { view: false, add: false, edit: false, delete: false },
        menu: { view: false, add: false, edit: false, delete: false },
        tables: { view: false, add: false, edit: false, delete: false },
        billing: { view: false, add: false, edit: false, delete: false },
        waiter: { view: false, add: false, edit: false, delete: false },
        kitchen: { view: false, add: false, edit: false, delete: false },
        reports: { view: false, add: false, edit: false, delete: false },
        users: { view: false, add: false, edit: false, delete: false },
        'roles-permissions': { view: false, add: false, edit: false, delete: false },
        settings: { view: false, add: false, edit: false, delete: false }
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
        updateMenuCategories
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => useContext(AppContext);

