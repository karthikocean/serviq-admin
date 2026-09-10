import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../config/AppContext';
import { notificationApi } from '../api/Notification.js';
import { formatDateTimeDMY } from '../helper/DateHelper.js';

// Relative time formatting helper
const formatRelativeTime = (dateInput) => {
  if (!dateInput) return 'Recent';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const diffMs = Date.now() - d.getTime();
    if (diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return formatDateTimeDMY(dateInput);
  } catch (e) {
    return 'Recent';
  }
};

const renderNotificationIcon = (notif) => {
  const color = notif.badgeColor || '#ea580c';
  const reqType = String(notif.requestType || '').toUpperCase();
  const rawType = String(notif.type || '').toUpperCase();

  if (reqType === 'ORDERS' || rawType.includes('ORDER')) {
    if (rawType.includes('READY')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8"></path>
          <path d="M12 2v6"></path>
          <line x1="4" y1="22" x2="20" y2="22"></line>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
    );
  }

  if (reqType === 'WATER') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
      </svg>
    );
  }

  if (reqType === 'BILL') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    );
  }

  if (reqType === 'MESSAGE') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    );
  }

  if (notif.source === 'SUPER_ADMIN' || reqType === 'SUPERADMIN') {
    if (rawType.includes('UPDATE') || rawType.includes('FEATURE')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      );
    }
    if (rawType.includes('MAINTENANCE')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      );
    }
    if (rawType.includes('SUBSCRIPTION') || rawType.includes('EXPIRY')) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
    </svg>
  );
};

export default function NotificationModal({ isOpen, onClose }) {
  const { selectedBranchId } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSourceTab, setActiveSourceTab] = useState('CUSTOMER'); // 'CUSTOMER' | 'SUPERADMIN'
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'ORDERS' | 'WATER' | 'BILL' | 'MESSAGE'
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [counts, setCounts] = useState({
    totalActive: 0,
    totalCount: 0,
    customerWebsite: 0,
    customerWebsiteUnread: 0,
    superAdmin: 0,
    superAdminUnread: 0,
    quickHelp: {
      orders: 0,
      water: 0,
      bill: 0,
      message: 0
    }
  });

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    target: 'All Staff',
    priority: 'Normal',
    branch: 'All Branches'
  });

  // Fetch notifications from live backend API
  const fetchLiveNotifications = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);

    const typeParam = activeSourceTab === 'CUSTOMER' ? 'customer' : 'superadmin';
    const params = {
      type: typeParam,
    };

    if (activeSourceTab === 'CUSTOMER' && activeFilter !== 'ALL') {
      params.requestType = activeFilter.toLowerCase();
    }

    if (selectedBranchId && selectedBranchId !== 'ALL') {
      params.branchId = selectedBranchId;
    }

    try {
      const res = await notificationApi.getNotifications(params);
      if (res.status && res.data) {
        const data = res.data;

        // Store counts from API
        if (data.counts) {
          setCounts(data.counts);
        }

        // Determine notification list based on active tab
        let rawList = [];
        if (activeSourceTab === 'CUSTOMER') {
          rawList = data.customerWebsiteNotifications || data.notifications || data.allNotifications || [];
        } else {
          rawList = data.superAdminNotifications || data.notifications || data.allNotifications || [];
        }

        if (!Array.isArray(rawList) && Array.isArray(data)) {
          rawList = data;
        }

        // Map and format notifications
        const formatted = (rawList || []).map((item) => {
          const reqType = item.requestType || 'General';
          const isSuper = item.source === 'SUPER_ADMIN' || reqType === 'SuperAdmin';
          
          // Badge colors
          let badgeBg = '#fff7ed';
          let badgeColor = '#ea580c';

          if (isSuper) {
            badgeBg = '#ede9fe';
            badgeColor = '#7c3aed';
          } else if (String(reqType).toUpperCase() === 'WATER') {
            badgeBg = '#f0f9ff';
            badgeColor = '#0284c7';
          } else if (String(reqType).toUpperCase() === 'BILL') {
            badgeBg = '#fefce8';
            badgeColor = '#ca8a04';
          } else if (String(reqType).toUpperCase() === 'MESSAGE') {
            badgeBg = '#f1f5f9';
            badgeColor = '#475569';
          } else if (String(item.type).toUpperCase().includes('READY')) {
            badgeBg = '#f0fdf4';
            badgeColor = '#16a34a';
          }

          // Extract table label if available
          let tableLabel = null;
          if (item.table) {
            tableLabel = typeof item.table === 'object' ? (item.table.tableNumber || item.table.name) : item.table;
          } else if (item.message && typeof item.message === 'string') {
            const match = item.message.match(/TBL-[A-Z0-9-]+/i) || item.message.match(/Table\s+[A-Za-z0-9-]+/i);
            if (match) tableLabel = match[0];
          }

          if (!tableLabel) {
            tableLabel = isSuper ? 'Super Admin' : 'Customer';
          }

          // Branch label
          const branchLabel = item.branch?.branchName || (typeof item.branch === 'string' ? item.branch : 'Main Branch');

          // Action URL
          let actionUrl = null;
          if (item.orderId || String(reqType).toUpperCase() === 'ORDERS' || String(item.type).includes('ORDER')) {
            actionUrl = '/orders';
          } else if (isSuper) {
            if (String(item.type).includes('Subscription')) actionUrl = '/plans-management';
            else if (String(item.type).includes('Ticket')) actionUrl = '/help-support';
          }

          return {
            id: item._id || item.id,
            source: item.source,
            type: item.type,
            requestType: item.requestType,
            title: item.title || 'Notification',
            message: item.message || '',
            table: tableLabel,
            branch: branchLabel,
            orderId: item.orderId,
            isRead: !!item.isRead,
            createdAt: item.createdAt,
            timestamp: item.createdAt ? new Date(item.createdAt).getTime() : Date.now(),
            time: formatRelativeTime(item.createdAt),
            status: item.status,
            badgeBg,
            badgeColor,
            actionUrl
          };
        });

        // Sort descending by timestamp
        formatted.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setNotifications(formatted);
      }
    } catch (e) {
      console.warn('Error fetching live notifications:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, activeSourceTab, activeFilter, selectedBranchId]);

  useEffect(() => {
    fetchLiveNotifications();
  }, [fetchLiveNotifications]);

  if (!isOpen) return null;

  const handleResolve = async (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setCounts(prev => ({
      ...prev,
      totalActive: Math.max(0, (prev.totalActive || 1) - 1),
      totalCount: Math.max(0, (prev.totalCount || 1) - 1),
      customerWebsite: activeSourceTab === 'CUSTOMER' ? Math.max(0, (prev.customerWebsite || 1) - 1) : prev.customerWebsite,
      superAdmin: activeSourceTab === 'SUPERADMIN' ? Math.max(0, (prev.superAdmin || 1) - 1) : prev.superAdmin
    }));
    try {
      await notificationApi.markAsRead(id);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setCounts(prev => ({
      ...prev,
      totalActive: 0,
      customerWebsite: activeSourceTab === 'CUSTOMER' ? 0 : prev.customerWebsite,
      customerWebsiteUnread: activeSourceTab === 'CUSTOMER' ? 0 : prev.customerWebsiteUnread,
      superAdmin: activeSourceTab === 'SUPERADMIN' ? 0 : prev.superAdmin,
      superAdminUnread: activeSourceTab === 'SUPERADMIN' ? 0 : prev.superAdminUnread
    }));
    try {
      await notificationApi.markAllAsRead({
        type: activeSourceTab === 'CUSTOMER' ? 'customer' : 'superadmin',
        branchId: selectedBranchId !== 'ALL' ? selectedBranchId : undefined
      });
    } catch (e) {
      console.warn(e);
    }
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

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;

    const newNotif = {
      id: `broadcast-${Date.now()}`,
      source: 'SUPER_ADMIN',
      type: 'Feature Updates',
      requestType: 'SuperAdmin',
      table: broadcastForm.target,
      branch: broadcastForm.branch || (selectedBranchId && selectedBranchId !== 'ALL' ? 'Current Branch' : 'All Branches'),
      title: broadcastForm.title.trim(),
      message: broadcastForm.message.trim(),
      time: 'Just now',
      timestamp: Date.now(),
      priority: broadcastForm.priority,
      badgeBg: '#ede9fe',
      badgeColor: '#7c3aed',
      isRead: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    setBroadcastForm({
      title: '',
      message: '',
      target: 'All Staff',
      priority: 'Normal',
      branch: 'All Branches'
    });
    setIsBroadcastModalOpen(false);
    setActiveSourceTab('SUPERADMIN');
  };

  // Local filter for search query
  const filteredNotifications = notifications.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.message && item.message.toLowerCase().includes(q)) ||
      (item.table && String(item.table).toLowerCase().includes(q)) ||
      (item.branch && String(item.branch).toLowerCase().includes(q))
    );
  });

  const customerTabCount = counts.customerWebsite || (activeSourceTab === 'CUSTOMER' ? notifications.length : 0);
  const superAdminTabCount = counts.superAdmin || (activeSourceTab === 'SUPERADMIN' ? notifications.length : 0);
  const totalActiveCount = counts.totalActive || (customerTabCount + superAdminTabCount);

  const ordersCount = counts.quickHelp?.orders ?? notifications.filter(n => String(n.requestType).toUpperCase() === 'ORDERS' || String(n.type).includes('ORDER')).length;
  const waterCount = counts.quickHelp?.water ?? notifications.filter(n => String(n.requestType).toUpperCase() === 'WATER').length;
  const billCount = counts.quickHelp?.bill ?? notifications.filter(n => String(n.requestType).toUpperCase() === 'BILL').length;
  const messageCount = counts.quickHelp?.message ?? notifications.filter(n => String(n.requestType).toUpperCase() === 'MESSAGE').length;

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
        maxWidth: '780px',
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Notifications & Table Alerts
              </h2>
              {totalActiveCount > 0 && (
                <span style={{
                  background: '#ffedd5',
                  color: '#ea580c',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #fed7aa'
                }}>
                  {totalActiveCount} Active
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {activeSourceTab === 'SUPERADMIN' && (
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  style={{
                    border: 'none',
                    background: '#ede9fe',
                    color: '#7c3aed',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Broadcast
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
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

          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '14px' }}>
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
              placeholder="Search notifications, table number, requests, branch..."
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

          {/* PRIMARY TABS: Customer Website vs SuperAdmin */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '12px',
            gap: '4px'
          }}>
            <button
              type="button"
              onClick={() => {
                setActiveSourceTab('CUSTOMER');
                setActiveFilter('ALL');
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '9px',
                border: 'none',
                background: activeSourceTab === 'CUSTOMER' ? '#ffffff' : 'transparent',
                color: activeSourceTab === 'CUSTOMER' ? '#0f172a' : '#64748b',
                fontWeight: activeSourceTab === 'CUSTOMER' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeSourceTab === 'CUSTOMER' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activeSourceTab === 'CUSTOMER' ? '#ea580c' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              Customer Website
              {customerTabCount > 0 && (
                <span style={{
                  background: activeSourceTab === 'CUSTOMER' ? '#ffedd5' : '#e2e8f0',
                  color: activeSourceTab === 'CUSTOMER' ? '#ea580c' : '#475569',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: '9999px'
                }}>
                  {customerTabCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSourceTab('SUPERADMIN');
                setActiveFilter('ALL');
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '9px',
                border: 'none',
                background: activeSourceTab === 'SUPERADMIN' ? '#ffffff' : 'transparent',
                color: activeSourceTab === 'SUPERADMIN' ? '#0f172a' : '#64748b',
                fontWeight: activeSourceTab === 'SUPERADMIN' ? 800 : 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: activeSourceTab === 'SUPERADMIN' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={activeSourceTab === 'SUPERADMIN' ? '#7c3aed' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              SuperAdmin
              {superAdminTabCount > 0 && (
                <span style={{
                  background: activeSourceTab === 'SUPERADMIN' ? '#ede9fe' : '#e2e8f0',
                  color: activeSourceTab === 'SUPERADMIN' ? '#7c3aed' : '#475569',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: '9999px'
                }}>
                  {superAdminTabCount}
                </span>
              )}
            </button>
          </div>

          {/* QUICK HELP / SUB-FILTER BAR */}
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
            {/* Left Action: View All */}
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
              title={`Click to view all ${activeSourceTab === 'CUSTOMER' ? 'customer' : 'superadmin'} notifications`}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: activeFilter === 'ALL' 
                  ? (activeSourceTab === 'CUSTOMER' ? '#fff7ed' : '#f5f3ff')
                  : '#f8fafc',
                border: activeFilter === 'ALL' 
                  ? (activeSourceTab === 'CUSTOMER' ? '1.5px solid #fed7aa' : '1.5px solid #ddd6fe')
                  : '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeSourceTab === 'CUSTOMER' ? '#ea580c' : '#7c3aed',
                flexShrink: 0,
                transition: 'all 0.15s'
              }}>
                {activeSourceTab === 'CUSTOMER' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px', whiteSpace: 'nowrap' }}>
                {activeSourceTab === 'CUSTOMER' ? 'Quick Help' : 'SuperAdmin Alerts'}
              </span>
            </div>

            {/* Right: Sub-filter Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'nowrap',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {activeSourceTab === 'CUSTOMER' ? (
                <>
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
                </>
              ) : (
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, padding: '4px 8px' }}>
                  Platform & SuperAdmin Notices
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #ea580c',
                borderRadius: '50%',
                margin: '0 auto 12px auto',
                animation: 'spin 1s linear infinite'
              }}></div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Loading notifications...</div>
            </div>
          ) : filteredNotifications.length === 0 ? (
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
                {activeFilter !== 'ALL' 
                  ? `No active ${activeFilter.toLowerCase()} alerts.` 
                  : (activeSourceTab === 'CUSTOMER' ? 'No active table or customer website alerts.' : 'No active SuperAdmin announcements.')}
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
                    backgroundColor: notif.isRead ? '#ffffff' : '#fafafa',
                    border: notif.source === 'SUPER_ADMIN' ? '1px solid #ddd6fe' : (notif.isRead ? '1px solid #e2e8f0' : '1px solid #fed7aa'),
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '14px',
                    boxShadow: notif.source === 'SUPER_ADMIN' ? '0 2px 8px rgba(124, 58, 237, 0.06)' : '0 2px 4px rgba(0,0,0,0.01)',
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

                        {notif.table && (
                          <span style={{
                            backgroundColor: notif.source === 'SUPER_ADMIN' ? '#7c3aed' : '#0f172a',
                            color: '#ffffff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            letterSpacing: '0.3px'
                          }}>
                            {notif.table}
                          </span>
                        )}

                        {notif.source === 'SUPER_ADMIN' && (
                          <span style={{
                            backgroundColor: '#ede9fe',
                            color: '#6d28d9',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #ddd6fe'
                          }}>
                            {notif.type || 'SuperAdmin'}
                          </span>
                        )}

                        {!notif.isRead && (
                          <span style={{
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: '#ea580c',
                            display: 'inline-block'
                          }} title="Unread" />
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                        {notif.message}
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
                          backgroundColor: '#f8fafc',
                          color: '#475569',
                          border: '1px solid #e2e8f0',
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
                          e.currentTarget.style.backgroundColor = '#0f172a'; 
                          e.currentTarget.style.color = '#ffffff'; 
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.backgroundColor = '#f8fafc'; 
                          e.currentTarget.style.color = '#475569'; 
                        }}
                      >
                        View
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="7" y1="17" x2="17" y2="7"></line>
                          <polyline points="7 7 17 7 17 17"></polyline>
                        </svg>
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

      {/* Broadcast Composer Modal Overlay */}
      {isBroadcastModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box'
        }}>
          <div 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
            onClick={() => setIsBroadcastModalOpen(false)}
          />

          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            padding: '24px',
            zIndex: 1,
            animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ede9fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"></path>
                    <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"></path>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"></path>
                    <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1"></path>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    Send Broadcast Notification
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    Broadcast instant alert across staff, kitchen, or customer tables
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBroadcastModalOpen(false)}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            {/* Quick Templates */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Quick Templates
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { label: '🔥 Peak Rush', title: 'Peak Dinner Rush Alert', message: 'High table volume expected. Kitchen and floor staff please expedite orders.', target: 'All Staff', priority: 'High' },
                  { label: '⭐ Special Promo', title: 'Chef Special Promo Active', message: 'Special chef combo is active today. Inform dining guests for upsell.', target: 'Waiters & Floor', priority: 'Normal' },
                  { label: '⚠️ Kitchen Delay', title: 'Kitchen Order Prep Delay', message: 'Main course preparation is running with a 10-15 min queue delay.', target: 'Kitchen Staff', priority: 'High' },
                  { label: '📋 Shift Briefing', title: 'Staff Shift Briefing Notice', message: 'Quick 5-minute huddle near captain desk before service starts.', target: 'All Staff', priority: 'Normal' }
                ].map((tpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setBroadcastForm(prev => ({
                      ...prev,
                      title: tpl.title,
                      message: tpl.message,
                      target: tpl.target,
                      priority: tpl.priority
                    }))}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#f8fafc',
                      color: '#334155',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ede9fe'; e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = '#6d28d9'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155'; }}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSendBroadcast}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Target Audience
                  </label>
                  <select
                    value={broadcastForm.target}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, target: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="All Staff">All Staff</option>
                    <option value="Kitchen Staff">Kitchen Staff</option>
                    <option value="Waiters & Floor">Waiters & Floor</option>
                    <option value="All Dining Tables">All Dining Tables (Customer App)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={broadcastForm.priority}
                    onChange={(e) => setBroadcastForm(prev => ({ ...prev, priority: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="Normal">Normal (Standard Alert)</option>
                    <option value="High">High (Urgent Priority 🔥)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="e.g. Peak Dinner Rush Alert"
                  value={broadcastForm.title}
                  onKeyDown={e => {
                    if (e.key === ' ' && (!e.currentTarget.value || !e.currentTarget.value.trim())) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, title: e.target.value.replace(/^\s+/, '') }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Broadcast Message *
                </label>
                <textarea
                  required
                  rows={3}
                  autoComplete="off"
                  placeholder="Write clear instructions or announcement details..."
                  value={broadcastForm.message}
                  onKeyDown={e => {
                    if (e.key === ' ' && (!e.currentTarget.value || !e.currentTarget.value.trim())) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setBroadcastForm(prev => ({ ...prev, message: e.target.value.replace(/^\s+/, '') }))}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(124, 58, 237, 0.3)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#6d28d9'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
