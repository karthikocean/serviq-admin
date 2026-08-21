import React, { useState, useEffect } from 'react';
import apiClient from '../config/index.js';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';

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

export default function OrdersPanel({
  orders = [],
  staff = [],
  orderFilter = 'All',
  setOrderFilter,
  selectedWaiterFilter = 'All',
  setSelectedWaiterFilter,
  activeRestaurant,
  selectedBranchId,
  updateOrderStatus,
  refreshOrders,
  page = 0,
  setPage = () => { },
  limit = 10,
  setLimit = () => { },
  totalPages = 1,
  totalCount = 0
}) {
  const [waiterDropdownOpen, setWaiterDropdownOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  // New States for Appending Items
  const [appendingOrder, setAppendingOrder] = useState(null);
  const [appendItemsCart, setAppendItemsCart] = useState([]);
  const [appendSearchQuery, setAppendSearchQuery] = useState('');
  const [appendSelectedCategory, setAppendSelectedCategory] = useState('All');

  // Check branch lock
  const localUser = JSON.parse(localStorage.getItem('serviq_user') || '{}');
  const isRestaurantOwner = localUser?.userType === 'RESTAURANT_OWNER';
  const isBranchLocked = !isRestaurantOwner;

  // Waiters list
  const staffWaiters = staff.filter(s => {
    const roleName = s.roleId?.roleName || s.role || '';
    return roleName.toLowerCase() === 'waiter';
  }).map(s => ({ id: s._id || s.id, name: s.name }));

  const uniqueWaitersMap = new Map();
  staffWaiters.forEach(w => uniqueWaitersMap.set(w.name, w));
  const allWaiters = Array.from(uniqueWaitersMap.values());

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
  const [apiTables, setApiTables] = useState([]);
  const [modalWaiters, setModalWaiters] = useState([]);
  const [modalSelectedBranchId, setModalSelectedBranchId] = useState('');
  const [taxRate, setTaxRate] = useState(5);

  const displayWaiters = allWaiters;
  const activeOrdersForTable = orders.filter(o => (o.billingStatus || '').toLowerCase() === 'unpaid');

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

  const displayCategories = apiCategories.length > 0 ? ['All', ...apiCategories.map(c => c.name)] : ['All', ...new Set(selectableMenuItems.map(item => item.category || 'General'))];

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

  const getFallbackBranchId = () => {
    try {
      const userStr = localStorage.getItem('serviq_user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.activeBranchId) return userObj.activeBranchId;
      }
    } catch (e) { }
    return localStorage.getItem('serviq_branch_id') || '';
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

        const firstTable = fetchedTables.length > 0 ? (fetchedTables[0].tableNumber || fetchedTables[0].tableNo) : (displayTables.length > 0 ? displayTables[0] : '');
        setNewOrderTable(firstTable);

        let staffListToUse = staff;
        if (staffRes && staffRes.data?.success) {
          staffListToUse = staffRes.data.data;
        }
        const filteredStaff = staffListToUse.filter(s => s.branchId === branchId || s.branchId?._id === branchId || s.branch === branchId || s.branch?._id === branchId);
        const staffWaitersList = filteredStaff.filter(s => {
          const roleName = s.roleId?.roleName || s.role || '';
          return roleName.toLowerCase() === 'waiter' || s.userType === 'STAFF';
        }).map(s => s.name);
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
    const targetBranchId = selectedBranchId || defaultBranchId || getFallbackBranchId();
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

  const handleOpenAppendModal = async (order) => {
    setAppendingOrder(order);
    setAppendItemsCart([]);
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
          menuId: item._id,
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

      const res = await apiClient.put(`/orders/${appendingOrder._id || appendingOrder.id}/items/append`, payload);
      if (res.data.success) {
        ShowNotifications.showAlertNotification("Items added successfully!", true);
        setAppendingOrder(null);
        if (refreshOrders) refreshOrders();
      } else {
        ShowNotifications.showAlertNotification(res.data.message || "Failed to add items", false);
      }
    } catch (err) {
      console.error("Error appending items:", err);
      ShowNotifications.showAlertNotification(err.response?.data?.message || "Error adding items", false);
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

  const handleCreateOrderSubmit = async (e) => {
    if (e) e.preventDefault();
    if (newOrderItems.length === 0) {
      ShowNotifications.showAlertNotification("Please add at least one item to the order.", false);
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
        ShowNotifications.showAlertNotification(res.data?.message || "Failed to create order", false);
      }
    } catch (error) {
      console.error(error);
      ShowNotifications.showAlertNotification(error.response?.data?.message || "Failed to create order via API", false);
    }
  };

  const sourceOrders = orders;

  // Filter logic is now handled by the backend
  let filteredOrders = [...sourceOrders];

  const handleOrderStatusUpdate = async (orderId, currentStatus, branchId) => {
    let nextStatus = 'preparing';
    if (currentStatus === 'new') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'done';

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

    const foundWaiter = staff.find(w => w.name === waiterName);
    const waiterId = foundWaiter ? (foundWaiter._id || foundWaiter.id) : undefined;

    setIsAssignWaiterModalOpen(false);
    setSelectedOrderForWaiter(null);
    try {
      const res = await apiClient.put(`/orders/${orderId}/items`, { waiterId });
      if (res.data?.success) {
        ShowNotifications.showAlertNotification(isNone ? "Waiter assignment removed." : `Assigned ${waiterName} to order.`, true);
        if (refreshOrders) refreshOrders();
      } else {
        ShowNotifications.showAlertNotification(`Failed to assign waiter`, false);
      }
    } catch (err) {
      console.error(err);
      ShowNotifications.showAlertNotification(`Failed to assign waiter`, false);
    }
  };

  return (
    <section className="panel-view active" style={{ paddingBottom: '60px', width: '100%', boxSizing: 'border-box' }}>

      {/* MAIN CONTAINER MATCHING SCREENSHOT */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden'
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
                onClick={() => setWaiterDropdownOpen(!waiterDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                <UserIcon size={14} color="#64748b" />
                <span>{selectedWaiterFilter?.name || 'All Waiters'}</span>
                <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '4px' }}>▼</span>
              </button>

              {waiterDropdownOpen && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }}
                    onClick={() => setWaiterDropdownOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    right: 0,
                    width: '180px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    padding: '4px'
                  }}>
                    {[{ id: 'All Waiters', name: 'All Waiters' }, { id: 'unassigned', name: 'Unassigned (Optional)' }, ...allWaiters].map((w, idx) => {
                      const isSelected = selectedWaiterFilter?.id === w.id;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedWaiterFilter(w);
                            setWaiterDropdownOpen(false);
                          }}
                          style={{
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: isSelected ? 700 : 500,
                            borderRadius: '6px',
                            backgroundColor: isSelected ? '#ff5a1f' : 'transparent',
                            color: isSelected ? '#ffffff' : '#0f172a',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
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
              {['All', 'New', 'Preparing', 'Ready', 'Done'].map(tab => {
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
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', minWidth: '130px', position: 'sticky', left: 0, zIndex: 10, backgroundColor: '#000000' }}>
                  ORDER ID
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '110px', position: 'sticky', left: '130px', zIndex: 10, backgroundColor: '#000000' }}>
                  TABLE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ITEMS
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  DATE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  TIME / ELAPSED
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  ASSIGNED WAITER
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  PAYMENT
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  TOTAL
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  STATUS
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap', minWidth: '120px', position: 'sticky', right: 0, zIndex: 10, backgroundColor: '#000000' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord, index) => {
                let totalItemsCount = 0;
                if (Array.isArray(ord.items)) {
                  totalItemsCount = ord.items.length;
                }

                const itemSummary = Array.isArray(ord.items)
                  ? (
                    <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block', fontWeight: 600, fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                      {totalItemsCount} Items
                    </div>
                  )
                  : (
                    <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block', fontWeight: 600, fontSize: '12px', color: '#334155', whiteSpace: 'nowrap' }}>
                      {ord.items || 'Standard Order'}
                    </div>
                  );

                const isPaid = (ord.billingStatus || '').toLowerCase() === 'paid';
                const status = (ord.status || 'new').toLowerCase();
                const waiterName = ord.waiterId?.name || ord.waiter || 'Unassigned';
                const tableName = ord.tableId?.tableNumber || ord.tableId?.tableNo || ord.table || '01';

                let displayId = ord.orderId || ord.id || String(index);
                if (displayId.startsWith('ORD-')) displayId = displayId.replace('ORD-', '');

                const dateStr = ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
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
                    <td style={{ padding: '16px', fontWeight: 800, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap', position: 'sticky', left: 0, zIndex: 5, backgroundColor: 'inherit' }}>
                      #ORD-{displayId}
                    </td>

                    {/* 2. TABLE */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap', position: 'sticky', left: '130px', zIndex: 5, backgroundColor: 'inherit' }}>
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

                    {/* 5. ASSIGNED WAITER (OPTIONAL) */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: waiterName === 'Unassigned' ? '#94a3b8' : '#0f172a' }}>
                        {waiterName === 'Unassigned' ? '-' : waiterName}
                      </span>
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
                      {status === 'done' && (
                        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
                          Done
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

                    {/* 9. ACTION BUTTONS (MATCHING SCREENSHOT) */}
                    <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap', position: 'sticky', right: 0, zIndex: 5, backgroundColor: 'inherit' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>

                        {/* Eye Icon */}
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
                            color: '#475569',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#475569'; }}
                          title="View Order Details"
                        >
                          <EyeIcon size={14} />
                        </button>

                        {/* Trash Icon */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOrderToDelete(ord);
                          }}
                          style={{
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '6px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#fecaca'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                          title="Delete Order"
                        >
                          <TrashIcon size={14} />
                        </button>

                        {/* Status Action Trigger */}
                        {status === 'done' ? (
                          <span style={{
                            fontSize: '11px',
                            color: '#15803d',
                            backgroundColor: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <CheckIcon size={12} /> Served
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOrderStatusUpdate(ord._id || ord.id, status, ord.branchId)}
                            style={{
                              padding: '5px 12px',
                              borderRadius: '6px',
                              border:
                                status === 'new' ? '1px solid #ff5a1f' :
                                  status === 'preparing' ? '1px solid #16a34a' : '1px solid #16a34a',
                              background:
                                status === 'new' ? '#fff7ed' :
                                  status === 'preparing' ? '#f0fdf4' : '#f0fdf4',
                              color:
                                status === 'new' ? '#ff5a1f' :
                                  status === 'preparing' ? '#16a34a' : '#16a34a',
                              cursor: 'pointer',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.15s'
                            }}
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
        {totalCount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '10px 20px', background: '#fff' }}>
            <div style={{ fontSize: '13px', color: '#64748b' }}>
              Showing {page * limit + (totalCount > 0 ? 1 : 0)} to {Math.min((page + 1) * limit, totalCount)} of {totalCount} entries
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: page === 0 ? '#cbd5e1' : '#64748b', cursor: page === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Prev
              </button>

              <button
                type="button"
                style={{
                  minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '6px', fontSize: '13px', fontWeight: 700,
                  border: 'none', background: '#000', color: '#fff', cursor: 'default'
                }}
              >
                {page + 1}
              </button>

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: page >= totalPages - 1 ? '#cbd5e1' : '#64748b', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL: VIEW ORDER DETAILS */}
      {viewingOrder && (
        <Modal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title={`Order Details: #ORD-${viewingOrder.id}`}
          maxWidth="540px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '6px' }}>

            {/* Meta Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>Table</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>Table {viewingOrder.table}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>Waiter (Optional)</span>
                <strong style={{ fontSize: '14px', color: (viewingOrder.waiter && viewingOrder.waiter !== 'Unassigned') ? '#0f172a' : '#94a3b8' }}>
                  {(viewingOrder.waiter && viewingOrder.waiter !== 'Unassigned') ? viewingOrder.waiter : 'None (Optional)'}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>Status</span>
                <strong style={{ fontSize: '13px', color: '#ff5a1f', textTransform: 'capitalize' }}>● {viewingOrder.status}</strong>
              </div>
            </div>

            {viewingOrder.notes && (
              <div style={{ padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '8px', fontSize: '12px', color: '#d48806', fontWeight: 600 }}>
                Note: {viewingOrder.notes}
              </div>
            )}

            {/* Items Table */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
                ORDER ITEMS
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #e2e8f0', color: '#64748b' }}>
                    <th style={{ textAlign: 'left', padding: '6px 0', fontSize: '12px' }}>Item</th>
                    <th style={{ textAlign: 'center', padding: '6px 0', fontSize: '12px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '6px 0', fontSize: '12px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(viewingOrder.items) && viewingOrder.items.map((it, iIdx) => (
                    <tr key={iIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 0', fontWeight: 600, color: '#0f172a' }}>{it.name}</td>
                      <td style={{ padding: '8px 0', textAlign: 'center', fontWeight: 700 }}>{it.qty}</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        ₹{((it.price || 0) * it.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', borderTop: '2px solid #e2e8f0' }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Grand Total Amount:</span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#ff5a1f', fontFamily: "'Outfit', sans-serif" }}>
                ₹{parseFloat(viewingOrder.total || 0).toFixed(2)}
              </span>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewingOrder(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Close
              </button>
              {viewingOrder.status !== 'completed' && viewingOrder.status !== 'cancelled' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleOpenAppendModal(viewingOrder)}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: '#0284c7', color: '#fff', fontSize: '13px', fontWeight: 700, border: 'none' }}
                >
                  + Add More Items
                </button>
              )}
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  window.print();
                }}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#ff5a1f', color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', border: 'none' }}
              >
                <PrintIcon size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}

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
                    const res = await apiClient.delete(`/orders/${orderToDelete._id || orderToDelete.id}`);
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

            {/* Modal Branch Selection */}
            {activeRestaurant?.branches?.length > 1 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Branch <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={modalSelectedBranchId}
                  onChange={handleModalBranchChange}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    background: isBranchLocked ? '#f8fafc' : '#fff',
                    cursor: isBranchLocked ? 'not-allowed' : 'pointer',
                    boxSizing: 'border-box'
                  }}
                  disabled={isBranchLocked}
                >
                  {activeRestaurant.branches.map(b => (
                    <option key={b._id || b.id} value={b._id || b.id}>{b.branchName || b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Row 1: Table & Waiter Assignment */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Dining Table <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={newOrderTable}
                  onChange={e => setNewOrderTable(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: occupiedTableIdentifiers.some(id => String(id).trim().toLowerCase() === String(newOrderTable).trim().toLowerCase()) ? '#ef4444' : '#22c55e',
                    boxSizing: 'border-box'
                  }}
                >
                  {displayTables.map(tNo => {
                    const tNoClean = String(tNo).trim().toLowerCase();
                    const isOccupied = occupiedTableIdentifiers.some(id => String(id).trim().toLowerCase() === tNoClean);
                    return (
                      <option key={tNo} value={tNo} disabled={isOccupied} style={{ color: isOccupied ? '#ef4444' : '#22c55e', fontWeight: 600 }}>
                        Table {tNo} {isOccupied ? '(Occupied)' : '(Available)'}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Assigned Waiter <span style={{ fontSize: '11px', fontWeight: 500, color: '#64748b' }}>(Optional)</span>
                </label>
                <select
                  value={newOrderWaiter}
                  onChange={e => setNewOrderWaiter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="Unassigned">-- None (Unassigned) --</option>
                  {modalWaiters.map((w, idx) => (
                    <option key={idx} value={w}>🤵 {w}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Initial Status & Order Notes */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Initial Status
                </label>
                <select
                  value={newOrderStatus}
                  onChange={e => setNewOrderStatus(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    fontWeight: 600,
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="new">New (KOT)</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready to Serve</option>
                </select>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  Order Items ({newOrderItems.length})
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

      {/* MODAL: APPEND ITEMS TO ORDER */}
      {appendingOrder && (
        <Modal
          isOpen={!!appendingOrder}
          onClose={() => setAppendingOrder(null)}
          title={`Add Items to Order #ORD-${appendingOrder.orderId || appendingOrder.id || appendingOrder._id}`}
          maxWidth="600px"
        >
          <form onSubmit={handleSubmitAppendItems} style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' }}>

            {/* Info Box */}
            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Table</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Table {appendingOrder.tableId?.tableNumber || appendingOrder.tableId?.tableNo || appendingOrder.table}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Order Total So Far</span>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>₹{appendingOrder.total}</div>
              </div>
            </div>

            {/* Menu Search */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
                ADD NEW ITEMS
              </label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <div style={{ position: 'absolute', top: '10px', left: '12px', color: '#94a3b8' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={appendSearchQuery}
                  onChange={(e) => setAppendSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 34px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px' }}
                />
              </div>

              {/* Categories */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                {displayCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAppendSelectedCategory(cat)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: cat === appendSelectedCategory ? 'none' : '1px solid #e2e8f0',
                      background: cat === appendSelectedCategory ? '#ff5a1f' : '#fff',
                      color: cat === appendSelectedCategory ? '#fff' : '#64748b',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu List */}
              <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '12px', background: '#fff' }}>
                {displayMenuItems.filter(item => {
                  const matchesSearch = item.name.toLowerCase().includes(appendSearchQuery.toLowerCase());
                  const itemCat = String(item.category || 'General').trim().toLowerCase();
                  const selCat = String(appendSelectedCategory).trim().toLowerCase();
                  const matchesCategory = appendSelectedCategory === 'All' || itemCat === selCat;
                  return matchesSearch && matchesCategory;
                }).length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No items found.</div>
                ) : (
                  displayMenuItems.filter(item => {
                    const matchesSearch = item.name.toLowerCase().includes(appendSearchQuery.toLowerCase());
                    const itemCat = String(item.category || 'General').trim().toLowerCase();
                    const selCat = String(appendSelectedCategory).trim().toLowerCase();
                    const matchesCategory = appendSelectedCategory === 'All' || itemCat === selCat;
                    return matchesSearch && matchesCategory;
                  }).map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#ff5a1f' }}>₹{item.price}</span>
                        <button
                          type="button"
                          onClick={() => handleAddItemToAppendCart(item)}
                          style={{
                            padding: '4px 12px',
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#0f172a',
                            cursor: 'pointer'
                          }}
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Summary */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>NEW ITEMS ({appendItemsCart.length})</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>Qty & Rate</span>
              </div>

              {appendItemsCart.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '20px 0' }}>
                  No new items added yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {appendItemsCart.map((cartItem, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', flex: 1 }}>{cartItem.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        {/* Qty Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppendItemQty(idx, -1)}
                            style={{ width: '24px', height: '24px', background: '#f8fafc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b' }}
                          >-</button>
                          <div style={{ width: '30px', textAlign: 'center', fontSize: '12px', fontWeight: 600, background: '#fff' }}>
                            {cartItem.qty || 1}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateAppendItemQty(idx, 1)}
                            style={{ width: '24px', height: '24px', background: '#f8fafc', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#64748b' }}
                          >+</button>
                        </div>

                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', minWidth: '50px', textAlign: 'right' }}>
                          ₹{(Number(cartItem.price) || 0) * (cartItem.qty || 1)}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemFromAppendCart(idx)}
                          style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '4px' }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Total line */}
                  {(() => {
                    const appendSubtotal = appendItemsCart.reduce((sum, i) => sum + (Number(i.price) || 0) * (i.qty || 1), 0);
                    const appendTax = (appendSubtotal * taxRate) / 100;
                    const appendTotal = appendSubtotal + appendTax;
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Subtotal:</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>₹{appendSubtotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>GST ({taxRate}%):</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>₹{appendTax.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>New Additional Cost:</span>
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>₹{appendTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                type="button"
                onClick={() => setAppendingOrder(null)}
                style={{ padding: '10px 20px', borderRadius: '8px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={appendItemsCart.length === 0}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: appendItemsCart.length > 0 ? '#10b981' : '#94a3b8',
                  border: 'none',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: appendItemsCart.length > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: appendItemsCart.length > 0 ? '0 2px 8px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                Confirm Add Items
              </button>
            </div>
          </form>
        </Modal>
      )}

    </section>
  );
}