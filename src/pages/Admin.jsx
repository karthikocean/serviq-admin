import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Routes, Route, Navigate } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';

// Import split page components
import Dashboard from './Dashboard/Dashboard';
import OrderManagement from './OrderManagement/OrderManagement';
import MenuManagement from './MenuManagement/MenuManagement';
import TableManagement from './TableManagement/TableManagement';
import QRCodeManagement from './QRCodeManagement/QRCodeManagement';
import Billing from './Billing/Billing';
import WaiterManagement from './WaiterManagement/WaiterManagement';
import KitchenManagement from './KitchenManagement/KitchenManagement';
import Reports from './Reports/Reports';
import Users from './Users/Users';
import Settings from './Settings/Settings';

const KitchenIcon = ({ size = 18, color = 'currentColor', style }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '12px', ...style }}>
    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
    <path d="M7 2v20" />
    <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
    <path d="M19 15v7" />
  </svg>
);

export default function Admin() {
  const {
    currentUser,
    activeRestaurant,
    isImpersonating,
    exitImpersonation,
    logout
  } = useAppState();

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Map paths to tabs for permission checking and title resolving
  const pathToTabMap = {
    '/dashboard': 'overview',
    '/orders': 'orders',
    '/menu': 'menu',
    '/billing': 'billing',
    '/tables': 'tables',
    '/qr-code-config': 'qr-code-config',
    '/waiter/list': 'waiter-list',
    '/waiter/reports': 'waiter-reports',
    '/kitchen/list': 'kitchen-list',
    '/kitchen/reports': 'kitchen-reports',
    '/reports': 'reports',
    '/roles-permissions': 'roles-permissions',
    '/users': 'users',
    '/settings': 'settings'
  };

  const getTabFromPath = (path) => {
    if (pathToTabMap[path]) return pathToTabMap[path];
    for (let key in pathToTabMap) {
      if (path.startsWith(key)) return pathToTabMap[key];
    }
    return 'overview';
  };

  const activeTab = getTabFromPath(currentPath);
  const [dateTimeStr, setDateTimeStr] = useState('');

  // Sidebar Dropdown states
  const [sidebarWaiterOpen, setSidebarWaiterOpen] = useState(false);
  const [sidebarKitchenOpen, setSidebarKitchenOpen] = useState(false);
  const [sidebarUsersOpen, setSidebarUsersOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Automatically expand sidebar dropdowns based on path
  useEffect(() => {
    if (activeTab === 'waiter-list' || activeTab === 'waiter-reports') {
      setSidebarWaiterOpen(true);
    }
    if (activeTab === 'kitchen-list' || activeTab === 'kitchen-reports') {
      setSidebarKitchenOpen(true);
    }
    if (activeTab === 'roles-permissions' || activeTab === 'users') {
      setSidebarUsersOpen(true);
    }
  }, [activeTab]);

  const tabTitles = {
    'overview': 'Dashboard Overview',
    'orders': 'Incoming Orders',
    'menu': 'Menu Management',
    'billing': 'Billing & Settlement',
    'tables': 'Dining Tables & QR Management',
    'waiter-list': 'Waiter Management',
    'waiter-reports': 'Waiter Performance Reports',
    'kitchen-list': 'Kitchen Management',
    'kitchen-reports': 'Kitchen KOT Reports',
    'reports': 'Business Reports & Analytics',
    'roles-permissions': 'Roles & Permissions',
    'users': 'User Management',
    'settings': 'Store Configurations',
    'qr-code-config': 'QR Code Management'
  };

  // Setup Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      setDateTimeStr(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!activeRestaurant) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No active restaurant loaded. Please log in again.</div>;
  }

  const { name, plan, orders = [] } = activeRestaurant;

  // Filter sidebar based on role
  const role = currentUser?.role || 'Waiter';
  const hasPermission = (moduleName, action = 'view') => {
    if (role === 'Admin') return true;
    const rolesConfig = activeRestaurant.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  };

  const isTabAllowed = (tab) => {
    if (role === 'Admin') return true;

    let moduleName = tab;
    if (tab === 'qr-code-config') moduleName = 'tables';
    if (tab === 'waiter-list' || tab === 'waiter-reports') moduleName = 'waiter';
    if (tab === 'kitchen-list' || tab === 'kitchen-reports') moduleName = 'kitchen';
    if (tab === 'users') moduleName = 'users';
    if (tab === 'roles-permissions') moduleName = 'roles-permissions';

    if (role === 'Waiter' && tab === 'kitchen-list') {
      return ['Premium', 'Enterprise'].includes(plan) && hasPermission(moduleName, 'view');
    }

    return hasPermission(moduleName, 'view');
  };

  // Redirect to allowed tab if not permitted, or route default / dashboard
  useEffect(() => {
    if (currentPath === '/' || currentPath === '') {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (!isTabAllowed(activeTab)) {
      const tabsOrder = [
        'overview',
        'orders',
        'menu',
        'billing',
        'tables',
        'waiter-list',
        'waiter-reports',
        'kitchen-list',
        'kitchen-reports',
        'reports',
        'roles-permissions',
        'users',
        'settings',
        'qr-code-config'
      ];

      const tabToPathMap = {
        'overview': '/dashboard',
        'orders': '/orders',
        'menu': '/menu',
        'billing': '/billing',
        'tables': '/tables',
        'waiter-list': '/waiter/list',
        'waiter-reports': '/waiter/reports',
        'kitchen-list': '/kitchen/list',
        'kitchen-reports': '/kitchen/reports',
        'reports': '/reports',
        'roles-permissions': '/roles-permissions',
        'users': '/users',
        'settings': '/settings',
        'qr-code-config': '/qr-code-config'
      };

      const allowedTab = tabsOrder.find(t => isTabAllowed(t));
      if (allowedTab && tabToPathMap[allowedTab]) {
        navigate(tabToPathMap[allowedTab], { replace: true });
      }
    }
  }, [role, activeRestaurant, currentPath, activeTab]);

  const pendingOrdersCount = orders.filter(o => o.status === 'new').length;

  return (
    <div id="dashboard-view" className="dashboard-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-header-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px 20px', gap: '2px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>Serviq</h2>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Standard Plan</span>
        </div>

        <ul className="sidebar-menu">
          {isTabAllowed('overview') && (
            <li className={`sidebar-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Dashboard
              </Link>
            </li>
          )}
          {isTabAllowed('orders') && (
            <li className={`sidebar-item ${activeTab === 'orders' ? 'active' : ''}`}>
              <Link to="/orders" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                Order Management
              </Link>
            </li>
          )}
          {isTabAllowed('menu') && (
            <li className={`sidebar-item ${activeTab === 'menu' ? 'active' : ''}`}>
              <Link to="/menu" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
                Menu Management
              </Link>
            </li>
          )}
          {isTabAllowed('tables') && (
            <li className={`sidebar-item ${activeTab === 'tables' ? 'active' : ''}`}>
              <Link to="/tables" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
                Table Management
              </Link>
            </li>
          )}
          {isTabAllowed('tables') && (
            <li className={`sidebar-item ${activeTab === 'qr-code-config' ? 'active' : ''}`}>
              <Link to="/qr-code-config" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01"/></svg>
                QR Code Management
              </Link>
            </li>
          )}
          {isTabAllowed('billing') && (
            <li className={`sidebar-item ${activeTab === 'billing' ? 'active' : ''}`}>
              <Link to="/billing" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                Billing
              </Link>
            </li>
          )}

          {/* Waiter Management Dropdown */}
          {(isTabAllowed('waiter-list') || isTabAllowed('waiter-reports')) && (
            <li className={`sidebar-group ${sidebarWaiterOpen ? 'open' : ''}`}>
              <div
                className="sidebar-item dropdown-trigger"
                onClick={() => { setSidebarWaiterOpen(!sidebarWaiterOpen); setSidebarKitchenOpen(false); setSidebarUsersOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={e => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Waiter Management
                  {sidebarWaiterOpen ? 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="18 15 12 9 6 15"/></svg> : 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"/></svg>
                  }
                </a>
              </div>
              {sidebarWaiterOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${activeTab === 'waiter-list' ? 'active' : ''}`}>
                    <Link to="/waiter/list" style={{ display: 'block', width: '100%', color: 'inherit' }}>Waiter List</Link>
                  </li>
                  <li className={`sidebar-item ${activeTab === 'waiter-reports' ? 'active' : ''}`}>
                    <Link to="/waiter/reports" style={{ display: 'block', width: '100%', color: 'inherit' }}>Waiter Report</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Kitchen Management Dropdown */}
          {(isTabAllowed('kitchen-list') || isTabAllowed('kitchen-reports')) && (
            <li className={`sidebar-group ${sidebarKitchenOpen ? 'open' : ''}`}>
              <div
                className="sidebar-item dropdown-trigger"
                onClick={() => { setSidebarKitchenOpen(!sidebarKitchenOpen); setSidebarWaiterOpen(false); setSidebarUsersOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={e => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <KitchenIcon size={18} color="currentColor" />
                  Kitchen Management
                  {sidebarKitchenOpen ? 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="18 15 12 9 6 15"/></svg> : 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"/></svg>
                  }
                </a>
              </div>
              {sidebarKitchenOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${activeTab === 'kitchen-list' ? 'active' : ''}`}>
                    <Link to="/kitchen/list" style={{ display: 'block', width: '100%', color: 'inherit' }}>Kitchen List</Link>
                  </li>
                  <li className={`sidebar-item ${activeTab === 'kitchen-reports' ? 'active' : ''}`}>
                    <Link to="/kitchen/reports" style={{ display: 'block', width: '100%', color: 'inherit' }}>Kitchen Report</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Business Reports Tab */}
          {isTabAllowed('reports') && (
            <li className={`sidebar-item ${activeTab === 'reports' ? 'active' : ''}`}>
              <Link to="/reports" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Reports
              </Link>
            </li>
          )}

          {/* Users Dropdown */}
          {isTabAllowed('settings') && (
            <li className={`sidebar-group ${sidebarUsersOpen ? 'open' : ''}`}>
              <div
                className="sidebar-item dropdown-trigger"
                onClick={() => { setSidebarUsersOpen(!sidebarUsersOpen); setSidebarWaiterOpen(false); setSidebarKitchenOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <a href="#" onClick={e => e.preventDefault()} className="dropdown-trigger-link" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Users
                  {sidebarUsersOpen ? 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="18 15 12 9 6 15"/></svg> : 
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}><polyline points="6 9 12 15 18 9"/></svg>
                  }
                </a>
              </div>
              {sidebarUsersOpen && (
                <ul className="sidebar-submenu">
                  <li className={`sidebar-item ${activeTab === 'roles-permissions' ? 'active' : ''}`}>
                    <Link to="/roles-permissions" style={{ display: 'block', width: '100%', color: 'inherit' }}>Roles & Permissions</Link>
                  </li>
                  <li className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}>
                    <Link to="/users" style={{ display: 'block', width: '100%', color: 'inherit' }}>User Lists</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Settings Tab */}
          {isTabAllowed('settings') && (
            <li className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}>
              <Link to="/settings" style={{ display: 'flex', alignItems: 'center', width: '100%', color: 'inherit' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                Settings
              </Link>
            </li>
          )}
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content" style={{ position: 'relative' }}>
        {/* Impersonation Banner */}
        {isImpersonating && (
          <div id="saas-impersonation-banner" style={{ display: 'flex', background: '#fff1f2', borderBottom: '1.5px solid #fca5a5', color: '#991b1b', padding: '12px 32px', fontSize: '13px', fontWeight: 600, alignItems: 'center', justifyContent: 'space-between', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Super Admin Impersonation Mode: Currently managing {name} (Simulated Session)</span>
            </div>
            <button className="btn" onClick={exitImpersonation} style={{ background: '#991b1b', color: 'white', padding: '4px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '4px', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}>
              Exit & Return to Super Admin
            </button>
          </div>
        )}

        {/* HEADER */}
        <header className="main-header">
          <div className="header-title-container">
            <h1 className="header-title">{tabTitles[activeTab] || activeTab}</h1>
            <span className="header-subtitle-date">{dateTimeStr}</span>
          </div>
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-notify" style={{ position: 'relative' }} onClick={() => alert('No new notifications.')}>
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
                {name.charAt(0).toUpperCase()}
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
                        {name.charAt(0).toUpperCase()}
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
                    
                    <div style={{ padding: '12px' }}>
                      {isTabAllowed('settings') && (
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
                          onClick={() => {
                            navigate('/settings');
                            setIsProfileMenuOpen(false);
                          }}
                        >
                          Settings
                        </button>
                      )}
                      
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
                          gap: '10px',
                          marginTop: '4px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#27272a'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        onClick={logout}
                      >
                        <span style={{ color: '#ef4444' }}>Log Out</span>
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
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="tables" element={<TableManagement />} />
            <Route path="qr-code-config" element={<QRCodeManagement />} />
            <Route path="billing" element={<Billing />} />
            <Route path="waiter/list" element={<WaiterManagement activeSubTab="waiter-list" />} />
            <Route path="waiter/reports" element={<WaiterManagement activeSubTab="waiter-reports" />} />
            <Route path="kitchen/list" element={<KitchenManagement activeSubTab="kitchen-list" />} />
            <Route path="kitchen/reports" element={<KitchenManagement activeSubTab="kitchen-reports" />} />
            <Route path="reports" element={<Reports />} />
            <Route path="roles-permissions" element={<Users activeSubTab="roles-permissions" />} />
            <Route path="users" element={<Users activeSubTab="users" />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
