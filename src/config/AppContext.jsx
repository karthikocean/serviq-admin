import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialRestaurantsData, initialState } from './initialData';

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
      reports: { view: true, add: true, edit: true, delete: true },
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
      reports: { view: true, add: false, edit: false, delete: false },
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
      reports: { view: false, add: false, edit: false, delete: false },
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
      reports: { view: false, add: false, edit: false, delete: false },
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

  const addDiningTable = (id, table) => {
    let success = false;
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      
      // Check if table ID already exists
      if (rest.tables.some(t => t.id.toLowerCase() === table.id.toLowerCase())) {
        return prev;
      }
      
      success = true;
      return {
        ...prev,
        [id]: {
          ...rest,
          tables: [...rest.tables, table],
          settings: {
            ...rest.settings,
            tablesCount: rest.tables.length + 1
          }
        }
      };
    });
    return success;
  };

  const updateDiningTable = (id, tableId, updatedFields) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          tables: rest.tables.map(t => t.id === tableId ? { ...t, ...updatedFields } : t)
        }
      };
    });
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

  const updateOrderItemStatus = (id, orderId, itemName, nextStatus) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          orders: rest.orders.map(order => {
            if (order.id === orderId) {
              const updatedItems = order.items.map(item => {
                if (item.name === itemName) {
                  return { ...item, status: nextStatus };
                }
                return item;
              });

              // Determine overall order status based on item statuses
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

              const updatedOrder = {
                ...order,
                items: updatedItems,
                status: newOrderStatus
              };

              if (newOrderStatus === 'done') {
                updatedOrder.billingStatus = 'paid';
              }

              return updatedOrder;
            }
            return order;
          })
        }
      };
    });
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

  const deleteDiningTable = (id, tableId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const qrs = rest.qrCodes || [];
      const updatedQrCodes = qrs.map(q => {
        if (q.tableId === tableId) {
          return { ...q, status: 'Unassigned', tableId: null };
        }
        return q;
      });
      return {
        ...prev,
        [id]: {
          ...rest,
          tables: rest.tables.filter(t => t.id !== tableId),
          qrCodes: updatedQrCodes,
          settings: {
            ...rest.settings,
            tablesCount: Math.max(0, rest.tables.length - 1)
          }
        }
      };
    });
  };

  const generateQrCode = (restId) => {
    setRestaurantsData(prev => {
      const rest = prev[restId];
      if (!rest) return prev;
      const qrs = rest.qrCodes || [];
      let maxNum = 100;
      qrs.forEach(q => {
        const num = parseInt(q.id.replace('QR-', ''));
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const nextId = `QR-${maxNum + 1}`;
      const newQr = {
        id: nextId,
        status: 'Unassigned',
        tableId: null,
        scansCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      return {
        ...prev,
        [restId]: {
          ...rest,
          qrCodes: [...qrs, newQr]
        }
      };
    });
  };

  const assignQrCode = (restId, qrId, tableId) => {
    setRestaurantsData(prev => {
      const rest = prev[restId];
      if (!rest) return prev;
      
      const qrs = rest.qrCodes || [];
      const tables = rest.tables || [];

      const updatedQrCodes = qrs.map(q => {
        if (q.id === qrId) {
          return { ...q, status: tableId ? 'Assigned' : 'Unassigned', tableId: tableId || null };
        }
        if (tableId && q.tableId === tableId) {
          return { ...q, status: 'Unassigned', tableId: null };
        }
        return q;
      });

      const updatedTables = tables.map(t => {
        if (t.id === tableId) {
          return { ...t, assignedQrId: qrId };
        }
        if (t.assignedQrId === qrId) {
          return { ...t, assignedQrId: null };
        }
        return t;
      });

      return {
        ...prev,
        [restId]: {
          ...rest,
          qrCodes: updatedQrCodes,
          tables: updatedTables
        }
      };
    });
  };

  const revokeQrCode = (restId, qrId) => {
    setRestaurantsData(prev => {
      const rest = prev[restId];
      if (!rest) return prev;
      
      const qrs = rest.qrCodes || [];
      const tables = rest.tables || [];

      const updatedQrCodes = qrs.map(q => {
        if (q.id === qrId) {
          return { ...q, status: 'Unassigned', tableId: null };
        }
        return q;
      });

      const updatedTables = tables.map(t => {
        if (t.assignedQrId === qrId) {
          return { ...t, assignedQrId: null };
        }
        return t;
      });

      return {
        ...prev,
        [restId]: {
          ...rest,
          qrCodes: updatedQrCodes,
          tables: updatedTables
        }
      };
    });
  };

  const deleteQrCode = (restId, qrId) => {
    setRestaurantsData(prev => {
      const rest = prev[restId];
      if (!rest) return prev;
      
      const qrs = rest.qrCodes || [];
      const tables = rest.tables || [];

      const updatedQrCodes = qrs.filter(q => q.id !== qrId);
      const updatedTables = tables.map(t => {
        if (t.assignedQrId === qrId) {
          return { ...t, assignedQrId: null };
        }
        return t;
      });

      return {
        ...prev,
        [restId]: {
          ...rest,
          qrCodes: updatedQrCodes,
          tables: updatedTables
        }
      };
    });
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
  const updateOrderStatus = (id, orderId, nextStatus) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      
      const updatedOrders = rest.orders.map(order => {
        if (order.id === orderId) {
          const updated = { ...order, status: nextStatus };
          if (nextStatus === 'done') {
            updated.billingStatus = 'paid';
          }
          return updated;
        }
        return order;
      });

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders
        }
      };
    });
  };

  const assignWaiterToOrder = (id, orderId, waiterName) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      const updatedOrders = rest.orders.map(order => {
        if (order.id === orderId) {
          return { ...order, waiter: waiterName };
        }
        return order;
      });
      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders
        }
      };
    });
  };

  const deleteOrder = (id, orderId) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          orders: rest.orders.filter(order => order.id !== orderId)
        }
      };
    });
  };

  const updateOrder = (id, orderId, updatedFields) => {
    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;
      return {
        ...prev,
        [id]: {
          ...rest,
          orders: rest.orders.map(order => order.id === orderId ? { ...order, ...updatedFields } : order)
        }
      };
    });
  };

  const markBillAsPaid = (id, tableLabel) => {
    const rawNum = tableLabel.replace('Table ', '');
    const cleanTableId = rawNum.length === 1 ? `T-0${rawNum}` : `T-${rawNum}`;

    setRestaurantsData(prev => {
      const rest = prev[id];
      if (!rest) return prev;

      // Update billing status inside orders
      const updatedOrders = rest.orders.map(ord => {
        if (ord.table === rawNum || parseInt(ord.table) === parseInt(rawNum)) {
          return { ...ord, billingStatus: 'paid', status: 'done' };
        }
        return ord;
      });

      // Update billing list status
      const updatedBillingData = rest.billingData.map(b => {
        if (b.table === tableLabel) {
          return { ...b, status: 'Paid' };
        }
        return b;
      });

      // Free dining table status
      const updatedTables = rest.tables.map(t => {
        if (t.id === cleanTableId) {
          return { ...t, status: 'Free' };
        }
        return t;
      });

      return {
        ...prev,
        [id]: {
          ...rest,
          orders: updatedOrders,
          billingData: updatedBillingData,
          tables: updatedTables
        }
      };
    });
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

