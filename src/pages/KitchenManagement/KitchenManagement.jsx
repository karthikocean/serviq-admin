import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import KitchenListPanel from '../../components/KitchenListPanel';
import KitchenReportsPanel from '../../components/KitchenReportsPanel';
import { isBranchMatch } from '../../helper/BranchHelper';

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

  const isBranchFiltered = selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'All' && String(selectedBranchId).toUpperCase() !== 'COMPANY';
  const staff = isBranchFiltered ? rawStaff.filter(s => isBranchMatch(s, selectedBranchId, activeRestaurant?.branches || [])) : rawStaff;
  const orders = isBranchFiltered ? rawOrders.filter(o => isBranchMatch(o, selectedBranchId, activeRestaurant?.branches || [])) : rawOrders;
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
