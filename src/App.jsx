import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import BranchManagement from './pages/BranchManagement/BranchManagement';
import PlansManagement from './pages/PlansManagement/PlansManagement';
import TableManagement from './pages/TableManagement/TableManagement';
import TableFormPage from './pages/TableManagement/TableFormPage';
import MenuManagement from './pages/MenuManagement/MenuManagement';
import CategoryListPage from './pages/MenuManagement/CategoryListPage';
import InventoryManagement from './pages/InventoryManagement/InventoryManagement';
import InventoryCategoryListPage from './pages/InventoryManagement/InventoryCategoryListPage';
import StockReductionPage from './pages/InventoryManagement/StockReductionPage';
import OrderManagement from './pages/OrderManagement/OrderManagement';
import StaffManagement from './pages/StaffManagement/StaffManagement';
import StaffFormPage from './pages/WaiterManagement/StaffFormPage';
import KitchenSettingsPage from './pages/KitchenManagement/KitchenSettingsPage';
import Users from './pages/Users/Users';
import RolesPermissions from './pages/RolesPermissions/RolesPermissions';
import Billing from './pages/Billing/Billing';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

      {/* Protected Admin / Management App Layout */}
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="overview" element={<Navigate to="/dashboard" replace />} />
        
        {/* Branch Management */}
        <Route path="branch-management" element={<BranchManagement />} />
        <Route path="branches" element={<Navigate to="/branch-management" replace />} />

        {/* Plans Management */}
        <Route path="plans-management" element={<PlansManagement />} />
        <Route path="plans" element={<Navigate to="/plans-management" replace />} />

        {/* Table Management & Forms */}
        <Route path="tables" element={<TableManagement />} />
        <Route path="tables/add" element={<TableFormPage />} />
        <Route path="tables/edit/:tableId" element={<TableFormPage />} />

        {/* Menu Management & Categories */}
        <Route path="menu" element={<MenuManagement />} />
        <Route path="menu/categories" element={<CategoryListPage />} />

        {/* Inventory Management, Categories & Stock Reduction */}
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="inventory/items" element={<InventoryManagement />} />
        <Route path="inventory/categories" element={<InventoryCategoryListPage />} />
        <Route path="inventory/stock-reduction" element={<StockReductionPage />} />

        {/* Order Management */}
        <Route path="orders" element={<OrderManagement />} />

        {/* Staff Management (Combined Waiter List & Kitchen List) */}
        <Route path="staff" element={<StaffManagement />} />
        <Route path="staff/add" element={<StaffFormPage />} />
        <Route path="staff/edit/:staffId" element={<StaffFormPage />} />
        <Route path="staff/kitchen-settings" element={<KitchenSettingsPage />} />

        {/* Backward Compatibility Redirects for Waiter and Kitchen */}
        <Route path="waiter" element={<Navigate to="/staff" replace />} />
        <Route path="waiter/list" element={<Navigate to="/staff" replace />} />
        <Route path="waiter/reports" element={<Navigate to="/reports?tab=waiter" replace />} />
        <Route path="waiter/add" element={<StaffFormPage />} />
        <Route path="waiter/edit/:staffId" element={<StaffFormPage />} />

        <Route path="kitchen" element={<Navigate to="/staff" replace />} />
        <Route path="kitchen/list" element={<Navigate to="/staff" replace />} />
        <Route path="kitchen/reports" element={<Navigate to="/reports?tab=kitchen" replace />} />
        <Route path="kitchen/settings" element={<KitchenSettingsPage />} />

        {/* User Management & Roles */}
        <Route path="users" element={<Users />} />
        <Route path="roles-permissions" element={<RolesPermissions />} />

        {/* Billing */}
        <Route path="billing" element={<Billing />} />

        {/* Reports & Analytics (Unified Reports including Waiter & Kitchen reports) */}
        <Route path="reports" element={<Reports />} />

        {/* Restaurant Settings */}
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </div>
  );
}
