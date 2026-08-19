import React, { useState } from 'react';
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
  selectedWaiterFilter = 'All Waiters',
  setSelectedWaiterFilter,
  addOrder,
  deleteOrder,
  activeRestaurant = {},
  updateOrderStatus,
  updateOrder
}) {
  const [waiterDropdownOpen, setWaiterDropdownOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  // Waiters list
  const staffWaiters = staff.filter(s => (s.role || '').toLowerCase() === 'waiter').map(s => s.name);
  const defaultWaiters = ['Ravi M.', 'Arjun K.', 'Rahul S.', 'Priya M.'];
  const allWaiters = Array.from(new Set([...staffWaiters, ...defaultWaiters]));
  const waitersList = allWaiters;

  // Extract menu items from activeRestaurant
  const menuCategories = activeRestaurant?.menu || [];
  const allMenuItems = [];
  if (Array.isArray(menuCategories)) {
    menuCategories.forEach(cat => {
      if (Array.isArray(cat.items)) {
        cat.items.forEach(item => {
          allMenuItems.push({
            name: item.name,
            price: Number(item.price) || 100,
            category: cat.categoryName || 'General'
          });
        });
      }
    });
  }

  const fallbackMenu = [
    { name: 'Chicken Biryani', price: 320 },
    { name: 'Mutton Biryani', price: 380 },
    { name: 'Paneer Butter Masala', price: 210 },
    { name: 'Dal Makhani', price: 160 },
    { name: 'Masala Dosa', price: 120 },
    { name: 'Rava Dosa', price: 140 },
    { name: 'Filter Coffee', price: 35 },
    { name: 'Masala Chai', price: 40 },
    { name: 'Butter Naan', price: 40 },
    { name: 'Chicken 65', price: 200 },
    { name: 'Paneer Tikka', price: 180 },
    { name: 'Gulab Jamun', price: 80 }
  ];
  const selectableMenuItems = allMenuItems.length > 0 ? allMenuItems : fallbackMenu;

  const restaurantTables = (activeRestaurant?.tables || []).map(t => t.tableNo || t.name || String(t.id));
  const availableTableNumbers = restaurantTables.length > 0 ? restaurantTables : ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  // New order form states
  const [newOrderTable, setNewOrderTable] = useState('01');
  const [newOrderWaiter, setNewOrderWaiter] = useState('Unassigned');
  const [newOrderNotes, setNewOrderNotes] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('new');
  const [newOrderItems, setNewOrderItems] = useState([
    { name: selectableMenuItems[0]?.name || 'Chicken Biryani', qty: 1, price: selectableMenuItems[0]?.price || 320 }
  ]);
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  const handleOpenCreateOrderModal = () => {
    setNewOrderTable(availableTableNumbers[0] || '01');
    setNewOrderWaiter('Unassigned');
    setNewOrderNotes('');
    setNewOrderStatus('new');
    setNewOrderItems([
      { name: selectableMenuItems[0]?.name || 'Chicken Biryani', qty: 1, price: selectableMenuItems[0]?.price || 320 }
    ]);
    setIsCreateOrderModalOpen(true);
  };

  const handleAddItemToOrder = (item) => {
    const existingIndex = newOrderItems.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
    if (existingIndex > -1) {
      const updated = [...newOrderItems];
      updated[existingIndex].qty += 1;
      setNewOrderItems(updated);
    } else {
      setNewOrderItems([...newOrderItems, { name: item.name, qty: 1, price: Number(item.price) || 100 }]);
    }
  };

  const handleAddCustomItem = () => {
    if (!customItemName.trim()) return;
    const priceNum = parseFloat(customItemPrice) || 100;
    handleAddItemToOrder({ name: customItemName.trim(), price: priceNum });
    setCustomItemName('');
    setCustomItemPrice('');
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

  const handleCreateOrderSubmit = (e) => {
    if (e) e.preventDefault();
    if (newOrderItems.length === 0) {
      ShowNotifications.showAlertNotification("Please add at least one item to the order.", false);
      return;
    }

    const subtotal = newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const total = parseFloat((subtotal + tax).toFixed(2));
    const nextOrderId = String(Date.now()).slice(-4);

    const newOrderObj = {
      id: nextOrderId,
      table: newOrderTable,
      waiter: newOrderWaiter || 'Unassigned',
      items: newOrderItems,
      notes: newOrderNotes,
      status: newOrderStatus || 'new',
      billingStatus: 'unpaid',
      subtotal,
      tax,
      total,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeAgo: 'Just now',
      branchId: activeRestaurant?.selectedBranchId || 'BR-001'
    };

    if (addOrder) {
      addOrder(activeRestaurant.id || 'rest-1', newOrderObj);
    }
    ShowNotifications.showAlertNotification(`Order #ORD-${nextOrderId} placed successfully for Table ${newOrderTable}!`, true);
    setIsCreateOrderModalOpen(false);
  };
  
  // Sample orders matching the user's exact screenshot if orders array is empty
  const defaultSampleOrders = [
    {
      id: "842",
      table: "02",
      time: "12:55 PM",
      timeAgo: "35 min ago",
      items: [
        { name: "Chicken Biryani", qty: 2, price: 320 },
        { name: "Dal Makhani", qty: 2, price: 160 },
        { name: "Paneer Tikka", qty: 1, price: 180 },
        { name: "Masala Chai", qty: 1, price: 40 }
      ],
      notes: "",
      total: 1239.00,
      subtotal: 1180.00,
      tax: 59.00,
      status: "preparing",
      billingStatus: "unpaid",
      waiter: "Ravi M."
    },
    {
      id: "843",
      table: "02",
      time: "1:00 PM",
      timeAgo: "30 min ago",
      items: [
        { name: "Veg Thali", qty: 2, price: 120 },
        { name: "Masala Chai", qty: 3, price: 40 }
      ],
      notes: "",
      total: 378.00,
      subtotal: 360.00,
      tax: 18.00,
      status: "done",
      billingStatus: "paid",
      waiter: "Ravi M."
    },
    {
      id: "844",
      table: "05",
      time: "1:08 PM",
      timeAgo: "22 min ago",
      items: [
        { name: "Paneer Tikka", qty: 2, price: 180 },
        { name: "Chicken Biryani", qty: 1, price: 320 },
        { name: "Butter Naan", qty: 3, price: 40 },
        { name: "Masala Chai", qty: 2, price: 40 }
      ],
      notes: "",
      total: 924.00,
      subtotal: 880.00,
      tax: 44.00,
      status: "ready",
      billingStatus: "unpaid",
      waiter: "Arjun K."
    },
    {
      id: "845",
      table: "01",
      time: "1:15 PM",
      timeAgo: "15 min ago",
      items: [
        { name: "Masala Dosa", qty: 5, price: 120 },
        { name: "Filter Coffee", qty: 3, price: 40 }
      ],
      notes: "Allergy: peanuts",
      total: 756.00,
      subtotal: 720.00,
      tax: 36.00,
      status: "preparing",
      billingStatus: "unpaid",
      waiter: "Rahul S."
    },
    {
      id: "846",
      table: "07",
      time: "1:22 PM",
      timeAgo: "8 min ago",
      items: [
        { name: "Chicken Biryani", qty: 4, price: 320 },
        { name: "Dal Makhani", qty: 3, price: 160 },
        { name: "Paneer Tikka", qty: 1, price: 180 },
        { name: "Masala Chai", qty: 2, price: 40 }
      ],
      notes: "",
      total: 2121.00,
      subtotal: 2020.00,
      tax: 101.00,
      status: "preparing",
      billingStatus: "unpaid",
      waiter: "Ravi M."
    },
    {
      id: "847",
      table: "03",
      time: "12:20 PM",
      timeAgo: "1 hr ago",
      items: [
        { name: "Chicken Biryani", qty: 1, price: 320 },
        { name: "Chicken 65", qty: 1, price: 200 }
      ],
      notes: "",
      total: 546.00,
      subtotal: 520.00,
      tax: 26.00,
      status: "new",
      billingStatus: "unpaid",
      waiter: "Unassigned"
    },
    {
      id: "837",
      table: "07",
      time: "12:05 PM",
      timeAgo: "1 hr ago",
      items: [
        { name: "Mini Meals", qty: 2, price: 90 },
        { name: "Curd Rice", qty: 1, price: 80 }
      ],
      notes: "",
      total: 273.00,
      subtotal: 260.00,
      tax: 13.00,
      status: "new",
      billingStatus: "unpaid",
      waiter: "Priya M."
    },
    {
      id: "836",
      table: "04",
      time: "11:50 AM",
      timeAgo: "2 hr ago",
      items: [
        { name: "Paneer Butter Masala", qty: 1, price: 210 },
        { name: "Butter Naan", qty: 3, price: 40 },
        { name: "Sweet Lassi", qty: 2, price: 60 }
      ],
      notes: "No coriander in paneer",
      total: 472.50,
      subtotal: 450.00,
      tax: 22.50,
      status: "done",
      billingStatus: "paid",
      waiter: "Rahul S."
    },
    {
      id: "835",
      table: "06",
      time: "11:30 AM",
      timeAgo: "2 hr ago",
      items: [
        { name: "Mutton Biryani", qty: 1, price: 380 },
        { name: "Mirchi Ka Salan", qty: 1, price: 0 }
      ],
      notes: "",
      total: 399.00,
      subtotal: 380.00,
      tax: 19.00,
      status: "done",
      billingStatus: "paid",
      waiter: "Arjun K."
    },
    {
      id: "834",
      table: "09",
      time: "11:15 AM",
      timeAgo: "2 hr ago",
      items: [
        { name: "South Indian Thali", qty: 2, price: 180 },
        { name: "Rasam Vada", qty: 1, price: 70 }
      ],
      notes: "",
      total: 451.50,
      subtotal: 430.00,
      tax: 21.50,
      status: "new",
      billingStatus: "unpaid",
      waiter: "Unassigned"
    },
    {
      id: "833",
      table: "10",
      time: "11:00 AM",
      timeAgo: "3 hr ago",
      items: [
        { name: "Cold Coffee", qty: 2, price: 90 },
        { name: "French Fries", qty: 1, price: 110 }
      ],
      notes: "",
      total: 304.50,
      subtotal: 290.00,
      tax: 14.50,
      status: "done",
      billingStatus: "paid",
      waiter: "Priya M."
    },
    {
      id: "832",
      table: "02",
      time: "10:45 AM",
      timeAgo: "3 hr ago",
      items: [
        { name: "Idli Sambar (2 pcs)", qty: 2, price: 60 },
        { name: "Medu Vada", qty: 2, price: 50 },
        { name: "Masala Chai", qty: 2, price: 40 }
      ],
      notes: "",
      total: 315.00,
      subtotal: 300.00,
      tax: 15.00,
      status: "done",
      billingStatus: "paid",
      waiter: "Ravi M."
    },
    {
      id: "831",
      table: "05",
      time: "10:30 AM",
      timeAgo: "3 hr ago",
      items: [
        { name: "Poori Masala", qty: 2, price: 90 },
        { name: "Filter Coffee", qty: 2, price: 35 }
      ],
      notes: "Poori should be hot",
      total: 262.50,
      subtotal: 250.00,
      tax: 12.50,
      status: "done",
      billingStatus: "paid",
      waiter: "Arjun K."
    },
    {
      id: "830",
      table: "01",
      time: "10:15 AM",
      timeAgo: "3 hr ago",
      items: [
        { name: "Rava Dosa", qty: 2, price: 140 },
        { name: "Badam Milk", qty: 2, price: 60 }
      ],
      notes: "",
      total: 420.00,
      subtotal: 400.00,
      tax: 20.00,
      status: "new",
      billingStatus: "unpaid",
      waiter: "Unassigned"
    }
  ];

  const sourceOrders = orders.length > 0 ? orders : defaultSampleOrders;

  // Filter logic
  let filteredOrders = [...sourceOrders];
  if (orderFilter !== 'All') {
    filteredOrders = filteredOrders.filter(o => (o.status || '').toLowerCase() === orderFilter.toLowerCase());
  }
  if (selectedWaiterFilter !== 'All Waiters') {
    if (selectedWaiterFilter === 'Unassigned (Optional)') {
      filteredOrders = filteredOrders.filter(o => !o.waiter || o.waiter === 'Unassigned' || o.waiter === 'None');
    } else {
      filteredOrders = filteredOrders.filter(o => o.waiter === selectedWaiterFilter);
    }
  }

  const handleOrderStatusUpdate = (orderId, currentStatus) => {
    let nextStatus = 'preparing';
    if (currentStatus === 'new') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'done';

    const restId = activeRestaurant?.id || 'rest-1';
    if (updateOrderStatus) {
      updateOrderStatus(restId, orderId, nextStatus);
    }
    ShowNotifications.showAlertNotification(`Order #ORD-${orderId} status updated to ${nextStatus.toUpperCase()}!`, true);
  };

  const handleAssignWaiter = (orderId, waiterName) => {
    const restId = activeRestaurant?.id || 'rest-1';
    const isNone = !waiterName || waiterName === 'Unassigned' || waiterName === 'None' || waiterName === 'None (Optional)';
    const finalWaiter = isNone ? 'Unassigned' : waiterName;
    if (updateOrder) {
      updateOrder(restId, orderId, { waiter: finalWaiter });
    }
    ShowNotifications.showAlertNotification(
      isNone
        ? `Order #ORD-${orderId} updated with no waiter (Optional).`
        : `Assigned ${waiterName} to order #ORD-${orderId}`,
      true
    );
    setAssigningOrder(null);
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
                <span>{selectedWaiterFilter}</span>
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
                    {['All Waiters', 'Unassigned (Optional)', ...allWaiters].map((w, idx) => {
                      const isSelected = selectedWaiterFilter === w;
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
                          {w}
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
              <span>+ Order</span>
            </button>
          </div>
        </div>

        {/* ORDERS TABLE */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  ORDER ID
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  TABLE
                </th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  ITEMS
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
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord, index) => {
                const itemSummary = Array.isArray(ord.items)
                  ? ord.items.map(i => `${i.name} × ${i.qty}`).join(', ')
                  : (ord.items || 'Standard Order');

                const isPaid = (ord.billingStatus || '').toLowerCase() === 'paid';
                const status = (ord.status || 'new').toLowerCase();
                const waiterName = ord.waiter || 'Unassigned';

                return (
                  <tr 
                    key={ord.id || index}
                    style={{
                      borderBottom: index < filteredOrders.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* 1. ORDER ID */}
                    <td style={{ padding: '16px', fontWeight: 800, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      #ORD-{ord.id}
                    </td>

                    {/* 2. TABLE */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        backgroundColor: '#fff7ed', 
                        color: '#ea580c', 
                        padding: '4px 10px', 
                        borderRadius: '6px', 
                        fontSize: '12px', 
                        fontWeight: 700 
                      }}>
                        Table {ord.table || '01'}
                      </span>
                    </td>

                    {/* 3. ITEMS */}
                    <td style={{ padding: '16px', fontSize: '13px', maxWidth: '300px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.4 }}>
                        {itemSummary}
                      </div>
                      {ord.notes && (
                        <div style={{ fontSize: '11px', color: '#d97706', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>✏️ Note: {ord.notes}</span>
                        </div>
                      )}
                    </td>

                    {/* 4. TIME / ELAPSED */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                        {ord.time || '12:30 PM'}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#ea580c', marginTop: '2px' }}>
                        {ord.timeAgo || '5 min ago'}
                      </div>
                    </td>

                    {/* 5. ASSIGNED WAITER (OPTIONAL) */}
                    <td style={{ padding: '16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => setAssigningOrder(ord)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: (ord.waiter && ord.waiter !== 'Unassigned') ? '#fff7ed' : '#f8fafc',
                          border: (ord.waiter && ord.waiter !== 'Unassigned') ? '1px solid #fed7aa' : '1px dashed #cbd5e1',
                          color: (ord.waiter && ord.waiter !== 'Unassigned') ? '#c2410c' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        title="Click to assign or change waiter (Optional)"
                      >
                        <UserIcon size={12} color={(ord.waiter && ord.waiter !== 'Unassigned') ? '#ea580c' : '#94a3b8'} />
                        <span>{(ord.waiter && ord.waiter !== 'Unassigned') ? ord.waiter : '+ Assign (Optional)'}</span>
                      </button>
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
                    <td style={{ padding: '16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
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

                        {/* Print Icon */}
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            ShowNotifications.showAlertNotification(`Printing KOT receipt for order #ORD-${ord.id}...`, true);
                            window.print();
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
                          title="Print Receipt"
                        >
                          <PrintIcon size={14} />
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleOrderStatusUpdate(ord.id, status);
                            }}
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setViewingOrder(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Close
              </button>
              <button 
                type="button" 
                className="btn btn-black" 
                onClick={() => {
                  window.print();
                }}
                style={{ padding: '8px 18px', borderRadius: '8px', background: '#ff5a1f', color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <PrintIcon size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: ASSIGN WAITER */}
      {assigningOrder && (
        <Modal
          isOpen={!!assigningOrder}
          onClose={() => setAssigningOrder(null)}
          title={`Assign Waiter to Order #ORD-${assigningOrder.id}`}
          maxWidth="420px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '6px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Table Number:</span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Table {assigningOrder.table}</strong>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                Assigning a waiter is completely optional. You can leave this order unassigned or assign a staff member at any time.
              </p>
            </div>

            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Select a Waiter <span style={{ fontWeight: 500, color: '#64748b' }}>(Optional)</span>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
              {/* Option 1: No Waiter Assigned (Optional) */}
              <button
                type="button"
                onClick={() => handleAssignWaiter(assigningOrder.id, 'Unassigned')}
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: (!assigningOrder.waiter || assigningOrder.waiter === 'Unassigned') ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                  background: (!assigningOrder.waiter || assigningOrder.waiter === 'Unassigned') ? '#f1f5f9' : '#ffffff',
                  color: (!assigningOrder.waiter || assigningOrder.waiter === 'Unassigned') ? '#0f172a' : '#64748b',
                  fontWeight: (!assigningOrder.waiter || assigningOrder.waiter === 'Unassigned') ? 800 : 600,
                  textAlign: 'left',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.15s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>🚫</span>
                  <span>No Waiter / Leave Unassigned (Optional)</span>
                </div>
                {(!assigningOrder.waiter || assigningOrder.waiter === 'Unassigned') && <CheckIcon size={14} color="#0f172a" />}
              </button>

              {/* Waiter Options */}
              {allWaiters.map((wName, idx) => {
                const isSelected = assigningOrder.waiter === wName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAssignWaiter(assigningOrder.id, wName)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isSelected ? '1.5px solid #ff5a1f' : '1px solid #cbd5e1',
                      background: isSelected ? '#fff7ed' : '#ffffff',
                      color: isSelected ? '#ff5a1f' : '#0f172a',
                      fontWeight: isSelected ? 800 : 600,
                      textAlign: 'left',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <UserIcon size={14} color={isSelected ? '#ff5a1f' : '#64748b'} />
                      <span>{wName}</span>
                    </div>
                    {isSelected && <CheckIcon size={14} color="#ff5a1f" />}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setAssigningOrder(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Close
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
                onClick={() => {
                  if (deleteOrder && activeRestaurant?.id) {
                    deleteOrder(activeRestaurant.id, orderToDelete.id);
                  }
                  ShowNotifications.showAlertNotification(`Order #ORD-${orderToDelete.id} cancelled!`, true);
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
                    boxSizing: 'border-box'
                  }}
                >
                  {availableTableNumbers.map(tNo => (
                    <option key={tNo} value={tNo}>Table {tNo}</option>
                  ))}
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
                  {allWaiters.map(w => (
                    <option key={w} value={w}>🤵 {w}</option>
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

            {/* Quick Menu Item Selector */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Quick Add Dishes:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '110px', overflowY: 'auto', paddingBottom: '4px' }}>
                {selectableMenuItems.slice(0, 10).map((menuItem, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddItemToOrder(menuItem)}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
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
                    <span>+ {menuItem.name}</span>
                    <span style={{ color: '#ff5a1f', fontWeight: 700 }}>₹{menuItem.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Item Adder */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Or custom item name..."
                value={customItemName}
                onChange={e => setCustomItemName(e.target.value)}
                style={{
                  flex: 2,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <input
                type="number"
                placeholder="Price ₹"
                value={customItemPrice}
                onChange={e => setCustomItemPrice(e.target.value)}
                style={{
                  width: '90px',
                  padding: '7px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={handleAddCustomItem}
                disabled={!customItemName.trim()}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: customItemName.trim() ? 'pointer' : 'not-allowed',
                  opacity: customItemName.trim() ? 1 : 0.5
                }}
              >
                Add
              </button>
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
                    <span>GST (5%):</span>
                    <span>₹{(newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0) * 0.05).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 800, color: '#ff5a1f', marginTop: '4px' }}>
                    <span>Total Amount:</span>
                    <span>₹{(newOrderItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0) * 1.05).toFixed(2)}</span>
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

    </section>
  );
}
