import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import KitchenListPanel from '../../components/KitchenListPanel';
import KitchenReportsPanel from '../../components/KitchenReportsPanel';

export default function KitchenManagement({ isReports = false }) {
  const {
    activeRestaurant,
    updateOrderItemStatus,
    updateStaff,
    deleteStaff,
    selectedBranchId
  } = useAppState();

  const location = useLocation();
  const navigate = useNavigate();

  if (!activeRestaurant) return null;

  const rawStaff = activeRestaurant.staff || [];
  const rawOrders = activeRestaurant.orders || [];
  const rawMenu = activeRestaurant.menu || [];

  const staff = selectedBranchId ? rawStaff.filter(s => s.branchId === selectedBranchId) : rawStaff;
  const orders = selectedBranchId ? rawOrders.filter(o => o.branchId === selectedBranchId) : rawOrders;
  const menu = rawMenu;

  const showReports = isReports || location.pathname.includes('/reports');

  return (
    <>
      {showReports ? (
        <KitchenReportsPanel
          orders={orders}
          staff={staff}
          menu={menu}
        />
      ) : (
        <KitchenListPanel
          staff={staff}
          activeRestaurant={activeRestaurant}
          updateStaff={updateStaff}
          deleteStaff={deleteStaff}
          openAddStaffModal={() => navigate('/waiter/add')}
          openEditStaffModal={(staffMember) => navigate(`/waiter/edit/${staffMember.id}`)}
        />
      )}
    </>
  );
}
