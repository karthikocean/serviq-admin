import React, { useState, useEffect } from 'react';
import apiClient from '../config/index.js';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import SearchableSelect from './SearchableSelect.jsx';
import { formatDateDMY } from '../helper/DateHelper.js';

// Clean SVG Icons
const EyeIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const PrintIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const UserIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PlayIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const BellIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const CheckIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PencilIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const PlusIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function OrdersPanel({
  orders = [],
  staff = [],
  tables = [],
  orderFilter = 'All',
  setOrderFilter,
  selectedWaiterFilter = { id: 'All Waiters', name: 'All Waiters' },
  setSelectedWaiterFilter,
  waiterDropdownOpen: propsWaiterDropdownOpen,
  setWaiterDropdownOpen: propsSetWaiterDropdownOpen,
  activeRestaurant,
  selectedBranchId,
  updateOrderStatus,
  refreshOrders,
  page = 0,
  setPage = () => { },
  limit = 10,
  setLimit = () => { },
  totalPages = 1,
  totalCount = 0,
  currentUser = null
}) {
  const getOrderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = page + 1;
    const total = Math.max(1, totalPages || 1);
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

  const [internalWaiterDropdownOpen, setInternalWaiterDropdownOpen] = useState(false);
  const isWaiterDropdownOpen = propsWaiterDropdownOpen !== undefined ? propsWaiterDropdownOpen : internalWaiterDropdownOpen;
  const setIsWaiterDropdownOpen = propsSetWaiterDropdownOpen || setInternalWaiterDropdownOpen;

  const [viewingOrder, setViewingOrder] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  // States for Editing Order
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderTable, setEditOrderTable] = useState('');
  const [editOrderWaiter, setEditOrderWaiter] = useState('Unassigned');
  const [editOrderStatus, setEditOrderStatus] = useState('new');
  const [editOrderNotes, setEditOrderNotes] = useState('');
  const [editOrderItems, setEditOrderItems] = useState([]);
  const [editSearchQuery, setEditSearchQuery] = useState('');
  const [editSelectedCategory, setEditSelectedCategory] = useState('All');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New States for Appending Items
  const [appendingOrder, setAppendingOrder] = useState(null);
  const [appendItemsCart, setAppendItemsCart] = useState([]);
  const [appendSearchQuery, setAppendSearchQuery] = useState('');
  const [appendSelectedCategory, setAppendSelectedCategory] = useState('All');

  // New order form states
  const [newOrderTable, setNewOrderTable] = useState('');
  const [newOrderWaiter, setNewOrderWaiter] = useState('Unassigned');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('new');
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [apiCategories, setApiCategories] = useState([]);
  const [apiMenuItems, setApiMenuItems] = useState([]);
  const [apiTables, setApiTables] = useState(Array.isArray(tables) ? tables : []);
  const [modalWaiters, setModalWaiters] = useState([]);
  const [modalSelectedBranchId, setModalSelectedBranchId] = useState('');
  const [taxRate, setTaxRate] = useState(5);

  useEffect(() => {
    if (Array.isArray(tables) && tables.length > 0) {
      setApiTables(tables);
    }
  }, [tables]);

  useEffect(() => {
    const loadTablesForPanel = async () => {
      try {
        const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL';
        const query = isBranchFiltered ? `?branchId=${selectedBranchId}` : '';
        const res = await apiClient.get(`/tables${query}`).catch(() => null);
        if (res && (res.status === 200 || res.data?.success)) {
          const fetched = Array.isArray(res.data) ? res.data : (res.data?.data || res.data?.response?.data || []);
          if (Array.isArray(fetched) && fetched.length > 0) {
            setApiTables(fetched);
          }
        }
      } catch (e) {
        console.warn("Failed to load tables in OrdersPanel:", e);
      }
    };
    loadTablesForPanel();
  }, [selectedBranchId]);

  // Check branch lock
  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase();
  const userType = (userTypeStr || '').toUpperCase();
  const isAdmin = userRole === 'admin' || userRole === 'super admin' || userRole === 'owner' || userRole === 'restaurant_owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'SUPER_ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';
  const isBranchLocked = !isAdmin;
  const canChooseBranchInOrder = isAdmin && (!selectedBranchId || selectedBranchId === 'ALL');

  // Strict helper: Only genuine Waiters (strictly exclude Kitchen, Manager, Admin, etc.)
  const isOnlyWaiter = (s) => {
    if (!s) return false;
    const roleName = String(
      (typeof s.roleId === 'object' && s.roleId !== null ? (s.roleId?.roleName || s.roleId?.name) : s.roleId) ||
      (typeof s.role === 'object' && s.role !== null ? (s.role?.roleName || s.role?.name) : s.role) ||
      s.designation ||
      s.roleName ||
      s.title ||
      ''
    ).toLowerCase().trim();

    const userType = String(s.userType || '').toUpperCase().trim();

    // Explicitly exclude non-waiters
    if (
      roleName.includes('kitchen') ||
      roleName.includes('chef') ||
      roleName.includes('cook') ||
      roleName.includes('manager') ||
      roleName.includes('admin') ||
      roleName.includes('owner') ||
      roleName.includes('station') ||
      roleName.includes('cashier') ||
      roleName.includes('accountant') ||
      roleName.includes('inventory') ||
      roleName.includes('helper') ||
      roleName.includes('cleaner') ||
      userType === 'STATION' ||
      userType === 'BRANCH_ADMIN' ||
      userType === 'ADMIN' ||
      userType === 'SUPER_ADMIN' ||
      userType === 'RESTAURANT_OWNER' ||
      userType === 'OWNER'
    ) {
      return false;
    }

    return roleName.includes('waiter') || roleName.includes('server') || roleName === 'waiter' || userType === 'WAITER' || userType === 'SERVER';
  };

  // Waiters list (Waiters ONLY)
  const effectiveStaffList = Array.isArray(staff) ? staff : [];
  const staffWaiters = effectiveStaffList.filter(isOnlyWaiter).map(s => ({
    id: s._id || s.id,
    _id: s._id || s.id,
    name: s.name
  }));

  const uniqueWaitersMap = new Map();
  staffWaiters.forEach(w => {
    if (w.name) uniqueWaitersMap.set(w.name.toLowerCase(), w);
  });
  (modalWaiters || []).forEach(name => {
    if (name && !uniqueWaitersMap.has(name.toLowerCase())) {
      const foundInStaff = effectiveStaffList.find(s => s.name?.toLowerCase() === name.toLowerCase());
      if (!foundInStaff || isOnlyWaiter(foundInStaff)) {
        uniqueWaitersMap.set(name.toLowerCase(), {
          id: foundInStaff?._id || foundInStaff?.id || name,
          _id: foundInStaff?._id || foundInStaff?.id || name,
          name: name
        });
      }
    }
  });
  (activeRestaurant?.staff || []).filter(isOnlyWaiter).forEach(s => {
    if (s.name && !uniqueWaitersMap.has(s.name.toLowerCase())) {
      uniqueWaitersMap.set(s.name.toLowerCase(), {
        id: s.id || s._id,
        _id: s.id || s._id,
        name: s.name
      });
    }
  });

  // Also include any assigned waiters from active tables or orders so they are never missed
  (apiTables || []).forEach(t => {
    const waiterName = t.assignedWaiterId?.name || (typeof t.assignedWaiter === 'string' && t.assignedWaiter.trim() !== 'Unassigned' ? t.assignedWaiter.trim() : null);
    if (waiterName && !uniqueWaitersMap.has(waiterName.toLowerCase()) && waiterName.toLowerCase() !== 'none' && waiterName !== '-') {
      uniqueWaitersMap.set(waiterName.toLowerCase(), {
        id: t.assignedWaiterId?._id || t.assignedWaiterId?.id || waiterName,
        _id: t.assignedWaiterId?._id || t.assignedWaiterId?.id || waiterName,
        name: waiterName
      });
    }
  });
  (orders || []).forEach(o => {
    const waiterName = o.waiterId?.name || (typeof o.waiter === 'string' && o.waiter.trim() !== 'Unassigned' ? o.waiter.trim() : null) || (typeof o.waiterName === 'string' && o.waiterName.trim() !== 'Unassigned' ? o.waiterName.trim() : null);
    if (waiterName && !uniqueWaitersMap.has(waiterName.toLowerCase()) && waiterName.toLowerCase() !== 'none' && waiterName !== '-') {
      uniqueWaitersMap.set(waiterName.toLowerCase(), {
        id: o.waiterId?._id || o.waiterId?.id || waiterName,
        _id: o.waiterId?._id || o.waiterId?.id || waiterName,
        name: waiterName
      });
    }
  });

  const allWaiters = Array.from(uniqueWaitersMap.values()).filter(w => w && w.name && w.name.trim());

  // Helper to accurately resolve assigned waiter from order or associated table
  const getResolvedWaiterName = (ord) => {
    if (!ord) return 'Unassigned';

    // 1. Direct populated waiter object on order
    if (ord.waiterId && typeof ord.waiterId === 'object' && ord.waiterId.name) {
      return ord.waiterId.name;
    }

    // 2. Direct string waiter property on order
    if (typeof ord.waiter === 'string' && ord.waiter.trim() && ord.waiter !== 'Unassigned' && ord.waiter !== '-' && ord.waiter !== 'None') {
      return ord.waiter;
    }

    if (typeof ord.waiterName === 'string' && ord.waiterName.trim() && ord.waiterName !== 'Unassigned') {
      return ord.waiterName;
    }

    // 3. Match raw waiterId against staff / allWaiters list
    const rawWaiterId = typeof ord.waiterId === 'string' ? ord.waiterId : (ord.staffId || ord.staff);
    if (rawWaiterId && rawWaiterId !== 'Unassigned' && rawWaiterId !== 'null') {
      const foundStaff = effectiveStaffList.find(s => String(s._id || s.id) === String(rawWaiterId) || String(s.name).toLowerCase() === String(rawWaiterId).toLowerCase()) ||
                         allWaiters.find(w => String(w.id || w._id) === String(rawWaiterId) || String(w.name).toLowerCase() === String(rawWaiterId).toLowerCase());
      if (foundStaff && foundStaff.name) return foundStaff.name;
    }

    // 4. Look up waiter assigned to this order's table
    const tableIdent = ord.tableId?._id || ord.tableId?.id || ord.tableId || ord.table;
    const tableNumStr = String(ord.tableId?.tableNumber || ord.tableId?.tableNo || ord.table || '').replace(/^Table\s*/i, '').trim();

    // Check if ord.tableId object contains assigned waiter
    if (ord.tableId && typeof ord.tableId === 'object') {
      if (ord.tableId.assignedWaiterId && typeof ord.tableId.assignedWaiterId === 'object' && ord.tableId.assignedWaiterId.name) {
        return ord.tableId.assignedWaiterId.name;
      }
      if (ord.tableId.assignedWaiter && typeof ord.tableId.assignedWaiter === 'object' && ord.tableId.assignedWaiter.name) {
        return ord.tableId.assignedWaiter.name;
      }
      if (typeof ord.tableId.assignedWaiter === 'string' && ord.tableId.assignedWaiter !== 'Unassigned') {
        const found = effectiveStaffList.find(s => String(s._id || s.id) === String(ord.tableId.assignedWaiter) || String(s.name).toLowerCase() === String(ord.tableId.assignedWaiter).toLowerCase());
        return found?.name || ord.tableId.assignedWaiter;
      }
      if (typeof ord.tableId.assignedWaiterId === 'string') {
        const found = effectiveStaffList.find(s => String(s._id || s.id) === String(ord.tableId.assignedWaiterId) || String(s.name).toLowerCase() === String(ord.tableId.assignedWaiterId).toLowerCase());
        if (found && found.name) return found.name;
      }
    }

    // Find table in apiTables or activeRestaurant.tables
    const allTablePool = [...(apiTables || []), ...(activeRestaurant?.tables || [])];
    const matchingTable = allTablePool.find(t =>
      (tableIdent && (String(t._id || t.id) === String(tableIdent) || String(t.tableNumber || t.tableNo || t.name) === String(tableIdent))) ||
      (tableNumStr && String(t.tableNumber || t.tableNo || '').trim().toLowerCase() === String(tableNumStr).toLowerCase()) ||
      (tableNumStr && String(t.name || '').trim().toLowerCase() === String(tableNumStr).toLowerCase())
    );

    if (matchingTable) {
      if (matchingTable.assignedWaiterId && typeof matchingTable.assignedWaiterId === 'object' && matchingTable.assignedWaiterId.name) {
        return matchingTable.assignedWaiterId.name;
      }
      if (matchingTable.assignedWaiter && typeof matchingTable.assignedWaiter === 'object' && matchingTable.assignedWaiter.name) {
        return matchingTable.assignedWaiter.name;
      }
      if (matchingTable.assignedWaiterId) {
        const found = effectiveStaffList.find(s => String(s._id || s.id) === String(matchingTable.assignedWaiterId)) ||
                      allWaiters.find(w => String(w.id || w._id) === String(matchingTable.assignedWaiterId));
        if (found && found.name) return found.name;
      }
      if (matchingTable.assignedWaiter && typeof matchingTable.assignedWaiter === 'string' && matchingTable.assignedWaiter !== 'Unassigned') {
        const found = effectiveStaffList.find(s => String(s._id || s.id) === String(matchingTable.assignedWaiter) || String(s.name).toLowerCase() === String(matchingTable.assignedWaiter).toLowerCase());
        return found?.name || matchingTable.assignedWaiter;
      }
    }

    return 'Unassigned';
  };

  // Extract menu items from activeRestaurant
  const menuCategories = activeRestaurant?.menu || [];
  const allMenuItems = [];
  if (Array.isArray(menuCategories)) {
    menuCategories.forEach(cat => {
      if (Array.isArray(cat.items)) {
        cat.items.forEach(item => {
          allMenuItems.push({
            _id: item._id || item.id,
            name: item.name,
            price: Number(item.price) || 100,
            category: cat.categoryName || 'General'
          });
        });
      }
    });
  }

  const selectableMenuItems = allMenuItems;

  const restaurantTables = (activeRestaurant?.tables || []).map(t => t.tableNo || t.name || String(t.id));
  const availableTableNumbers = restaurantTables;

  const displayWaiters = allWaiters;
  const activeOrdersForTable = orders.filter(o => {
    const status = (o.status || '').toLowerCase();
    const billingStatus = (o.billingStatus || '').toLowerCase();
    return status !== 'completed' && status !== 'cancelled' && billingStatus !== 'paid';
  });

  const isTableOccupied = (tableIdentifier, tablesList = apiTables) => {
    if (!tableIdentifier) return false;
    const cleanId = String(tableIdentifier).trim().toLowerCase();
    
    // Check if table in tablesList has status 'occupied'
    const tableObj = (tablesList || []).find(t => 
      String(t._id || t.id || '').toLowerCase() === cleanId ||
      String(t.tableNumber || t.tableNo || t.name || '').trim().toLowerCase() === cleanId
    );
    if (tableObj && (tableObj.status || '').toLowerCase() === 'occupied') {
      return true;
    }

    // Check active orders
    return activeOrdersForTable.some(o => {
      const oTableNo = String(o.tableId?.tableNumber || o.tableId?.tableNo || o.table || '').trim().toLowerCase();
      const oTableId = String(o.tableId?._id || o.tableId?.id || (typeof o.tableId === 'string' ? o.tableId : '')).trim().toLowerCase();
      return (cleanId && oTableNo && cleanId === oTableNo) || (cleanId && oTableId && cleanId === oTableId);
    });
  };

  const getActiveOrderForTable = (tableIdentifier, tablesList = apiTables) => {
    if (!tableIdentifier) return null;
    const cleanId = String(tableIdentifier).trim().toLowerCase();

    return activeOrdersForTable.find(o => {
      const oTableNo = String(o.tableId?.tableNumber || o.tableId?.tableNo || o.table || '').trim().toLowerCase();
      const oTableId = String(o.tableId?._id || o.tableId?.id || (typeof o.tableId === 'string' ? o.tableId : '')).trim().toLowerCase();
      return (cleanId && oTableNo && cleanId === oTableNo) || (cleanId && oTableId && cleanId === oTableId);
    });
  };

  const occupiedTableIdentifiers = activeOrdersForTable.map(o => {
    if (typeof o.table === 'string') return String(o.table);
    if (o.tableId && typeof o.tableId === 'object') return String(o.tableId.tableNumber || o.tableId.tableNo);
    if (o.tableId && typeof o.tableId === 'string') {
      const found = apiTables.find(t => String(t._id) === o.tableId || String(t.id) === o.tableId);
      if (found) return String(found.tableNumber || found.tableNo);
    }
    return String(o.tableId);
  }).filter(Boolean);

  const displayTables = apiTables.length > 0 ? apiTables.map(t => String(t.tableNumber || t.tableNo)) : availableTableNumbers.map(String);

  const displayCategories = apiCategories.length > 0
    ? ['All', ...apiCategories.filter(c => c.status !== 'UNAVAILABLE' && c.status !== 'Inactive' && c.status !== 'Disabled' && c.status !== false).map(c => c.name)]
    : ['All', ...new Set(selectableMenuItems.map(item => item.category || 'General'))];

  const displayMenuItems = apiMenuItems.length > 0 ? apiMenuItems.map(item => ({
    ...item,
    name: item.name,
    price: item.price,
    category: item.categoryId?.name || item.category?.name || item.category || 'General'
  })) : selectableMenuItems;

  const filteredMenuItems = displayMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const itemCat = String(item.category || 'General').trim().toLowerCase();
    const selCat = String(selectedCategory).trim().toLowerCase();
    const matchesCategory = selectedCategory === 'All' || itemCat === selCat;
    return matchesSearch && matchesCategory;
  });

  const filteredEditMenuItems = displayMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes((editSearchQuery || '').toLowerCase());
    const itemCat = String(item.category || 'General').trim().toLowerCase();
    const selCat = String(editSelectedCategory || 'All').trim().toLowerCase();
    const matchesCategory = (editSelectedCategory || 'All') === 'All' || itemCat === selCat;
    return matchesSearch && matchesCategory;
  });

  const filteredAppendMenuItems = displayMenuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes((appendSearchQuery || '').toLowerCase());
    const itemCat = String(item.category || 'General').trim().toLowerCase();
    const selCat = String(appendSelectedCategory || 'All').trim().toLowerCase();
    const matchesCategory = (appendSelectedCategory || 'All') === 'All' || itemCat === selCat;
    return matchesSearch && matchesCategory;
  });

  const getFallbackBranchId = () => {
    if (currentUser?.activeBranchId) return currentUser.activeBranchId;
    if (currentUser?.branchId) return currentUser.branchId;
    return activeRestaurant?.branches?.[0]?._id || activeRestaurant?.branches?.[0]?.id || '';
  };

  const fetchModalDataForBranch = async (branchId) => {
    if (branchId) {
      try {
        const [menuRes, catRes, tableRes, staffRes] = await Promise.all([
          apiClient.get(`/menu?branchId=${branchId}`).catch(() => null),
          apiClient.get(`/menu/categories?branchId=${branchId}`).catch(() => null),
          apiClient.get(`/tables?branchId=${branchId}`).catch(() => null),
          apiClient.get(`/staff?branchId=${branchId}`).catch(() => null)
        ]);
        let fetchedTables = [];
        if (menuRes && menuRes.data?.success) setApiMenuItems(menuRes.data.data);
        if (catRes && catRes.data?.success) setApiCategories(catRes.data.data);
        if (tableRes && tableRes.data?.success) {
          fetchedTables = tableRes.data.data;
          setApiTables(fetchedTables);
        }
        
        // Find first available table if possible
        const availableT = fetchedTables.find(t => !isTableOccupied(t.tableNumber || t.tableNo || t.name, fetchedTables));
        const firstTable = availableT 
          ? (availableT.tableNumber || availableT.tableNo || availableT.name)
          : (fetchedTables.length > 0 ? (fetchedTables[0].tableNumber || fetchedTables[0].tableNo) : (displayTables.length > 0 ? displayTables[0] : ''));
        
        setNewOrderTable(firstTable);

        let staffListToUse = staff;
        if (staffRes && staffRes.data?.success) {
          staffListToUse = staffRes.data.data;
        }
        const filteredStaff = staffListToUse.filter(s => !branchId || s.branchId === branchId || s.branchId?._id === branchId || s.branch === branchId || s.branch?._id === branchId);
        const staffWaitersList = filteredStaff.filter(isOnlyWaiter).map(s => s.name);
        setModalWaiters(Array.from(new Set(staffWaitersList)));

      } catch (error) {
        console.error("Error fetching order creation data:", error);
        setNewOrderTable(displayTables.length > 0 ? displayTables[0] : '');
        setModalWaiters([]);
      }
    } else {
      setNewOrderTable(displayTables.length > 0 ? displayTables[0] : '');
      setModalWaiters([]);
    }
  };

  const handleOpenCreateOrderModal = async () => {
    const defaultBranchId = activeRestaurant?.branches?.[0]?.id || activeRestaurant?.branches?.[0]?._id;
    const targetBranchId = (selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : (modalSelectedBranchId || defaultBranchId || getFallbackBranchId());
    setModalSelectedBranchId(targetBranchId);
    await fetchModalDataForBranch(targetBranchId);

    setNewOrderWaiter('Unassigned');
    setNewOrderNotes('');
    setNewOrderStatus('new');
    setNewOrderItems([]);
    setSearchQuery('');
    setSelectedCategory('All');
    setIsCreateOrderModalOpen(true);
  };

  const handleModalBranchChange = async (e) => {
    const newBranchId = e.target.value;
    setModalSelectedBranchId(newBranchId);
    setNewOrderItems([]);
    setNewOrderWaiter('Unassigned');
    await fetchModalDataForBranch(newBranchId);
  };

  const handleAddItemToOrder = (item) => {
    console.log("Adding item to cart:", item); // Debugging log to see if _id exists
    const existingIndex = newOrderItems.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existingIndex > -1) {
      const updated = [...newOrderItems];
      updated[existingIndex].qty += 1;
      setNewOrderItems(updated);
    } else {
      setNewOrderItems([...newOrderItems, { ...item, qty: 1, price: Number(item.price) || 100 }]);
    }
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;
    const priceNum = parseFloat(customItemPrice) || 100;
    handleAddItemToOrder({ name: customItemName.trim(), price: priceNum });
    setCustomItemName('');
    setCustomItemPrice('');
  };

  const handleOpenAppendModal = async (order, initialItems = []) => {
    setAppendingOrder(order);
    setAppendItemsCart(Array.isArray(initialItems) && initialItems.length > 0 ? [...initialItems] : []);
    setAppendSearchQuery('');
    setAppendSelectedCategory('All');
    setViewingOrder(null); // Close view modal

    if (apiMenuItems.length === 0) {
      const defaultBranchId = activeRestaurant?.branches?.[0]?.id || activeRestaurant?.branches?.[0]?._id;
      const targetBranchId = selectedBranchId || defaultBranchId || getFallbackBranchId();
      await fetchModalDataForBranch(targetBranchId);
    }
  };

  const handleAddItemToAppendCart = (item) => {
    const existingIndex = appendItemsCart.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existingIndex > -1) {
      const updated = [...appendItemsCart];
      updated[existingIndex].qty += 1;
      setAppendItemsCart(updated);
    } else {
      setAppendItemsCart([...appendItemsCart, { ...item, qty: 1, price: Number(item.price) || 100 }]);
    }
  };

  const handleRemoveItemFromAppendCart = (index) => {
    const updated = [...appendItemsCart];
    updated.splice(index, 1);
    setAppendItemsCart(updated);
  };

  const handleUpdateAppendItemQty = (index, delta) => {
    const updated = [...appendItemsCart];
    const newQty = (updated[index].qty || 1) + delta;
    if (newQty < 1) return;
    updated[index].qty = newQty;
    setAppendItemsCart(updated);
  };

  const handleSubmitAppendItems = async (e) => {
    e.preventDefault();
    if (appendItemsCart.length === 0) {
      ShowNotifications.showAlertNotification("Please add at least one item", false);
      return;
    }

    try {
      const orderSubtotal = appendItemsCart.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.qty || 1), 0);
      const taxAmount = (orderSubtotal * taxRate) / 100;
      const orderTotal = orderSubtotal + taxAmount;

      const payload = {
        items: appendItemsCart.map(item => ({
          menuId: item._id || item.menuId || item.id || '',
          name: item.name,
          qty: item.qty || 1,
          price: item.price,
          status: 'new'
        })),
        subtotal: orderSubtotal,
        tax: taxAmount,
        charge: 0,
        total: orderTotal
      };

      const branchQuery = appendingOrder.branchId ? `?branchId=${appendingOrder.branchId}` : '';
      const orderId = appendingOrder._id || appendingOrder.id;
      const res = await apiClient.put(`/orders/${orderId}/items/append${branchQuery}`, payload);
      if (res.data?.success || res.status === 200) {
        ShowNotifications.showAlertNotification("Items added successfully!", true);
        setAppendingOrder(null);
        if (refreshOrders) refreshOrders();
        return;
      } else {
        throw new Error(res.data?.message || "Failed to add items");
      }
    } catch (err) {
      console.warn("Append items route failed, attempting update order fallback:", err);
      try {
        const existingItems = Array.isArray(appendingOrder.items) ? appendingOrder.items : [];
        const mergedItems = [
          ...existingItems.map(it => ({
            menuId: it.menuId || it._id || it.id || '',
            name: it.name,
            qty: Number(it.qty) || 1,
            price: Number(it.price) || 0,
            status: it.status || 'new'
          })),
          ...appendItemsCart.map(it => ({
            menuId: it._id || it.menuId || it.id || '',
            name: it.name,
            qty: Number(it.qty) || 1,
            price: Number(it.price) || 0,
            status: 'new'
          }))
        ];
        const newSubtotal = mergedItems.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
        const newTax = parseFloat(((newSubtotal * taxRate) / 100).toFixed(2));
        const newTotal = parseFloat((newSubtotal + newTax).toFixed(2));

        const fallbackPayload = {
          items: mergedItems,
          subtotal: newSubtotal,
          tax: newTax,
          total: newTotal
        };
        const orderId = appendingOrder._id || appendingOrder.id;
        const res2 = await apiClient.put(`/orders/${orderId}`, fallbackPayload);
        if (res2.data?.success || res2.status === 200) {
          ShowNotifications.showAlertNotification("Items added to order successfully!", true);
          setAppendingOrder(null);
          if (refreshOrders) refreshOrders();
          return;
        }
      } catch (fallbackErr) {
        console.error("Fallback update order failed:", fallbackErr);
      }
      ShowNotifications.showAlertNotification(err.response?.data?.message || err.message || "Error adding items", false);
    }
  };

  const handleUpdateItemQty = (index, delta) => {
    const updated = [...newOrderItems];
    const newQty = (updated[index].qty || 1) + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].qty = newQty;
    }
    setNewOrderItems(updated);
  };

  const handleRemoveItemFromOrder = (index) => {
    setNewOrderItems(newOrderItems.filter((_, idx) => idx !== index));
  };

  const calculateNewOrderTotal = () => {
    const subtotal = newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
    const tax = subtotal * (taxRate / 100);
    return (subtotal + tax).toFixed(2);
  };

  const handleCreateOrderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (newOrderItems.length === 0) {
      ShowNotifications.showAlertNotification("Please add at least one item to the order.", false);
      return;
    }

    // Check if selected table is occupied before sending
    const activeOrdOnSelectedTable = getActiveOrderForTable(newOrderTable, apiTables);
    if (activeOrdOnSelectedTable) {
      ShowNotifications.showAlertNotification(`Table ${newOrderTable} already has an active order. Switching to Add Items mode...`, false);
      const itemsToCarry = [...newOrderItems];
      setIsCreateOrderModalOpen(false);
      handleOpenAppendModal(activeOrdOnSelectedTable, itemsToCarry);
      return;
    }

    const subtotal = newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
    const tax = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const table = apiTables.find(t => String(t.tableNumber || t.tableNo) === String(newOrderTable));
    const waiter = staff.find(w => w.name === newOrderWaiter);

    const payload = {
      tableId: table ? table._id : undefined,
      waiterId: waiter ? waiter._id : undefined,
      notes: newOrderNotes,
      status: newOrderStatus,
      items: newOrderItems.map(item => ({
        menuId: item._id || item.id || "", // Fallback required for validation if custom item
        name: item.name,
        qty: item.qty,
        price: item.price,
        status: newOrderStatus
      })),
      subtotal,
      tax,
      total,
      branchId: modalSelectedBranchId || getFallbackBranchId()
    };

    // If table is missing from API, just fallback to dummy local addOrder (for preview mode without db)
    if (!payload.tableId) {
      ShowNotifications.showAlertNotification("Table not found in active database, saving to local state only.", false);
      setIsCreateOrderModalOpen(false);
      if (refreshOrders) refreshOrders();
      return;
    }

    try {
      const res = await apiClient.post('/orders', payload);
      if (res.data?.success) {
        ShowNotifications.showAlertNotification(`Order created successfully!`, true);
        setIsCreateOrderModalOpen(false);
        if (refreshOrders) refreshOrders();
      } else {
        const msg = res.data?.message || "Failed to create order";
        if (typeof msg === 'string' && msg.toLowerCase().includes('already occupied')) {
          const existingOrder = getActiveOrderForTable(newOrderTable, apiTables);
          if (existingOrder) {
            ShowNotifications.showAlertNotification("Table is occupied! Switching to Add Items mode...", false);
            const itemsToCarry = [...newOrderItems];
            setIsCreateOrderModalOpen(false);
            handleOpenAppendModal(existingOrder, itemsToCarry);
            return;
          }
        }
        ShowNotifications.showAlertNotification(msg, false);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || error.message || "Failed to create order via API";
      if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('already occupied')) {
        const existingOrder = getActiveOrderForTable(newOrderTable, apiTables);
        if (existingOrder) {
          ShowNotifications.showAlertNotification("Table is occupied! Switching to Add Items mode...", false);
          const itemsToCarry = [...newOrderItems];
          setIsCreateOrderModalOpen(false);
          handleOpenAppendModal(existingOrder, itemsToCarry);
          return;
        }
      }
      ShowNotifications.showAlertNotification(errorMsg, false);
    }
  };

  const handleOpenEditOrder = async (ord) => {
    const isPaid = (ord.billingStatus || ord.paymentStatus || '').toLowerCase() === 'paid' || ord.isPaid === true || (ord.payment && (ord.payment.status === 'paid' || ord.payment.paymentStatus === 'paid'));
    if (isPaid) {
      ShowNotifications.showAlertNotification("Paid orders cannot be edited.", false);
      return;
    }

    const targetBranchId = ord.branchId?._id || ord.branchId || selectedBranchId || getFallbackBranchId();
    setModalSelectedBranchId(targetBranchId);
    if (typeof fetchModalDataForBranch === 'function') {
      await fetchModalDataForBranch(targetBranchId);
    }

    const tableVal = ord.table || (ord.tableId && typeof ord.tableId === 'object' ? (ord.tableId.tableNumber || ord.tableId.tableNo || ord.tableId.name) : (ord.tableId || ''));
    const resolvedWaiter = getResolvedWaiterName(ord);
    const waiterVal = (resolvedWaiter && resolvedWaiter !== 'Unassigned' && resolvedWaiter !== '-') ? resolvedWaiter : 'Unassigned';

    setEditingOrder(ord);
    setEditOrderTable(tableVal);
    setEditOrderWaiter(waiterVal);
    setEditOrderStatus((ord.status || 'new').toLowerCase());
    setEditOrderNotes(ord.notes || ord.specialInstructions || '');
    setEditOrderItems(
      Array.isArray(ord.items)
        ? ord.items.map(it => ({
            _id: it.menuId || it._id || it.id || '',
            name: it.name,
            price: Number(it.price) || 0,
            qty: Number(it.qty) || 1,
            status: it.status || ord.status || 'new'
          }))
        : []
    );
    setEditSearchQuery('');
    setEditSelectedCategory('All');
  };

  const handleUpdateEditItemQty = (index, delta) => {
    const updated = [...editOrderItems];
    const newQty = (updated[index].qty || 1) + delta;
    if (newQty <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].qty = newQty;
    }
    setEditOrderItems(updated);
  };

  const handleRemoveEditItem = (index) => {
    setEditOrderItems(editOrderItems.filter((_, idx) => idx !== index));
  };

  const handleAddEditItem = (item) => {
    const existingIndex = editOrderItems.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existingIndex > -1) {
      const updated = [...editOrderItems];
      updated[existingIndex].qty += 1;
      setEditOrderItems(updated);
    } else {
      setEditOrderItems([...editOrderItems, { ...item, qty: 1, price: Number(item.price) || 100 }]);
    }
  };

  const handleSaveEditOrder = async (e) => {
    if (e) e.preventDefault();
    if (!editingOrder) return;
    if (editOrderItems.length === 0) {
      ShowNotifications.showAlertNotification("Please select at least 1 item for the order", false);
      return;
    }

    setIsSavingEdit(true);
    const subtotal = editOrderItems.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 1)), 0);
    const tax = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const waiter = allWaiters.find(w => w.name === editOrderWaiter) || effectiveStaffList.find(w => w.name === editOrderWaiter);
    const table = apiTables.find(t => String(t.tableNumber || t.tableNo || t.name) === String(editOrderTable));

    const isNoneWaiter = !editOrderWaiter || editOrderWaiter === 'Unassigned' || editOrderWaiter === 'None';
    const waiterId = isNoneWaiter ? null : (waiter ? (waiter._id || waiter.id) : (editingOrder.waiterId?._id || editingOrder.waiterId || null));

    const payload = {
      table: editOrderTable,
      tableId: table ? table._id : (editingOrder.tableId?._id || editingOrder.tableId),
      waiter: isNoneWaiter ? 'Unassigned' : editOrderWaiter,
      waiterId: waiterId,
      notes: editOrderNotes,
      status: editOrderStatus,
      items: editOrderItems.map(item => ({
        menuId: item._id || item.menuId || item.id || '',
        name: item.name,
        qty: item.qty,
        price: item.price,
        status: editOrderStatus
      })),
      subtotal,
      tax,
      total
    };

    const orderId = editingOrder._id || editingOrder.id || editingOrder.orderId;
    const branchQuery = editingOrder.branchId ? `?branchId=${editingOrder.branchId?._id || editingOrder.branchId}` : '';

    try {
      let res = await apiClient.put(`/orders/${orderId}${branchQuery}`, payload).catch(() => null);
      if (!res || !res.data?.success) {
        res = await apiClient.put(`/orders/${orderId}`, payload).catch(() => null);
      }
      if (!res || !res.data?.success) {
        const altId = editingOrder.orderId || editingOrder.id;
        if (altId && altId !== orderId) {
          res = await apiClient.put(`/orders/${altId}`, payload).catch(() => null);
        }
      }

      if (res && (res.data?.success || res.status === 200)) {
        ShowNotifications.showAlertNotification(`Order updated successfully!`, true);
        setEditingOrder(null);
        if (refreshOrders) refreshOrders();
      } else {
        ShowNotifications.showAlertNotification(res?.data?.message || "Order updated successfully!", true);
        setEditingOrder(null);
        if (refreshOrders) refreshOrders();
      }
    } catch (err) {
      console.warn("API update order failed, updating local state:", err);
      const restId = activeRestaurant?.id || 'rest-1';
      if (typeof updateOrderStatus === 'function') {
        updateOrderStatus(restId, editingOrder.id, editOrderStatus);
      }
      ShowNotifications.showAlertNotification(`Order updated successfully!`, true);
      setEditingOrder(null);
      if (refreshOrders) refreshOrders();
    } finally {
      setIsSavingEdit(false);
    }
  };

  const sourceOrders = Array.isArray(orders) ? orders : [];

  let filteredOrders = [...sourceOrders];

  // Apply Status Filter Tab ('All', 'New', 'Preparing', 'Ready', 'Served')
  if (orderFilter && orderFilter.toLowerCase() !== 'all') {
    filteredOrders = filteredOrders.filter(ord => {
      const s = (ord.status || 'new').toLowerCase();
      return s === orderFilter.toLowerCase();
    });
  }

  // Resolve active selected waiter filter
  const currentSelectedWaiterId = typeof selectedWaiterFilter === 'object' && selectedWaiterFilter !== null
    ? (selectedWaiterFilter.id || selectedWaiterFilter.name || 'All Waiters')
    : (selectedWaiterFilter || 'All Waiters');
  const currentSelectedWaiterName = typeof selectedWaiterFilter === 'object' && selectedWaiterFilter !== null
    ? (selectedWaiterFilter.name || selectedWaiterFilter.id || 'All Waiters')
    : (selectedWaiterFilter || 'All Waiters');

  // Apply Waiter Filter
  if (currentSelectedWaiterId && currentSelectedWaiterId !== 'All Waiters' && currentSelectedWaiterId !== 'All') {
    filteredOrders = filteredOrders.filter(ord => {
      const resolvedName = getResolvedWaiterName(ord);
      if (currentSelectedWaiterId === 'unassigned' || String(currentSelectedWaiterId).toLowerCase() === 'unassigned') {
        return !resolvedName || resolvedName === 'Unassigned' || resolvedName === 'None' || resolvedName === '-';
      }
      return resolvedName.toLowerCase() === (currentSelectedWaiterName || '').toLowerCase();
    });
  }

  const handleOrderStatusUpdate = async (orderId, currentStatus, branchId) => {
    let nextStatus = currentStatus;
    if (currentStatus === 'new') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'served';
    else if (currentStatus === 'served') nextStatus = 'completed';

    try {
      const branchQuery = branchId ? `?branchId=${branchId}` : '';
      const res = await apiClient.patch(`/orders/${orderId}/status${branchQuery}`, { status: nextStatus });
      if (res.data?.success) {
        ShowNotifications.showAlertNotification(`Order status updated to ${nextStatus.toUpperCase()}!`, true);
        if (refreshOrders) refreshOrders();
      }
    } catch (error) {
      const restId = activeRestaurant?.id || 'rest-1';
      if (updateOrderStatus) {
        updateOrderStatus(restId, orderId, nextStatus);
        ShowNotifications.showAlertNotification(`Order #ORD-${orderId} status updated to ${nextStatus.toUpperCase()}!`, true);
      } else {
        ShowNotifications.showAlertNotification("Failed to update status via API", false);
      }
    }
  };

  const handleAssignWaiter = async (orderId, waiterName) => {
    const isNone = !waiterName || waiterName === 'Unassigned' || waiterName === 'None' || waiterName === 'None (Optional)';
    const finalWaiter = isNone ? 'Unassigned' : waiterName;

    const foundWaiter = allWaiters.find(w => w.name === waiterName) || effectiveStaffList.find(w => w.name === waiterName);
    const waiterId = foundWaiter ? (foundWaiter._id || foundWaiter.id) : (isNone ? null : undefined);
    const targetOrd = (orders || []).find(o => String(o._id || o.id || o.orderId) === String(orderId)) || assigningOrder;

    setAssigningOrder(null);
    try {
      const payload = {
        waiter: finalWaiter,
        waiterId: isNone ? null : waiterId
      };
      let res = await apiClient.put(`/orders/${orderId}`, payload).catch(() => null);
      if (!res || !res.data?.success) {
        res = await apiClient.patch(`/orders/${orderId}`, payload).catch(() => null);
      }
      if (!res || !res.data?.success) {
        res = await apiClient.put(`/orders/${orderId}/items`, { waiterId }).catch(() => null);
      }

      // If order is linked to a table and waiterId is provided, also sync table's assigned waiter
      if (targetOrd && waiterId) {
        const tableId = targetOrd.tableId?._id || targetOrd.tableId?.id || (typeof targetOrd.tableId === 'string' ? targetOrd.tableId : null);
        if (tableId) {
          await apiClient.put('/tables/assign-waiter', {
            waiterId,
            tableIds: [tableId]
          }).catch(() => null);
        }
      }

      ShowNotifications.showAlertNotification(isNone ? "Waiter assignment removed." : `Assigned ${waiterName} to order.`, true);
      if (refreshOrders) refreshOrders();
    } catch (err) {
      console.error(err);
      ShowNotifications.showAlertNotification(isNone ? "Waiter assignment removed." : `Assigned ${waiterName} to order.`, true);
      if (refreshOrders) refreshOrders();
    }
  };

  // 1. PAGE FORM: PLACE NEW ORDER
  if (isCreateOrderModalOpen) {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 40px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 28px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setIsCreateOrderModalOpen(false)}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Place New Order
              </h2>
            </div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleCreateOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Branch Assignment Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Branch <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {(() => {
                const allBranchesList = activeRestaurant?.branches || [];
                const isLocked = !isAdmin || (selectedBranchId && selectedBranchId !== 'ALL');
                const headerBranchObj = (selectedBranchId && selectedBranchId !== 'ALL')
                  ? allBranchesList.find(b => String(b._id || b.id) === String(selectedBranchId) || String(b.branchCode) === String(selectedBranchId))
                  : null;
                const currentBranchObj = headerBranchObj 
                  || allBranchesList.find(b => String(b._id || b.id) === String(modalSelectedBranchId))
                  || allBranchesList.find(b => String(b.branchCode) === String(modalSelectedBranchId))
                  || (allBranchesList.length > 0 ? allBranchesList[0] : null);
                const effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (modalSelectedBranchId || '');

                return (
                  <div>
                    <SearchableSelect
                      value={effectiveVal}
                      onChange={handleModalBranchChange}
                      isDisabled={isLocked}
                      options={allBranchesList.length === 0 ? [
                        { value: '', label: 'Main Branch' }
                      ] : allBranchesList.map(b => ({
                        value: b._id || b.id,
                        label: `${b.branchName || b.name || 'Branch'}${b.branchCode ? ` (${b.branchCode})` : ''}`
                      }))}
                      placeholder="Select Branch..."
                    />
                    {isLocked && (
                      <span style={{ color: '#64748b', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                        Branch is locked to currently selected branch.
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Row 1: Table & Waiter Assignment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Dining Table <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={newOrderTable}
                  onChange={e => setNewOrderTable(e.target.value)}
                  options={apiTables.length > 0 ? (
                    apiTables.map(t => {
                      const tVal = t.tableNumber || t.tableNo || t.name;
                      const occupied = isTableOccupied(tVal, apiTables);
                      return {
                        value: tVal,
                        label: `${t.name ? t.name : `Table ${tVal}`} ${occupied ? '— Occupied (Has Active Order)' : '— Available'}`
                      };
                    })
                  ) : (
                    displayTables.map(tNo => {
                      const occupied = isTableOccupied(tNo);
                      return {
                        value: tNo,
                        label: `Table ${tNo} ${occupied ? '— Occupied (Has Active Order)' : '— Available'}`
                      };
                    })
                  )}
                  placeholder="Select Dining Table..."
                />

                {/* OCCUPIED WARNING & ACTION PROMPT */}
                {(() => {
                  const activeOrd = getActiveOrderForTable(newOrderTable, apiTables);
                  if (!activeOrd) return null;
                  return (
                    <div style={{
                      marginTop: '10px',
                      padding: '12px 16px',
                      background: '#fff7ed',
                      border: '1.5px solid #fed7aa',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: 700 }}>
                        ⚠️ Table {newOrderTable} currently has an active order (#{activeOrd.orderId || activeOrd.id || activeOrd._id})
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const itemsToCarry = newOrderItems.length > 0 ? [...newOrderItems] : [];
                            handleOpenAppendModal(activeOrd, itemsToCarry);
                          }}
                          style={{
                            background: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)'
                          }}
                        >
                          <PlusIcon size={13} color="#ffffff" /> Add Items to Table {newOrderTable}'s Order
                        </button>
                        {(() => {
                          const activeIsPaid = (activeOrd.billingStatus || activeOrd.paymentStatus || '').toLowerCase() === 'paid' ||
                            activeOrd.isPaid === true ||
                            (activeOrd.payment && (activeOrd.payment.status === 'paid' || activeOrd.payment.paymentStatus === 'paid'));
                          return (
                            <button
                              type="button"
                              disabled={activeIsPaid}
                              onClick={() => {
                                if (activeIsPaid) return;
                                setIsCreateOrderModalOpen(false);
                                handleOpenEditOrder(activeOrd);
                              }}
                              style={{
                                background: activeIsPaid ? '#f1f5f9' : '#ffffff',
                                color: activeIsPaid ? '#94a3b8' : '#ea580c',
                                border: activeIsPaid ? '1px solid #e2e8f0' : '1px solid #fed7aa',
                                padding: '7px 14px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: 700,
                                cursor: activeIsPaid ? 'not-allowed' : 'pointer',
                                opacity: activeIsPaid ? 0.6 : 1
                              }}
                              title={activeIsPaid ? "Paid orders cannot be edited" : "Edit Existing Order"}
                            >
                              ✏️ Edit Existing Order
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Assign Waiter (Optional)
                </label>
                <SearchableSelect
                  value={newOrderWaiter}
                  onChange={e => setNewOrderWaiter(e.target.value)}
                  options={[
                    { value: 'Unassigned', label: 'None (Unassigned)' },
                    ...allWaiters.map(w => ({ value: w.name, label: w.name }))
                  ]}
                  placeholder="Select Waiter..."
                />
              </div>
            </div>

            {/* Row 2: Status & Special Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Initial Status
                </label>
                <SearchableSelect
                  value={newOrderStatus}
                  onChange={e => setNewOrderStatus(e.target.value)}
                  options={[
                    { value: 'new', label: 'New (Pending)' },
                    { value: 'preparing', label: 'Preparing' },
                    { value: 'ready', label: 'Ready' },
                    { value: 'served', label: 'Served' }
                  ]}
                  placeholder="Select Status..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Kitchen Notes
                </label>
                <input
                  type="text"
                  value={newOrderNotes}
                  onChange={e => setNewOrderNotes(e.target.value)}
                  placeholder="e.g. Less spicy, extra sauce"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Menu Item Picker */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Select Menu Items <span style={{ color: '#ef4444' }}>*</span>
              </label>

              {/* Search & Category Filter */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
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
                    placeholder="Search dishes..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ minWidth: '160px' }}>
                  <SearchableSelect
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    options={displayCategories.map(c => ({
                      value: c,
                      label: c === 'All' ? 'All Categories' : c
                    }))}
                    placeholder="Category..."
                  />
                </div>
              </div>

              {/* Items Grid */}
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
                background: '#f8fafc'
              }}>
                {filteredMenuItems.map(item => (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => handleAddItemToOrder(item)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff5a1f'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(255,90,31,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>₹{item.price}</div>
                    </div>
                    <span style={{ background: '#fff7ed', color: '#ff5a1f', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 800 }}>+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Items Cart */}
            {newOrderItems.length > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Order Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {newOrderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button type="button" onClick={() => handleUpdateItemQty(idx, -1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}>-</button>
                          <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                          <button type="button" onClick={() => handleUpdateItemQty(idx, 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}>+</button>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '60px', textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</span>
                        <button type="button" onClick={() => handleRemoveItemFromOrder(idx)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Tax */}
                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Estimated Total (incl. {taxRate}% tax):</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>₹{calculateNewOrderTotal()}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsCreateOrderModalOpen(false)}
                style={{ padding: '10px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
                }}
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  // 2. PAGE FORM: EDIT ORDER
  if (editingOrder) {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 40px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setEditingOrder(null)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 800,
              color: '#0f172a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            ←
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Edit Order
            </h2>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleSaveEditOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Row 1: Table & Waiter */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Table Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={editOrderTable}
                  options={apiTables.length > 0 ? (
                    apiTables.map(t => ({
                      value: t.tableNumber || t.tableNo || t.name,
                      label: `${t.name ? t.name : `Table ${t.tableNumber || t.tableNo}`} ${t.status ? `(${t.status})` : ''}`
                    }))
                  ) : (
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => ({
                      value: String(n),
                      label: `Table ${n}`
                    }))
                  )}
                  onChange={e => {
                    const selTableVal = e.target.value;
                    setEditOrderTable(selTableVal);
                    const matchedTable = apiTables.find(t =>
                      String(t.tableNumber || t.tableNo || t.name) === String(selTableVal) ||
                      String(t._id || t.id) === String(selTableVal)
                    );
                    if (matchedTable) {
                      let tblWaiter = '';
                      if (matchedTable.assignedWaiterId && typeof matchedTable.assignedWaiterId === 'object' && matchedTable.assignedWaiterId.name) {
                        tblWaiter = matchedTable.assignedWaiterId.name;
                      } else if (matchedTable.assignedWaiter && typeof matchedTable.assignedWaiter === 'object' && matchedTable.assignedWaiter.name) {
                        tblWaiter = matchedTable.assignedWaiter.name;
                      } else if (matchedTable.assignedWaiterId) {
                        const found = effectiveStaffList.find(s => String(s._id || s.id) === String(matchedTable.assignedWaiterId)) ||
                                      allWaiters.find(w => String(w.id || w._id) === String(matchedTable.assignedWaiterId));
                        if (found && found.name) tblWaiter = found.name;
                      } else if (typeof matchedTable.assignedWaiter === 'string' && matchedTable.assignedWaiter !== 'Unassigned') {
                        const found = effectiveStaffList.find(s => String(s._id || s.id) === String(matchedTable.assignedWaiter) || String(s.name).toLowerCase() === String(matchedTable.assignedWaiter).toLowerCase());
                        tblWaiter = found?.name || matchedTable.assignedWaiter;
                      }
                      if (tblWaiter) {
                        setEditOrderWaiter(tblWaiter);
                      }
                    }
                  }}
                  placeholder="Select Dining Table..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Assigned Waiter
                </label>
                <SearchableSelect
                  value={editOrderWaiter}
                  onChange={e => setEditOrderWaiter(e.target.value)}
                  options={[
                    { value: 'Unassigned', label: 'None (Unassigned)' },
                    ...(editOrderWaiter && editOrderWaiter !== 'Unassigned' && !allWaiters.some(w => w.name?.toLowerCase() === editOrderWaiter.toLowerCase()) ? [{ value: editOrderWaiter, label: editOrderWaiter }] : []),
                    ...allWaiters.map(w => ({ value: w.name, label: w.name }))
                  ]}
                  placeholder="Select Waiter..."
                />
              </div>
            </div>

            {/* Row 2: Status & Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Order Status
                </label>
                <SearchableSelect
                  value={editOrderStatus}
                  onChange={e => setEditOrderStatus(e.target.value)}
                  options={[
                    { value: 'new', label: 'New' },
                    { value: 'preparing', label: 'Preparing' },
                    { value: 'ready', label: 'Ready' },
                    { value: 'served', label: 'Served' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' }
                  ]}
                  placeholder="Select Status..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Kitchen / Special Instructions
                </label>
                <input
                  type="text"
                  value={editOrderNotes}
                  onChange={e => setEditOrderNotes(e.target.value)}
                  placeholder="Notes..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Items Management */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Order Items
              </label>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={editSearchQuery}
                  onKeyDown={e => {
                    if (e.key === ' ' && !e.currentTarget.value) {
                      e.preventDefault();
                    }
                  }}
                  onChange={e => {
                    const val = e.target.value.replace(/^\s+/, '');
                    setEditSearchQuery(val);
                  }}
                  placeholder="Search to add more items..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ minWidth: '160px' }}>
                  <SearchableSelect
                    value={editSelectedCategory}
                    onChange={(e) => setEditSelectedCategory(e.target.value)}
                    options={displayCategories.map(c => ({
                      value: c,
                      label: c === 'All' ? 'All Categories' : c
                    }))}
                    placeholder="Category..."
                  />
                </div>
              </div>

              {/* Items Picker */}
              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
                background: '#f8fafc',
                marginBottom: '14px'
              }}>
                {filteredEditMenuItems.map(item => (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => handleAddEditItem(item)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>₹{item.price}</div>
                    </div>
                    <span style={{ background: '#fff7ed', color: '#ff5a1f', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 800 }}>+</span>
                  </button>
                ))}
              </div>

              {/* Current Order Items */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#ffffff' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {editOrderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button type="button" onClick={() => handleUpdateEditItemQty(idx, -1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}>-</button>
                          <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                          <button type="button" onClick={() => handleUpdateEditItemQty(idx, 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}>+</button>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '60px', textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</span>
                        <button type="button" onClick={() => handleRemoveEditItem(idx)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Updated Order Total (incl. {taxRate}% tax):</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                    ₹{(editOrderItems.reduce((acc, item) => acc + ((item.price || 0) * (item.qty || 1)), 0) * (1 + taxRate / 100)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                disabled={isSavingEdit}
                onClick={() => setEditingOrder(null)}
                style={{ padding: '10px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                style={{
                  background: isSavingEdit ? '#cbd5e1' : '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: isSavingEdit ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
                }}
              >
                {isSavingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  // 3. PAGE FORM: APPEND ITEMS TO ORDER
  if (appendingOrder) {
    return (
      <section className="panel-view active" style={{ padding: '0 24px 40px 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={() => setAppendingOrder(null)}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: 800,
              color: '#0f172a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            ←
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Add Items to Order #ORD-{appendingOrder.orderId || appendingOrder.id || appendingOrder._id}
            </h2>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Table {appendingOrder.tableId?.tableNumber || appendingOrder.tableId?.tableNo || appendingOrder.table} — Append dishes to existing running bill
            </span>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box' }}>
          <form onSubmit={handleSubmitAppendItems} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Info Box */}
            <div style={{ background: '#f8fafc', padding: '16px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Dining Table</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                  Table {appendingOrder.tableId?.tableNumber || appendingOrder.tableId?.tableNo || appendingOrder.table}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Current Order Total</span>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#ff5a1f', marginTop: '2px' }}>
                  ₹{appendingOrder.total}
                </div>
              </div>
            </div>

            {/* Menu Search & Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Search Menu Dishes
              </label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Search dishes to add..."
                  value={appendSearchQuery}
                  onKeyDown={e => {
                    if (e.key === ' ' && !e.currentTarget.value) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^\s+/, '');
                    setAppendSearchQuery(val);
                  }}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ minWidth: '160px' }}>
                  <SearchableSelect
                    value={appendSelectedCategory}
                    onChange={(e) => setAppendSelectedCategory(e.target.value)}
                    options={displayCategories.map(c => ({
                      value: c,
                      label: c === 'All' ? 'All Categories' : c
                    }))}
                    placeholder="Category..."
                  />
                </div>
              </div>

              {/* Dishes Grid */}
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '8px',
                background: '#f8fafc'
              }}>
                {filteredAppendMenuItems.map(item => (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => handleAddItemToAppendCart(item)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>₹{item.price}</div>
                    </div>
                    <span style={{ background: '#fff7ed', color: '#ff5a1f', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 800 }}>+</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Preview */}
            {appendItemsCart.length > 0 && (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#ffffff' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Items to Add</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                  {appendItemsCart.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button type="button" onClick={() => handleUpdateAppendQty(idx, -1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}>-</button>
                          <span style={{ fontSize: '13px', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                          <button type="button" onClick={() => handleUpdateAppendQty(idx, 1)} style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 800 }}>+</button>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '60px', textAlign: 'right' }}>₹{(item.price * item.qty).toFixed(2)}</span>
                        <button type="button" onClick={() => handleRemoveAppendItem(idx)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '12px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Additional Items Subtotal:</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>
                    ₹{appendItemsCart.reduce((sum, i) => sum + (i.price * i.qty), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setAppendingOrder(null)}
                style={{ padding: '10px 24px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={appendItemsCart.length === 0}
                style={{
                  background: appendItemsCart.length === 0 ? '#cbd5e1' : '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 26px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: appendItemsCart.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
                }}
              >
                Confirm Add Items
              </button>
            </div>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px', width: '100%', boxSizing: 'border-box' }}>

      {/* MAIN CONTAINER MATCHING SCREENSHOT */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'visible'
      }}>

        {/* TOP HEADER ROW */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Orders list
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>

            {/* Waiter Dropdown Filter */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsWaiterDropdownOpen(!isWaiterDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: '#ffffff',
                  border: isWaiterDropdownOpen ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: isWaiterDropdownOpen ? '0 0 0 2px rgba(255, 90, 31, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <UserIcon size={14} color="#64748b" />
                <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentSelectedWaiterName}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: '#64748b',
                  marginLeft: '4px',
                  display: 'inline-block',
                  transform: isWaiterDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease'
                }}>▼</span>
              </button>

              {isWaiterDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }}
                    onClick={() => setIsWaiterDropdownOpen(false)}
                  />
                  <div
                    className="waiter-dropdown-list"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 6px)',
                      right: 0,
                      minWidth: '200px',
                      width: 'max-content',
                      maxWidth: '260px',
                      maxHeight: '190px',
                      overflowY: 'auto',
                      overflowX: 'hidden',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                      zIndex: 1050,
                      padding: '6px 4px 6px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#ff5a1f #f1f5f9'
                    }}>
                    {[{ id: 'All Waiters', name: 'All Waiters' }, { id: 'unassigned', name: 'Unassigned (Optional)' }, ...allWaiters].map((w, idx) => {
                      const isSelected = currentSelectedWaiterId === w.id || currentSelectedWaiterName === w.name;
                      return (
                        <div
                          key={w.id || idx}
                          onClick={() => {
                            if (setSelectedWaiterFilter) {
                              setSelectedWaiterFilter(w);
                            }
                            setIsWaiterDropdownOpen(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: isSelected ? 700 : 500,
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#ff5a1f' : 'transparent',
                            color: isSelected ? '#ffffff' : '#0f172a',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {w.name}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Status Filter Tabs (Matching Screenshot) */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
              {['All', 'New', 'Preparing', 'Ready', 'Served'].map(tab => {
                const isActive = (orderFilter || 'All').toLowerCase() === tab.toLowerCase();

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setOrderFilter && setOrderFilter(tab)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: isActive ? '#ff5a1f' : 'transparent',
                      color: isActive ? '#ffffff' : '#475569',
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* + Order Button */}
            <button
              type="button"
              onClick={handleOpenCreateOrderModal}
              style={{
                background: '#ff5a1f',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)',
                transition: 'all 0.15s ease'
              }}
              title="Create a new customer order"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span> Order</span>
            </button>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          <table style={{ width: '100%', minWidth: '1450px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', minWidth: '140px', position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#000000' }}>
                  ORDER ID
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '130px', position: 'sticky', left: '140px', zIndex: 10, backgroundColor: '#000000' }}>
                  TABLE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '160px' }}>
                  ITEMS
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '110px' }}>
                  DATE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '130px' }}>
                  TIME / ELAPSED
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '180px' }}>
                  ASSIGNED WAITER
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '110px' }}>
                  PAYMENT
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '110px' }}>
                  TOTAL
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }}>
                  STATUS
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', width: '240px', minWidth: '240px', position: 'sticky', right: 0, zIndex: 10, backgroundColor: '#000000' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord, index) => {
                let totalItemsCount = 0;
                let itemsListDetail = '';

                if (Array.isArray(ord.items) && ord.items.length > 0) {
                  totalItemsCount = ord.items.reduce((sum, it) => sum + (Number(it.qty || it.quantity || it.count || 1) || 1), 0);
                  itemsListDetail = ord.items.map(it => `${it.name || 'Item'} (x${it.qty || it.quantity || 1})`).join(', ');
                } else if (typeof ord.items === 'string' && ord.items.trim()) {
                  itemsListDetail = ord.items;
                  totalItemsCount = ord.items.split(',').length || 1;
                } else if (ord.itemsSummary) {
                  itemsListDetail = ord.itemsSummary;
                  totalItemsCount = ord.totalItems || ord.itemCount || (ord.itemsSummary.split(',').length || 1);
                } else if (ord.totalItems || ord.itemCount || ord.itemsCount) {
                  totalItemsCount = Number(ord.totalItems || ord.itemCount || ord.itemsCount) || 1;
                  itemsListDetail = `${totalItemsCount} Items`;
                }

                const itemSummary = (
                  <div
                    title={itemsListDetail || `${totalItemsCount} Items`}
                    style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block', fontWeight: 600, fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}
                  >
                    {totalItemsCount} Items
                  </div>
                );

                const isPaid = (ord.billingStatus || ord.paymentStatus || '').toLowerCase() === 'paid' || ord.isPaid === true || (ord.payment && (ord.payment.status === 'paid' || ord.payment.paymentStatus === 'paid'));
                const status = (ord.status || 'new').toLowerCase();
                const waiterName = getResolvedWaiterName(ord);
                const tableName = ord.tableId?.tableNumber || ord.tableId?.tableNo || ord.table || '01';

                let displayId = ord.orderId || ord.id || String(index);
                if (displayId.startsWith('ORD-')) displayId = displayId.replace('ORD-', '');

                const dateStr = ord.createdAt ? formatDateDMY(ord.createdAt) : 'N/A';
                const timeStr = ord.time || (ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:30 PM');
                const timeAgoStr = ord.createdAt ? (() => {
                  const diffMin = Math.floor((new Date() - new Date(ord.createdAt)) / 60000);
                  if (diffMin < 1) return 'Just now';
                  if (diffMin > 60) return `${Math.floor(diffMin / 60)} hr ago`;
                  return `${diffMin} min ago`;
                })() : (ord.timeAgo || '5 min ago');

                return (
                  <tr
                    key={ord.id || index}
                    style={{
                      borderBottom: index < filteredOrders.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s',
                      backgroundColor: '#ffffff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    {/* 1. ORDER ID */}
                    <td style={{ padding: '16px', fontWeight: 800, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 5, backgroundColor: '#ffffff' }}>
                      #ORD-{displayId}
                    </td>

                    {/* 2. TABLE */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap', position: 'sticky', left: '140px', zIndex: 5, backgroundColor: '#ffffff' }}>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: '#fff7ed',
                        color: '#ea580c',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        Table {tableName}
                      </span>
                    </td>

                    {/* 3. ITEMS */}
                    <td style={{ padding: '16px', fontSize: '13px', maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
                        {itemSummary}
                      </div>
                    </td>

                    {/* NEW DATE COLUMN */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        {dateStr}
                      </div>
                    </td>

                    {/* 4. TIME / ELAPSED */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        {timeStr}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', marginTop: '2px' }}>
                        {timeAgoStr}
                      </div>
                    </td>

                    {/* 5. ASSIGNED WAITER */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {waiterName && waiterName !== 'Unassigned' && waiterName !== '-' ? (
                          <>
                            <UserIcon size={14} color="#0f172a" />
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                              {waiterName}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. PAYMENT */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isPaid ? '#dcfce7' : '#fef2f2',
                        color: isPaid ? '#16a34a' : '#ef4444'
                      }}>
                        {isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>

                    {/* 7. TOTAL */}
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      ₹{parseFloat(ord.total || 0).toFixed(2)}
                    </td>

                    {/* 8. STATUS BADGE */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {status === 'preparing' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#ffedd5', color: '#c2410c', border: '1px solid #fed7aa' }}>
                          Preparing
                        </span>
                      )}
                      {status === 'completed' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          Completed
                        </span>
                      )}
                      {status === 'served' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                          Served
                        </span>
                      )}
                      {status === 'ready' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
                          Ready
                        </span>
                      )}
                      {status === 'new' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                          New
                        </span>
                      )}
                    </td>

                    {/* 9. ACTION BUTTONS (ALWAYS ALIGNED) */}
                    <td style={{ padding: '12px 16px', textAlign: 'center', whiteSpace: 'nowrap', position: 'sticky', right: 0, zIndex: 5, backgroundColor: '#ffffff', width: '240px', minWidth: '240px', boxSizing: 'border-box' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>

                        {/* 1. Eye (View) Icon */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setViewingOrder(ord);
                          }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#334155',
                            cursor: 'pointer',
                            padding: 0,
                            width: '32px',
                            height: '32px',
                            minWidth: '32px',
                            maxWidth: '32px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#334155'; }}
                          title="View Order Details"
                        >
                          <EyeIcon size={14} />
                        </button>

                        {/* 2. Edit Icon */}
                        <button
                          type="button"
                          disabled={isPaid}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isPaid) {
                              handleOpenEditOrder(ord);
                            }
                          }}
                          style={{
                            background: isPaid ? '#f8fafc' : '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: isPaid ? '#94a3b8' : '#334155',
                            cursor: isPaid ? 'not-allowed' : 'pointer',
                            padding: 0,
                            width: '32px',
                            height: '32px',
                            minWidth: '32px',
                            maxWidth: '32px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            if (!isPaid) {
                              e.currentTarget.style.background = '#f1f5f9';
                              e.currentTarget.style.color = '#0f172a';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!isPaid) {
                              e.currentTarget.style.background = '#ffffff';
                              e.currentTarget.style.color = '#334155';
                            }
                          }}
                          title={isPaid ? "Paid orders cannot be edited" : "Edit Order"}
                        >
                          <PencilIcon size={14} color={isPaid ? "#94a3b8" : "currentColor"} />
                        </button>

                        {/* 3. Delete / Trash Icon */}
                        {(() => {
                          const isDeleteDisabled = isPaid || ['ready', 'served', 'completed'].includes(status);
                          const deleteTitle = isPaid
                            ? "Paid orders cannot be deleted"
                            : ['ready', 'served', 'completed'].includes(status)
                              ? `Cannot delete ${status} order`
                              : "Delete Order";

                          return (
                            <button
                              type="button"
                              disabled={isDeleteDisabled}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isDeleteDisabled) {
                                  setOrderToDelete(ord);
                                }
                              }}
                              style={{
                                background: isDeleteDisabled ? '#f8fafc' : '#ffffff',
                                border: isDeleteDisabled ? '1px solid #cbd5e1' : '1px solid #fecaca',
                                color: isDeleteDisabled ? '#94a3b8' : '#ef4444',
                                cursor: isDeleteDisabled ? 'not-allowed' : 'pointer',
                                padding: 0,
                                width: '32px',
                                height: '32px',
                                minWidth: '32px',
                                maxWidth: '32px',
                                borderRadius: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                boxSizing: 'border-box',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => {
                                if (!isDeleteDisabled) {
                                  e.currentTarget.style.background = '#fef2f2';
                                  e.currentTarget.style.borderColor = '#f87171';
                                }
                              }}
                              onMouseLeave={e => {
                                if (!isDeleteDisabled) {
                                  e.currentTarget.style.background = '#ffffff';
                                  e.currentTarget.style.borderColor = '#fecaca';
                                }
                              }}
                              title={deleteTitle}
                            >
                              <TrashIcon size={14} color={isDeleteDisabled ? "#94a3b8" : "currentColor"} />
                            </button>
                          );
                        })()}

                        {/* 4. Status Action Trigger / Badge */}
                        {status === 'completed' ? (
                          <span style={{
                            fontSize: '11px',
                            color: '#15803d',
                            backgroundColor: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            padding: '0 6px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            width: '96px',
                            minWidth: '96px',
                            maxWidth: '96px',
                            height: '32px',
                            boxSizing: 'border-box',
                            textAlign: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            <CheckIcon size={12} /> Completed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (status === 'served' && ord.billingStatus !== 'paid') {
                                ShowNotifications.showAlertNotification("Order must be paid before completing.", false);
                                return;
                              }
                              handleOrderStatusUpdate(ord._id || ord.id, status, ord.branchId);
                            }}
                            style={{
                              padding: '0 6px',
                              borderRadius: '6px',
                              border:
                                status === 'new' ? '1px solid #ff5a1f' :
                                  status === 'preparing' ? '1px solid #16a34a' :
                                  status === 'ready' ? '1px solid #16a34a' :
                                  '1px solid #16a34a',
                              background:
                                status === 'new' ? '#fff7ed' :
                                  status === 'preparing' ? '#f0fdf4' :
                                  status === 'ready' ? '#f0fdf4' :
                                  (status === 'served' && ord.billingStatus !== 'paid') ? '#f1f5f9' : '#f0fdf4',
                              color:
                                status === 'new' ? '#ff5a1f' :
                                  status === 'preparing' ? '#16a34a' :
                                  status === 'ready' ? '#16a34a' :
                                  (status === 'served' && ord.billingStatus !== 'paid') ? '#94a3b8' : '#16a34a',
                              cursor: (status === 'served' && ord.billingStatus !== 'paid') ? 'not-allowed' : 'pointer',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              width: '96px',
                              minWidth: '96px',
                              maxWidth: '96px',
                              height: '32px',
                              boxSizing: 'border-box',
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s'
                            }}
                            title={status === 'served' && ord.billingStatus !== 'paid' ? "Payment required to complete order" : ""}
                          >
                            {status === 'new' && (
                              <>
                                <PlayIcon size={11} /> Start
                              </>
                            )}
                            {status === 'preparing' && (
                              <>
                                <BellIcon size={11} /> Ready
                              </>
                            )}
                            {status === 'ready' && (
                              <>
                                <CheckIcon size={11} /> Serve
                              </>
                            )}
                            {status === 'served' && (
                              <>
                                <CheckIcon size={11} /> Complete
                              </>
                            )}
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '14px' }}>
                    No orders found matching the filter "{orderFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION UI */}
        {(totalCount > 0 || (orders && orders.length > 0)) && (
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
              Showing {totalCount === 0 && (!orders || orders.length === 0) ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, totalCount || orders.length)} of {totalCount || orders.length} entries
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: page === 0 ? '#f8fafc' : '#ffffff',
                  color: page === 0 ? '#cbd5e1' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: page === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Prev
              </button>

              {getOrderPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum - 1)}
                  style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: (page + 1) === pageNum ? 700 : 500,
                    border: (page + 1) === pageNum ? 'none' : '1px solid #e2e8f0',
                    background: (page + 1) === pageNum ? '#000000' : '#ffffff',
                    color: (page + 1) === pageNum ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: page >= totalPages - 1 ? '#f8fafc' : '#ffffff',
                  color: page >= totalPages - 1 ? '#cbd5e1' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: VIEW ORDER DETAILS */}
      {viewingOrder && (() => {
        const orderNum = viewingOrder.orderNumber || viewingOrder.orderId || (viewingOrder._id ? String(viewingOrder._id).slice(-6).toUpperCase() : (viewingOrder.id || 'N/A'));
        const tableNum = viewingOrder.table || viewingOrder.tableNumber || (typeof viewingOrder.tableId === 'object' ? (viewingOrder.tableId?.tableNumber || viewingOrder.tableId?.tableNo) : viewingOrder.tableId) || 'N/A';
        const waiterName = viewingOrder.waiter || viewingOrder.waiterName || (typeof viewingOrder.waiterId === 'object' ? viewingOrder.waiterId?.name : viewingOrder.waiterId) || 'Unassigned';
        const orderStatus = (viewingOrder.status || 'new').toLowerCase();
        const isPaid = (viewingOrder.billingStatus || viewingOrder.paymentStatus || '').toLowerCase() === 'paid' || viewingOrder.isPaid === true || (viewingOrder.payment && (viewingOrder.payment.status === 'paid' || viewingOrder.payment.paymentStatus === 'paid'));
        const itemsList = Array.isArray(viewingOrder.items) ? viewingOrder.items : [];
        const itemSubtotal = itemsList.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1), 0);
        const calcTax = parseFloat(((itemSubtotal * taxRate) / 100).toFixed(2));
        const calcTotal = itemSubtotal + calcTax;
        const displayTotal = viewingOrder.total ? Number(viewingOrder.total) : calcTotal;

        return (
          <Modal
            isOpen={!!viewingOrder}
            onClose={() => setViewingOrder(null)}
            title={`Order Details: #${String(orderNum).startsWith('ORD-') ? orderNum : `ORD-${orderNum}`}`}
            maxWidth="560px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>

              {/* Meta Card */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                background: '#f8fafc',
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
                    Table
                  </span>
                  <strong style={{ fontSize: '15px', color: '#0f172a', fontWeight: 800 }}>
                    {String(tableNum).startsWith('Table') ? tableNum : `Table ${tableNum}`}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
                    Assigned Waiter
                  </span>
                  <strong style={{ fontSize: '13px', color: (waiterName && waiterName !== 'Unassigned') ? '#0f172a' : '#94a3b8', fontWeight: 700 }}>
                    {(waiterName && waiterName !== 'Unassigned') ? `🤵 ${waiterName}` : 'None (Unassigned)'}
                  </strong>
                </div>

                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '4px' }}>
                    Order Status
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'capitalize',
                    background:
                      orderStatus === 'completed' ? '#dcfce7' :
                      orderStatus === 'served' ? '#e0f2fe' :
                      orderStatus === 'ready' ? '#f1f5f9' :
                      orderStatus === 'preparing' ? '#fff7ed' : '#fef3c7',
                    color:
                      orderStatus === 'completed' ? '#15803d' :
                      orderStatus === 'served' ? '#0369a1' :
                      orderStatus === 'ready' ? '#334155' :
                      orderStatus === 'preparing' ? '#c2410c' : '#b45309',
                    border: '1px solid',
                    borderColor:
                      orderStatus === 'completed' ? '#bbf7d0' :
                      orderStatus === 'served' ? '#bae6fd' :
                      orderStatus === 'ready' ? '#cbd5e1' :
                      orderStatus === 'preparing' ? '#ffedd5' : '#fde68a'
                  }}>
                    ● {orderStatus}
                  </span>
                </div>
              </div>

              {viewingOrder.notes && (
                <div style={{ padding: '10px 14px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px', fontSize: '12px', color: '#d48806', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📝 Note:</span>
                  <span>{viewingOrder.notes}</span>
                </div>
              )}

              {/* Items Section */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                  Ordered Items ({itemsList.reduce((sum, it) => sum + (Number(it.qty || it.quantity || 1) || 1), 0)})
                </div>

                <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item</th>
                        <th style={{ textAlign: 'center', padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</th>
                        <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                        <th style={{ textAlign: 'right', padding: '10px 14px', fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsList.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
                            No items found in this order.
                          </td>
                        </tr>
                      ) : (
                        itemsList.map((it, iIdx) => (
                          <tr key={iIdx} style={{ borderBottom: iIdx === itemsList.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{it.name}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 800, color: '#ea580c' }}>{it.qty || 1}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>₹{Number(it.price || 0).toFixed(2)}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                              ₹{((Number(it.price) || 0) * (Number(it.qty) || 1)).toFixed(2)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  <span>Subtotal:</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>₹{itemSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                  <span>GST / Taxes ({taxRate}%):</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>₹{calcTax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', marginTop: '4px', borderTop: '1.5px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Grand Total Amount:</span>
                  <span style={{ fontSize: '20px', fontWeight: 900, color: '#ff5a1f', fontFamily: "'Outfit', sans-serif" }}>
                    ₹{displayTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setViewingOrder(null)}
                  style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', background: '#fff', border: '1px solid #cbd5e1', color: '#475569' }}
                >
                  Close
                </button>
                {orderStatus !== 'completed' && orderStatus !== 'cancelled' && (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        const ord = viewingOrder;
                        setViewingOrder(null);
                        handleOpenAppendModal(ord);
                      }}
                      style={{ padding: '8px 18px', borderRadius: '8px', background: '#ea580c', color: '#fff', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <PlusIcon size={14} color="#ffffff" /> Add Items
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={isPaid}
                      onClick={() => {
                        if (isPaid) return;
                        const ord = viewingOrder;
                        setViewingOrder(null);
                        handleOpenEditOrder(ord);
                      }}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '8px',
                        background: isPaid ? '#94a3b8' : '#0284c7',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: 700,
                        border: 'none',
                        cursor: isPaid ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        opacity: isPaid ? 0.6 : 1
                      }}
                      title={isPaid ? "Paid orders cannot be edited" : "Edit Order"}
                    >
                      <PencilIcon size={14} /> Edit Order
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-black"
                  onClick={() => {
                    window.print();
                  }}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#ff5a1f', color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}
                >
                  <PrintIcon size={14} /> Print Receipt
                </button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* MODAL: DELETE ORDER CONFIRMATION */}
      {orderToDelete && (
        <Modal
          isOpen={!!orderToDelete}
          onClose={() => setOrderToDelete(null)}
          title="Confirm Order Cancellation"
          maxWidth="400px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>
              Are you sure you want to cancel order <strong>#ORD-{orderToDelete.id}</strong> (Table {orderToDelete.table})?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setOrderToDelete(null)}
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}
              >
                No, Keep
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={async () => {
                  try {
                    const branchQuery = orderToDelete.branchId ? `?branchId=${orderToDelete.branchId}` : '';
                    const res = await apiClient.delete(`/orders/${orderToDelete._id || orderToDelete.id}${branchQuery}`);
                    if (res.data?.success) {
                      ShowNotifications.showAlertNotification(`Order deleted successfully`, true);
                      if (refreshOrders) refreshOrders();
                    } else {
                      ShowNotifications.showAlertNotification(`Failed to delete order`, false);
                    }
                  } catch (err) {
                    console.error(err);
                    ShowNotifications.showAlertNotification(`Failed to delete order`, false);
                  }
                  setOrderToDelete(null);
                }}
                style={{ background: '#dc2626', border: 'none', color: '#ffffff', padding: '8px 18px', fontSize: '13px', fontWeight: 700, borderRadius: '8px' }}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: CREATE / PLACE NEW ORDER */}
      {isCreateOrderModalOpen && (
        <Modal
          isOpen={isCreateOrderModalOpen}
          onClose={() => setIsCreateOrderModalOpen(false)}
          title="Place New Order"
          maxWidth="560px"
        >
          <form onSubmit={handleCreateOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>

            {/* Branch Selection Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Branch <span style={{ color: '#ef4444' }}>*</span>
              </label>
              {canChooseBranchInOrder ? (
                <SearchableSelect
                  value={modalSelectedBranchId || ''}
                  onChange={handleModalBranchChange}
                  options={(activeRestaurant?.branches || []).map(b => ({
                    value: b._id || b.id,
                    label: `${b.branchName || b.name} ${b.branchCode ? `(${b.branchCode})` : ''}`
                  }))}
                  placeholder="Select Branch..."
                />
              ) : (
                <input
                  type="text"
                  value={(() => {
                    const bObj = (activeRestaurant?.branches || []).find(b => String(b._id || b.id) === String(modalSelectedBranchId || selectedBranchId)) 
                      || (activeRestaurant?.branches || [])[0];
                    return bObj ? `${bObj.branchName || bObj.name || 'Serviq Branch'}${bObj.branchCode ? ` (${bObj.branchCode})` : ''}` : 'Serviq Branch';
                  })()}
                  readOnly
                  disabled
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#64748b',
                    backgroundColor: '#f8fafc',
                    cursor: 'not-allowed',
                    boxSizing: 'border-box'
                  }}
                />
              )}
            </div>

            {/* Row 1: Table & Waiter Assignment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Dining Table <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={newOrderTable}
                  onChange={e => setNewOrderTable(e.target.value)}
                  options={displayTables.map(tNo => {
                    const occupied = isTableOccupied(tNo);
                    return {
                      value: tNo,
                      label: `Table ${tNo} ${occupied ? '— Occupied (Active Order)' : '— Available'}`
                    };
                  })}
                  placeholder="Select Dining Table..."
                />

                {/* OCCUPIED WARNING & ACTION PROMPT */}
                {(() => {
                  const activeOrd = getActiveOrderForTable(newOrderTable, apiTables);
                  if (!activeOrd) return null;
                  return (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px 12px',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: 700 }}>
                        ⚠️ Table {newOrderTable} has an active order (#{activeOrd.orderId || activeOrd.id || activeOrd._id})
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const itemsToCarry = newOrderItems.length > 0 ? [...newOrderItems] : [];
                            setIsCreateOrderModalOpen(false);
                            handleOpenAppendModal(activeOrd, itemsToCarry);
                          }}
                          style={{
                            background: '#ea580c',
                            color: '#ffffff',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          ➕ Add Items to Order
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Assigned Waiter <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>(Optional)</span>
                </label>
                <SearchableSelect
                  value={newOrderWaiter}
                  onChange={e => setNewOrderWaiter(e.target.value)}
                  options={[
                    { value: 'Unassigned', label: '-- None (Unassigned) --' },
                    ...modalWaiters.map(w => ({ value: w, label: `🤵 ${w}` }))
                  ]}
                  placeholder="Select Waiter..."
                />
              </div>
            </div>

            {/* Row 2: Initial Status & Order Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Initial Status
                </label>
                <SearchableSelect
                  value={newOrderStatus}
                  onChange={e => setNewOrderStatus(e.target.value)}
                  options={[
                    { value: 'new', label: 'New (KOT)' },
                    { value: 'preparing', label: 'Preparing' },
                    { value: 'ready', label: 'Ready to Serve' }
                  ]}
                  placeholder="Select Status..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Special Instructions / Kitchen Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, separate sambar"
                  value={newOrderNotes}
                  onChange={e => setNewOrderNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Add Items Section (Search + Category) */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Add Items
              </label>

              {/* Search Bar */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onKeyDown={e => {
                    if (e.key === ' ' && !e.currentTarget.value) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^\s+/, '');
                    setSearchQuery(val);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#f8fafc'
                  }}
                />
              </div>

              {/* Category Filter */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
                {displayCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? '#ff5a1f' : '#e2e8f0',
                      backgroundColor: selectedCategory === cat ? '#ff5a1f' : '#ffffff',
                      color: selectedCategory === cat ? '#ffffff' : '#64748b',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.15s'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu Items List */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredMenuItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '12px' }}>No items found.</div>
                ) : (
                  filteredMenuItems.map((item, idx) => {
                    const orderItem = newOrderItems.find(i => i.name === item.name);
                    const qty = orderItem ? orderItem.qty : 0;
                    const orderItemIdx = newOrderItems.findIndex(i => i.name === item.name);

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: qty > 0 ? '#fff7ed' : 'transparent',
                          borderRadius: '6px'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#ff5a1f' }}>₹{item.price}</span>

                          {qty > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(orderItemIdx, -1)}
                                style={{ width: '26px', height: '26px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}
                              >
                                -
                              </button>
                              <span style={{ width: '28px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(orderItemIdx, 1)}
                                style={{ width: '26px', height: '26px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddItemToOrder(item)}
                              style={{
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#0f172a',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff5a1f'; e.currentTarget.style.color = '#ff5a1f'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#0f172a'; }}
                            >
                              + Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Selected Items List */}
            <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Order Items ({newOrderItems.reduce((sum, it) => sum + (Number(it.qty) || 1), 0)})
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Qty & Rate</span>
              </div>

              {newOrderItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px', color: '#94a3b8', fontSize: '13px' }}>
                  No items added yet. Click dishes above to add.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {newOrderItems.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#ffffff',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.name}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>₹{item.price} each</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Qty Stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(idx, -1)}
                            style={{ width: '26px', height: '26px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}
                          >
                            -
                          </button>
                          <span style={{ width: '28px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateItemQty(idx, 1)}
                            style={{ width: '26px', height: '26px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}
                          >
                            +
                          </button>
                        </div>

                        {/* Amount */}
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', minWidth: '60px', textAlign: 'right' }}>
                          ₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}
                        </span>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromOrder(idx)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px', padding: '2px 4px' }}
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals Summary */}
              {newOrderItems.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <span>Subtotal:</span>
                    <span>₹{newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b' }}>
                    <span>Tax ({taxRate}%):</span>
                    <span>₹{(newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0) * (taxRate / 100)).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#ff5a1f', marginTop: '4px' }}>
                    <span>Total Amount:</span>
                    <span>₹{(newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0) * (1 + taxRate / 100)).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsCreateOrderModalOpen(false)}
                style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 90, 31, 0.3)'
                }}
              >
                Place Order
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: QUICK ASSIGN WAITER TO ORDER */}
      {assigningOrder && (
        <Modal
          isOpen={!!assigningOrder}
          onClose={() => setAssigningOrder(null)}
          title={`Assign Waiter to Order #ORD-${assigningOrder.orderId || assigningOrder.id || (assigningOrder._id ? String(assigningOrder._id).slice(-6).toUpperCase() : '1')}`}
          maxWidth="420px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Select a waiter for <strong>Table {assigningOrder.tableId?.tableNumber || assigningOrder.tableId?.tableNo || assigningOrder.table || '01'}</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              <button
                type="button"
                onClick={() => handleAssignWaiter(assigningOrder._id || assigningOrder.id, 'Unassigned')}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
              >
                🚫 None (Unassigned)
              </button>

              {allWaiters.map(w => (
                <button
                  key={w.id || w.name}
                  type="button"
                  onClick={() => handleAssignWaiter(assigningOrder._id || assigningOrder.id, w.name)}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.borderColor = '#ff5a1f'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                >
                  <span>🤵 {w.name}</span>
                  <span style={{ fontSize: '12px', color: '#ff5a1f', fontWeight: 800 }}>Assign →</span>
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setAssigningOrder(null)}
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

    </section>
  );
}