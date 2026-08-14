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
import OrderManagement from './pages/OrderManagement/OrderManagement';
import WaiterManagement from './pages/WaiterManagement/WaiterManagement';
import StaffFormPage from './pages/WaiterManagement/StaffFormPage';
import KitchenManagement from './pages/KitchenManagement/KitchenManagement';
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

        {/* Order Management */}
        <Route path="orders" element={<OrderManagement />} />

        {/* Waiter Management & Staff Forms */}
        <Route path="waiter" element={<Navigate to="/waiter/list" replace />} />
        <Route path="waiter/list" element={<WaiterManagement isReports={false} />} />
        <Route path="waiter/reports" element={<WaiterManagement isReports={true} />} />
        <Route path="waiter/add" element={<StaffFormPage />} />
        <Route path="waiter/edit/:staffId" element={<StaffFormPage />} />

        {/* Kitchen Management & Settings */}
        <Route path="kitchen" element={<Navigate to="/kitchen/list" replace />} />
        <Route path="kitchen/list" element={<KitchenManagement isReports={false} />} />
        <Route path="kitchen/reports" element={<KitchenManagement isReports={true} />} />
        <Route path="kitchen/settings" element={<KitchenSettingsPage />} />

        {/* User Management & Roles */}
        <Route path="users" element={<Users />} />
        <Route path="roles-permissions" element={<RolesPermissions />} />

        {/* Billing & Settlement */}
        <Route path="billing" element={<Billing />} />

        {/* Reports & Analytics */}
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
