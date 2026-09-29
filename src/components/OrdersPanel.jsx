import React, { useState, useEffect } from 'react';
import apiClient from '../config/index.js';
import MenuApi from '../api/Menu.js';
import BranchApi from '../api/Branch.js';
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
  page: propPage,
  setPage: propSetPage,
  limit: propLimit = 10,
  setLimit: propSetLimit,
  totalPages: propTotalPages,
  totalCount: propTotalCount,
  currentUser = null
}) {
  const [internalPage, setInternalPage] = useState(0);
  const page = propPage !== undefined ? propPage : internalPage;
  const limit = propLimit || 10;

  const setPage = (updater) => {
    const targetVal = typeof updater === 'function' ? updater(page) : updater;
    const clampedVal = Math.max(0, targetVal);
    if (propSetPage) {
      propSetPage(clampedVal);
    }
    setInternalPage(clampedVal);
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
  const [newOrderType, setNewOrderType] = useState('Dine-In'); // Dine-In, Takeaway, Delivery
  const [newOrderTable, setNewOrderTable] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [newOrderWaiter, setNewOrderWaiter] = useState('Unassigned');
  const [newOrderSource, setNewOrderSource] = useState('Admin / POS'); // Admin / POS, Customer Website, Waiter App, Online / Delivery Partner
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('new');
  const [newOrderItems, setNewOrderItems] = useState([]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMenuItemInput, setSelectedMenuItemInput] = useState('');
  const [itemQuantityInput, setItemQuantityInput] = useState(1);
  const [itemNotesInput, setItemNotesInput] = useState('');
  const [itemAddonsInput, setItemAddonsInput] = useState('');

  // Filter states for Order List Table
  const [orderTypeFilter, setOrderTypeFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [selectedTableFilter, setSelectedTableFilter] = useState('All');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('All');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [apiCategories, setApiCategories] = useState([]);
  const [apiMenuItems, setApiMenuItems] = useState([]);
  const [apiTables, setApiTables] = useState(Array.isArray(tables) ? tables : []);
  const [apiBranches, setApiBranches] = useState([]);
  const [modalWaiters, setModalWaiters] = useState([]);
  const [modalSelectedBranchId, setModalSelectedBranchId] = useState('');
  const [taxRate, setTaxRate] = useState(5);

  useEffect(() => {
    if (Array.isArray(tables) && tables.length > 0) {
      setApiTables(tables);
    }
  }, [tables]);

  useEffect(() => {
    const loadBranchesForPanel = async () => {
      try {
        const res = await BranchApi.getBranches({ limit: 10 });
        if (res && res.status && res.response) {
          const branchArray = Array.isArray(res.response) 
            ? res.response 
            : (Array.isArray(res.response.data) ? res.response.data : (res.response.branches || []));
          if (Array.isArray(branchArray)) {
            setApiBranches(branchArray.map(b => ({
              id: b._id || b.id,
              _id: b._id || b.id,
              branchName: b.branchName || b.name,
              branchCode: b.branchCode || b.code
            })));
          }
        }
      } catch (e) {
        console.warn("Failed to load branches in OrdersPanel:", e);
      }
    };
    loadBranchesForPanel();
  }, []);

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

  // Helper for Printing KOT (Kitchen Order Ticket)
  const handlePrintKOT = (ord) => {
    if (!ord) return;
    const popup = window.open('', '_blank', 'width=420,height=600');
    if (!popup) {
      ShowNotifications.showAlertNotification('Popup blocker enabled. Please allow popups to print KOT.', false);
      return;
    }

    const rawId = ord.orderId || ord.id || (ord._id ? String(ord._id).slice(-5).toUpperCase() : '1042');
    const orderIdStr = String(rawId).startsWith('ORD-') ? String(rawId) : (String(rawId).startsWith('#ORD-') ? String(rawId).replace('#', '') : `ORD-${rawId}`);
    const kotNoStr = `KOT-${String(rawId).replace(/[^0-9]/g, '') || '1042'}`;
    const tableStr = ord.orderType === 'Delivery' ? 'Delivery' : (ord.orderType === 'Takeaway' ? 'Takeaway' : (ord.table || (ord.tableId && typeof ord.tableId === 'object' ? (ord.tableId.tableNumber || ord.tableId.tableNo || ord.tableId.name) : ord.tableId) || '12'));
    const dateStr = ord.createdAt ? formatDateDMY(ord.createdAt) : new Date().toLocaleDateString('en-GB');
    const timeStr = ord.time || (ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    const waiterStr = getResolvedWaiterName(ord);

    const items = Array.isArray(ord.items) ? ord.items : [];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>KOT - ${kotNoStr}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 280px; margin: 0 auto; padding: 10px; color: #000; font-size: 12px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .title { font-size: 16px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 12px; font-weight: bold; margin-top: 2px; }
          .info { margin-bottom: 8px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th { text-align: left; border-bottom: 1px solid #000; font-size: 11px; padding: 4px 0; }
          td { padding: 4px 0; font-size: 11px; vertical-align: top; }
          .notes { font-size: 10px; font-style: italic; color: #333; margin-top: 2px; }
          .footer { text-align: center; border-top: 1px dashed #000; margin-top: 12px; padding-top: 8px; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${activeRestaurant?.name || activeRestaurant?.restaurantName || 'XYZ RESTAURANT'}</div>
          <div class="subtitle">KITCHEN ORDER TICKET (KOT)</div>
        </div>
        <div class="info">
          <div class="info-row"><span><strong>KOT No:</strong> ${kotNoStr}</span><span><strong>Order ID:</strong> #${orderIdStr}</span></div>
          <div class="info-row"><span><strong>Table:</strong> ${tableStr}</span><span><strong>Type:</strong> ${ord.orderType || 'Dine-In'}</span></div>
          <div class="info-row"><span><strong>Date:</strong> ${dateStr}</span><span><strong>Time:</strong> ${timeStr}</span></div>
          <div class="info-row"><span><strong>Waiter:</strong> ${waiterStr}</span></div>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 55%;">Item</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 30%; text-align: right;">Notes</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => `
              <tr>
                <td><strong>${it.name || 'Item'}</strong>${it.addOns ? `<div class="notes">+ ${it.addOns}</div>` : ''}</td>
                <td style="text-align: center;"><strong>${it.qty || it.quantity || 1}</strong></td>
                <td style="text-align: right; font-size: 10px;">${it.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${ord.notes ? `<div style="margin-top: 8px; font-size: 11px; border-top: 1px dotted #000; padding-top: 4px;"><strong>Order Note:</strong> ${ord.notes}</div>` : ''}
        <div class="footer">Printed at ${new Date().toLocaleTimeString()}</div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    popup.document.write(html);
    popup.document.close();
  };

  // Helper for Printing Bill (Before Payment)
  const handlePrintBill = (ord) => {
    if (!ord) return;
    const popup = window.open('', '_blank', 'width=450,height=650');
    if (!popup) {
      ShowNotifications.showAlertNotification('Popup blocker enabled. Please allow popups to print Bill.', false);
      return;
    }

    const rawId = ord.orderId || ord.id || (ord._id ? String(ord._id).slice(-5).toUpperCase() : '1042');
    const billNoStr = ord.billNo || `B-${String(rawId).replace(/[^0-9]/g, '') || '1042'}`;
    const tableStr = ord.orderType === 'Delivery' ? 'Delivery' : (ord.orderType === 'Takeaway' ? 'Takeaway' : (ord.table || (ord.tableId && typeof ord.tableId === 'object' ? (ord.tableId.tableNumber || ord.tableId.tableNo || ord.tableId.name) : ord.tableId) || '12'));
    const dateStr = ord.createdAt ? formatDateDMY(ord.createdAt) : new Date().toLocaleDateString('en-GB');
    const timeStr = ord.time || (ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const items = Array.isArray(ord.items) ? ord.items : [];
    const subtotal = items.reduce((sum, it) => sum + (Number(it.price || it.rate || 0) * Number(it.qty || it.quantity || 1)), 0);
    const cgst = parseFloat((subtotal * 0.025).toFixed(2));
    const sgst = parseFloat((subtotal * 0.025).toFixed(2));
    const total = parseFloat((subtotal + cgst + sgst).toFixed(2));

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${billNoStr}</title>
        <style>
          body { font-family: 'Courier New', Courier, monospace; width: 320px; margin: 0 auto; padding: 12px; color: #000; font-size: 12px; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
          .title { font-size: 16px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 11px; margin-top: 2px; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; }
          th { text-align: left; border-bottom: 1px solid #000; font-size: 11px; padding: 4px 0; }
          td { padding: 4px 0; font-size: 11px; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .flex-between { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px; }
          .total-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-top: 4px; }
          .footer { text-align: center; margin-top: 16px; font-size: 11px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${activeRestaurant?.name || activeRestaurant?.restaurantName || 'XYZ Restaurant'}</div>
          <div class="subtitle">${activeRestaurant?.address || 'Address'}</div>
          <div class="subtitle">GST No: ${activeRestaurant?.gstNo || 'GSTIN12345678'}</div>
        </div>
        <div class="info-row">
          <span>Table No: ${tableStr}</span>
          <span>Bill No: ${billNoStr}</span>
        </div>
        <div class="info-row">
          <span>Date: ${dateStr}</span>
          <span>Time: ${timeStr}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Item</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 15%; text-align: right;">Rate</th>
              <th style="width: 20%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => {
              const q = Number(it.qty || it.quantity || 1);
              const r = Number(it.price || it.rate || 0);
              const amt = q * r;
              return `
                <tr>
                  <td>${it.name || 'Item'}</td>
                  <td style="text-align: center;">${q}</td>
                  <td style="text-align: right;">${r.toFixed(0)}</td>
                  <td style="text-align: right;">${amt.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="divider"></div>
        <div class="flex-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div class="flex-between"><span>CGST @2.5%</span><span>${cgst.toFixed(2)}</span></div>
        <div class="flex-between"><span>SGST @2.5%</span><span>${sgst.toFixed(2)}</span></div>
        <div class="divider"></div>
        <div class="total-row"><span>Total Payable</span><span>₹${total.toFixed(2)}</span></div>
        <div class="footer">Thank you, visit again!</div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    popup.document.write(html);
    popup.document.close();
  };

  // Extract menu items from activeRestaurant
  const rawMenu = activeRestaurant?.menu || [];
  const allMenuItems = [];
  if (Array.isArray(rawMenu)) {
    rawMenu.forEach(entry => {
      if (Array.isArray(entry.items)) {
        entry.items.forEach(item => {
          allMenuItems.push({
            _id: item._id || item.id,
            name: item.name,
            price: Number(item.price) || 100,
            category: entry.categoryName || entry.name || item.category || 'General',
            ...item
          });
        });
      } else if (entry && (entry.name || entry._id || entry.id)) {
        allMenuItems.push({
          _id: entry._id || entry.id,
          name: entry.name,
          price: Number(entry.price) || 100,
          category: entry.categoryId?.name || entry.category?.name || entry.category || 'General',
          ...entry
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
    try {
      const isBranchFiltered = branchId && branchId !== 'ALL' && branchId !== 'all';
      const branchParam = isBranchFiltered ? `branchId=${branchId}&` : '';
      const menuParams = { limit: 10 };
      if (isBranchFiltered) {
        menuParams.branchId = branchId;
      }

      const [menuRes, catRes, tableRes, staffRes] = await Promise.all([
        MenuApi.getMenuItems(menuParams).catch(() => null),
        apiClient.get(`/menu/categories?${branchParam}limit=10`).catch(() => null),
        apiClient.get(`/tables?${isBranchFiltered ? `branchId=${branchId}` : ''}`).catch(() => null),
        apiClient.get(`/users?${isBranchFiltered ? `branchId=${branchId}` : ''}`).catch(() => null)
      ]);

      let fetchedMenuItems = [];
      if (menuRes?.status && menuRes.response) {
        const d = menuRes.response;
        if (Array.isArray(d)) fetchedMenuItems = d;
        else if (Array.isArray(d?.data)) fetchedMenuItems = d.data;
        else if (Array.isArray(d?.data?.items)) fetchedMenuItems = d.data.items;
        else if (Array.isArray(d?.items)) fetchedMenuItems = d.items;
        else if (Array.isArray(d?.response?.data)) fetchedMenuItems = d.response.data;
        else if (Array.isArray(d?.response)) fetchedMenuItems = d.response;
      }

      // Always ensure full menu catalog from MenuApi is available so all items from Menu Management appear
      try {
        const allMenuRes = await MenuApi.getMenuItems({ limit: 10 });
        if (allMenuRes?.status && allMenuRes.response) {
          const allD = allMenuRes.response;
          const allArr = Array.isArray(allD)
            ? allD
            : (Array.isArray(allD?.data)
                ? allD.data
                : (Array.isArray(allD?.data?.items)
                    ? allD.data.items
                    : (Array.isArray(allD?.items) ? allD.items : [])));
          if (allArr.length > 0) {
            if (fetchedMenuItems.length === 0 || (!isBranchFiltered && allArr.length > fetchedMenuItems.length)) {
              fetchedMenuItems = allArr;
            } else {
              // Merge missing items
              const existingIds = new Set(fetchedMenuItems.map(i => String(i._id || i.id)));
              allArr.forEach(item => {
                const itemId = String(item._id || item.id);
                if (!existingIds.has(itemId)) {
                  fetchedMenuItems.push(item);
                  existingIds.add(itemId);
                }
              });
            }
          }
        }
      } catch (e) {
        console.warn("Full menu catalog fetch note:", e);
      }

      // Merge in any items from selectableMenuItems / activeRestaurant.menu to guarantee full 12-item list
      if (selectableMenuItems && selectableMenuItems.length > 0) {
        const existingNames = new Set(fetchedMenuItems.map(i => (i.name || '').toLowerCase().trim()));
        selectableMenuItems.forEach(it => {
          if (it.name && !existingNames.has(it.name.toLowerCase().trim())) {
            fetchedMenuItems.push(it);
            existingNames.add(it.name.toLowerCase().trim());
          }
        });
      }

      setApiMenuItems(fetchedMenuItems);

      let fetchedCategories = [];
      if (catRes && (catRes.status === 200 || catRes.status === 201 || catRes.data?.success || catRes.data?.status)) {
        const cd = catRes.data;
        if (Array.isArray(cd)) fetchedCategories = cd;
        else if (Array.isArray(cd?.data)) fetchedCategories = cd.data;
        else if (Array.isArray(cd?.data?.items)) fetchedCategories = cd.data.items;
        else if (Array.isArray(cd?.data?.categories)) fetchedCategories = cd.data.categories;
        else if (Array.isArray(cd?.categories)) fetchedCategories = cd.categories;
        else if (Array.isArray(cd?.response?.data)) fetchedCategories = cd.response.data;
        else if (Array.isArray(cd?.response)) fetchedCategories = cd.response;
      }
      if (fetchedCategories.length === 0) {
        try {
          const fallbackCatRes = await apiClient.get('/menu/categories?limit=1000').catch(() => null);
          if (fallbackCatRes) {
            const fcd = fallbackCatRes.data;
            if (Array.isArray(fcd)) fetchedCategories = fcd;
            else if (Array.isArray(fcd?.data)) fetchedCategories = fcd.data;
            else if (Array.isArray(fcd?.data?.categories)) fetchedCategories = fcd.data.categories;
          }
        } catch (e) {}
      }
      setApiCategories(fetchedCategories);

      let fetchedTables = [];
      if (tableRes && (tableRes.status === 200 || tableRes.data?.success || tableRes.data?.status)) {
        const td = tableRes.data;
        if (Array.isArray(td)) fetchedTables = td;
        else if (Array.isArray(td?.data)) fetchedTables = td.data;
        else if (Array.isArray(td?.data?.tables)) fetchedTables = td.data.tables;
        else if (Array.isArray(td?.tables)) fetchedTables = td.tables;
        if (fetchedTables.length > 0) {
          setApiTables(fetchedTables);
        }
      }

      // Find first available table if possible
      const availableT = fetchedTables.find(t => !isTableOccupied(t.tableNumber || t.tableNo || t.name, fetchedTables));
      const firstTable = availableT 
        ? (availableT.tableNumber || availableT.tableNo || availableT.name)
        : (fetchedTables.length > 0 ? (fetchedTables[0].tableNumber || fetchedTables[0].tableNo) : (displayTables.length > 0 ? displayTables[0] : ''));
      
      setNewOrderTable(firstTable);

      let staffListToUse = staff;
      if (staffRes && (staffRes.status === 200 || staffRes.data?.success || staffRes.data?.status)) {
        const sd = staffRes.data;
        if (Array.isArray(sd)) staffListToUse = sd;
        else if (Array.isArray(sd?.data)) staffListToUse = sd.data;
        else if (Array.isArray(sd?.data?.staff)) staffListToUse = sd.data.staff;
        else if (Array.isArray(sd?.staff)) staffListToUse = sd.staff;
      }
      const filteredStaff = staffListToUse.filter(s => !isBranchFiltered || s.branchId === branchId || s.branchId?._id === branchId || s.branch === branchId || s.branch?._id === branchId);
      const staffWaitersList = filteredStaff.filter(isOnlyWaiter).map(s => s.name);
      setModalWaiters(Array.from(new Set(staffWaitersList)));

    } catch (error) {
      console.error("Error fetching order creation data:", error);
      setNewOrderTable(displayTables.length > 0 ? displayTables[0] : '');
      setModalWaiters([]);
    }
  };

  useEffect(() => {
    const targetBranchId = (selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : 'ALL';
    fetchModalDataForBranch(targetBranchId);
  }, [selectedBranchId]);

  const handleOpenCreateOrderModal = async () => {
    const defaultBranchId = activeRestaurant?.branches?.[0]?.id || activeRestaurant?.branches?.[0]?._id;
    const targetBranchId = (selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : (modalSelectedBranchId || defaultBranchId || getFallbackBranchId());
    setModalSelectedBranchId(targetBranchId);
    await fetchModalDataForBranch((selectedBranchId && selectedBranchId !== 'ALL') ? selectedBranchId : 'ALL');

    setNewOrderType('Dine-In');
    setCustomerName('');
    setCustomerMobile('');
    setDeliveryAddress('');
    setNewOrderSource('Admin / POS');
    setNewOrderWaiter('Unassigned');
    setNewOrderNotes('');
    setNewOrderStatus('new');
    setNewOrderItems([]);
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedMenuItemInput('');
    setItemQuantityInput(1);
    setItemNotesInput('');
    setItemAddonsInput('');
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
    const existingIndex = newOrderItems.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase() && !i.notes && !i.addOns);
    if (existingIndex > -1) {
      const updated = [...newOrderItems];
      updated[existingIndex].qty += 1;
      setNewOrderItems(updated);
    } else {
      setNewOrderItems([...newOrderItems, {
        _id: item._id || item.id || "",
        id: item.id || item._id || "",
        name: item.name,
        category: item.category || 'General',
        qty: 1,
        price: Number(item.price) || 100,
        notes: '',
        addOns: ''
      }]);
    }
  };

  const handleAddItemFromForm = () => {
    if (!selectedMenuItemInput) {
      ShowNotifications.showAlertNotification("Please select a Menu Item.", false);
      return;
    }
    const foundItem = displayMenuItems.find(i => String(i._id || i.id || i.name) === String(selectedMenuItemInput)) ||
      filteredMenuItems.find(i => String(i._id || i.id || i.name) === String(selectedMenuItemInput));
    
    if (!foundItem) {
      ShowNotifications.showAlertNotification("Selected menu item not found.", false);
      return;
    }

    const qty = Math.max(1, parseInt(itemQuantityInput, 10) || 1);
    const notes = (itemNotesInput || '').trim();
    const addOns = (itemAddonsInput || '').trim();

    // Check if item with same name, notes and add-ons already exists
    const existingIndex = newOrderItems.findIndex(i =>
      i.name.toLowerCase() === foundItem.name.toLowerCase() &&
      (i.notes || '').toLowerCase() === notes.toLowerCase() &&
      (i.addOns || '').toLowerCase() === addOns.toLowerCase()
    );

    if (existingIndex > -1) {
      const updated = [...newOrderItems];
      updated[existingIndex].qty += qty;
      setNewOrderItems(updated);
    } else {
      setNewOrderItems([
        ...newOrderItems,
        {
          _id: foundItem._id || foundItem.id || "",
          id: foundItem.id || foundItem._id || "",
          name: foundItem.name,
          category: foundItem.category || 'General',
          price: Number(foundItem.price) || 0,
          qty: qty,
          notes: notes,
          addOns: addOns
        }
      ]);
    }

    // Reset item selection inputs for next item
    setSelectedMenuItemInput('');
    setItemQuantityInput(1);
    setItemNotesInput('');
    setItemAddonsInput('');
    ShowNotifications.showAlertNotification(`Added ${qty}x ${foundItem.name} to order`, true);
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

    if (newOrderType === 'Dine-In' && !newOrderTable) {
      ShowNotifications.showAlertNotification("Please select a dining table for Dine-In order.", false);
      return;
    }

    if (newOrderType === 'Delivery') {
      if (!customerName.trim()) {
        ShowNotifications.showAlertNotification("Customer Name is required for Delivery.", false);
        return;
      }
      if (!customerMobile.trim()) {
        ShowNotifications.showAlertNotification("Customer Mobile Number is required for Delivery.", false);
        return;
      }
      if (!deliveryAddress.trim()) {
        ShowNotifications.showAlertNotification("Delivery Address is required for Delivery.", false);
        return;
      }
    }

    // Check if selected table is occupied before sending (for Dine-In)
    if (newOrderType === 'Dine-In') {
      const activeOrdOnSelectedTable = getActiveOrderForTable(newOrderTable, apiTables);
      if (activeOrdOnSelectedTable) {
        ShowNotifications.showAlertNotification(`Table ${newOrderTable} already has an active order. Switching to Add Items mode...`, false);
        const itemsToCarry = [...newOrderItems];
        setIsCreateOrderModalOpen(false);
        handleOpenAppendModal(activeOrdOnSelectedTable, itemsToCarry);
        return;
      }
    }

    const subtotal = newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
    const tax = parseFloat((subtotal * (taxRate / 100)).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));

    const table = newOrderType === 'Dine-In' ? apiTables.find(t => String(t.tableNumber || t.tableNo) === String(newOrderTable)) : null;
    const waiter = staff.find(w => w.name === newOrderWaiter);

    const payload = {
      orderType: newOrderType,
      tableId: table ? table._id : undefined,
      table: newOrderType === 'Dine-In' ? (newOrderTable || '01') : (newOrderType === 'Takeaway' ? 'Takeaway' : 'Delivery'),
      customerName: newOrderType === 'Delivery' ? (customerName.trim() || undefined) : undefined,
      customerMobile: newOrderType === 'Delivery' ? (customerMobile.trim() || undefined) : undefined,
      deliveryAddress: newOrderType === 'Delivery' ? (deliveryAddress.trim() || undefined) : undefined,
      orderSource: newOrderSource,
      waiterId: waiter ? waiter._id : undefined,
      waiter: newOrderWaiter,
      notes: newOrderNotes,
      status: newOrderStatus,
      items: newOrderItems.map(item => ({
        menuId: item._id || item.id || "",
        name: item.name,
        qty: item.qty,
        price: item.price,
        addOns: item.addOns || "",
        notes: item.notes || "",
        status: newOrderStatus
      })),
      subtotal,
      tax,
      total,
      branchId: modalSelectedBranchId || getFallbackBranchId()
    };

    // Table check: only applicable if Dine-In and no table identifier provided
    if (newOrderType === 'Dine-In' && !payload.table && !payload.tableId) {
      ShowNotifications.showAlertNotification("Please select a dining table for Dine-In order.", false);
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

  // 1. Apply Status Filter ('All', 'New', 'Preparing', 'Ready', 'Served', 'Completed', 'Cancelled')
  if (orderFilter && orderFilter.toLowerCase() !== 'all') {
    filteredOrders = filteredOrders.filter(ord => {
      const s = (ord.status || 'new').toLowerCase();
      return s === orderFilter.toLowerCase();
    });
  }

  // 2. Apply Order Type Filter ('All', 'Dine-In', 'Takeaway', 'Delivery')
  if (orderTypeFilter && orderTypeFilter.toLowerCase() !== 'all') {
    filteredOrders = filteredOrders.filter(ord => {
      const t = (ord.orderType || 'Dine-In').toLowerCase();
      return t === orderTypeFilter.toLowerCase();
    });
  }

  // 3. Apply Payment Status Filter ('All', 'Unpaid', 'Paid')
  if (paymentStatusFilter && paymentStatusFilter.toLowerCase() !== 'all') {
    filteredOrders = filteredOrders.filter(ord => {
      const isPaid = (ord.billingStatus || ord.paymentStatus || '').toLowerCase() === 'paid' || ord.isPaid === true;
      if (paymentStatusFilter.toLowerCase() === 'paid') return isPaid;
      if (paymentStatusFilter.toLowerCase() === 'unpaid') return !isPaid;
      return true;
    });
  }

  // 4. Apply Dining Table Filter
  if (selectedTableFilter && selectedTableFilter !== 'All') {
    filteredOrders = filteredOrders.filter(ord => {
      const tbl = String(ord.table || (ord.tableId && typeof ord.tableId === 'object' ? (ord.tableId.tableNumber || ord.tableId.tableNo) : ord.tableId) || '').replace(/^Table\s*/i, '').trim();
      const selTbl = String(selectedTableFilter).replace(/^Table\s*/i, '').trim();
      return tbl === selTbl;
    });
  }

  // 5. Resolve active selected waiter filter & apply Waiter Filter
  const currentSelectedWaiterId = typeof selectedWaiterFilter === 'object' && selectedWaiterFilter !== null
    ? (selectedWaiterFilter.id || selectedWaiterFilter.name || 'All Waiters')
    : (selectedWaiterFilter || 'All Waiters');
  const currentSelectedWaiterName = typeof selectedWaiterFilter === 'object' && selectedWaiterFilter !== null
    ? (selectedWaiterFilter.name || selectedWaiterFilter.id || 'All Waiters')
    : (selectedWaiterFilter || 'All Waiters');

  if (currentSelectedWaiterId && currentSelectedWaiterId !== 'All Waiters' && currentSelectedWaiterId !== 'All') {
    filteredOrders = filteredOrders.filter(ord => {
      const resolvedName = getResolvedWaiterName(ord);
      if (currentSelectedWaiterId === 'unassigned' || String(currentSelectedWaiterId).toLowerCase() === 'unassigned') {
        return !resolvedName || resolvedName === 'Unassigned' || resolvedName === 'None' || resolvedName === '-';
      }
      return resolvedName.toLowerCase() === (currentSelectedWaiterName || '').toLowerCase();
    });
  }

  // 6. Apply Search Order ID / Customer / Table
  if (searchOrderId && searchOrderId.trim()) {
    const q = searchOrderId.toLowerCase().trim();
    filteredOrders = filteredOrders.filter(ord => {
      const rawId = String(ord.orderId || ord.id || ord._id || '').toLowerCase();
      const cName = String(ord.customerName || ord.customer?.name || '').toLowerCase();
      const cPhone = String(ord.customerMobile || ord.customerPhone || ord.customer?.mobile || '').toLowerCase();
      const tbl = String(ord.table || '').toLowerCase();
      return rawId.includes(q) || cName.includes(q) || cPhone.includes(q) || tbl.includes(q);
    });
  }

  // 7. Apply Date Range Filter
  if (dateRangeFilter && dateRangeFilter !== 'All') {
    const now = new Date();
    filteredOrders = filteredOrders.filter(ord => {
      const ordDate = ord.createdAt ? new Date(ord.createdAt) : null;
      if (!ordDate || isNaN(ordDate.getTime())) return true;

      if (dateRangeFilter === 'Today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const d = new Date(ordDate.getFullYear(), ordDate.getMonth(), ordDate.getDate());
        return d.getTime() === today.getTime();
      } else if (dateRangeFilter === 'Yesterday') {
        const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const d = new Date(ordDate.getFullYear(), ordDate.getMonth(), ordDate.getDate());
        return d.getTime() === yest.getTime();
      } else if (dateRangeFilter === 'This Week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return ordDate >= sevenDaysAgo;
      } else if (dateRangeFilter === 'This Month') {
        return ordDate.getMonth() === now.getMonth() && ordDate.getFullYear() === now.getFullYear();
      } else if (dateRangeFilter === 'Custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          if (ordDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (ordDate > end) return false;
        }
      }
      return true;
    });
  }

  const isServerPaginated = (propTotalCount || 0) > 0 && sourceOrders.length <= limit && (propTotalCount || 0) > sourceOrders.length && filteredOrders.length === sourceOrders.length;

  const effectiveTotalCount = isServerPaginated ? (propTotalCount || 0) : filteredOrders.length;
  const effectiveTotalPages = isServerPaginated
    ? (propTotalPages || Math.max(1, Math.ceil(effectiveTotalCount / limit)))
    : Math.max(1, Math.ceil(effectiveTotalCount / limit));

  const paginatedOrders = isServerPaginated
    ? filteredOrders
    : filteredOrders.slice(page * limit, (page + 1) * limit);

  const getOrderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = page + 1;
    const total = Math.max(1, effectiveTotalPages || 1);
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

  useEffect(() => {
    setPage(0);
  }, [orderFilter, selectedWaiterFilter]);

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
        {/* Top Header Card */}
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
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.15s ease'
              }}
              title="Back to Orders List"
            >
              ←
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                  Create Order
                </h2>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: '#fff7ed',
                  color: '#ea580c',
                  border: '1px solid #fed7aa'
                }}>
                  {newOrderType}
                </span>
              </div>
              <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Set up order details, pick menu items with custom notes & add-ons, and place order.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsCreateOrderModalOpen(false)}
              style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
            >
              Cancel
            </button>
          </div>
        </div>

        <form onSubmit={handleCreateOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* SECTION 1: ORDER INFORMATION */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>📋</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                    Order Information
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Order Type, Table / Customer information, Assigned Waiter, and Order Source
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                Step 1 of 2
              </span>
            </div>

            {/* Order Type * ( Dine-In, Takeaway, Delivery ) */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Order Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { id: 'Dine-In', label: 'Dine-In', icon: '🍽️', desc: 'Table seating & dining' },
                  { id: 'Takeaway', label: 'Takeaway', icon: '🛍️', desc: 'Self pickup parcel' },
                  { id: 'Delivery', label: 'Delivery', icon: '🛵', desc: 'Direct doorstep delivery' }
                ].map(type => {
                  const isSelected = newOrderType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setNewOrderType(type.id)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #ff5a1f' : '1px solid #e2e8f0',
                        background: isSelected ? '#fff7ed' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '4px',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 4px 12px rgba(255, 90, 31, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{type.icon}</span>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: isSelected ? '#ff5a1f' : '#0f172a' }}>
                          {type.label}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: isSelected ? '#ea580c' : '#64748b' }}>
                        {type.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Details Grid: Dining Table (only for Dine-In), Assigned Waiter, Order Source, Branch */}
            <div style={{ display: 'grid', gridTemplateColumns: newOrderType === 'Dine-In' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '16px' }}>

              {/* Dining Table * (Show ONLY for Dine-In) */}
              {newOrderType === 'Dine-In' && (
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
                          label: `${t.name ? t.name : `Table ${tVal}`} ${occupied ? '— Occupied (Active Order)' : '— Available'}`
                        };
                      })
                    ) : (
                      displayTables.map(tNo => {
                        const occupied = isTableOccupied(tNo);
                        return {
                          value: tNo,
                          label: `Table ${tNo} ${occupied ? '— Occupied (Active Order)' : '— Available'}`
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
                        marginTop: '8px',
                        padding: '10px 12px',
                        background: '#fff7ed',
                        border: '1.5px solid #fed7aa',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: 700 }}>
                          ⚠️ Table {newOrderTable} currently has an active order (#{activeOrd.orderId || activeOrd.id || (activeOrd._id ? String(activeOrd._id).slice(-6).toUpperCase() : '1')})
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                              padding: '6px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <PlusIcon size={12} color="#ffffff" /> Add Items to Order
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsCreateOrderModalOpen(false);
                              handleOpenEditOrder(activeOrd);
                            }}
                            style={{
                              background: '#ffffff',
                              color: '#ea580c',
                              border: '1px solid #fed7aa',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ✏️ Edit Order
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Assigned Waiter */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Assigned Waiter
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

              {/* Order Source * */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Order Source <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={newOrderSource}
                  onChange={e => setNewOrderSource(e.target.value)}
                  options={[
                    { value: 'Admin / POS', label: 'Admin / POS' },
                    { value: 'Customer Website', label: 'Customer Website' },
                    { value: 'Waiter App', label: 'Waiter App' },
                    { value: 'Online / Delivery Partner', label: 'Online / Delivery Partner' }
                  ]}
                  placeholder="Select Order Source..."
                />
              </div>
            </div>

            {/* Customer Details: Rendered ONLY when Order Type is Delivery */}
            {newOrderType === 'Delivery' && (
              <div style={{
                background: '#eff6ff',
                border: '1.5px solid #bfdbfe',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🛵</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}>
                    Delivery Details (Required for Delivery)
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e3a8a', marginBottom: '6px' }}>
                      Customer Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Enter customer full name..."
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #93c5fd',
                        fontSize: '13px',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e3a8a', marginBottom: '6px' }}>
                      Customer Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerMobile}
                      onChange={e => setCustomerMobile(e.target.value.replace(/[^0-9+]/g, ''))}
                      placeholder="e.g. +91 9876543210"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #93c5fd',
                        fontSize: '13px',
                        outline: 'none',
                        background: '#ffffff',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1e3a8a', marginBottom: '6px' }}>
                    Delivery Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Enter full delivery address with door number, street, landmark, and pincode..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #93c5fd',
                      fontSize: '13px',
                      outline: 'none',
                      background: '#ffffff',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Additional Info: Branch & Kitchen Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Branch
                </label>
                {(() => {
                  const allBranchesList = apiBranches.length > 0 ? apiBranches : (activeRestaurant?.branches || []);
                  const isLocked = !isAdmin || (selectedBranchId && selectedBranchId !== 'ALL');
                  const headerBranchObj = (selectedBranchId && selectedBranchId !== 'ALL')
                    ? allBranchesList.find(b => String(b._id || b.id) === String(selectedBranchId) || String(b.branchCode) === String(selectedBranchId))
                    : null;
                  const currentBranchObj = headerBranchObj 
                    || (modalSelectedBranchId ? (allBranchesList.find(b => String(b._id || b.id) === String(modalSelectedBranchId)) || allBranchesList.find(b => String(b.branchCode) === String(modalSelectedBranchId))) : null);
                  let effectiveVal = currentBranchObj ? (currentBranchObj._id || currentBranchObj.id) : (modalSelectedBranchId || '');
                  if (effectiveVal === 'ALL' || effectiveVal === 'all' || effectiveVal === 'MAIN' || effectiveVal === 'main') {
                    effectiveVal = '';
                  }

                  const branchOptions = [
                    { value: '', label: activeRestaurant?.name || activeRestaurant?.restaurantName || activeRestaurant?.businessName || 'Main Branch' },
                    ...allBranchesList.map(b => ({
                      value: b._id || b.id,
                      label: `${b.branchName || b.name || 'Branch'}${b.branchCode ? ` (${b.branchCode})` : ''}`
                    }))
                  ];

                  return (
                    <div>
                      <SearchableSelect
                        value={effectiveVal}
                        onChange={handleModalBranchChange}
                        isDisabled={isLocked}
                        options={branchOptions}
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

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  General Order / Kitchen Notes
                </label>
                <input
                  type="text"
                  value={newOrderNotes}
                  onChange={e => setNewOrderNotes(e.target.value)}
                  placeholder="e.g. VIP Guest, Priority Order"
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
            </div>
          </div>

          {/* SECTION 2: MENU / ITEM SELECTION */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🍲</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                    Menu / Item Selection
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Select category, search or pick dish, specify quantity, notes & add-ons, then click "+ Add Item to Order"
                  </p>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>
                Step 2 of 2
              </span>
            </div>

            {/* Row 1: Category, Search Item, Menu Item * */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 2fr', gap: '14px' }}>
              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Category
                </label>
                <SearchableSelect
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={displayCategories.map(c => ({
                    value: c,
                    label: c === 'All' ? 'All Categories' : c
                  }))}
                  placeholder="Filter Category..."
                />
              </div>

              {/* Search Item */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Search Item
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search dishes by name..."
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px 0 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px', pointerEvents: 'none' }}>
                    🔍
                  </span>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Menu Item * */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Menu Item <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={selectedMenuItemInput}
                  onChange={e => setSelectedMenuItemInput(e.target.value)}
                  options={filteredMenuItems.map(item => ({
                    value: item._id || item.id || item.name,
                    label: `${item.name} — ₹${Number(item.price || 0).toFixed(2)}`
                  }))}
                  placeholder="Select Menu Item..."
                />
              </div>
            </div>

            {/* Row 2: Quantity *, Item Notes, Add ons, + Add Item button */}
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1.5fr 1.5fr auto', gap: '14px', alignItems: 'flex-end' }}>
              {/* Quantity * */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Quantity <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', height: '38px', background: '#ffffff', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => setItemQuantityInput(prev => Math.max(1, prev - 1))}
                    style={{ width: '36px', height: '100%', border: 'none', background: '#f8fafc', color: '#0f172a', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantityInput}
                    onChange={e => setItemQuantityInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    style={{ width: '100%', border: 'none', textAlign: 'center', fontSize: '14px', fontWeight: 800, color: '#0f172a', outline: 'none', MozAppearance: 'textfield' }}
                  />
                  <button
                    type="button"
                    onClick={() => setItemQuantityInput(prev => prev + 1)}
                    style={{ width: '36px', height: '100%', border: 'none', background: '#f8fafc', color: '#0f172a', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Item Notes */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Item Notes
                </label>
                <input
                  type="text"
                  value={itemNotesInput}
                  onChange={e => setItemNotesInput(e.target.value)}
                  placeholder="Example: Less spicy, No onion, "
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Add-ons */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Add-ons
                </label>
                <input
                  type="text"
                  value={itemAddonsInput}
                  onChange={e => setItemAddonsInput(e.target.value)}
                  placeholder="e.g. Extra cheese, Mayo dip"
                  style={{
                    width: '100%',
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* + Add Item Button */}
              <div>
                <button
                  type="button"
                  onClick={handleAddItemFromForm}
                  style={{
                    background: '#ff5a1f',
                    color: '#ffffff',
                    border: 'none',
                    height: '38px',
                    padding: '0 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
                >
                  <PlusIcon size={14} color="#ffffff" /> Add Item to Order
                </button>
              </div>
            </div>

            {/* Quick-Select Dishes Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>
                  Quick Pick from {selectedCategory === 'All' ? 'All Dishes' : selectedCategory} ({filteredMenuItems.length} items)
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Click card to pick into form • Click '+' to add directly
                </span>
              </div>
              <div style={{
                maxHeight: '160px',
                overflowY: 'auto',
                border: '1px solid #f1f5f9',
                borderRadius: '10px',
                padding: '8px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                gap: '8px',
                background: '#f8fafc'
              }}>
                {filteredMenuItems.slice(0, 30).map(item => {
                  const itemVal = item._id || item.id || item.name;
                  const isCurrentPick = selectedMenuItemInput === itemVal;
                  return (
                    <div
                      key={itemVal}
                      onClick={() => setSelectedMenuItemInput(itemVal)}
                      style={{
                        background: isCurrentPick ? '#fff7ed' : '#ffffff',
                        border: isCurrentPick ? '1.5px solid #ff5a1f' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: isCurrentPick ? '#ea580c' : '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                          ₹{Number(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddItemToOrder(item);
                        }}
                        title="Quick add 1 qty"
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#ff5a1f',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '13px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: SELECTED ITEMS TABLE */}
          {/* Columns: S.No, Item, Quantity, Unit Price, Add-ons, Item Notes, Item Total, Actions */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px 28px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>🛒</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                    Selected Items
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Review chosen dishes, adjust quantities, verify add-ons and special notes
                  </p>
                </div>
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '20px',
                background: newOrderItems.length > 0 ? '#fff7ed' : '#f1f5f9',
                border: newOrderItems.length > 0 ? '1px solid #fed7aa' : '1px solid #e2e8f0',
                color: newOrderItems.length > 0 ? '#ff5a1f' : '#64748b'
              }}>
                {newOrderItems.reduce((acc, it) => acc + (it.qty || 1), 0)} Items Added
              </span>
            </div>

            {newOrderItems.length === 0 ? (
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1.5px dashed #cbd5e1'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍲</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  No items added to this order yet
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Select a Category & Menu Item above, set Quantity, Item Notes and Add-ons, then click <strong>"+ Add Item to Order"</strong>.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', width: '50px', textAlign: 'center', verticalAlign: 'middle' }}>S.No</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', textAlign: 'left', verticalAlign: 'middle' }}>Item</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', width: '130px', textAlign: 'center', verticalAlign: 'middle' }}>Quantity</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', width: '100px', textAlign: 'right', verticalAlign: 'middle' }}>Unit Price</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', minWidth: '130px', textAlign: 'left', verticalAlign: 'middle' }}>Add-ons</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', minWidth: '140px', textAlign: 'left', verticalAlign: 'middle' }}>Item Notes</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', width: '110px', textAlign: 'right', verticalAlign: 'middle' }}>Item Total</th>
                      <th style={{ padding: '12px 14px', fontWeight: 800, color: '#475569', width: '70px', textAlign: 'center', verticalAlign: 'middle' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newOrderItems.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: idx < newOrderItems.length - 1 ? '1px solid #f1f5f9' : 'none',
                          background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd'
                        }}
                      >
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#64748b', verticalAlign: 'middle' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>
                            {item.name}
                          </div>
                          {item.category && (
                            <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff', overflow: 'hidden' }}>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(idx, -1)}
                              style={{ width: '26px', height: '26px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: 800, fontSize: '14px', color: '#0f172a' }}
                            >
                              -
                            </button>
                            <span style={{ minWidth: '28px', textAlign: 'center', fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                              {item.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(idx, 1)}
                              style={{ width: '26px', height: '26px', border: 'none', background: '#f8fafc', cursor: 'pointer', fontWeight: 800, fontSize: '14px', color: '#0f172a' }}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#475569', verticalAlign: 'middle' }}>
                          ₹{Number(item.price || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>
                          {item.addOns ? (
                            <span style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              {item.addOns}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>
                          {item.notes ? (
                            <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', color: '#c2410c', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}>
                              📝 {item.notes}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '13px', verticalAlign: 'middle' }}>
                          ₹{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(2)}
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromOrder(idx)}
                            title="Remove item"
                            style={{
                              border: 'none',
                              background: '#fef2f2',
                              color: '#ef4444',
                              width: '30px',
                              height: '30px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#ffffff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                          >
                            <TrashIcon size={14} color="currentColor" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial Totals Calculation */}
            {newOrderItems.length > 0 && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                marginTop: '8px'
              }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Subtotal</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }} />
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>GST ({taxRate}%)</span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{(newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0) * (taxRate / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }} />
                  <div>
                    <span style={{ fontSize: '11px', color: '#ea580c', textTransform: 'uppercase', fontWeight: 800, display: 'block' }}>Total Payable</span>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#ff5a1f' }}>
                      ₹{calculateNewOrderTotal()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions (Cancel, Place Order) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsCreateOrderModalOpen(false)}
                style={{ padding: '11px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  background: '#ff5a1f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 32px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 12px rgba(255, 90, 31, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
                onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
              >
                <span>Place Order</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </form>
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
                    height: '38px',
                    padding: '0 14px',
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
                    height: '38px',
                    padding: '0 14px',
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

        {/* FILTER BAR ROW WITH ALL 7 FILTERS */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '24px',
          background: '#f8fafc',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#000000', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Orders list
            </h2>
            <button
              type="button"
              onClick={handleOpenCreateOrderModal}
              style={{
                background: '#ff5a1f',
                color: '#ffffff',
                border: 'none',
                padding: '9px 20px',
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
              <span>+ Create Order</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
            {/* 1. Search Order ID / Customer / Table */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Search Order ID</label>
              <input
                type="text"
                placeholder="Order ID / Customer / Table..."
                value={searchOrderId}
                onChange={e => setSearchOrderId(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* 2. Order Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Order Status</label>
              <SearchableSelect
                value={orderFilter || 'All'}
                onChange={e => setOrderFilter && setOrderFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Statuses' },
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

            {/* 3. Order Type Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Order Type</label>
              <SearchableSelect
                value={orderTypeFilter}
                onChange={e => setOrderTypeFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Types' },
                  { value: 'Dine-In', label: 'Dine-In' },
                  { value: 'Takeaway', label: 'Takeaway' },
                  { value: 'Delivery', label: 'Delivery' }
                ]}
                placeholder="Select Type..."
              />
            </div>

            {/* 4. Dining Table Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Dining Table</label>
              <SearchableSelect
                value={selectedTableFilter}
                onChange={e => setSelectedTableFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Tables' },
                  ...(apiTables.length > 0
                    ? apiTables.map(t => ({
                        value: t.tableNumber || t.tableNo || t.name,
                        label: `Table ${t.tableNumber || t.tableNo || t.name}`
                      }))
                    : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => ({ value: String(n), label: `Table ${n}` })))
                ]}
                placeholder="Select Table..."
              />
            </div>

            {/* 5. Assigned Waiter Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Assigned Waiter</label>
              <SearchableSelect
                value={currentSelectedWaiterName}
                onChange={e => {
                  const val = e.target.value;
                  const found = allWaiters.find(w => w.name === val) || { id: val, name: val };
                  if (setSelectedWaiterFilter) setSelectedWaiterFilter(val === 'All Waiters' ? 'All Waiters' : found);
                }}
                options={[
                  { value: 'All Waiters', label: 'All Waiters' },
                  { value: 'Unassigned', label: 'Unassigned' },
                  ...allWaiters.map(w => ({ value: w.name, label: w.name }))
                ]}
                placeholder="Select Waiter..."
              />
            </div>

            {/* 6. Payment Status Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Payment Status</label>
              <SearchableSelect
                value={paymentStatusFilter}
                onChange={e => setPaymentStatusFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Payment' },
                  { value: 'Unpaid', label: 'Unpaid' },
                  { value: 'Paid', label: 'Paid' }
                ]}
                placeholder="Select Payment..."
              />
            </div>

            {/* 7. Date Range Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Date Range</label>
              <SearchableSelect
                value={dateRangeFilter}
                onChange={e => setDateRangeFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Time' },
                  { value: 'Today', label: 'Today' },
                  { value: 'Yesterday', label: 'Yesterday' },
                  { value: 'This Week', label: 'This Week' },
                  { value: 'This Month', label: 'This Month' },
                  { value: 'Custom', label: 'Custom' }
                ]}
                placeholder="Select Range..."
              />
            </div>
          </div>

          {dateRangeFilter === 'Custom' && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>Start Date</label>
                <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>End Date</label>
                <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
              </div>
            </div>
          )}
        </div>

        {/* ORDERS TABLE WITH ALL 13 REQUIRED COLUMNS */}
        <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px' }}>
          <table style={{ width: '100%', minWidth: '1580px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', textAlign: 'center', width: '50px', verticalAlign: 'middle' }}>
                  S.NO
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', textAlign: 'left', minWidth: '130px', verticalAlign: 'middle' }}>
                  ORDER ID
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px', verticalAlign: 'middle' }}>
                  ORDER TYPE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '110px', verticalAlign: 'middle' }}>
                  TABLE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '160px', verticalAlign: 'middle' }}>
                  CUSTOMER
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '130px', verticalAlign: 'middle' }}>
                  ITEMS
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '110px', verticalAlign: 'middle' }}>
                  ORDER DATE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '130px', verticalAlign: 'middle' }}>
                  TIME / ELAPSED
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '160px', verticalAlign: 'middle' }}>
                  ASSIGNED WAITER
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '110px', verticalAlign: 'middle' }}>
                  AMOUNT
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px', verticalAlign: 'middle' }}>
                  PAYMENT STATUS
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px', verticalAlign: 'middle' }}>
                  ORDER STATUS
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', width: '220px', minWidth: '220px', verticalAlign: 'middle' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((ord, index) => {
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
                const orderTypeVal = ord.orderType || 'Dine-In';
                const waiterName = getResolvedWaiterName(ord);
                const tableName = ord.tableId?.tableNumber || ord.tableId?.tableNo || ord.table || (orderTypeVal === 'Dine-In' ? '01' : '-');
                const custName = ord.customerName || ord.customer?.name || (orderTypeVal === 'Delivery' ? 'Delivery Customer' : '-');
                const custPhone = ord.customerMobile || ord.customerPhone || ord.customer?.mobile || '';

                let displayId = ord.orderId || ord.id || String(index);
                if (displayId.startsWith('ORD-')) displayId = displayId.replace('ORD-', '');

                const parsedDate = ord.createdAt ? new Date(ord.createdAt) : null;
                const formattedDate = parsedDate && !isNaN(parsedDate) ? formatDateDMY(parsedDate) : '-';
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
                      borderBottom: index < paginatedOrders.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s',
                      backgroundColor: '#ffffff'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                  >
                    {/* 1. S.NO */}
                    <td style={{ padding: '14px 12px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b', verticalAlign: 'middle' }}>
                      {page * limit + index + 1}
                    </td>

                    {/* 2. ORDER ID */}
                    <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap', textAlign: 'left', verticalAlign: 'middle' }}>
                      #ORD-{displayId}
                    </td>

                    {/* 3. ORDER TYPE */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: orderTypeVal === 'Dine-In' ? '#eff6ff' : (orderTypeVal === 'Delivery' ? '#fdf4ff' : '#fff7ed'),
                        color: orderTypeVal === 'Dine-In' ? '#2563eb' : (orderTypeVal === 'Delivery' ? '#c026d3' : '#ea580c')
                      }}>
                        {orderTypeVal}
                      </span>
                    </td>

                    {/* 4. TABLE */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      {orderTypeVal === 'Dine-In' ? (
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
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>-</span>
                      )}
                    </td>

                    {/* 5. CUSTOMER */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', textAlign: 'left', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{custName}</div>
                      {custPhone && <div style={{ fontSize: '11px', color: '#64748b' }}>{custPhone}</div>}
                    </td>

                    {/* 6. ITEMS */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', maxWidth: '240px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
                        {itemSummary}
                      </div>
                    </td>

                    {/* 7. ORDER DATE */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        {formattedDate}
                      </div>
                    </td>

                    {/* 8. ORDER TIME / ELAPSED */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        {timeStr}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', marginTop: '2px' }}>
                        {timeAgoStr}
                      </div>
                    </td>

                    {/* 9. ASSIGNED WAITER */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
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

                    {/* 10. AMOUNT */}
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      ₹{parseFloat(ord.total || 0).toFixed(2)}
                    </td>

                    {/* 11. PAYMENT STATUS */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
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

                    {/* 12. ORDER STATUS */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
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
                      {status === 'cancelled' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                          Cancelled
                        </span>
                      )}
                      {status === 'new' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
                          New
                        </span>
                      )}
                    </td>

                    {/* 13. ACTIONS: View(Print Bill), Edit, Send to Kitchen, Print KOT, Cancel (Icon Only) */}
                    <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap', width: '220px', minWidth: '220px', boxSizing: 'border-box', verticalAlign: 'middle' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'nowrap' }}>

                        {/* View (Print Bill) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrintBill(ord);
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#eff6ff',
                            border: '1px solid #bfdbfe',
                            color: '#2563eb',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                          title="View & Print Bill"
                        >
                          <EyeIcon size={16} color="#2563eb" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          disabled={isPaid}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isPaid) handleOpenEditOrder(ord);
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: isPaid ? '#f8fafc' : '#ffffff',
                            border: isPaid ? '1px solid #e2e8f0' : '1px solid #cbd5e1',
                            color: isPaid ? '#94a3b8' : '#334155',
                            cursor: isPaid ? 'not-allowed' : 'pointer',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                          title={isPaid ? "Paid orders cannot be edited" : "Edit Order"}
                        >
                          <PencilIcon size={14} color={isPaid ? "#94a3b8" : "#334155"} />
                        </button>

                        {/* Send to Kitchen */}
                        {(() => {
                          const isKitchenDisabled = status === 'completed' || status === 'cancelled';
                          const kitchenTitle = status === 'completed'
                            ? "Completed orders cannot be sent to kitchen"
                            : status === 'cancelled'
                            ? "Cancelled orders cannot be sent to kitchen"
                            : status === 'new'
                            ? "Send order to Kitchen"
                            : `Update Kitchen status (${status})`;

                          return (
                            <button
                              type="button"
                              disabled={isKitchenDisabled}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isKitchenDisabled) {
                                  handleOrderStatusUpdate(ord._id || ord.id, ord.status || 'new', ord.branchId);
                                }
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                background: isKitchenDisabled ? '#f8fafc' : '#fff7ed',
                                border: isKitchenDisabled ? '1px solid #e2e8f0' : '1px solid #fed7aa',
                                color: isKitchenDisabled ? '#94a3b8' : '#ea580c',
                                cursor: isKitchenDisabled ? 'not-allowed' : 'pointer',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                boxSizing: 'border-box',
                                transition: 'all 0.15s ease'
                              }}
                              title={kitchenTitle}
                            >
                              <PlayIcon size={13} color={isKitchenDisabled ? "#94a3b8" : "#ea580c"} />
                            </button>
                          );
                        })()}

                        {/* Print KOT */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrintKOT(ord);
                          }}
                          style={{
                            width: '32px',
                            height: '32px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#16a34a',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }}
                          title="Print Kitchen Order Ticket (KOT)"
                        >
                          <PrintIcon size={14} color="#16a34a" />
                        </button>

                        {/* Cancel */}
                        {(() => {
                          const isCancelDisabled = status === 'completed' || status === 'cancelled' || isPaid;
                          const cancelTitle = status === 'completed'
                            ? "Completed orders cannot be cancelled"
                            : status === 'cancelled'
                            ? "Order is already cancelled"
                            : isPaid
                            ? "Paid orders cannot be cancelled"
                            : "Cancel Order";

                          return (
                            <button
                              type="button"
                              disabled={isCancelDisabled}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isCancelDisabled) setOrderToDelete(ord);
                              }}
                              style={{
                                width: '32px',
                                height: '32px',
                                background: isCancelDisabled ? '#f8fafc' : '#fef2f2',
                                border: isCancelDisabled ? '1px solid #e2e8f0' : '1px solid #fecaca',
                                color: isCancelDisabled ? '#94a3b8' : '#dc2626',
                                cursor: isCancelDisabled ? 'not-allowed' : 'pointer',
                                borderRadius: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                                boxSizing: 'border-box',
                                transition: 'all 0.15s ease'
                              }}
                              title={cancelTitle}
                            >
                              <TrashIcon size={14} color={isCancelDisabled ? "#94a3b8" : "#dc2626"} />
                            </button>
                          );
                        })()}

                      </div>
                    </td>
                  </tr>
                );
              })}

              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="13" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '14px' }}>
                    No orders found matching the filter "{orderFilter}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION UI */}
        {(effectiveTotalCount > 0) && (
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
              Showing {effectiveTotalCount === 0 ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, effectiveTotalCount)} of {effectiveTotalCount} entries
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
                disabled={page >= effectiveTotalPages - 1}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: page >= effectiveTotalPages - 1 ? '#f8fafc' : '#ffffff',
                  color: page >= effectiveTotalPages - 1 ? '#cbd5e1' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: page >= effectiveTotalPages - 1 ? 'not-allowed' : 'pointer',
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
                  <strong style={{ fontSize: '13px', color: (waiterName && waiterName !== 'Unassigned') ? '#0f172a' : '#94a3b8', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    {(waiterName && waiterName !== 'Unassigned') ? (
                      <>
                        <UserIcon size={14} color="#64748b" />
                        <span>{waiterName}</span>
                      </>
                    ) : 'None (Unassigned)'}
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
          maxWidth="750px"
        >
          <form onSubmit={handleCreateOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>

            {/* 1. Order Type Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Order Type <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Dine-In', 'Takeaway', 'Delivery'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewOrderType(type)}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: newOrderType === type ? '2px solid #ff5a1f' : '1px solid #cbd5e1',
                      background: newOrderType === type ? '#fff7ed' : '#ffffff',
                      color: newOrderType === type ? '#ff5a1f' : '#334155',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {type === 'Dine-In' ? '🍽️ Dine-In' : (type === 'Takeaway' ? '🛍️ Takeaway' : '🛵 Delivery')}
                  </button>
                ))}
              </div>
            </div>

            {/* Branch & Order Source */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Branch <span style={{ color: '#ef4444' }}>*</span>
                </label>
                {canChooseBranchInOrder ? (
                  <SearchableSelect
                    value={modalSelectedBranchId || ''}
                    onChange={handleModalBranchChange}
                    options={(apiBranches.length > 0 ? apiBranches : (activeRestaurant?.branches || [])).map(b => ({
                      value: b._id || b.id,
                      label: `${b.branchName || b.name} ${b.branchCode ? `(${b.branchCode})` : ''}`
                    }))}
                    placeholder="Select Branch..."
                  />
                ) : (
                  <input
                    type="text"
                    value={(() => {
                      const branchSource = apiBranches.length > 0 ? apiBranches : (activeRestaurant?.branches || []);
                      const bObj = branchSource.find(b => String(b._id || b.id) === String(modalSelectedBranchId || selectedBranchId)) 
                        || branchSource[0];
                      return bObj ? `${bObj.branchName || bObj.name || 'Branch'}${bObj.branchCode ? ` (${bObj.branchCode})` : ''}` : 'Branch';
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

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Order Source <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  value={newOrderSource}
                  onChange={e => setNewOrderSource(e.target.value)}
                  options={[
                    { value: 'Admin / POS', label: 'Admin / POS' },
                    { value: 'Customer Website', label: 'Customer Website' },
                    { value: 'Waiter App', label: 'Waiter App' },
                    { value: 'Online / Delivery Partner', label: 'Online / Delivery Partner' }
                  ]}
                  placeholder="Select Order Source..."
                />
              </div>
            </div>

            {/* Conditional Fields Based on Order Type */}
            {newOrderType === 'Dine-In' && (
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
                      ...modalWaiters.map(w => ({ value: w, label: w }))
                    ]}
                    placeholder="Select Waiter..."
                  />
                </div>
              </div>
            )}

            {/* Delivery Fields (Required for Delivery) */}
            {newOrderType === 'Delivery' && (
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Delivery Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      Customer Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Customer Name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      Customer Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter 10-digit Mobile Number"
                      value={customerMobile}
                      onChange={e => setCustomerMobile(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Delivery Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter complete delivery address with landmark"
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {newOrderType === 'Takeaway' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Customer Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Customer Name"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Customer Mobile Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Mobile Number"
                    value={customerMobile}
                    onChange={e => setCustomerMobile(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            {/* Status & General Kitchen Notes */}
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
                  Special Instructions / Order Note
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
                    height: '38px',
                    padding: '0 12px 0 36px',
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

            {/* Selected Items — Table Columns: S.No, Item, Quantity, Unit Price, Add-ons, Item Notes, Item Total, Actions */}
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Selected Items ({newOrderItems.reduce((sum, it) => sum + (Number(it.qty) || 1), 0)})
                </span>
              </div>

              {newOrderItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderRadius: '8px' }}>
                  No items added yet. Search or select menu items above to add.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', maxHeight: '220px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '650px' }}>
                    <thead>
                      <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '2px solid #ff5a1f' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'center', width: '45px', color: '#ffffff' }}>S.No</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: '#ffffff' }}>Item</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', width: '90px', color: '#ffffff' }}>Quantity</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', width: '80px', color: '#ffffff' }}>Unit Price</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', width: '110px', color: '#ffffff' }}>Add-ons</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', width: '110px', color: '#ffffff' }}>Item Notes</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', width: '85px', color: '#ffffff' }}>Item Total</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', width: '55px', color: '#ffffff' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newOrderItems.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{item.name}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(idx, -1)}
                                style={{ width: '22px', height: '22px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '12px' }}
                              >
                                -
                              </button>
                              <span style={{ width: '24px', textAlign: 'center', fontSize: '12px', fontWeight: 700 }}>{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemQty(idx, 1)}
                                style={{ width: '22px', height: '22px', background: '#f1f5f9', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '12px' }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>₹{item.price}</td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              placeholder="Add-ons..."
                              value={item.addOns || ''}
                              onChange={e => {
                                const updated = [...newOrderItems];
                                updated[idx].addOns = e.target.value;
                                setNewOrderItems(updated);
                              }}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input
                              type="text"
                              placeholder="Notes (e.g. Less spicy)"
                              value={item.notes || ''}
                              onChange={e => {
                                const updated = [...newOrderItems];
                                updated[idx].notes = e.target.value;
                                setNewOrderItems(updated);
                              }}
                              style={{ width: '100%', padding: '4px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11px', boxSizing: 'border-box' }}
                            />
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            ₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveItemFromOrder(idx)}
                              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', padding: '2px 4px' }}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserIcon size={14} color="#64748b" />
                    <span>{w.name}</span>
                  </span>
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