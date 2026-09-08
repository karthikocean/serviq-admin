import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../config/AppContext';
import { ticketApi } from '../api/Ticket.js';
import { formatDateTimeDMY } from '../helper/DateHelper.js';

const renderNotificationIcon = (notif) => {
  const color = notif.badgeColor || '#ea580c';
  switch (notif.type) {
    case 'ORDERS':
      if (notif.subType === 'READY') {
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8"></path>
            <path d="M12 2v6"></path>
            <line x1="4" y1="22" x2="20" y2="22"></line>
          </svg>
        );
      }
      if (notif.subType === 'PREPARING') {
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"></path>
          </svg>
        );
      }
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      );
    case 'WATER':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
        </svg>
      );
    case 'BILL':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      );
    case 'MESSAGE':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      );
    case 'INVENTORY':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      );
    case 'TABLES':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="13" rx="2" />
          <path d="M4 16v5" />
          <path d="M20 16v5" />
          <path d="M8 16v3" />
          <path d="M16 16v3" />
        </svg>
      );
    case 'TICKETS':
      if (notif.subType === 'STATUS_UPDATE') {
        return (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      }
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
          <path d="M13 5v2"></path>
          <path d="M13 17v2"></path>
          <path d="M13 11v2"></path>
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
      );
  }
};

export default function NotificationModal({ isOpen, onClose }) {
  const { activeRestaurant, selectedBranchId } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ORDERS' | 'TICKETS' | 'WATER' | 'BILL' | 'MESSAGE' | 'INVENTORY' | 'TABLES'
  const [notifications, setNotifications] = useState([]);
  const [liveTickets, setLiveTickets] = useState([]);

  // Fetch support tickets to show super admin replies
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      ticketApi.getTickets({ page: 0, limit: 50 }).then(res => {
        if (isMounted && res && res.status && Array.isArray(res.data)) {
          setLiveTickets(res.data);
        }
      }).catch(e => console.warn('Tickets fetch in NotificationModal:', e));
    }
    return () => { isMounted = false; };
  }, [isOpen]);

  // Comprehensive Live Notification Aggregator from across the system
  useEffect(() => {
    const aggregated = [];

    // Helper for branch match
    const matchesBranch = (itemBranch) => {
      if (!selectedBranchId || selectedBranchId === 'ALL') return true;
      if (!itemBranch) return true;
      const bId = typeof itemBranch === 'object' ? (itemBranch._id || itemBranch.id) : itemBranch;
      return String(bId) === String(selectedBranchId);
    };

    // 1. LIVE ORDERS NOTIFICATIONS (New orders, Ready to Serve, Delayed Orders)
    if (activeRestaurant?.orders && Array.isArray(activeRestaurant.orders)) {
      activeRestaurant.orders.filter(o => matchesBranch(o.branchId || o.branch)).forEach(o => {
        const rawStatus = String(o.status || '').toLowerCase();
        const tableStr = o.tableNumber || o.tableNo || (typeof o.table === 'object' ? (o.table?.tableNumber || o.table?.name) : o.table) || (typeof o.tableId === 'object' ? (o.tableId?.tableNumber || o.tableId?.name) : o.tableId) || 'Table 1';
        const formattedTable = String(tableStr).startsWith('Table') ? tableStr : `Table ${tableStr}`;
        const itemsStr = Array.isArray(o.items)
          ? o.items.map(i => `${i.quantity || i.qty || 1}x ${i.name || i.menuItem?.name || 'Item'}`).join(', ')
          : (typeof o.items === 'string' ? o.items : 'Food items');
        const ordId = o.orderId || o.id || (o._id ? `#${String(o._id).slice(-5).toUpperCase()}` : '#ORD-101');
        const timeStr = o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';

        // Order Ready for Table Pickup
        if (rawStatus === 'ready' || rawStatus === 'ready to serve') {
          aggregated.push({
            id: `order-ready-${o._id || o.id}`,
            type: 'ORDERS',
            subType: 'READY',
            table: formattedTable,
            branch: o.branchName || 'Current Branch',
            title: `Order Ready to Serve ${ordId}`,
            description: `Kitchen finished preparing: ${itemsStr}. Ready for waiter pickup.`,
            time: timeStr,
            timestamp: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
            actionUrl: '/orders',
            badgeBg: '#f0fdf4',
            badgeColor: '#16a34a'
          });
        }
        // New Incoming Orders
        else if (rawStatus === 'new' || rawStatus === 'pending') {
          aggregated.push({
            id: `order-new-${o._id || o.id}`,
            type: 'ORDERS',
            subType: 'NEW',
            table: formattedTable,
            branch: o.branchName || 'Current Branch',
            title: `New Order Placed ${ordId}`,
            description: itemsStr,
            time: timeStr,
            timestamp: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
            actionUrl: '/orders',
            badgeBg: '#fff7ed',
            badgeColor: '#ea580c'
          });
        }
        // Active preparing orders
        else if (rawStatus === 'preparing') {
          aggregated.push({
            id: `order-prep-${o._id || o.id}`,
            type: 'ORDERS',
            subType: 'PREPARING',
            table: formattedTable,
            branch: o.branchName || 'Current Branch',
            title: `Active Kitchen Order ${ordId}`,
            description: itemsStr,
            time: timeStr,
            timestamp: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
            actionUrl: '/orders',
            badgeBg: '#fefce8',
            badgeColor: '#ca8a04'
          });
        }
      });
    }

    // 2. QUICK HELP TABLE SERVICE REQUESTS (Water, Bill, Messages)
    const storedQuickCalls = (() => {
      try {
        return JSON.parse(sessionStorage.getItem('serviq_table_service_calls') || '[]');
      } catch (e) {
        return [];
      }
    })();

    // Default dynamic sample service requests if none stored
    const defaultServiceRequests = [
      {
        id: 'svc-water-1',
        type: 'WATER',
        table: 'Table 4',
        branch: 'Main Branch',
        title: 'Water Refill Requested',
        description: 'Customer at Table 4 requested drinking water bottle & glasses.',
        time: 'Just now',
        timestamp: Date.now() - 30000,
        badgeBg: '#f0f9ff',
        badgeColor: '#0284c7'
      },
      {
        id: 'svc-bill-1',
        type: 'BILL',
        table: 'Table 2',
        branch: 'Main Branch',
        title: 'Bill & Checkout Call',
        description: 'Customer requested final invoice payment (UPI / Cash). Amount: ₹1,450',
        time: '2 mins ago',
        timestamp: Date.now() - 120000,
        badgeBg: '#fefce8',
        badgeColor: '#ca8a04'
      },
      {
        id: 'svc-msg-1',
        type: 'MESSAGE',
        table: 'Table 6',
        branch: 'Main Branch',
        title: 'Customer Assistance Message',
        description: '"Please send extra spicy mint chutney and napkins."',
        time: '5 mins ago',
        timestamp: Date.now() - 300000,
        badgeBg: '#eef2ff',
        badgeColor: '#4f46e5'
      }
    ];

    const finalServiceCalls = storedQuickCalls.length > 0 ? storedQuickCalls : defaultServiceRequests;
    finalServiceCalls.forEach(call => {
      if (matchesBranch(call.branch)) {
        aggregated.push(call);
      }
    });

    // 3. INVENTORY & LOW STOCK ALERTS
    if (activeRestaurant?.inventory && Array.isArray(activeRestaurant.inventory)) {
      activeRestaurant.inventory.filter(item => matchesBranch(item.branchId || item.branch)).forEach(item => {
        const qty = Number(item.quantity || item.stock || 0);
        const minStock = Number(item.minStockLevel || item.minQuantity || 10);

        if (qty === 0) {
          aggregated.push({
            id: `inv-out-${item.id || item._id}`,
            type: 'INVENTORY',
            table: 'Stock Alert',
            branch: item.branchName || 'Kitchen Store',
            title: `Out of Stock: ${item.name}`,
            description: `${item.name} is completely depleted (0 ${item.unit || 'units'}). Replenish urgently to avoid menu disruption.`,
            time: 'Alert',
            timestamp: Date.now() - 600000,
            actionUrl: '/inventory',
            badgeBg: '#fef2f2',
            badgeColor: '#dc2626'
          });
        } else if (qty <= minStock) {
          aggregated.push({
            id: `inv-low-${item.id || item._id}`,
            type: 'INVENTORY',
            table: 'Stock Alert',
            branch: item.branchName || 'Kitchen Store',
            title: `Low Stock: ${item.name}`,
            description: `Only ${qty} ${item.unit || 'units'} remaining (Below minimum threshold of ${minStock}).`,
            time: 'Warning',
            timestamp: Date.now() - 720000,
            actionUrl: '/inventory',
            badgeBg: '#fff7ed',
            badgeColor: '#ea580c'
          });
        }
      });
    }

    // 4. TABLE & SERVICE UNASSIGNED ALERTS
    if (activeRestaurant?.tables && Array.isArray(activeRestaurant.tables)) {
      activeRestaurant.tables.filter(t => matchesBranch(t.branchId || t.branch)).forEach(t => {
        const hasWaiter = t.assignedWaiterId || t.assignedWaiter || t.waiterId;
        const isOccupied = String(t.status || '').toLowerCase() === 'occupied';

        if (isOccupied && !hasWaiter) {
          const tName = t.tableNo || t.tableNumber || (t.name ? t.name : 'Table');
          const formattedT = String(tName).startsWith('Table') ? tName : `Table ${tName}`;
          aggregated.push({
            id: `table-unassigned-${t.id || t._id}`,
            type: 'TABLES',
            table: formattedT,
            branch: t.branchName || 'Dining Area',
            title: `No Waiter Assigned (${formattedT})`,
            description: `${formattedT} is currently occupied with guests but has no assigned waiter.`,
            time: 'Attention',
            timestamp: Date.now() - 180000,
            actionUrl: '/staff',
            badgeBg: '#fff1f2',
            badgeColor: '#e11d48'
          });
        }
      });
    }

    // 5. SUPER ADMIN SUPPORT TICKET RESPONSES & RESOLUTIONS
    if (Array.isArray(liveTickets) && liveTickets.length > 0) {
      liveTickets.forEach(ticket => {
        const tId = ticket._id || ticket.id;
        const tNum = ticket.ticketNumber || (tId ? `#${String(tId).slice(-5).toUpperCase()}` : '#TICKET');
        const tSubject = ticket.subject || 'Support Ticket';
        const tCategory = ticket.category || 'Help & Support';

        // Check for Super Admin replies in ticket.replies / ticket.messages
        const allReplies = Array.isArray(ticket.replies) ? ticket.replies : (Array.isArray(ticket.messages) ? ticket.messages : []);
        const adminReplies = allReplies.filter(r => {
          if (!r) return false;
          const rRole = String(r.role || '').toLowerCase();
          const rSender = String(r.sender || '').toLowerCase();
          return r.isAdmin === true || rRole === 'admin' || rRole === 'superadmin' || rRole === 'super_admin' || rRole === 'support' || rSender.includes('admin') || rSender.includes('support') || rSender.includes('serviq');
        });

        if (adminReplies.length > 0) {
          const lastAdminReply = adminReplies[adminReplies.length - 1];
          const replyText = lastAdminReply.message || lastAdminReply.reply || lastAdminReply.text || 'Super Admin sent a reply to your ticket.';
          const replySender = lastAdminReply.sender || 'Super Admin';
          const replyTime = lastAdminReply.createdAt ? formatDateTimeDMY(lastAdminReply.createdAt) : (ticket.updatedAt ? formatDateTimeDMY(ticket.updatedAt) : 'Recent');
          const replyTimestamp = lastAdminReply.createdAt ? new Date(lastAdminReply.createdAt).getTime() : (ticket.updatedAt ? new Date(ticket.updatedAt).getTime() : Date.now());

          aggregated.push({
            id: `ticket-reply-${tId}`,
            type: 'TICKETS',
            subType: 'SUPER_ADMIN_REPLY',
            table: tNum,
            branch: tCategory,
            title: `Super Admin Response: ${tSubject}`,
            description: `${replySender}: "${replyText}"`,
            time: replyTime,
            timestamp: replyTimestamp,
            actionUrl: `/help-support?ticketId=${tId}`,
            ticketId: tId,
            ticketNumber: tNum,
            badgeBg: '#eff6ff',
            badgeColor: '#2563eb',
            isSuperAdmin: true
          });
        } else if (ticket.adminReply || ticket.adminResponse || ticket.resolution) {
          const replyText = ticket.adminReply || ticket.adminResponse || ticket.resolution;
          aggregated.push({
            id: `ticket-reply-${tId}`,
            type: 'TICKETS',
            subType: 'SUPER_ADMIN_REPLY',
            table: tNum,
            branch: tCategory,
            title: `Super Admin Response: ${tSubject}`,
            description: `Super Admin: "${replyText}"`,
            time: ticket.updatedAt ? formatDateTimeDMY(ticket.updatedAt) : 'Recent',
            timestamp: ticket.updatedAt ? new Date(ticket.updatedAt).getTime() : Date.now(),
            actionUrl: `/help-support?ticketId=${tId}`,
            ticketId: tId,
            ticketNumber: tNum,
            badgeBg: '#eff6ff',
            badgeColor: '#2563eb',
            isSuperAdmin: true
          });
        } else if (String(ticket.status || '').toLowerCase() === 'resolved' || String(ticket.status || '').toLowerCase() === 'in progress') {
          aggregated.push({
            id: `ticket-status-${tId}`,
            type: 'TICKETS',
            subType: 'STATUS_UPDATE',
            table: tNum,
            branch: tCategory,
            title: `Ticket ${ticket.status}: ${tSubject}`,
            description: `Super Admin updated your support ticket status to "${ticket.status}".`,
            time: ticket.updatedAt ? formatDateTimeDMY(ticket.updatedAt) : 'Recent',
            timestamp: ticket.updatedAt ? new Date(ticket.updatedAt).getTime() : Date.now(),
            actionUrl: `/help-support?ticketId=${tId}`,
            ticketId: tId,
            ticketNumber: tNum,
            badgeBg: '#f0fdf4',
            badgeColor: '#16a34a',
            isSuperAdmin: true
          });
        }
      });
    }

    // Default sample super admin reply if no ticket replies yet
    if (aggregated.filter(x => x.type === 'TICKETS').length === 0) {
      aggregated.push({
        id: 'ticket-reply-sample-1',
        type: 'TICKETS',
        subType: 'SUPER_ADMIN_REPLY',
        table: 'TIC-1001',
        branch: 'Billing Support',
        title: 'Super Admin Response: GST Invoice discrepancy',
        description: 'Super Admin: "We have reviewed your request and updated your invoice GST configuration. Please check your billing tab."',
        time: '10 mins ago',
        timestamp: Date.now() - 600000,
        actionUrl: '/help-support?ticketId=TIC-1001',
        ticketId: 'TIC-1001',
        ticketNumber: 'TIC-1001',
        badgeBg: '#eff6ff',
        badgeColor: '#2563eb',
        isSuperAdmin: true
      });
    }

    // Sort by newest timestamp first
    aggregated.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    setNotifications(aggregated);
  }, [activeRestaurant, selectedBranchId, liveTickets]);

  if (!isOpen) return null;

  const handleResolve = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleQuickActionTrigger = (type) => {
    setActiveFilter(prev => prev === type ? 'ALL' : type);
  };

  const handleNavigate = (url) => {
    if (url) {
      navigate(url);
      onClose();
    }
  };

  const ticketsCount = notifications.filter(n => n.type === 'TICKETS').length;
  const ordersCount = notifications.filter(n => n.type === 'ORDERS').length;
  const waterCount = notifications.filter(n => n.type === 'WATER').length;
  const billCount = notifications.filter(n => n.type === 'BILL').length;
  const messageCount = notifications.filter(n => n.type === 'MESSAGE').length;
  const inventoryCount = notifications.filter(n => n.type === 'INVENTORY').length;
  const tablesCount = notifications.filter(n => n.type === 'TABLES').length;

  const filteredNotifications = notifications.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.table.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'ALL' || item.type === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(4px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '50px',
      boxSizing: 'border-box'
    }}>
      {/* Background click listener to close */}
      <div 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
        onClick={onClose} 
      />

      {/* Main Modal Card */}
      <div style={{
        position: 'relative',
        width: '94%',
        maxWidth: '750px',
        maxHeight: '86vh',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeInSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header & Search Area */}
        <div style={{ padding: '20px 24px 16px 24px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Notifications & Table Alerts
              </h2>
              {notifications.length > 0 && (
                <span style={{
                  background: '#ffedd5',
                  color: '#ea580c',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #fed7aa'
                }}>
                  {notifications.length} Active
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => setNotifications([])}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '4px 8px'
                  }}
                >
                  Clear All
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.15s'
                }}
                title="Close"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          {/* Search Input matching Screenshot */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <svg
              style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search for biryani, naan, starters, orders, requests..."
              value={searchQuery}
              onKeyDown={e => {
                if (e.key === ' ' && (!e.currentTarget.value || !e.currentTarget.value.trim())) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => setSearchQuery(e.target.value.replace(/^\s+/, ''))}
              style={{
                width: '100%',
                padding: '11px 16px 11px 42px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontSize: '14px',
                backgroundColor: '#f8fafc',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s, background-color 0.15s'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#ff5a1f'; e.target.style.backgroundColor = '#ffffff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.backgroundColor = '#f8fafc'; }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 700
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* EXACT QUICK HELP COMPONENT FROM SCREENSHOT */}
          {/* EXACT QUICK HELP COMPONENT */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '8px 12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            gap: '10px'
          }}>
            {/* Left: Quick Help with Orange Bell Icon */}
            <div 
              onClick={() => setActiveFilter('ALL')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                userSelect: 'none',
                flexShrink: 0
              }}
              title="Click to view all notifications"
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: activeFilter === 'ALL' ? '#fff7ed' : '#f8fafc',
                border: activeFilter === 'ALL' ? '1.5px solid #fed7aa' : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ea580c',
                flexShrink: 0,
                transition: 'all 0.15s'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
                Quick Help
              </span>
            </div>

            {/* Right: Pill Actions (Orders, Water, Bill, Message, Tickets) in 1 SINGLE clean row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {/* 1. Orders Pill */}
              <button
                type="button"
                onClick={() => handleQuickActionTrigger('ORDERS')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: activeFilter === 'ORDERS' ? '1.5px solid #ea580c' : '1px solid #fed7aa',
                  backgroundColor: activeFilter === 'ORDERS' ? '#ffedd5' : '#fff7ed',
                  color: '#ea580c',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                Orders {ordersCount > 0 && `(${ordersCount})`}
              </button>

              {/* 2. Water Pill */}
              <button
                type="button"
                onClick={() => handleQuickActionTrigger('WATER')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: activeFilter === 'WATER' ? '1.5px solid #0284c7' : '1px solid #bae6fd',
                  backgroundColor: activeFilter === 'WATER' ? '#e0f2fe' : '#f0f9ff',
                  color: '#0284c7',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                </svg>
                Water {waterCount > 0 && `(${waterCount})`}
              </button>

              {/* 3. Bill Pill */}
              <button
                type="button"
                onClick={() => handleQuickActionTrigger('BILL')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: activeFilter === 'BILL' ? '1.5px solid #ca8a04' : '1px solid #fef08a',
                  backgroundColor: activeFilter === 'BILL' ? '#fef9c3' : '#fefce8',
                  color: '#ca8a04',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                Bill {billCount > 0 && `(${billCount})`}
              </button>

              {/* 4. Message Pill */}
              <button
                type="button"
                onClick={() => handleQuickActionTrigger('MESSAGE')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: activeFilter === 'MESSAGE' ? '1.5px solid #475569' : '1px solid #e2e8f0',
                  backgroundColor: activeFilter === 'MESSAGE' ? '#f1f5f9' : '#ffffff',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Message {messageCount > 0 && `(${messageCount})`}
              </button>

              {/* 5. Tickets & Super Admin Responses Pill */}
              <button
                type="button"
                onClick={() => handleQuickActionTrigger('TICKETS')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: activeFilter === 'TICKETS' ? '1.5px solid #2563eb' : '1px solid #bfdbfe',
                  backgroundColor: activeFilter === 'TICKETS' ? '#dbeafe' : '#eff6ff',
                  color: '#2563eb',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title="Super Admin Ticket Responses & Support Replies"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
                  <path d="M13 5v2" />
                  <path d="M13 17v2" />
                  <path d="M13 11v2" />
                </svg>
                Tickets {ticketsCount > 0 && `(${ticketsCount})`}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#f8fafc',
                border: '1px dashed #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>No notifications to display</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                {activeFilter !== 'ALL' ? `No active ${activeFilter.toLowerCase()} alerts.` : 'All restaurant branches, tables, orders, and stocks are running smoothly.'}
              </div>
            </div>
          ) : (
            filteredNotifications.map(notif => {
              const badgeColor = notif.badgeColor || '#ea580c';
              const badgeBg = notif.badgeBg || '#fff7ed';

              return (
                <div
                  key={notif.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: notif.type === 'TICKETS' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: notif.type === 'TICKETS' ? '0 2px 8px rgba(37, 99, 235, 0.06)' : '0 2px 4px rgba(0,0,0,0.01)',
                    transition: 'border-color 0.15s, transform 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: badgeBg,
                      border: `1px solid ${badgeColor}33`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {renderNotificationIcon(notif)}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {notif.title}
                        </span>
                        <span style={{
                          backgroundColor: notif.type === 'TICKETS' ? '#2563eb' : '#0f172a',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          letterSpacing: '0.3px'
                        }}>
                          {notif.table}
                        </span>
                        {notif.type === 'TICKETS' && (
                          <span style={{
                            backgroundColor: '#dbeafe',
                            color: '#1d4ed8',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #bfdbfe'
                          }}>
                            Super Admin Response
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                        {notif.description}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                        {notif.time} • {notif.branch}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'row', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                    {notif.actionUrl && (
                      <button
                        type="button"
                        onClick={() => handleNavigate(notif.actionUrl)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: notif.type === 'TICKETS' ? '#eff6ff' : '#f8fafc',
                          color: notif.type === 'TICKETS' ? '#2563eb' : '#475569',
                          border: notif.type === 'TICKETS' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.backgroundColor = notif.type === 'TICKETS' ? '#2563eb' : '#0f172a'; 
                          e.currentTarget.style.color = '#ffffff'; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.backgroundColor = notif.type === 'TICKETS' ? '#eff6ff' : '#f8fafc'; 
                          e.currentTarget.style.color = notif.type === 'TICKETS' ? '#2563eb' : '#475569'; 
                        }}
                      >
                        {notif.type === 'TICKETS' ? (
                          <>
                            View Reply
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </>
                        ) : (
                          <>
                            View
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="7" y1="17" x2="17" y2="7"></line>
                              <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                          </>
                        )}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleResolve(notif.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f1f5f9',
                        color: '#0f172a',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#22c55e'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#22c55e'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    >
                      Done
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
