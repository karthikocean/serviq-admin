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
  deleteOrder,
  activeRestaurant = {},
  updateOrderStatus,
  updateOrder
}) {
  const [waiterDropdownOpen, setWaiterDropdownOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [assigningOrder, setAssigningOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const waitersList = staff.filter(s => s.role === 'Waiter').map(s => s.name);
  
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
      time: "1:28 PM",
      timeAgo: "2 min ago",
      items: [
        { name: "Chicken Biryani", qty: 1, price: 320 },
        { name: "Masala Chai", qty: 2, price: 40 }
      ],
      notes: "Less spicy please",
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
    filteredOrders = filteredOrders.filter(o => o.waiter === selectedWaiterFilter);
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
    if (updateOrder) {
      updateOrder(restId, orderId, { waiter: waiterName });
    }
    ShowNotifications.showAlertNotification(`Assigned ${waiterName} to order #ORD-${orderId}`, true);
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
                    {['All Waiters', 'Ravi M.', 'Arjun K.', 'Rahul S.', 'Priya M.', ...waitersList.filter(w => !['Ravi M.', 'Arjun K.', 'Rahul S.', 'Priya M.'].includes(w))].map((w, idx) => {
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

                    {/* 5. ASSIGNED WAITER */}
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
                          backgroundColor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          color: waiterName === 'Unassigned' ? '#64748b' : '#0f172a',
                          cursor: 'pointer'
                        }}
                        title="Click to assign waiter"
                      >
                        <UserIcon size={12} color="#64748b" />
                        <span>{waiterName}</span>
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
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block' }}>Waiter</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{viewingOrder.waiter || 'Unassigned'}</strong>
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
          maxWidth="380px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '6px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Select a waiter for Table {assigningOrder.table}:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {['Ravi M.', 'Arjun K.', 'Rahul S.', 'Priya M.', 'Unassigned'].map((wName, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAssignWaiter(assigningOrder.id, wName)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: assigningOrder.waiter === wName ? '#fff7ed' : '#ffffff',
                    color: assigningOrder.waiter === wName ? '#ff5a1f' : '#0f172a',
                    fontWeight: assigningOrder.waiter === wName ? 800 : 600,
                    textAlign: 'left',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{wName}</span>
                  {assigningOrder.waiter === wName && <CheckIcon size={14} color="#ff5a1f" />}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setAssigningOrder(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Cancel
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

    </section>
  );
}
