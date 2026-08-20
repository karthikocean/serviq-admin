import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, Link, Navigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import BranchSearchDropdown from '../components/BranchSearchDropdown';
import ShowNotifications from '../helper/ShowNotifications';

export default function AdminLayout() {
  const {
    currentUser,
    activeRestaurant,
    logout,
    selectedBranchId
  } = useAppState();

  const location = useLocation();
  const navigate = useNavigate();

  // If unauthenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const [sidebarWaiterOpen, setSidebarWaiterOpen] = useState(location.pathname.startsWith('/waiter'));
  const [sidebarKitchenOpen, setSidebarKitchenOpen] = useState(location.pathname.startsWith('/kitchen'));
  const [sidebarBillingOpen, setSidebarBillingOpen] = useState(location.pathname.startsWith('/billing'));
  const [sidebarInventoryOpen, setSidebarInventoryOpen] = useState(location.pathname.startsWith('/inventory'));
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [dateTimeStr, setDateTimeStr] = useState('');

  // Live Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      };
      setDateTimeStr(now.toLocaleString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const restaurantName = activeRestaurant?.name || 'Serviq';
  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null ? currentUser?.role?.roleName : (currentUser?.role || '');
  const role = roleStr || 'Admin';
  const userType = (currentUser?.userType || roleStr || '').toUpperCase();
  const userRoleLower = (roleStr || '').toLowerCase();
  const isAdmin = userRoleLower === 'admin' || userRoleLower === 'super admin' || userRoleLower === 'owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';

  // Permission checks
  const hasPermission = (moduleName, action = 'view') => {
    // Branch management is ONLY accessible to Admin role
    if (moduleName === 'branch-management' || moduleName === 'branches') {
      return isAdmin;
    }

    if (isAdmin) return true;

    // Use the permissions object directly embedded in the user's role if it exists
    if (typeof currentUser?.role === 'object' && currentUser?.role?.permissions) {
      const modulePerms = currentUser.role.permissions[moduleName] || {};
      return !!modulePerms[action];
    }

    const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || rolesConfig[currentUser?.userType] || DEFAULT_ROLES[role] || DEFAULT_ROLES[currentUser?.userType] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  const isTabAllowed = (permissionKey) => {
    // If tab is branch-management or plans, ONLY Admin role can view it
    if (permissionKey === 'branch-management' || permissionKey === 'plans-management') {
      return isAdmin;
    }

    if (isAdmin) return true;

    return hasPermission(permissionKey, 'view');
  };

  // Dynamic Route Titles
  const getRouteTitle = () => {
    const p = location.pathname;
    if (p === '/' || p === '/dashboard' || p === '/overview') return 'Dashboard';
    if (p.startsWith('/branch-management') || p.startsWith('/branches')) return 'Branch Management';
    if (p.startsWith('/plans-management') || p.startsWith('/plans')) return 'Plans & Subscription';
    if (p === '/inventory/stock-reduction') return 'Stock Reduction';
    if (p === '/inventory/categories') return 'Inventory Categories';
    if (p.startsWith('/inventory')) return 'Inventory Management';
    if (p === '/tables/add') return 'Add Dining Table';
    if (p.startsWith('/tables/edit')) return 'Edit Dining Table';
    if (p.startsWith('/tables')) return 'Table Management';
    if (p === '/menu/categories') return 'Category List';
    if (p.startsWith('/menu')) return 'Menu Management';
    if (p.startsWith('/orders')) return 'Order Management';
    if (p.startsWith('/service-requests') || p.startsWith('/requests')) return 'Service Requests';
    if (p.startsWith('/feedback')) return 'Customer Feedback';
    if (p === '/staff/add' || p === '/waiter/add') return 'Add Staff Member';
    if (p.startsWith('/staff/edit') || p.startsWith('/waiter/edit')) return 'Edit Staff Member';
    if (p === '/staff/kitchen-settings' || p === '/kitchen/settings') return 'Kitchen Station Settings';
    if (p.startsWith('/staff') || p.startsWith('/waiter') || p.startsWith('/kitchen')) return 'Staff Management';
    if (p === '/billing/history') return 'Billing History';
    if (p.startsWith('/billing')) return 'Current Billing';
    if (p.startsWith('/reports')) return 'Reports & Analytics';
    if (p.startsWith('/users')) return 'User Accounts';
    if (p.startsWith('/roles-permissions')) return 'Roles & Permission';
    if (p.startsWith('/settings')) return 'Restaurant Settings';
    return 'Dashboard';
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Pending orders badge count
  const pendingOrdersCount = (activeRestaurant?.orders || []).filter(o =>
    (!selectedBranchId || o.branchId === selectedBranchId) && (o.status === 'new' || o.status === 'preparing')
  ).length;

  // Pending waiter requests count
  const pendingWaiterRequestsCount = (activeRestaurant?.waiterRequests || activeRestaurant?.serviceRequests || []).filter(r =>
    (!selectedBranchId || r.branchId === selectedBranchId) && (r.status === 'Pending')
  ).length;

  const pathname = location.pathname;
  const isDashboardActive = pathname === '/' || pathname === '/dashboard' || pathname === '/overview';
  const isBranchActive = pathname.startsWith('/branch-management') || pathname.startsWith('/branches');
  const isPlansActive = pathname.startsWith('/plans-management') || pathname.startsWith('/plans');
  const isTablesActive = pathname.startsWith('/tables');
  const isMenuActive = pathname.startsWith('/menu');
  const isInventoryActive = pathname.startsWith('/inventory');
  const isOrdersActive = pathname.startsWith('/orders');
  const isFeedbackActive = pathname.startsWith('/feedback');
  const isStaffActive = pathname.startsWith('/staff') || pathname.startsWith('/waiter') || pathname.startsWith('/kitchen');
  const isUsersActive = pathname.startsWith('/users');
  const isRolesActive = pathname.startsWith('/roles-permissions');
  const isBillingActive = pathname.startsWith('/billing');
  const isReportsActive = pathname.startsWith('/reports');
  const isSettingsActive = pathname.startsWith('/settings');

  const currentSubPlan = (activeRestaurant?.subscription?.planName || activeRestaurant?.plan || '').toLowerCase();
  const isCurrentPremium = currentSubPlan.includes('premium') || (activeRestaurant?.subscription?.planId || '').includes('premium');

  return (
    <div id="dashboard-view" className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px 20px', gap: '2px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>Serviq</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {activeRestaurant?.subscription?.planName || activeRestaurant?.plan || 'Standard'} Plan
          </span>
        </div>

        <ul className="sidebar-menu">
          {/* 1. Dashboard */}
          {isTabAllowed('dashboard') && (
            <li className={`sidebar-item ${isDashboardActive ? 'active' : ''}`}>
              <Link to="/dashboard">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </span>
                <span className="sidebar-item-label">Dashboard</span>
              </Link>
            </li>
          )}

          {/* 2. Branch Management */}
          {isTabAllowed('branch-management') && (
            <li className={`sidebar-item ${isBranchActive ? 'active' : ''}`}>
              <Link to="/branch-management">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </span>
                <span className="sidebar-item-label">Branch Management</span>
              </Link>
            </li>
          )}

          {/* 3. Plans Management */}
          {isTabAllowed('plans-management') && (
            <li className={`sidebar-item ${isPlansActive ? 'active' : ''}`}>
              <Link to="/plans-management">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><path d="M12 15h2"></path><path d="M6 15h2"></path></svg>
                </span>
                <span className="sidebar-item-label">Plans Management</span>
              </Link>
            </li>
          )}

          {/* 4. Table Management */}
          {isTabAllowed('tables') && (
            <li className={`sidebar-item ${isTablesActive ? 'active' : ''}`}>
              <Link to="/tables">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16"></path><path d="M5 6v12"></path><path d="M19 6v12"></path><path d="M10 6v6"></path><path d="M14 6v6"></path></svg>
                </span>
                <span className="sidebar-item-label">Table Management</span>
              </Link>
            </li>
          )}

          {/* 5. Menu Management */}
          {isTabAllowed('menu') && (
            <li className={`sidebar-item ${isMenuActive ? 'active' : ''}`}>
              <Link to="/menu">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </span>
                <span className="sidebar-item-label">Menu Management</span>
              </Link>
            </li>
          )}

          {/* 6. Inventory Management Dropdown */}
          {isTabAllowed('inventory') && (
            <li className={`sidebar-group ${sidebarInventoryOpen ? 'open' : ''}`}>
              <div
                className={`sidebar-item dropdown-trigger ${isInventoryActive ? 'active' : ''}`}
                onClick={() => setSidebarInventoryOpen(!sidebarInventoryOpen)}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={e => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <span className="sidebar-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                  </span>
                  <span className="sidebar-item-label">Inventory Management</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        transform: sidebarInventoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </span>
                </a>
              </div>
              {sidebarInventoryOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${pathname === '/inventory/categories' ? 'active' : ''}`}>
                    <Link to="/inventory/categories">
                      <span>Category</span>
                    </Link>
                  </li>
                  <li className={`sidebar-item ${pathname === '/inventory' || pathname === '/inventory/items' ? 'active' : ''}`}>
                    <Link to="/inventory">
                      <span>Item Name</span>
                    </Link>
                  </li>
                  <li className={`sidebar-item ${pathname === '/inventory/stock-reduction' ? 'active' : ''}`}>
                    <Link to="/inventory/stock-reduction">
                      <span>Stock Reduction</span>
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* 7. Order Management */}
          {isTabAllowed('orders') && (
            <li className={`sidebar-item ${isOrdersActive ? 'active' : ''}`}>
              <Link to="/orders">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                </span>
                <span className="sidebar-item-label">Order Management</span>
                {pendingOrdersCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ff5a1f',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px'
                  }}>
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
            </li>
          )}

          {/* 8. Customer Feedback */}
          <li className={`sidebar-item ${isFeedbackActive ? 'active' : ''}`}>
            <Link to="/feedback">
              <span className="sidebar-icon-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <polygon points="12 7 13.2 9.6 16 10 14 12 14.5 14.8 12 13.4 9.5 14.8 10 12 8 10 10.8 9.6 12 7" fill="currentColor" />
                </svg>
              </span>
              <span className="sidebar-item-label">Feedback</span>
            </Link>
          </li>

          {/* 9. Staff Management (Combined Waiters, Kitchen & Waiter Requests) */}
          {isTabAllowed('staff_management') && (
            <li className={`sidebar-item ${isStaffActive ? 'active' : ''}`}>
              <Link to="/staff">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </span>
                <span className="sidebar-item-label">Staff Management</span>
                {pendingWaiterRequestsCount > 0 && (
                  <span style={{
                    marginLeft: 'auto',
                    background: '#ea580c',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '10px'
                  }}>
                    {pendingWaiterRequestsCount}
                  </span>
                )}
              </Link>
            </li>
          )}



          {/* 9. Roles & Permission */}
          {isTabAllowed('settings') && (
            <li className={`sidebar-item ${isRolesActive ? 'active' : ''}`}>
              <Link to="/roles-permissions">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </span>
                <span className="sidebar-item-label">Roles & Permission</span>
              </Link>
            </li>
          )}

          {/* 10. Billing Dropdown */}
          {isTabAllowed('billing') && (
            <li className={`sidebar-group ${sidebarBillingOpen ? 'open' : ''}`}>
              <div
                className={`sidebar-item dropdown-trigger ${isBillingActive && !sidebarBillingOpen ? 'active' : ''}`}
                onClick={() => setSidebarBillingOpen(!sidebarBillingOpen)}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={(e) => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <span className="sidebar-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  </span>
                  <span className="sidebar-item-label">Billing</span>
                  {sidebarBillingOpen ?
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="18 15 12 9 6 15" /></svg> :
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                  }
                </a>
              </div>
              {sidebarBillingOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${pathname === '/billing' ? 'active' : ''}`}>
                    <Link to="/billing">Current Billing</Link>
                  </li>
                  <li className={`sidebar-item ${pathname === '/billing/history' ? 'active' : ''}`}>
                    <Link to="/billing/history">Billing History</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* 11. Reports (Unified with Waiter & Kitchen Reports) */}
          {isTabAllowed('reports_analytics') && (
            <li className={`sidebar-item ${isReportsActive ? 'active' : ''}`}>
              <Link to="/reports">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                </span>
                <span className="sidebar-item-label">Reports</span>
              </Link>
            </li>
          )}

          {/* 12. Settings */}
          {isTabAllowed('settings') && (
            <li className={`sidebar-item ${isSettingsActive ? 'active' : ''}`}>
              <Link to="/settings">
                <span className="sidebar-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </span>
                <span className="sidebar-item-label">Settings</span>
              </Link>
            </li>
          )}
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ position: 'relative' }}>
        {/* HEADER */}
        <header className="main-header">
          <div className="header-title-container">
            <h1 className="header-title">{getRouteTitle()}</h1>
            <span className="header-subtitle-date">{dateTimeStr}</span>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <BranchSearchDropdown />
            <button className="btn btn-notify" style={{ position: 'relative' }} onClick={() => ShowNotifications.showAlertNotification('No new notifications.', false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              {pendingOrdersCount > 0 && (
                <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></div>
              )}
            </button>

            {/* PROFILE DROPDOWN */}
            <div style={{ position: 'relative' }}>
              <button
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  fontWeight: 800,
                  fontSize: '18px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                {restaurantName.charAt(0).toUpperCase()}
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999 }}
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '52px',
                    right: '0',
                    width: '260px',
                    background: '#1e1e1e',
                    borderRadius: '16px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    border: '1px solid #333333',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #333333' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                        color: 'white',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        fontWeight: 800,
                        fontSize: '22px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {restaurantName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: '15px', color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {currentUser?.name || 'Serviq Admin'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#a1a1aa', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {currentUser?.email || 'admin@saravana.com'}
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '8px' }}>
                      <button
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          padding: '12px 16px',
                          color: '#e4e4e7',
                          fontSize: '14px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#27272a'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        onClick={handleLogout}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
                          Log Out
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* CONTENT BODY */}
        <div className="content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
